//imports
console.log("%c This is kinda cool! ", "background: #222; color: #bada55");

//color
var backgroundcolor = "#333333";
var textcolor = "#CCEEEE";
var targetcolor = "#FF5733";
var userAndPosition = [];

// Data
var havemousecontrol = true;
var runonce = true;
var reloadEndingPage = true;
var clocktimer;
var serverlost = false;
var latestscoreupdate = 0;
var ClientReady = false;
var ServerReady = false;
var localdata;
var clock = 0;
var score = 0;
var missed = 3;
var gameStarted = false;
var dots = [];
var opdots = [];
var params;
var Opponentscore = 0;
var Opponentmissed = 3;
// Client side connect
var socket = io();
var winnnerCheck = 0;
var gamedone = false;
var seeIfChanged;
var PlayersReady = false;
var serverMouseX;
var serverMouseY;
var wave = 0;

socket.on("connect", function() {
  params = jQuery.deparam(window.location.search);
  if (localStorage.getItem("avatar")) {
    params.avatar = localStorage.getItem("avatar");
  }
  // console.log(params);
  socket.emit("join", params, function(err) {
    user = params.name;
    if (err) {
      swal("Error!", err, "error")
        .then(function() {
          (window.location.href = "/?error="), err;
        })
        .catch(() => {
          alert("unknown error occured, just try again :)");
          window.location.href = "/";
        });
    }
  });
});

socket.on("disconnect", function() {
  userAndPosition = [];
  socket.emit("clearlobby");
  console.log("Disconnected from server");
});

socket.on("clearlobby", () => {
  window.location.href = "/?303";
});

