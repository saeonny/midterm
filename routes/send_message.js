const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/message/send/:item_id/for/:for_user_id", (req, res) => {
    const templateVar = {user_id:null,user_name:null,html:null}
    if(!req.session.user_id){
      return res.redirect("/")
      //add some error message : )
    }

    if(req.session.user_id){
      templateVar.user_id = req.session.user_id;
      templateVar.user_name = req.session.user_name;

      const user_id = req.session.user_id;
      const item_id = req.params.item_id;
      const for_user_id = req.params.for_user_id;


      let chatQuery = `
      SELECT items.id as item_id ,items.title as item_title, sender.name as sender , sender.id as sender_id , receiver.name as receiver, receiver.id as receiver_id,
      messages.message as message, messages.message_data_time as time
      FROM messages
      LEFT JOIN users as sender ON messages.sender_id = sender.id
      LEFT JOIN users as receiver ON messages.receiver_id = receiver.id
      JOIN items ON messages.item_id = items.id
      `
      if(user_id !== 1) {
        chatQuery += `WHERE (items.id = $1 AND sender.id = $2 AND receiver.id = 1) OR (items.id = $1 AND receiver.id = $2 AND sender.id = 1);`
      }
      if(user_id === 1) {
        chatQuery += `WHERE (items.id = $1 AND sender.id = $2 AND receiver.id = ${for_user_id}) OR (items.id = $1 AND receiver.id = $2 AND sender.id = ${for_user_id});`
      }

      return db.query(chatQuery,[item_id,user_id])
      .then((result)=> {
        const messages = result.rows
        console.log(messages);

        if(messages.length === 0) {
          return db.query (`select title from items where id = ${item_id}`)
          .then((result1)=> {
            const item_title =result1.rows[0].title
            templateVar.html = noMessageHtml(item_title,item_id,for_user_id);
            res.render("messages_send",templateVar)
          })

        }
        if(messages.length !== 0) {
          //for admin
          if(user_id === 1) {
            const html = adminMessagesToHtml(messages,item_id,user_id,for_user_id);
            console.log('html',html);

            console.log('foruserid',for_user_id);
            console.log('admin user =1',messages);
            templateVar.html = html
            res.render("messages_send",templateVar);



          }
          const html = messagesToHtml(messages,item_id,user_id,for_user_id);
          templateVar.html = html;
          res.render("messages_send",templateVar)



        }

      })

    }//if req.session

  });


  router.post("/send/messages/:item_id/for/:for_user_id", (req, res) => {
    const item_id = req.params.item_id;
    const for_user_id = req.params.for_user_id
    const text = req.body.text
    const time = new Date()

    if(req.session.user_id !== 1){
      const query = `
      INSERT INTO messages (sender_id,receiver_id, item_id, message,message_data_time)
      VALUES ($1,1,$2,$3,$4);
      `
      return db.query(query,[req.session.user_id,item_id,text,time])
      .then(()=>{
        return res.redirect(`/home/message/send/${item_id}/for/${for_user_id}`)
      })
    }

    if(req.session.user_id === 1) {
      const query = `
      INSERT INTO messages (sender_id,receiver_id, item_id, message,message_data_time)
      VALUES (1,$1,$2,$3,$4);
      `
      return db.query(query,[for_user_id,item_id,text,time])
      .then(()=>{
        return res.redirect(`/home/message/send/${item_id}/for/${for_user_id}`)
      })


    }


  })//post



  return router;
};
const noMessageHtml = function(title,item_id,for_user_id){

  let html = ``;
  html +=
  `<h2>ITEM : ${title}</h2>
  <div class = "chat-log">
    <h3> no messages yet....<h3>
  </div>
    <form class="message-container" action="/home/send/messages/${item_id}/for/${for_user_id}" method="POST">

      <textarea name="text" class="message-text"></textarea>
      <button class="message-button" type="submit">Send</button>
    </form>

  </div>`

  return html;

}
const adminMessagesToHtml = function(messages,item_id,user_id,for_user_id) {

  let html = `
  <h2> Item : ${messages[0].item_title} </h2>
  <div class = "chat-log">
  `
  for(let message of messages) {
    console.log("infunction22",message.sender_id,for_user_id)
    if(message.sender_id === user_id) {
      html += `
      <div class = sender>
        <p>me(admin):<br>
           ${message.message}</p>
      </div>
      `
    }

    else if(message.sender_id == for_user_id)  {
      html += `
      <div class = "receiver">
        <p>${message.sender}:<br>
        ${message.message}</p>
        </div>
      `
    }

  }
  html += `
  </div>
  <form class="message-container" action="/home/send/messages/${item_id}/for/${for_user_id}" method="POST">

        <textarea name="text" class="message-text"></textarea>
        <button class="message-button" type="submit">Send</button>
  </form>

  `


  return html


};

const messagesToHtml = function(messages, item_id, user_id,for_user_id) {
  let html = `
  <h2> Item : ${messages[0].item_title} </h2>
  <div class = "chat-log">
  `
  for(let message of messages) {
    if(message.sender_id === user_id) {
      html += `
      <div class = sender>
        <p>me:<br>
           ${message.message}</p>
      </div>
      `
    }
    if(message.sender_id === 1) {
      html += `
      <div class = "receiver">
        <p>admin:<br>
        ${message.message}</p>
        </div>

      `
    }

  }
  html += `
  </div>
  <form class="message-container" action="/home/send/messages/${item_id}/for/${for_user_id}" method="POST">

        <textarea name="text" class="message-text"></textarea>
        <button class="message-button" type="submit">Send</button>
  </form>

  `


  return html
}
