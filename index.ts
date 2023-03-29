// Import stylesheets
import './style.css';

class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    equals(p: Point): boolean {
        return this.x === p.x && this.y === p.y;
    }
}

class Line {
    start: Point;
    end: Point;
    constructor(start: Point, end: Point) {
        this.start = start;
        this.end = end;
    }
}

const gridSizeX = 4;
const gridSizeY = 4;
const gridCellSize = 100;

const pointRadius = 15;
const lineWidth = 20;
const offset = pointRadius * 2;

const points = Array.from(
    { length: gridSizeX * gridSizeY },
    (_, i) => new Point(i % gridSizeX, Math.floor(i / gridSizeX))
);
console.log(points);

const lines: Line[] = [];
for (const point of points) {
    const rightNeighborIndex = points.findIndex(
        (p) => p.x === point.x + 1 && p.y === point.y
    );
    const bottomNeighborIndex = points.findIndex(
        (p) => p.x === point.x && p.y === point.y + 1
    );

    if (rightNeighborIndex !== -1) {
        lines.push(new Line(point, points[rightNeighborIndex]));
    }

    if (bottomNeighborIndex !== -1) {
        lines.push(new Line(point, points[bottomNeighborIndex]));
    }
}
console.log(lines);

const moves = [];

function findNearestPoint(x: number, y: number) {
    return new Point(Math.abs(Math.round(x)), Math.abs(Math.round(y)));
}

function gridXY(eventX: number, eventY: number) {
    return {
        x: (eventX - offset) / gridCellSize,
        y: (eventY - offset) / gridCellSize,
    };
}

function handleClick(event) {
    // {x * gridCellSize, y + gridCellSize}

    // {x: 1.11, 0.953}
    const grid = gridXY(event.offsetX, event.offsetY);

    // {x: 1, y: 1}
    const nearestPoint = findNearestPoint(grid.x, grid.y);

    // {x: 0.11, y: -0.047}
    const offsetX = grid.x - nearestPoint.x;
    const offsetY = grid.y - nearestPoint.y;

    // if point not on line
    const maxAbsDev = lineWidth / 2 / gridCellSize;
    if (Math.abs(offsetX) > maxAbsDev && Math.abs(offsetY) > maxAbsDev) return;

    // which direction is the next point?
    const goX =
        Math.abs(offsetX) > Math.abs(offsetY) ? (offsetX > 0 ? 1 : -1) : 0;
    const goY =
        Math.abs(offsetY) > Math.abs(offsetX) ? (offsetY > 0 ? 1 : -1) : 0;

    // the next point
    const nextPoint = new Point(nearestPoint.x + goX, nearestPoint.y + goY);
    console.log(nearestPoint, nextPoint);

    // find the line between both points
    const clickedLine = lines.find(
        (line) =>
            (line.start.equals(nearestPoint) && line.end.equals(nextPoint)) ||
            (line.end.equals(nearestPoint) && line.start.equals(nextPoint))
    );
    console.log('clickedLine', clickedLine);

    if (!clickedLine) {
        throw new Error('Clicked Line not found');
    }

    // TODO: is it valid to click the point?

    // TODO: add line to clicks for active player

    moves.push({
        line: clickedLine,
    });

    console.log(moves);

    // redraw grid and recalculate score
    drawGrid();
}

const canvas: HTMLCanvasElement = document.createElement('canvas');
canvas.setAttribute('id', 'canvas');
canvas.setAttribute(
    'width',
    (gridCellSize * (gridSizeX - 1) + offset * 2).toString()
);
canvas.setAttribute(
    'height',
    (gridCellSize * (gridSizeY - 1) + offset * 2).toString()
);
document.body.appendChild(canvas);

const context = canvas.getContext('2d');

canvas.addEventListener('click', handleClick);

function drawGrid() {
    if (!context) {
        throw new Error('Canvas Context is null');
    }

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw lines
    lines.forEach((line) => {
        context.beginPath();
        context.moveTo(
            offset + line.start.x * gridCellSize,
            offset + line.start.y * gridCellSize
        );
        context.lineTo(
            offset + line.end.x * gridCellSize,
            offset + line.end.y * gridCellSize
        );
        context.lineWidth = lineWidth;

        let strokeStyle = '#e6ecee';
        const move = moves.find((m) => m.line == line);
        if (move) {
            strokeStyle = 'red';
        }
        context.strokeStyle = strokeStyle;
        context.stroke();
    });

    // draw points
    points.forEach((point) => {
        context.beginPath();
        context.arc(
            offset + point.x * gridCellSize,
            offset + point.y * gridCellSize,
            pointRadius,
            0,
            2 * Math.PI,
            false
        );
        context.fillStyle = '#cfd4d6';
        context.fill();
    });
}

drawGrid();

const buttonUndo = document.createElement('button');
buttonUndo.innerHTML = 'Undo';
buttonUndo.setAttribute('id', 'buttonUndo');
document.body.append(buttonUndo);

function undo() {
    moves.pop();
    drawGrid();
}

buttonUndo.addEventListener('click', undo);

document.addEventListener('keydown', function (event) {
    console.log(event);
    if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.stopImmediatePropagation();
        undo();
    }
});
