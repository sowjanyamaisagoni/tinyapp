const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

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

const generateRandomString = () => {
   let output = [];
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
   return output.join('');
 };
 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
   res.json(urlDatabase);
 });
 app.get("/hello", (req, res) => {
   res.send("<html><body>Hello <b>World</b></body></html>\n");
 });

 app.get("/set", (req, res) => {
   const a = 1;   
   res.send(`a = ${a}`);
  });
  
  app.get("/fetch", (req, res) => {
   res.send(`a = ${a}`);
  });

  app.get("/urls", (req, res) => {
   let templateVars = {
      user: req.cookies["user_id"],
      urls: urlDatabase 
    };
   res.render("urls_index", templateVars);
 });

 app.get("/hello", (req, res) => {
   const templateVars = { greeting: 'Hello World!' };
   res.render("hello_world", templateVars);
 });

 app.get("/urls/new", (req, res) => {
   //res.render("urls_new");
   let templateVars = {
      user: req.cookies["user_id"]
    };
    res.render("urls_new", templateVars);
 });

 app.get("/urls/:shortURL", (req, res) => {
   let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL],
      user: req.cookies["user_id"]
     };
    res.render("urls_show", templateVars);
  });
 


 app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
})


 app.post("/urls", (req, res) => {
   console.log(req.body);  // Log the POST request body to the console
   res.send("Ok");         // Respond with 'Ok' (we will replace this)
 });
// Delete a generated URL
app.post("/urls/:id/delete", (req, res) => {
   delete urlDatabase[req.params.id];
   res.redirect("/urls");
 });
 app.get("/urls/:shortURL/edit", (req, res) => {  
   let shortURL = req.params.shortURL;
   let longURL = urlDatabase[shortURL];
   let user = req.cookies["user_id"];
   res.render("urls_show", {shortURL, longURL, user} );
 });

app.post("/urls/:shortURL", (req, res) => { 
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect("/urls/" + req.params.shortURL);
});

/*app.post("/login", (req, res) => {
   res.cookie('user_id', req.body.username).redirect("/urls/");; 
 });*/
 
 app.get("/login", (req, res) => {
   let templateVars = {
     urls: [],
     user: req.cookies["user_id"]
   };
   res.render("urls_login", templateVars);
 });
 app.post("/login", (req, res) => {
   let email = req.body.email;
   let password = req.body.password;
   let loginID = signInCheck();
   if (loginID) {
     res.cookie("user_id", loginID).redirect('/urls');
   } else {
     res.status(403).send('Error 403 somethings wrong :(');
   }
   function signInCheck() {
     for (let user in users) {
       if (users[user].email === email) {
         if (users[user].password === password) {
           return users[user].id;
         }
         return false;
       }
     }
     return false;
   }
 });
 
 app.get("/register", (req, res) => {
   let templateVars = {
     user: req.cookies["user_id"],
     shortURL: req.params.id,
     longURL: urlDatabase[req.params.id],
   };
   res.render("urls_register", templateVars)
 });
 app.post("/register", (req, res) => {
   let email = req.body.email
   let password = req.body.password
   let ident = "user" + generateRandomString()
   const newUser = {
      "id": ident,
      "email": email,
      "password": password,
    }
    if (!password || !email ) {
       res.status(400);
       res.send('Empty form');
     } else if (uniqueEmail() === false) {
       res.status(400);
       res.send('Email in use!');
     } else {
       users[ident] = newUser;
       res.cookie("user_id", ident);
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
   res.clearCookie("user_id").redirect("/urls/");
 });
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
