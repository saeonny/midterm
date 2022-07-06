// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);

db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

///////////Cookieparser/////////
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));



// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above

////////HOME:FAVOURITES/////////////
const favourties = require("./routes/favorites")
app.use( "/home", favourties(db));


////////HOME:LOGIN/////////////
const login = require("./routes/login")
app.use( "/home", login(db));

////////HOME:REGISTER///////////////
const register = require("./routes/register")
app.use("/home",register(db))

////////HOME:ITEM/////////////
const item = require("./routes/detailed_item")
app.use( "/home/item", item(db));

////////HOME:NEW ITEM/////////////
const postitem = require("./routes/post_item")
app.use( "/home", postitem(db));


const homepage_item = require("./routes/item");
app.use( "/", homepage_item(db));
// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).


// app.get("/", (req, res) => {
//   res.render("index",{user_id:null,user_name:null});
// });

app.get("/", (req, res) => {
  const templateVar = {user_id:null,user_name:null}
  if(req.session.user_id){
    templateVar.user_id = req.session.user_id
    templateVar.user_name = req.session.user_name
  }
  res.render("index",templateVar);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
