const MongoHelper = require('../scripts/mongoHelper');

let getMyCryptos = async () => {
    return await new MongoHelper().findAllMyCryptos();
}

let getAvailableCryptos = async () => {
    return await new MongoHelper().findAllAvailableCryptos();
}

let addToMyCrypto = async (crypto) => {
    return await new MongoHelper().addToMyCryptos(crypto);
}

let removeFromMyCrypto = async (crypto) => {
    return await new MongoHelper().findAndRemoveFromMyCryptos(crypto);
}

exports.getMyCryptos = getMyCryptos
exports.getAvailableCryptos = getAvailableCryptos
exports.addToMyCrypto = addToMyCrypto
exports.removeFromMyCrypto = removeFromMyCrypto