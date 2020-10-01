const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.set("view engine", "ejs");

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// DATABASES

// Users database, global object called users which will be used to store and access the users in the app
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


// HELPER FUNCTIONS:

//returns a string of 6 random alphanumeric characters
const generateRandomString = () => { 
  return Math.random().toString(36).substring(2, 8);
};

const urlsForUser = (userID) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      urls[shortURL] = urlDatabase[shortURL];
    }
   }
   return urls;
};

const getUserByEmail = (email, database) => {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
};

// ALL GET ROUTES:

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");	 
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }
  res.redirect(`/urls/${shortURL}`); 
});

// GET -> URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies['user_id']),
    user: users[req.cookies['user_id']]
  };
  res.render('urls_index', templateVars);
});

// GET -> new
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

// GET -> shortURL
app.get("/urls/:shortURL", (req, res) => { 
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies['user_id']] };
  
  if (urlDatabase[req.params.shortURL].userID !== req.cookies['user_id']) {
    res.send("You are not authorized");
    return;
  } else  {
  res.render("urls_show", templateVars);
  }
});

// GET -> short URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// GET -> login endpoint, which returns the template login
app.get('/login', (req, res) => { 
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render('login', templateVars);
});

// GET -> register endpoint, which returns the template register
app.get('/register', (req, res) => { 
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render('register', templateVars);
});

// ALL POST ROUTES:

// POST-> URLS
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

// POST -> short URL 
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

// POST -> removes a URL resource: POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// POST -> handle login 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
      return res.status(400).send("<h1>400 Bad Request</h1><p>Please fill up all fields.</p>");
  } else {
    for (const key in users) {
      if (users[key].email === email && users[key].password === password) {
        res.cookie("user_id", key);
        res.redirect('/urls');
      }
    }
    res.status(403).send("<h1>Email and Password correct</h>");
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
    password
  };
  console.log(users)
  req.cookies['user_id'] = id;
  return res.redirect('/urls');
});

// POST -> logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});