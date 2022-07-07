const express = require("express");
const app = express();

app.get("/", (req, res) => {
  const templateVar = {user_id:null,user_name:null}
  if(req.session.user_id){
    templateVar.user_id = req.session.user_id
    templateVar.user_name = req.session.user_name
  }
  res.render("index",templateVar);
});

