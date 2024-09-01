const config = require('config'),
    createError = require('http-errors'),
    express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    MongoHelper = require('./scripts/classes/mongo-helper'),
    favicon = require('serve-favicon'),
    router = require('./routes/router'),
    {buildIconsDir} = require('./scripts/utils');

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
        response.locals.error = error;
        response.status(error.status || 500);
        response.render('error');
    });

process.env.TZ = config.get('timezone');

buildIconsDir().then(() => {
    new MongoHelper().walletsInitialize().then((nb) => {
        console.log(`${nb} wallets initialisées`)
    })
})

app.listen(config.get('server_port'),
    () => console.log(`dashboard app is listening on port ${config.get('server_port')}.`));

module.exports = app;
