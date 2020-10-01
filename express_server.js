const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['abacaxi', 'melancia'],  
}));

const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers')
const users = require('./databases');
const urlDatabase = require('./databases');

//This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs");

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



// -->> ALL GET ROUTES:

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");	 
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }
  res.redirect(`/urls/${shortURL}`); 
});

// GET -> URLs, pass the URL data to our template.
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
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
    console.log(urlDatabase)
  console.log(req.session.user_id)
  console.log(urlDatabase[req.params.shortURL])
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


// -->> ALL POST ROUTES:

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
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// POST -> handle login 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("<h1>400 Bad Request</h1><p>Please fill up all fields.</p>");
  } else {
    const user = getUserByEmail(email, users);
    // compare password with hash password value
    const hashss = bcrypt.compareSync(password, user.password); 
    if (hashss) {
      req.session.user_id = user.id
      res.redirect('/urls');
    } else {
      res.status(403).send("<h1>Email or Password is not correct</h>");
    }
  }
});

// POST -> register endpoint, which returns the template register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  
  if (email === "" || password === '') {
    return res.status(400).send("<h1>400 Bad Request</h1><p>Please fill up all fields.</p>");
  }
    if (getUserByEmail(email, users)) {
      return res.status(400).send("<h1>400 Bad Request</h1><p>User is already registered. Please, make sure you are registering a new user.</p>");
    }
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  console.log(users)
  req.session.user_id = id;
  return res.redirect('/urls');
});


// POST -> logout
app.post('/logout', (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect('/login');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

