// var h = Math.floor(window.innerHeight/16)*16;
// var w = (9*h)/16;
var w = 304; var h = 540;
var series_game = new Phaser.Game(w,h,Phaser.AUTO,"series-div");

//style variables

var startTextX = 0.15*w;
var startTextY = 0.2*h;

var scoreTextX = 0.45*w;
var scoreTextY = 0.2*h;

var timeTextX = 0.4*w;
var timeTextY = 0.1*h;

var endTextX = 0.15*w;
var endTextY = 0.3*h;

var buttonEdge = 2.5*w/9;

function buttonX(i){return (w/12)+(i%3)*buttonEdge;}
function buttonY(i){return (3*h/8)+Math.floor(i/3)*buttonEdge;}

var textColor = "#DEC590";
var backgroundColor = "#124184";

var textSize = w/8;

var startStyle = { font: textSize+"px Arial", fill: textColor, wordWrap: true, wordWrapWidth: (0.8*w), align: "center" };
var buttonTextStyle = { font: "80px Arial", fill: textColor, wordWrap: true, wordWrapWidth: buttonEdge, align: "center" };
var endStyle = { font: textSize+"px Arial", fill: textColor, wordWrap: true, wordWrapWidth: (0.8*w), align: "center" };

//game constants
var endScore = 30;
var totalTime = 1000;
var timeDrop = 6;
var tutorialDrop = 3;
var timeBonus = 250;

var buttons = [];
var nextArray;
var currentNumber;
var time;
var scoreText;
var timeText;
var timeLine;
var timeLeft;

function putInButton(array)
{
    var index = Math.floor(Math.random()*array.length);
    var result = array[index];
    array.splice(index, 1);

    return result;
}

function gameOver()
{
    //time = (series_game.time.totalElapsedSeconds() - time).toFixed(2);
    series_game.state.start("endstate");
}

class gameButton
{
    constructor(x, y)
    {
        this.number = putInButton(nextArray);
        this.button = series_game.add.button(x, y, '', this.actionOnClick, this);
        this.button.width = buttonEdge; this.button.height = buttonEdge;
        this.text = series_game.add.text(0, 0, this.number.toString(), buttonTextStyle);
        this.text.scale.setTo(0.2, 0.2); this.text.x = 10; this.text.y = 10;
        this.button.addChild(this.text);
    }

    setButtonTo(value)
    {
        this.number = value;
        this.text.text = this.number.toString();
    }

    actionOnClick()
    {
        if(this.number === currentNumber+1)
        {
            currentNumber = this.number;
            if(currentNumber === endScore) gameOver();

            timeLeft += timeBonus; if(timeLeft > totalTime) timeLeft = totalTime;
            scoreText.setText(currentNumber.toString());

            if(nextArray.length === 0)
            {
                //fill upcoming array with next set of numbers
                for(var i = 0; i < 9; i++) nextArray.push(currentNumber+i+9);
            }

            //get one from the array and put in the button
            this.setButtonTo( putInButton( nextArray ) );
        }
        else gameOver();
    }

}

function startGame()
{
    series_game.state.start("mainstate");
}

var startState = {
    preload:function(){
    },

    create:function(){
        series_game.stage.backgroundColor = backgroundColor;
        var startButton = series_game.add.button(startTextX, startTextY, '', startGame, this);
        var startText = series_game.add.text(0, 0, "start with 1\npress the next number\nreach "+ endScore +" FAST", startStyle);
        startButton.addChild(startText);
    },

    update:function(){
    }
}

var mainState = {
    preload:function(){
        //load assets here
    },

    create:function(){
        //reset some variables
        currentNumber = 0;
        startTime = series_game.time.totalElapsedSeconds();

        //prepare buttons
        nextArray = [1,2,3,4,5,6,7,8,9];
        if(buttons.length > 0) buttons.splice(0, 9);
        for(var i = 0; i < 9; i++)
        {
            buttons[i] = new gameButton(buttonX(i), buttonY(i));
        }

        //prepare texts
        var timeStyle = { font: "54px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: 480, align: "center" };
        timeText = series_game.add.text(timeTextX, timeTextY, time, timeStyle);

        var scoreStyle = { font: "96px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: 480, align: "center" };
        scoreText = series_game.add.text(scoreTextX, scoreTextY, currentNumber, scoreStyle);

        //time bar
        timeLeft = totalTime;

        timeLine = series_game.add.graphics(0, 0);
        timeLine.lineStyle(0);
        timeLine.beginFill(0x44AA00, 1);
        timeLine.drawRoundedRect(0, 0, series_game.width, h/20, 1);
        timeLine.endFill();
    },

    update:function(){
        //main loop that updates what needs to be updated
        time = (series_game.time.totalElapsedSeconds() - startTime).toFixed(2);
        timeText.setText(time);

        timeLeft -= timeDrop;
        if(timeLeft <= 0) gameOver();

        timeLine.scale.set(timeLeft/totalTime, 1);
    }
}

var endState = {
    preload:function(){
    },

    create:function(){
        var endButton = series_game.add.button(endTextX, endTextY, '', startGame, this);
        var endText = series_game.add.text(0, 0, "score: " + currentNumber+" in\n" + time + " sec.", endStyle);
        endButton.addChild(endText);
    },

    update:function(){
    }
}

series_game.state.add("startstate", startState);
series_game.state.add("mainstate", mainState);
series_game.state.add("endstate", endState);
series_game.state.start("startstate");
