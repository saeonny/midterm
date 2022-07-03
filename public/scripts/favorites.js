

$(document).ready(function(){

  const $favorites_container = $(`.favorites_container`)

  $favorites_container.append("<h1>hi</h1>")
  console.log(vars)


  return db.query('select * from users')
  .then((result)=>{
    return $favorites_container.append(`<h1>${result.row[0]}</h1>`)
  })


})
