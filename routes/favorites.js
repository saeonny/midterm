const express = require('express');
const router  = express.Router();

module.exports = (db) => {


  router.get("/favorites", (req, res) => {
    ////////////////////////if user is not logined///////////////////////////////////////////
    if(!req.session.user_id|| req.session.user_id === 1){
      res.redirect("/home/login")
    }


    const templateVar = {user_id:null, user_name:null , data:null}
    templateVar.user_id = req.session.user_id;
    templateVar.user_name = req.session.user_name;
    console.log('favorties session',req.session.user_id)



    const user_id = templateVar.user_id;
    const query =
    `SELECT items.*
     FROM users
     JOIN favorites as fav ON users.id = fav.user_id
     JOIN items ON fav.item_id = items.id
     WHERE user_id = $1;`

    db.query(query,[user_id])
    .then(data => {
        if(data.rows.length === 0) {
          res.redirect("/");
        }
        const items = data.rows;
        templateVar.data = dataToHtml(items)
        res.render("favorites",templateVar);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });
  router.post("/delete/:item", (req, res) =>{
    const user_id = req.session.user_id;
    const item_id = req.body.item.id;
    const query =
    `DELETE
     FROM favourites
     WHERE user_id = $1
     AND item_id = $2
     RETURNING *;`
    db.query(query, [user_id, item_id])
      .then(data => {
        res.redirect("/")
    })
      .catch(err => {
        res
        .status(500)
        .json({error: err.message})
    });
  })
  return router;
};

const dataToHtml = function(data) {
  let html = ``
  for (let item of data){
      html += `<h1>${item.id}, ${item.title}, $${item.price} <button METHOD = POST ACTION = '/delete/${item.id}'> delete </button></h1>`
    }
    return html
}
