//imports
console.log("%c This is kinda cool! ", "background: #222; color: #bada55");
// Data
var clocktimer;
var latestscoreupdate = 0;
var ClientReady = false;
var ServerReady = false;
var localdata;
var secondwhenover = 0;
var clock = 45;
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
      if (sketch.keyCode === 32 && missed > 3) {
        missed = 0;
        score = 0;
      }
    };

    sketch.setup = function() {
      if (!clocktimer) {
        clocktimer = setInterval(timeIt, 1000);
      }
      var canvasWidth = sketch.windowWidth / 2 - 20;
      updateText();
      let myCanvas = sketch.createCanvas(canvasWidth, 600);
      if (isPlayer) {
        for (var i = 0; i <= 5; i++) {
          dots.push(new myCircle());
        }
      }
    };

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
        if (missed <= 0) {
          missed = 4;
          score = 0;
        }
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
            generateAnotherDot();
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

    function generateAnotherDot() {
      dots.push(new myCircle());
    }

    socket.on("winner", name => {
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
            // sketch.text("Lives: " + missed, 30, 95);
            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            sketch.text("Time Left: " + clock, 30, 100);
          }
        }
        if (clock <= secondwhenover && !gamedone) {
          gamedone = true;
          socket.emit("clockended", { name: params.name, score: score });
        }

        // EMIT TIMER ENDED
      } else {
        sketch.clear();
        if (isPlayer) {
          sketch.text(
            "Need 2 Players to Play, FIRST TO 15 SCORE WINS!",
            width / 3.8,
            height / 2
          );
        }
      }
    };
  };
}

function updateText() {
  if (gameStarted) {
    // $("h3").text("Highest Score: " + localStorage.getItem("score") || 0);
  }
}

function timeIt() {
  // console.log(clock);
  clock--;
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
    console.log(params.name + " is the winner with a score of " + data.score);
  }

  socket.emit("winner", {
    localwinner,
    localwinnerscore,
    localloser,
    localloserscore
  });
});

function ready() {
  socket.emit("ready", params.name);
  PlayersReady = true;
  console.log("PlayersReady: " + PlayersReady);

  // Do some magic
  let player1 = $("#player1").text();
  let player2 = $("#player2").text();
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

$(document).ready(function() {
  pageLoad();
});

function pageLoad() {
  if (gamedone && (!PlayersReady && !ServerReady)) {
    // this is in the condition for "Play Again"
    $("#wrap").css("display", "none");
    $("#playAgainScreen").css("display", "block");
    $("#winner").text(
      "Game Over: Winner was " +
        localdata.localwinner +
        " with a score of " +
        localdata.localwinnerscore
    );
    $("#loser").text(
      "Game Over: Loser was " +
        localdata.localloser +
        " with a score of " +
        localdata.localloserscore
    );
    $("#your").css("display", "none");
    gamedone = false;
    gameStarted = false;
    score = 0;
    Opponentscore = 0;
  } else {
    if (!PlayersReady && !ServerReady) {
      $("#wrap").css("display", "none");
      $("#roommessage").text("Waiting for another player to join");
    }
    if (PlayersReady && ServerReady && !gameStarted) {
      gameStarted = true;
      $("#ReadyScreen").css("display", "none");
      $("#wrap").css("display", "flex");
      if (!game1 && !game2) {
        clock = 45;
        var mySketch = defineSketch(true);
        var game1 = new p5(mySketch, "myContainer");
        var mySketch = defineSketch(false);
        var game2 = new p5(mySketch, "myContainer2");
      }
    }
  }
}
