var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var config = require('./config');

/* Database connection */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/RBH');
var db = mongoose.connection;
db.once('open', function() {
  console.log("Connection to database successfull :)");
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Config passport */
var Hyrulean = require('./models/hyrulean');
/* Creating admin user if it doesn't exists yet */
Hyrulean.findOne({ 'technologicalAdress': 'Admin' }, function (err, admin) {
  if (err) 
    return res.json({status:400, err});
  if(!admin){
    var admin = new Hyrulean({
      username: "Admin",
      technologicalAdress: "Admin",
      password: "Admin",
      isAdmin: true
    });
    Hyrulean.register(
      admin,
      "Admin", 
      function(err) {
          if(err){
              console.error(err);
              return res.json({status:400, err, admin});
          }
          console.log("Admin created sucessfully.")
      }
    );
  } else {
    console.log("Admin account already exists.");
  }
})

app.use(passport.initialize());
passport.use(new localStrategy(Hyrulean.authenticate()));
passport.serializeUser(Hyrulean.serializeUser());
passport.deserializeUser(Hyrulean.deserializeUser());

/* Routes */
var front = require('./routes/front');
app.use('/', front);
var hyruleans = require('./routes/hyruleansRoute');
app.use('/hyruleans', hyruleans);
var counsellors = require('./routes/counsellorsRoute');
app.use('/counsellors', counsellors);
var pouches = require('./routes/pouchesRoute');
app.use('/pouches', pouches);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
