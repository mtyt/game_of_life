function find_array_in_array(haystack, needle) {
    var i, j, current;
    for (i = 0; i < haystack.length; ++i) {
        if (needle.length === haystack[i].length) {
            current = haystack[i];
            for (j = 0; j < needle.length && needle[j] === current[j]; ++j);
            if (j === needle.length)
                return i;
        }
    }
    return -1;
}

function remove_array_from_array(haystack, needle) {
    index = find_array_in_array(haystack, needle);
    haystack.splice(index, 1)
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
class Grid {
    constructor(x_n) {
        // Assign the RGB values as a property of `this`.
        this.x_n = x_n;
        this.dx = Math.floor(canvas.width / this.x_n);
        this.dy = this.dx; // keep it square
        this.y_n = this.dy * canvas.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
            ctx.moveTo(step * this.dx, 0);
            ctx.lineTo(step * this.dx, canvas.height);
            ctx.stroke();
        }
        for (let step = 0; step < this.y_n; step++) {
            ctx.beginPath();
            ctx.moveTo(0, step * this.dy);
            ctx.lineTo(canvas.width, step * this.dy);
            ctx.stroke();
        }
    }

    get_grid_xy(event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left
        let y = event.clientY - rect.top
        let x_grid = Math.floor(x / this.dx);
        let y_grid = Math.floor(y / this.dy);
        return [x_grid, y_grid]
    }

    fill_cell(xy) {
        let grid_x = xy[0];
        let grid_y = xy[1];
        ctx.beginPath();
        ctx.rect(grid_x * this.dx, grid_y * this.dy, this.dx, this.dy);
        ctx.fillStyle = "#AA0033";
        ctx.fill();
        ctx.closePath();
    }

    click_cell(event) {
        let cell = this.get_grid_xy(event);
        if (find_array_in_array(this.active_cells, cell) > -1) {
            remove_array_from_array(this.active_cells, cell)
        } else {
            this.active_cells.push(cell)
        }
        this.draw_cells();
    }

    draw_cells() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw_lines()
        for (const cell of this.active_cells) {
            this.fill_cell(cell);
        }
    }

    apply_rules() {
        let new_cells = []
        // Check if alive cells have 2 or 3 neighbours
        for (const cell of this.active_cells) {
            let alive_neighbours = this.num_neighbours(cell)
            if ([2, 3].includes(alive_neighbours)) {
                new_cells.push(cell)
            }
        }

        // check if dead cells have 3 alive neighbours:
        for (const cell of this.all_cells) {
            if (find_array_in_array(this.active_cells, cell) === -1) {
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
            let neighbour_cell = [cell[0] + rel_xy[0], cell[1] + rel_xy[1]]
            if (find_array_in_array(this.active_cells, neighbour_cell) > -1) {
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
let grid = new Grid(32)

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
    if (e.key === " " ||
        e.code == "Space" ||
        e.keyCode == 32) {
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
let grid_slider = document.getElementById("grid_num");
let grid_label = document.getElementById("grid_num_label");
let canvas_slider = document.getElementById("canvas_size");
let canvas_size_label = document.getElementById("canvas_size_label");
canvas_slider.oninput = function () {
    let old_x_n = grid.x_n
    canvas.width = this.value;
    canvas.height = this.value;
    grid = new Grid(old_x_n);
    canvas_size_label.innerText = "Canvas size: " + this.value + " px";
    if (this.value<128) {
    grid_slider.max = this.value
    }
}

// prevent scrolling on space
window.addEventListener('keydown', function (e) {
    if (e.key == " " && e.target == document.body) {
        e.preventDefault();
    }
});

grid_slider.addEventListener('change', function (e) {
    let size = this.value
    grid_label.innerText = "Grid Size: " + size
    grid = new Grid(size)
});

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
    let speed = Math.pow(10, parseInt(this.value) / 10);
    console.log(speed)
    interval = 1000 / speed
    //window.setTimeout(loop, 10); // temp reset interval to make speed change immediate
    speed_label.innerText = "Speed: " + speed.toFixed(1)

});

loop();