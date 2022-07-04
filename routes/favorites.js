const express = require('express');
const router  = express.Router();

module.exports = (db) => {


  router.get("/", (req, res) => {
    const user_id = 2; ///////change this part to cookie parser req.session.user_id//////////
    const query =
    `SELECT items.*
     FROM users
     JOIN favorites as fav ON users.id = fav.user_id
     JOIN items ON fav.item_id = items.id
     WHERE user_id = $1;`

    db.query(query,[user_id])
      .then(data => {
        const items = data.rows;

        const vars = {data:`
        <h1>${items[0].id}, ${items[0].title}, $${items[0].price} <button METHOD = POST ACTION = '/delete/${items[0].id}'> delete </button></h1>
        `}
        res.render("favorites",vars);


      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });
  router.post("/delete/:item", (req, res) =>{
    const user_id = 2; ///////change this part to cookie parser req.session.user_id//////////
    const item_id = req.body.item.id; ///// this needs to be changed//////
    const query =
    `SELECT items.*
     FROM users
     JOIN favorites as fav ON users.id = fav.user_id
     JOIN items ON fav.item_id = items.id
     WHERE user_id = $1;`
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
    if (!user_id) {
      html += `<p>Please log in or register to favourite items<p>`
    }
    if (user.name ==='Admin' || user.email === 'admin@gmail.com') {
      html += `<h1>${item.id}, ${item.title}, $${item.price} <button METHOD = POST ACTION = '/delete/${item.id}'> delete </button><button METHOD = POST type = "submit">sold out</button></h1>`
    }
  }
}
