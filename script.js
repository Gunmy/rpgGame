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

entitiesList = [];
particlesListInFront = [];
particlesListBehind = [];
projectilesList = [];
droppedItemsList = [];

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

        if (round(random()) == 1) {
            this.entitiesList.push(new animal(this.x+0.5, this.y+0.5, 0));
        }

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
                        entitiesList.push(new camper(0, 900, this.x+0.5, this.y+0.5, 100, 100, 0.05, 0.1, 1, ["Uncool", "Lazy", "Silly"][floor(random()*3)] + " Camper", [0, 0, 0]));
                        //costumeX, costumeY, x, y, width, height, sizeRadius, speed, trackingRange, name
                    } if (chunkTypeDictionary[this.type].structures[n] == 10) {
                        entitiesList.push(new skeleton(this.x+0.5, this.y+0.5));
                        //costumeX, costumeY, x, y, width, height, sizeRadius, speed, trackingRange, name
                    }
                    
                    break;
                } else {
                    chance += structureDictionary[chunkTypeDictionary[this.type].structures[n]].spawnChance;
                }
            }
        }

    }

    storeEntity (entity) {
        this.entitiesList.push(entity);
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

                //Sends the information of 3 tiles next to it (L-shape) to the tile,w
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
                        if (!arrayEquals(mouse.tile, [i, j])) {
                            mouse.progressDestroy = 0;
                        }
                        mouse.tile = [i, j];

                        if (this.tiles[[i, j]] != 2) {
                            ctx.drawImage(
                                tileMap, 500 + 50-mouse.progressDestroy/tilesDictionary[this.tiles[[i, j]]].breakingPower*50, 
                                100 + 50-mouse.progressDestroy/tilesDictionary[this.tiles[[i, j]]].breakingPower*50, 
                                100 * mouse.progressDestroy/tilesDictionary[this.tiles[[i, j]]].breakingPower, 100 * mouse.progressDestroy/tilesDictionary[this.tiles[[i, j]]].breakingPower,
                                round(x + i * tilePixelWidth), round(y + j * tilePixelHeight), 
                                tilePixelWidth, tilePixelHeight
                            );
                        }
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
    

    destroyTile (tile) {
        mouse.progressDestroy += player.realStats.stats[4];
        if (mouse.progressDestroy >= tilesDictionary[this.tiles[tile]].breakingPower) {
            mouse.progressDestroy = 0;
            if (this.distancePlayerToMouse(tile) && this.tiles[tile] != 2) {
                let audio = new Audio('soundEffects/destroytile.mp3');
                audio.volume = 0.1;
                audio.play();
                let split = 4;
                for (let i = 0; i < split; i++) {
                    for (let j = 0; j < split; j++) {
    
                        particlesListInFront.push(
                            new tileImageParticle(this.x+(tile[0]+1/split*i)/chunkWidth, 
                                             this.y+(tile[1]+1/split*j)/chunkHeight,
                                             tilesDictionary[this.tiles[tile]].x+tilesDictionary[this.tiles[tile]].width/split*i, tilesDictionary[this.tiles[tile]].y+tilesDictionary[this.tiles[tile]].height/split*j, 
                                             tilesDictionary[this.tiles[tile]].width/split, tilesDictionary[this.tiles[tile]].height/split,
                                             1/split, 1/split,
                                             2, 0.2+random()*0.4, negPos(), 1, 1)
                        );
                    }
                }
    
                droppedItemsList.push(new droppedItem(tilesDictionary[this.tiles[tile]].drop, this.x+(tile[0]+0.3+random()*0.4)/chunkWidth, this.y+(tile[1]+0.3+random()*0.4)/chunkHeight, 0, 0, 10, 1, tileExtraInfo));
                this.tiles[tile] = 2;
            }
        }
    }

    placeTile (tile) {
        if (this.distancePlayerToMouse(tile) && this.tiles[tile] == 2) {
            let audio = new Audio('soundEffects/place.mp3');
            audio.volume = 0.5;
            audio.play();
            this.tiles[tile] = equipmentBasic.content[player.inventoryHolding+9].containing;
            equipmentBasic.content[player.inventoryHolding+9].amount -= 1;
            if (equipmentBasic.content[player.inventoryHolding+9].amount <= 0) {
                equipmentBasic.content[player.inventoryHolding+9].amount = 0;
                equipmentBasic.content[player.inventoryHolding+9].containing = false;
            }
        }
    }

}

