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

const getBinanceTransactions = async () => {
    let binance = new Binance();
    return {
        withdraw: await binance.getWithdrawListFromHistory(true),
        purchase: await binance.getPurchaseListFromHistory(true),
        sale: await binance.getSaleListFromHistory(true),
        swap: await binance.getConvertListFromHistory(true)
    }
}

const getMyTrades = async (pair, buy) => {
    return new Binance().getMyTrades(pair, buy);
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
exports.getCoinbaseAccounts = getCoinbaseAccounts
exports.getCoinbaseTransactions = getCoinbaseTransactions
exports.getCoinbaseAddresses = getCoinbaseAddresses
exports.getBitpandaTransactions = getBitpandaTransactions