//Sketch below
function defineSketch(isPlayer) {
  return function(sketch) {
    sketch.preload = function() {
      img = sketch.loadImage("js/assets/pointer.png");

      sketch.soundFormats("mp3", "ogg");
      song = sketch.loadSound("js/assets/singleshot.mp3");
      miss = sketch.loadSound("js/assets/tripletake.mp3");
      song.setVolume(0.1);
      miss.setVolume(0.1);
    };

    var width = 600;
    var height = 500;

    class myCircle {
      constructor(nx, ny, nd) {
        if (nx) {
          this.x = nx;
          this.y = ny;
          this.diameter = nd;
          this.c = sketch.color("#FC1881");
        } else {
          this.x = Math.round(sketch.random(width));
          this.y = Math.round(sketch.random(height));
          this.diameter = sketch.random(40, 80);
          this.speed = 1;
          this.c = sketch.color(targetcolor);
        }
      }
      display() {
        sketch.strokeWeight(2);
        sketch.stroke("#FFF");
        sketch.fill(this.c);
        sketch.ellipse(this.x, this.y, this.diameter, this.diameter);
        sketch.ellipse(
          this.x,
          this.y,
          this.diameter / 1.5,
          this.diameter / 1.5
        );

        sketch.ellipse(this.x, this.y, this.diameter / 3, this.diameter / 3);
      }
    }

    sketch.keyPressed = function() {
      //
    };

    sketch.setup = function() {
      let canvasWidth = sketch.windowWidth / 2 - 20;
      let canvasHeight = 600;
      updateText();
      let myCanvas = sketch.createCanvas(canvasWidth, canvasHeight);
      if (isPlayer) {
        clocktimer = setInterval(timeIt, 1000);

        for (var i = 0; i <= 1; i++) {
          // dots.push(new myCircle());
        }
      }
    };

    function generateAnotherDot() {
      dots.push(new myCircle());
    }

    function timeIt() {
      clock++;
      if (clock % 3 === 0 || clock == 0) {
        generateNewWave();
      }
    }

    function generateNewWave() {
      if (isPlayer && !gamedone) {
        sendCircle();
        if (dots.length > 3) {
          gamedone = true;
        }
        score -= dots.length;
        //remove mouse control
        //make all player dots red

        setTimeout(() => {
          for (var m = 0; m < dots.length; m++) {
            dots[m].c = "rgb(255,0,0)";
          }
          havemousecontrol = false;
        }, 2000);
        havemousecontrol = true;

        wave++;
        dots = [];
        for (var i = 0; i < clock / 3; i++) {
          dots.push(new myCircle());
        }
      }
    }

    sketchwindowResized = function() {
      resizeCanvas(canvasWidth, canvasHeight);
    };

    sendCircle = function() {
      var mydots = [];
      for (var i = 0; i < dots.length; i++) {
        dotsData = {
          x: dots[i].x,
          y: dots[i].y,
          diameter: dots[i].diameter
        };
        mydots.push(dotsData);
      }
      socket.emit("dotsdata", mydots);
    };

    sketch.mousePressed = function() {
      if (isPlayer && havemousecontrol) {
        var notfoundObj = true;
        var myLength = dots.length;
        for (let i = dots.length - 1; i >= 0; i--) {
          var distance = sketch.int(
            sketch.dist(sketch.mouseX, sketch.mouseY, dots[i].x, dots[i].y)
          );

          var d = sketch.dist(
            sketch.mouseX,
            sketch.mouseY,
            dots[i].x,
            dots[i].y
          );
          if (distance <= dots[i].diameter / 2) {
            song.play();
            if (dots[i].diameter <= 50) {
              score += 3;
            }
            if (dots[i].diameter <= 70) {
              score += 2;
            } else {
              score++;
            }
            socket.emit("score", score);
            dots[i].c = sketch.color(111, 204, 0);
            dots.splice(i, 1);
            // generateAnotherDot();
            break;
          } else {
            myLength--;
            if (myLength == 0) {
              console.log("missed");
              score--;
              miss.play();
            }
          }
        }
      }
    };

    socket.on("winner", name => {
      localdata = name;
      gamedone = true;

      clearInterval(clocktimer);
      console.log(localdata);

      if (localdata.localwinner === params.name) {
        $("#myContainer2 canvas").css("border", "solid red");
      } else {
        for (let m = 0; m < dots.length; m++) {
          dots[m].color = "#FF0000";
        }
        $("#myContainer canvas").css("border", "solid red");
        for (let z = 0; z < dots.length; z++) {
          dots[z].color = "#FF0000";
        }
      }

      setTimeout(() => {
        console.log("winner was recieved");
        reloadEndingPage = true;
        sketch.remove();
        opdots = [];
        dots = [];
        //PlayersReady && ServerReady && !gameStarted
        gameStarted = false;
        PlayersReady = false;
        ServerReady = false;
        havemousecontrol = true;
        $("#myContainer2 canvas").css("border", "none");
        $("#myContainer canvas").css("border", "none");

        pageLoad();
      }, 4000);
    });

    socket.on("score", newScore => {
      // console.log(newScore);
      Opponentscore = newScore;
    });

    socket.on("opponentcircles", data => {
      // if (change != opdots) {
      opdots = [];
      data.map(d => {
        opdots.push(new myCircle(d.x, d.y, d.diameter));
      });
      // }
      var change = opdots;
    });

    socket.on("mouselocation", data => {
      serverMouseX = data.x;
      serverMouseY = data.y;
    });

    drawServerMouse = () => {
      if (serverMouseX != null && serverMouseY != null) {
        sketch.image(img, serverMouseX, serverMouseY);
      }
    };

    sketch.draw = function() {
      if (gameStarted && PlayersReady) {
        sketch.background(sketch.color(backgroundcolor));

        if (missed > 0) {
          if (!isPlayer) {
            if (opdots.length > 0) {
              for (let k = 0; k < opdots.length; k++) {
                if (opdots.length > 0) {
                  opdots[k].display();
                }
              }
            }
            sketch.fill(sketch.color(textcolor));
            sketch.textSize(23);
            sketch.stroke("#cee");
            sketch.strokeWeight(1);
            sketch.text("Score: " + Opponentscore, 30, 70);
            sketch.fill(sketch.color(textcolor));
            sketch.textSize(23);
            // sketch.text("Lives: " + Opponentmissed, 30, 95);
            sketch.fill(sketch.color(textcolor));
            sketch.textSize(23);
            drawServerMouse();
          } else {
            socket.emit("score", score);
            mydots = [];
            for (let i = 0; i < dots.length; i++) {
              dots[i].display();
              dotsData = {
                x: dots[i].x,
                y: dots[i].y,
                diameter: dots[i].diameter
              };
              mydots.push(dotsData);
            }
            if (seeIfChanged != mydots) {
              socket.emit("dotsdata", mydots);
              socket.emit("mouseLocation", {
                x: sketch.mouseX,
                y: sketch.mouseY
              });
            }
            seeIfChanged = mydots;

            sketch.fill(sketch.color(textcolor));
            sketch.textSize(23);
            sketch.stroke(textcolor);
            sketch.strokeWeight(1);
            sketch.text("Score: " + score, 30, 70);
            sketch.fill(sketch.color(textcolor));
            sketch.textSize(23);
            sketch.fill(sketch.color(textcolor));
            sketch.textSize(23);
            sketch.text("Clock: " + clock, 30, 100);
            sketch.fill(sketch.color(textcolor));
            sketch.textSize(23);
            sketch.text("Wave: " + wave, 30, 130);
          }
        }
        if (gamedone && runonce) {
          runonce = false;
          console.log("runonce");
          console.log("game done was called local here");
          socket.emit("clockended", { name: params.name, score: score });
        }

        // EMIT TIMER ENDED
      } else {
        console.log("game being cleared");
        // sketch.clear();
      }
    };
  };
}

