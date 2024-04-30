const config = require('config');
const MongoHelper = require('./mongo-helper');
const utils = require('../scripts/utils');

let buildDate = (date, time) => {
    let d = date.split('-');
    let t = time.split(':')
    return new Date(d[0],parseInt(d[1])-1, d[2], t[0], t[1], t[2]);
}

/* **********
   ADD
   **********/
/**
 * @param body.type Type of operation (here purchase).
 * @param body.purchaseDate Purchase date.
 * @param body.purchaseTime Purchase time.
 * @param body.purchaseTokenId Purchase token id.
 * @param body.purchaseTokenIdIco Purchase token id when not listed.
 * @param body.purchaseTokenNumber Purchase token number.
 * @param body.purchaseTokenQuotationInFiat Purchase token quotation in Fiat currency.
 * @param body.purchaseFeeInFiat Purchase fee in Fiat currency.
 * @param body.purchaseWallet Purchase wallet.
 * @param body.comment Purchase comment.
 * @param body.chainExplorerOpt Chain explorer if any.
 * @param body.txIdOpt Transaction id if any.
 * @returns {{date: Date, symbol: string, wallet: *, feeInFiat: number, tokens: number, comment, type, quotation: number}}
 */
let preparePurchaseData = (body) => {
    let tokenId = body.purchaseTokenId === '' ? body.purchaseTokenIdIco : body.purchaseTokenId;
    return {
        "type" : body.type,
        "date" : buildDate(body.purchaseDate, body.purchaseTime),
        "symbol": tokenId.toUpperCase(),
        "tokens": parseFloat(body.purchaseTokenNumber),
        "quotation": parseFloat(body.purchaseTokenQuotationInFiat),
        "feeInFiat": parseFloat(body.purchaseFeeInFiat),
        "wallet": body.purchaseWallet,
        "comment": body.comment,
        "chainExplorerOpt": body.chainExplorerOpt,
        "txIdOpt": body.txIdOpt,
    }
}

/**
 * @param body.type Type of operation (here sale).
 * @param body.saleDate Sale date.
 * @param body.saleTime Sale time.
 * @param body.saleTokenId Sale token id.
 * @param body.saleTokenIdIco Sale token id when not listed.
 * @param body.saleTokenNumber Sale token number.
 * @param body.saleTokenQuotationInFiat Sale token quotation in Fiat currency.
 * @param body.saleFeeInFiat Sale fee in Fiat currency.
 * @param body.saleWallet Sale wallet.
 * @param body.comment Purchase comment.
 * @param body.chainExplorerOpt Chain explorer if any.
 * @param body.txIdOpt Transaction id if any.
 * @returns {{date: Date, symbol: string, wallet: *, feeInFiat: number, tokens: number, comment, type, quotation: number}}
 */
let prepareSaleData = (body) => {
    let tokenId = body.saleTokenId === '' ? body.saleTokenIdIco : body.saleTokenId;
    return {
        "type" : body.type,
        "date" : buildDate(body.saleDate, body.saleTime),
        "symbol": tokenId.toUpperCase(),
        "tokens": parseFloat(body.saleTokenNumber),
        "quotation": parseFloat(body.saleTokenQuotationInFiat),
        "feeInFiat": parseFloat(body.saleFeeInFiat),
        "wallet": body.saleWallet,
        "comment": body.comment,
        "chainExplorerOpt": body.chainExplorerOpt,
        "txIdOpt": body.txIdOpt,
    }
}

/**
 *
 * @param body.type Type of operation (here swap).
 * @param body.swapDate Swap date.
 * @param body.swapTime Swap time.
 * @param body.swapOutputTokenId Swap output token id.
 * @param body.swapOutputTokenIdIco Swap output token id when not listed.
 * @param body.swapOutputTokenNumber Swap output token number.
 * @param body.swapOutputTokenQuotation Swap token quotation.
 * @param body.swapOutputTokenQuotationCurrency Swap token quotation currency.
 * @param body.swapInputTokenId Swap input token id.
 * @param body.swapInputTokenIdIco Swap input token id when not listed.
 * @param body.swapInputTokenNumber Swap input token number.
 * @param body.swapInputTokenQuotation Swap input quotation.
 * @param body.swapInputTokenQuotationCurrency Swap input quotation currency.
 * @param body.swapFee Swap fee.
 * @param body.swapFeeCurrencyOpt Swap fee currency.
 * @param body.swapWallet Swap wallet.
 * @param body.comment Purchase comment.
 * @param body.chainExplorerOpt Chain explorer if any.
 * @param body.txIdOpt Transaction id if any.
 * @returns {{date: Date, wallet: *, inputSymbol: string, inputTokenQuotation: number, outputSymbol: string, fee: number, feeCurrency: *, inputTokens: number, type, outputTokenQuotationCurrency: *, inputTokenQuotationCurrency: *, comment, outputTokenQuotation: number, outputTokens: number}}
 */
