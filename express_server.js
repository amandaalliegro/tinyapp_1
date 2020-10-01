const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// hashs the password
const bcrypt = require('bcrypt');

// encrypts the cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['abacaxi', 'melancia'],  
}));

// access to helper functions
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

// access to databases
const {urlDatabase, users } = require('./databases');

//This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



// ---- >> ALL GET ROUTES << ----

// GET -> URLs, pass the URL data to our template.
app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
  
    urls: urlsForUser(user, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

// GET -> new
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

// GET -> shortURL
app.get("/urls/:shortURL", (req, res) => { 
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.send("You are not authorized");
    return;
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
  
});

// GET -> short URL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// GET -> login endpoint, which returns the template login
app.get('/login', (req, res) => { 
  const templateVars = { user: users[req.session.user_id]};
  res.render('login', templateVars);
});

// GET -> register endpoint, which returns the template register
app.get('/register', (req, res) => { 
  const templateVars = { user: users[req.session.user_id]};
  res.render('register', templateVars);
});


// --- >> ALL POST ROUTES << ---

// POST-> URLS
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

// POST -> short URL 
app.post('/urls/:shortURL', (req, res) => { 
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  //
  if (longURL.match(/^(https:\/\/|http:\/\/)/)) {
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
  } else {
    urlDatabase[shortURL] = {
      longURL :`http://www.${longURL}`,
      userID
    }
  }
  res.redirect(`/urls/${shortURL}`);
});

// POST -> removes a URL resource: POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const user = users[userID];
  const urls = urlsForUser(user, urlDatabase);
  if (Object.keys(urls).includes(shortURL)) {
  delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

// POST -> handle login 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // returns an error if the user do not provide email and password
  if (!email || !password) {
    return res.status(400).send("<h1>400 Bad Request</h1><p>Please fill up all fields.</p>");
  } else {
    const user = getUserByEmail(email, users);
    // compare password with hash password value
    const hashss = bcrypt.compareSync(password, user.password);
    // user redirected to urls page and has access to create new URL and their own URL library 
    if (hashss) {
      req.session.user_id = user.id
      res.redirect('/urls');
      // returns an error if email/password doesnt match
    } else {
      res.status(403).send("<h1>Email or Password is not correct</h>");
    }
  }
});

// POST -> register endpoint, which returns the template register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  // extract the info from the form
  const { email, password } = req.body;
  // check if all fields are filled
  if (email === "" || password === '') {
    return res.status(400).send("<h1>400 Bad Request</h1><p>Please fill up all fields.</p>");
  }
  // check if the user is not already in the database
    if (getUserByEmail(email, users)) {
      return res.status(400).send("<h1>400 Bad Request</h1><p>User is already registered. Please, make sure you are registering a new user.</p>");
    }
    // if user doesnt exists yet, it'ok to add the user to the database
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = id;
  return res.redirect('/urls');
});


// POST -> logout
app.post('/logout', (req, res) => {
  // clear the cookies
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect('/login');
});



app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

