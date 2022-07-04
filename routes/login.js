const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs')



module.exports = function(db) {
  router.get('/',(req,res) => {
    res.render('login')
  })

  //LOGIN TRY
  router.post('/', (req, res) => {
    const givenId = req.body.email;
    const givenPass = req.body.password;
    const password = bcrypt.hashSync('password', 12)

    console.log('login',login(givenId,givenPass))


    if (login(givenId,givenPass)){
      console.log("success")
      res.send("success")
    }
    else {
      res.send("fail")
      console.log("fail")
    }


  });



  const getUserWithEmail= function(email) {
    const query = `
    SELECT password
    FROM users
    WHERE email = $1;
    `
    return  db.query(query,[email])
    .then((data) => {

      if(data.rows.length === 0 ) {
        return null
      }
      else {
        return data.rows[0]
      }
    })
    .catch((err) => {
      console.log(err.message);
    });


  }


  const login =  function(email, password) {
  return getUserWithEmail(email).then((data)=>{
    console.log('logincheck',bcrypt.compareSync(password, data.password))
    if (bcrypt.compareSync(password, data.password)) {
      console.log('if statement passed')
      return true
    }
  })



}
  return router;

}
