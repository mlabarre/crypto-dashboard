/*
 * Bitpanda API access
 */
const config = require('config');
const axios = require('axios');

class Bitpanda {

    config;

    constructor() {
        this.config = config.get('platforms_api.bitpanda');
    }

    buildUrl = (path) => {
        return `${this.config.get('base_url')}${path}`;
    }

    get = async (url) => {
        try {
            let response = await axios.get(url,
                {
                    headers: {
                        "X-Api-Key": this.config.get('api_key')
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
    Bitpanda: Bitpanda
}