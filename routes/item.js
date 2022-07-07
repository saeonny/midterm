const express = require('express');
const router = express.Router();
const itemList = require('../db/helperFunctions/item');

module.exports = (db) => {
  router.get("/", (req, res) => {
    //const userId = req.session['userId'];

    return itemList.getdataFromDb(db)

      .then(data => {
        const templateVars = { data: data.rows, user_id: null, user_name: null };
        if (req.session.user_id) {
          templateVars.user_id = req.session.user_id,
            templateVars.user_name = req.session.user_name
        }
        return res.render("index", templateVars);
      });

  });

  router.post('/home/favorites/:item_id', (req, res) => {

    const user_id = req.session.user_id;
    const item_id = req.params.item_id;

    if (!user_id) {
      return res.redirect('/');
    }
    const query = `
      INSERT INTO favorites (item_id,user_id)
      VALUES ($1,$2)
     RETURNING *;
     `
    return db.query(query, [item_id, user_id])
      .then(data => {
        return res.redirect('/home/favorites');
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  router.post("/home/remove/:item", (req, res) => {
    const user_id = req.session.user_id;
    const item_id = req.params.item;
    const query =
      `DELETE
     FROM items
     WHERE id = $1
     RETURNING *;`
    db.query(query, [item_id])
      .then(data => {
        res.redirect("/")
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message })
      });
  });


  router.post("/home/soldout/:item", (req, res) => {
    const user_id = req.session.user_id;
    const item_id = req.params.item;
    const query =
      `UPDATE items
     SET available = false
     WHERE id = $1
     RETURNING *;`
    db.query(query, [item_id])
      .then(data => {
        res.redirect("/")
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message })
      });
  });

  router.post("/home/restock/:item", (req, res) => {
    const user_id = req.session.user_id;
    const item_id = req.params.item;
    const query =
      `UPDATE items
     SET available = true
     WHERE id = $1;
    `
    db.query(query, [item_id])
      .then(() => {
        res.redirect("/")
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message })
      });


  })

  return router;
}