let prepareSwapData = (body) => {
    let outputTokenId = body.swapOutputTokenId === '' ? body.swapOutputTokenIdIco : body.swapOutputTokenId;
    let inputTokenId = body.swapInputTokenId === '' ? body.swapInputTokenIdIco : body.swapInputTokenId;
    return {
        "type" : body.type,
        "date" : buildDate(body.swapDate, body.swapTime),
        "outputSymbol": outputTokenId.toUpperCase(),
        "outputTokens": parseFloat(body.swapOutputTokenNumber),
        "outputTokenQuotation": parseFloat(body.swapOutputTokenQuotation),
        "outputTokenQuotationCurrency": body.swapOutputTokenQuotationCurrency,
        "inputSymbol": inputTokenId.toUpperCase(),
        "inputTokens": parseFloat(body.swapInputTokenNumber),
        "inputTokenQuotation": parseFloat(body.swapInputTokenQuotation),
        "inputTokenQuotationCurrency": body.swapInputTokenQuotationCurrency,
        "fee": parseFloat(body.swapFee),
        "feeCurrency": body.swapFeeCurrencyOpt.toUpperCase(),
        "wallet": body.swapWallet,
        "comment": body.comment,
        "chainExplorerOpt": body.chainExplorerOpt,
        "txIdOpt": body.txIdOpt
    }
}

/**
 * @param body.type Type of operation (here send/receive).
 * @param body.sendDate Send date.
 * @param body.sendTime Send time.
 * @param body.sendTokenId Send token id.
 * @param body.sendTokenIdIco Send token id when not listed.
 * @param body.sendTokenNumber Number of tokens sent.
 * @param body.sendWallet Send wallet.
 * @param body.receiveTokenNumber Number of tokens received.
 * @param body.sendTokenNumber Send token number.
 * @param body.receiveWallet Receive wallet.
 * @param body.sendFee Fee.
 * @param body.sendFeeCurrencyOpt Fee currency.
 * @param body.sendCounterpart Fiat counterpart.
 * @param body.comment Comment.
 * @param body.chainExplorerOpt Chain explorer if any.
 * @param body.txIdOpt Transaction id if any.
 * @param body
 * @returns {{date: Date, symbol: string, sendTokens: number, receiveWallet: (number|*), fee: number, feeCurrency: *, feeInFiat: number, comment, type, sendWallet: (number|*), receiveTokens: number}}
 */
let prepareSendData = (body) => {
    let tokenId = body.sendTokenId === '' ? body.sendTokenIdIco : body.sendTokenId;
    return {
        "type" : body.type,
        "date" : buildDate(body.sendDate, body.sendTime),
        "symbol": tokenId.toUpperCase(),
        "sendTokens": parseFloat(body.sendTokenNumber),
        "sendWallet": body.sendWallet,
        "receiveTokens": parseFloat(body.receiveTokenNumber),
        "receiveWallet": body.receiveWallet,
        "fee": parseFloat(body.sendFee),
        "feeCurrency": body.sendFeeCurrencyOpt.toUpperCase(),
        "feeInFiat": parseFloat(body.sendCounterpart),
        "comment": body.comment,
        "chainExplorerOpt": body.chainExplorerOpt,
        "txIdOpt": body.txIdOpt,
    }
}

let prepareData = (body) => {
    if (body.type === "purchase") {
        return preparePurchaseData(body);
    } else if (body.type === "sale") {
        return prepareSaleData(body);
    } else if (body.type === "swap") {
        return prepareSwapData(body);
    } else if (body.type === "send") {
        return prepareSendData(body);
    }
}

async function handleTransactionInsert(body) {
    let jsonObj = prepareData(body);
    return await new MongoHelper().insertTransaction(jsonObj);
}

/* **********
   DELETE
   **********/
let handleTransactionSuppression = async (id) => {
    await new MongoHelper().deleteTransaction(id);
    return "ok";
}

/* **********
   UPDATE
   **********/
let getBodyValuesForCreation = () => {
    return {
        type: "purchase",
        purchaseDate: "",
        purchaseTime: "",
        purchaseTokenId: "",
        purchaseTokenNumber: "",
        purchaseTokenQuotationInFiat: "",
        purchaseFeeInFiat: "",
        purchaseWallet: "",
        saleDate: "",
        saleTime: "",
        saleTokenId: "",
        saleTokenNumber: "",
        saleTokenQuotationInFiat: "",
        saleFeeInFiat: "",
        saleWallet: "",
        swapDate: "",
        swapTime: "",
        swapOutputTokenId: "",
        swapOutputTokenNumber: "",
        swapOutputTokenQuotation: "",
        swapOutputTokenQuotationCurrency: "",
        swapInputTokenId: "",
        swapInputTokenNumber: "",
        swapInputTokenQuotation: "",
        swapInputTokenQuotationCurrency: "",
        swapFee: "",
        swapFeeCurrencyOpt: "",
        swapWallet: "",
        sendDate: "",
        sendTime: "",
        sendTokenId: "",
        sendTokenNumber: "",
        sendWallet: "",
        receiveTokenNumber: "",
        receiveWallet: "",
        sendFee: "",
        sendFeeCurrencyOpt: "",
        sendCounterpart: "",
        comment: "",
        chainExplorerOpt: "",
        txIdOpt: ""
    }
}

