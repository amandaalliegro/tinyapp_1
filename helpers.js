// HELPER FUNCTIONS:

// returns a string of 6 random alphanumeric characters;
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// generates an object for all the urls generated by an user;
const urlsForUser = (user, urlDatabase) => {
  const urls = {};
    
  for (const shortURL in urlDatabase) {
    if (user.id === urlDatabase[shortURL].userID) {
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


module.exports = { generateRandomString, urlsForUser, getUserByEmail};