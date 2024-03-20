const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
const selectElement = document.getElementById("select-grid") as HTMLSelectElement | null;
const startGameElement = document.getElementById("start-game-btn") as HTMLButtonElement | null;
if (canvas === null || selectElement === null || startGameElement === null) {
  throw new Error("Required DOM elements not found");
}

const context = canvas.getContext("2d");
if (context === null) {
  throw new Error("Cannot initialize canvas context");
}

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;
const GRID_SIZE = 75;
const LINE_WIDTH = 2;


enum Color {
  LIGHT_WHITE = "#f5f5f5",
  LIGHT_BLACK = "#1e1e1e",
  LIGHT_GREEN = "#00bb00",
  LIGHT_RED = "#bb0000",
  LIGHT_BLUE = "#0000bb",
}

type SelectOption = "starting" | "destination" | "obstacles";

class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(other: any): boolean {
    if (!(other instanceof Position)) {
      return false;
    }

    return this.x === other.x && this.y === other.y;
  }

  toString(): string {
    return `${this.x}-${this.y}`;
  }
}

class Maze {
  table: Array<Array<Color>>;
  start: Position | undefined;
  destination: Position | undefined;
  obstacles: Map<string, Position>;
  rows: number;
  cols: number;
  path: Array<Position>;
  visited: Set<string>;

  constructor() {
    this.rows = Math.floor(CANVAS_HEIGHT / GRID_SIZE);
    this.cols = Math.floor(CANVAS_WIDTH / GRID_SIZE);
    this.table = Array.from({ length: this.rows }, () => new Array(this.cols).fill(Color.LIGHT_WHITE));
    this.obstacles = new Map<string, Position>();
    this.path = new Array<Position>();
    this.visited = new Set<string>();
  }

  handleClick(event: Event): void {
    const e = event as PointerEvent
    const x = Math.floor(e.offsetX / GRID_SIZE);
    const y = Math.floor(e.offsetY / GRID_SIZE);

    const selectOption = selectElement!.value as SelectOption;
    const position = new Position(x, y);
    const key = position.toString();

    switch (selectOption) {
      case "starting":
        if (position.equals(this.start) || position.equals(this.destination) || this.obstacles.has(key)) {
          return;
        }

        if (this.start !== undefined) {
          // reset the previous selected source
          this.paintPosition(this.start, Color.LIGHT_WHITE);
        }

        this.start = position;
        this.paintPosition(position, Color.LIGHT_GREEN);
        break;
      case "destination":
        if (position.equals(this.start) || position.equals(this.destination) || this.obstacles.has(key)) {
          return;
        }

        if (this.destination !== undefined) {
          // reset the previous selected source
          this.paintPosition(this.destination, Color.LIGHT_WHITE);
        }

        this.destination = position;
        this.paintPosition(position, Color.LIGHT_RED);
        break;
      case "obstacles":
        if (position.equals(this.start) || position.equals(this.destination)) {
          return;
        }

        if (this.obstacles.has(key)) {
          this.obstacles.delete(key);
          this.paintPosition(position, Color.LIGHT_WHITE);
        } else {
          this.obstacles.set(key, position);
          this.paintPosition(position, Color.LIGHT_BLACK);
        }
        break;
    }

  }

  drawMaze(): void {
    const ctx = context!;

    ctx.strokeStyle = Color.LIGHT_BLACK;

    for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y + GRID_SIZE);
      ctx.lineTo(CANVAS_WIDTH, y + GRID_SIZE);
      ctx.stroke();
    }

    for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x + GRID_SIZE, 0);
      ctx.lineTo(x + GRID_SIZE, CANVAS_WIDTH);
      ctx.stroke();
    }
  }

  startGame(event: Event): void {
    if (this.start === undefined || this.destination === undefined) {
      this.alert();
      return;
    }

    this.visited.add(this.start.toString());
    if (this.traverse(this.start!)) {
      console.log(this.path);
      return;
    }
  }

  traverse(position: Position): boolean {
    if (position.equals(this.destination)) {
      this.path.push(position);
      console.log("Reached");
      return true;
    }

    // Mark the current cell as visited
    this.visited.add(position.toString());
    this.path.push(position);

    // Visualize the current step
    const prevColor = this.table[position.y][position.x];
    if (!position.equals(this.start)) {
      this.paintPosition(position, Color.LIGHT_BLUE);
    }

    for (const neighbor of this.getUnvisitedNeighbours(position)) {
      if (!this.visited.has(neighbor.toString())) {
        if (this.traverse(neighbor)) {
          return true;
        }

        // backtrack
        this.path.pop();
        this.paintPosition(position, prevColor);
      }
    }



    return false;
  }

  getUnvisitedNeighbours(position: Position): Array<Position> {
    const neighbours: Array<Position> = new Array();

    // directions
    const directions = [
      [-1, 0],  // left
      [1, 0],   // right
      [0, -1],  // top
      [0, 1]    // down
    ];

    for (let [dx, dy] of directions) {
      const x = position.x + dx;
      const y = position.y + dy;
      const neighbour = new Position(x, y);
      if (x >= 0 && x < this.cols && y >= 0 && y < this.rows && !this.obstacles.has(neighbour.toString())) {
        neighbours.push(new Position(x, y));
      }
    }

    return neighbours;
  }

  paintPosition(position: Position, color: Color): void {
    const ctx = context!;
    ctx.fillStyle = color;
    ctx.fillRect(
      GRID_SIZE * position.x + 1,
      GRID_SIZE * position.y + 1,
      GRID_SIZE - LINE_WIDTH,
      GRID_SIZE - LINE_WIDTH
    );
  }

  alert(): void {
    alert("select a start and end destination");
  }

}


const maze = new Maze();
context!.lineWidth = LINE_WIDTH;
maze.drawMaze();

canvas.addEventListener("click", maze.handleClick.bind(maze));
startGameElement.addEventListener("click", maze.startGame.bind(maze));
