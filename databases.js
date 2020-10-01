const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}))
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['abacaxi', 'melancia'],  
}));


// DATABASES

// Users database, global object called users which will be used to store and access the users in the app
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}
// keep track of all the URLs and their shortened forms, this is the data we'll want to show on the URLs page
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

module.exports = { urlDatabase, users }