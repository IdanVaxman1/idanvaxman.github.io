'use strict'

const MINE = '💣';
const FLAG = '🚩';
const LIVE = '❤️';
const NORMAL = '😃';
const SAD = '😵';
const WIN = '😎';


var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
var gFirstClick = false;
var gBoard;
var gLiveCount = 3;
var gShow;
var gFlagCount = gLevel.MINES;
var gTimer;

function initGame() {
    disableContextMenu();
    gBoard = buildBoard();
    console.table('gBoard', gBoard);
    renderBoard();
    renderLive();
    renderFlag();
}


function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isOpen: false
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function genBoard(excludedRow, excludedCol) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var pos = getEmptyCell(gBoard, excludedRow, excludedCol);
        gBoard[pos.i][pos.j].isMine = true;
    }

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            cell.minesAroundCount = setMinesNegsCount({ i, j }, gBoard);
        }
    }
}

function renderBoard() {
    var strHTML = '';

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            var className = (cell.isShown) ? 'show' : ''
            var show;
            var showCount = (cell.isShown && cell.minesAroundCount > 0) ? cell.minesAroundCount : '';
            var showMine = (cell.isShown) ? MINE : '';
            if (cell.isMarked) show = FLAG;
            else if (cell.isMine) show = showMine;
            else show = showCount;
            strHTML += `<th  class="${className}" oncontextmenu="createFlag(${i}, ${j})" onclick="cellClicked( ${i}, ${j})">${show}</th>`;
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;

}

function getEmptyCells(board, excludedRow, excludedCol) {
    var empty = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (!cell.isMine && !(i === excludedRow && j === excludedCol)) empty.push({ i: i, j: j });
        }
    }
    return empty;
}

function getEmptyCell(board, excludedRow, excludedCol) {
    var emptyCells = getEmptyCells(board, excludedRow, excludedCol);
    return emptyCells[getRandom(0, emptyCells.length - 1)];
}

function cellClicked(i, j) {
    var elSmiley = document.querySelector('.smiley');
    if (!gGame.isOn) return
    if (!gFirstClick) {
        gFirstClick = true;
        genBoard(i, j);
        if(gTimer){
            stopTimer(gTimer);
        }
        gTimer = setTimer(renderTimer);
    }
    // mine is pressed
    if (gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true;
        --gLiveCount;
        renderLive();
        if (gLiveCount === 0) {
            gameOver();
        }
    }
    if (gBoard[i][j].minesAroundCount > 0 && !gBoard[i][j].isMine && !gBoard[i][j].isMarked ) {
        gBoard[i][j].isShown = true;
        gBoard[i][j].isOpen = true;
    }
    else {
        gBoard[i][j].isShown = true;
        expandShown({ i: i, j: j }, gBoard);
    }
    renderBoard();
    checkWin();
}


function setMinesNegsCount(pos, board) {
    var MinesNegsCount = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i === pos.i && j === pos.j) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) MinesNegsCount++;
        }
    }
    board[pos.i][pos.j].minesAroundCount = MinesNegsCount;
    return MinesNegsCount;
}


function expandShown(pos, board) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            var cell = board[i][j];
            if (i === pos.i && j === pos.j) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (!cell.isMine && !board[pos.i][pos.j].isMine && !cell.isMarked) {
                 cell.isShown = true;
                 if(cell.minesAroundCount === 0 && !cell.isOpen){
                     debugger
                    cell.isOpen = true;
                    expandShown({i:i,j:j}, board);
                 }
            }
        }
    }
}

function renderLive() {
    var strHTML = '';
    for (var i = 0; i < 1; i++) {
        strHTML += '<ul>'
        for (var j = 0; j < gLiveCount; j++) {
            strHTML += `<li>${LIVE}</live>`
        }
        strHTML += '</ul>'
    }

    var elLive = document.querySelector('.lives');
    elLive.innerHTML = strHTML;
}

function renderTimer(timer){
    var elTimer = document.querySelector('.timer span');
    elTimer.innerText = `${timer}`

}

function renderFlag() {
    var elFlag = document.querySelector('.flag');
    elFlag.innerHTML = `${FLAG}  ${gFlagCount}`;
}

function disableContextMenu() {
    document.addEventListener('contextmenu', event => event.preventDefault());
}

function createFlag(i, j) {
    if (!gGame.isOn || !gBoard[i] || !gBoard[i][j] || gBoard[i][j].isShown) return;
    if (!gBoard[i][j].isMarked && gFlagCount > 0) {
        gBoard[i][j].isMarked = true;
        gFlagCount--;
        renderBoard()
        renderFlag();
    }
    else if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        gFlagCount++;
        renderBoard()
        renderFlag();
    }
}


function formatTime(totalSeconds) {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function setTimer(timerCallback, formatCallback) {
    const start = Date.now();
    return setInterval(() => {
        let totalSeconds = Math.floor((Date.now() - start) / 1000);
        if (!formatCallback) formatCallback = formatTime;
        timerCallback(formatCallback(totalSeconds));
    }, 1000);
}


function stopTimer(timer) {
    clearInterval(timer);
}


function checkWin() {
    var elSmiley = document.querySelector('.smiley');
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isMine && cell.isMarked) return
            if (cell.isMine && !cell.isMarked && !cell.isShown) return
            if (!cell.isMine && !cell.isShown) return
        }
    }
    alert('Victory!');
    if(gFirstClick){
        stopTimer(gTimer);
    }
    elSmiley.innerText = WIN;
    gGame.isOn = false;
}


function gameOver() {
    gGame.isOn = false;
    var elSmiley = document.querySelector('.smiley');
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
            }
        }
    }
    if(gTimer){
        stopTimer(gTimer);
        gTimer = null;
    }
    elSmiley.innerText = SAD;
}

function resetGame() {
    gGame.isOn = true;
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = NORMAL;
    gLiveCount = 3;
    gFlagCount = gLevel.MINES;
    gFirstClick = false;
    if(gTimer){
        stopTimer(gTimer);
        gTimer = null;
        renderTimer('00:00');
    }
    initGame();
}

function difficult(elDiff) {
    if (elDiff.innerText === 'Easy') {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        gFlagCount = gLevel.MINES;
        resetGame()
        initGame();
    }
    if (elDiff.innerText === 'Medium') {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
        gFlagCount = gLevel.MINES;
        resetGame()
        initGame();
    }
    if (elDiff.innerText === 'Hard') {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
        gFlagCount = gLevel.MINES;
        resetGame()
        initGame();
    }
}

