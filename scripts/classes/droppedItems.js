class droppedItem {
    itemID; x; y; spawnTime = Date.now()/1000; duration; amount; extraInfo;

    constructor (itemID, x, y, angle, speed, duration, amount, extraInfo) {
        this.itemID = itemID;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.duration = duration;
        this.amount = amount;
        this.extraInfo = extraInfo;
    }

    get stillAlive () {
        return (Date.now()/1000 - this.spawnTime <= this.duration);
    }

    get move () {
        this.x += cos(this.angle)*this.speed*deltaTime;
        this.y += sin(this.angle)*this.speed*deltaTime;

        this.speed *= 1-deltaTime;
    }

    get sinOffset () {
        return sin((Date.now()/1000-this.spawnTime)*2);
    }

    checkIfEntityNear (entity) {
        return (entity.pickUpRadius >= hyp(entity.x-this.x, entity.y-this.y));
    }

    get pickUp () {
        if (this.checkIfEntityNear(player) && round(this.speed*10) == 0 && inventoryBasic.itemPickUp(this.itemID, this.amount, this.extraInfo)) {
            let audio = new Audio('soundEffects/pickup.wav');
            audio.volume = 0.1;
            audio.play();
            this.duration = 0;
        } else {
            for (let i = 0; i < entitiesList.length; i++) {
                if (this.checkIfEntityNear(entitiesList[i]) 
                && entitiesList[i].isAnimal 
                && entitiesList[i].isFed == false 
                && animalsList[entitiesList[i].type].attractedTo.includes(this.itemID)) {
                    this.duration = 0;
                    entitiesList[i].isFed = true;
                    let audio = new Audio('soundEffects/pickup.wav');
                    audio.volume = 0.1;
                    audio.play();
                    this.duration = 0;
                    break;
                }
            }
        }
    }

    drawRarity (x, y, radius, rarity) {

        ctx.globalAlpha = abs(this.sinOffset);
        ctx.beginPath();
        ctx.fillStyle = rarities[rarity].color;
        ctx.arc(x, y, radius, 0, 2*PI);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    get draw () {
        this.move;
        this.pickUp;
        let tile = tilesDictionary[this.itemID];
        let rarity = tile.rarity;
        let sizeConstant = 0.3 + rarity*0.1;

        let realX = round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth);
        let realY = round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight + this.sinOffset*tilePixelHeight/10);

        this.drawRarity(realX, realY, sizeConstant*tilePixelWidth*0.8, rarity);

        ctx.drawImage(tileMap, tile.x, tile.y, tile.width, tile.height, 
        realX - tilePixelWidth*sizeConstant/2, realY - tilePixelHeight*sizeConstant/2,
        tilePixelWidth*sizeConstant, tilePixelHeight*sizeConstant);
    }
}