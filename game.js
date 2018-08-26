function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function onLoad() {
var canvas = document.getElementById('tutorial');
if (canvas.getContext) {
  var ctx = canvas.getContext('2d');

  let blocks = [];
  let max_bombs = 2;
  let bombs = max_bombs;
  let state = 'placing';
  let power = 0;
  let power_up = 10;
  let placed = 0;
  let score = 0;
  let curr_move = 0;
  let max_move = 30;

  for (let y = (15 + (5*30)); y < 300; y += 30 ) {
    for (let x = 15; x < 300; x += 30 ) {
        if (Math.random() < 0.25) {
            continue;
        }
        blocks.push({
            x: x,
            y: y,
            size: 20,
            power: 1,
            id: blocks.length,
            bomb: false,
            explosion: undefined
        });
    }
  }
  
  function drawBlock(block) {
      if (block.bomb) {
        ctx.fillStyle = 'rgb(255, 0, 255)';
      } else {
        ctx.fillStyle = 'rgb(128, ' + block.power * 255 + ', ' + block.power * 255 + ')';
      }
      ctx.fillRect(block.x - (block.size/2), block.y - (block.size/2), block.size, block.size);
  };

  function drawPower() {
      ctx.save();
      ctx.clearRect(100, 2, 50, 8);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.strokeRect(100, 2, 50, 8);
      ctx.fillStyle = 'rgb(255, 0, 255)';
      let length = power / power_up;
      length = Math.min(length, 1);
      ctx.fillRect(102, 4, 46 * length, 4);
      ctx.restore();
  }


  let explosions = [];

  function drawExplosion(ex) {
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI*2, true);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, ' + (ex.power - ex.radius)/ex.power + ')';
      ctx.fill();
  };

  function updateExplosions() {
      explosions.forEach(function(ex) {
          ex.radius += 1;
      });
      old_exp = [];
      explosions = explosions.filter(function(ex) {
          if (ex.radius > ex.power) {
              old_exp.push(ex);
              return false;
          } else {
              return true;
          }
      });

      let changed = false;
      blocks.forEach(function(bl) {
          old_exp.forEach(function(ex) {
              let dist = Math.sqrt((bl.x - ex.x)*(bl.x - ex.x) + (bl.y - ex.y)*(bl.y - ex.y));
              if (dist < ex.power) {
                  let blast = 1 - (dist / ex.power);
                  bl.power -= blast;
                  changed = true;
                  if (bl.bomb) {
                    if (bl.explosion === undefined) {
                        let explosion = {
                            x: bl.x,
                            y: bl.y,
                            radius: 1,
                            power: 3 * bl.size * (bl.power + (blast*3))
                        };
                        bl.explosion = explosion;
                        explosions.push(explosion);
                    } else {
                        bl.explosion.power += 3*bl.size*blast;
                    }
                    bl.power = -1;
                  } else {
                      power += blast;
                      score += blast;
                  }
              }
          });
      });
      blocks = blocks.filter(bl => bl.power >= 0);
      if (changed) {
        window.requestAnimationFrame(drawScene);
      }
  };

  function moveBlocks() {
      blocks.forEach(function(b) {
          b.y -= 1;
      });
      curr_move -= 1;
  }

  function addBlocks() {
    for (let x = 15; x < 300; x += 30) {
        if (Math.random() < 0.25) {
            continue;
        }
        blocks.push({
            x: x,
            y: 315,
            size: 20,
            power: 1,
            id: blocks.length,
            bomb: false,
            explosion: undefined
        });
    }
  }

  function getTopBlock() {
      return blocks.reduce((a, b) => Math.min(a, b.y), 300);
  }


  function drawScene() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      blocks.forEach(drawBlock);
      if (state == 'exploding') {
        explosions.forEach(drawExplosion);
        updateExplosions();
        if (explosions.length == 0) {
            state = 'destructing';
        }
      }

      if (state == 'initializing') {
          state = 'placing';
          window.requestAnimationFrame(drawScene);
      } else if (state == 'exploding') {
        window.requestAnimationFrame(drawScene);
      } else if (state == 'destructing') {
          state = 'moving';
          addBlocks();
          if (power > power_up) {
              power = 0;
              power_up *= 1.1;
              max_bombs += 1;
              console.log('Powerup: ' + power_up);
          }
          bombs = max_bombs;
          curr_move = max_move;
          window.requestAnimationFrame(drawScene);
      } else if (state == 'moving') {
          if (curr_move == 0) {
              let top = getTopBlock();
              console.log(top);
              if (top <= 15) {
                  state = 'dying';
              } else if (top >= (15 + 4*30)) {
                  addBlocks();
                  curr_move = max_move;
              } else {
                state = 'initializing';
              }
              console.log(state);
          } else {
              moveBlocks();
          }
          window.requestAnimationFrame(drawScene);
      } else if (state == 'dying') {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.font = '24px serif';
        ctx.fillText('Game Over', 10, 100);
      }


      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.font = '12px serif';
      ctx.fillText('Bombs left: ' + bombs, 10, 10);
//              ctx.fillText('Power: ' + power.toFixed(2), 100, 10);
      drawPower();
      ctx.fillText('Placed: ' + placed, 10, 26);
      ctx.fillText('Score: ' + score.toFixed(2), 100, 26);
  };

  drawScene();

  function findBlock(coords) {
      for (let i = 0; i < blocks.length; i++) {
          let bl = blocks[i];
          if (Math.abs(bl.x - coords.x) < (bl.size / 2) &&
              Math.abs(bl.y - coords.y) < (bl.size / 2)) {
            return bl;
          }
      }
      return;
  }

  canvas.addEventListener('click', function(event) { 
      if (state != 'placing') {
          return;
      } 
      coords = canvas.relMouseCoords(event);
      let block = findBlock(coords);
      if (block) {
          bombs -= 1;
          if (!block.bomb) {
            placed += 1;
          }
          if (block.bomb || bombs == 0) {
            state = 'exploding';
            let explosion = {
              x: block.x,
              y: block.y,
              radius: 1,
              power: 3 * block.power * block.size
            };
            block.explosion = explosion;
            explosions.push(explosion);
            power += block.power;
            score += block.power;
            block.power = -1;
          }
          block.bomb = true;
          window.requestAnimationFrame(drawScene);
      } else {
      }


      }
  );
}
}