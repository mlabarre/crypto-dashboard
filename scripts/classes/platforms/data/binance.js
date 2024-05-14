/*
 * Binance API access
 */
const tools = require('../common');
const MongoHelper = require('../../mongo-helper');
const config = require('config');
const crypto = require('node:crypto');
const axios = require('axios');

class Binance {

    config;

    IS_PURCHASE = 0;
    IS_SALE = 1;
    IS_WITHDRAW = 2;
    IS_CONVERT = 3;

    constructor() {
        this.config = config.get('platforms_api.binance');
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

    buildQueryStringWithRangeForPurchase = (timestamp, start, end) => {
        return `${this.buildQueryStringWithRange(timestamp, start, end)}&transactionType=0`;
    }

    buildQueryStringWithRangeForSale = (timestamp, start, end) => {
        return `${this.buildQueryStringWithRange(timestamp, start, end)}&transactionType=1`;
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

    buildConvertUrl = (queryString, signature) => {
        return `${this.config.get('convert_url')}?${queryString}&signature=${signature}`;
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
            console.log(response.data)
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

    getDataFromRange = async (startTimestamp, buildQueryFunction, buildUrl) => {
        let done = false;
        let currentTimestamp = tools.getCurrentTimestamp();
        let endTimestamp = tools.getTimestampPast(startTimestamp, 90);
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

    saveInHistory = async (saveHistory) => {
        if (saveHistory) {
            await new MongoHelper().addOrReplacePlatformsHistory({platform: "binance", timestamp: Date.now()})
        }
    }

    getStartFromHistory = async () => {
        let history = await new MongoHelper().findPlatformsHistory("binance");
        return (history === null) ? tools.getTimestampFromDateString("2010-01-01") : history.timestamp;
    }
    sendFromStartDateRequest = async (startTimestamp, buildQueryFunction, buildUrlFunction, type, saveHistory) => {
        let result = [];
        let done = false;
        while (done === false) {
            let res = await this.getDataFromRange(startTimestamp, buildQueryFunction, buildUrlFunction)
            done = res.done;
            if (res.response.error === true) {
                return res.response;
            }
            if (type === this.IS_WITHDRAW && res.response.data.length > 0) {
                result = result.concat(res.response.data);
            } else if (type === this.IS_CONVERT) {
                result = result.concat(res.response.list)
            } else {
                if (res.response.data.success === true && res.response.data.total > 0) {
                    result = result.concat(res.response.data.data);
                }
            }
            startTimestamp = res.endTimestamp;
        }
        await this.saveInHistory(saveHistory);
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

    getConvertListForLast90Days = async () => {
        return await this.send90DaysRequest(this.buildQueryString, this.buildConvertUrl());
    }

    /*
     * Transactions since 2010 by 90 days steps.
     */

    getWithdrawListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRange,
            this.buildWithdrawUrl,this.IS_WITHDRAW, false);
    }

    getPurchaseListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRangeForPurchase,
            this.buildPurchaseUrl, this.IS_PURCHASE,false);
    }

    getSaleListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRangeForSale,
            this.buildSaleUrl, this.IS_SALE,false);
    }

    getConvertListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRange,
            this.buildConvertUrl, this.IS_CONVERT,false);
    }

    /*
     * Transactions since last history date. To use with bot.
     */

    getWithdrawListFromHistory = async () => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(), this.buildQueryStringWithRange,
            this.buildWithdrawUrl, this.IS_WITHDRAW, true);
    }

    getPurchaseListFromHistory = async () => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(), this.buildQueryStringWithRangeForPurchase,
            this.buildPurchaseUrl, this.IS_PURCHASE,true);
    }

    getSaleListFromHistory = async () => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(), this.buildQueryStringWithRangeForSale,
            this.buildSaleUrl, this.IS_SALE,true);
    }

    getConvertListFromHistory = async () => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(), this.buildQueryStringWithRange,
            this.buildConvertUrl, this.IS_CONVERT,true);
    }
}

module.exports = {
    Binance: Binance
}