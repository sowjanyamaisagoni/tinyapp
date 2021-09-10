const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers');

const app = express();

//app.use(cookieParser());
app.use(cookieSession({
   name: "session",
   keys: ["key1" , "key2"]
 }));

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const users = { 
   "userRandomID": {
     id: "userRandomID", 
     email: "user@example.com", 
     password: "purple-monkey-dinosaur",
     
   },
  "user2RandomID": {
     id: "user2RandomID", 
     email: "user2@example.com", 
     password: "dishwasher-funk"
   }
 }
 //const hashedPassword = bcrypt.hashSync(password, 10);

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
   b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" }
 };

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.redirect('/login');
  }
  
  res.redirect('/urls');
  
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
  
 const urlsForUser = function(id) {
   let URLS = {};
   for (let shortUrl in urlDatabase) {
     if (id === urlDatabase[shortUrl].userId) {
     URLS[shortUrl] = urlDatabase[shortUrl].longURL;
   }
   } 
   return URLS;
 };

  app.get("/urls", (req, res) => {
   //const userId = req.cookies['id']
   const userId = req.session.user_id;
  // console.log(userId);
  //  console.log('function: ', urlsForUser(req.session.userId));
  //  console.log('userId: ', req.session['user_id']);
  //  console.log(req.session['user_id']);
  //  console.log('urlDatabase', urlDatabase);

  let templateVars = {
   //urls: urlDatabase,
   urls: urlsForUser(userId),
   
   user: req.session.user_id
    };
    //console.log(urlsForUser);
    res.render("urls_index", templateVars);
 });


 
 app.get("/hello", (req, res) => {
   const templateVars = { greeting: 'Hello World!' };
   res.render("hello_world", templateVars);
 });

 app.get("/urls/new", (req, res) => {
   //res.render("urls_new");
   let templateVars = {
      //user: req.cookies["user_id"]
      user: req.session["user_id"]
    };
    //res.render("urls_new", templateVars);
    if (req.session.user_id) {
      res.render('urls_new', templateVars);
    } else {
      
      return res.status(404).send('you are not authorized to create new URLs');
    }
 });


 app.get("/urls/:shortURL", (req, res) => {
   let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL,
      //user: req.cookies["user_id"]
      user: req.session["user_id"]
     };
    res.render("urls_show", templateVars);

  });
 


 app.get('/u/:shortURL', (req, res) => {
   console.log(req.params)
   console.log(urlDatabase, req.params.shortURL)
   const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL)
});

 app.post("/urls", (req, res) => {
   //const userId = req.cookies['id']
   const userId = req.session['user_id'];
   let tempShortUrl = generateRandomString();
   let longURL = req.body.longURL;
   //urlDatabase[tempShortUrl] = longUrl;
   urlDatabase[tempShortUrl] = { longURL, userId };
   console.log(urlDatabase);
   //res.redirect(`/urls/`); 
   res.redirect(`/urls/${tempShortUrl}`);
   console.log(req.body);  // Log the POST request body to the 
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
 });
//  app.post("/urls/:id", (req, res) => {
//   const userID = req.session.userID;
//   if (urlDatabase[req.params.shortURL]['userID'] !== userID) {
//   	return res.status(401).send('You are not authorized .');
//   }
//    res.redirect("/urls");
//  });
 
 

 
// Delete a generated URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  if (urlDatabase[req.params.shortURL]['userID'] !== userID) {
  	return res.status(401).send('You are not authorized to delete this URL.');
  }
   delete urlDatabase[req.params.shortURL];
   res.redirect("/urls");
 });
 app.get("/urls/:shortURL/edit", (req, res) => {  
   let shortURL = req.params.shortURL;
   let longURL = urlDatabase[shortURL].longURL;
   //let user = req.cookies["user_id"];
   let user = req.session["user_id"];
   res.render("urls_show", {shortURL, longURL, user} );
 });

app.post("/urls/:shortURL", (req, res) => { 
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls/");
});

/*app.post("/login", (req, res) => {
   res.cookie('user_id', req.body.username).redirect("/urls/");; 
 });*/
 
 app.get("/login", (req, res) => {
   let templateVars = {
     urls: [],
     user: req.session["user_id"]
   };
   res.render("urls_login", templateVars);
 });

  const signInCheck =  function(email, password) {

   //let hash_password = bcrypt.hashSync(password,10);
  for (let user in users) {
    if (users[user].email === email) {
       let a =bcrypt.compareSync(password, users[user].password);
      if (a) {
        return users[user].id;
      }
     
      
      return false;
      
    }
  }
  //console.log("bug2");
  return false;
}
 app.post("/login", (req, res) => {
   let email = req.body.email;
   let loginID = signInCheck(email, req.body.password);
   //console.log("@@@@@@@@@@@@@@@@@" + loginID);
   if (loginID) {
     req.session.user_id = loginID;
     
     
     res.redirect('/urls');
     
   } else {
     res.status(403).send('Error 403 somethings wrong :(');
   }
   
 });

 app.get("/register", (req, res) => {
   let templateVars = {
     user: req.session["user_id"],
     //shortURL: req.params.id,
     //longURL: urlDatabase[req.params.id],
   };
   res.render("urls_register", templateVars)
 });
   app.post("/register", (req, res) => {
      let email = req.body.email
      let password = bcrypt.hashSync(req.body.password,10)
      console.log("password",req.body.password,"hash",password);
      let identity = "user" + generateRandomString()
      const newUser = {
         "id": identity,
         "email": email,
         "password": password,
      }
      if (!password || !email ) {
         res.status(403);
         res.send('Empty form');
      } else if (uniqueEmail() === false) {
         res.status(403);
         res.send('Email in use!');
      } else {
         users[identity] = newUser;
         req.session.user_id = identity;
         console.log(identity);
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
   //res.clearCookie("user_id").redirect("/urls/");

   //req.clearsession.user_id;
   //session_destroy();
   //req.session.destroy();
   req.session = null ;
   res.redirect('/urls');
 });
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



