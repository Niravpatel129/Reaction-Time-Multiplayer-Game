//imports

// Data
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
var winner;
var gamedone = false;
var seeIfChanged;
var PlayersReady = false;

socket.on("connect", function() {
  params = jQuery.deparam(window.location.search);
  socket.emit("join", params, function(err) {
    user = params.name;
    if (err) {
      swal("Error!", err, "error");
      window.location.href = "/";
    }
  });
});

socket.on("disconnect", function() {
  socket.emit("clearlobby");
  console.log("Disconnected from server");
});

socket.on("clearlobby", () => {
  swal("Error!", "Your opponent quit", "error").then(() => {
    window.location.href = "/";
  });
});

//Sketch below
function defineSketch(isPlayer) {
  return function(sketch) {
    sketch.preload = function() {
      sketch.soundFormats("mp3", "ogg");
      song = sketch.loadSound("js/assets/Input-04a.mp3");
      miss = sketch.loadSound("js/assets/Input-05.mp3");
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
          this.c = sketch.color("#FA8072");
        }
      }
      display() {
        sketch.fill(this.c);
        sketch.ellipse(this.x, this.y, this.diameter, this.diameter);
      }
    }

    sketch.keyPressed = function() {
      if (sketch.keyCode === 32 && missed > 3) {
        missed = 0;
        score = 0;
      }
    };

    sketch.setup = function() {
      setInterval(timeIt, 1000);

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

            score++;
            socket.emit("score", score);
            dots[i].c = sketch.color(111, 204, 0);
            dots.splice(i, 1);
            generateAnotherDot();
            break;
          } else {
            myLength--;
            if (myLength == 0) {
              console.log("missed :(");
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
      sketch.remove();
      opdots = [];
      dots = [];
      console.log("stalp :(");
      //PlayersReady && ServerReady && !gameStarted
      gameStarted = false;
      gamedone = true;
      PlayersReady = false;
      ServerReady = false;
      winner = name;
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
            sketch.text("Lives: " + Opponentmissed, 30, 95);
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
            }
            seeIfChanged = mydots;

            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            sketch.stroke("#cee");
            sketch.strokeWeight(1);
            sketch.text("Score: " + score, 30, 70);
            sketch.fill(sketch.color(255, 255, 255));
            sketch.textSize(23);
            sketch.text("Lives: " + missed, 30, 95);
          }
        }
        if (score >= 15) {
          socket.emit("winner", params.name);
        }
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
  clock++;
  console.log(clock);
}

socket.on("start", function(data) {
  pageLoad();
});

socket.on("users", function(data) {
  var counter = 0;

  data.map(dat => {
    counter++;
    var text = $("#p" + counter).text("Player " + counter + ": " + dat);

    $(text).addClass("blue");
  });
  if (data.length == 2) {
    $("#ready").css("display", "flex");
  }
  pageLoad();
});
var ClientReady;
var ServerReady;

function ready() {
  socket.emit("ready", params.name);
  PlayersReady = true;
  console.log("PlayersReady: " + PlayersReady);
  pageLoad();
}

socket.on("ready", () => {
  ServerReady = true;
  console.log("ServerReady: " + ServerReady);
  pageLoad();
});

$(document).ready(function() {
  pageLoad();
});

function pageLoad() {
  console.log(PlayersReady, ServerReady);
  if (gamedone && (!PlayersReady && !ServerReady)) {
    $("#wrap").css("display", "none");
    $("#ReadyScreen").css("display", "block");
    $("#roommessage").text("Game Over: Winner was " + winner);
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
        var mySketch = defineSketch(true);
        var game1 = new p5(mySketch, "myContainer");
        var mySketch = defineSketch(false);
        var game2 = new p5(mySketch, "myContainer2");
      }
    }
  }
}
