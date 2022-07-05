const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  router.get("/:item", (req, res) => {
    const templateVar = {user_id :null, user_name:null, data:null}
    if(req.session.user_id){
      templateVar.user_id = req.session.user_id;
      templateVar.user_name = req.session.user_name;
    }
    const item_id = req.params.item;
    const query = `
    SELECT *
    FROM items
    WHERE id = $1
    `
    db.query(query,[item_id])
    .then((data)=> {
      templateVar.data = JSON.stringify(data.rows[0]) //change this data to data with html
      return res.render("detailed_item",templateVar)
    })


  //post for contact
  //post for adding to favorites // if not logined user => redirect to login




  });

  return router;
}
