const MongoHelper = require('./mongo-helper');
const utils = require('../scripts/utils')
const {Wallet} = require('./classes/portfolio')

let handleEvolutionTransaction = async (wallet, tr) => {
    if (tr.type === "purchase") {
        return await wallet.buyToken(tr.wallet, tr.symbol, tr.tokens, tr.date, tr.quotation);
    } else if (tr.type === "sale") {
        return await wallet.saleToken(tr.wallet, tr.symbol, tr.tokens);
    } else if (tr.type === "swap") {
        return await wallet.swapToken(tr.wallet, tr.outputSymbol, tr.inputSymbol, tr.outputTokens,
            tr.inputTokens, tr.inputTokenQuotation, tr.date, tr.fee, tr.feeCurrency, tr.inputTokenQuotationCurrency);
    } else if (tr.type === "send") {
        return await wallet.sendToken(tr.symbol, tr.sendWallet, tr.receiveWallet, tr.sendTokens,
            tr.receiveTokens, tr.date, tr.fee, tr.feeCurrency);
    }
}

let buildEvolution = (walletsTokens) => {
    let records = [];
    for (let i = 0; i < walletsTokens.length; i++) {
        let walletTokens = walletsTokens[i];
        for (let j = 0; j < walletTokens.tokens.length; j++) {
            let token = walletTokens.tokens[j];
            for (let k = 0; k < token.tokensAmount.length; k++) {
                let tokenAmount = token.tokensAmount[k];
                let record = {
                    "wallet": walletTokens.wallet,
                    "symbol": token.symbol,
                    "start_price": tokenAmount.purchasePrice,
                    "tokens": parseFloat(tokenAmount.number).toFixed(4),
                    "currency": tokenAmount.currency
                }
                if (tokenAmount.number !== 0 && parseFloat(tokenAmount.number.toFixed(6)) > 0) {
                    records.push(record);
                }
            }
        }
    }
    return records;
}

let findCrypto = (symbol, myCryptos) => {
    for (let i = 0; i < myCryptos.length; i++) {
        if (myCryptos[i].symbol.toUpperCase() === symbol.toUpperCase()) {
            return myCryptos[i];
        }
    }
    return null;
}

let updateWithCurrentValues = async (allTokens, sortField, sortDirection) => {
    let myCryptos = await new MongoHelper().findAllMyCryptos();
    let total_start = 0.00;
    let total_current = 0.00;
    let usdt = await new MongoHelper().getUSDTValueInFiat();
    console.log("Use USDT value ", usdt.value)
    for (let i = 0; i < allTokens.length; i++) {
        let token = allTokens[i];
        // token already contains wallet, symbol, start_price and tokens (nb)
        let values = findCrypto(token.symbol, myCryptos);
        if (values != null) {
            token.id = values.id;
            token.name = values.name;
            token.quotation = values.quotation;
            token.quotation_usdt = values.quotation_usdt;
            token.value = values.quotation * token.tokens;
            token.start_price_usdt = token.start_price / usdt.value;
            token.quotation_date = values.quotation_date;
            token.last_five_minutes_quotation_date = values.last_five_minutes_quotation_date;
            token.last_five_minutes_quotation = values.last_five_minutes_quotation;
            token.last_one_hour_quotation_date = values.last_one_hour_quotation_date;
            token.last_one_hour_quotation = values.last_one_hour_quotation;
            token.last_day_quotation_date = values.last_day_quotation_date;
            token.last_day_quotation = values.last_day_quotation;
            // variations
            token.variation = (values.quotation - token.start_price) * 100 / token.start_price;
            token.variation_on_five_minutes = (values.quotation -
                values.last_five_minutes_quotation) * 100 / values.last_five_minutes_quotation
            token.variation_on_one_hour = (values.quotation -
                values.last_one_hour_quotation) * 100 / values.last_one_hour_quotation
            token.variation_on_one_day = (values.quotation -
                values.last_day_quotation) * 100 / values.last_day_quotation
            token.variation_on_one_week = (values.quotation -
                values.last_week_quotation) * 100 / values.last_week_quotation
            total_start += token.start_price * token.tokens;
            total_current += token.quotation * token.tokens;
        } else {
            token.id = "N/A";
        }
    }
    let sortParam = sortDirection === "D" ? "-" + sortField : sortField;
    return {
        result: {
            balance: {
                amount: total_current,
                variation: (total_current - total_start) * 100 / total_start
            },
            tokens: allTokens.sort(utils.fieldSorter([sortParam]))
        }
    };
}

evolution = async (sortField = "symbol", sortDirection = "A") => {
    let wallet = new Wallet();
    let transactions = await new MongoHelper().findAllTransactions();
    for (let i = 0; i < transactions.length; i++) {
        await handleEvolutionTransaction(wallet, transactions[i]);
    }
    let allTokens = buildEvolution(wallet.walletsTokens);
    let alerts = await new MongoHelper().getAlerts();
    console.log(alerts)
    let balanceTokensResult = await updateWithCurrentValues(allTokens, sortField, sortDirection);
    balanceTokensResult.result.alerts = alerts;
    return balanceTokensResult;
}

addAlert = async (data) => {
    return await new MongoHelper().addAlert(data);
}

removeAlert = async (data) => {
    return await new MongoHelper().delAlert(data)
}

exports.evolution = evolution
exports.addAlert = addAlert
exports.removeAlert = removeAlert
