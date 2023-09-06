function chanceArrayGen (inputArray) {
    let returnedArray = [];
    for (let n = 0; n < inputArray.length/2; n++) {
        for (let i = 0; i < inputArray[n*2+1]; i++) {
            returnedArray.push(inputArray[n*2]);
        }
    }
    return returnedArray;
}

function random () {
    return Math.random();
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