let moveBuffs = {
    "up": 87,
    "down": 83,
    "left": 65,
    "right": 68,
    "sprint": 17
}

let map = {};
map[[0, 0]] = new chunk(0, 0);
map[[-1, 0]] = new chunk(-1, 0);
map[[1, 0]] = new chunk(1, 0);
map[[0, 1]] = new chunk(0, 1);
map[[0, -1]] = new chunk(0, -1);

class playerClass {
    x; y;
    width = 100;
    height = 100;
    sizeRadius = 0.2;
    hitBox = 0.02;
    pickUpRadius = 0.05;
    health = 100;

    inventoryHolding = 0;

    velx = 0;
    vely = 0;
    speed = 0.2;
    smooth = 0.5;
    inFluid = 0;
    inFluidCorners = [false, false, false, false];
    onFire = false;

    state = 0;

    sizeConstant = 0.1;

    lastMoved = Date.now();
    level = 0;

    manaLeft = 0;
    speedBuffActive = 0;
    manaLastActive = Date.now();

    corners;

    feety; feetx; realx; realy;

    baseStats = new extraInfo([0, 100, 3, 100, 5, 100, 8, 100]);
    
    realStats = new extraInfo([0, 100]);

    maxMana;
    maxHealth;

    get statUpdate () {
        for (let i = 0; i < Object.keys(statsList).length; i++) {
            this.realStats.stats[i] = 0;
        }

        let extraInfoList = [];
        extraInfoList.push(this.baseStats);

        if (equipmentBasic.content[this.inventoryHolding + 9].extraInfo != false) {
            extraInfoList.push(equipmentBasic.content[this.inventoryHolding + 9].extraInfo);
        }

        for (let i = 0; i < 9; i++) {
            if (equipmentBasic.content[i].extraInfo != false) {
                extraInfoList.push(equipmentBasic.content[i].extraInfo);
            }
        }

        let tempStats;
        for (let j = 0; j < extraInfoList.length; j++) {
            tempStats = extraInfoList[j].returnStats;
            for (let i = 0; i < tempStats.length; i+=2)  {
                this.realStats.stats[tempStats[i]] += tempStats[i+1];
            }
        }

        this.maxMana = this.realStats.stats[3];
        this.maxHealth = this.realStats.stats[0];
    }

    get shatter () {
        let max = 3;
        for (let i = 0; i < max; i++) {
            for (let j = 0; j < max; j++) {
                particlesListBehind.push(new imageParticle(
                    this.x+(1/max*i-0.5)/chunkWidth, 
                    this.y+(1/max*j-0.5)/chunkHeight, 
                    500+this.width*(1/max*i), 
                    0+this.height*(1/max*j), 
                    this.width/max, this.height/max, 1/max, 1/max,
                    5, 0.1+0.3*random(), negPos(), 1, 1));
            }
        }
    }

    get healthUpdate () {
        if (this.health <= 0) {
            this.shatter;
            this.health = this.maxHealth;
            this.x = 0;
            this.y = 0;
        } else if (this.health < this.maxHealth) {
            this.health += this.maxHealth * deltaTime/100;
        }

        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    get speedBuffUpdate () {
        if (buffs[moveBuffs["sprint"]] == 1 && this.manaLeft > 0) {
            this.speedBuffActive = 1;
            this.manaLastActive = Date.now();
            this.manaLeft -= deltaTime * 100;
            if (this.manaLeft < 0) {
                this.manaLeft = 0;
            }
        } else {
            this.speedBuffActive = 0;
        }
        
        if (Date.now() - this.manaLastActive > 1000) {
            this.manaLeft += 0.1 + deltaTime * this.manaLeft * 0.9;
            if (this.manaLeft > this.maxMana) {
                this.manaLeft = this.maxMana;
            }
        }
    }

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
        this.speedBuffUpdate;
        this.healthUpdate;

        if (this.inFluidCorners.every(element => element === true)) {
            this.inFluid = 1;
        }

        this.velx = this.velx * (this.smooth) + (buffs[moveBuffs["right"]] - buffs[moveBuffs["left"]]) * this.speed * deltaTime * (1 + this.speedBuffActive/3*2) * this.realStats.stats[5]/100;
        this.vely = this.vely * (this.smooth) + (buffs[moveBuffs["down"]] - buffs[moveBuffs["up"]]) * this.speed * deltaTime * (1 + this.speedBuffActive/3*2) * this.realStats.stats[5]/100;

        let max = 30;

        for (let i = 0; i <= max; i++) {
            let xTile; let yTile;

            let xOffsets = [round(this.halfWidth/chunkWidth/3*100)/100, 0, round(-this.halfWidth/chunkWidth/3*100)/100];
            let ok = true;
            for (let j = 0; j < 3; j++) {
                let futureX = this.x+this.velx + xOffsets[j];
                let futureY = this.y+this.vely+this.halfHeight/chunkHeight*0.8;
    
                if (futureX < 0) {
                    xTile = floor((1+futureX%1)*chunkWidth);
                } else {
                    xTile = floor((futureX%1)*chunkWidth);
                }
    
                if (futureY < 0) {
                    yTile = floor((1+futureY%1)*chunkHeight);
                } else {
                    yTile = floor((futureY%1)*chunkHeight);
                }
    
                let futureChunk = [floor(futureX), floor(futureY)];
                let futureTile = [xTile, yTile];
                
                if (!tilesDictionary[map[futureChunk].tiles[futureTile]] || tilesDictionary[map[futureChunk].tiles[futureTile]].level > 1) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                this.y += this.vely;
                this.x += this.velx;
                break;
            } else if (i == max) {
                this.velx = 0;
                this.vely = 0;
            } else {
                this.velx *= 0.7;
                this.velx = round(this.velx*1000)/1000;
                this.vely *= 0.7;
                this.vely = round(this.vely*1000)/1000;
            }
        }
    }

