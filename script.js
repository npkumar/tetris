const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20); 
context.fillStyle = 'black';
context.fillRect(0, 0, canvas.width, canvas.height);

const matrix = [
  // T shape
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

drawMartrix = matrix => {
  // forEach (currentValue, index)
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value != 0) {
        context.fillStyle = 'red';
        context.fillRect(x, y, 1, 1);
      }
    });
  });
}

drawMartrix(matrix);