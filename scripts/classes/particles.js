class baseParticle extends baseEntity {
    spawnTime = Date.now()/1000;
    duration;
    size;
    constructor (x, y, size, duration) {
        super(0, 0, x, y, 0, 0, 0);
        this.duration = duration;
        this.size = size;
    }

    get stillAlive () {
        return (Date.now()/1000 - this.spawnTime <= this.duration);
    }

    get draw () {
        this.updateSelf;
        ctx.fillRect(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth-this.size*tilePixelWidth/2, 
        HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight-this.size*tilePixelHeight/2, 
        round(this.size*tilePixelWidth), round(this.size*tilePixelHeight));
    }
}

class smokeParticle extends baseParticle {
    constructor (x, y, size, duration) {
        super(x, y, size, duration);
    }

    get draw () {
        this.updateSelf;

        ctx.save();
        ctx.translate(round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth), 
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight));
        ctx.rotate(PI*4*(Date.now()/1000-this.spawnTime)/this.duration);
        let rgba = (Date.now()/1000 - this.spawnTime)/this.duration;
        ctx.fillStyle = "rgba(" + round(255-rgba*255) + ", " + round(255-rgba*255) + ", " + round(255-rgba*255) + ", " + round(300-rgba*300)/100 + ")"; //hacky transparacy thing
        ctx.fillRect(round(-this.size*tilePixelWidth/2), 
                    round(-this.size*tilePixelHeight/2), 
                    round(this.size*tilePixelWidth), round(this.size*tilePixelHeight));
                    
        ctx.fill();
        ctx.restore();
        this.y-=0.05*deltaTime;
        this.size *= 1+0.5*deltaTime;
    }
}

class coloredParticle extends baseParticle {
    color; xmov; ymov; speed; pType; startY;
    constructor (x, y, size, duration, color, speed, xmov, ymov, pType) {
        super(x, y, size, duration);
        this.color = color;
        this.speed = speed;
        this.xmov = xmov;
        this.ymov = ymov;
        this.pType = pType;
        this.startY = y;
    }

    get draw () {
        this.updateSelf;

        ctx.save();
        ctx.translate(round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth), 
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight));
        ctx.rotate(PI*4*(Date.now()/1000-this.spawnTime)/this.duration);
        ctx.fillStyle = "rgba(" + this.color[0] + ", " + this.color[1] + ", " + this.color[2] + ", " + round(300-(Date.now()/1000 - this.spawnTime)/this.duration*300)/100 + ")"; //hacky transparacy thing

        ctx.fillRect(round(-this.size*tilePixelWidth/2), 
                    round(-this.size*tilePixelHeight/2), 
                    round(this.size*tilePixelWidth), round(this.size*tilePixelHeight));
        ctx.fill();
        ctx.restore();
        switch (this.pType) {
            case 0:
                this.y+=this.speed*deltaTime*this.ymov;
                this.x+=this.speed*deltaTime*this.xmov;
                break;
            case 1:
                this.y=this.speed*this.ymov*((Date.now()/1000-this.spawnTime-this.duration/3)**2-(this.duration/3)**2)+this.startY;
                this.x+=this.speed*deltaTime*this.xmov/5;
                break;
        }
        this.size *= 1+0.5*deltaTime;
    }
}

class imageParticle extends baseParticle {
    color; xmov; ymov; speed; pType; startY; costumeX; costumeY; costumeWidth; costumeHeight; width; height;
    constructor (x, y, costumeX, costumeY, costumeWidth, costumeHeight, width, height, 
                duration, speed, xmov, ymov, pType) {
        super(x, y, 0, duration);
        this.costumeX = costumeX;
        this.costumeY = costumeY;
        this.costumeWidth = costumeWidth;
        this.costumeHeight = costumeHeight;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.xmov = xmov;
        this.ymov = ymov;
        this.pType = pType;
        this.startY = y;
    }

    get draw () {
        this.updateSelf;

        ctx.save();
        ctx.translate(round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth), 
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight));
        ctx.rotate(PI*4*(Date.now()/1000-this.spawnTime)/this.duration);
        ctx.globalAlpha = 1-(Date.now()/1000-this.spawnTime)/this.duration;
        ctx.drawImage(entitiesMap, this.costumeX, this.costumeY, this.costumeWidth, this.costumeHeight,
            round(-this.width*tilePixelWidth/2), 
            round(-this.height*tilePixelHeight/2), 
            round(this.width*tilePixelWidth), round(this.height*tilePixelHeight));
        ctx.restore();
        switch (this.pType) {
            case 0:
                this.y+=this.speed*deltaTime*this.ymov;
                this.x+=this.speed*deltaTime*this.xmov;
                break;
            case 1:
                this.y=this.speed*this.ymov*((Date.now()/1000-this.spawnTime-this.duration/3)**2-(this.duration/3)**2)+this.startY;
                this.x+=this.speed*deltaTime*this.xmov/5;
                break;
        }
        this.size *= 1-0.5*deltaTime;
    }
}

