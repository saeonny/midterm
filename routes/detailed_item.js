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
    //check if user is logined
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
          // if user is not like that item then add "add to fav bt"
          if (result1.rows.length === 0) {
            return db.query(itemQuery, [item_id])
              .then((result) => {
                const item = result.rows[0]
                let html = toHtml(item, user_id);
                html += `
              <form method = "POST" action = "/home/item/fav/favourites/${item.id}">
              <button class="favbutton"> add to favourites </button>
              </form></div></div>`
                //////add delete item bt and  sold out bt remove contact if admin
                templateVar.data = html
                return res.render('detailed_item', templateVar)
              })
          }
          // if user like that item then add "remove from fav bt"
          if (result1.rows.length !== 0) {
            return db.query(itemQuery, [item_id])
              .then((result) => {
                const item = result.rows[0]
                let html = toHtml(item, user_id);
                html += `
              <form method = "POST" action = "/home/item/remove/${item.id}">
              <button class="favbutton"> remove from favourites </button>
              </form></div> </div>
              ` //////add delete item bt and  sold out bt if admin

                templateVar.data = html;
                console.log(templateVar.data)
                return res.render('detailed_item', templateVar)
              })


          }


        })
    }
    //if user is not logined then "give just fav bt"
    else {
      return db.query(itemQuery, [item_id])
        .then((data) => {
          const item = data.rows[0];
          let html = toHtml(item, user_id);
          html += `<form method = "POST" action = "/home/item/fav/favourites/${item.id}">
        <button class="favbutton"> add to favourites </button>
        </form>
      </div>
        </div>`
          //////add delete item bt and  sold out bt if admin
          templateVar.data = html;
          return res.render('detailed_item', templateVar)
        })


    }
  })


  //post sold out
  //

  router.post("/fav/favourites/:item", (req, res) => {

    const user_id = req.session.user_id;
    const item_id = req.params.item;
    const query =
      `INSERT INTO favorites (item_id,user_id)
      VALUES ($1,$2)
     RETURNING *;`;
    db.query(query, [item_id, user_id])
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
    if (!req.session.user_id) {
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
  //only for users
  router.post("/messages/:item", (req, res) => {
    const item_id = req.params.item
    const user_id = req.session.user_id
    if (!req.session.user_id) {
      res.redirect("/home/login")
    }

    if (req.session.user_id === 1) {
      res.redirect(`/home/item/${item_id}`)
    }


    if (req.session.user_id !== 1) {
      res.redirect(`/home/message/send/${item_id}/for/${user_id}`)
    }

  })

  router.post("/fav/remove/fromlist/:item", (req, res) => {
    const item_id = req.params.item;

    return db.query(`DELETE FROM items WHERE id = $1`, [item_id])
      .then(() => {
        res.redirect("/")
      })

  })
  router.post("/fav/soldout/fromlist/:item", (req, res) => {
    const item_id = req.params.item;
    return db.query(`UPDATE items SET available = false WHERE id = $1`, [item_id])
      .then(() => {
        res.redirect(`/home/item/${item_id}`)
      })

  })
  router.post("/fav/restock/fromlist/:item", (req, res) => {
    const item_id = req.params.item;
    return db.query(`UPDATE items SET available = true WHERE id = $1`, [item_id])
      .then(() => {
        res.redirect(`/home/item/${item_id}`)
      })

  })

  const toHtml = function (data, user_id) {
    const item = data;
    //remove contact for admin, add
    let html =
      `<div class = "detailed_item_card">`
      if(item.available === false) {
        html += `<h3><strong>SOLD OUT</strong></h3>`
      }


    html += `<img class="itemphoto" src=${item.thumbnail_photo_url}>
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
  </form>`
    if (user_id !== 1) {
      html += `<div class = buttons>
      <form method = "POST" action = "/home/item/messages/${item.id}">
      <button class="contactbutton"> contact </button></form>`
    }

    if (user_id === 1) {

      html += `<div class = buttons>
        <form method = "POST" action = "/home/item/fav/remove/fromlist/${item.id}">
        <button class="contactbutton"> delete item </button></form>`

      if (item.available === true) {
        html += `<form method = "POST" action = "/home/item/fav/soldout/fromlist/${item.id}">
       <button class="contactbutton"> sold out </button></form>`
      }

      if (item.available === false) {
        html += `<form method = "POST" action = "/home/item/fav/restock/fromlist/${item.id}">
       <button class="contactbutton"> restock </button></form>`
      }



    }

    html += `</form>
  `;
    return html;
  }


  return router;
};
