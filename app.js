const config = require('config');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const MongoHelper = require('./scripts/mongo-helper');
const favicon = require('serve-favicon');
const router = require('./routes/router');
const {buildIconsDir} = require('./scripts/utils')

const app = express()
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .use(logger('dev'))
    .use(express.json())
    .use(express.urlencoded({extended: false}))
    .use(cookieParser())
    .use(express.static(path.join(__dirname, 'public')))
    .use('/', router)
    .use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
    .use((request, response, next) => {
        next(createError(404));
    })
    .use((error, request, response, next) => {
        response.locals.message = error.message;
        response.locals.error = request.app.get('env') === 'development' ? error : {};
        response.status(error.status || 500);
        response.render('error');
    });

buildIconsDir().then(() => {
    new MongoHelper().walletsInitialize().then((nb) => {
        console.log(`${nb} wallets initialisées`)
    })
})

app.listen(config.get('server_port'),
    () => console.log(`tracking app is listening on port ${config.get('server_port')}.`));

module.exports = app;