let updateFieldForTransactionUpdatePurchase = (t, b) => {
    b.type = "purchase";
    b.purchaseDate = utils.getDateFromDate(t.date);
    b.purchaseTime = utils.getTimeFromDate(t.date);
    b.purchaseTokenId = t.symbol;
    b.purchaseTokenNumber = t.tokens;
    b.purchaseTokenQuotationInFiat = t.quotation;
    b.purchaseFeeInFiat = t.feeInFiat;
    b.purchaseWallet = t.wallet;
    b.comment= t.comment;
    b.chainExplorerOpt = t.chainExplorerOpt;
    b.txIdOpt = t.txIdOpt;
    return b;
}

let updateFieldForTransactionUpdateSale = (t, b) => {
    b.type = "sale";
    b.saleDate = utils.getDateFromDate(t.date);
    b.saleTime = utils.getTimeFromDate(t.date);
    b.saleTokenId = t.symbol;
    b.saleTokenNumber = t.tokens;
    b.saleTokenQuotationInFiat = t.quotation;
    b.saleFeeInFiat = t.feeInFiat;
    b.saleWallet = t.wallet;
    b.comment= t.comment;
    b.chainExplorerOpt = t.chainExplorerOpt;
    b.txIdOpt = t.txIdOpt;
    return b;
}

let updateFieldForTransactionUpdateSwap = (t, b) => {
    b.type = "swap";
    b.swapDate = utils.getDateFromDate(t.date);
    b.swapTime= utils.getTimeFromDate(t.date);
    b.swapOutputTokenId= t.outputSymbol;
    b.swapOutputTokenNumber= t.outputTokens;
    b.swapOutputTokenQuotation= t.outputTokenQuotation;
    b.swapOutputTokenQuotationCurrency= t.outputTokenQuotationCurrency;
    b.swapInputTokenId= t.inputSymbol;
    b.swapInputTokenNumber= t.inputTokens;
    b.swapInputTokenQuotation= t.inputTokenQuotation;
    b.swapInputTokenQuotationCurrency= t.inputTokenQuotationCurrency;
    b.swapFee= t.fee;
    b.swapFeeCurrencyOpt= t.feeCurrency.toUpperCase();
    b.swapWallet= t.wallet;
    b.comment= t.comment;
    b.chainExplorerOpt = t.chainExplorerOpt;
    b.txIdOpt = t.txIdOpt;
    return b;
}

let updateFieldForTransactionUpdateSend = (t, b) => {
    b.type = "send";
    b.sendDate = utils.getDateFromDate(t.date);
    b.sendTime = utils.getTimeFromDate(t.date);
    b.sendTokenId = t.symbol;
    b.sendTokenNumber = t.sendTokens;
    b.sendWallet = t.sendWallet;
    b.receiveTokenNumber = t.receiveTokens;
    b.receiveWallet = t.receiveWallet;
    b.sendFee= t.fee;
    b.sendFeeCurrencyOpt = t.feeCurrency.toUpperCase();
    b.sendCounterpart= t.feeInFiat;
    b.comment = t.comment;
    b.chainExplorerOpt = t.chainExplorerOpt;
    b.txIdOpt = t.txIdOpt;
    return b;
}
let updateFieldForTransactionUpdate = (transaction, dataForBody) => {
    if (transaction.type === "purchase") {
        return updateFieldForTransactionUpdatePurchase(transaction, dataForBody);
    } else  if (transaction.type === "sale") {
        return updateFieldForTransactionUpdateSale(transaction, dataForBody);
    } else if (transaction.type === "swap") {
        return updateFieldForTransactionUpdateSwap(transaction, dataForBody);
    }  else {
        return updateFieldForTransactionUpdateSend(transaction, dataForBody);
    }
}
let prepareTransactionUpdate = async (id, sortDirection, token, wallet, lang) => {
    let transaction = await new MongoHelper().findTransaction(id);
    let initData = getBodyValuesForCreation();
    initData = updateFieldForTransactionUpdate(transaction, initData)
    initData.trid = id;
    initData.fiat_symbol = config.get('fiat_symbol');
    initData.sortDirection = sortDirection;
    initData.token = token;
    initData.wallet = wallet;
    initData.lang = lang;
    initData.chainExplorers = config.get('chain_explorers');
    return initData;
}

let prepareTransactionCreation = async () => {
    let initData = getBodyValuesForCreation();
    initData.trid = "";
    initData.fiat_symbol = config.get('fiat_symbol');
    initData.sortDirection = "";
    initData.token = "";
    initData.wallet = "";
    initData.lang = "";
    initData.chainExplorers = config.get('chain_explorers');
    return initData;
}

let handleTransactionUpdate = async (transactionId, body) => {
    let jsonObj = prepareData(body);
    return await new MongoHelper().updateTransaction(transactionId, jsonObj);

}
exports.handleTransactionInsert = handleTransactionInsert
exports.handleTransactionUpdate = handleTransactionUpdate
exports.handleTransactionSuppression = handleTransactionSuppression
exports.prepareTransactionUpdate = prepareTransactionUpdate
exports.prepareTransactionCreation = prepareTransactionCreation
