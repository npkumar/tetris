const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20); 

const matrix = [
  // T shape
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

const colors = ['cyan', 'blue', 'orange', 'yellow', 'green', 'violet', 'red'];
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0
};

const arena = createMatrix(12, 20);

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000; // 1 second

function updateScore() {
  document.getElementById('score').innerText = `Score: ${player.score}`;
};

/**
 * Sweeps arena for filled (1) rows
 * If found, splices it, resets to unfilled (0)
 * And the row back at top of arena (unshift)
 * Reset the offset of height, since we spliced
 */
function arenaSweep() {
  let rowCount = 1;

  // sweep from bottom
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      // not filled
      if (arena[y][x] === 0) {
        // we want to skip that row completely
        continue outer;
      }
    }

    // the row has been filled, so we need to remove it
    // splice the row, assign and fill it back with  0
    const row = arena.splice(y, 1)[0].fill(0);

    // and put it back on the top
    arena.unshift(row);

    // since we removed an index, we need to offset y
    ++y;

    // increase player score and increase score the next time
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

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
        // Don't do this if you can't take strobes
        // each cell changes color for every frame refresh
        context.fillStyle = colors[Math.floor((Math.random() * colors.length) + 1)];
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

  // if there is a collision on reset, game over
  if (collision(arena, player)) {
    // clear arena
    arena.forEach(row => row.fill(0));

    // reset player
    player.score = 0;
    updateScore();
  }
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

    // remove filled rows if any
    arenaSweep();

    // update player score
    updateScore();
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

/**
 * MAIN
 */
// first reset player
playerReset();

// bootstrap score
updateScore();

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