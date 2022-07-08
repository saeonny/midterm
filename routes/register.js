const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');
const { redirect } = require('express/lib/response');

module.exports = (db) => {
  router.get("/register", (req, res) => {
    if(req.session.user_id){
      res.redirect("/home/favorites")
    }
    else {
      const templateVar = {user_id :null, user_name:null};
      res.render('register',templateVar)
    }

  });

  router.post('/register', (req, res) => {
    const givenEmail = req.body.email; // already checked
    const givenName = req.body.name;
    const givenPass = req.body.password;
    const givenPhone = req.body.phone


    /// check Name,Password is only made with spaces
    if (givenName.trim().length === 0 || givenPass.trim().length === 0 || givenPhone.trim().length === 0) {
      return res.send("givenName or GivenPass cant be empty try again")
    }

    // check email is registered or not
    const query = `
    SELECT *
    FROM users
    WHERE email = $1;
    `
    db.query(query,[givenEmail])
    .then((data) => {
      if(data.rows.length !== 0) {
        return res.send ("Given Email is already registered so try again")
      }
    })
    .catch((err) => {
      console.log(err.message);
    });

    const hashedPass = bcrypt.hashSync(givenPass,10)

    const query1 = `
    INSERT INTO users (name, email, phone, password)
    VALUES ($1,$2,$3,$4)
    RETURNING *;
    `

    db.query(query1,[givenName,givenEmail,givenPhone,hashedPass])
    .then((data)=>{
      req.session.user_id = data.rows[0].id
      req.session.user_name = data.rows[0].name
      return res.redirect("/");


    })


    // all passed then registered with email,name,pass

  })






  return router;
};
