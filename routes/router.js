const config = require('config');
const express = require('express');
const router = express.Router();
const transactionHandler = require('../scripts/transactions');
const portFolio = require('../scripts/portfolio');
const followTransactions = require('../scripts/followTransactions')
const cryptos = require('../scripts/cryptos')
const wallets = require('../scripts/wallets')
const survey = require('../scripts/survey')
const {prepareTransactionCreation, prepareTransactionUpdate} = require("../scripts/transactions");

/* GET home page. */
router
    /* View rending */
    .get('/', function (request, response, next) {
        response.render(config.get('language')+'/index', {title: 'Express'});
    })
    .get('/home', function (request, response, next) {
        response.render(config.get('language')+'/index', {title: 'Express'});
    })
    .get('/addTransaction', function (request, response, next) {
        prepareTransactionCreation().then( (options) => {
            response.render(config.get('language')+'/addOrUpdateTransaction', options);
        })
    })
    .get('/updateTransaction', function (request, response, next) {
        prepareTransactionUpdate(request.query.id, request.query.sortDirection,
            request.query.token, request.query.wallet, request.query.lang).then( (options) => {
            response.render(config.get('language')+'/addOrUpdateTransaction', options);
        })
    })
    .get('/portfolio', function (request, response, next) {
        response.render(config.get('language')+'/portfolio', {fiat_symbol: config.get('fiat_symbol'), refresh: config.get('refresh_in_seconds')});
    })
    .get('/evolution', function (request, response, next) {
        response.render(config.get('language')+'/evolution', {fiat_symbol: config.get('fiat_symbol'), refresh: config.get('refresh_in_seconds')});
    })
    .get('/followTransactions', function (request, response, next) {
        if (request.query.lang !== undefined && request.query.lang !== '') {
            response.render(request.query.lang + '/followTransactions', {
                sortDirection: request.query.sortDirection,
                token: request.query.token,
                wallet: request.query.wallet
            });
        } else {
            response.render(config.get('language') + '/followTransactions', {
                sortDirection: "",
                token: "",
                wallet: ""
            });
        }
    })
    .get('/cryptos', function (request, response, next) {
        response.render(config.get('language')+'/cryptos', {});
    })
    .get('/wallets', function (request, response, next) {
        response.render(config.get('language')+'/wallets', {});
    })
    .get('/survey', function (request, response, next) {
        response.render(config.get('language')+'/survey', {fiat_symbol: config.get('fiat_symbol'), refresh: config.get('refresh_in_seconds')});
    })
    /* Ajax calls */
    .post('/api/add-transaction', function (request, response, next) {
        console.log("request body", request.body);
        transactionHandler.handleTransactionInsert(request.body).then((data) => {
            response.send(data);
        })
    })
    .put('/api/update-transaction', function (request, response, next) {
        console.log("request body", request.body);
        transactionHandler.handleTransactionUpdate(request.query.id, request.body).then((data) => {
            response.send(data);
        })
    })
    .delete('/api/delete-transaction', function (request, response, next) {
        transactionHandler.handleTransactionSuppression(request.query.id).then( (data) => {
            response.send("ok")
        })
    })
    .get('/api/portfolio', function (request, response, next) {
        portFolio.summary().then((data) => {
            response.send(data);
        })
    })
    .get('/api/evolution', function (request, response, next) {
        portFolio.evolution(request.query.sortField, request.query.sortDirection).then((data) => {
            response.send(JSON.stringify(data));
        })
    })
    .get('/api/follow-token-on-wallet', function (request, response, next) {
        followTransactions.follow(request.query.lang, request.query.token, request.query.wallet, request.query.sortDirection).then((data) => {
            response.send(data);
        })
    })
    .get('/api/get-all-symbols', function (request, response, next) {
        followTransactions.getAllSymbols(request.query.token, request.query.wallet).then((data) => {
            response.send(data);
        })
    })
    .get('/api/get-all-wallets', function (request, response, next) {
        followTransactions.getAllWallets(request.query.token, request.query.wallet).then((data) => {
            response.send(data);
        })
    })
    .get('/api/get-my-cryptos', function (request, response, next) {
        cryptos.getMyCryptos(request.query.token, request.query.wallet).then((data) => {
            response.send(data);
        })
    })
    .get('/api/get-available-cryptos', function (request, response, next) {
        cryptos.getAvailableCryptos(request.query.token, request.query.wallet).then((data) => {
            response.send(data);
        })
    })
    .post('/api/add-to-my-cryptos', function (request, response, next) {
        cryptos.addToMyCrypto(request.body).then((data) => {
            response.sendStatus(201);
        }).catch((error) => {
            response.send(error);
        })
    })
    .delete('/api/delete-from-my-cryptos', function (request, response, next) {
        let crypto = { "id": request.query.id, "symbol": request.query.symbol, "name": request.query.name, }
        cryptos.removeFromMyCrypto(crypto).then((data) => {
            response.sendStatus(200);
        }).catch((error) => {
            response.send(error);
        })
    })
    .post('/api/add-wallet', function (request, response, next) {
        wallets.addWallet(request, response);
    })
    .get('/api/get-wallets-name', function (request, response, next) {
        wallets.getWallets().then((data) => {
            response.send(data);
        })
    })
    .post('/api/alert', function (request, response, next) {
        portFolio.addAlert(request.body).then((res) => {
            response.send({});
        })
    })
    .delete('/api/alert', function (request, response, next) {
        portFolio.removeAlert(request.query.token).then((res) => {
            response.send({});

        })
    })
    .post('/api/alert-survey', function (request, response, next) {
        survey.addAlert(request.body).then((res) => {
            response.send({});
        })
    })
    .delete('/api/alert-survey', function (request, response, next) {
        survey.removeAlert(request.query.token).then((res) => {
            response.send({});
        })
    })
    .get('/api/evolution-survey', function (request, response, next) {
        survey.evolution(request.query.sortField, request.query.sortDirection).then((data) => {
            response.send(JSON.stringify(data));
        })
    })
    .post('/api/add-to-cryptos-survey', function (request, response, next) {
        survey.addCrypto(request.body).then((res) => {
            response.send({});
        })
    })
    .delete('/api/delete-crypto-survey', function (request, response, next) {
        survey.removeCrypto(request.query.id).then((res) => {
            response.send({});
        })
    })

module.exports = router;
