const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const proxy = require('express-http-proxy');

const publicPath = __dirname + '/../public/';

mongoose.connect('mongodb://mongo:27017');
const db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

//use sessions for tracking logins
app.use(session({
    secret: 'funFunFun',
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: false,
        maxAge: 86400000
    },
    store: new MongoStore({
        mongooseConnection: db
    })
}));


// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.engine('html', require('ejs').renderFile);

// include routes
const routes = require('./routes/router');
app.use('/', routes);

// serve static files from template
app.use(express.static(publicPath, {extensions:['html'], redirect : false}));

module.exports = app;