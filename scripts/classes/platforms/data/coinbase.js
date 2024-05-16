/*
 * Coinbase API access
 */
const tools = require('../common');
const MongoHelper = require('../../mongo-helper');
const config = require('config');
const crypto = require('node:crypto')
const {sign} = require('jsonwebtoken')
const axios = require('axios')

class Coinbase {

    config;

    constructor() {
        this.config = config.get('platforms_api.coinbase');
    }

    buildUriForJwt = (path) => {
        // JWT does not take account of query string.
        let pathWithoutQs = path.split("?")[0];
        return `GET ${this.config.get('host')}${pathWithoutQs}`;
    }

    buildUrl = (path) => {
        let urlPath = (path === undefined) ? this.config.get('accounts_path') : path;
        return `https://${this.config.get('host')}${urlPath}`;
    }

    getJwt = async (path) => {
        return await sign(
            {
                iss: 'coinbase-cloud',
                nbf: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 120,
                sub: this.config.get('api_key'),
                uri: this.buildUriForJwt(path)
            },
            this.config.get('secret_key'),
            {
                algorithm: 'ES256',
                header: {
                    kid: this.config.get('api_key'),
                    nonce: crypto.randomBytes(16).toString('hex')
                }
            }
        )
    }

    get = async (path, url) => {
        try {
            let response = await axios.get(url,
                {
                    headers: {
                        "Authorization": `Bearer ${await this.getJwt(path)}`
                    }
                }
            )
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

    getAccountsList = async () => {
        return await this.get(this.config.get('accounts_path'), this.buildUrl())
    }

    getLastRefQueryString = (history, accountId) => {
        let idx = history.transactionIds.findIndex(his => his.accountId === accountId);
        if (idx < 0) {
            return '?new_version_opt_in=true&limit=100';
        } else {
            return `?new_version_opt_in=true&limit=100&starting_after=${history.transactionIds[idx].lastId}`;
        }
    }

    getHistory = async (withHistory) => {
        let his = {
            platform: "coinbase",
            transactionIds: []
        }
        if (withHistory === false) {
            return his;
        } else {
            let history = await new MongoHelper().findPlatformsHistory("coinbase");
            if (history === null) {
                history = his;
            }
            return history;
        }
    }

    replaceHistoryIdObjectInArray = (arr1, arr2) => {
        return arr1.map(obj => arr2.find(o => o.accountId === obj.accountId) || obj);
    }

    rebuildHistory = (history, historyIds) => {
        history.transactionIds = (history.transactionIds.length === 0) ? historyIds :
            this.replaceHistoryIdObjectInArray(history.transactionIds, historyIds);
    }

    /**
     * Get all transactions.
     * if 'withHistory' is set to true:
     * . needs to store lastIdTransaction for each account in mongo.
     * . next call to this function must get the stored value and use 'starting_after' query string with
     * stored lastIdTransaction.
     * @param withHistory: boolean Handle history or not.
     * @returns {Promise<{data: any, error: boolean}|{data: string, error: boolean}|{data: *[], error: boolean}>}
     */
    getTransactionsList = async (withHistory) => {
        let history = await this.getHistory(withHistory);
        let accountsResponse = await this.getAccountsList();
        let transactions = [];
        let historyIds = [];
        if (accountsResponse.error === false) {
            let accounts = accountsResponse.data;
            for (let i = 0; i < accounts.data.length; i++) {
                let account = accounts.data[i];
                if (account.resource_path !== undefined) {
                    let done = false;
                    // Paginate depending on next_uri field.
                    let subPath = this.getLastRefQueryString(history, account.id);
                    let path = `${account.resource_path}/transactions${subPath}`;
                    while (done === false) {
                        let lastIdTransaction = '';
                        let transactionsResponse = await this.get(path, this.buildUrl(path));
                        if (transactionsResponse.error === false) {
                            let transactionsList = transactionsResponse.data.data;
                            if (transactionsList.length === 0) {
                                done = true;
                            } else {
                                transactions = transactions.concat(transactionsList);
                                lastIdTransaction = transactionsList[transactionsList.length - 1].id;
                                if (tools.isFieldValid(transactionsResponse.data.pagination.next_uri)) {
                                    path = transactionsResponse.data.pagination.next_uri;
                                } else {
                                    done = true;
                                    // Save account.id with lastIdTransaction for next calls later.
                                    historyIds.push({accountId: account.id, lastId: lastIdTransaction});
                                }
                            }
                        } else {
                            return transactionsResponse;
                        }
                    }
                }
            }
            // save history in mongodb
            if (withHistory) {
                this.rebuildHistory(history, historyIds);
                await new MongoHelper().addOrReplacePlatformsHistory(history);
            }
            return {
                error: false,
                data: transactions
            }
        } else {
            return accountsResponse;
        }
    }

    getAddressList = async () => {
        let accountsResponse = await this.getAccountsList();
        let addresses = [];
        if (accountsResponse.error === false) {
            let accounts = accountsResponse.data;
            for (let i = 0; i < accounts.data.length; i++) {
                let account = accounts.data[i];
                if (account.resource_path !== undefined) {
                    let addressesResponse = await this.get(`${account.resource_path}/addresses`,
                        this.buildUrl(`${account.resource_path}/addresses`));
                    if (addressesResponse.error === false) {
                        let addressesList = addressesResponse.data;
                        for (let j = 0; j < addressesList.data.length; j++) {
                            let address = addressesList.data[j];
                            addresses.push({network: address.network, address: address.address});
                        }
                    } else {
                        return addressesResponse;
                    }
                }
            }
            return {
                error: false,
                data: addresses
            }
        } else {
            return accountsResponse;
        }
    }
}

module.exports = {
    Coinbase: Coinbase
}