const {Binance} = require('./classes/platforms/data/binance')
const {Coinbase} = require('./classes/platforms/data/coinbase')
const {Bitpanda} = require('./classes/platforms/data/bitpanda')

// Binance

const getBinanceTransactionsForLast90Days = async () => {
    let binance = new Binance();
    return {
        purchase: await binance.getPurchaseListForLast90Days(),
        sale: await binance.getSaleListForLast90Days(),
        withdraw: await binance.getWithdrawListForLast90Days(),
        swap: await binance.getConvertListForLast90Days(),
    }

}

const getBinanceTransactionsFrom2010 = async () => {
    let binance = new Binance();
    return {
        //withdraw: await binance.getWithdrawListFrom2010(),
        //purchase: await binance.getPurchaseListFrom2010(),
        //sale: await binance.getSaleListFrom2010(),
        swap: await binance.getConvertListFrom2010()
    }
}

const getBinanceTransactions = async (type) => {
    let binance = new Binance();
    if (binance.isReady()) {
        return {
            withdraw: type ? {} : await binance.getWithdrawListFromHistory(true),
            purchase: (!type || type === "purchase") ? await binance.getPurchaseListFromHistory(true) : {},
            sale: (!type || type === "sale") ? await binance.getSaleListFromHistory(true) : {},
            swap: type ? {} : await binance.getConvertListFromHistory(true)
        }
    } else {
        return {withdraw: {}, purchase: {}, sale: {}, swap: {}};
    }
}

const getMyTrades = async (pair, buy) => {
    let binance = new Binance();
    if (binance.isReady()) {
        return binance.getMyTrades(pair, buy);
    } else {
        return {
            buy: buy,
            usdtFiatValue: 0.0,
            bnbFiatValue: 0.0,
            trades: []
        }
    }
}

const getMyPurchases = async () => {
    let binance = new Binance();
    if (binance.isReady()) {
        let result = await getBinanceTransactions("purchase");
        return await binance.getMyPurchases(result);
    } else {
        return {"purchases": []}
    }
}

const getMySales = async () => {
    let binance = new Binance();
    if (binance.isReady()) {
        let result = await getBinanceTransactions("sale");
        return await binance.getMySales(result);
    } else {
        return {"sales": []}
    }
}

// Coinbase

const getCoinbaseAccounts = async () => {
    return new Coinbase().getAccountsList();
}

const getCoinbaseTransactions = async () => {
    return new Coinbase().getTransactionsList(true);
}

const getCoinbaseAddresses = async () => {
    return new Coinbase().getAddressList();
}

// Bitpanda

const getBitpandaTransactions = async () => {
    return new Bitpanda().getTransactionsList();
}

exports.getBinanceTransactionsForLast90Days = getBinanceTransactionsForLast90Days
exports.getBinanceTransactionsFrom2010 = getBinanceTransactionsFrom2010
exports.getBinanceTransactions = getBinanceTransactions
exports.getMyTrades = getMyTrades
exports.getMyPurchases = getMyPurchases
exports.getMySales = getMySales
exports.getCoinbaseAccounts = getCoinbaseAccounts
exports.getCoinbaseTransactions = getCoinbaseTransactions
exports.getCoinbaseAddresses = getCoinbaseAddresses
exports.getBitpandaTransactions = getBitpandaTransactions