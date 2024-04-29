const config = require('config');
const MongoHelper = require('./mongo-helper')
const utils = require('./utils')

let formatDelim = (value) => {
    let i, j, chain, c, deb, fin, mantissa;
    fin = value.indexOf(".");
    if (fin < 0) fin = value.length;
    else mantissa = value.substring(fin, value.length);
    fin--;
    deb = value.indexOf("-");
    deb++;
    chain = "";
    for (i = fin, j = 0; i >= deb; i--, j++) {
        c = value.charAt(i);
        if (j % 3 === 0 && j !== 0) chain = c + " " + chain;
        else chain = c + chain;
    }
    if (deb === 1) chain = "-" + chain;
    if (fin >= 0) chain = chain + mantissa;
    return chain.replace(".", ",")
}

let formatDate = (dateAsString) => {
    if (dateAsString) {
        return utils.getFormattedDate(config.get('language'), dateAsString);
    } else {
        return "N/A"
    }
}

let fd = (v, unit) => {
    return v === null || v === undefined ? "N/A" : `${utils.formatDelim(v.toFixed(2), config.get('decimal_separator'))} ${unit}`;
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
    info["circulating_supply"] = `${fd(info["circulating_supply"], coin.symbol)}`;
    info["total_supply"] = `${fd(info["total_supply"], coin.symbol)}`;
    info["max_supply"] = `${fd(info["max_supply"], coin.symbol)}`;
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

exports.getCoinInfo = getCoinInfo
