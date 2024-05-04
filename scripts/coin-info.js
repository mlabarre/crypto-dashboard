const config = require('config');
const MongoHelper = require('./mongo-helper')
const utils = require('./utils')

let formatDate = (dateAsString) => {
    if (dateAsString) {
        return utils.getFormattedDate(config.get('language'), dateAsString);
    } else {
        return "N/A"
    }
}

let fd = (v, unit) => {
    return v === null || v === undefined ? "N/A" :
        `${utils.formatDelim(v.toString(), config.get('decimal_separator'))} ${unit}`;
}

let getCoinInfo = async (request) => {
    let coin;
    if (request.query.header === "h-survey") {
        coin = await new MongoHelper().findCryptoSurvey(request.query.id);
    } else {
        coin = await new MongoHelper().findMyCrypto(request.query.id);
    }
    let info = coin.info;
    info["symbol"] = info["symbol"].toUpperCase();
    info["ath_date"] = formatDate(info["ath_date"]);
    info["atl_date"] = formatDate(info["atl_date"]);
    info["last_updated"] = formatDate(info["last_updated"]);
    info["current_price"] = `${fd(info["current_price"], config.fiat_symbol)}`;
    info["market_cap"] = `${fd(info["market_cap"], config.fiat_symbol)}`;
    info["fully_diluted_valuation"] = `${fd(info["fully_diluted_valuation"], config.fiat_symbol)}`;
    info["total_volume"] = `${fd(info["total_volume"], config.fiat_symbol)}`;
    info["high_24h"] = `${fd(info["high_24h"], config.fiat_symbol)}`;
    info["low_24h"] = `${fd(info["low_24h"], config.fiat_symbol)}`;
    info["price_change_24h"] = `${fd(info["price_change_24h"], config.fiat_symbol)}`;
    info["market_cap_change_24h"] = `${fd(info["market_cap_change_24h"], config.fiat_symbol)}`;
    info["circulating_supply"] = `${fd(info["circulating_supply"], coin.symbol.toUpperCase())}`;
    info["total_supply"] = `${fd(info["total_supply"], coin.symbol.toUpperCase())}`;
    info["max_supply"] = `${fd(info["max_supply"], coin.symbol.toUpperCase())}`;
    info["ath"] = `${fd(info["ath"], config.fiat_symbol)}`;
    info["atl"] = `${fd(info["atl"], config.fiat_symbol)}`;
    if (info["price_change_percentage_24h"]) {
        info["price_change_percentage_24h"] = parseFloat(info["price_change_percentage_24h"]).toFixed(2);
    }
    if (info["market_cap_change_percentage_24h"]) {
        info["market_cap_change_percentage_24h"] = parseFloat(info["market_cap_change_percentage_24h"]).toFixed(2);
    }
    if (info["ath_change_percentage"]) {
        info["ath_change_percentage"] = parseFloat(info["ath_change_percentage"]).toFixed(2);
    }
    if (info["atl_change_percentage"]) {
        info["atl_change_percentage"] = parseFloat(info["atl_change_percentage"]).toFixed(2);
    }
    return {
        decimal_separator: config.get('decimal_separator'),
        data: {
            info: coin.info,
            returnUrl: request.query.returnUrl,
            header: request.query.header
        }
    }
}

let getTs = (d) => {
    return Math.trunc(d / 1000);
}

let getPrecision = (price) => {
    return Math.min(8, (price.toString().indexOf('.')>=0) ? price.toString().length - price.toString().indexOf('.')-1 : 0);
}
/**
 * Fortmat graph data
 * @param data ALl datas.
 * @param data.prices Prices array
 * @param data.market_caps Market Cap array
 * @param data.total_volumes Volumes array
 * @returns {{total_volumes: *[], prices: *[]}}
 */
let formatGraphData = (data) => {
    let prices = [];
    let volume = [];
    let green = '#26a69a';
    let red = '#ef5350';
    let previousPrice = 0.0;
    let maxPrecision = 0;
    for (let i = 0; i < data.prices.length; i++) {
        prices.push({time: getTs(data.prices[i][0]), value: data.prices[i][1]})
    }
    for (let i = 0; i < data.total_volumes.length; i++) {
        volume.push({time: getTs(data.total_volumes[i][0]), value: data.total_volumes[i][1]})
    }
    for (let i = 0; i < data.prices.length; i++) {
        prices.push({time: getTs(data.prices[i][0]), value: data.prices[i][1]})
        volume.push({time: getTs(data.total_volumes[i][0]), value: data.total_volumes[i][1],
        color: (data.prices[i][1] >= previousPrice) ? green : red});
        previousPrice = data.prices[i][1];
        maxPrecision = Math.max(maxPrecision, getPrecision(previousPrice))
    }
    return {
        "precision": maxPrecision,
        "minMove": parseFloat(1/Math.pow(10,maxPrecision)).toFixed(maxPrecision),
        "prices": prices,
        "total_volumes": volume
    }
}
let getGraphDataFromApi = async (tokenId, period) => {
    let url = config.get('coingecko_chart_api').replace('TOKEN', tokenId)
        .replace('CURRENCY', config.get('coingecko_currency'))
        .replace('DAYS', (period === 'H' ? "90" : "365"));
    let response = await fetch(url);
    if (response.status === 200) {
        return formatGraphData(await response.json());
    } else {
        console.log(`Error getting coin graph for url ${url}`);
        console.log(`Error info : ${response.statusText}. ${response.statusMessage}`);
        return {"errorGecko": true};
    }
}


exports.getCoinInfo = getCoinInfo
exports.getGraphDataFromApi = getGraphDataFromApi
