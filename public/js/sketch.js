var score = 0;
var missed = 3;
var username;
var gameStarted = false;
var dots = [];
var opdots = [];
var params;
// Client side connect
var socket = io();
var winnnerCheck = 0;
var winner;
var gamedone = false;
var seeIfChanged;

socket.on("connect", function() {
  params = jQuery.deparam(window.location.search);
  socket.emit("join", params, function(err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    } else {
    }
  });
});

socket.on("disconnect", function() {
  console.log("Disconnected from server");
});

//score

//Sketch below
function defineSketch(isPlayer) {
  return function(sketch) {
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
          this.diameter = sketch.random(50, 100);
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
      updateText();
      let myCanvas = sketch.createCanvas(700, 600);
      if (isPlayer) {
        for (var i = 0; i <= 5; i++) {
          dots.push(new myCircle());
        }
      }
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
            score++;
            dots[i].c = sketch.color(111, 204, 0);
            dots.splice(i, 1);
            generateAnotherDot();
            break;
          } else {
            myLength--;
            if (myLength == 0) {
              // missed--; add this back in to make it lose lives on miss
            }
          }
        }
      };
    }

    function generateAnotherDot() {
      dots.push(new myCircle());
    }

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
      if (gameStarted) {
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
      if (gamedone) {
        console.log(winner);
        sketch.clear();
        if (isPlayer)
          sketch.text(
            "Game Over, Winner was: " + winner,
            width / 3.8,
            height / 2
          );
      }
      if (score > 15) {
        socket.emit("winner", params.name);
      }
    };
  };
}

socket.on("winner", name => {
  gamedone = true;
  winner = name;
});
function updateText() {
  if (gameStarted) {
    // $("h3").text("Highest Score: " + localStorage.getItem("score") || 0);
  }
}

socket.on("start", function(data) {
  gameStarted = true;
});

var mySketch = defineSketch(true);
new p5(mySketch, "myContainer");

var mySketch = defineSketch(false);
new p5(mySketch, "myContainer2");