    get sinFunction () {
        return sin(Date.now()/(50/(this.speedBuffActive*0.5+1)));
    }

    get cosFunction () {
        return cos(Date.now()/(50/(this.speedBuffActive*0.5+1))+1/3*PI);
    }

    get moving () {
        return ((abs(this.velx) + abs(this.vely))/deltaTime*10000 > 1);
    }

    get halfWidth () {
        return 1/2*(1-0.05*this.cosFunction);
    }

    get halfHeight () {
        return 1/2;
    }


    get draw () {
        this.realPos;
        ctx.save();
        ctx.translate(WIDTH/2, HEIGHT/2);
        if ((buffs[moveBuffs["right"]] == 1 || buffs[moveBuffs["left"]] == 1 || buffs[moveBuffs["up"]] == 1 || buffs[moveBuffs["down"]] == 1) && this.moving) {
            ctx.rotate(PI*this.sinFunction/20);
            if (buffs[moveBuffs["left"]] == 1) {
                ctx.scale(-1, 1);
            }

        }

        let tempX = -this.halfWidth*tilePixelWidth;

        let tempY1 = -this.halfHeight*tilePixelWidth;
        let tempY = tempY1*(1-0.1*this.sinFunction);
        let tempWidth = tilePixelWidth*(1-0.05*this.cosFunction);

        let tempHeight = (tempY1+tempY)*-1;

        //let tempHeight = (tilePixelHeight + round((this.level-1)*tilePixelHeight*this.sizeConstant))*(1-0.1*this.sinFunction)*1.2;
        ctx.drawImage(
            entitiesMap,
            700, 0, this.width, this.height,
            tempX, tempY, tempWidth, tempHeight
        );

        if (equipmentBasic.content[1].containing != false) {
            ctx.fillStyle = tilesDictionary[equipmentBasic.content[1].containing].color;
            ctx.fillRect(tempX+tempWidth*0.2, tempY, tempWidth*0.6, tempHeight*0.25);
        }

        if (equipmentBasic.content[4].containing != false) {
            ctx.fillStyle = tilesDictionary[equipmentBasic.content[4].containing].color[0];
            ctx.fillRect(tempX+tempWidth*0.2, tempY+tempHeight*7/20, tempWidth*0.6, tempHeight*6/20);
            ctx.fillStyle = tilesDictionary[equipmentBasic.content[4].containing].color[1];
            ctx.fillRect(tempX+tempWidth*9/20, tempY+tempHeight*9/20, tempWidth*1/10, tempHeight*1/10);
        }

        if (equipmentBasic.content[7].containing != false) {
            ctx.fillStyle = tilesDictionary[equipmentBasic.content[7].containing].color[1];
            ctx.fillRect(tempX+tempWidth*0.2, tempY+tempHeight*13/20, tempWidth*0.6, tempHeight*1/20);
            ctx.fillStyle = tilesDictionary[equipmentBasic.content[7].containing].color[0];
            ctx.fillRect(tempX+tempWidth*0.2, tempY+tempHeight*7/10, tempWidth*0.6, tempHeight*3/20);
            ctx.fillStyle = tilesDictionary[equipmentBasic.content[7].containing].color[2];
            ctx.fillRect(tempX+tempWidth*0.2, tempY+tempHeight*17/20, tempWidth*5/20, tempHeight*3/20);
            ctx.fillStyle = tilesDictionary[equipmentBasic.content[7].containing].color[2];
            ctx.fillRect(tempX+tempWidth*11/20, tempY+tempHeight*17/20, tempWidth*5/20, tempHeight*3/20);
        }

        ctx.drawImage(
            entitiesMap,
            800, 0, this.width, this.height,
            tempX, tempY, tempWidth, tempHeight
        );

        ctx.restore();
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

    ctx.lineWidth = 18;
    ctx.beginPath();
    grd = ctx.createLinearGradient(WIDTH-130, HEIGHT-130, WIDTH-30, HEIGHT-30);
    grd.addColorStop(0, "#FFFFFF");
    grd.addColorStop(0.4, "#FF0000");
    grd.addColorStop(1, "#990200");
    ctx.strokeStyle = grd;
    ctx.arc(WIDTH-80, HEIGHT-80, 39, -3/4*PI, -3/4*PI-2*PI*player.health/player.maxHealth, true);
    ctx.stroke();

    ctx.lineWidth = 25;
    ctx.beginPath();
    grd = ctx.createLinearGradient(WIDTH-130, HEIGHT-130, WIDTH-30, HEIGHT-30);
    grd.addColorStop(0, "#FFFFFF");
    grd.addColorStop(0.4, "#03DB00");
    grd.addColorStop(1, "#029100");
    ctx.strokeStyle = grd;
    ctx.arc(WIDTH-80, HEIGHT-80, 15, -3/4*PI, -3/4*PI-2*PI*player.manaLeft/player.maxMana, true);
    ctx.stroke();

    let sideLength = WIDTH/13;
    for (let i = 0; i < 3; i++) {
        if (player.inventoryHolding == i) {
            ctx.drawImage(inventoryMap, 100, 0, 100, 100, WIDTH/2+(-sideLength*1.5+sideLength*i), HEIGHT-sideLength*1.2, sideLength, sideLength);
            equipmentBasic.content[i+9].draw(WIDTH/2+(-sideLength*1.5+sideLength*i)-10, HEIGHT-sideLength*1.2-10, sideLength, sideLength);
        } else {
            equipmentBasic.content[i+9].draw(WIDTH/2+(-sideLength*1.5+sideLength*i), HEIGHT-sideLength*1.2, sideLength, sideLength);

        }
    }

}

let player = new playerClass(0, 0);


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
    progressDestroy: 0,
    lastTile: 1,
    range: 4,
    containing: false,
    amount: 0,
    extraInfo: false
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
    } else if (equipmentBasic.content[player.inventoryHolding+9].containing != false) {
        tilesDictionary[equipmentBasic.content[player.inventoryHolding+9].containing].mouseClick();
    }
}

