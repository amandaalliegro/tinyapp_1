const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// HELPER FUNCTIONS:
//returns a string of 6 random alphanumeric characters
const generateRandomString = () => { 
  return Math.random().toString(36).substring(2, 8);
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// Users database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
// Add a POST route to handle /login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === '') {    
      return res.status(400).send("<h1>400 Bad Request</h1><p>Please fill up all fields.</p>");
      } else {
    for (const key in users) {
      if (users[key].email === email) {
        res.cookie("user_id", key);
        return res.redirect('/urls');
      } else {
        return res.status(400).send("<h1> email not registered</h>")
      }
    }
  }	  
});


// GET /register endpoint, which returns the template register
app.get('/register', (req, res) => { 
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render('register', templateVars);
});
// POST /register endpoint, which returns the template register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  
  if (email === "" || password === '') {    
    return res.status(400).send("<h1>400 Bad Request</h1><p>Please fill up all fields.</p>");
    } 
  for (const key in users) {
    console.log("user emails", users[key].email)
    console.log("email from body", email)
    if (users[key].email === email) {
      return res.status(400).send("<h1>400 Bad Request </h1><p>User is already registered. Please, make sure you are registering a new user.</p>");
    }   
  }
  users[id] = { id, email, password };
  res.cookie("user_id", id);
  return res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
  
});
// Add a POST route that updates a URL resource;
app.post('/urls/:shortURL', (req, res) => { 
  const shortURL = req.params.shortURL;
  const longURl = req.body.longURL;
  if (longURl.match(/^(https:\/\/|http:\/\/)/)) {
    urlDatabase[shortURL] = longURl;
  } else {
    urlDatabase[shortURL] = `http://www.${longURl}`;
  }
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  res.send("Ok");         	  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});