function logOut() {
  return $.ajax({
    method: "POST",
    url: "/users/logout",
  })
}

function logIn(data) {
  return $.ajax({
    method: "POST",
    url: "/users/login",
    data
  });
}

function signUp(data) {
  return $.ajax({
    method: "POST",
    url: "/users",
    data
  });
}
