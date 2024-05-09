const config = require('config');
const path = require('path');
const fs = require('fs/promises');
const MongoClient = require('mongodb').MongoClient;
const {ObjectId} = require('mongodb');
const utils = require('../utils');

class MongoHelper {

    mongoClient;

    constructor() {
        this.mongoClient = null;
    }

    init = async () => {
        this.mongoClient = new MongoClient(config.get('mongodb_uri'));
        let db = await this.mongoClient.connect();
        this.dbo = db.db(config.get('mongodb_database'));
    }

    walletsInitialize = async () => {
        try {
            await this.init();
            let wallets = await this.findAllWallets();
            if (wallets.length === 0) {
                let icons = path.join(__dirname, '../public/images/icons/');
                let files = await fs.readdir(icons);
                for (let i = 0; i < files.length; i++) {
                    let file = files[i].split(".")[0]
                    await new MongoHelper().addWallet(file);
                }
                return files.length;
            } else {
                return 0;
            }
        } finally {
            await this.mongoClient.close();
        }
    }

    // transactions

    insertTransaction = async (doc) => {
        try {
            await this.init();
            await this.dbo.collection("transactions").insertOne(doc);
            return "Transaction ajoutée"
        } finally {
            await this.mongoClient.close();
        }
        return "BAD";
    }

    findAllTransactions = async () => {
        try {
            await this.init();
            return await this.dbo.collection("transactions").find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllTransactionsSortedOnDate = async (direction) => {
        let dir = direction === undefined ? 1 : direction;
        try {
            await this.init();
            return await this.dbo.collection("transactions").find({}).sort({"date": dir}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllSymbolsInTransactions = async () => {
        try {
            await this.init();
            return await this.dbo.collection("transactions").find({}, {
                "symbol": 1,
                "inputSymbol": 1,
                "outputSymbol": 1
            }).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllWallets = async () => {
        try {
            await this.init();
            return await this.dbo.collection("transactions").find({},
                {"wallet": 1, "sendWallet": 1, "receiveWallet": 1}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    deleteTransaction = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection("transactions").deleteOne({_id: new ObjectId(id)})
        } finally {
            await this.mongoClient.close();
        }
    }

    findTransaction = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection("transactions").findOne({_id: new ObjectId(id)})
        } finally {
            await this.mongoClient.close();
        }
    }

    updateTransaction = async (id, transaction) => {
        try {
            await this.init();
            return await this.dbo.collection("transactions").findOneAndReplace({_id: new ObjectId(id)}, transaction)
        } finally {
            await this.mongoClient.close();
        }
    }

    getAllTransactionFieldsName = async () => {
        let allNames = [];
        try {
            await this.init();
            let cursor = await this.dbo.collection("transactions").find({});
            while (await cursor.hasNext()) {
                let transaction = await cursor.next();
                let names = Object.keys(transaction);
                for (let i = 0; i < names.length; i++) {
                    if (names[i] !== '_id') {
                        utils.storeUniqueInArray(allNames, names[i]);
                    }
                }
            }
        } finally {
            await this.mongoClient.close();
        }
        return allNames;
    }

    // my-cryptos

    findAllSymbolsInMyCryptos = async (ico) => {
        let criteria = (ico === undefined) ? {ico_address: {$exists: false}} : {};
        try {
            await this.init();
            return await this.dbo.collection("my-cryptos").find(criteria).project({_id: 0, symbol: 1}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllMyCryptos = async (ico) => {
        let criteria = (ico === undefined) ? {ico_address: {$exists: false}} : {};
        try {
            await this.init();
            return await this.dbo.collection("my-cryptos").find(criteria).sort({symbol: 1}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findMyCrypto = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection("my-cryptos").findOne({id: id});
        } finally {
            await this.mongoClient.close();
        }
    }

    addToMyCryptos = async (crypto) => {
        try {
            await this.init();
            await this.dbo.collection("my-cryptos").insertOne(crypto);
            return "ok";
        } finally {
            await this.mongoClient.close();
        }
    }

    findAndRemoveFromMyCryptos = async (crypto) => {
        try {
            await this.init();
            await this.dbo.collection("my-cryptos").findOneAndDelete(crypto);
            return "ok";
        } finally {
            await this.mongoClient.close();
        }
    }

    // coingecko

    findAllAvailableCryptos = async () => {
        try {
            await this.init();
            return await this.dbo.collection("coingecko").find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    // wallets

    addWallet = async (wallet) => {
        try {
            await this.init();
            await this.dbo.collection("wallets").insertOne({wallet: wallet});
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllWalletsName = async () => {
        try {
            await this.init();
            return await this.dbo.collection("wallets").find({}).sort({wallet: 1}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    // params

    getUSDTValueInFiat = async () => {
        try {
            await this.init();
            return await this.dbo.collection("params").findOne({id: "usdt"})
        } finally {
            await this.mongoClient.close();
        }
    }

    // alerts

    getAlerts = async () => {
        try {
            await this.init();
            return await this.dbo.collection("alerts").find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    addAlert = async (doc) => {
        try {
            await this.init();
            return await this.dbo.collection("alerts").findOneAndReplace({token: doc.token}, doc, {upsert: true});
        } finally {
            await this.mongoClient.close();
        }
    }
    delAlert = async (token) => {
        try {
            await this.init();
            return await this.dbo.collection("alerts").findOneAndDelete({token: token});
        } finally {
            await this.mongoClient.close();
        }
    }

    // alert-survey

    addAlertSurvey = async (doc) => {
        try {
            await this.init();
            return await this.dbo.collection("alerts-survey").findOneAndReplace({token: doc.token}, doc, {upsert: true});
        } finally {
            await this.mongoClient.close();
        }
    }
    delAlertSurvey = async (token) => {
        try {
            await this.init();
            return await this.dbo.collection("alerts-survey").findOneAndDelete({token: token});
        } finally {
            await this.mongoClient.close();
        }
    }
    getAlertsSurvey = async () => {
        try {
            await this.init();
            return await this.dbo.collection("alerts-survey").find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    // cryptos-survey

    getCryptosSurvey = async () => {
        try {
            await this.init();
            return await this.dbo.collection("cryptos-survey").find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }
    findCryptoSurvey = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection("cryptos-survey").findOne({id: id});
        } finally {
            await this.mongoClient.close();
        }
    }
    addCryptoSurvey = async (doc) => {
        try {
            await this.init();
            return await this.dbo.collection("cryptos-survey").insertOne(doc);
        } finally {
            await this.mongoClient.close();
        }
    }
    delCryptoSurvey = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection("cryptos-survey").findOneAndDelete({id: id});
        } finally {
            await this.mongoClient.close();
        }
    }

    // platforms-history

    addOrReplacePlatformsHistory = async (doc) => {
        try {
            await this.init();
            return await this.dbo.collection("platforms-history").findOneAndReplace({platform: doc.platform}, doc, {upsert: true});
        } finally {
            await this.mongoClient.close();
        }
    }

    findPlatformsHistory = async (platform) => {
        try {
            await this.init();
            return await this.dbo.collection("platforms-history").findOne({platform: platform});
        } finally {
            await this.mongoClient.close();
        }
    }

}

module.exports = MongoHelper;