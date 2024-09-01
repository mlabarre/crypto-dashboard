/*
 * Binance API access
 */
const tools = require('../common');
const MongoHelper = require('../../mongo-helper');
const config = require('config');
const crypto = require('node:crypto');
const axios = require('axios');
const utils = require('../../../utils')

class Binance {

    config;

    IS_PURCHASE = "purchase";
    IS_SALE = "sale";
    IS_WITHDRAW = "withdraw";
    IS_SWAP = "swap";
    IS_CONVERT = "convert";

    constructor() {
        this.config = config.get('platforms_api.binance');
    }

    isReady = () => {
        return utils.varIsValid(this.config.get('secret_key')) && utils.varIsValid(this.config.get('api_key'));
    }
    getSignature = (data) => {
        const hmac = crypto.createHmac('sha256', this.config.get('secret_key'));
        hmac.update(data);
        return hmac.digest('hex');
    }

    buildQueryString = () => {
        return `timestamp=${tools.getCurrentTimestamp()}`
    }

    buildQueryStringForPurchase = () => {
        return `${this.buildQueryString()}&transactionType=0`
    }

    buildQueryStringForSale = () => {
        return `${this.buildQueryString()}&transactionType=1`
    }

    buildQueryStringWithRange = (timestamp, start, end) => {
        let queryString = `timestamp=${tools.getCurrentTimestamp()}&startTime=${start}`;
        if (end !== undefined) {
            queryString += `&endTime=${end}`;
        }
        return queryString;
    }

    buildQueryStringWithRangeForPayments = (timestamp, start, end) => {
        let queryString = `timestamp=${tools.getCurrentTimestamp()}&beginTime=${start}`;
        if (end !== undefined) {
            queryString += `&endTime=${end}`;
        }
        return queryString;
    }

    buildQueryStringTradesHisto = (pair) => {
        return `timestamp=${tools.getCurrentTimestamp()}&symbol=${pair}`;
    }

    buildQueryStringWithRangeForPurchase = (timestamp, start, end) => {
        return `${this.buildQueryStringWithRangeForPayments(timestamp, start, end)}&transactionType=0`;
    }

    buildQueryStringWithRangeForSale = (timestamp, start, end) => {
        return `${this.buildQueryStringWithRangeForPayments(timestamp, start, end)}&transactionType=1`;
    }

    buildWithdrawUrl = (queryString, signature) => {
        return `${this.config.get('withdraw_list_url')}?${queryString}&signature=${signature}`;
    }

    buildPurchaseUrl = (queryString, signature) => {
        return `${this.config.get('payments_list_url')}?${queryString}&signature=${signature}`;
    }

    buildSaleUrl = (queryString, signature) => {
        return `${this.config.get('payments_list_url')}?${queryString}&signature=${signature}`;
    }

    buildSwapUrl = (queryString, signature) => {
        return `${this.config.get('dribblet_url')}?${queryString}&signature=${signature}`;
    }

    buildConvertUrl = (queryString, signature) => {
        return `${this.config.get('convert_url')}?${queryString}&signature=${signature}`;
    }

    buildTradesHistoUrl = (queryString, signature) => {
        return `${this.config.get('trades_histo_url')}?${queryString}&signature=${signature}`;
    }

    get = async (url) => {
        try {
            console.log("GET", url);
            let response = await axios.get(url,
                {
                    headers: {
                        "X-MBX-APIKEY": this.config.get('api_key')
                    }
                });
            return {
                error: false,
                data: await response.data
            };
        } catch (error) {
            return {
                error: true,
                data: `Fetch failed for URL ${url}. ${JSON.stringify(error)}`
            }
        }
    }

    getDataFromRange = async (startTimestamp, buildQueryFunction, buildUrl, days) => {
        let done = false;
        let interval = days === undefined ? 90 : days;
        let currentTimestamp = tools.getCurrentTimestamp();
        let endTimestamp = tools.getTimestampPast(startTimestamp, interval);
        if (endTimestamp >= currentTimestamp) {
            done = true;
            endTimestamp = currentTimestamp;
        }
        let queryString = buildQueryFunction(currentTimestamp, startTimestamp, endTimestamp);
        let signature = this.getSignature(queryString);
        let url = buildUrl(queryString, signature);
        return {
            done: done,
            response: await this.get(url),
            endTimestamp: endTimestamp
        };
    }

    send90DaysRequest = async (buildQueryFunction, buildUrlFunction) => {
        let queryString = buildQueryFunction();
        let signature = this.getSignature(queryString);
        let url = buildUrlFunction(queryString, signature)
        return await this.get(url);
    }

    saveInHistory = async (saveHistory, type) => {
        if (saveHistory) {
            await new MongoHelper().addOrUpdateBinancePlatformsHistory(type, Date.now())
        }
    }

