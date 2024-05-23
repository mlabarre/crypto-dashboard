const config = require('config');
const MongoHelper = require('./classes/mongo-helper');
const utils = require('../scripts/utils')
const {Stock} = require('./classes/portfolio')
const evolution = require('./evolution')

const handleSummaryPurchaseTransaction = async (tr) => {
    return {"token": tr.symbol, "wallet": tr.wallet, "nb": tr.tokens}
}

const handleSummarySaleTransaction = async (tr) => {
    return {"token": tr.symbol, "wallet": tr.wallet, "nb": tr.tokens * -1}
}

const handleSummarySwapTransaction = async (tr, fees) => {
    if (tr.fee > 0 && tr.feeCurrency !== config.get('fiat_currency').toUpperCase() &&
        tr.feeCurrency !== tr.outputSymbol) {
        fees.push({symbol: tr.feeCurrency, nb: tr.fee, wallet: tr.wallet});
    }
    return [{"token": tr.outputSymbol, "wallet": tr.wallet, "nb": tr.outputTokens * -1},
        {"token": tr.inputSymbol, "wallet": tr.wallet, "nb": tr.inputTokens}]
}

const handleSummarySendTransaction = async (tr, fees) => {
    if (tr.fee > 0 && tr.feeCurrency !== config.get('fiat_currency').toUpperCase() &&
        tr.feeCurrency !== tr.symbol) {
        fees.push({symbol: tr.feeCurrency, nb: tr.fee, wallet: tr.sendWallet});
    }
    return [{"token": tr.symbol, "wallet": tr.sendWallet, "nb": tr.sendTokens * -1},
        {"token": tr.symbol, "wallet": tr.receiveWallet, "nb": tr.receiveTokens}]
}

const handleSummaryTransaction = async (transaction, stock, fees) => {
    if (transaction.type === "purchase") {
        let result = await handleSummaryPurchaseTransaction(transaction);
        stock.addOrUpdateSimple(result);
    } else if (transaction.type === "sale") {
        let result = await handleSummarySaleTransaction(transaction);
        stock.addOrUpdateSimple(result);
    } else if (transaction.type === "swap") {
        let result = await handleSummarySwapTransaction(transaction, fees);
        stock.addOrUpdateDouble(result);
    } else if (transaction.type === "send") {
        let result = await handleSummarySendTransaction(transaction, fees);
        stock.addOrUpdateDouble(result);
    }
}

const removeAllWithZeroTokens = async (stock) => {
    let tokens = stock.getTokens();
    let cleanTokens = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].nb !== 0) {
            cleanTokens.push(tokens[i]);
        }
    }
    stock.setTokens(cleanTokens.sort(utils.fieldSorter(["wallet", "token"])));
    return stock;
}

const getCryptoInfo = (symbol, cryptos) => {
    let res = findCrypto(symbol, cryptos);
    if (res != null) {
        return [res.quotation, res.id, (res.info === undefined) ? "" : res.info.image];
    } else {
        return [0.00, "", ""];
    }
}

const valorize = (tokens, myCryptos) => {
    for (let i = 0; i < tokens.length; i++) {
        let quotation, id, image;
        [quotation, id, image] = getCryptoInfo(tokens[i].token, myCryptos);
        tokens[i].value = (tokens[i].nb * quotation);
        tokens[i].image = image;
        tokens[i].id = id;
    }
    return tokens;
}

const findTokenInValuesPerToken = (tokensValue, token) => {
    let foundIndex = tokensValue.findIndex(x => x.token === token);
    if (foundIndex >= 0) {
        return tokensValue[foundIndex]
    } else {
        return null;
    }
}

const buildValuePerToken = (tokens) => {
    let tokensValue = [];
    let total = 0.00;
    for (let i = 0; i < tokens.length; i++) {
        let t = findTokenInValuesPerToken(tokensValue, tokens[i].token);
        if (t != null) {
            t.value += parseFloat(tokens[i].value);
            total += isNaN(tokens[i].value) ? 0 : parseFloat(tokens[i].value);
            t.nb += parseFloat(tokens[i].nb.toFixed(4));
            if (t.wallets.indexOf(tokens[i].wallet) < 0) {
                t.wallets += "," + tokens[i].wallet;
            }
        } else {
            tokensValue.push(
                {
                    token: tokens[i].token,
                    nb: parseFloat(tokens[i].nb.toFixed(4)),
                    value: parseFloat(tokens[i].value),
                    wallets: tokens[i].wallet
                });
            total += isNaN(tokens[i].value) ? 0 : parseFloat(tokens[i].value);
        }
    }
    return {
        tokensValue: tokensValue,
        total: total
    };
}

