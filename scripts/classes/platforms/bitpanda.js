/*
 * Binance API access
 * Configuration is accessible in config.get('platforms_api').get('binance')
 */
const tools = require('./common');
const config = require('config');
const crypto = require('node:crypto')
const {sign} = require('jsonwebtoken')

class Bitpanda {

    config;

    constructor() {
        this.config = config.get('platforms_api.bitpanda');
    }

    buildUrl = (path) => {
        return `${this.config.get('base_url')}${path}`;
    }

    get = async (url) => {
        let response = await fetch(url,
            {
                headers: {
                    "X-Api-Key": this.config.get('api_key')
                }
            }
        )
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

    getTransactionsList = async () => {
        let transactions = [];
        let done = false;
        let cursor = '';
        let nbDownloadedTransactions = 0;
        while (done === false) {
            let response = await this.get(this.buildUrl(`/wallets/transactions?cursor=${cursor}`))
            if (response.error === false) {
                transactions = transactions.concat(response.data.data);
                nbDownloadedTransactions += response.data.meta.page_size;
                if (nbDownloadedTransactions >= response.data.meta.total_count) {
                    done = true;
                } else {
                    cursor = response.data.meta.next_cursor;
                }
            } else {
                return response;
            }
        }
        return {
            error: false,
            data: transactions
        }
    }

}

module.exports = {
    Bitpanda
}