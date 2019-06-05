//imports
console.log("%c This is kinda cool! ", "background: #222; color: #bada55");
// Data
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
          this.c = sketch.color("#FF5733");
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
      var canvasWidth = sketch.windowWidth / 2 - 20;
      updateText();
      let myCanvas = sketch.createCanvas(canvasWidth, 600);
      if (isPlayer) {
        clocktimer = setInterval(timeIt, 1000);

        for (var i = 0; i <= 1; i++) {
          dots.push(new myCircle());
        }
      }
    };

    function generateAnotherDot() {
      dots.push(new myCircle());
    }

    function timeIt() {
      socket.emit("score", score);
      clock++;
      if (clock % 3 === 0) {
        generateNewWave();
      }
    }

    function generateNewWave() {
      if (isPlayer && !gamedone) {
        sendCircle();
        console.log(dots.length > dots.length / 2.5);
        if (dots.length > 3) {
          gamedone = true;
        }
        score -= dots.length;
        wave++;
        dots = [];
        for (var i = 0; i < clock / 3; i++) {
          dots.push(new myCircle());
        }
      }
    }

    sketchwindowResized = function() {
      resizeCanvas(canvasWidth, 600);
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

    if (isPlayer) {
      sketch.mousePressed = function() {
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
            console.log(dots[i].diameter);
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
      };
    }

    socket.on("winner", name => {
      clearInterval(clocktimer);

      localdata = name;
      sketch.remove();
      opdots = [];
      dots = [];
      //PlayersReady && ServerReady && !gameStarted
      gameStarted = false;
      gamedone = true;
      PlayersReady = false;
      ServerReady = false;
      pageLoad();
    });

    socket.on("score", newScore => {
      console.log(newScore);
      Opponentscore = newScore;
    });

    socket.on("opponentcircles", data => {
      if (change != opdots) {
        opdots = [];
        data.map(d => {
          opdots.push(new myCircle(d.x, d.y, d.diameter));
        });
      }
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
        sketch.background(51);

        if (missed > 0) {
          if (!isPlayer) {
            if (opdots.length > 0) {
              for (let k = 0; k < opdots.length; k++) {
                if (opdots.length > 0) {
                  opdots[k].display();
                }
              }
            }
            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            sketch.stroke("#cee");
            sketch.strokeWeight(1);
            sketch.text("Score: " + Opponentscore, 30, 70);
            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            // sketch.text("Lives: " + Opponentmissed, 30, 95);
            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            drawServerMouse();
          } else {
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

            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            sketch.stroke("#cee");
            sketch.strokeWeight(1);
            sketch.text("Score: " + score, 30, 70);
            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            sketch.text("Clock: " + clock, 30, 100);
            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            sketch.text("Wave: " + wave, 30, 130);
          }
        }
        if (gamedone) {
          console.log("game done was called local here");
          socket.emit("clockended", { name: params.name, score: score });
        }

        // EMIT TIMER ENDED
      } else {
        console.log("game being cleared");
        sketch.clear();
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
  var counter = 0;
  if (!data) {
    console.warn("user data was null: " + data);
    socket.emit("connection");
  }
  data.map(dat => {
    counter++;
    var text = $("#player" + counter).text(dat);
    var text = $("#player" + counter).css("opacity", "1");

    if (text.length <= 0) {
      console.log("EMPTY :/");
      location.reload();
    }

    $(text).addClass("blue");
  });

  pageLoad();
});

socket.on("gamewinner", data => {
  var localwinner;
  var localwinnerscore;
  var localloser;
  var localloserscore;

  if (data.score > score) {
    localwinnerscore = data.score;
    localwinner = data.name;
    localloser = params.name;
    localloserscore = score;
    console.log(data.name + " is the winner with a score of " + score);
  } else {
    localwinner = params.name;
    localwinnerscore = score;
    localloser = data.name;
    localloserscore = data.score;
    console.log(params.name + " is the loser with a score of " + data.score);
  }

  socket.emit("winner", {
    localwinner,
    localwinnerscore,
    localloser,
    localloserscore
  });
});

function ready() {
  clock = 0;
  gamedone = false;
  socket.emit("ready", params.name);
  PlayersReady = true;
  console.log("PlayersReady: " + PlayersReady);

  // Do some magic
  let player1 = $("#player1").text();
  if (params.name === player1) {
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
  console.log("this should be called only on page change hopefully");
}

socket.on("ready", name => {
  if (name === player1) {
    $("#player1ready").text("Ready");
    $("#player1ready").css("background-color", "green");
  } else {
    $("#player2ready").text("Ready");
    $("#player2ready").css("background-color", "green");
  }
  ServerReady = true;
  console.log("ServerReady: " + ServerReady);
  pageLoad();
});

function showLoading() {
  $(".lds-ring").css("display", "block");
  setTimeout(showPage, 800);
}

$(document).ready(function() {
  myVar = setTimeout(showPage, 600);
  pageLoad();
});

function pageLoad() {
  if (gamedone && (!PlayersReady && !ServerReady)) {
    $("#wrap").css("display", "none");
    $("#playAgainScreen").css("display", "inline-block");
    console.log(localdata);
    $("#winner").text(localdata.localwinner);
    $("#loser").text(localdata.localloser);
    $("#winnerscore").text(localdata.localwinnerscore);
    $("#loserscore").text(localdata.localloserscore);
    gameStarted = false;
    wave = 0;
  } else {
    if (!PlayersReady && !ServerReady) {
      $("#wrap").css("display", "none");
      $("#roommessage").text("Waiting for another player to join");
    }
    if (PlayersReady && ServerReady && !gameStarted) {
      score = 0;
      Opponentscore = 0;
      gameStarted = true;
      gamedone = false;
      $("#ReadyScreen").css("display", "none");
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
