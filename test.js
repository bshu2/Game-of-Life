var width, height, cols, rows;
var cell_size = 10;
var delay = 500;
var canvas; //global variable for canvas object
var context; //global variable for the 2d context
var cells; //contains state of each cell
var paused = false;
var mouse_down = false;
var last_index = -1;


function init(initial_cells) {
  canvas = document.getElementById('canvas-test');
  context = canvas.getContext('2d');
  if (!context) {
    alert('Unable to initialize 2D.');
    return;
  }

  width = canvas.width;
  height = canvas.height;
  cols = width/cell_size;
  rows = height/cell_size;
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  //initialize with random values in cells
  cells = new Array(rows * cols);
  randomize_cells();

  //set listeners for toggling cells with mouse
  canvas.addEventListener("mousedown", function(event) {
    //console.log("mouse down");
    var x = Math.floor((event.pageX - canvas.offsetLeft)/cell_size);
    var y = Math.floor((event.pageY - canvas.offsetTop)/cell_size);
    cells[y*cols + x] = !cells[y*cols + x];
    last_index = y*cols + x;
    render();
    mouse_down = true;
  });
  canvas.addEventListener("mouseup", function(event) {
    //console.log("mouse up");
    mouse_down = false;
  });
  canvas.addEventListener("mousemove", function(event) {
    //console.log("mouse move");
    if (mouse_down) {
      var x = Math.floor((event.pageX - canvas.offsetLeft)/cell_size);
      var y = Math.floor((event.pageY - canvas.offsetTop)/cell_size);
      if (last_index != y*cols + x) {
        cells[y*cols + x] = !cells[y*cols + x];
        last_index = y*cols + x;
        render();
      }
    }
  });

  //set listeners for keyboard inputs
  document.body.addEventListener("keydown", function(event) {
    switch (event.keyCode) {
      case 80: //p
        toggle_pause();
        break;
      case 82: //r
        randomize_cells();
        break;
      case 67: //c
        clear_cells();
        break;
      default:
        break;
    }
  });

  setInterval(main_loop, delay);
}

function main_loop() {
  if (!paused) {
    update();
    render();
  }
}

function update() {
  var cells_copy = cells.slice(0);
  for (y = 0; y < rows; y++) {
    for (x = 0; x < cols; x++) {
      var i = y*cols + x;
      //count live neighbors
      var live_neighbors = 0;
      if (y - 1 >= 0 && x - 1 >= 0 && cells_copy[(y - 1)*cols + (x - 1)])
        live_neighbors += 1;
      if (y + 1 < rows && x - 1 >= 0 && cells_copy[(y + 1)*cols + (x - 1)])
        live_neighbors += 1;
      if (y - 1 >= 0 && x + 1 < cols && cells_copy[(y - 1)*cols + (x + 1)])
        live_neighbors += 1;
      if (y + 1 < rows && x + 1 < cols && cells_copy[(y + 1)*cols + (x + 1)])
        live_neighbors += 1;

      if (x + 1 < cols && cells_copy[y*cols + (x + 1)])
        live_neighbors += 1;
      if (x - 1 >= 0 && cells_copy[y*cols + (x - 1)])
        live_neighbors += 1;
      if (y + 1 < rows && cells_copy[(y + 1)*cols + x])
        live_neighbors += 1;
      if (y - 1 >= 0 && cells_copy[(y - 1)*cols + x])
        live_neighbors += 1;

      //update cells array accordingly
      if (cells_copy[i] && (live_neighbors < 2 || live_neighbors > 3)) {
        cells[i] = false; //kill cell if less than 2 or more than 3 neighbors
      }
      else if (!cells_copy[i] && live_neighbors == 3) {
        cells[i] = true; //revive cell if exactly 3 neighbors
      }
    }
  }
}

function render() {
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "gray";
  for (y = 0; y < rows; y++) {
    for (x = 0; x < cols; x++) {
      if (cells[y*cols + x] == true) {
        context.fillRect(x*cell_size, y*cell_size, cell_size, cell_size);
      }
    } 
  }
}

function randomize_cells() {
  for (i = 0; i < rows * cols; i++) {
    cells[i] = (Math.random() >= 0.15) ? false : true;
  }
  render();
}

function clear_cells() {
  toggle_pause();
  for (i = 0; i < rows * cols; i++) {
    cells[i] = false;
  }
  render();
}

function toggle_pause() {
  paused = !paused;
  document.getElementById("pause-button").value = (paused) ? "Play (P)" : "Pause (P)";
}