function updateText() {
  if (gameStarted) {
    // $("h3").text("Highest Score: " + localStorage.getItem("score") || 0);
  }
}

socket.on("start", function(data) {
  $("#ready").css("display", "inline-block");
  pageLoad();
});

socket.on("users", function(data) {
  userAndPosition = [];
  // console.log(data);
  var counter = 0;
  if (!data) {
    console.warn("user data was null: " + data);
    alert("error 104: report to developer");
    window.location.href = "/";
  }
  data.map(dat => {
    counter++;
    // userAndPosition.push({ name: dat, position: counter });
    // socket.emit("getuseravatar", { name: dat, room: params.room });

    var text = $("#player" + counter).text(dat.name);
    var text = $("#player" + counter).css("opacity", "1");
    if (dat.avatar) {
      // console.log(dat.avatar);
      $("#avatar" + counter).attr("src", dat.avatar);
      // console.log("avatar" + counter);
    }
    //change avatar
    // console.log(userAndPosition);

    if (text.length <= 0) {
      console.log("EMPTY :/");
      location.reload();
    }

    $(text).addClass("blue");
  });

  pageLoad();
});

socket.on("gamewinner", data => {
  // console.log(data);
  var localwinner;
  var localwinnerscore;
  var localloser;
  var localloserscore;

  if (data.score > score) {
    localwinnerscore = data.score;
    localwinner = data.name;
    localloser = params.name;
    localloserscore = score;
    // console.log(data.name + " is the winner with a score of " + score);
  } else {
    localwinner = params.name;
    localwinnerscore = score;
    localloser = data.name;
    localloserscore = data.score;
    // console.log(params.name + " is the loser with a score of " + data.score);
  }

  socket.emit("winner", {
    localwinner,
    localwinnerscore,
    localloser,
    localloserscore
  });
});

function ready() {
  $("#playAgain").css("background-color", "green");
  clock = 0;
  gamedone = false;
  socket.emit("ready", params.name);
  PlayersReady = true;
  console.log("PlayersReady: " + PlayersReady);

  // Do some magic
  let player1 = $("#player1").text();

  if (params.name.toUpperCase() === player1.toUpperCase()) {
    $("#player1ready").text("Ready");
    $("#player1ready").css("background-color", "green");
  } else {
    $("#player2ready").text("Ready");
    $("#player2ready").css("background-color", "green");
  }
  $("#ready").addClass("puff-out-center");

  pageLoad();
}

function showPage() {
  $("#thePage").css("display", "block");
  $(".lds-ring").css("display", "none");
}

