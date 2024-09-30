function chanceArrayGen (inputArray) {
    let returnedArray = [];
    for (let n = 0; n < inputArray.length/2; n++) {
        for (let i = 0; i < inputArray[n*2+1]; i++) {
            returnedArray.push(inputArray[n*2]);
        }
    }
    return returnedArray;
}

let rdmCount = -1;
let rdmArray = [];
for (let i = 0; i < 100000; i++) {
    rdmArray.push(Math.random());
}


function random () {
    rdmCount++;
    if (rdmCount >= rdmArray.length) {
        rdmCount = -1;
    }

    return rdmArray[rdmCount];

    //return Math.random();
}

function floor (inputNum) {
    return Math.floor(inputNum);
}

function ceil (inputNum) {
    return Math.ceil(inputNum);
}

function round (inputNum) {
    return (inputNum + (inputNum > 0 ? 0.5 : -0.5)) << 0;
}

function sqrt (inputNum) {
    return Math.sqrt(inputNum);
}

function abs (inputNum) {
    return Math.abs(inputNum);
}

function cos (inputNum) {
    return Math.cos(inputNum);
}

function sin (inputNum) {
    return Math.sin(inputNum);
}

function hyp (katet1, katet2) {
    return sqrt(katet1**2+katet2**2);
}

function negPos () {
    return (round(random()) == 1 ? -1 : 1);
}

function hMONIN (inputNum1, inputNum2) { //howManyOfNumberInNumber = hMONIN
    let left = inputNum2 % inputNum1;
    let answer = (inputNum2 - left)/inputNum1;
    return answer;
}

function calcAngleToMouse (x, y) {
    let yDif = (mouse.y-y);
    let xDif = (mouse.x-x);
    let angle = Math.atan2(yDif, xDif);

    return angle;
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

function tileType (x, y) {
    let xTile; let yTile;

    if (x < 0) {
        xTile = floor((1+x%1)*chunkWidth);
    } else {
        xTile = floor((x%1)*chunkWidth);
    }

    if (y < 0) {
        yTile = floor((1+y%1)*chunkHeight);
    } else {
        yTile = floor((y%1)*chunkHeight);
    }

    let chunk = [floor(futureX), floor(futureY)];
    let tile = [xTile, yTile];

    let tileType = map[chunk].tiles[tile];

    return tileType;
}

function pathFinding (startPos, goalPos, hitBox, speed) {
    /*
      startPos = [x, y]
      goalPos  = [x, y]
      hitBox   = [[-x, -y], [x, -y],
                  [-x,  y], [x,  y]]
      speed = value
    */

    


}

function calcDamage (damage, strength, defence) {
    return (damage * strength/100) / (1 + defence/100);
}