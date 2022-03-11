require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const { mainModule } = require('process');
const encrypt = require('mongoose-encryption');
const md5 = require('md5');
const bcrypt = require('bcrypt');
const app = express();


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb://localhost:27017/Secrets');

const saltRounds = 10;
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Encryption using dotenv
// var secret = process.env.SECRET;
// userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password'] });

const User = mongoose.model("User",userSchema);

app.get('/', function(req,res){
    res.render('home');
});

app.route('/register')
    .get(function(req,res){
        res.render('register');
    })
    .post(function(req,res){
        bcrypt.hash(req.body.password, saltRounds, function(err, hashedpassword) {
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
        });
    })
;

app.route('/login')
    .get( function(req,res){
        res.render('login');
    })
    .post(function(req,res){
        User.findOne({email:req.body.username},function(err,foundUser){
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
        });
    })
;


app.get('/submit', function(req,res){
    res.render('home');
});
app.listen('3000', function() {
    console.log('Server started at port 3000');
});
