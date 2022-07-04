const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');



module.exports = function(db) {



  router.get('/',(req,res) => {
    console.log(req.session.user_id)
    res.render('login')
  })

  //LOGIN TRY
  router.post('/', (req, res) => {
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
      if(user === null) {
        return res.send('failed to login email doest not exists')
      }
      else {
        if (bcrypt.compareSync(givenPass,user.password)){
          req.session.user_id = user.id;
          return res.send('successfully login')
        }
        else {
          return res.send('password is not correct')
        }
      }
    })
  })





  // if given email is exists in our database it returns user otherwise return null



  return router;

}