const handleFees = (stock, fees) => {
    let tokens = stock.getTokens();
    for (let i = 0; i < fees.length; i++) {
        let index = tokens.findIndex(x => x.token === fees[i].symbol && x.wallet === fees[i].wallet);
        if (index >= 0) {
            tokens[index].nb -= fees[i].nb;
        }
    }
    return stock;
}

const setTotalPerWallet = (tokens) => {
    let tokensWithTotal = [];
    let totalWallet = 0.00;
    if (tokens.length > 0) {
        let previousWallet = tokens[0].wallet;
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            if (token.wallet !== previousWallet) {
                tokensWithTotal.push({wallet: "", token: "", nb: "", value: totalWallet});
                totalWallet = 0.00;
                previousWallet = token.wallet;
            }
            if (!isNaN(token.value)) {
                totalWallet += parseFloat(token.value);
            }
            tokensWithTotal.push(token);
        }
        tokensWithTotal.push({wallet: "", token: "", nb: "", value: totalWallet});
    }
    return tokensWithTotal;
}

const findCrypto = (symbol, myCryptos) => {
    for (let i = 0; i < myCryptos.length; i++) {
        if (myCryptos[i].symbol.toUpperCase() === symbol.toUpperCase()) {
            return myCryptos[i];
        }
    }
    return null;
}

const getTokenFromObjectList = (list) => {
    let symbols = [];
    for (let item in list) {
        symbols.push(list[item].symbol.toUpperCase());
    }
    return symbols;
}

const removeValueForIco = (symbolsInMyCryptos, list) => {
    for (let item in list) {
        if (list[item].token !== '' && isNaN(list[item].value)) {
            list[item].value = "N/A";
        }
    }
    return list;
}

const getInvestIndexInArray = (arr, symbol) => {
    return arr.findIndex(crypto => crypto.token === symbol);
}

const buildInvestPerToken = (evolutionTokens, perToken) => {
    for (let i = 0; i < evolutionTokens.length; i++) {
        let tokenIndex = getInvestIndexInArray(perToken, evolutionTokens[i].symbol);
        let token = perToken[tokenIndex];
        if (token.hasOwnProperty("invest")) {
            token.invest += evolutionTokens[i].start_price * evolutionTokens[i].tokens;
        } else {
            token.invest = evolutionTokens[i].start_price * evolutionTokens[i].tokens;
        }
    }
}

const computeRoi = (perToken) => {
    for (let i = 0; i < perToken.length; i++) {
        perToken[i].roi = perToken[i].value - perToken[i].invest;
    }
}

const portfolio = async () => {
    let stock = new Stock();
    let fees = [];
    let transactions = await new MongoHelper().findAllTransactions();
    let myCryptos = await new MongoHelper().findAllMyCryptos(true);
    for (let i = 0; i < transactions.length; i++) {
        await handleSummaryTransaction(transactions[i], stock, fees);
    }
    stock = await removeAllWithZeroTokens(stock);
    stock = handleFees(stock, fees);
    valorize(stock.tokens, myCryptos);
    let result = buildValuePerToken(stock.getTokens());
    let symbols = getTokenFromObjectList(await new MongoHelper().findAllSymbolsInMyCryptos(true));
    let perToken = removeValueForIco(symbols, valorize(result.tokensValue, myCryptos).sort(utils.fieldSorter(["token"])));
    let evolutionResult = await evolution.evolution();
    buildInvestPerToken(evolutionResult.result.tokens, perToken);
    computeRoi(perToken)
    return {
        total: result.total,
        perWallet: removeValueForIco(symbols, setTotalPerWallet(stock.getTokens())),
        perToken: perToken
    };
}

exports.portfolio = portfolio

