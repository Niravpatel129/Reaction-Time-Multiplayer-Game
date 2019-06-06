if (localStorage.getItem("bg")) {
  $("#fbackground").val(localStorage.getItem("bg"));
}

if (localStorage.getItem("ftext")) {
  $("#ftext").val(localStorage.getItem("ftext"));
}

if (localStorage.getItem("ftarget")) {
  $("#ftarget").val(localStorage.getItem("ftarget"));
}

function saveValues() {
  bg = $("#fbackground").val();
  ft = $("#ftarget").val();
  ftxt = $("#ftext").val();
  localStorage.setItem("bg", bg);
  localStorage.setItem("target", ft);
  localStorage.setItem("ftext", ftxt);
  swal("Good job!", "Settings Saved!", "success").then(() => {
    window.location.href = "/";
  });
}

function resetValues() {
  $("#fbackground").val("#333333");
  $("#ftarget").val("#FF5733");
  $("#ftext").val("#CCEEEE");
}
