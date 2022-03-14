require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const { mainModule } = require('process');
const encrypt = require('mongoose-encryption');
const md5 = require('md5');
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const app = express();


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: 'This is our little secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/Secrets');

const saltRounds = 10;
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});


// Encryption using dotenv
// var secret = process.env.SECRET;
// userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password'] });

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req,res){
    res.render('home');
});

app.route('/register')
    .get(function(req,res){
        res.render('register');
    })
    .post(function(req,res){
        User.register({username:req.body.username}, req.body.password, function(err, user) {
            if (err) { 
                console.log(err); 
                res.redirect('/register');
            }
            else{
                passport.authenticate('local')(req,res, function() {
                 res.redirect('/secrets');
                });
            }
            
        });
        // Authentication using bcrypt 
        /*bcrypt.hash(req.body.password, saltRounds, function(err, hashedpassword) {
            if(!err){
                const newUser = new User({
                 email: req.body.username,
                 password: hashedpassword
                });
                newUser.save(function(err){
                    if(!err){
                    res.render('secrets');
                     }
                     else{
                     console.log(err);
                     }
                });
            }
        });*/
    })
;

app.route('/login')
    .get( function(req,res){
        res.render('login');
    })
    .post(function(req,res){
        const user = new User(
            {
                username : req.body.username,
                password: req.body.password
            }
        );

        req.login(user, function(err){
            if(err){
                console.log(err);
            }
            else{
                passport.authenticate('local')(req,res, function() {
                    res.redirect('/secrets');
                });
            }
        });

        /*User.findOne({email:req.body.username},function(err,foundUser){
            if(!err){
                if(foundUser){
                    bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
                        if(result===true){
                            res.render('secrets');
                        }
                    });
                    
                }
            }
            else{
                console.log(err);
            }
        });*/
    })
;


app.get('/submit', function(req,res){
    res.render('home');
});

app.get('/secrets', function(req,res){
    if(req.isAuthenticated()){
        res.render('secrets');
    }
    else{
        res.redirect('/login');
    }
});

app.get('/logout', function(req,res){
    req.logout();
    res.redirect('/');
});

app.listen('3000', function() {
    console.log('Server started at port 3000');
});
