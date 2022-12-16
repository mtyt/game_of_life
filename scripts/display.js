let canvas_slider = document.getElementById("canvas_size");
let canvas_size_label = document.getElementById("canvas_size_label");
canvas_slider.oninput = function() {
        let old_x_n = grid.x_n
        canvas.width = this.value;
        canvas.height = this.value;
        grid = new Grid(old_x_n);
        canvas_size_label.innerText = "Canvas size: " + this.value + " px";
    } 