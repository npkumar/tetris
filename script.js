const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20); 

const matrix = [
  // T shape
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

const player = {
  pos: {x: 5, y: 5},
  matrix
};

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000; // 1 second

drawMartrix = (matrix, offset) => {
  const unitSize = 1;
  // forEach (currentValue, index)
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value != 0) {
        context.fillStyle = 'red';
        context.fillRect(
          x + offset.x,
          y + offset.y,
          unitSize,
          unitSize
        );
      }
    });
  });
}

draw = () => {
  // clear the canvas first
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMartrix(player.matrix, player.pos);
}

update = (time = 0) => {
  const deltaTime = time - lastTime;
  lastTime = time;

  // dropCounter increases to dropInterval (1s)
  // move player postion and reset the dropCounter
  dropCounter += deltaTime;
  if (dropCounter >= dropInterval) {
    player.pos.y++;
    dropCounter = 0;
  }

  draw();
  requestAnimationFrame(update);
}

update();