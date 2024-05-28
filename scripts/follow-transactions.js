const config = require('config');
const MongoHelper = require('./classes/mongo-helper');
const utils = require('./utils');
const fs = require('fs');

const getAllTransactionsOnDate = async (direction) => {
    return await new MongoHelper().findAllTransactionsSortedOnDate(direction);
}

const handleTransaction = (transaction, token, wallet, action) => {
    if (transaction.type === "purchase" && (action === "" || action === "purchase")) {
        if ((wallet === "" || transaction.wallet === wallet) && (transaction.symbol === token || token === "")) {
            return true;
        }
    } else if (transaction.type === "sale" && (action === "" || action === "sale")) {
        if ((wallet === "" || transaction.wallet === wallet) && (transaction.symbol === token || token === "")) {
            return true;
        }
    } else if (transaction.type === "swap" && (action === "" || action === "swap")) {
        if ((wallet === "" || transaction.wallet === wallet) && (transaction.outputSymbol === token || transaction.inputSymbol === token || token === "")) {
            return true;
        }
    } else if (transaction.type === "send" && (action === "" || action === "send")) {
        if ((transaction.symbol === token || token === "") && (wallet === "" || transaction.sendWallet === wallet || transaction.receiveWallet === wallet)) {
            return true;
        }
    }
    return false;
}

const getExplorerUrl = (chainName, tx) => {
    if (config.has('chain_explorers')) {
        let chainIndex = config.get('chain_explorers').findIndex(chain => chain.name === chainName);
        if (chainIndex >= 0) {
            return `${config.get('chain_explorers')[chainIndex].url}${tx}`;
        }
    }
    return null;
}

const interpretFlow = (lang, t, wallet) => {
    let flow;
    if (lang === "en") {
        flow = interpretFlowEn(t, wallet)
    } else {
        flow = interpretFlowFr(t, wallet)
    }
    flow.chainUrl = null;
    if (t.txIdOpt !== null && t.txIdOpt !== undefined) {
        flow.chainUrl = getExplorerUrl(t.chainExplorerOpt, t.txIdOpt);
    }
    return flow;
}

const resolveDec = (v) => {
    let s = v.toFixed(8).split('.')[1];
    for (let dec = 7; dec >= 0; dec--) {
        if (s[dec] !== '0') {
            return dec + 1;
        }
    }
    return 2;
}
const fd = (v) => {
    return utils.formatDelim(v.toFixed(resolveDec(v)), config.get('decimal_separator'))
}

const interpretFlowFr = (t, wallet) => {
    let comment = (t.comment) ? t.comment : "";
    let d = t.date.toLocaleString('fr-FR')
    let sup = "";
    if (wallet === "") {
        sup = `à partir du wallet ${t.wallet} `;
    }
    let fiat = config.get('fiat_currency').toUpperCase();
    if (t.type === "purchase") {
        return {
            id: t._id,
            msg: `${d} : Achat de ${fd(t.tokens)} ${t.symbol} quoté à ${fd(t.quotation)} ${fiat} ${sup} avec ` +
                `${fd(t.feeInFiat)} ${fiat} de frais. ${comment}`
        };
    } else if (t.type === "sale") {
        return {
            id: t._id,
            msg: `${d} : Vente de ${fd(t.tokens)} ${t.symbol} quoté à ${fd(t.quotation)} ${fiat} ${sup}avec ` +
                `${fd(t.feeInFiat)} ${fiat} de frais. ${comment}`
        };
    } else if (t.type === "swap") {
        return {
            id: t._id,
            msg: `${d} : Echange ${sup}de ${fd(t.outputTokens)} ${t.outputSymbol} coté à ${fd(t.outputTokenQuotation)} ` +
                `${t.outputTokenQuotationCurrency} en ${fd(t.inputTokens)} ${t.inputSymbol} coté à ${fd(t.inputTokenQuotation)} ` +
                `${t.inputTokenQuotationCurrency} avec ${fd(t.fee)} ${t.feeCurrency} de frais. ${comment}`
        };
    } else if (t.type === "send" && t.sendWallet === wallet) {
        return {
            id: t._id, msg: `${d} : Envoi de ${fd(t.sendTokens)} ${t.symbol} ${sup}sur le wallet ${t.receiveWallet} ` +
                `(reçu ${fd(t.receiveTokens)}) avec ${fd(t.fee)} ${t.feeCurrency} de frais. ${comment}`
        };
    } else if (t.type === "send" && t.receiveWallet === wallet) {
        if (wallet === "") {
            sup = `sur le wallet ${t.wallet} `;
        }
        return {
            id: t._id,
            msg: `${d} : Réception de ${fd(t.receiveTokens)} ${t.symbol} ${sup}à partir des ${fd(t.sendTokens)} ${t.symbol} ` +
                `envoyés par le wallet ${t.sendWallet} avec ${fd(t.fee)} ${t.feeCurrency} de frais. ${comment}`
        };
    } else {
        // wallet not supplied
        return {
            id: t._id,
            msg: `${d} : Envoi de ${fd(t.sendTokens)} ${t.symbol} à partir du wallet ${t.sendWallet} sur le wallet ` +
                `${t.receiveWallet} (reçu ${fd(t.receiveTokens)}) avec ${fd(t.fee)} ${t.feeCurrency} de frais. ${comment}`
        };
    }
}

