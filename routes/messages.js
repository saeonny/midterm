const express = require('express');
const router  = express.Router();




module.exports = (db) => {
  const dataToMessageList = function(data) {
    let html = ``
    for(let item of data){

      html += `
      <card class="messagecard">
      <div class="itemclass">
      <h5> Item     : ${item.item_title} </h3>
      </div>
      <div class="senderclass">
      <h5> Sender   :${item.sender} </h3>
      </div>
      <div class="receiverclass">
      <h5> Receiver : ${item.receiver} </h3>
      </div>
      <div class="messageclass">
      <h5> Message  : ${item.message} </h3>
      </div>
      <div class="timeclass">
      <h5> Time     :  ${ item.time}  </h3>
      </div>
      `
      if (item.receiver_id !== 1) {
        html += `<div class="timeclass">
        <form method = "POST" action = "/home/message/${item.item_id}/for/${item.receiver_id}">
        <button> message  </button>
        </form>
        </div>
        </card>`
      }
      else {
        html += `<div class="timeclass">
        <form method = "POST" action = "/home/message/${item.item_id}/for/${item.sender_id}">
        <button> message  </button>
        </form>
        </div>
        </card>`
      }



    }

    return html
  }
  router.post(`/message/:item_id/for/:for_user_id`,(req,res)=>{
    const item_id = req.params.item_id
    const for_user_id = req.params.for_user_id
    res.redirect(`/home/message/send/${item_id}/for/${for_user_id}`)
  })

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
      if(req.session.user_id !==0) {

        let query = `
        SELECT sender.name as sender, sender.id as sender_id, receiver.name as receiver, receiver.id as receiver_id, items.title as item_title,items.id as item_id, messages.message as message, messages.message_data_time  as time
        FROM messages
        LEFT JOIN users as sender ON messages.sender_id = sender.id
        LEFT JOIN users as receiver ON messages.receiver_id = receiver.id
        JOIN items ON messages.item_id = items.id

        `
        if (req.session.id !== 1) {
          query += `WHERE messages.sender_id = $1 OR messages.sender_id = 1
          ORDER BY messages.message_data_time DESC`;
        }
        if(req.session.id === 1) {
          query += `WHERE messages.receiver_id = $1 OR messages.sender_id = 1
          ORDER BY messages.message_data_time DESC`

        }

        return db.query(query,[req.session.user_id])
        .then((result)=> {
          const messages = result.rows;
          if(messages.length !== 0){
            const html = dataToMessageList(messages);
            templateVar.message_list = html
            res.render('messages',templateVar)}
          if(messages.length === 0) {
            const html = `
            <card class="messagecard">
            <div class="messageclass">
            <h5> Nothings yet... </h5>
            </div>
            </card>
            `
          }



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


