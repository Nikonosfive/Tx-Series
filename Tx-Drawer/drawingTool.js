const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
const penSizeInput = document.getElementById('penSizeRange');
const penSizeNumber = document.getElementById('penSizeNumber');
const colorPicker = document.getElementById('colorPicker');
const offsetXInput = document.getElementById('offsetX');
const offsetYInput = document.getElementById('offsetY');
const alphaInput = document.createElement('input'); // For transparency control
alphaInput.type = 'number';
alphaInput.min = '0';
alphaInput.max = '1';
alphaInput.step = '0.01';
alphaInput.value = '1'; // Default is opaque
document.querySelector('.toolbar').appendChild(alphaInput); // Add transparency slider to toolbar

const eraserButton = document.getElementById('eraserMode');
const penButton = document.getElementById('penMode');
const fillButton = document.getElementById('fillMode');
const clearButton = document.getElementById('clearCanvas');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentMode = 'pen'; // Default mode is pen
let penSize = parseInt(penSizeInput.value, 10);
let color = colorPicker.value;
let alpha = parseFloat(alphaInput.value); // Transparency (alpha value)
let offsetX = parseInt(offsetXInput.value, 10);
let offsetY = parseInt(offsetYInput.value, 10);

let drawing = false;
let lastPosition = { x: 0, y: 0 };

// History stacks for undo/redo
let undoStack = [];
let redoStack = [];

// Set lineJoin and lineCap to make the drawing smooth
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

// Pen size input synchronization
penSizeInput.addEventListener('input', () => {
    penSize = parseInt(penSizeInput.value, 10);
    penSizeNumber.value = penSize;
});
penSizeNumber.addEventListener('input', () => {
    penSize = parseInt(penSizeNumber.value, 10);
    penSizeInput.value = penSize;
});

// Update color, alpha, and offsets when inputs change
colorPicker.addEventListener('input', () => {
    color = colorPicker.value;
});
alphaInput.addEventListener('input', () => {
    alpha = parseFloat(alphaInput.value); // Update alpha value
});
offsetXInput.addEventListener('input', () => {
    offsetX = parseInt(offsetXInput.value, 10);
});
offsetYInput.addEventListener('input', () => {
    offsetY = parseInt(offsetYInput.value, 10);
});

// Switch to Pen mode
penButton.addEventListener('click', () => {
    currentMode = 'pen';
    ctx.globalCompositeOperation = 'source-over'; // Normal drawing mode
});

// Switch to Eraser mode
eraserButton.addEventListener('click', () => {
    currentMode = 'eraser';
    ctx.globalCompositeOperation = 'destination-out'; // "Cut" mode for eraser
});

// Switch to Fill mode
fillButton.addEventListener('click', () => {
    currentMode = 'fill';
});

// Clear canvas and save state
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
});

// Undo functionality
undoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
        const lastState = undoStack.pop();
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(lastState, 0, 0);
    }
});

// Redo functionality
redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const nextState = redoStack.pop();
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.putImageData(nextState, 0, 0);
    }
});

// Save the current state for undo
function saveState() {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack = []; // Clear the redo stack when new action is made
}

// Handle drawing or erasing
function handleDraw(event) {
    if (currentMode === 'pen') {
        draw(event);
    } else if (currentMode === 'eraser') {
        erase(event);
    }
}

function startDrawing(event) {
    if (currentMode === 'fill') {
        fillCanvas(event);
    } else {
        drawing = true;
        lastPosition = getMousePosition(event);
        saveState(); // Save the state before the drawing begins
    }
}

function stopDrawing() {
    drawing = false;
}

function draw(event) {
    if (!drawing) return;
    const currentPosition = getMousePosition(event);

    ctx.lineWidth = penSize;
    ctx.strokeStyle = hexToRgba(color, alpha); // Apply transparency

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(currentPosition.x, currentPosition.y);
    ctx.stroke();

    lastPosition = currentPosition;
}

function erase(event) {
    if (!drawing) return;
    const currentPosition = getMousePosition(event);

    ctx.lineWidth = penSize;

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(currentPosition.x, currentPosition.y);
    ctx.stroke();

    lastPosition = currentPosition;
}

// Fill the canvas with the selected color
function fillCanvas(event) {
    const fillColor = hexToRgba(color, alpha);
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState(); // Save the state after filling
}

// Convert hex color to rgba with transparency
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Get the mouse/touch position adjusted for canvas and offset
function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (event.touches) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }
    return { x: x - offsetX, y: y - offsetY }; // Apply the offset
}

// Mouse/touch event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', handleDraw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', handleDraw);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);