function mouseZoom (e) {
    e.preventDefault;

    tilePixelHeight += e.deltaY/100;
    tilePixelWidth  += e.deltaY/100;

    if (tilePixelHeight < 1) {tilePixelHeight = 1;}
    if (tilePixelWidth < 1) {tilePixelWidth = 1;}

    /*chunkLoadHeight = round(100/tilePixelHeight);
    chunkLoadWidth  = round(100/tilePixelWidth);

    if (chunkLoadHeight > 10) {chunkLoadHeight = 10;} else if (chunkLoadHeight < 4) {chunkLoadHeight = 4;}
    if (chunkLoadWidth > 10) {chunkLoadWidth = 10;} else if (chunkLoadWidth < 4) {chunkLoadWidth = 4;}*/

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

    switch(pressed) {
        case 49:
            player.inventoryHolding = 0;
            break;
        case 50:
            player.inventoryHolding = 1;
            break;
        case 51:
            player.inventoryHolding = 2;
            break;
        case 81:
            if (equipmentBasic.content[player.inventoryHolding+9].containing != false) {
                droppedItemsList.push(new droppedItem(equipmentBasic.content[player.inventoryHolding+9].containing, player.x, player.y, calcAngleToMouse(WIDTH/2, HEIGHT/2), 0.2, 10, 1, equipmentBasic.content[player.inventoryHolding+9].extraInfo));
                equipmentBasic.content[player.inventoryHolding+9].minusOne;
            }
        case 80: 
            if(inventoryActive && mouse.containing != false) {
                placeItem();
            }
        default:
            //stuff
    }
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

            if (map[[chunkCoordinateX, chunkCoordinateY]].entitiesList.length > 0 && abs(chunkCoordinateX-floor(player.x)) <= entityLoadDistance
            && abs(chunkCoordinateY-floor(player.y)) <= entityLoadDistance) {
                entitiesList = entitiesList.concat(map[[chunkCoordinateX, chunkCoordinateY]].entitiesList);
                map[[chunkCoordinateX, chunkCoordinateY]].entitiesList = [];
            }

            //Execute draw function of the chunk that is being loaded/drawn
            map[[chunkCoordinateX, chunkCoordinateY]].draw(
                chunkOnCanvasCoordinateX,
                chunkOnCanvasCoordinateY
            );

            if (chunkOnCanvasCoordinateX < mouse.x &&
                mouse.x < chunkOnCanvasCoordinateX + chunkPixelWidth &&
                chunkOnCanvasCoordinateY < mouse.y &&
                mouse.y < chunkOnCanvasCoordinateY + chunkPixelHeight) {
                if (!arrayEquals(mouse.chunk, [chunkCoordinateX, chunkCoordinateY])) {
                    mouse.progressDestroy = 0;
                }
                mouse.chunk = [chunkCoordinateX, chunkCoordinateY];
            }
            chunkX++;
        }
        chunkY++;
    }
}

