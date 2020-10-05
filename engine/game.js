/*
Add your code for Game here
 */

export default class Game {
  constructor(width) {
    this.width = width;
    this.board = newBoard(width);
    this.score = 0;
    this.won = false;
    this.over = false;
    this.moveListeners = [];
    this.winListeners = [];
    this.loseListeners = [];

    this.gameState = {
      board: this.board,
      score: this.score,
      won: this.won,
      over: this.over,
    };
  }

  // Game methods:

  setupNewGame() {
    this.gameState = {
      board: newBoard(this.width),
      score: 0,
      won: false,
      over: false,
    };
  }

  loadGame(gameState) {
    this.gameState.board = gameState.board;
    this.gameState.score = gameState.score;
    this.gameState.won = gameState.won;
    this.gameState.over = gameState.over;
  }

  move(direction) {
    if (this.gameState.over) {
      return; // No moves possible!
    }
    let oldBoard = [...this.gameState.board];
    switch (direction) {
      case "up":
        this.gameState.score = moveUp(
          this.gameState.board,
          this.gameState.score
        );
        break;
      case "right":
        rotate(this.gameState.board, 3); // rotate 90 - 3x
        this.gameState.score = moveUp(
          this.gameState.board,
          this.gameState.score
        );
        rotate(this.gameState.board, 1); // rotate 90 - 1x
        break;
      case "down":
        rotate(this.gameState.board, 2); // rotate 90 - 2x
        this.gameState.score = moveUp(
          this.gameState.board,
          this.gameState.score
        );
        rotate(this.gameState.board, 2); // rotate 90 - 2x
        break;
      case "left":
        rotate(this.gameState.board, 1); // rotate 90 - 1x
        this.gameState.score = moveUp(
          this.gameState.board,
          this.gameState.score
        );
        rotate(this.gameState.board, 3); // rotate 90 - 3x
        break;
    }
    // Add random tile ONLY IF a board change occurred
    if (!arraysEqual(oldBoard, this.gameState.board)) {
      let idx = newIndex(this.width, this.gameState.board);
      this.gameState.board[idx] = newTile();
      // Check end game status: Loss or win -> runs all Listeners if Loss or win occurs
      // work on it
      checkWin(this);
      let emptySlots = this.gameState.board.filter((slot) => slot === 0).length;
      if (emptySlots === 0 && this.gameState.over === false) {
        checkLoss(this);
      }
    }
    // Pass in all move Listeners
    this.moveListeners.map((listener) => {
      listener(this.gameState);
    });
  }

  toString() {
    console.log();
    console.log("ASCII version of game board:");
    for (let i = 0; i < this.board.length; i += this.width) {
      let output = "";
      for (let j = i; j < i + this.width; j++) {
        output += ` [${this.board[j]}] `;
      }
      console.log(output);
    }
    console.log();
    console.log(
      `score: ${this.gameState.score} | won: ${this.gameState.won} | over: ${this.gameState.over}`
    );
  }

  onMove(callback) {
    this.moveListeners.push(callback);
  }

  onWin(callback) {
    this.winListeners.push(callback);
  }

  onLose(callback) {
    this.loseListeners.push(callback);
  }

  getGameState() {
    return this.gameState;
  }
}

/* HELPER METHODS */

// Check condition for Loss: board full AND when you simulate possible moves = same score
function checkLoss(game) {
  let board2D = get2D(game.gameState.board);
  // Loop horizontally and vertically to search for neighbors
  for(let row = 0; row < board2D.length - 1; row++) {
    for(let col = 0; col < board2D.length; col++) {
      if (board2D[row][col] == board2D[row+1][col]) {
        // Not a loss
        return;
      }
    }
  }
  for(let col = 0; col < board2D.length - 1; col++) {
    for(let row = 0; row < board2D.length; row++) {
      if (board2D[row][col] == board2D[row][col+1]) {
        // Not a loss
        return;
      }
    }
  }
  game.gameState.over = true;
  game.loseListeners.map((listener) => listener(game.gameState));
}

