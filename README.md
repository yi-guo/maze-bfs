Maze BFS solver
========

A visualization of an agent solving a generated maze using breadth-first search

**Project link:** http://emilyhsia.github.io/maze-bfs/

### Maze generation
The maze is first generated using Wilson's algorithm, which uses [loop erased random walks](http://en.wikipedia.org/wiki/Loop-erased_random_walk) to generate spanning trees. To learn about Wilson's and it's implementation, I read [this blog post](http://weblog.jamisbuck.org/2011/1/20/maze-generation-wilson-s-algorithm), which provided a nice explanation of the algorithm. 

### Maze solver
Once the maze is created, the agent uses a standard [breadth-first search](http://en.wikipedia.org/wiki/Breadth-first_search) to find a solution path. To summarize, the BFS algorithm goes something like this:

1. The agent first chooses the starting cell.
2. If that cell is the final cell, go to step 5. Otherwise, continue to step 3.
3. For each of the cell's valid neighbors, mark the current cell as the neighbor's "parent", and push the neighbor into a queue (aka the "frontier").
4. Pop the first cell off the frontier, and go back to step 2.
5. When the agent has found the final destination cell, backtrack from the destination to the starting cell by traversing backwards via each cell's parent.

### Screenshots
Here are a few examples of the end result:

**Example 1**

[![screen-shot-2014-04-28-at-7-57-38-pm](http://i0.simplest-image-hosting.net/thumbnail/screen-shot-2014-04-28-at-7-57-38-pm.png)](http://simplest-image-hosting.net/png-0-screen-shot-2014-04-28-at-7-57-38-pm)

**Example 2**

[![screen-shot-2014-04-28-at-7-44-34-pm](http://i0.simplest-image-hosting.net/thumbnail/screen-shot-2014-04-28-at-7-44-34-pm.png)](http://simplest-image-hosting.net/png-0-screen-shot-2014-04-28-at-7-44-34-pm)


**Example 3**

[![screen-shot-2014-04-28-at-7-39-22-pm](http://i0.simplest-image-hosting.net/thumbnail/screen-shot-2014-04-28-at-7-39-22-pm.png)](http://simplest-image-hosting.net/png-0-screen-shot-2014-04-28-at-7-39-22-pm)

