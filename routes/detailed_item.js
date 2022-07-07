const express = require('express');
const favorites = require('./favorites');
const router = express.Router();

module.exports = (db) => {


  router.get("/:item", (req, res) => {
    const templateVar = { user_id: null, user_name: null, data: null };
    const item_id = req.params.item;
    const itemQuery = `
      SELECT *
      FROM items
      WHERE id = $1
      `


    //check login
    if (req.session.user_id) {
      templateVar.user_id = req.session.user_id;
      templateVar.user_name = req.session.user_name;
      const user_id = req.session.user_id;

      const favQuery = `
      SELECT *
      FROM favorites
      WHERE user_id = $1 AND item_id = $2
      `



      return db.query(favQuery, [user_id, item_id])
        .then((result1) => {
          //this item is not liked by user so dont need delete button
          if (result1.rows.length === 0) {
            return db.query(itemQuery, [item_id])
              .then((result) => {
                const item = result.rows[0]
                let html = toHtml(item);
                html += `
              <form method = "POST" action = "/home/item/favourites/${item.id}">
              <button class="favbutton"> add to favourites </button>
              </form></div></div>`
                templateVar.data = html;
                return res.render('detailed_item', templateVar)
              })
          }
          if (result1.rows.length !== 0) {
            return db.query(itemQuery, [item_id])
              .then((result) => {
                const item = result.rows[0]
                let html = toHtml(item);
                html += `
              <form method = "POST" action = "/home/item/remove/${item.id}">
              <button class="favbutton"> remove from favourites </button>
              </form></div> </div>
              `
                templateVar.data = html;
                return res.render('detailed_item', templateVar)
              })


          }


        })
    }

    else {
      return db.query(itemQuery, [item_id])
        .then((data) => {
          const item = data.rows[0];
          let html = toHtml(item);
          html += `<form method = "POST" action = "/home/item/favourites/${item.id}">
        <button class="favbutton"> add to favourites </button>
        </form>
      </div>
        </div>`
          templateVar.data = html;
          return res.render('detailed_item', templateVar)
        })


    }
  })


  //post for contact
  //post for adding to favorites // if not logined user => redirect to login

  router.post("/favourites/:item", (req, res) => {


    const user_id = req.session.user_id;
    const item_id = req.params.item;
    const query =
      `INSERT INTO favorites (item_id,user_id)
      VALUES ($1,$2)
     RETURNING *;`;
    db.query(query, [item_id, item_id])
      .then(data => {
        res.redirect(`/home/item/${item_id}`);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  })

  router.post("/remove/:item", (req, res) => {
    if (!req.session.user_id || req.session.user_id === 1) {
      return res.redirect("/home/login");
    }

    const user_id = req.session.user_id;
    const item_id = req.params.item;

    const query =
      `DELETE
    FROM favorites
    WHERE user_id = $1
    AND item_id = $2
    RETURNING *;`;
    db.query(query, [user_id, item_id])
      .then(data => {
        res.redirect(`/home/item/${item_id}`);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  })

  router.post("/messages/:item", (req, res) => {
    const item_id = req.params.item
    res.redirect(`/home/message/send/${item_id}`)
  })

  const toHtml = function (data) {
    const item = data;

    const html =
      `<div class = "detailed_item_card">
  <img class="itemphoto" src=${item.thumbnail_photo_url}>
  <form>
  <div><strong>Item #:</strong> ${item.id}</div>
  <div><strong>Car Title:</strong> ${item.title}</div>
  <div><strong>Description:</strong> ${item.description}</div>
  <div><strong>Price:</strong> $${item.price}</div>
  <div><strong>Colour:</strong> ${item.color}</div>
  <div><strong>Date posted:</strong> ${item.date_posted}</div>
  <div><strong>Item available?</strong> ${item.available}</div>
  <div><strong>Year:</strong> ${item.year}</div>
  <div><strong>Make:</strong> ${item.make}</div>
  <div><strong>Model:</strong> ${item.model}</div>
  </form>
  <div class = buttons>
  <form method = "POST" action = "/home/item/messages/${item.id}">
  <button class="contactbutton"> contact </button>
  </form>

  `;
    return html;
  }


  return router;
};
