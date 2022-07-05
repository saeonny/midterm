const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/:item", (req, res) => {
    const query =
    `SELECT *
     FROM items
     WHERE item_id = $1;`

    db.query(query,[item_id])
    .then(data => {
        const items = data.rows;
        res.render(items);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });
}
