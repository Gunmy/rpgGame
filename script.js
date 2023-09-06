//Stop scrolling with arrowkeys because the game uses those
window.addEventListener("keydown", function(e) {
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1){
        e.preventDefault();
    }
}, false);

let gtx = document.getElementById("canvas");
let ctx = gtx.getContext("2d");
let pOutput = document.getElementById("pOutput");

const WIDTH = ctx.canvas.width;
const HEIGHT = ctx.canvas.height;

let inventoryMap = new Image();
inventoryMap.src = "images/inventory.png";

let tileMap = new Image();
tileMap.src = "images/tiles.png";

let entitiesMap = new Image();
entitiesMap.src = "images/entitiesResized.png";

let effectsMap = new Image();
effectsMap.src = "images/effects.png";

//Height and width of blocks
let tilePixelHeight = 50;
let tilePixelWidth = 50;

//Amount of tiles in chunks
let chunkHeight = 10;
let chunkWidth  = 10;

//Amount of chunks loaded
let chunkLoadHeight = round(100/tilePixelHeight);
let chunkLoadWidth  = round(100/tilePixelWidth);
let entityLoadDistance = 1;

//Hight and width of chunks in pixels
let chunkPixelHeight = tilePixelHeight * chunkHeight;
let chunkPixelWidth = tilePixelWidth * chunkWidth;

//Tile border related stuff
let patternX = [0, -1, -1];
let patternY = [1, 0, 1];
let tileBorderHeight = tilePixelHeight/40;
let tileBorderWidth = tilePixelWidth/40;

const PI = Math.PI;

class chunk {
    x; y; width; height; type;
    width = chunkWidth;
    height = chunkHeight;
    entitiesList = [];

    tiles = {};

