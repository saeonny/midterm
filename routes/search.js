const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.post("/search", (req, res) => {

    const sql =
    `SELECT *
    FROM items
    WHERE price >= $1
    AND price <= $2
    ORDER BY price;`
    const params = [ (req.body.minPrice), (req.body.maxPrice)];
    return db.query(sql, params)
    .then(data => {
      console.log(data.rows);
      const templateVars = { data: data.rows, user_id:null, user_name:null }
      if(req.session.user_id){
        templateVars.user_id = req.session.user_id;
        templateVars.user_name = req.session.user_name
      }
      res.render("search", templateVars);
    });
  });

router.get("/search", (req,res) => {
  const templateVars = { data:null, user_id:null, user_name:null }
  if(req.session.user_id){
    templateVars.user_id = req.session.user_id;
    templateVars.user_name = req.session.user_name
  }
  res.render("search", templateVars);
})
  return router;
}
