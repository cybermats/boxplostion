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

function circleIntersect(c1, c2) {
    let x2 = (c1.x - c2.x) * (c1.x - c2.x);
    let y2 = (c1.y - c2.y) * (c1.y - c2.y);
    let h2 = (c1.r + c2.r) * (c1.r + c2.r);
    return (x2 + y2) < h2;
}

function calcWallPositions(c, r) {
    let ab = c.x - r;
    let ac = c.radius + r;
    let cosphi = ab / ac;
    if (cosphi > 1 || cosphi < -1) {
        return;
    }
    let sinphi = Math.sqrt(1 - (cosphi*cosphi));
    console.log(ab, ac, cosphi, sinphi);

    let bc = ac * sinphi;

    let x1 = r;
    let y1 = c.y + bc;
    let x2 = r;
    let y2 = c.y - bc;

    return [
        {x: x1, y: y1},
        {x: x2, y: y2}
    ];
}

function calcPositions(c1, c2, r) {
    let ab2 = ((c1.x - c2.x) * (c1.x - c2.x)) + 
      ((c1.y - c2.y) * (c1.y - c2.y));
    if (ab2 < 0.0001) {
        return;
    }
    let ab = Math.sqrt(ab2);
    let ac = c1.radius + r;
    let ac2 = ac*ac;
    let bc = c2.radius + r;
    let bc2 = bc*bc;

    let cosphi = (ab2 + ac2 - bc2) / (2 * ab * ac);
    if (cosphi > 1) {
        return;
    }
    let sinphi = Math.sqrt(1 - (cosphi*cosphi));

    let x1 = c1.x + (ac/ab)*(cosphi * (c2.x - c1.x) - sinphi*(c2.y - c1.y));
    let y1 = c1.y + (ac/ab)*(sinphi * (c2.x - c1.x) + cosphi*(c2.y - c1.y));

    let x2 = c1.x + (ac/ab)*(cosphi * (c2.x - c1.x) + sinphi*(c2.y - c1.y));
    let y2 = c1.y + (ac/ab)*(-sinphi * (c2.x - c1.x) + cosphi*(c2.y - c1.y));

    return [
      {x: x1, y: y1},
      {x: x2, y: y2}
    ];
}


function onLoad() {
  var canvas = document.getElementById('tutorial');
  if (!canvas.getContext) {
    return;
  }

  var ctx = canvas.getContext('2d');

  const settings = {max_size: 0.5, min_size: 0.1};

  var state = {max_bombs: 2, cur_bombs: 2, power_up: 10, cur_power: 0};

  var circles = [];

  function generateRadius() {
    let smallest_side = Math.min(canvas.width, canvas.height);
    let scale = settings.min_size +
        (Math.random() * (settings.max_size - settings.min_size));
    console.log('scale: ' + scale);
    let radius = 0.5 * smallest_side * scale;
    console.log('smallest_side: ' + smallest_side);
    console.log('radius: ' + radius);
    return radius;
  }

  function addCircle() {
    let radius = generateRadius();
    let circle = {x: radius, y: radius, radius: radius};
    circles.push(circle);
  }


  function getAllPlacements() {
      for (let i = 0; i < circles.length - 1; i++) {
          for (let j = i + 1; j < circles.length; j++) {

          }
      }
  }


  function drawCircle(circle) {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 128, 0, 0.5)';
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(drawCircle);
  }

 // addCircle();
  let c1 = {x: 30, y: 150, radius: 30};
  let c2 = {x: 80, y: 120, radius: 30};
  circles.push(c1);
//  circles.push(c2);

  let r = 50;
  let pos = calcWallPositions(c1, r);
  if (pos) {
    console.log(pos);
    circles.push({x: pos[0].x, y: pos[0].y, radius: r});
    circles.push({x: pos[1].x, y: pos[1].y, radius: r});
  } else {
      console.log('invalid position');
  }

  draw();
}