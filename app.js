require('dotenv').config()

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const pusher = require('./routes/push')


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const pushRouter = require('./routes/push');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notify', pushRouter);


module.exports = app;