socket.on("ready", name => {
  let player1 = $("#player1").text();
  if (name.toUpperCase() === player1.toUpperCase()) {
    $("#player1ready").text("Ready");
    $("#player1ready").css("background-color", "green");
  } else {
    $("#player2ready").text("Ready");
    $("#player2ready").css("background-color", "green");
  }
  ServerReady = true;

  pageLoad();
});

function showLoading() {
  $(".lds-ring").css("display", "block");
  setTimeout(showPage, 800);
}

$(document).ready(function() {
  //get colors from settings storage
  var localbg = localStorage.getItem("bg");
  var localtarget = localStorage.getItem("target");
  var localtext = localStorage.getItem("ftext");
  if (!localStorage.getItem("avatar")) {
    localStorage.setItem("avatar", "js/assets/Bitmap.png");
  }

  if (localbg) {
    // console.log("found bg");
    backgroundcolor = localbg;
  }

  if (localtarget) {
    targetcolor = localtarget;
  }

  if (localtext) {
    textcolor = localtext;
  }

  myVar = setTimeout(showPage, 600);
  pageLoad();
});

$(document).ready(function() {
  $("#vs").hover(
    function() {
      socket.emit("hoveredVS");
    },
    function() {
      socket.emit("leftVS");
    }
  );
});

socket.on("hoveredVS", () => {
  if (!$("#vs").hasClass("tilt")) {
    $("#vs").addClass("tilt");
  }
});

socket.on("leftVS", () => {
  if ($("#vs").hasClass("tilt")) {
    $("#vs").removeClass("tilt");
  }
});

function pageLoad() {
  let player1 = $("#player1").text();
  let player2 = $("#player2").text();
  let winner = $("#winner").text();
  let loser = $("#loser").text();
  console.log(player2.trim() == "");
  if (params) {
    if (
      params.name.toUpperCase() === player1.toUpperCase() ||
      winner.toUpperCase() == params.name.toUpperCase()
    ) {
      $("#playercard1").css("border", "solid");
      if (player2.trim() != "") {
        $("#playercard2").css("border", "solid gray");
      }
    } else {
      $("#playercard2").css("border", "solid");
      $("#playercard1").css("border", "solid gray");
    }

    //play again and ending screen
    if (winner === params.name) {
      $("#playercard1winner").css("border", "solid");
      $("#playercard2loser").css("border", "solid gray");
    } else {
      $("#playercard2loser").css("border", "solid");
      $("#playercard1winner").css("border", "solid gray");
    }
  }

  if (gamedone && (!PlayersReady && !ServerReady)) {
    $("#wrap").css("display", "none");
    $("#playAgainScreen").css("display", "inline-block");

    if (localdata && reloadEndingPage) {
      socket.emit("showSnackbar", localdata);
      $("#winner").text(localdata.localwinner);
      $("#loser").text(localdata.localloser);
      $("#winnerscore").text(localdata.localwinnerscore);
      $("#loserscore").text(localdata.localloserscore);

      socket.emit("getuseravatar", {
        name1: localdata.localwinner,
        name2: localdata.localloser,
        room: params.room
      });

      socket.on("getuseravatar", data => {
        $("#av1").attr("src", data.avatar1);
        $("#av2").attr("src", data.avatar2);
      });
      reloadEndingPage = false;
    }

    gameStarted = false;
    wave = 0;
  } else {
    if (!PlayersReady && !ServerReady) {
      $("#wrap").css("display", "none");
      $("#roommessage").text("Waiting for another player to join");
    }
    if (PlayersReady && ServerReady && !gameStarted) {
      runonce = true;
      score = 0;
      PlayersReady = true;
      Opponentscore = 0;
      gameStarted = true;
      gamedone = false;

      $("#ReadyScreen").css("display", "none");
      $("#playAgain").css("background-color", "gray");
      $("#playAgainScreen").css("display", "none");
      if (!game1 && !game2) {
        $("#thePage").css("display", "none");
        myVar2 = setTimeout(showLoading, 500);
        clock = 0;
        $("#wrap").css("display", "flex");
        var mySketch = defineSketch(true);
        var game1 = new p5(mySketch, "myContainer");
        var mySketch = defineSketch(false);
        var game2 = new p5(mySketch, "myContainer2");
      }
    }
  }
}
