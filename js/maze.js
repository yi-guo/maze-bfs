var width = window.innerWidth - 10,
    height = window.innerHeight - 10;

var N = 1 << 0,
    S = 1 << 1,
    W = 1 << 2,
    E = 1 << 3;
var visited = 1 << 4;

var GREY = "#777",
    WHITE = "#FFF";

var cellSize = 5,
    cellSpacing = 5,
    cellWidth = Math.floor((width - cellSpacing) / (cellSize + cellSpacing)),
    cellHeight = Math.floor((height - cellSpacing) / (cellSize + cellSpacing)),
    cells = generateMaze(cellWidth, cellHeight);

var parent = d3.range(cellHeight * cellWidth).map(function() { return NaN; }),
    previous = (cellHeight - 1) * cellWidth,
    goalX = cellWidth - 1 - !((cellWidth & 1) | (cellHeight & 1)),
    goalY = 0,
    goalIndex = goalX + goalY * cellWidth,
    frontier = [previous];

var canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);

var context = canvas.node().getContext("2d");

context.translate(
  Math.round((width - cellWidth * cellSize - (cellWidth + 1) * cellSpacing) / 2),
  Math.round((height - cellHeight * cellSize - (cellHeight + 1) * cellSpacing) / 2)
);

context.fillStyle = GREY;

for (var j = 0; j < cellHeight; ++j) {
  for (var i = 0; i < cellWidth; ++i) {
    if (cells[j * cellWidth + i] >= 0) context.fillRect(i * cellSize + (i + 1) * cellSpacing, j * cellSize + (j + 1) * cellSpacing, cellSize, cellSize);
    if (cells[j * cellWidth + i] & E) context.fillRect((i + 1) * (cellSize + cellSpacing), j * cellSize + (j + 1) * cellSpacing, cellSpacing, cellSize);
    if (cells[j * cellWidth + i] & S) context.fillRect(i * cellSize + (i + 1) * cellSpacing, (j + 1) * (cellSize + cellSpacing), cellSize, cellSpacing);
  }
}

context.lineWidth = cellSize;
context.lineCap = "square";
context.strokeStyle = GREY;
context.translate(cellSize / 2, cellSize / 2);

d3.timer(function() {
  var done, k = 0;
  while (++k < 50 && !(done = exploreFrontier()));
  return done;
});

var randomBase = Math.random() * 180 | 0;

function exploreFrontier() {
  if ((i0 = popRandom(frontier)) == null) return true;

  var i0,
      x0 = i0 % cellWidth,
      y0 = i0 / cellWidth | 0,
      s0 = score(i0),
      i1;

  cells[i0] |= visited;

  var dist = Math.pow(x0 - 0, 2) + Math.pow(y0 - 0, 2);
  dist = Math.pow(dist, 0.5);

  var color = d3.hsl(((dist + randomBase)% 360), 1, .5).rgb();
  context.strokeStyle = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
  strokePath(previous);

  context.strokeStyle = WHITE;
  strokePath(previous = i0);
  if (!s0) return true;

  if (cells[i0] & N && !(cells[i1 = i0 - cellWidth] & visited)) parent[i1] = i0, frontier.push(i1);
  if (cells[i0] & S && !(cells[i1 = i0 + cellWidth] & visited)) parent[i1] = i0, frontier.push(i1);
  if (cells[i0] & W && !(cells[i1 = i0 - 1] & visited)) parent[i1] = i0, frontier.push(i1);
  if (cells[i0] & E && !(cells[i1 = i0 + 1] & visited)) parent[i1] = i0, frontier.push(i1);
}

function strokePath(index) {
  context.beginPath();
  moveTo(index);
  while (!isNaN(index = parent[index])) lineTo(index);
  context.stroke();
}

function moveTo(index) {
  var i = index % cellWidth, j = index / cellWidth | 0;
  context.moveTo(i * cellSize + (i + 1) * cellSpacing, j * cellSize + (j + 1) * cellSpacing);
}

function lineTo(index) {
  var i = index % cellWidth, j = index / cellWidth | 0;
  context.lineTo(i * cellSize + (i + 1) * cellSpacing, j * cellSize + (j + 1) * cellSpacing);
}

function score(i) {
  var x = goalX - (i % cellWidth), y = goalY - (i / cellWidth | 0);
  return x * x + y * y;
}

function popRandom(array) {
  if (!(n = array.length))
    return;

  var i = Math.random() * n | 0,
      t = array[i];
  array[i] = array[n - 1];
  array[n - 1] = t;
  return array.pop();
}

function generateMaze(width, height) {
  var cells = new Array(width * height), // each cell’s edge bits
      remaining = d3.range(width * height), // cell indexes to visit
      previous = new Array(width * height); // current random walk

  // Add a random cell.
  var start = remaining.pop();
  cells[start] = 0;

  // While there are remaining cells, add a loop-erased random walk to the maze.
  while (!loopErasedRandomWalk());

  return cells;

  function loopErasedRandomWalk() {
    var direction,
        index0,
        index1,
        i,
        j;

    // Pick a location that’s not yet in the maze
    do if ((index0 = remaining.pop()) == null) return true;
    while (cells[index0] >= 0);

    // Begin random walk starting at this location,
    previous[index0] = index0;
    walk: while (true) {
      i = index0 % width;
      j = index0 / width | 0;

      // pick a legal random direction at each step
      direction = Math.random() * 4 | 0;
      if (direction === 0) {
        if (j <= 0)
          continue walk;
        --j;
      } else if (direction === 1) {
        if (j >= height - 1)
          continue walk;
        ++j;
      } else if (direction === 2) {
        if (i <= 0)
          continue walk;
        --i;
      } else {
        if (i >= width - 1)
          continue walk;
        ++i;
      }

      // If this new cell was visited previously during this walk,
      // erase the loop, rewinding the path to its earlier state.
      // Otherwise, just add it to the walk.
      index1 = j * width + i;
      if (previous[index1] >= 0)
        eraseWalk(index0, index1);
      else
        previous[index1] = index0;
      index0 = index1;

      // If this cell is part of the maze, done walking.
      if (cells[index1] >= 0) {

        // Add the random walk to the maze by backtracking to the starting cell.
        // Also erase this walk’s history to not interfere with subsequent walks.
        while ((index0 = previous[index1]) !== index1) {
          direction = index1 - index0;
          if (direction === 1) { // moved east
            cells[index0] |= E; // unblock E
            cells[index1] |= W; // unblock W
          } else if (direction === -1) { // west
            cells[index0] |= W;
            cells[index1] |= E;
          } else if (direction < 0) { // north
            cells[index0] |= N;
            cells[index1] |= S;
          } else { // south
            cells[index0] |= S;
            cells[index1] |= N;
          }
          previous[index1] = NaN;
          index1 = index0;
        }

        previous[index1] = NaN;
        return;
      }
    }
  }

  function eraseWalk(index0, index1) {
    var index;
    while ((index = previous[index0]) !== index1){
      previous[index0] = NaN;
      index0 = index;
    }
    previous[index0] = NaN;
  }
}

d3.select(self.frameElement).style("height", height + "px");