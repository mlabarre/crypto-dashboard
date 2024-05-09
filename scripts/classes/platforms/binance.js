/*
 * Binance API access
 * Configuration is accessible in config.get('platforms_api').get('binance')
 */
const tools = require('./common');
const MongoHelper = require('../mongo-helper');
const config = require('config');
const crypto = require('node:crypto')

class Binance {

    config;

    constructor() {
        this.config = config.get('platforms_api.binance');
    }

    getSignature = (data) => {
        const hmac = crypto.createHmac('sha256', this.config.get('secret_key'));
        hmac.update(data);
        return hmac.digest('hex');
    }

    buildQueryStringForWithdraw = () => {
        return `timestamp=${tools.getCurrentTimestamp()}`
    }

    buildQueryStringForPurchase = () => {
        return `${this.buildQueryStringForWithdraw()}&transactionType=0`
    }

    buildQueryStringForSale = () => {
        return `${this.buildQueryStringForWithdraw()}&transactionType=1`
    }

    buildQueryStringWithRangeForWithdraw = (timestamp, start, end) => {
        let queryString = `timestamp=${tools.getCurrentTimestamp()}&startTime=${start}`;
        if (end !== undefined) {
            queryString += `&endTime=${end}`;
        }
        return queryString;
    }

    buildQueryStringWithRangeForPurchase = (timestamp, start, end) => {
        return `${this.buildQueryStringWithRangeForWithdraw(timestamp, start, end)}&transactionType=0`;
    }

    buildQueryStringWithRangeForSale = (timestamp, start, end) => {
        return `${this.buildQueryStringWithRangeForWithdraw(timestamp, start, end)}&transactionType=1`;
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

    get = async (url) => {
        console.log(url)
        let response = await fetch(url,
            {
                headers: {
                    "X-MBX-APIKEY": this.config.get('api_key')
                }
            });
        if (response.ok) {
            return {
                error: false,
                data: await response.json()
            };
        } else {
            return {
                error: true,
                data: `Fetch failed for URL ${url}. ${JSON.stringify(response)}`
            }
        }
    }

    getDataFromRange = async (startTimestamp, buildQueryFunction, buildUrl) => {
        let done = false;
        let currentTimestamp = tools.getCurrentTimestamp();
        let endTimestamp = tools.getTimestampPast(startTimestamp, 90);
        if (endTimestamp >= currentTimestamp) {
            done = true;
            endTimestamp = undefined;
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
    sendFromStartDateRequest = async (startTimestamp, buildQueryFunction, buildUrlFunction, saveHistory) => {
        let result = [];
        let done = false;
        while (done === false) {
            let res = await this.getDataFromRange(startTimestamp, buildQueryFunction, buildUrlFunction)
            done = res.done;
            if (res.response.error === true) {
                return res.response;
            }
            let data = res.response.data;
            if (data.success === true && data.total > 0) {
                result = result.concat(data);
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
        return await this.send90DaysRequest(this.buildQueryStringForWithdraw, this.buildWithdrawUrl);
    }

    getPurchaseListForLast90Days = async () => {
        return await this.send90DaysRequest(this.buildQueryStringForPurchase, this.buildPurchaseUrl);
    }

    getSaleListForLast90Days = async () => {
        return await this.send90DaysRequest(this.buildQueryStringForSale, this.buildSaleUrl);
    }

    /*
     * Transactions since 2010 by 90 days steps.
     */

    getWithdrawListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRangeForWithdraw,
            this.buildWithdrawUrl, false);
    }

    getPurchaseListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRangeForPurchase,
            this.buildPurchaseUrl, false);
    }

    getSaleListFrom2010 = async () => {
        let startTimestamp = tools.getTimestampFromDateString("2010-01-01");
        return await this.sendFromStartDateRequest(startTimestamp, this.buildQueryStringWithRangeForSale,
            this.buildSaleUrl, false);
    }

    /*
     * Transactions since last history date. To use with bot.
     */

    getWithdrawListFromHistory = async () => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(), this.buildQueryStringWithRangeForWithdraw,
            this.buildWithdrawUrl, true);
    }

    getPurchaseListFromHistory = async () => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(), this.buildQueryStringWithRangeForPurchase,
            this.buildPurchaseUrl, true);
    }

    getSaleListFromHistory = async () => {
        return await this.sendFromStartDateRequest(await this.getStartFromHistory(), this.buildQueryStringWithRangeForSale,
            this.buildSaleUrl, true);
    }
}

module.exports = {
    Binance
}