    constructor (x, y) {
        this.x = x;
        this.y = y;

        let chunkPatternX = [-1, 0, 1, 
                            -1,     1, 
                            -1, 0, 1];
        let chunkPatternY = [1, 1, 1, 
                            0,      0, 
                           -1, -1, -1];

        let nextToChunkTypes = [];

        for (let n = 0; n < chunkPatternX.length; n++) {
            if (typeof map[[x+chunkPatternX[n], y+chunkPatternY[n]]] != "undefined") {
                nextToChunkTypes.push(map[[x+chunkPatternX[n], y+chunkPatternY[n]]].type);
            } 
            else {
                nextToChunkTypes.push("undefined");
            }
        }

        let preferredTypes = [];
        let bannedTypes = [];

        for (let n = 0; n < Object.keys(chunkTypeDictionary).length; n++) {
            preferredTypes.push(n);
        }

        for (let n = 0; n < nextToChunkTypes.length; n++) {
            if (nextToChunkTypes[n] != "undefined") {
                preferredTypes = preferredTypes.concat(chunkTypeDictionary[nextToChunkTypes[n]].preferredNeighbours);
                bannedTypes = bannedTypes.concat(chunkTypeDictionary[nextToChunkTypes[n]].bannedBiomes);
            }
        }

        for (let n = 0; n < bannedTypes.length; n++) {
            while (preferredTypes.indexOf(bannedTypes[n]) !== -1) {
                preferredTypes.splice(preferredTypes.indexOf(bannedTypes[n]), 1);
            }
        }

        this.type = preferredTypes[floor(random()*preferredTypes.length)];

        for (let i = 0; i < chunkWidth; i++) {
            for (let j = 0; j < chunkHeight; j++) {
                let rdm;
                if        (nextToChunkTypes[3] != "undefined" && i == 0 && round(random()) == 1) {
                    rdm = floor(random()*chunkTypeDictionary[nextToChunkTypes[3]].scatterTile.length);
                    this.tiles[[i, j]] = chunkTypeDictionary[nextToChunkTypes[3]].scatterTile[rdm];
                    
                } else if (nextToChunkTypes[4] != "undefined" && i == chunkWidth-1 && round(random()) == 1) {
                    rdm = floor(random()*chunkTypeDictionary[nextToChunkTypes[4]].scatterTile.length);
                    this.tiles[[i, j]] = chunkTypeDictionary[nextToChunkTypes[4]].scatterTile[rdm];

                } else if (nextToChunkTypes[1] != "undefined" && j == chunkHeight-1 && round(random()) == 1) {
                    rdm = floor(random()*chunkTypeDictionary[nextToChunkTypes[1]].scatterTile.length);
                    this.tiles[[i, j]] = chunkTypeDictionary[nextToChunkTypes[1]].scatterTile[rdm];

                } else if (nextToChunkTypes[6] != "undefined" && j == 0 && round(random()) == 1) {
                    rdm = floor(random()*chunkTypeDictionary[nextToChunkTypes[6]].scatterTile.length);
                    this.tiles[[i, j]] = chunkTypeDictionary[nextToChunkTypes[6]].scatterTile[rdm];
                }
                else {
                    rdm = floor(random()*chunkTypeDictionary[this.type].mainTile.length);
                    this.tiles[[i, j]] = chunkTypeDictionary[this.type].mainTile[rdm];
                }
            }
        }

        if (chunkTypeDictionary[this.type].structures.length > 0) {
            let rdm = floor(random()*1000);
            let chance = 0;
            for (let n = 0; n < chunkTypeDictionary[this.type].structures.length; n++) {
                if (chance <= rdm && rdm < chance+structureDictionary[chunkTypeDictionary[this.type].structures[n]].spawnChance) {
                    this.tiles = structureDictionary[chunkTypeDictionary[this.type].structures[n]].addStructure(this.tiles);
                    console.log(chunkTypeDictionary[this.type].structures[n]);
                    if (chunkTypeDictionary[this.type].structures[n] == 8) {
                        entitiesList.push(new camper(0, 900, this.x+0.5, this.y+0.5, 100, 100, 0.05, 0.1, 1, ["Sexy", "Lazy", "Racist"][floor(random()*3)] + " Camper", [0, 0, 0]));
                        //costumeX, costumeY, x, y, width, height, sizeRadius, speed, trackingRange, name
                    }
                    
                    break;
                } else {
                    chance += structureDictionary[chunkTypeDictionary[this.type].structures[n]].spawnChance;
                }
            }
        }

    }

    distancePlayerToMouse (tile) {
        return hyp(
                    (this.x-player.x)*chunkWidth+tile[0], 
                    (this.y-player.y)*chunkHeight+tile[1]
                ) < mouse.range;
    }

