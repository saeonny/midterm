const express = require('express');
const router  = express.Router();

module.exports = (db) => {


  router.get("/postitem", (req, res) => {
    ////////////////////////if user is not admin///////////////////////////////////////////
    if(req.session.user_id !== 1){
      return res.redirect("/")
    }
    const templateVar ={user_id : req.session.user_id, user_name : req.session.user_name}
    res.render("post_item",templateVar)
  })

  router.post("/postitem", (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const thumbnail_photo_url = req.body.image;
    const price = req.body.price;
    const color = req.body.colour;
    const date_posted = new Date()
    const available = true;
    const year =  req.body.year;
    const make = req.body.make;
    const model = req.body.model;
    console.log(thumbnail_photo_url);


    if(title ===null || description ===null || thumbnail_photo_url === null || thumbnail_photo_url === null || price === null||
      color===null || color === null || date_posted === null || available === null || year === null || make === null || model ===null){
        return res.send("please put vaild inputs")
      }

    const query =
    `INSERT INTO items
     (title, description, thumbnail_photo_url, price, color, date_posted, available, year, make, model)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`
    db.query(query, [title, description, thumbnail_photo_url, price, color, date_posted, available, year, make, model])
    .then(data => {
      res.redirect("/")
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  });
  return router;
}
