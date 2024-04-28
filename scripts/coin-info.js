const MongoHelper = require('./mongo-helper')

let getCoinInfo = async (request) => {
    let coin;
    if (request.query.header === "h-survey") {
        coin = await new MongoHelper().findCryptoSurvey(request.query.id);
    } else {
        coin = await new MongoHelper().findMyCrypto(request.query.id);
    }

    return {
        data: {
            info: coin.info,
            returnUrl: request.query.returnUrl,
            header: request.query.header
        }
    }
}


exports.getCoinInfo = getCoinInfo
