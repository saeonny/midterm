const express = require('express');
const router  = express.Router();




module.exports = (db) => {
  const dataToMessageList = function(data) {
    let html = ``
    for(let item of data){

      html += `
      <card >
      <h5> Item     : ${item.item_title} </h3>
      <h5> Sender   :${item.sender} </h3>
      <h5> Receiver : ${item.receiver} </h3>
      <h5> Message  : ${item.message} </h3>
      <h5> Time     :  ${ item.time}  </h3>
      </card>
       `

    }

    return html
  }

   ///list of the messages
  router.get("/messages", (req, res) => {
    const templateVar = {user_id : null, user_name :null,message_list : null}
    if(!req.session.user_id){
      res.send("you should login to use this feature")
    }

    if(req.session.user_id){
      templateVar.user_id = req.session.user_id;
      templateVar.user_name = req.session.user_name;


      /////if logined user is NOT admin
      if(req.session.user_id !==1) {



        const query = `
        SELECT sender.name as sender, sender.id as sender_id, receiver.name as receiver, receiver.id as receiver_id, items.title as item_title,items.id as item_id, messages.message as message, messages.message_data_time  as time
        FROM messages
        LEFT JOIN users as sender ON messages.sender_id = sender.id
        LEFT JOIN users as receiver ON messages.receiver_id = receiver.id
        JOIN items ON messages.item_id = items.id
        WHERE messages.sender_id = $1 OR messages.sender_id = 1
        ORDER BY messages.message_data_time DESC;

        `

        return db.query(query,[req.session.user_id])
        .then((result)=> {
          const messages = result.rows;
          const html = dataToMessageList(messages);
          templateVar.message_list = html


          res.render('messages',templateVar)



        })
        .catch(err => {
          res
          .status(500)
          .json({error: err.message})
      });

      }








      return res.render("messages",templateVar);
    }


  });
  return router;
};


