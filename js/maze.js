var width = window.innerWidth - 10,
    height = window.innerHeight - 10;

var N = 1 << 0,
    S = 1 << 1,
    W = 1 << 2,
    E = 1 << 3;

var cellSize = 3,
    cellSpacing = 3,
    cellWidth = Math.floor((width - cellSpacing) / (cellSize + cellSpacing)),
    cellHeight = Math.floor((height - cellSpacing) / (cellSize + cellSpacing)),
    cells = new Array(cellWidth * cellHeight), // each cell’s edge bits
    remaining = d3.range(cellWidth * cellHeight), // cell indexes to visit
    previous = new Array(cellWidth * cellHeight); // current random walk

var canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height);

var context = canvas.node().getContext("2d");

context.translate(
  Math.round((width - cellWidth * cellSize - (cellWidth + 1) * cellSpacing) / 2),
  Math.round((height - cellHeight * cellSize - (cellHeight + 1) * cellSpacing) / 2)
);

context.fillStyle = "white";

// Add a random cell.
var start = remaining.pop();
cells[start] = 0;
fillCell(start);
colorCell(start);

// While there are remaining cells,
// add a loop-erased random walk to the maze.
d3.timer(function() {
  var done, k = 0;
  while (++k < 300 && !(done = loopErasedRandomWalk()));
  return done;
});

function loopErasedRandomWalk() {
  var direction,
      index0,
      index1,
      i,
      j;

  // Pick a location that’s not yet in the maze (if any).
  do if ((index0 = remaining.pop()) == null) return true;
  while (cells[index0] >= 0);

  // Perform a random walk starting at this location,
  previous[index0] = index0;
  walk: while (true) {
    i = index0 % cellWidth;
    j = index0 / cellWidth | 0;

    // picking a legal random direction at each step.
    direction = Math.random() * 4 | 0;
    if (direction === 0) { if (j <= 0) continue walk; --j; }
    else if (direction === 1) { if (j >= cellHeight - 1) continue walk; ++j; }
    else if (direction === 2) { if (i <= 0) continue walk; --i; }
    else { if (i >= cellWidth - 1) continue walk; ++i; }

    // If this new cell was visited previously during this walk,
    // erase the loop, rewinding the path to its earlier state.
    // Otherwise, just add it to the walk.
    index1 = j * cellWidth + i;
    if (previous[index1] >= 0) eraseWalk(index0, index1);
    else previous[index1] = index0;
    index0 = index1;

    // If this cell is part of the maze, we’re done walking.
    if (cells[index1] >= 0) {

      // Add the random walk to the maze by backtracking to the starting cell.
      // Also erase this walk’s history to not interfere with subsequent walks.
      while ((index0 = previous[index1]) !== index1) {
        fillCell(index0);
        direction = index1 - index0;
        if (direction === 1) {
          cells[index0] |= E;
          cells[index1] |= W;
          fillEast(index0);
        }
        else if (direction === -1) {
          cells[index0] |= W;
          cells[index1] |= E;
          fillEast(index1);
        }
        else if (direction < 0) {
          cells[index0] |= N;
          cells[index1] |= S;
          fillSouth(index1);
        }
        else {
          cells[index0] |= S;
          cells[index1] |= N;
          fillSouth(index0);
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
  while ((index = previous[index0]) !== index1) {
    previous[index0] = NaN;
    index0 = index;
  }
  previous[index0] = NaN;
}

function colorCell(index) {
  var i = index % cellWidth;
  var j = index / cellWidth | 0;
  context.fillStyle ="#FF0000";
  context.fillRect(i * cellSize + (i + 1) * cellSpacing, j * cellSize + (j + 1) * cellSpacing, cellSize, cellSize);
  context.fillStyle = "#FFFFFF";
}

function fillCell(index) {
  var i = index % cellWidth;
  var j = index / cellWidth | 0;
  context.fillRect(i * cellSize + (i + 1) * cellSpacing, j * cellSize + (j + 1) * cellSpacing, cellSize, cellSize);
}

function fillEast(index) {
  var i = index % cellWidth;
  var j = index / cellWidth | 0;
  context.fillRect((i + 1) * (cellSize + cellSpacing), j * cellSize + (j + 1) * cellSpacing, cellSpacing, cellSize);
}

function fillSouth(index) {
  var i = index % cellWidth;
  var j = index / cellWidth | 0;
  context.fillRect(i * cellSize + (i + 1) * cellSpacing, (j + 1) * (cellSize + cellSpacing), cellSize, cellSpacing);
}

d3.select(self.frameElement).style("height", height + "px");