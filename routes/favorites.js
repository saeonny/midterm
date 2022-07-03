const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    const user_id = 2;
    const query =
    `SELECT items.*
     FROM users
     JOIN favorites as fav ON users.id = fav.user_id
     JOIN items ON fav.item_id = items.id
     WHERE user_id = $1;`

    db.query(query,[user_id])
      .then(data => {
        const items = data.rows;
        res.render("favorites");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

const creating_list = function(data_set) {

}
