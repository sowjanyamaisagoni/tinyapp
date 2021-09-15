const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const app = express();

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = () => {
  const output = [];
  // We want it to always be 6 digits long, arbitrarily chosen.
  for (let i = 0; i < 6; i++) {
    // Generates new alphanumeric case-sensitive char
    const newChar = Math.floor(Math.random() * 62);
    let finalIndex;
    if (newChar < 10) {
      // 0-9 start at index 48
      finalIndex = newChar + 48;
    } else if (newChar < 36) {
      // A-Z start at index 65, subtracting 11 gives 55
      finalIndex = newChar + 55;
    } else {
      // a-z start at index 97, subtracting 36 gives 61
      finalIndex = newChar + 61;
    }
    output.push(String.fromCharCode(finalIndex));
  }
  return output.join("");
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" },
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const urlsForUser = function (id) {
  const urls = {};
  for (let shortUrl in urlDatabase) {
    if (id === urlDatabase[shortUrl].userId) {
      urls[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return urls;
};

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).redirect("/login");
  }
  const templateVars = {
    urls: urlsForUser(userId),
    user: req.session.user_id,
  };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session["user_id"],
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    return res.status(404).send("you are not authorized to create new URLs");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).redirect("/login");
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.session["user_id"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).redirect("/login");
  }
  const tempShortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[tempShortUrl] = { longURL, userId };

  res.redirect(`/urls/${tempShortUrl}`);
});
// Delete a generated URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).redirect("/login");
  }
  if (urlDatabase[req.params.shortURL]["userId"] !== userId) {
    return res.status(401).send("You are not authorized to delete this URL.");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.get("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).redirect("/login");
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = req.session["user_id"];
  res.render("urls_show", { shortURL, longURL, user });
});

app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).redirect("/login");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls/");
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  res.render("urls_login", { user: false });
});

const signInCheck = function (email, password) {
  for (let user in users) {
    if (users[user].email === email) {
      const isValid = bcrypt.compareSync(password, users[user].password);
      if (isValid) {
        return users[user].id;
      }
      return false;
    }
  }
  return false;
};
app.post("/login", (req, res) => {
  const email = req.body.email;
  const loginId = signInCheck(email, req.body.password);
  if (loginId) {
    req.session.user_id = loginId;
    res.redirect("/urls");
  } else {
    res.status(403).send("Error 403 somethings wrong :(");
  }
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  res.render("urls_register", { user: false });
});
app.post("/register", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).redirect("/login");
  }
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const identity = "user" + generateRandomString();
  const newUser = {
    id: identity,
    email: email,
    password: password,
  };
  if (!req.body.password || !email) {
    res.status(403).send("Empty form");
  } else if (!uniqueEmail()) {
    res.status(403).send("Email in use!");
  } else {
    users[identity] = newUser;
    req.session.user_id = identity;
    res.redirect(`/urls`);
  }

  function uniqueEmail() {
    for (let user in users) {
      if (users[user].email === email) {
        return false;
      }
    }
    return true;
  }
});

app.post("/logout", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(403).redirect("/login");
  }
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
