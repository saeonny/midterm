const express = require('express');
const router  = express.Router();

module.exports = (db) => {


  router.get("/postitem", (req, res) => {
    ////////////////////////if user is not admin///////////////////////////////////////////
    if(user.name !== "Admin" || user.email !== 'admin@gmail.com'){
      res.redirect("/")
    }
    res.render("postitem")
  })

  router.post("/postitem", (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const thumbnail_photo_url = req.body.thumbnail_photo_url;
    const price = (req.body.price * 100);
    const color = req.body.color;
    const date_posted = req.body.date_posted;
    const available = req.body.available;
    const year =  req.body.year;
    const make = req.body.make;
    const model = req.body.model;

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
