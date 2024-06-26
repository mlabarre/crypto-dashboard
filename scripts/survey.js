const config = require('config');
const MongoHelper = require('./classes/mongo-helper');
const utils = require('../scripts/utils')

const addAlert = async (alert) => {
    return new MongoHelper().addAlertSurvey(alert);
}

const removeAlert = async (token) => {
    return new MongoHelper().delAlertSurvey(token);
}

const evolution = async (sortField, sortDirection) => {
    let cryptos = await new MongoHelper().getCryptosSurvey();
    for (let i = 0; i < cryptos.length; i++) {
        let token = cryptos[i];
        token.variation_on_five_minutes = (token.quotation -
            token.last_five_minutes_quotation) * 100 / token.last_five_minutes_quotation
        token.variation_on_one_hour = (token.quotation -
            token.last_one_hour_quotation) * 100 / token.last_one_hour_quotation
        token.variation_on_one_day = (token.quotation -
            token.last_day_quotation) * 100 / token.last_day_quotation
        token.variation_on_one_week = (token.quotation -
            token.last_week_quotation) * 100 / token.last_week_quotation
    }
    let sortParam = sortDirection === "D" ? "-" + sortField : sortField;
    return {
        result: {
            tokens: cryptos.sort(utils.fieldSorter([sortParam])),
            alerts: await new MongoHelper().getAlertsSurvey()
        }
    }
}

const addCrypto = async (crypto) => {
    return new MongoHelper().addCryptoSurvey(crypto);
}

const removeCrypto = async (id) => {
    return new MongoHelper().delCryptoSurvey(id);
}

exports.addAlert = addAlert
exports.removeAlert = removeAlert
exports.evolution = evolution
exports.addCrypto = addCrypto
exports.removeCrypto = removeCrypto