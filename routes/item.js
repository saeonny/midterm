const express = require('express');
const router = express.Router();
const itemList = require ('../db/helperFunctions/item');

module.exports = (db) => {
  router.get("/", (req, res) => {
    //const userId = req.session['userId'];

    return itemList.getdataFromDb(db)

      .then(data => {
        const templateVars = {data : data.rows , user_id : null , user_name: null};
        if(req.session.user_id){
          templateVars.user_id = req.session.user_id,
          templateVars.user_name = req.session.user_name
        }
        return res.render("index", templateVars);
      });

  });
  return router;
}
