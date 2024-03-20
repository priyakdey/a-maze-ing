const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
const selectElement = document.getElementById("select-grid") as HTMLSelectElement | null;
if (canvas === null || selectElement === null) {
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

  constructor() {
    const rows = Math.floor(CANVAS_HEIGHT / GRID_SIZE);
    const cols = Math.floor(CANVAS_WIDTH / GRID_SIZE);
    this.table = Array.from({ length: rows }, () => new Array(cols).fill(Color.LIGHT_WHITE));
    this.obstacles = new Map<string, Position>();
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


  paintPosition(position: Position, color: Color) {
    const ctx = context!;
    ctx.fillStyle = color;
    ctx.fillRect(
      GRID_SIZE * position.x + 1,
      GRID_SIZE * position.y + 1,
      GRID_SIZE - LINE_WIDTH,
      GRID_SIZE - LINE_WIDTH
    );
  }

}


const maze = new Maze();
context!.lineWidth = LINE_WIDTH;
maze.drawMaze();

canvas.addEventListener("click", maze.handleClick.bind(maze));
