const config = require('config');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const MongoHelper = require('./scripts/mongo-helper');
const favicon = require('serve-favicon');
const router = require('./routes/router');

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// catch 404 and forward to error handler
app.use(function(request, response, next) {
  next(createError(404));
});

new MongoHelper().walletsInitialize().then( (nb) => {
  console.log(`${nb} wallets initialisées`)
})

// error handler
app.use(function(error, request, response, next) {
  // set locals, only providing error in development
  response.locals.message = error.message;
  response.locals.error = request.app.get('env') === 'development' ? error : {};

  // render the error page
  response.status(error.status || 500);
  response.render('error');
});

app.listen(config.get('server_port'),
    () => console.log(`tracking app is listening on port ${config.get('server_port')}.`));

module.exports = app;