const interpretFlowEn = (t, wallet) => {
    let comment = (t.comment) ? t.comment : "";
    let d = t.date.toLocaleString('en-EN')
    let sup = "";
    if (wallet === "") {
        sup = `from wallet ${t.wallet} `;
    }
    let fiat = config.get('fiat_currency').toUpperCase();
    if (t.type === "purchase") {
        return {
            id: t._id,
            msg: `${d} : Purchase ${fd(t.tokens)} ${t.symbol} quoted at ${fd(t.quotation)} ${fiat} ${sup} ` +
                `with fee of ${fd(t.feeInFiat)} ${fiat}. ${comment}`
        };
    } else if (t.type === "sale") {
        return {
            id: t._id,
            msg: `${d} : Sale ${fd(t.tokens)} ${t.symbol} quoted at ${fd(t.quotation)} ${fiat} ${sup}` +
                `with fee of ${fd(t.feeInFiat)} ${fiat}. ${comment}`
        };
    } else if (t.type === "swap") {
        return {
            id: t._id,
            msg: `${d} : Swap ${sup}of ${fd(t.outputTokens)} ${t.outputSymbol} quoted at ${fd(t.outputTokenQuotation)} ` +
                `${t.outputTokenQuotationCurrency} in ${fd(t.inputTokens)} ${t.inputSymbol} quoted at ${fd(t.inputTokenQuotation)} ` +
                `${t.inputTokenQuotationCurrency} with fee of ${fd(t.fee)} ${t.feeCurrency}. ${comment}`
        };
    } else if (t.type === "send" && t.sendWallet === wallet) {
        return {
            id: t._id, msg: `${d} : Send ${fd(t.sendTokens)} ${t.symbol} ${sup}to the wallet ${t.receiveWallet} ` +
                `(received ${fd(t.receiveTokens)}) with fee of ${fd(t.fee)} ${t.feeCurrency}. ${comment}`
        };
    } else if (t.type === "send" && t.receiveWallet === wallet) {
        if (wallet === "") {
            sup = `to the wallet ${t.wallet} `;
        }
        return {
            id: t._id,
            msg: `${d} : Receive ${fd(t.receiveTokens)} ${t.symbol} ${sup}from the ${fd(t.sendTokens)} ${t.symbol} ` +
                `sent by the wallet ${t.sendWallet} with fee of ${fd(t.fee)} ${t.feeCurrency}. ${comment}`
        };
    } else {
        // wallet not supplied
        return {
            id: t._id, msg: `${d} : Send ${fd(t.sendTokens)} ${t.symbol} from wallet ${t.sendWallet} to the wallet ` +
                `${t.receiveWallet} (received ${fd(t.receiveTokens)}) with fee of ${fd(t.fee)} ${t.feeCurrency}. ${comment}`
        };
    }
}


