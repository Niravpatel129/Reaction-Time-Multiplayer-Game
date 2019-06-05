$(document).ready(() => {
  if (localStorage.getItem("name")) {
    console.log("hello");
    $("#localname").val(localStorage.getItem("name"));
  }
});

function saveValues() {
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
