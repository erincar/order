var game = new Phaser.Game(480, 540,Phaser.AUTO,"colo-div");

// Google Material Design Colours (600)
colors = {
    "red" : "#E53935",
    "orange" : "#FB8C00",
    "yellow" : "#FDD835",
    "green" : "#43A047",
    "blue" : "#1E88E5",
    "purple" : "#8E24AA"
}

color_array = ["red", "orange", "yellow", "green", "blue", "purple"];
cell_text_style = { font: "48px Georgia", fill: "#000000", align: "center" };

var Cell = class Cell
{
    constructor(value, dimension, x, y)
    {
        this.value = value; // 0-5
        this.dimension = dimension;
        this.x = x; this.y = y;
        this.graphics = game.add.graphics(this.x, this.y);

        this.text = game.add.text(0, 0, (this.value+1).toString(), cell_text_style);
        this.text.x = (this.dimension - this.text.fontSize/2) / 2;
        this.text.y = (this.dimension - this.text.fontSize) / 2;
        this.text.resolution = 4;
        this.graphics.addChild(this.text);

        this.graphics.inputEnabled = true;
    }

    get color()
    {
        return colors[ color_array[this.value] ];
    }

    change()
    {
        this.value = (this.value + 1) % 6;
        this.text.text = (this.value+1).toString();
        this.draw();
    }

    draw()
    {
        // Cell Background
        this.graphics.clear();
        this.graphics.lineStyle(0);
        this.graphics.beginFill(parseInt(this.color.slice(1, 7), 16), 1);
        this.graphics.drawRect(0, 0, this.dimension, this.dimension);
        this.graphics.endFill();
    }
}

