const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const app = express();
const http = require("http");
const webSocket = require("ws");
const shipObject = {};
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  try {
    res.sendFile(`${__dirname}\\public\\battleship.html`);
  } catch (err) {
    next(createError(err.code, err.message));
  }
});

app.get("/connections", (req, res, next) => {
  try {
    res.send(connections.length.toString());
  } catch (err) {
    next(createError(err.code, err.message));
  }
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  // render the error page
  res.sendStatus(err.status || 500);
  // res.render("error");
});

const port = process.env.PORT || "3000";
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

const connections = [];
const wss = new webSocket.Server({ server });
wss.on("connection", function connection(ws) {
  if (connections.length === 0 || connections.length === 1) {
    connections.push(ws);
  } else {
    ws.send("Sorry, the server is full. Try again later.");
    ws.close();
  }
  if (ws === connections[0]) {
    connections[0].on("message", function incoming(message) {
      if (connections[1] !== undefined) {
        connections[1].send(message);
        console.log("received1: %s", message);
      }
    });
    connections[0].on("close", () => {
      connections.splice(0, 1);
    });
  }
  if (connections[1] !== undefined) {
    connections[1].on("message", function incoming(message) {
      connections[0].send(message);
      console.log("received2: %s", message);
    });
    connections[1].on("close", () => {
      connections.splice(1, 1);
    });
  }
  ws.send("connection established");
});
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