    draw (x, y) {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {

                if (
                ((x + (i-1) * tilePixelWidth< WIDTH || x + (i-1) * tilePixelWidth > 0) || (x + i * tilePixelWidth < WIDTH || x + i * tilePixelWidth > 0)) 
                && ((y * (j-1) * tilePixelHeight < HEIGHT || y * (j-1) * tilePixelHeight > 0) || (y * j * tilePixelHeight < HEIGHT || y * j * tilePixelHeight > 0))
                ) {

                //Sends the information of 3 tiles next to it (L-shape) to the tile,
                //so that it can draw borders
                let surroundings = {};
                for (let k = 0; k < patternX.length; k++) {
                    if (typeof(this.tiles[[i + patternX[k], j + patternY[k]]]) != "undefined") {
                        surroundings[[patternX[k], patternY[k]]] = tilesDictionary[this.tiles[[i + patternX[k], j + patternY[k]]]].level == tilesDictionary[this.tiles[[i, j]]].level;
                    }
                    else {
                        surroundings[[patternX[k], patternY[k]]] = false;
                    }
                }
            
                let level;
                if (j > 0) {level = tilesDictionary[this.tiles[[i, j-1]]].level; }
                else if (typeof(map[[this.x, this.y-1]]) != "undefined") {level = tilesDictionary[map[[this.x, this.y-1]].tiles[[i, chunkHeight-1]]].level;}
                else    {level = 0;}

                tilesDictionary[this.tiles[[i, j]]].draw(
                    round(x + i * tilePixelWidth),
                    round(y + j * tilePixelHeight),
                    surroundings, level
                );
                
                //Check if the mouse is inside the tile
                if (x + i * tilePixelWidth < mouse.x &&
                    mouse.x <= x + (i + 1) * tilePixelWidth &&
                    y + j * tilePixelHeight < mouse.y &&
                    mouse.y <= y + (j + 1) * tilePixelHeight) {
                        mouse.tile = [i, j];
                        ctx.drawImage(
                            tileMap, 500, 0, 100, 100,
                            round(x + i * tilePixelWidth), round(y + j * tilePixelHeight), 
                            tilePixelWidth, tilePixelHeight
                        );
                        ctx.beginPath();

                        if (this.distancePlayerToMouse(mouse.tile)) {
                            ctx.strokeStyle = "#FFFFFF";
                        } else {
                            ctx.strokeStyle = "red";
                        }

                        ctx.lineWidth = tilePixelWidth/10;
                        ctx.moveTo(x + (i + 0.5) * tilePixelWidth, y + (j + 0.5) * tilePixelHeight);
                        ctx.lineTo(mouse.x, y + (j + 0.5) * tilePixelHeight);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();

                        
                }

                for (let n = 0; n < (player.corners).length; n++) {
                    if (x + i * tilePixelWidth < player.corners[n][0] &&
                        player.corners[n][0] <= x + (i + 1) * tilePixelWidth &&
                        y + j * tilePixelHeight < player.corners[n][1] &&
                        player.corners[n][1] <= y + (j + 1) * tilePixelHeight) {
                            if (tilesDictionary[this.tiles[[i, j]]].level > player.level) {
                                player.level = tilesDictionary[this.tiles[[i, j]]].level;
                            }
                        
                            if (tilesDictionary[this.tiles[[i, j]]].isFluid) {
                                player.inFluidCorners[n] = true;
                            }

                            if (this.tiles[[i, j]] == 6) {
                                player.onFire = true;
                            }
                        
                    }
                }
                if (abs(floor(this.x)-floor(player.x)) <= entityLoadDistance 
                && abs(floor(this.y)-floor(player.y)) <= entityLoadDistance) {
                    if (this.tiles[[i, j]] == 6 && floor(random()*2000) == 1) {
                        particlesListInFront.push(new smokeParticle(this.x+(i+random())/chunkWidth, this.y+(j+random())/chunkWidth, 
                        random()*0.15, 2)); 
                    } else if (this.tiles[[i, j]] == 33 && floor(random()*500) == 1) {
                        particlesListInFront.push(new coloredParticle(this.x+(i+random())/chunkWidth, this.y+(j+random())/chunkWidth, 
                        random()*0.15, 2, [86, 61, 113], 0.05, 0, -1, 0));
                    } else if (this.tiles[[i, j]] == 33 && floor(random()*20000) == 1) {
                        particlesListInFront.push(new cloud(this.x+(i+random())/chunkWidth, this.y+(j+random())/chunkWidth, 
                        1.5, 10));
                    } else if (this.tiles[[i, j]] == 32 && floor(random()*10) == 1) {
                        particlesListInFront.push(new coloredParticle(this.x+(i+random())/chunkWidth, this.y+(j+random())/chunkWidth, 
                        random()*0.15, 2, [165, 84, 31], 0.05, 0, -1, 0));
                    } else if (this.tiles[[i, j]] == 31 && floor(random()*500) == 1) {
                        particlesListInFront.push(new coloredParticle(this.x+(i+random())/chunkWidth, this.y+(j+random())/chunkWidth, 
                        random()*0.15, 2, [202, 170, 251], 0.05, 0, -1, 0));
                    } else if (this.tiles[[i, j]] == 3 && floor(random()*5000) == 1) {
                        let rdmx = random();
                        let rdmy = random();
                        particlesListInFront.push(new coloredParticle(this.x+(i+rdmx)/chunkWidth, this.y+(j+rdmy)/chunkWidth, 
                        random()*0.1, 2, [86, 176, 248], 0, 0, 0, 0));
                        particlesListInFront.push(new coloredParticle(this.x+(i+rdmx)/chunkWidth, this.y+(j+rdmy)/chunkWidth, 
                        random()*0.15, 2, [255, 255, 255], 0, 0, 0, 0));
                    } else if ((this.tiles[[i, j]] == 35 || this.tiles[[i, j]] == 37) && floor(random()*50) == 1) {
                        particlesListInFront.push(new coloredParticle(this.x+(i+random())/chunkWidth, this.y+(j+random())/chunkWidth, 
                        random()*0.15, 2, [255, 255, 35+random()*50], 0.05, 0, -1, 0));
                    }
                }

                //entitiesList.push(new coloredParticle(this.x+(tile[0]+random())/chunkWidth, this.y+(tile[1]+random())/chunkHeight, 0.2, random()*2, [round(random()*255), round(random()*255), round(random()*255)]));
            }

            }
        }
    }
    

    destroyBlock (tile) {
        if (this.distancePlayerToMouse(tile)) {
            let tempMouseTile = this.tiles[tile];
            this.tiles[tile] = mouse.lastTile;
            mouse.lastTile = tempMouseTile;
            for (let i = 0; i < 10; i++) {
                particlesListInFront.push(
                    new coloredParticle(this.x+(tile[0]+random())/chunkWidth, this.y+(tile[1]+random())/chunkHeight, 0.2, random()*2, 
                    [round(random()*255), round(random()*255), round(random()*255)], 0.3, 
                    negPos(), 1, 1));
                particlesListInFront.push(
                    new textParticle(this.x+(tile[0]+random())/chunkWidth, this.y+(tile[1]+random())/chunkHeight, random()*0.3, random()*2,  
                        [round(random()*255), round(random()*255), round(random()*255)], 0.3, 
                        negPos(), 1, 1, "Replaced"));
            }
        }
    }

}


