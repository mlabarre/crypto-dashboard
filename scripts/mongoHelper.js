const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const fs = require('fs/promises');

const path = require('path');

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
        try {
            await this.init();
            return await this.dbo.collection("transactions").find({}).sort({date: direction}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    findAllSymbols = async () => {
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

    findAllMyCryptos = async () => {
        try {
            await this.init();
            return await this.dbo.collection("my-cryptos").find({}).sort({symbol:1}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    addToMyCryptos = async (crypto) => {
        try {
            await this.init();
            await this.dbo.collection("my-cryptos").insertOne({
                "id": crypto.id,
                "symbol": crypto.symbol, "name": crypto.name
            });
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

    findAllAvailableCryptos = async () => {
        try {
            await this.init();
            return await this.dbo.collection("coingecko").find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

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
            return await this.dbo.collection("wallets").find({}).toArray();
        } finally {
            await this.mongoClient.close();
        }
    }

    getUSDTValueInFiat = async () => {
        try {
            await this.init();
            return await this.dbo.collection("params").findOne({id: "usdt"})
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
}

module.exports = MongoHelper;
