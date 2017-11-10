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
  matrix: createPiece('T')
};

const arena = createMatrix(12, 20);

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000; // 1 second

/**
 * Check if any location on player matrix
 * and corresponding position on arena matrix is not 0
 * If both not 0, collision occured.
 * @param {Integer[][]} arena
 * @param {Object} player
 */
function collision(arena, player) {
  const [m , p] = [player.matrix, player.pos];

  // iterate over the player
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (
        // player position is not 0
        m[y][x] !== 0 &&
        // arena position is not 0
        (
          arena[y + p.y] &&
          arena[y + p.y][x + p.x]
        ) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Creates an all 0 matrix
 * @param {Integer} w width
 * @param {Integer} h height
 * 
 * @returns {Integer[][]} all zero matrix of size w * h
 */
function createMatrix(w, h){
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

/**
 * @see https://en.wikipedia.org/wiki/Tetromino
 * @param {String} type 
 */
function createPiece(type) {
  switch (type) {
    case 'T':
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
      break;
    case 'O':
      return [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 0],
      ];
      break;
    case 'S':
      return [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ];
      break;
    case 'Z':
      return [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ];
      break;
    case 'I':
      return [
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
      ];
      break;
    case 'J':
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ];
      break;
    case 'L':
      return [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ];
      break;
    default:
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
  }
}

/**
 * Copies values from player matrix to arena matrix
 * @param {Integer[][]} arena
 * @param {Object} player
 * @param {Integer[][]} player.matrix 
 */
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value != 0) {
        // x y for T shape
        // 0 1
        // 1 1
        // 2 1
        // 1 2
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  // transponse
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      // tuple switch
      [
        matrix[x][y],
        matrix[y][x]
      ] = [
        matrix[y][x],
        matrix[x][y]
      ];
    }
  }

  // reverse
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

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

  // we need to show the collisions, draw arena
  drawMartrix(arena, {x: 0, y: 0});

  // draw the player on canvas of course
  drawMartrix(player.matrix, player.pos);
}

function playerReset() {
  const pieces = 'IJLOSTZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);
}

playerDrop = () => {
  player.pos.y++;
  if (collision(arena, player)) {
    // move back the player
    player.pos.y--;

    // merge location on arena
    merge(arena, player);

    // player now starts from the top
    // reset the player piece
    // postion the piece in the middle
    playerReset();
  }
  dropCounter = 0;
}

playerMove = dir => {
  player.pos.x += dir;
  if (collision(arena, player)) {
    player.pos.x -= dir;
  }
}

playerRotate = dir => {
  rotate(player.matrix, dir);
  while (collision(arena, player)) {
    // undo the last rotate
    // TODO: fix this if you want the player
    // rotate to jump off the wall
    rotate(player.matrix, -dir);
  }
}

update = (time = 0) => {
  const deltaTime = time - lastTime;
  lastTime = time;

  // dropCounter increases to dropInterval (1s)
  // move player postion and reset the dropCounter
  dropCounter += deltaTime;
  if (dropCounter >= dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

// main update call
update();

// keyboard controls
document.addEventListener('keydown', event => {
  // or use keyCode, code is more readable
  if (event.code === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.code === 'ArrowRight') {
    playerMove(1);
  } else if (event.code === 'ArrowDown') {
    playerDrop();
  } else if (event.code === 'KeyQ') {
    playerRotate(-1);
  } else if (event.code === 'KeyW' || event.code === 'Space') {
    playerRotate(1);
  }
});