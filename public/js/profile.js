$(document).ready(() => {
  if (localStorage.getItem("name")) {
    console.log("hello");
    $("#localname").val(localStorage.getItem("name"));
  }

  if (localStorage.getItem("avatarPos")) {
    console.log("found a picture position");
    $("#selectavatar").val(localStorage.getItem("avatarPos"));
  }
});

function saveValues() {
  var value = $("#selectavatar").val();

  switch (value) {
    case "picture1":
      localStorage.setItem("avatarPos", "picture1");
      localStorage.setItem("avatar", "js/assets/Bitmap.png");
      console.log(value);
      break;
    case "picture2":
      localStorage.setItem("avatarPos", "picture2");
      localStorage.setItem("avatar", "js/assets/bitmap2.png");

      break;
    case "picture3":
      localStorage.setItem("avatarPos", "picture3");
      localStorage.setItem("avatar", "js/assets/bitmap3.png");

      break;
    case "picture4":
      localStorage.setItem("avatarPos", "picture4");
      localStorage.setItem("avatar", "js/assets/bitmap4.png");

      break;
  }

  let localname = $("#localname").val();
  if (localname) {
    localStorage.setItem("name", localname);
  }
  swal("Saved!", "Settings Saved!", "success").then(() => {
    window.location.href = "/";
  });
}

function resetValues() {
  $("#localname").val("");
  localStorage.removeItem("name");
}
