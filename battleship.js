/**
 * Starts the game and initializes event listeners and variables.
 */
function start() {
  // Event listener for setup ships button click
  const setupShipsButton = document.getElementById("setupShipButton");
  setupShipsButton.addEventListener("click", setupShipsButtonClickHandler);
  const myCanvasElement = document.getElementById("myCanvas");
  const cpuCanvasElement = document.getElementById("cpuCanvas");
  const myCanvas = myCanvasElement.getContext("2d");
  const cpuCanvas = cpuCanvasElement.getContext("2d");
  const ship1 = document.getElementById("ship1");
  const ship2 = document.getElementById("ship2");
  const ship3 = document.getElementById("ship3");
  const ship4 = document.getElementById("ship4");
  const ship5 = document.getElementById("ship5");
  let cpuHitCount = 0;
  let cpuMissCount = 0;
  let myHitCount = 0;
  let myMissCount = 0;
  let win = false;
  const cpuShipObject = { ship1, ship2, ship3, ship4, ship5 };
  const cpuHits = { ship: [], miss: [] }; // Hit placement
  const shipObject = {
    ship1: { id: ship1, initgrid: [[1, 0]] },
    ship2: {
      id: ship2,
      initgrid: [
        [1, 0],
        [2, 0],
      ],
    },
    ship3: {
      id: ship3,
      initgrid: [
        [1, 0],
        [2, 0],
        [3, 0],
      ],
    },
    ship4: {
      id: ship4,
      initgrid: [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
      ],
    },
    ship5: {
      id: ship5,
      initgrid: [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ],
    },
  };
  let hits = { ship: [], miss: [] }; // Hit placement
  const gridSize = 10;
  const cellSize = myCanvasElement.width / gridSize;
  var isDragging = false;
  const holdedShip = { element: null, gridX: null, gridY: null };

  function drawShips(shipGrid, shipId) {
    const shipCanvas = shipId.getContext("2d");
    shipGrid.forEach((pos) => {
      shipCanvas.fillStyle = "black";
      shipCanvas.fillRect(
        pos[0] * cellSize,
        pos[1] * cellSize,
        cellSize,
        cellSize
      );
    });
  }

  function isShipHit(currentShipObject, gridX, gridY) {
    for (let i = 0; i < Object.keys(currentShipObject).length; i++) {
      if (
        currentShipObject[`ship${i + 1}`].grid.some(
          (ship) => ship[0] === gridX && ship[1] === gridY
        )
      ) {
        return true;
      }
    }
    return false;
  }

  function drawBoard(elementId) {
    clearCanvas(elementId.id);
    ctx = elementId.getContext("2d");
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  function getCurrentGrid(event, element) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [Math.floor(x / cellSize), Math.floor(y / cellSize)];
  }

  function handleCanvasClick(event) {
    let sunk = 0;
    const [gridX, gridY] = getCurrentGrid(event, cpuCanvasElement);
    const currentHits = hits;
    const currentShipObject = cpuShipObject;
    const currentCanvas = cpuCanvas;

    if (
      !currentHits.ship.some((hit) => hit[0] === gridX && hit[1] === gridY) &&
      !currentHits.miss.some((hit) => hit[0] === gridX && hit[1] === gridY)
    ) {
      if (isShipHit(currentShipObject, gridX, gridY)) {
        currentCanvas.fillStyle = "red";
        currentCanvas.fillRect(
          gridX * cellSize,
          gridY * cellSize,
          cellSize,
          cellSize
        );
        currentHits.ship.push([gridX, gridY]);
        checkIfShipSunk(currentCanvas, currentShipObject, currentHits, false);
        for (let i = 0; i < Object.keys(currentShipObject).length; i++) {
          if (currentShipObject[`ship${i + 1}`].sunk) {
            sunk++;
            document.getElementById("sunk").innerHTML = sunk;
          }
        }
        myHitCount++;
        document.getElementById("hits").innerHTML = myHitCount;
        if (win) {
          return;
        }
      } else {
        currentCanvas.fillStyle = "blue";
        currentCanvas.fillRect(
          gridX * cellSize,
          gridY * cellSize,
          cellSize,
          cellSize
        );
        currentHits.miss.push([gridX, gridY]);
        myMissCount++;
        document.getElementById("misses").innerHTML = myMissCount;
        setTimeout(() => handleCpuClick(event), 500);
      }
    } else {
      alert("You already hit this spot!");
    }
  }

  function handleCpuClick(event) {
    let sunk = 0;
    const currentShipObject = shipObject;
    const currentHits = cpuHits;
    const currentCanvas = myCanvas;
    const gridX = Math.floor(Math.random() * 10);
    const gridY = Math.floor(Math.random() * 10);

    if (
      !currentHits.ship.some((hit) => hit[0] === gridX && hit[1] === gridY) &&
      !currentHits.miss.some((hit) => hit[0] === gridX && hit[1] === gridY)
    ) {
      if (isShipHit(currentShipObject, gridX, gridY)) {
        currentCanvas.fillStyle = "red";
        currentCanvas.fillRect(
          gridX * cellSize,
          gridY * cellSize,
          cellSize,
          cellSize
        );
        currentHits.ship.push([gridX, gridY]);
        checkIfShipSunk(currentCanvas, currentShipObject, currentHits, true);
        for (let i = 0; i < Object.keys(currentShipObject).length; i++) {
          if (currentShipObject[`ship${i + 1}`].sunk) {
            sunk++;
            document.getElementById("cpuSunk").innerHTML = sunk;
          }
        }
        cpuHitCount++;
        document.getElementById("cpuHits").innerHTML = cpuHitCount;
        setTimeout(() => handleCpuClick(event), 500);
        if (win) {
          return;
        }
      } else {
        currentCanvas.fillStyle = "blue";
        currentCanvas.fillRect(
          gridX * cellSize,
          gridY * cellSize,
          cellSize,
          cellSize
        );
        currentHits.miss.push([gridX, gridY]);
        cpuMissCount++;
        document.getElementById("cpuMisses").innerHTML = cpuMissCount;
      }
    } else {
      setTimeout(() => handleCpuClick(event), 500);
    }
  }

  function checkIfShipSunk(
    currentCanvas,
    currentShipObject,
    currentHits,
    isCpu
  ) {
    for (let i = 0; i < Object.keys(currentShipObject).length; i++) {
      let currentShipGrid = currentShipObject[`ship${i + 1}`].grid;
      if (
        currentShipGrid != undefined &&
        !currentShipObject[`ship${i + 1}`].sunk
      ) {
        let sunk = true;
        for (let j = 0; j < currentShipGrid.length; j++) {
          if (
            !currentHits.ship.some(
              (hit) =>
                hit[0] === currentShipGrid[j][0] &&
                hit[1] === currentShipGrid[j][1]
            )
          ) {
            sunk = false;
            break;
          }
        }
        if (sunk) {
          currentShipObject[`ship${i + 1}`].sunk = true;
          if (isCpu) {
            alert("Cpu sunk my battleship!");
            canvasColor = "yellow";
          } else {
            alert("You sunk a battleship!");
            canvasColor = "green";
          }
          for (let j = 0; j < currentShipGrid.length; j++) {
            currentCanvas.fillStyle = canvasColor;
            currentCanvas.fillRect(
              currentShipGrid[j][0] * cellSize,
              currentShipGrid[j][1] * cellSize,
              cellSize,
              cellSize
            );
          }
        }
      }
    }
    win = true;
    for (let i = 0; i < Object.keys(currentShipObject).length; i++) {
      if (!currentShipObject[`ship${i + 1}`].sunk) {
        win = false;
      }
    }
    if (win) {
      if (isCpu) {
        alert("You lost!");
      } else {
        alert("You won!");
      }
      const restartButton = document.getElementById("restartGameButton");
      restartButton.style.display = "block";
      restartButton.addEventListener("click", restart);
      cpuCanvasElement.removeEventListener("click", handleCanvasClick);
    }
  }

  function handleMouseDown(event) {
    isDragging = true;
    holdedShip.element = document.getElementById(event.target.id);
    [holdedShip.gridX, holdedShip.gridY] = getCurrentGrid(
      event,
      holdedShip.element
    );
  }

  function handleMouseOut() {
    setTimeout(() => (isDragging = false), 100);
  }
  // Function to handle mouse enter event on the canvas
  function handleCanvasEnter(event) {
    if (isDragging) {
      const [gridX, gridY] = getCurrentGrid(event, myCanvasElement);
      if (!shipObject[holdedShip.element.id].isVertical) {
        addShipsToBoard(gridX, gridY, false, holdedShip.gridX);
      } else {
        addShipsToBoard(gridY, gridX, true, holdedShip.gridY);
      }
      isDragging = false;
    }
  }

  // Function to add ships to the board
  function addShipsToBoard(changingGrid, otherGrid, isVertical, holdedGrid) {
    const holdedShipId = holdedShip.element.id;
    const holdedShipAllGrid = shipObject[holdedShipId].initgrid;
    if (
      changingGrid >= 0 &&
      changingGrid <= 9 &&
      changingGrid - holdedGrid >= -1 &&
      ((isVertical &&
        changingGrid + holdedShipAllGrid[holdedShipAllGrid.length - 1][1] <=
          holdedGrid + 9) ||
        (!isVertical &&
          changingGrid + holdedShipAllGrid[holdedShipAllGrid.length - 1][0] <=
            holdedGrid + 9))
    ) {
      while (holdedGrid > 1) {
        changingGrid = changingGrid - 1;
        holdedGrid = holdedGrid - 1;
      }
      shipObject[holdedShipId].grid = [];
      if (!isVertical) {
        shipObject[holdedShipId].grid.push([changingGrid, otherGrid]);
      } else {
        shipObject[holdedShipId].grid.push([otherGrid, changingGrid]);
      }
      for (let i = 1; i < holdedShipAllGrid.length; i++) {
        if (!isVertical) {
          shipObject[holdedShipId].grid.push([changingGrid + i, otherGrid]);
        } else {
          shipObject[holdedShipId].grid.push([otherGrid, changingGrid + i]);
        }
      }
      if (anyShipAround(shipObject[holdedShipId].grid)) {
        shipObject[holdedShipId].grid = null;
        return;
      }
      clearCanvas(holdedShipId);
      myCanvas.fillStyle = "black";
      for (let i = 0; i < shipObject[holdedShipId].grid.length; i++) {
        myCanvas.fillRect(
          shipObject[holdedShipId].grid[i][0] * cellSize,
          shipObject[holdedShipId].grid[i][1] * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  // Function to check if any ship is around the given ship
  function anyShipAround(shipToCheck, isCpu = false) {
    let currentShipObject = shipObject;
    if (isCpu) {
      currentShipObject = cpuShipObject;
    }
    for (let ship in currentShipObject) {
      let currentShipGrid = currentShipObject[ship].grid;
      if (
        currentShipGrid != undefined &&
        currentShipObject[ship].id != holdedShip.element
      ) {
        for (let j = 0; j < currentShipGrid.length; j++) {
          for (let k = 0; k < shipToCheck.length; k++) {
            const gridX = shipToCheck[k][0];
            const gridY = shipToCheck[k][1];
            const selectedShipGridX = currentShipGrid[j][0];
            const selectedShipGridY = currentShipGrid[j][1];
            if (
              (selectedShipGridX - gridX == 1 ||
                selectedShipGridX === gridX ||
                selectedShipGridX - gridX == -1) &&
              (selectedShipGridY - gridY == 1 ||
                selectedShipGridY == gridY ||
                selectedShipGridY - gridY == -1)
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // Function to handle double click event
  function handleDoubleClick(event) {
    const clickedShip = shipObject[event.target.id];

    const clickedShipAllGrid = clickedShip.initgrid;
    clearCanvas(event.target.id);
    if (clickedShip.isVertical) {
      clickedShip.isVertical = false;
      clickedShip.initgrid = clickedShipAllGrid.map((grid) => [
        grid[1],
        grid[0],
      ]);
    } else {
      clickedShip.isVertical = true;
      clickedShip.initgrid = clickedShipAllGrid.map((grid) => [
        grid[1],
        grid[0],
      ]);
    }
    drawShips(clickedShip.initgrid, clickedShip.id);
  }

  // Function to randomize ships on the board
  function randomizeShips() {
    for (i = 0; i < Object.keys(cpuShipObject).length; i++) {
      let isVertical = Math.random() >= 0.5;
      let x = Math.floor(Math.random() * 10);
      let y = Math.floor(Math.random() * 10);
      let ship = [];
      for (let j = 0; j < i + 1; j++) {
        if (y + j <= 9 && x + j <= 9) {
          if (isVertical) {
            ship.push([x, y + j]);
          } else {
            ship.push([x + j, y]);
          }
        }
      }
      if (!anyShipAround(ship, true) && i + 1 == ship.length) {
        cpuShipObject[`ship${i + 1}`] = { grid: ship };
      } else {
        i--;
      }
    }
  }

  // Function to initialize the game
  function initGame() {
    const startButton = document.getElementById("startGameButton");
    let allShipBoarded = true;
    for (const ship in shipObject) {
      if (shipObject[ship].grid == undefined) {
        allShipBoarded = false;
      }
    }
    if (allShipBoarded) {
      document.getElementById("shipHead").style.display = "none";
      startButton.style.display = "none";
      const battleshipBoard = document.getElementsByClassName("board");
      for (let i = 0; i < battleshipBoard.length; i++) {
        battleshipBoard[i].style.display = "block";
      }
      drawBoard(cpuCanvasElement);
      randomizeShips();
      myCanvasElement.removeEventListener("mouseenter", handleCanvasEnter);
      cpuCanvasElement.addEventListener("click", handleCanvasClick);
      startButton.removeEventListener("click", initGame);
    } else {
      alert("Please place all ships before starting the game");
    }
  }
  // Function to handle setup ships button click event
  function setupShipsButtonClickHandler() {
    drawBoard(myCanvasElement);
    for (const ship in shipObject) {
      drawShips(shipObject[ship].initgrid, shipObject[ship].id);
      shipObject[ship].id.draggable = true;
      shipObject[ship].id.addEventListener("mousedown", handleMouseDown);
      shipObject[ship].id.addEventListener("dblclick", handleDoubleClick);
      shipObject[ship].id.addEventListener("mouseout", handleMouseOut);
    }
    document.getElementById("shipHead").style.visibility = "visible";
    const startButton = document.getElementById("startGameButton");
    startButton.style.display = "block";
    startButton.addEventListener("click", initGame);
    myCanvasElement.addEventListener("mouseenter", handleCanvasEnter);
    setupShipsButton.style.display = "none";
    setupShipsButton.removeEventListener("click", setupShipsButtonClickHandler);
  }
}

function clearCanvas(elementId) {
  const element = document.getElementById(elementId);
  const canvas = element.getContext("2d");
  canvas.clearRect(0, 0, element.width, element.height);
}

// Function to restart the game
function restart() {
  document.getElementById("setupShipButton").style.display = "block";
  document.getElementById("restartGameButton").style.display = "none";
  document.getElementById("shipHead").style.visibility = "hidden";
  clearCanvas("myCanvas");
  clearCanvas("cpuCanvas");
  clearCanvas("ship1");
  clearCanvas("ship2");
  clearCanvas("ship3");
  clearCanvas("ship4");
  clearCanvas("ship5");
  const battleshipBoard = document.getElementsByClassName("board");
  for (let i = 0; i < battleshipBoard.length; i++) {
    battleshipBoard[i].style.display = "none";
  }
  document.getElementById("sunk").innerHTML = 0;
  document.getElementById("hits").innerHTML = 0;
  document.getElementById("misses").innerHTML = 0;
  document.getElementById("cpuSunk").innerHTML = 0;
  document.getElementById("cpuHits").innerHTML = 0;
  document.getElementById("cpuMisses").innerHTML = 0;
  start();
}
// Event listener for DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  start();
});
