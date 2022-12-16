function array_in_array(haystack, needle){
    var i, j, current;
    for(i = 0; i < haystack.length; ++i){
        if(needle.length === haystack[i].length){
        current = haystack[i];
        for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
        if(j === needle.length)
            return true;
        }
    }
    return false;
    }

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
class Grid {
    constructor(x_n) {
        // Assign the RGB values as a property of `this`.
        this.x_n = x_n;
        this.dx = Math.floor(canvas.width/this.x_n);
        this.dy = this.dx; // keep it square
        this.y_n = this.dy*canvas.height;

        this.draw_lines();

        this.active_cells = [];

        this.all_cells = [];
        for (let x = 0; x < this.x_n; x++) {
            for (let y = 0; y < this.y_n; y++) {
                let cell = [x, y]
                this.all_cells.push(cell);
            }
        }
    }

    draw_lines() {
        for (let step = 0; step < this.x_n; step++) {
            ctx.beginPath();
            ctx.moveTo(step*this.dx,0);
            ctx.lineTo(step*this.dx, canvas.height);
            ctx.stroke();
        }
        for (let step = 0; step < this.y_n; step++) {
            ctx.beginPath();
            ctx.moveTo(0, step*this.dy);
            ctx.lineTo(canvas.width, step*this.dy);
            ctx.stroke();
        }
    }

    get_grid_xy(event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX-rect.left
        let y = event.clientY-rect.top
        let x_grid = Math.floor(x/this.dx);
        let y_grid = Math.floor(y/this.dy);
        return [x_grid, y_grid]
    }

    fill_cell(xy) {
        let grid_x = xy[0];
        let grid_y = xy[1];
        ctx.beginPath();
        ctx.rect(grid_x*this.dx, grid_y*this.dy, this.dx, this.dy);
        ctx.fillStyle = "#10FFAA";
        ctx.fill();
        ctx.closePath();
    }

    click_cell(event) {
        let xy_grid = this.get_grid_xy(event);
        this.active_cells.push(xy_grid)
        this.draw_cells();
    }

    draw_cells() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw_lines()
        for (const cell of this.active_cells){
            this.fill_cell(cell);
        }
    }

    apply_rules() {
        let new_cells = []
        // Check if alive cells have 2 or 3 neighbours
        for (const cell of this.active_cells){
            let alive_neighbours = this.num_neighbours(cell)
            if ([2, 3].includes(alive_neighbours)) {
                new_cells.push(cell)
            }
        }

        // check if dead cells have 3 alive neighbours:
        for (const cell of this.all_cells) {
            if (array_in_array(this.active_cells, cell)) {
                let a = 1
            } else {
                let alive_neighbours = this.num_neighbours(cell)
                if (alive_neighbours === 3) {
                    new_cells.push(cell)
                }
            }
        }

        this.active_cells = new_cells;
    }

    num_neighbours(cell) {
        let count = 0;
        let rel_coords = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        for (const rel_xy of rel_coords) {
            let neighbour_cell = [cell[0]+rel_xy[0], cell[1]+rel_xy[1]]
            if (array_in_array(this.active_cells, neighbour_cell)) {
                count += 1
            }
        }
        return count
    }

    step() {
        this.apply_rules();
        this.draw_cells();
    }
}
let grid = new Grid(30)

let stepButton = document.querySelector("#step");
stepButton.addEventListener('click', grid.step.bind(grid), false)

let ppButton = document.querySelector("#play_pause")
let running = false
function togglePausePlay() {
    if (running === false) {
        running = true
        ppButton.textContent = 'PAUSE'
    } else {
        running = false
        ppButton.textContent = 'PLAY'
    }
}

function keyDownHandler(e) {
    if (e.key === " "  ||
        e.code == "Space" ||      
        e.keyCode == 32 ) {
        togglePausePlay();
    }
    }

ppButton.addEventListener('click', togglePausePlay, false)
document.addEventListener("keydown", keyDownHandler, false);
function add_live_cells(event) {
    if (running === true) {
        togglePausePlay();
    }
    grid.click_cell(event)
}

canvas.addEventListener('click', add_live_cells, false);

function auto_run() {
    if (running === true) {
        grid.step();
    }
}

let speed_slider = document.getElementById("speed");
let speed_label = document.getElementById("speed_label");
var interval = 1000,
i = 0,
output = document.getElementById('output');

function loop() {
  i++;
  window.setTimeout(loop, interval);
  auto_run()
}

speed_slider.addEventListener('change', function (e) {
    let speed = Math.pow(10, parseInt(this.value)/10);
    console.log(speed)
    interval = 1000/speed
    //window.setTimeout(loop, 10); // temp reset interval to make speed change immediate
    speed_label.innerText = "Speed: " + speed.toFixed(1)

});

loop();