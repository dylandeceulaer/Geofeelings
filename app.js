var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var routes = require('./routes/index');
var profile = require('./routes/profile');
var apiUsers = require('./routes/api/users');
var apiProfile = require('./routes/api/profile');
var apiEvent = require('./routes/api/event');
var apiChat = require('./routes/api/chat');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(require('express-session')({
    secret: 'C7KjALqEYLnef3SHKR3QnYWt',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api/users', apiUsers);
app.use('/api/profile', apiProfile);
app.use('/api/event', apiEvent);
app.use('/api/chat', apiChat);
app.use('/profile', profile);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// passport config
var Account = require('./data/models/user');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


//app is default een EventEmitter
app.on("appMessage" , function (data) {
    //console.log("data " , data)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