const getAllSymbols = async () => {
    let triple = await new MongoHelper().findAllSymbolsInTransactions();
    let symbols = [];
    await triple.forEach((t) => {
        if (t.symbol != null && !symbols.includes(t.symbol)) {
            symbols.push(t.symbol);
        }
        if (t.inputSymbol != null && !symbols.includes(t.inputSymbol)) {
            symbols.push(t.inputSymbol);
        }
        if (t.outputSymbol != null && !symbols.includes(t.outputSymbol)) {
            symbols.push(t.outputSymbol);
        }
    })
    return symbols.sort();
}

const getAllWallets = async () => {
    let triple = await new MongoHelper().findAllWallets();
    let wallets = [];
    await triple.forEach((t) => {
        if (t.wallet != null && !wallets.includes(t.wallet)) {
            wallets.push(t.wallet);
        }
        if (t.sendWallet != null && !wallets.includes(t.sendWallet)) {
            wallets.push(t.sendWallet);
        }
        if (t.receiveWallet != null && !wallets.includes(t.receiveWallet)) {
            wallets.push(t.receiveWallet);
        }
    })
    return wallets.sort();
}
/*
 Follow transactions on a specified token and a specified wallet
 */
const follow = async (lang, token, wallet, action, sortDirection, noInterpret) => {
    let actions = [];
    let transactions = await getAllTransactionsOnDate(sortDirection === "A" ? 1 : -1);
    for (let i = 0; i < transactions.length; i++) {
        let res = handleTransaction(transactions[i], token.toUpperCase(), wallet, action);
        if (res === true) {
            if (noInterpret === undefined) {
                actions.push(interpretFlow(lang, transactions[i], wallet));
            } else {
                actions.push(transactions[i]);
            }
        }
    }
    return actions
}

const writeField = (line, value, first) => {
    if (value !== undefined) {
        line += (((first) ? '' : ';') + value);
    } else {
        line += ';'
    }
    return line;
}

const getCriteria = (request) => {
    let wallet = request.query.wallet === undefined || request.query.wallet === '' ? '' : request.query.wallet;
    let token = request.query.token === undefined || request.query.token === '' ? '' : request.query.token;
    return {wallet: wallet, token: token};
}

const getTransactionsAsCsvFile = async (request) => {
    let names = await new MongoHelper().getAllTransactionFieldsName();
    delete names["_id"];
    let criteria = getCriteria(request);
    let csvFileName = `/tmp/transactions-${new Date().getTime()}.csv`;
    let csvFile = fs.openSync(csvFileName, "a");
    let pos = fs.writeSync(csvFile, `${names.join(';')}\n`, 0);
    let transactions = await follow('', criteria.token, criteria.wallet, 'A', true);
    for (let posTran = 0; posTran < transactions.length; posTran++) {
        delete transactions[posTran]._id;
        let line = '';
        let first = true;
        for (let posName = 0; posName < names.length; ++posName) {
            line = writeField(line, transactions[posTran][names[posName]], first);
            first = false;
        }
        pos = fs.writeSync(csvFile, `${line}\n`, pos);
    }
    fs.closeSync(csvFile);
    return {
        csv: csvFileName,
        name: "transactions.csv"
    }
}

const getTransactionsAsJsonFile = async (request) => {
    let jsonFileName = `/tmp/transactions-${new Date().getTime()}.json`;
    let criteria = getCriteria(request);
    let jsonFile = fs.openSync(jsonFileName, "a");
    let transactions = await follow('', criteria.token, criteria.wallet, 'A', true);
    let pos = 0;
    for (let posTran = 0; posTran < transactions.length; posTran++) {
        delete transactions[posTran]._id;
        pos = fs.writeSync(jsonFile, `${JSON.stringify(transactions[posTran])}\n`, pos);
    }
    fs.closeSync(jsonFile);
    return {
        csv: jsonFileName,
        name: "transactions.json"
    }
}

exports.follow = follow
exports.getAllSymbols = getAllSymbols
exports.getAllWallets = getAllWallets
exports.getTransactionsAsCsvFile = getTransactionsAsCsvFile
exports.getTransactionsAsJsonFile = getTransactionsAsJsonFile