// Check condition for Win: 2048 tile exists
function checkWin(game) {
  let board = game.gameState.board;
  let win = board.filter((num) => num === 2048).length === 1;
  if (win) {
    game.gameState.won = true;
    game.gameState.over = true;
    game.winListeners.map((listener) => listener(game.gameState));
  }
}

// Generate value of next Tile (90% 2's and 10% 4's)
function newTile() {
  let num = Math.random();
  return num < 0.1 ? 4 : 2;
}

// Initialize Board state
function newBoard(width) {
  let newBoard = [];
  for (let i = 0; i < width * width; i++) {
    newBoard.push(0);
  }
  // Find 2 random indices within range to assign a Tile value
  newBoard[newIndex(width, newBoard)] = newTile();
  newBoard[newIndex(width, newBoard)] = newTile();
  return newBoard;
}

// Finds new blank index to place a new Tile
function newIndex(width, board) {
  const max = width * width - 1;
  const min = 0;
  let idx = Math.floor(Math.random() * (max - min + 1) + min);
  while (board[idx] != 0) {
    idx = Math.floor(Math.random() * (max - min + 1) + min);
  }
  return idx;
}

// Handles move() logic, returns new score
function moveUp(board, score) {
  let board2D = get2D(board);
  // v-Loop top-bottom and fill
  for (let col = 0; col < board2D.length; col++) {
    let mergedIdx = []; // Tracks row of recently merged idx (CANNOT merge again) 
    for (let row = 1; row < board2D.length; row++) {
      // If merge is possible w/ [row-1] -> merge -> break loop
      let idx = 1;
      if (board2D[row][col] != 0) {
        while (row - idx >= 0 && board2D[row - idx][col] == 0) {
          // Skip all 0's
          idx += 1;
        }
        if (row - idx >= 0 && board2D[row][col] == board2D[row - idx][col] && !mergedIdx.includes(row - idx)) {
          merge(board2D, row, col, row - idx, col, board2D[row][col] * 2);
          mergedIdx.push(row - idx);
          score += board2D[row - idx][col];
          row += 1;
        }
      }
      // If no merge, if move up possible -> move (merge with 0 + curr val)
      idx = 1;
      if (row < board2D.length && board2D[row][col] != 0 && board2D[row - 1][col] == 0) {
        while (row - 1 - idx >= 0 && board2D[row - 1 - idx][col] == 0) {
          idx += 1;
        }
        merge(board2D, row, col, row - idx, col, board2D[row][col]);
      }
    }
  }
  // Move data from 2D to 1D input param
  for (let row = 0; row < board2D.length; row++) {
    for (let col = 0; col < board2D.length; col++) {
      board[row * board2D.length + col] = board2D[row][col];
    }
  }
  return score;
}

// Merges state of 2D board from "src" to "dest", given value "val"
function merge(board2D, srcRow, srcCol, destRow, destCol, val) {
  board2D[destRow][destCol] = val;
  board2D[srcRow][srcCol] = 0;
}

// Convert 1D to 2D array
function get2D(array) {
  let arr2D = [];
  let width = Math.sqrt(array.length);
  for (let i = 0; i < array.length; i += width) {
    let temp = [];
    for (let j = i; j < i + width; j++) {
      temp.push(array[j]);
    }
    arr2D.push(temp);
  }
  return arr2D;
}

// Rotates board 90 degrees, clockwise
function rotate(board, times) {
  let board2D = get2D(board);
  for (let rotates = 0; rotates < times; rotates++) {
    board2D = board2D[0].map((val, index) =>
      board2D.map((row) => row[index]).reverse()
    );
    for (let row = 0; row < board2D.length; row++) {
      for (let col = 0; col < board2D.length; col++) {
        board[row * board2D.length + col] = board2D[row][col];
      }
    }
  }
}

// Compare arrays for equality
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}
