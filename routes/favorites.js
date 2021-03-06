const express = require('express');
const router  = express.Router();

module.exports = (db) => {


  router.get("/favorites", (req, res) => {
    ////////////////////////if user is not logined///////////////////////////////////////////
    if(!req.session.user_id){
      return res.redirect("/home/login")
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
          templateVar.data = "<h3>nothings yet...</h3>"
          return res.render("favorites",templateVar);
        }
        const items = data.rows;
        templateVar.data = dataToHtml(items)
        return res.render("favorites",templateVar);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });
  router.post("/delete/:item", (req, res) =>{
    const user_id = req.session.user_id;
    const item_id = req.params.item;
    const query =
    `DELETE
     FROM favorites
     WHERE user_id = $1
     AND item_id = $2
     RETURNING *;`
    db.query(query, [user_id, item_id])
      .then(data => {
        res.redirect("/home/favorites")
    })
      .catch(err => {
        res
        .status(500)
        .json({error: err.message})
    });
  })

  router.post("/details/:item", (req, res) =>{
    // res.send(`${req.params.item} redirect `)
    const item_id = req.params.item
    res.redirect(`/home/item/${item_id}`)
  })

  router.post("/favorite/:item", (req,res) => {
    if(!req.session.user_id || req.session.user_id === 1) {
      return res.redirect("/home/login")
    }
    const user_id = req.session.user_id;
    const item_id = req.params.item;


    const query =
    `SELECT item.*
     FROM favorites
     JOIN users ON user_id = users.id
     JOIN items ON item_id = items.id
     WHERE user_id = $1
     AND item_id = $2
     RETURNING *; `
     db.query(query, [user_id, item_id])
     .then(data => {
      const templateVars = {data : data.rows , user_id : user_id , user_name: req.session.user_name};
      return res.render("favorite", templateVars);
     })
     .catch (err => {
        res
        .status(500)
        .json({error: err.message})
     });

  })


  return router;
};



const dataToHtml = function(data) {
  let html = `<div class = "favorite_container">`
  //this html components interact with favorites.scss
  for (let item of data){
      html += `
      <card class = "favorite_card">
      <img style="float:left" class="photo" src=${item.thumbnail_photo_url}>
      <form style="float:right" class="words">
      <div>${item.id}</div> <div>${item.title}</div> <div>$${item.price}</div>
      </form>
      <div class = buttons>
      <form method = "POST" action = "/home/delete/${item.id}">
      <button class="buttondelete"> delete </button>
      </form>
      <form method = "POST" action = "/home/details/${item.id}">
      <button class="buttondetails"> details </button>
      </form>
      </div>
      </card>
      `

    }
    html += "</div>"
    return html
}