let inventoryBasic = new inventoryModule();
let equipmentBasic = new equipmentModule();
let craftingBasic = new craftingModule();
let statsBasic = new statsModule();

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

    player.move;
    
    ctx.beginPath();
    //Draws tiles, and adds ned chunks if needed
    drawTiles();

    //Finish drawing mouseline
    ctx.stroke();
    ctx.beginPath();

    //Tile on mouse
    if (equipmentBasic.content[player.inventoryHolding + 9].containing != false) {
        tilesDictionary[equipmentBasic.content[player.inventoryHolding + 9].containing].mouse(mouse.x, mouse.y, 40);
    }
    //Calculate deltatime
    now = Date.now();
    deltaTime = (now-past)/1000;
    past = now;
    if (deltaTime > 0.2) {deltaTime = 0.2;}

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

    //Player functions
    player.draw;

    for (let i = droppedItemsList.length-1; i >= 0; i--) {
        if (droppedItemsList[i].stillAlive) {
            droppedItemsList[i].draw;
        } else {
            droppedItemsList.splice(i, 1);
        }
    }

    ctx.beginPath();

    for (let i = entitiesList.length-1; i >= 0; i--) {
        if (entitiesList[i].stillAlive) {
            if (entitiesList[i].loaded) {
                entitiesList[i].draw;
            } else {
                if (typeof(map[[floor(entitiesList[i].x), floor(entitiesList[i].y)]]) == "undefined") {
                    map[[floor(entitiesList[i].x), floor(entitiesList[i].y)]] = new chunk(floor(entitiesList[i].x), floor(entitiesList[i].y));
                    console.log("new");
                }
                map[[floor(entitiesList[i].x), floor(entitiesList[i].y)]].storeEntity(entitiesList[i]);
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

    //Output x and y coordinates of player
    pOutput.innerHTML = "x=" + String(floor(player.x)) + " y=" + String(floor(player.y))
    +"<br>deltaTime: " + deltaTime
    +"<br>FPS: " + round(1/deltaTime);

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

function inventory () {
    /*
    ctx.fillStyle = "black";
    for (let i = 0; i < WIDTH/tilePixelWidth; i++) {
        for (let j = 0; j < HEIGHT/tilePixelHeight; j++) {
            ctx.drawImage(tileMap, 200, 0, 100, 100, i*tilePixelWidth, j*tilePixelWidth, tilePixelWidth, tilePixelWidth);
        }   
    }*/

    drawTiles();

    inventoryBasic.draw;
    equipmentBasic.draw;
    craftingBasic.draw;
    statsBasic.draw;

    ctx.beginPath();

    inventoryHover();

    ctx.beginPath();

    if (mouse.containing != false) {
        tilesDictionary[mouse.containing].mouse(mouse.x, mouse.y, 40);
    } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.arc(mouse.x, mouse.y, 10, 0, 2*PI);
        ctx.fill();
    }
}

let inventoryActive = false;

function refreshScreen () {
    //Clear screen
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    player.statUpdate;

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