var Puzzle = class Puzzle
{
    constructor(dimension, blocks, x, y)
    {
        this.dimension = dimension; // game is going to have <dimension> px width & height
        this.blocks = blocks;       // there is going to be <blocks> cells on each row & column
        this.x = x; this.y = y;     // where to place the game on the screen
        this.cells = [];
        this.cell_graphics = [];
        this.touch_timer = 0;
        this.long_touch = 700;
        this.moves = 0;

        this.generate();
    }

    generate()
    {
         // Generate balanced amounts from each color.
         var cell_amount = this.blocks * this.blocks;
         var cell_dimension = this.dimension / this.blocks;
         while(!this.check_start_state())
         {
             this.cells = [];
             for(var i = 0; i < cell_amount; i++)
             {
                 var random_number = Math.floor(Math.random() * 6);
                 var x = this.x +           (i % this.blocks) * cell_dimension;
                 var y = this.y + Math.floor(i / this.blocks) * cell_dimension;

                 this.cells.push( new Cell(random_number, cell_dimension, x, y) );
             }
         }

        for(var i = 0; i < cell_amount; i++)
        {
            this.cells[i].graphics.events.onInputDown.add(this.startTouch, this);
            this.cells[i].graphics.events.onInputUp.add(this.move,[this, i]);
        }
    }

    check_start_state()
    {
        // Return true if the tiles are generated in a balanced manner
        if(this.cells.length == 0) return false;
        var cell_amount = this.blocks * this.blocks;
        var counts = {};
        for(var i = 0; i < cell_amount; i++)
        {
            var cell = this.cells[i].value;
            counts[cell] = counts[cell] ? counts[cell]+1 : 1;
        }

        for(var key in counts)
        {
            var min = Math.floor(cell_amount / 6) - 2;
            var max = Math.floor(cell_amount / 6) + 2;
            if(counts[key] < min || counts[key] > max) return false;
        }
        return true;
    }

    startTouch(graphics)
    {
        this.touch_timer = game.time.now;
    }

    get touch_time()
    {
        return (this.touch_timer > 0) ? game.time.now - this.touch_timer : -1;
    }

    neighbors_list(index)
    {
        var neighbors = {};
        index = parseInt(index);
        var row = Math.floor(index / this.blocks);
        var col = (index % this.blocks);

        // Has right cell
        if( col < this.blocks - 1)
            neighbors[index + 1] = this.cells[index + 1];
        // Has left cell
        if( col > 0 )
            neighbors[index - 1] = this.cells[index - 1];
        // Has top cell
        if( row > 0 )
            neighbors[index - this.blocks] = this.cells[index - this.blocks];
        // Has bottom cell
        if( row < this.blocks - 1)
            neighbors[index + this.blocks] = this.cells[index + this.blocks];
        return neighbors;
    }

    cell_change_condition(index)
    {
        // Before changing the pressed cell, this condition is checked
        var neighbors = this.neighbors_list(index);
        for(var n in neighbors)
            if(neighbors[n].value == (this.cells[index].value + 1) % 6) return true;
        return false;
    }

    change_one(index)
    {
        if( this.cell_change_condition(index) )
        {
            this.cells[index].change();
            this.moves += 1;
            return true;
        }
        return false;
    }

    change_set(index)
    {
        var neighbors = this.neighbors_list(index);
        var cluster_value = this.cells[index].value;
        if( this.change_one(index) )
            for(var n in neighbors) this.change_wave(n, cluster_value);
    }

    change_wave(index, value)
    {
        // Spread the change to the cluster of same valued neighbors
        if( this.cells[index].value != value ) return;
        this.cells[index].change();
        var neighbors = this.neighbors_list(index);
        for(var n in neighbors) this.change_wave(n, value);
    }

    move(graphics)
    {
        var puzzle = this[0]; var index = this[1];
        var touch_time = game.time.now - puzzle.touch_timer;
        puzzle.touch_timer = -1;
        if( touch_time >= puzzle.long_touch )
            puzzle.change_set(index);
        else puzzle.change_one(index);
        var status = puzzle.check_state();
        if( status !== "continue" )
            game.state.start("end_state", true, false, status, puzzle.moves, puzzle.cells[0]);
    }

    check_state()
    {
        // Check if there are still viable moves
        var tile_amounts = {};
        for(var c in this.cells)
        {
            var v = this.cells[c].value;
            tile_amounts[v] = tile_amounts[v] ? tile_amounts[v]+1 : 1;
            if(this.cell_change_condition(c))
                return "continue";
        }

        // If there are none, check if won or lost
        if( Object.keys(tile_amounts).length == 1 )
            return "won";
        return "lost";
    }

    draw()
    {
        // Draw cells
        var cell_amount = this.blocks * this.blocks;
        for(var i = 0; i < cell_amount; i++)
        {
            this.cells[i].draw();
        }
    }
}

var main_state = {
    preload:function(){
    },

    create:function(){
        game.stage.backgroundColor = "#000000";
        puzzle = new Puzzle(game.width, 6, 0, 0);
        puzzle.draw();
        score_text = game.add.text(0, 480, "Moves: "+puzzle.moves,  {font: "24px Georgia", fill: "#FFFFFF"});
    },

    update:function(){
        score_text.text =  "Moves: "+puzzle.moves;
        if(puzzle.touch_time >= puzzle.long_touch)
            score_text.text += "  *long touch*";
    },
}

var end_state = {
    init:function(s, m, c){
        status = s;
        moves = m;
        cell = c;
    },

    create:function(){
        game.stage.backgroundColor = (status == "won") ? cell.color : "#CCCCCC";
        var x = game.world.centerX - 80;
        var y = game.world.centerY - 80;
        end_text = game.add.text(x, y, status,  {font: "92px Georgia", fill: "#000000", wordWrap: true, wordWrapWidth: game.width, align: "center"});
        score_text = game.add.text(x, y+120, "Moves: "+moves,  {font: "48px Georgia", fill: "#000000", wordWrap: true, wordWrapWidth: game.width, align: "center"});
        end_text.resolution = 4;

        replay_button = game.add.button(0, 0, "", this.replay, this);
        replay_button.width = game.width;
        replay_button.height = game.height;
    },

    replay()
    {
        game.state.start("main_state");
    },

    update:function(){
    },
}

game.state.add("main_state", main_state);
game.state.add("end_state", end_state);
game.state.start("main_state");