class tileImageParticle extends imageParticle {
    constructor (x, y, costumeX, costumeY, costumeWidth, costumeHeight, width, height, 
    duration, speed, xmov, ymov, pType) {
        super(x, y, costumeX, costumeY, costumeWidth, costumeHeight, width, height, 
            duration, speed, xmov, ymov, pType)
    }

    get draw () {
        this.updateSelf;

        ctx.save();
        ctx.translate(round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth), 
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight));
        ctx.rotate(PI*4*(Date.now()/1000-this.spawnTime)/this.duration);
        ctx.globalAlpha = 1-(Date.now()/1000-this.spawnTime)/this.duration;
        ctx.drawImage(tileMap, this.costumeX, this.costumeY, this.costumeWidth, this.costumeHeight,
            round(-this.width*tilePixelWidth/2), 
            round(-this.height*tilePixelHeight/2), 
            round(this.width*tilePixelWidth), round(this.height*tilePixelHeight));
        ctx.restore();
        switch (this.pType) {
            case 0:
                this.y+=this.speed*deltaTime*this.ymov;
                this.x+=this.speed*deltaTime*this.xmov;
                break;
            case 1:
                this.y=this.speed*this.ymov*((Date.now()/1000-this.spawnTime-this.duration/3)**2-(this.duration/3)**2)+this.startY;
                this.x+=this.speed*deltaTime*this.xmov/5;
                break;
        }
        this.size *= 1-0.5*deltaTime;
    }
}

class textParticle extends baseParticle {
    color; xmov; ymov; speed; pType; startY; inputText;
    constructor (x, y, fontSize, duration, color, speed, xmov, ymov, pType, inputText) {
        super(x, y, 0, duration);
        this.fontSize = fontSize;
        this.color = color;
        this.speed = speed;
        this.xmov = xmov;
        this.ymov = ymov;
        this.pType = pType;
        this.startY = y;
        this.inputText = inputText;
    }

    get draw () {
        this.updateSelf;
        ctx.fillStyle = "rgba(" + this.color[0] + ", " + this.color[1] + ", " + this.color[2] + ", " + round(300-(Date.now()/1000 - this.spawnTime)/this.duration*300)/100 + ")"; //hacky transparacy thing
        ctx.font = this.fontSize*tilePixelWidth + "px Arial";

        ctx.fillText(this.inputText, 
        round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth), 
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight));

        switch (this.pType) {
            case 0:
                this.y+=this.speed*deltaTime*this.ymov;
                this.x+=this.speed*deltaTime*this.xmov;
                break;
            case 1:
                this.y=this.speed*this.ymov*((Date.now()/1000-this.spawnTime-this.duration/3)**2-(this.duration/3)**2)+this.startY;
                this.x+=this.speed*deltaTime*this.xmov/5;
                break;
        }
        this.size *= 1+0.5*deltaTime;
    }
}

class cloud extends baseParticle {
    rgba = [255, 255, 255, 0];
    speed = random()*0.03+0.01;

    shapeArray = [];

    constructor (x, y, size, duration) {
        super(x, y, size, duration);
    
        for (let i = 0; i <= 2; i++) {
            this.shapeArray.push([]);
            for (let j = 0; j <= i%2+1; j++) {
                this.shapeArray[i].push(round(random()*3));
            }
        }
    }


    get updateSelf () {
        let tempX = (Date.now()-this.spawnTime*1000);
        this.rgba[3] = sin(PI*tempX/(this.duration*1000))*0.7;
    }

    get draw () {
        this.updateSelf;
        ctx.fillStyle = "rgba(" + this.rgba[0] + ", " + this.rgba[1] + ", "+ this.rgba[2] + ", "+ this.rgba[3] + ")";
        for (let i = 0; i < this.shapeArray.length; i++) {
            for (let j = 0; j < this.shapeArray[i].length; j++) {
                if (this.shapeArray[i][j] != 0) {
                    ctx.fillRect(
                    round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth-this.size*(this.shapeArray[i].length+j*2)*tilePixelWidth/2), 
                    round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight-this.size*(this.shapeArray.length+i*2)*tilePixelHeight/2), 
                    round(this.size*tilePixelWidth), round(this.size*tilePixelHeight));       
                }
            }
        }
        this.y-=this.speed*deltaTime;
    }
}