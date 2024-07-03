const config = require('config');
const path = require('path');
const fs = require('fs/promises');
const MongoClient = require('mongodb').MongoClient;
const {ObjectId} = require('mongodb');
const utils = require('../utils');

class MongoHelper {

    mongoClient;
    connexion;
    dbo;

    collectionAlerts = "alerts";
    collectionAlertsSurvey = "alerts-survey";
    collectionCoingecko = "coingecko";
    collectionCryptosSurvey = "cryptos-survey";
    collectionMyCryptos = "my-cryptos";
    collectionParams = "params";
    collectionPlatformsHistory = "platforms-history";
    collectionTransactions = "transactions";
    collectionWallets = "wallets";

    constructor() {
        this.mongoClient = null;
    }

    init = async () => {
        this.mongoClient = new MongoClient(config.get("mongodb_uri"));
        this.connexion = await this.mongoClient.connect();
        this.dbo = this.connexion.db(config.get("mongodb_database"));
    }

    // startup

    walletsInitialize = async () => {
        try {
            await this.init();
            let wallets = await this.findAllWallets();
            if (wallets.length === 0) {
                let icons = path.join(__dirname, "../public/images/icons/");
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

    insertTransaction = async (transaction) => {
        try {
            await this.init();
            await this.dbo.collection(this.collectionTransactions).insertOne(transaction);
            return "Transaction ajoutée"
        } finally {
            await this.mongoClient.close();
        }
        return "BAD";
    }

    findAllTransactions = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionTransactions).find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllTransactionsSortedOnDate = async (direction) => {
        let dir = direction === undefined ? 1 : direction;
        try {
            await this.init();
            return await this.dbo.collection(this.collectionTransactions).find({}).sort({"date": dir}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllSymbolsInTransactions = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionTransactions).find({}, {
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
            return await this.dbo.collection(this.collectionTransactions).find({},
                {"wallet": 1, "sendWallet": 1, "receiveWallet": 1}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    deleteTransaction = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionTransactions).deleteOne({_id: new ObjectId(id)})
        } finally {
            await this.mongoClient.close();
        }
    }

    findTransaction = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionTransactions).findOne({_id: new ObjectId(id)})
        } finally {
            await this.mongoClient.close();
        }
    }

    updateTransaction = async (id, transaction) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionTransactions).findOneAndReplace({_id: new ObjectId(id)}, transaction)
        } finally {
            await this.mongoClient.close();
        }
    }

    getAllTransactionFieldsName = async () => {
        let allNames = [];
        try {
            await this.init();
            let cursor = await this.dbo.collection(this.collectionTransactions).find({});
            while (await cursor.hasNext()) {
                let transaction = await cursor.next();
                let names = Object.keys(transaction);
                for (let i = 0; i < names.length; i++) {
                    if (names[i] !== "_id") {
                        utils.storeUniqueInArray(allNames, names[i]);
                    }
                }
            }
        } finally {
            await this.mongoClient.close();
        }
        return allNames;
    }

    findBinanceSwapTransaction = async (outputToken, inputToken, orderId) => {
        let criteria = {type: "swap", outputSymbol: outputToken, inputSymbol: inputToken, orderId: ""+orderId};
        console.log("criteria", criteria)
        try {
            await this.init();
            return await this.dbo.collection(this.collectionTransactions).findOne(criteria);
        } finally {
            await this.mongoClient.close();
        }
    }
    // my-cryptos

    findAllSymbolsInMyCryptos = async (ico) => {
        let criteria = (ico === undefined) ? {ico_address: {$exists: false}} : {};
        try {
            await this.init();
            return await this.dbo.collection(this.collectionMyCryptos).find(criteria).project({
                _id: 0,
                symbol: 1
            }).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllMyCryptos = async (ico) => {
        let criteria = (ico === undefined) ? {ico_address: {$exists: false}} : {};
        try {
            await this.init();
            return await this.dbo.collection(this.collectionMyCryptos).find(criteria).sort({symbol: 1}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findMyCrypto = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionMyCryptos).findOne({id: id});
        } finally {
            await this.mongoClient.close();
        }
    }

    addToMyCryptos = async (crypto) => {
        try {
            await this.init();
            await this.dbo.collection(this.collectionMyCryptos).insertOne(crypto);
            return "ok";
        } finally {
            await this.mongoClient.close();
        }
    }

    findAndRemoveFromMyCryptos = async (crypto) => {
        try {
            await this.init();
            await this.dbo.collection(this.collectionMyCryptos).findOneAndDelete(crypto);
            return "ok";
        } finally {
            await this.mongoClient.close();
        }
    }

    // coingecko

    findAllAvailableCryptos = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionCoingecko).find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    // wallets

    addWallet = async (wallet) => {
        try {
            await this.init();
            await this.dbo.collection(this.collectionWallets).insertOne({wallet: wallet});
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllWalletsName = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionWallets).find({}).sort({wallet: 1}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    // params

    getUSDTValueInFiat = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionParams).findOne({id: "usdt"})
        } finally {
            await this.mongoClient.close();
        }
    }

    getBNBValueInFiat = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionParams).findOne({id: "bnb"})
        } finally {
            await this.mongoClient.close();
        }
    }
    // alerts

    getAlerts = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionAlerts).find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    addAlert = async (alert) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionAlerts)
                .findOneAndReplace({token: alert.token}, alert, {upsert: true});
        } finally {
            await this.mongoClient.close();
        }
    }

    delAlert = async (token) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionAlerts).findOneAndDelete({token: token});
        } finally {
            await this.mongoClient.close();
        }
    }

    // alert-survey

    addAlertSurvey = async (alert) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionAlertsSurvey)
                .findOneAndReplace({token: alert.token}, alert, {upsert: true});
        } finally {
            await this.mongoClient.close();
        }
    }

    delAlertSurvey = async (token) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionAlertsSurvey).findOneAndDelete({token: token});
        } finally {
            await this.mongoClient.close();
        }
    }

    getAlertsSurvey = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionAlertsSurvey).find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    // cryptos-survey

    getCryptosSurvey = async () => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionCryptosSurvey).find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findCryptoSurvey = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionCryptosSurvey).findOne({id: id});
        } finally {
            await this.mongoClient.close();
        }
    }

    addCryptoSurvey = async (survey) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionCryptosSurvey).insertOne(survey);
        } finally {
            await this.mongoClient.close();
        }
    }

    delCryptoSurvey = async (id) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionCryptosSurvey).findOneAndDelete({id: id});
        } finally {
            await this.mongoClient.close();
        }
    }

    // platforms-history

    addOrReplacePlatformsHistory = async (history) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionPlatformsHistory)
                .findOneAndReplace({platform: history.platform}, history, {upsert: true});
        } finally {
            await this.mongoClient.close();
        }
    }

    findPlatformsHistory = async (platform) => {
        try {
            await this.init();
            return await this.dbo.collection(this.collectionPlatformsHistory).findOne({platform: platform});
        } finally {
            await this.mongoClient.close();
        }
    }

}

module.exports = MongoHelper;
