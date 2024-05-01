const config = require('config')
const utils = require('../utils')

class Stock {
    tokens;

    constructor() {
        this.tokens = [];
    }

    addOrUpdateSimple = (data) => {
        let foundIndex = this.tokens.findIndex(x => x.token === data.token && x.wallet === data.wallet);
        if (foundIndex >= 0) {
            this.tokens[foundIndex].nb = +(((this.tokens[foundIndex].nb + data.nb) * 100000000) / 100000000).toFixed(8);
        } else {
            this.tokens.push({
                "token": data.token,
                "wallet": data.wallet,
                "nb": +((data.nb * 100000000) / 100000000).toFixed(8)
            });
        }
    }
    addOrUpdateDouble = (data) => {
        this.addOrUpdateSimple(data[0]);
        this.addOrUpdateSimple(data[1]);
    }

    getTokens = () => {
        return this.tokens;
    }

    setTokens = (tokens) => {
        this.tokens = tokens;
    }
}


class TokenAmount {
    purchaseDate;
    purchasePrice;
    number;
    currency;

    constructor(date, price, nb, currency) {
        this.purchaseDate = date;
        this.purchasePrice = price;
        this.number = nb;
        this.currency = currency;
    }
}

class Token {
    symbol;
    tokensAmount;

    constructor(symbol) {
        this.symbol = symbol;
        // TokenAmount objects array.
        this.tokensAmount = [];
    }

    findTokenAmountFromDate = (opDate) => {
        for (let i = 0; i < this.tokensAmount.length; i++) {
            if (opDate.getTime() === this.tokensAmount[i].purchaseDate.getTime()) {
                return this.tokensAmount[i];
            }
        }
        return null;
    }
    findTokenAmountFromPrice = (price) => {
        for (let i = 0; i < this.tokensAmount.length; i++) {
            if (price === this.tokensAmount[i].purchasePrice) {
                return this.tokensAmount[i];
            }
        }
        return null;
    }
    getTokenAmountsSortedByDate = () => {
        return this.tokensAmount.sort(utils.dateSorter);
    }
}

class WalletToken {
    wallet;
    tokens;

    constructor(wallet) {
        this.wallet = wallet;
        // Token objects array.
        this.tokens = [];
    }
}

class Wallet {
    walletsTokens;

    constructor() {
        // WalletToken object array.
        this.walletsTokens = [];
    }

    getTokensOfWallet = async (wallet) => {
        for (let i = 0; i < this.walletsTokens.length; i++) {
            if (this.walletsTokens[i].wallet === wallet) {
                return this.walletsTokens[i];
            }
        }
        let walletToken = new WalletToken(wallet);
        this.walletsTokens.push(walletToken);
        return walletToken;
    }

    getTokenOfWallet = async (wallet, symbol) => {
        let walletToken = await this.getTokensOfWallet(wallet);
        if (walletToken.tokens.length > 0) {
            for (let i = 0; i < walletToken.tokens.length; i++) {
                if (walletToken.tokens[i].symbol === symbol) {
                    return walletToken.tokens[i];
                }
            }
        }
        let token = new Token(symbol);
        walletToken.tokens.push(token);
        return token;
    }

    buyToken = async (wallet, symbol, tokensNb, opDate, price) => {
        let token = await this.getTokenOfWallet(wallet, symbol);
        token.tokensAmount.push(new TokenAmount(opDate, price, tokensNb, config.get('fiat_currency')));
    }

    addOrUpdateToken = async (wallet, symbol, tokensNb, opDate, price, currency) => {
        let token = await this.getTokenOfWallet(wallet, symbol);
        let tokenAmount = token.findTokenAmountFromPrice(price);
        if (tokenAmount != null) {
            tokenAmount.number += tokensNb;
        } else {
            token.tokensAmount.push(new TokenAmount(opDate, price, tokensNb, currency));
        }
    }

    saleToken = async (wallet, symbol, tokensNb) => {
        let token = await this.getTokenOfWallet(wallet, symbol);
        let tokensAmount = token.getTokenAmountsSortedByDate();
        for (let i = 0; i < tokensAmount.length; i++) {
            let tokenAmount = tokensAmount[i];
            if (tokenAmount.number > tokensNb) {
                tokenAmount.number -= tokensNb;
                break;
            } else {
                tokensNb -= tokenAmount.number;
                tokenAmount.number = 0;
            }
        }
    }

    swapToken = async (wallet, outputSymbol, inputSymbol, outputTokens,
                       inputTokens, inputPrice, swapDate, fee,
                       feeCurrency, currency) => {
        await this.saleToken(wallet, outputSymbol, outputTokens);
        await this.addOrUpdateToken(wallet, inputSymbol, inputTokens, swapDate, inputPrice, currency);
        if (fee > 0 && feeCurrency !== config.get('fiat_currency').toUpperCase() && feeCurrency !== outputSymbol) {
            await this.saleToken(wallet, feeCurrency, fee); // Simulate sale to substract fee
        }
    }

    sendToken = async (symbol, sendWallet, receiveWallet, sendTokens,
                       receiveTokens, opDate, fee, feeCurrency) => {
        // Find source tokens from sendWallet;
        let token = await this.getTokenOfWallet(sendWallet, symbol);
        let tokensAmount = token.getTokenAmountsSortedByDate();
        let pricesForReceive = [];
        for (let i = 0; i < tokensAmount.length; i++) {
            let tokenAmount = tokensAmount[i];
            if (tokenAmount.number >= sendTokens) {
                tokenAmount.number -= sendTokens;
                pricesForReceive.push({"price": tokenAmount.purchasePrice, "nb": sendTokens})
                break;
            } else {
                sendTokens -= tokenAmount.number;
                pricesForReceive.push({"price": tokenAmount.purchasePrice, "nb": tokenAmount.number})
                tokenAmount.number = 0;
            }
        }
        // Handle receive part.
        for (let i = 0; i < pricesForReceive.length; i++) {
            let priceForReceive = pricesForReceive[i];
            if (priceForReceive.nb >= receiveTokens) {
                await this.addOrUpdateToken(receiveWallet, symbol, receiveTokens, opDate, priceForReceive.price, '');
                break;
            } else {
                await this.addOrUpdateToken(receiveWallet, symbol, priceForReceive.nb, opDate, priceForReceive.price, '');
                receiveTokens -= priceForReceive.nb;
            }
        }
        if (fee > 0 && feeCurrency !== config.get('fiat_currency').toUpperCase() && feeCurrency !== symbol) {
            await this.saleToken(sendWallet, feeCurrency, fee); // Simulate sale to substract fee
        }
    }

}

module.exports = {
    Stock,
    WalletToken,
    Token,
    Wallet,
    TokenAmount
}