    getStartFromHistory = async (type) => {
        let history = await new MongoHelper().findBinancePlatformsHistory();
        if (history !== null && history.timestamps.hasOwnProperty(type)) {
            return history.timestamps[type];
        }
        return tools.getTimestampFromDateString("2010-01-01");
    }

    sendFromStartDateRequest = async (startTimestamp, buildQueryFunction, buildUrlFunction, type, saveHistory) => {
        let result = [];
        let done = false;
        while (done === false) {
            let res = await this.getDataFromRange(startTimestamp, buildQueryFunction,
                buildUrlFunction, type === this.IS_CONVERT ? 30 : 90)
            done = res.done;
            if (res.response.error === true) {
                return res.response;
            }
            if (type === this.IS_WITHDRAW && res.response.data.length > 0) {
                result = result.concat(res.response.data);
            } else if (type === this.IS_SWAP) {
                result = result.concat(res.response.list)
            } else {
                if (res.response.data.success === true && res.response.data.total > 0) {
                    result = result.concat(res.response.data.data);
                }
            }
            startTimestamp = res.endTimestamp;
        }
        await this.saveInHistory(saveHistory, type);
        return {
            error: false,
            data: result
        }
    }
    /*
     * Transactions until 90 days.
     */

    getWithdrawListForLast90Days = async () => {
        return await this.send90DaysRequest(this.buildQueryString, this.buildWithdrawUrl);
    }

    getPurchaseListForLast90Days = async () => {
        return await this.send90DaysRequest(this.buildQueryStringForPurchase, this.buildPurchaseUrl);
    }

    getSaleListForLast90Days = async () => {
        return await this.send90DaysRequest(this.buildQueryStringForSale, this.buildSaleUrl);
    }

    getSwapListForLast90Days = async () => {
        return await this.send90DaysRequest(this.buildQueryString, this.buildSwapUrl);
    }

    getConvertListForLast90Days = async () => {
        return await this.send90DaysRequest(this.buildQueryString, this.buildConvertUrl);
    }

    /*
     * Transactions since 2010 by 90 days steps.
     */

    getWithdrawListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRange,
            this.buildWithdrawUrl, this.IS_WITHDRAW, false);
    }

    getPurchaseListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRangeForPurchase,
            this.buildPurchaseUrl, this.IS_PURCHASE, false);
    }

    getSaleListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRangeForSale,
            this.buildSaleUrl, this.IS_SALE, false);
    }

    getSwapListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRange,
            this.buildSwapUrl, this.IS_SWAP, false);
    }

    getConvertListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2024-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRange,
            this.buildConvertUrl, this.IS_CONVERT, false);
    }

    /*
     * Transactions since last history date. To use with bot.
     */

    getWithdrawListFromHistory = async (saveHistory) => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(this.IS_WITHDRAW), this.buildQueryStringWithRange,
            this.buildWithdrawUrl, this.IS_WITHDRAW, saveHistory);
    }

    getPurchaseListFromHistory = async (saveHistory) => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(this.IS_PURCHASE), this.buildQueryStringWithRangeForPurchase,
            this.buildPurchaseUrl, this.IS_PURCHASE, saveHistory);
    }

    getSaleListFromHistory = async (saveHistory) => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(this.IS_SALE), this.buildQueryStringWithRangeForSale,
            this.buildSaleUrl, this.IS_SALE, saveHistory);
    }

    getSwapListFromHistory = async (saveHistory) => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(this.IS_SWAP), this.buildQueryStringWithRange,
            this.buildSwapUrl, this.IS_SWAP, saveHistory);
    }

    getConvertListFromHistory = async (saveHistory) => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(this.IS_CONVERT), this.buildQueryStringWithRange,
            this.buildConvertUrl, this.IS_CONVERT, saveHistory);
    }

    initializeTrade = (trade, trades, symbolCurrency) => {
        for (let i = 0; i < trades.length; i++) {
            if (trades[i].orderId === trade.orderId) {
                return i;
            }
        }
        trades.push({
            orderId: trade.orderId,
            outputSymbol: trade.isBuyer === true ? symbolCurrency.currency : symbolCurrency.symbol,
            inputSymbol: trade.isBuyer === true ? symbolCurrency.symbol : symbolCurrency.currency,
            qty: 0,
            price: 0.0,
            quoteQty: 0.0,
            date: "",
            fee: 0.0,
            feeCurrency: ""
        });
        return trades.length - 1;
    }

    determinesPairCurrency = (pair) => {
        if (pair.indexOf("USDT") > 0) {
            return ({
                currency: "USDT",
                symbol: pair.replace("USDT", "")
            })
        }
        if (pair.indexOf("BNB") > 0) {
            return ({
                currency: "BNB",
                symbol: pair.replace("BNB", "")
            })
        }
        if (pair.indexOf("USDC") > 0) {
            return ({
                currency: "USDC",
                symbol: pair.replace("USDC", "")
            })
        } else {
            return ({currency: "", symbol: ""})

        }
    }

    ensureSwapNotAlreadyStored = async (trade, symbolCurrency) => {
        if (symbolCurrency.currency === "") return false;
        let inputSymbol, outputSymbol;
        if (trade.isBuyer === true) {
            outputSymbol = symbolCurrency.currency;
            inputSymbol = symbolCurrency.symbol;
        } else {
            inputSymbol = symbolCurrency.currency;
            outputSymbol = symbolCurrency.symbol;
        }
        let res = await new MongoHelper().findBinanceSwapTransaction(outputSymbol, inputSymbol, trade.orderId);
        return res === null;
    }

    getTransactionDateTime = (timestamp) => {
        return new Date(Math.trunc(timestamp / 1000) * 1000);
    }

    handleTrade = async (trade, buy, trades) => {
        let symbolCurrency = this.determinesPairCurrency(trade.symbol);
        if (await this.ensureSwapNotAlreadyStored(trade, symbolCurrency) === true && trade.isBuyer === buy) {
            let nTrade = trades[this.initializeTrade(trade, trades, symbolCurrency)];
            nTrade.qty += parseFloat(trade.qty);
            nTrade.price = parseFloat(trade.price);
            nTrade.quoteQty += parseFloat(trade.quoteQty);
            nTrade.date = utils.getDateFromDate(new Date(this.getTransactionDateTime(trade.time)));
            nTrade.time = utils.getTimeFromDate(new Date(this.getTransactionDateTime(trade.time)));
            nTrade.fee += parseFloat(trade.commission);
            nTrade.feeCurrency = trade.commissionAsset;
        }
    }

    getSwapTrades = async (pair) => {
        let queryString = this.buildQueryStringTradesHisto(pair);
        let signature = this.getSignature(queryString);
        let url = this.buildTradesHistoUrl(queryString, signature);
        console.log("trade URL", url);
        return await this.get(url);

    }

    getConvertTrades = async () => {
        return this.getDataFromRange(await this.getStartFromHistory(this.IS_CONVERT),this.buildQueryStringWithRange,this.buildConvertUrl, 30);
    }

    getMyTrades = async (pair, buy) => {
        let tradesResult = await this.getSwapTrades(pair);
        console.log('tradesResult', JSON.stringify(tradesResult));
        let usdt = await new MongoHelper().getUSDTValueInFiat();
        let bnb = await new MongoHelper().getBNBValueInFiat();
        let usdc = await new MongoHelper().getUSDCValueInFiat();
        let convertResults = await this.getConvertTrades();
        let result = {
            buy: buy,
            usdtFiatValue: usdt.value,
            bnbFiatValue: bnb.value,
            usdcFiatValue: usdc.value,
            trades: [],
            convert: convertResults
        }
        if (tradesResult.error === false) {
            let trades = tradesResult.data;
            for (let i = 0; i < trades.length; i++) {
                await this.handleTrade(trades[i], buy, result.trades);
            }
        }
        return result;
    }

    ensurePurchaseNotAlreadyStored = async (purchase) => {
        return await new MongoHelper().findBinancePurchaseTransaction(purchase.orderNo);
    }

    handlePurchase = (purchase) => {
        return {
            orderId: purchase.orderNo,
            date: utils.getDateFromDate(new Date(this.getTransactionDateTime(purchase.createTime))),
            time: utils.getTimeFromDate(new Date(this.getTransactionDateTime(purchase.createTime))),
            symbol: purchase.cryptoCurrency,
            tokens: parseFloat(purchase.obtainAmount),
            quotation: parseFloat(purchase.price),
            fiatAmount: parseFloat(purchase.sourceAmount),
            fiatCurrency: purchase.fiatCurrency,
            fee: parseFloat(purchase.totalFee)
        }
    }
    /**
     * @param result Contains {}
     * @returns {Promise<{purchases: *[]}>}
     */
    getMyPurchases = async (result) => {
        let purchasesResult = result["purchase"];
        let purchases = []
        if (purchasesResult.error === false) {
            purchasesResult.data.sort((a,b) => b.createTime - a.createTime);
            for (let i=0; i<purchasesResult.data.length; i++) {
                let purchase = purchasesResult.data[i];
                let prev = await this.ensurePurchaseNotAlreadyStored(purchase);
                if (prev !== null || purchase.status.toLowerCase() !== "completed") {
                    continue;
                }
                purchases.push(this.handlePurchase(purchase));
            }
        }
        return { "purchases": purchases };
    }

    /**
     * @param result Contains {}
     * @returns {Promise<void>}
     */
    getMySales = async (result) => {

    }
}

module.exports = {
    Binance: Binance
}