class playerClass {
    x; y;
    width = 100;
    height = 100;
    sizeRadius = 0.2;
    hitBox = 0.02;
    maxHealth = 100;
    health = this.maxHealth;

    velx = 0;
    vely = 0;
    speed = 0.11;
    smooth = 0.4;
    inFluid = 0;
    inFluidCorners = [false, false, false, false];
    onFire = false;

    state = 0;

    sizeConstant = 0.1;

    animations = [
                    [0, 0],
                    [100, 0],
                    [200, 0],
                    [100, 0],
                    [0, 0],
                    [100, 100],
                    [200, 100]
    ];
    animationOffset = [0, 0];
    lastMoved = Date.now();
    level = 0;

    speedBuffMax = 500;
    speedBuffLeft = this.speedBuffMax;
    speedBuffActive = 0;
    speedBuffLastActive = Date.now();

    corners;

    feety; feetx; realx; realy;

    get realPos () {
        this.realx = round((WIDTH-tilePixelWidth - (this.level-1)*tilePixelWidth*this.sizeConstant)/2);
        this.realy = round((HEIGHT-tilePixelHeight - (this.level-1)*tilePixelHeight*this.sizeConstant)/2);
        this.feety = round((HEIGHT)/2);
        this.feetx = round((WIDTH)/2);

        this.corners = [
            [this.feetx-round(tilePixelWidth/3), this.feety-round(tilePixelHeight/3)],
            [this.feetx-round(tilePixelWidth/3), this.feety+round(tilePixelHeight/3)],
            [this.feetx+round(tilePixelWidth/3), this.feety+round(tilePixelHeight/3)],
            [this.feetx+round(tilePixelWidth/3), this.feety-round(tilePixelHeight/3)]
        ];
    }

    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.realPos;
    }

    get move () {

        if (this.inFluidCorners.every(element => element === true)) {
            this.inFluid = 1;
        }

        //Speedbuff on ctrl
        if (buffs[17] == 1 && this.speedBuffLeft > 0) {
            this.speedBuffActive = 1;
            this.speedBuffLastActive = Date.now();
            this.speedBuffLeft -= deltaTime * 100;
            if (this.speedBuffLeft < 0) {
                this.speedBuffLeft = 0;
            }
        } else if (Date.now() - this.speedBuffLastActive > 1000) {
            this.speedBuffActive = 0;
            this.speedBuffLeft += 0.1 + deltaTime * this.speedBuffLeft * 0.9;
            if (this.speedBuffLeft > this.speedBuffMax) {
                this.speedBuffLeft = this.speedBuffMax;
            }
        } else {
            this.speedBuffActive = 0;
        }

        if (this.health <= 0) {
            this.health = this.maxHealth;
            this.x = 0;
            this.y = 0;
        } else if (this.health < this.maxHealth) {
            this.health += this.maxHealth * deltaTime/100;
        }

        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }

        this.velx = this.velx * this.smooth + (buffs[39] - buffs[37]) * this.speed * deltaTime * (1 + this.speedBuffActive/3*2) / (1 + this.inFluid);
        this.vely = this.vely * this.smooth + (buffs[40] - buffs[38]) * this.speed * deltaTime * (1 + this.speedBuffActive/3*2) / (1 + this.inFluid);

        if (Date.now() - this.lastMoved > 80-this.speedBuffActive*50) {
            this.lastMoved = Date.now();
            if (round(abs(this.velx)*chunkWidth/deltaTime) > 0 || round(abs(this.vely)*chunkHeight/deltaTime) > 0) {
                if (round(this.vely*chunkHeight/deltaTime) < 0) {
                    this.animationOffset[1] = 200;
                } else {
                    this.animationOffset[1] = 0;
                }

                if (this.inFluid == 1) {
                    this.animationOffset[0] = 1000;
                } else {
                    this.animationOffset[0] = 0;
                }
                this.state++;
                if (this.state >= this.animations.length) {
                    this.state = 0;
                }
            } else {
                this.state = 0;
            }
        }

        this.y += this.vely;
        this.x += this.velx;
    }

    get draw () {
        this.realPos;
        ctx.drawImage(
            entitiesMap,
            this.animations[this.state][0]+this.animationOffset[0], this.animations[this.state][1]+this.animationOffset[1], this.width, this.height,
            this.realx, this.realy, tilePixelWidth + round((this.level-1)*tilePixelWidth*this.sizeConstant), 
            tilePixelHeight + round((this.level-1)*tilePixelHeight*this.sizeConstant)
        );
    }
}

