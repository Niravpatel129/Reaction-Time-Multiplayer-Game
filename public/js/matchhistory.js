var clientname = "player1";
var servername = "player2";
var clientscore = "1";
var serverscore = "0";
function productsAdd() {
  $("#table tbody").append(
    "<tr>" +
      "<td>" +
      clientname +
      " Vs " +
      servername +
      "</td>" +
      "<td>" +
      clientscore +
      " to " +
      serverscore +
      "</td>" +
      "</tr>"
  );
}

$(document).ready(() => {
  console.log("ready");
  productsAdd();
});
