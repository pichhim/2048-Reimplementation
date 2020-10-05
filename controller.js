import Game from "./engine/game.js";

let gamePointer = new Game(4);

export const renderPage = function (game) {
  // Grab a jQuery reference to the root HTML element
  const $root = $("#root");

  // Render title and description
  let intro = `<section class="hero has-background-primary">
            <div class="container">
                <div class="hero-body title">
                    2048
                </div>
            </div>
        </section> 
        <section class = "section has-background-white">
            <div class="container">
                <div class="content">
                    <h1>Introduction</h1>
                    <p> Welcome to <strong>2048</strong>! To play, you will use the arrow keys
                    on your keyboard and collide <strong>matching</strong> neighbor boxes. The
                    objective is to ultimately end up with a box with the number
                    <strong>2048</strong>. </p>
                </div>
            </div>
        </section>`;
  $root.append(intro);

  // Render page based on board passed in
  $root.append(renderBoard(game));

  // Add event handlers
  $root.on("click", "#reset", handleResetButtonPress);
  $(document).on("keydown", handleKeyPress);
};

// Makes board move and updates board
export const handleKeyPress = function(event) {
    event.preventDefault(); // Don't annoyingly scroll page on arrow down. pls, i'm playing a game
    switch (event.which) {
        case 38:
            gamePointer.move("up");
            break;
        case 37:
            gamePointer.move("left");
            break;
        case 40:
            gamePointer.move("down");
            break;
        case 39:
            gamePointer.move("right");
            break;
    }
    $("#board").replaceWith(renderBoard(gamePointer));
    
    if (gamePointer.gameState.over) {
        if (gamePointer.gameState.won) {
            $("#state").append(`<br></br><div class ="subtitle has-text-primary">You won! Awesomesauce.</div>`);
        } else {
            $("#state").append(`<br></br><div class ="subtitle has-text-danger">You lost! Keep going. I will <em>always</em> believe in you.</div>`);
        }
    }
}

// Resets Game state
export const handleResetButtonPress = function(event) {    
    gamePointer.setupNewGame();
    $("#board").replaceWith(renderBoard(gamePointer));
}

// Renders board based on Game object
export const renderBoard = function (game) {
  let grid = function (start, end) {
    let gridHTML = "";
    for (let i = start; i < end; i++) {
    let textColor = (game.gameState.board[i] > 0) ? "has-text-warning-light" : "has-text-dark";
    gridHTML += `<div class="column is-narrow has-text-centered">
        <div class="box has-background-primary" style="width: 100px; height: 100px;">
            <p class="title is-2 ${textColor}">${game.gameState.board[i]}</p>
        </div>
        </div>`;
    }
    return gridHTML;
  };
  let html = (
    `<section class="section has-background-light" id="board">
      <div class="container">
        <div class="content">
          <h1>Play Here</h1>
        </div>
        <div class="box is-narrow">
          <div class="columns">
            <div class="column">
              <div class="columns is-multiline" style="width: 600px">
                ${grid(0, 4)}${grid(4, 8)}${grid(8, 12)}${grid(12, 16)}
              </div>
            </div>
            <div class="column">
              <div class="subtitle is-3" id="state">
                <strong>Game State:</strong>
              </div>
              <div class="content">
                <ul class="is-lower-alpha">
                  <li>Score: ${game.gameState.score}</li>
                  <li>Won: ${game.gameState.won}</li>
                  <li>Lost: ${game.gameState.over && !game.gameState.won}</li>
                  <li>Over: ${game.gameState.over}</li>
                </ul>
                <br></br>
                <button id="reset" type="button" class="button is-primary">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`
  );
  return html;
};

$(function () {
  renderPage(gamePointer); // pass in Game obj
});
