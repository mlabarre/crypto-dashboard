const config = require('config');
const MongoHelper = require('./mongo-helper');
const utils = require('./utils');

let getAllTransactionsOnDate = async (direction) => {
    return await new MongoHelper().findAllTransactionsSortedOnDate(direction);
}

let handleTransaction = async (transaction, token, wallet) => {
    if (transaction.type === "purchase") {
        if ((wallet === "" || transaction.wallet === wallet) && (transaction.symbol === token || token === "")) {
            return true;
        }
    } else if (transaction.type === "sale") {
        if ((wallet === "" || transaction.wallet === wallet) && transaction.symbol === token || token === "") {
            return true;
        }
    } else if (transaction.type === "swap") {
        if ((wallet === "" || transaction.wallet === wallet) && (transaction.outputSymbol === token || transaction.inputSymbol === token || token === "")) {
            return true;
        }
    } else if (transaction.type === "send") {
        if ((transaction.symbol === token || token === "") && (wallet === "" || transaction.sendWallet === wallet || transaction.receiveWallet === wallet)) {
            return true;
        }
    }
    return false;
}

let interpretFlow = (lang, t, wallet) => {
    if (lang === "en") {
        return interpretFlowEn(t, wallet)
    } else {
        return interpretFlowFr(t, wallet)
    }
}

let fd = (v) => {
   return utils.formatDelim(v.toFixed(2), config.get('decimal_separator'))
}

let interpretFlowFr = (t, wallet) => {
    let comment = (t.comment) ? t.comment : "";
    let d = t.date.toLocaleString('fr-FR')
    let sup = "";
    if (wallet === "") {
        sup = `à partir du wallet ${t.wallet} `;
    }
    let fiat = config.get('fiat_currency').toUpperCase();
    if (t.type === "purchase") {
        return {id: t._id, msg: `${d} : Achat de ${fd(t.tokens)} ${t.symbol} quoté à ${fd(t.quotation)} ${fiat} ${sup} avec ${fd(t.feeInFiat)} ${fiat} de ` +
        `frais. ${comment}`};
    } else if (t.type === "sale") {
         return {id: t._id, msg: `${d} : Vente de ${fd(t.tokens)} ${t.symbol} quoté à ${fd(t.quotation)} ${fiat} ${sup}avec ${fd(t.feeInFiat)} ${fiat} de ` +
        `frais. ${comment}`};
    } else if (t.type === "swap") {
        return {id: t._id, msg: `${d} : Echange ${sup}de ${fd(t.outputTokens)} ${t.outputSymbol} coté à ${fd(t.outputTokenQuotation)} ` +
        `${t.outputTokenQuotationCurrency} en ${fd(t.inputTokens)} ${t.inputSymbol} coté à ${fd(t.inputTokenQuotation)} ` +
        `${t.inputTokenQuotationCurrency} avec ${fd(t.fee)} ${t.feeCurrency} de frais. ${comment}`};
    } else if (t.type === "send" && t.sendWallet === wallet) {
        return {id: t._id, msg: `${d} : Envoi de ${fd(t.sendTokens)} ${t.symbol} ${sup}sur le wallet ${t.receiveWallet} ` +
        `(reçu ${fd(t.receiveTokens)}) avec ${fd(t.fee)} ${t.feeCurrency} de frais. ${comment}`};
    } else if (t.type === "send" && t.receiveWallet === wallet) {
        if (wallet === "") {
            sup = `sur le wallet ${t.wallet} `;
        }
        return {id: t._id, msg: `${d} : Réception de ${fd(t.receiveTokens)} ${t.symbol} ${sup}à partir des ${fd(t.sendTokens)} ${t.symbol} ` +
        `envoyés par le wallet ${t.sendWallet} avec ${fd(t.fee)} ${t.feeCurrency} de frais. ${comment}`};
    } else {
        // wallet not supplied
        return {id: t._id, msg: `${d} : Envoi de ${fd(t.sendTokens)} ${t.symbol} à partir du wallet ${t.sendWallet} sur le wallet ` +
            `${t.receiveWallet} (reçu ${fd(t.receiveTokens)}) avec ${fd(t.fee)} ${t.feeCurrency} de frais. ${comment}`};
    }
}

let interpretFlowEn = (t, wallet) => {
    let comment = (t.comment) ? t.comment : "";
    let d = t.date.toLocaleString('en-EN')
    let sup = "";
    if (wallet === "") {
        sup = `from wallet ${t.wallet} `;
    }
    let fiat = config.get('fiat_currency').toUpperCase();
    if (t.type === "purchase") {
        return {id: t._id, msg: `${d} : Purchase ${fd(t.tokens)} ${t.symbol} quoted at ${fd(t.quotation)} ${fiat} ${sup} with fee of ${fd(t.feeInFiat)} ${fiat}` +
            `${comment}`};
    } else if (t.type === "sale") {
        return {id: t._id, msg: `${d} : Sale ${fd(t.tokens)} ${t.symbol} quoted at ${fd(t.quotation)} ${fiat} ${sup}with fee of ${fd(t.feeInFiat)} ${fiat}` +
            `${comment}`};
    } else if (t.type === "swap") {
        return {id: t._id, msg: `${d} : Swap ${sup}of ${fd(t.outputTokens)} ${t.outputSymbol} quoted at ${fd(t.outputTokenQuotation)} ` +
            `${t.outputTokenQuotationCurrency} in ${fd(t.inputTokens)} ${t.inputSymbol} quoted at ${fd(t.inputTokenQuotation)} ` +
            `${t.inputTokenQuotationCurrency} with fee of ${fd(t.fee)} ${t.feeCurrency}. ${comment}`};
    } else if (t.type === "send" && t.sendWallet === wallet) {
        return {id: t._id, msg: `${d} : Send ${fd(t.sendTokens)} ${t.symbol} ${sup}to the wallet ${t.receiveWallet} ` +
            `(received ${fd(t.receiveTokens)}) with fee of ${fd(t.fee)} ${t.feeCurrency}. ${comment}`};
    } else if (t.type === "send" && t.receiveWallet === wallet) {
        if (wallet === "") {
            sup = `to the wallet ${t.wallet} `;
        }
        return {id: t._id, msg: `${d} : Receive ${fd(t.receiveTokens)} ${t.symbol} ${sup}from the ${fd(t.sendTokens)} ${t.symbol} ` +
            `sent by the wallet ${t.sendWallet} with fee of ${fd(t.fee)} ${t.feeCurrency}. ${comment}`};
    } else {
        // wallet not supplied
        return {id: t._id, msg: `${d} : Send ${fd(t.sendTokens)} ${t.symbol} from wallet ${t.sendWallet} to the wallet ` +
            `${t.receiveWallet} (received ${fd(t.receiveTokens)}) with fee of ${fd(t.fee)} ${t.feeCurrency}. ${comment}`};
    }
}


let getAllSymbols = async () => {
    let triple = await new MongoHelper().findAllSymbols();
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

let getAllWallets = async () => {
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
let follow = async (lang, token, wallet, sortDirection) => {
    let actions = [];
    let transactions = await getAllTransactionsOnDate(sortDirection === "A" ? 1 : -1);
    for (let i=0; i<transactions.length; i++) {
        if (await handleTransaction(transactions[i], token.toUpperCase(), wallet) === true) {
            actions.push(interpretFlow(lang, transactions[i], wallet));
        }
    }
    return actions
}


exports.follow = follow
exports.getAllSymbols = getAllSymbols
exports.getAllWallets = getAllWallets
