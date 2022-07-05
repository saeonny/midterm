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
      templateVar.data = JSON.stringify(data.rows[0])
      templateVar.data += "<button>contact</button>"
      templateVar.data += "<button>add to favorite</button>"
      //change this  to data with html, JSON is for just checking the item is correctly passed to the page

      return res.render("detailed_item",templateVar)
    })


  //post for contact
  //post for adding to favorites // if not logined user => redirect to login




  });

  return router;
}