class effectImages {
    x; y; width; height;

    constructor (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw (x, y, width, height) {
        ctx.drawImage(
            effectsMap,
            this.x, this.y, this.width, this.height,
            x, y, width, height
        );
    }
}

let effectsDictionary = {
    "inFluid": new effectImages(0, 0, 100, 100),
    "onFire": new effectImages(100, 0, 100, 100),
    "running": new effectImages(200, 0, 100, 100)
}

function displayEffects () {
    let normHeight = 40;
    let normWidth = 40;
    let normDistance = 10;

    let startX = WIDTH-10-normWidth;
    let startY = 10;
    let effectList = [];

    if (player.inFluid == 1) {
        effectList.push("inFluid");
    }
    if (player.onFire == 1) {
        effectList.push("onFire");
    }
    if (player.speedBuffActive) {
        effectList.push("running");
    }

    for (let n=0; n < effectList.length; n++) {
        effectsDictionary[effectList[n]].draw(startX-n*(normWidth+normDistance), startY, normWidth, normHeight);
    }

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(WIDTH-80, HEIGHT-80, 50, 0, 2*PI);
    ctx.fill();

    ctx.lineWidth = 20;
    ctx.beginPath();
    grd = ctx.createLinearGradient(WIDTH-130, HEIGHT-130, WIDTH-30, HEIGHT-30);
    grd.addColorStop(0, "#FFFFFF");
    grd.addColorStop(0.4, "#FF0000");
    grd.addColorStop(1, "#990200");
    ctx.strokeStyle = grd;
    ctx.arc(WIDTH-80, HEIGHT-80, 40, -3/4*PI, -3/4*PI-2*PI*player.health/player.maxHealth, true);
    ctx.stroke();

    ctx.lineWidth = 30;
    ctx.beginPath();
    grd = ctx.createLinearGradient(WIDTH-130, HEIGHT-130, WIDTH-30, HEIGHT-30);
    grd.addColorStop(0, "#FFFFFF");
    grd.addColorStop(0.4, "#03DB00");
    grd.addColorStop(1, "#029100");
    ctx.strokeStyle = grd;
    ctx.arc(WIDTH-80, HEIGHT-80, 15, -3/4*PI, -3/4*PI-2*PI*player.speedBuffLeft/player.speedBuffMax, true);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    /*grd = ctx.createLinearGradient(WIDTH-130, HEIGHT-130, WIDTH-30, HEIGHT-30);
    grd.addColorStop(0, "#FFFFFF");
    grd.addColorStop(0.4, "#FFFF21");
    grd.addColorStop(1, "#CCCC1A");
    ctx.strokeStyle = grd;*/
    ctx.strokeStyle = "white";
    ctx.arc(WIDTH-80, HEIGHT-80, 50, 0, 2*PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(WIDTH-80, HEIGHT-80, 30, 0, 2*PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(WIDTH-80, HEIGHT-80, 1, 0, 2*PI);
    ctx.stroke();
}

let player = new playerClass(0, 0);

let map = {};


document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
gtx.addEventListener("mousemove", mouseMove);
gtx.addEventListener("click", mouseClick);
gtx.addEventListener("wheel", mouseZoom);


let mouse = {
    x: 0,
    y: 0,
    chunk: [0, 0],
    tile: [0, 0],
    lastTile: 1,
    range: 4,
    containing: 100,
    amount: 1
}

function mouseMove (e) {
    let borderWidth = 20;
    let rect = gtx.getBoundingClientRect();
    mouse.x = e.clientX - rect.left - borderWidth;
    mouse.y = e.clientY - rect.top - borderWidth;
}

function mouseClick (e) {
    if (inventoryActive) {
        inventoryClick();
    } else {
        console.log(mouse.x + " " + mouse.y + " " + mouse.chunk);
        map[mouse.chunk].destroyBlock(mouse.tile);
    }
}

function mouseZoom (e) {
    e.preventDefault;

    tilePixelHeight += e.deltaY/100;
    tilePixelWidth  += e.deltaY/100;

    if (tilePixelHeight < 1) {tilePixelHeight = 1;}
    if (tilePixelWidth < 1) {tilePixelWidth = 1;}

    chunkLoadHeight = round(100/tilePixelHeight);
    chunkLoadWidth  = round(100/tilePixelWidth);

    if (chunkLoadHeight > 10) {chunkLoadHeight = 10;} else if (chunkLoadHeight < 4) {chunkLoadHeight = 4;}
    if (chunkLoadWidth > 10) {chunkLoadWidth = 10;} else if (chunkLoadWidth < 4) {chunkLoadWidth = 4;}

    chunkPixelHeight = tilePixelHeight * chunkHeight;
    chunkPixelWidth = tilePixelWidth * chunkWidth;
}

//Keyboard presses
let buffs = {};
for (let i = 0; i < 200; i++) {
    buffs[i] = 0;
}

function keyDown (e) {
    let pressed = e.keyCode;
    console.log(pressed);
    buffs[pressed] = 1;
}

function keyUp (e) {
    let pressed = e.keyCode;
    buffs[pressed] = 0;
    lastPress = pressed;
}

function drawTiles () {
    //Create relevant variables
    let chunkCoordinateX;
    let chunkCoordinateY;

    let chunkOnCanvasCoordinateX;
    let chunkOnCanvasCoordinateY;

    //Calculate how much the tiles should be offset by
    let playerOffsetX = player.x%1;
    if (player.x < 0) {
        playerOffsetX = 1 + playerOffsetX;
    }
    let playerOffsetY = player.y%1;
    if (player.y < 0) {
        playerOffsetY = 1 + playerOffsetY;
    } 

    let chunkY = floor(-chunkLoadHeight/2);
    for (let i = 0; i <= chunkLoadHeight; i++) {
        let chunkX = floor(-chunkLoadWidth/2);
        for (let j = 0; j <= chunkLoadWidth; j++) {
            //Calculate what chunk
            chunkCoordinateX = floor(player.x) + chunkX;
            chunkCoordinateY = floor(player.y) + chunkY;

            //Calculate chunk coordinates on canvas
            chunkOnCanvasCoordinateX = (chunkX - playerOffsetX)*chunkPixelWidth +   WIDTH/2;
            chunkOnCanvasCoordinateY = (chunkY - playerOffsetY)*chunkPixelHeight + HEIGHT/2;

            //Check if chunk exist, if it doesnt, it creates a new one
            if (typeof map[[chunkCoordinateX, chunkCoordinateY]] === "undefined") {
                map[[chunkCoordinateX, chunkCoordinateY]] = new chunk(chunkCoordinateX, chunkCoordinateY);
            }

            //Execute draw function of the chunk that is being loaded/drawn
            map[[chunkCoordinateX, chunkCoordinateY]].draw(
                chunkOnCanvasCoordinateX,
                chunkOnCanvasCoordinateY
            );

            if (map[[chunkCoordinateX, chunkCoordinateY]].entitiesList.length > 0 && abs(chunkCoordinateX-floor(player.x)) <= entityLoadDistance
            && abs(chunkCoordinateY-floor(player.y)) <= entityLoadDistance) {
                for (i = 0; i < map[[chunkCoordinateX, chunkCoordinateY]].entitiesList.length; i++) {
                    entitiesList.push(map[[chunkCoordinateX, chunkCoordinateY]].entitiesList[i]);
                }
                map[[chunkCoordinateX, chunkCoordinateY]].entitiesList = [];
                console.log("escaped");
            }

            if (chunkOnCanvasCoordinateX < mouse.x &&
                mouse.x < chunkOnCanvasCoordinateX + chunkPixelWidth &&
                chunkOnCanvasCoordinateY < mouse.y &&
                mouse.y < chunkOnCanvasCoordinateY + chunkPixelHeight) {
                
                mouse.chunk = [chunkCoordinateX, chunkCoordinateY];
            }
            chunkX++;
        }
        chunkY++;
    }
}

entitiesList = [];
particlesListInFront = [];
particlesListBehind = [];
projectilesList = [];

//Deltatime related
let now;
let past = Date.now();
let deltaTime = 0;

window.requestAnimationFrame(refreshScreen);

let timeInDesert = 0;
let timeInCursed = 0;

function gameEvents () {
    player.inFluid = 0;
    player.level = 0;
    player.inFluidCorners = [false, false, false, false];
    player.onFire = false;
    
    //Draws tiles, and adds ned chunks if needed
    drawTiles();

    //Tile on mouse
    tilesDictionary[mouse.lastTile].mouse(mouse.x, mouse.y);

    //Finish drawing mouseline
    ctx.stroke();

    //Calculate deltatime
    now = Date.now();
    deltaTime = (now-past)/1000;
    past = now;
    if (deltaTime > 0.2) {deltaTime = 0.2;}

    //Player functions
    player.move;
    player.draw;

    if (buffs[83] == 1) {
        shoot();
        buffs[83] = 0;
    }

    for (let i = particlesListBehind.length-1; i >= 0; i--) {
        if (particlesListBehind[i].stillAlive) {
            particlesListBehind[i].draw;
        } else {
            particlesListBehind.splice(i, 1);
        }
    }

    for (let i = projectilesList.length-1; i >= 0; i--) {
        if (projectilesList[i].stillAlive) {
            projectilesList[i].draw;
        } else {
            projectilesList[i].deathAnimation;
            projectilesList.splice(i, 1);
        }
    }

    for (let i = entitiesList.length-1; i >= 0; i--) {
        if (entitiesList[i].stillAlive) {
            if (entitiesList[i].loaded) {
                entitiesList[i].draw;
            } else {
                if (typeof(map[[floor(entitiesList[i].x), floor(entitiesList[i].y)]]) == "undefined") {
                    map[[floor(entitiesList[i].x), floor(entitiesList[i].y)]] = new chunk(floor(entitiesList[i].x), floor(entitiesList[i].y));
                    console.log("new");
                }
                map[[floor(entitiesList[i].x), floor(entitiesList[i].y)]].entitiesList.push(entitiesList[i]);
                entitiesList.splice(i, 1);
                console.log("entered");
            }
        } else {
            entitiesList[i].deathAnimation;
            entitiesList.splice(i, 1);
        }
    }

    for (let i = particlesListInFront.length-1; i >= 0; i--) {
        if (particlesListInFront[i].stillAlive) {
            particlesListInFront[i].draw;
        } else {
            particlesListInFront.splice(i, 1);
        }
    }

    ctx.stroke();



    ctx.fillStyle = "rgba(255, 247, 107, " + timeInDesert * 0.1 + ")";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fill();

    ctx.fillStyle = "rgba(25, 30, 12, " + timeInCursed * 0.1 + ")";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fill();

    if (map[[floor(player.x), floor(player.y)]].type == 2) {
        (timeInDesert >= 3) ? timeInDesert = 3 : timeInDesert+=deltaTime;
    } else {
        timeInDesert-=deltaTime;
        if (timeInDesert < 0) {timeInDesert = 0;}
    }

    
    if (map[[floor(player.x), floor(player.y)]].type == 13) {
        (timeInCursed >= 3) ? timeInCursed = 3 : timeInCursed+=deltaTime;
    } else {
        timeInCursed-=deltaTime;
        if (timeInCursed < 0) {timeInCursed = 0;}
    }

    displayEffects();
}

let inventoryBasic = new inventoryModule();

function inventory () {
    ctx.fillStyle = "black";
    for (let i = 0; i < WIDTH/tilePixelWidth; i++) {
        for (let j = 0; j < HEIGHT/tilePixelHeight; j++) {
            ctx.drawImage(tileMap, 200, 0, 100, 100, i*tilePixelWidth, j*tilePixelWidth, tilePixelWidth, tilePixelWidth);
        }   
    }

    inventoryBasic.draw;

    if (mouse.containing != false) {
        tilesDictionary[mouse.containing].mouse(mouse.x, mouse.y);
    }
}

let inventoryActive = false;

function refreshScreen () {
    //Clear screen
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (buffs[69] == 1) {
        inventoryActive = !inventoryActive;
        buffs[69] = 0;
    }

    if (inventoryActive) {
        inventory();
    } else {
        gameEvents();
    }

    //Repeat everything when done
    window.requestAnimationFrame(refreshScreen);

}

//Old gameloop: let gameloop = setInterval(refreshScreen, 20);
