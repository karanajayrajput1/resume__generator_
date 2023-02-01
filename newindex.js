//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const axios = require("axios");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const path = require("path");
const assert = require("assert");



const app = express();
app.use("/images", express.static('image'));
app.use("/css", express.static('css'));
app.use("/js", express.static('js'));
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true }));
app.use(session({
    secret: "SECRET is efjdkf",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://karan_admin:Kar2003@cluster0.oq0g1g1.mongodb.net/userDB", {useNewUrlParser: true});

mongoose.set('strictQuery', true);

// Schema

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  formData: {
    name: String,
    introduction: String,
    designation: String,
    email: String,
    contact: Number,
    address: String,
    linkedin: String
  },
  edudata: {
    gcollege: String,
    gduration: String,
    glocation: String,
    twcollege: String,
    twduration: String,
    twlocation: String,
    tecollege: String,
    teduration: String,
    telocation: String
  },
  workexp: {
    fcompany: String,
    fduration: String,
    fdesignation: String,
    fdescription: String,
    company2: String,
    duration2: String,
    designation2: String,
    description2: String,
    company3: String,
    duration3: String,
    designation3: String,
    description3: String
  },
  projectinfo: {
    skillsdescription: String,
    project1: String,
    projectduration1: String,
    projectdescription1: String,
    project2: String,
    projectduration2: String,
    projectdescription2: String,

  }
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.email});
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));  


app.get("/",function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.get("/login", function(req, res){
  if (req.isAuthenticated()){
  res.sendFile(__dirname + '/home.html');
  } else {
    res.redirect("/");
  }
});

app.get("/register", function(req, res){
  if (req.isAuthenticated()){
  res.sendFile(__dirname + '/home.html');
  } else {
    res.redirect("/");
  }
});



app.get("/auth/google", 
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.sendFile(__dirname+"/home.html")
  });

  app.get("/personal", function(req, res){
    if (req.isAuthenticated()){
    res.sendFile(__dirname + '/personal.html');
    } else {
      res.redirect("/");
    }
  });

  app.get("/education", function(req, res){
    if (req.isAuthenticated()){
    res.sendFile(__dirname + '/education.html');
    } else {
      res.redirect("/");
    }
  });

  app.get("/work", function(req, res){
    if (req.isAuthenticated()){
    res.sendFile(__dirname + '/work.html');
    } else {
      res.redirect("/");
    }
  });

  app.get("/project", function(req, res){
    if (req.isAuthenticated()){
    res.sendFile(__dirname + '/project.html');
    } else {
      res.redirect("/");
    }
  });

  app.get("/resumes", function(req, res){
    if (req.isAuthenticated()){
    res.sendFile(__dirname + '/resumes.html');
    } else {
      res.redirect("/");
    }
  });


  let foundUser;

  app.get("/template1", function(req, res){
    User.findById(req.user.id, function(err, foundUser, response){
      if (err) {
        console.log(err);
      }
      else {
        if (foundUser) {
          res.render("template1", {foundUser});
        }
      }
    });
  });


  app.get("/template2", function(req, res){
    User.findById(req.user.id, function(err, foundUser, response){
      if (err) {
        console.log(err);
      }
      else {
        if (foundUser) {
          res.render("resume", {foundUser});
        }
      }
    });
  });

  app.get("/template3", function(req, res){
    User.findById(req.user.id, function(err, foundUser, response){
      if (err) {
        console.log(err);
      }
      else {
        if (foundUser) {
          res.render("template3", {foundUser});
        }
      }
    });
  });

  app.get("/template4", function(req, res){
    User.findById(req.user.id, function(err, foundUser, response){
      if (err) {
        console.log(err);
      }
      else {
        if (foundUser) {
          res.render("template4", {foundUser});
        }
      }
    });
  });



app.get("/home", function(req, res){
  User.find({"secret": {$ne: null}}, function(err, foundUser){
    if (err){
      console.log(err);
    } else {
      if (foundUser) {
        res.sendFile(__dirname+ '/src/home.html', {usersWithSecrets: foundUser});
      }
    }
  });
});



app.post("/education", function(req, res){
  const formData = req.body;
  const name = req.body.name;
  const designation = req.body.designation;
  const introduction = req.body.introduction;
  const email = req.body.email;
  const contact = req.body.contact;
  const address = req.body.address;
  const linkedin = req.body.linkedin;

  User.findById(req.user.id,{useCreateIndex: true}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.formData = formData;
        foundUser.save(function(){
          res.sendFile(__dirname + "/education.html");
        });
      }
    }
  });
});

app.post("/workexperience", function(req, res){
  const edudata = req.body;
  const gcollege = req.body.gcollege;
  const gduration = req.body.gduration;
  const glocation = req.body.glocation;
  const twcollege = req.body.twcollege;
  const twduration = req.body.twduration;
  const twlocation = req.body.twlocation;
  const tecollege = req.body.tecollege;
  const teduration = req.body.teduration;
  const telocation = req.body.telocation;

  User.findById(req.user.id,{useCreateIndex: true}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.edudata = edudata;
        foundUser.save(function(){
          res.sendFile(__dirname + "/work.html");
        });
      }
    }
  });
});

app.post("/project", function(req, res){
  const workexp = req.body;
  const fcompany = req.body.fcompany;
  const fduration = req.body.fduration;
  const fdesignation = req.body.fdesignation;
  const fdescription = req.body.fdescription;
  const company2 = req.body.company2;
  const duration2 = req.body.duration2;
  const designation2 = req.body.designation2;
  const description2 = req.body.description2;
  const company3 = req.body.company3;
  const duration3 = req.body.duration3;
  const designation3 = req.body.designation3;
  const description3 = req.body.description3;

  User.findById(req.user.id,{useCreateIndex: true}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.workexp = workexp;
        foundUser.save(function(){
          res.sendFile(__dirname + "/project.html");
        });
      }
    }
  });
});

app.post("/resumes", function(req, res){
  const projectinfo = req.body;
  const skillsdescription = req.body.skillsdescription;
  const project1 = req.body.project1;
  const projectduration1 = req.body.projectduration1;
  const projectdescription1 = req.body.projectdescription1;
  const project2 = req.body.project2;
  const projectduration2 = req.body.projectduration2;
  const projectdescription2 = req.body.projectdescription2;


  User.findById(req.user.id,{useCreateIndex: true}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.projectinfo = projectinfo;
        foundUser.save(function(){
          res.sendFile(__dirname + "/resumes.html");
        });
      }
    }
  });
});


/* Logout */
  
app.get("/logout", function(req, res){
    req.logout(function(err){
        if (err) {
            return next(err);
        }
    });
    res.redirect("/");
    console.log("LOGOUTT");
});

/* Register */

app.post("/register", function(req, res){

    User.register({ username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.sendFile(__dirname+ '/');

        }
        else {
            passport.authenticate("local")(req, res, function(){
              res.sendFile(__dirname+ '/home.html');
            });
        }
    });
    
});
/* Login */
app.post("/login", function(req, res){

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.sendFile(__dirname+ "/home.html");
        });
      }
    });
  
  });
  
/* Hosting Details */
const port = process.env.PORT || 3000

app.listen(port, function(){
    console.log("Server Started");
});