function blobToJson(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(JSON.parse(reader.result));
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

/**
 * Starts the game and initializes event listeners and variables.
 */

function start(ws) {
  // Event listener for setup ships button click
  ws.onmessage = async function incoming(data) {
    if (typeof data.data !== "string") {
      const parsedData = await blobToJson(data.data);
      if (Array.isArray(parsedData)) {
        handleP2CanvasClick(parsedData);
      } else {
        p2ShipObject = parsedData;
      }
    } else {
      console.log(data.data);
    }
  };

  ws.onclose = function close() {
    alert("Error connecting to the server");
    console.log("disconnected");
  };
  ws.onerror = function error(err) {
    console.log(err);
  };
  const setupShipsButton = document.getElementById("setupShipsButton");
  setupShipsButton.addEventListener("click", setupShipsButtonClickHandler);
  const myCanvasElement = document.getElementById("myCanvas");
  const p2CanvasElement = document.getElementById("p2Canvas");
  const myCanvas = myCanvasElement.getContext("2d");
  const p2Canvas = p2CanvasElement.getContext("2d");
  const ship1 = document.getElementById("ship1");
  const ship2 = document.getElementById("ship2");
  const ship3 = document.getElementById("ship3");
  const ship4 = document.getElementById("ship4");
  const ship5 = document.getElementById("ship5");
  let p2HitCount = 0;
  let p2MissCount = 0;
  let myHitCount = 0;
  let myMissCount = 0;
  let win = false;
  const p2Hits = { ship: [], miss: [] }; // Hit placement
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
  let p2ShipObject = {};
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

  async function handleCanvasClick(event) {
    let sunk = 0;
    const [gridX, gridY] = getCurrentGrid(event, p2CanvasElement);
    const currentHits = hits;
    const currentShipObject = p2ShipObject;
    const currentCanvas = p2Canvas;

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
        p2CanvasElement.removeEventListener("click", handleCanvasClick);
        document.getElementById("waiting_2").style.display = "block";
      }
      ws.send(JSON.stringify([gridX, gridY]));
    } else {
      alert("You already hit this spot!");
    }
  }

  function handleP2CanvasClick(grids) {
    let sunk = 0;
    const [gridX, gridY] = grids;
    const currentHits = p2Hits;
    const currentShipObject = shipObject;
    const currentCanvas = myCanvas;
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
            document.getElementById("p2Sunk").innerHTML = sunk;
          }
        }
        p2HitCount++;
        document.getElementById("p2Hits").innerHTML = p2HitCount;
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
        p2MissCount++;
        document.getElementById("p2Misses").innerHTML = p2MissCount;
        p2CanvasElement.addEventListener("click", handleCanvasClick);
        document.getElementById("waiting_2").style.display = "none";
      }
    } else {
      alert("You already hit this spot!");
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
            alert("Enemy sunk my battleship!");
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
      restartButton.addEventListener("click", () => {
        restart(ws);
      });
      p2CanvasElement.removeEventListener("click", handleCanvasClick);
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
        addShipsToBoard(gridX, gridY, false, holdedShip.gridX, shipObject);
      } else {
        addShipsToBoard(gridY, gridX, true, holdedShip.gridY, shipObject);
      }
      isDragging = false;
    }
  }

  // Function to add ships to the board
  function addShipsToBoard(
    changingGrid,
    otherGrid,
    isVertical,
    holdedGrid,
    currentShipObject
  ) {
    const holdedShipId = holdedShip.element.id;
    const holdedShipAllGrid = currentShipObject[holdedShipId].initgrid;
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
      currentShipObject[holdedShipId].grid = [];
      if (!isVertical) {
        currentShipObject[holdedShipId].grid.push([changingGrid, otherGrid]);
      } else {
        currentShipObject[holdedShipId].grid.push([otherGrid, changingGrid]);
      }
      for (let i = 1; i < holdedShipAllGrid.length; i++) {
        if (!isVertical) {
          currentShipObject[holdedShipId].grid.push([
            changingGrid + i,
            otherGrid,
          ]);
        } else {
          currentShipObject[holdedShipId].grid.push([
            otherGrid,
            changingGrid + i,
          ]);
        }
      }
      if (anyShipAround(currentShipObject[holdedShipId].grid)) {
        currentShipObject[holdedShipId].grid = null;
        return;
      }
      clearCanvas(holdedShipId);
      myCanvas.fillStyle = "black";
      for (let i = 0; i < currentShipObject[holdedShipId].grid.length; i++) {
        myCanvas.fillRect(
          currentShipObject[holdedShipId].grid[i][0] * cellSize,
          currentShipObject[holdedShipId].grid[i][1] * cellSize,
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

  async function setupShipsButtonClickHandler() {
    const waiting = document.getElementById("waiting");
    setupShipsButton.style.display = "none";
    setupShipsButton.removeEventListener("click", setupShipsButtonClickHandler);
    try {
      const res = await fetch("http://localhost:3000/connections", {
        method: "GET",
      });
      const numberOfConnections = await res.text();
      if (numberOfConnections > 1) {
        waiting.style.display = "none";
        drawBoard(myCanvasElement);
        const currentShipObject = shipObject;
        for (const ship in currentShipObject) {
          drawShips(
            currentShipObject[ship].initgrid,
            currentShipObject[ship].id
          );
          currentShipObject[ship].id.draggable = true;
          currentShipObject[ship].id.addEventListener(
            "mousedown",
            handleMouseDown
          );
          currentShipObject[ship].id.addEventListener(
            "dblclick",
            handleDoubleClick
          );
          currentShipObject[ship].id.addEventListener(
            "mouseout",
            handleMouseOut
          );
        }
        document.getElementById("shipHead").style.visibility = "visible";
        const startButton = document.getElementById("startGameButton");
        startButton.style.display = "block";
        startButton.addEventListener("click", initializeGame);
        myCanvasElement.addEventListener("mouseenter", handleCanvasEnter);
      } else {
        waiting.style.display = "block";
        setTimeout(() => {
          setupShipsButtonClickHandler();
        }, 3000);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function initializeGame() {
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
      drawBoard(p2CanvasElement);
      myCanvasElement.removeEventListener("mouseenter", handleCanvasEnter);
      p2CanvasElement.addEventListener("click", handleCanvasClick);
      ws.send(JSON.stringify(shipObject));
      startButton.removeEventListener("click", initializeGame);
    } else {
      alert("Please place all ships before starting the game");
    }
  }
}

function clearCanvas(elementId) {
  const element = document.getElementById(elementId);
  const canvas = element.getContext("2d");
  canvas.clearRect(0, 0, element.width, element.height);
}

// Function to restart the game
function restart(ws) {
  document.getElementById("setupShipsButton").style.display = "block";
  document.getElementById("restartGameButton").style.display = "none";
  document.getElementById("shipHead").style.visibility = "hidden";
  clearCanvas("myCanvas");
  clearCanvas("p2Canvas");
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
  document.getElementById("p2Sunk").innerHTML = 0;
  document.getElementById("p2Hits").innerHTML = 0;
  document.getElementById("p2Misses").innerHTML = 0;
  start(ws);
}
// Event listener for DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  const ws = new WebSocket("ws://localhost:3000");
  window.addEventListener("unload", function () {
    if (ws.readyState == WebSocket.OPEN) ws.close();
  });
  start(ws);
});
