const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');
const { redirect } = require('express/lib/response');



module.exports = function(db) {



  router.get('/login',(req,res) => {
    //check with cookie-parser that user_id exists or not
    // if exists => redirect to homepage

   const templateVar = {user_id : null , user_email:null}
    if(req.session.user_id){
      res.redirect("/home/favorites")
    }

    else {

    res.render('login',templateVar)
  }
  })

  //LOGIN TRY
  router.post('/login', (req, res) => {
    const givenEmail = req.body.email;
    const givenPass = req.body.password;

    const getUserWithEmail= function(email) {

      const query = `
      SELECT *
      FROM users
      WHERE email = $1;
      `
      return  db.query(query,[email])
      .then((data) => {
        if(data.rows.length === 0 ) {
          return null
        }
        else {
          //return user => user.password, user.id, user.email etc
          return data.rows[0]
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
    }

    return getUserWithEmail(givenEmail)
    .then((user) => {
      // if given Email does not exists
      // 1. add alert to the login page with "email does not exists"
      // 2. add alert to the login page with "if you are not registered => do register (button that direct to register page)
      if(user === null) {
        return res.send('failed to login email doest not exists')
      }
      else {
        // if givenEmail and givenPass is match => successfully log in
        // 1. req.session.user_id = user.id;
        // 2. redirect to homepage
        if (bcrypt.compareSync(givenPass,user.password)){
          req.session.user_id = user.id;
          req.session.user_name = user.name;
          return res.redirect("/home/favorites")
        }
        // given Email is exists but password is not correct
        // 1. add alert to the login page with "password is not correct"
        else {
          return res.send('password is not correct')
        }
      }
    })
  })

  router.post('/logout',(req, res)=> {
    req.session.user_id = null;
    req.session.user_name = null;
    console.log('cookie after logout',req.session.user_id)
    res.redirect("/home/login");
  })






  // if given email is exists in our database it returns user otherwise return null



  return router;

}
