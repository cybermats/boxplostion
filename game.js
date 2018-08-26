function relMouseCoords(event) {
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;
  var currentElement = this;

  do {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  } while (currentElement = currentElement.offsetParent)

      canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  return { x: canvasX, y: canvasY }
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function onLoad() {
  var canvas = document.getElementById('tutorial');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    const constants = {
      width: canvas.width,
      height: canvas.width,
      box_size: 20,
      box_spacing: 30
    };

    var config_state = {max_bombs: 2, power_up: 10, max_move: 30};
    var game_state = {
      blocks: [],
      bombs: config_state.max_bombs,
      state: 'placing',
      power: 0,
      score: 0,
      curr_move: 0
    };

    for (let y = (constants.box_spacing / 2 + (5 * constants.box_spacing));
         y < constants.height; y += constants.box_spacing) {
      for (let x = constants.box_spacing / 2; x < constants.width;
           x += constants.box_spacing) {
        if (Math.random() < 0.25) {
          continue;
        }
        game_state.blocks.push({
          x: x,
          y: y,
          size: constants.box_size,
          power: 1,
          id: game_state.blocks.length,
          bomb: false,
          explosion: undefined
        });
      }
    }

    function drawBlock(block) {
      if (block.bomb) {
        ctx.fillStyle = 'rgb(255, 0, 255)';
      } else {
        ctx.fillStyle =
            'rgb(128, ' + block.power * 255 + ', ' + block.power * 255 + ')';
      }
      ctx.fillRect(
          block.x - (block.size / 2), block.y - (block.size / 2), block.size,
          block.size);
    };

    function drawPower() {
      ctx.save();
      ctx.clearRect(100, 2, 50, 8);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.strokeRect(100, 2, 50, 8);
      ctx.fillStyle = 'rgb(255, 0, 255)';
      let length = game_state.power / config_state.power_up;
      length = Math.min(length, 1);
      ctx.fillRect(102, 4, 46 * length, 4);
      ctx.restore();
    }


    let explosions = [];

    function drawExplosion(ex) {
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle =
          'rgba(0, 0, 0, ' + (ex.power - ex.radius) / ex.power + ')';
      ctx.fill();
    };

    function updateExplosions() {
      explosions.forEach(function(ex) { ex.radius += 1; });
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
      game_state.blocks.forEach(function(bl) {
        old_exp.forEach(function(ex) {
          let dist = Math.sqrt(
              (bl.x - ex.x) * (bl.x - ex.x) + (bl.y - ex.y) * (bl.y - ex.y));
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
                  power: 3 * bl.size * (bl.power + (blast * 3))
                };
                bl.explosion = explosion;
                explosions.push(explosion);
              } else {
                bl.explosion.power += 3 * bl.size * blast;
              }
              bl.power = -1;
            } else {
              game_state.power += blast;
              game_state.score += blast;
            }
          }
        });
      });
      game_state.blocks = game_state.blocks.filter(bl => bl.power >= 0);
      if (changed) {
        window.requestAnimationFrame(drawScene);
      }
    };

    function moveBlocks() {
      game_state.blocks.forEach(function(b) { b.y -= 1; });
      game_state.curr_move -= 1;
    }

    function addBlocks() {
      for (let x = 15; x < 300; x += 30) {
        if (Math.random() < 0.25) {
          continue;
        }
        game_state.blocks.push({
          x: x,
          y: 315,
          size: 20,
          power: 1,
          bomb: false,
          explosion: undefined
        });
      }
    }

    function getTopBlock() {
      return game_state.blocks.reduce((a, b) => Math.min(a, b.y), 300);
    }


    function drawScene() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      game_state.blocks.forEach(drawBlock);
      if (game_state.state == 'exploding') {
        explosions.forEach(drawExplosion);
        updateExplosions();
        if (explosions.length == 0) {
          game_state.state = 'destructing';
        }
      }

      if (game_state.state == 'initializing') {
        game_state.state = 'placing';
        window.requestAnimationFrame(drawScene);
      } else if (game_state.state == 'exploding') {
        window.requestAnimationFrame(drawScene);
      } else if (game_state.state == 'destructing') {
        game_state.state = 'moving';
        addBlocks();
        if (game_state.power > config_state.power_up) {
          game_state.power = 0;
          config_state.power_up *= 1.1;
          config_state.max_bombs += 1;
          console.log('Powerup: ' + config_state.power_up);
        }
        game_state.bombs = config_state.max_bombs;
        game_state.curr_move = config_state.max_move;
        window.requestAnimationFrame(drawScene);
      } else if (game_state.state == 'moving') {
        if (game_state.curr_move == 0) {
          let top = getTopBlock();
          console.log(top);
          if (top <= 15) {
            game_state.state = 'dying';
          } else if (top >= (15 + 4 * 30)) {
            addBlocks();
            game_state.curr_move = config_state.max_move;
            ;
          } else {
            game_state.state = 'initializing';
          }
          console.log(game_state.state);
        } else {
          moveBlocks();
        }
        window.requestAnimationFrame(drawScene);
      } else if (game_state.state == 'dying') {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.font = '24px serif';
        ctx.fillText('Game Over', 10, 100);
      }


      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.font = '12px serif';
      ctx.fillText('Bombs left: ' + game_state.bombs, 10, 10);
      //              ctx.fillText('Power: ' + power.toFixed(2), 100, 10);
      drawPower();
      ctx.fillText('Score: ' + game_state.score.toFixed(2), 100, 26);
    };

    drawScene();

    function findBlock(coords) {
      for (let i = 0; i < game_state.blocks.length; i++) {
        let bl = game_state.blocks[i];
        if (Math.abs(bl.x - coords.x) < (bl.size / 2) &&
            Math.abs(bl.y - coords.y) < (bl.size / 2)) {
          return bl;
        }
      }
      return;
    }

    canvas.addEventListener('click', function(event) {
      if (game_state.state != 'placing') {
        return;
      }
      coords = canvas.relMouseCoords(event);
      let block = findBlock(coords);
      if (block) {
        game_state.bombs -= 1;
        if (!block.bomb) {
        }
        if (block.bomb || game_state.bombs == 0) {
          game_state.state = 'exploding';
          let explosion = {
            x: block.x,
            y: block.y,
            radius: 1,
            power: 3 * block.power * block.size
          };
          block.explosion = explosion;
          explosions.push(explosion);
          game_state.power += block.power;
          game_state.score += block.power;
          block.power = -1;
        }
        block.bomb = true;
        window.requestAnimationFrame(drawScene);
      } else {
      }


    });
  }
}
