class baseEntity {
    costumeX; costumeY; x; y; width; height; sizeRadius; standardColor;
    health = 100;

    constructor (costumeX, costumeY, x, y, width, height, sizeRadius) {
        this.costumeX = costumeX;
        this.costumeY = costumeY;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sizeRadius = sizeRadius;
    }

    get loaded () {
        //return (abs(this.x-player.x) <= round(chunkLoadWidth/2) && abs(this.y-player.y) <= round(chunkLoadHeight/2));
        return (abs(floor(this.x)-floor(player.x)) <= entityLoadDistance 
        && abs(floor(this.y)-floor(player.y)) <= entityLoadDistance);
    }

    get stillAlive () {
        return (this.health > 0);
    }

    get shatter () {
        /*x, y, costumeX, costumeY, costumeWidth, costumeHeight, width, height, 
                duration, speed, xmov, ymov, pType*/
                let max = 4;
                for (let i = 0; i < max; i++) {
                    for (let j = 0; j < max; j++) {
                        particlesListBehind.push(new imageParticle(this.x+(1/max*i-0.5)/chunkWidth, this.y+(1/max*j-0.5)/chunkHeight, this.costumeX+this.width/max*i, this.costumeY+this.height/max*j, this.width/max, this.height/max, 1/max, 1/max,
                            2+2*random(), 0.1+0.3*random(), negPos(), 1, 1));
                    }
                }
                /*
                for (let i = 0; i <= 40; i++) {
                    particlesListBehind.push(new coloredParticle(this.x, this.y, 0.1+random()*0.2, random()*4, 
                            this.standardColor, 0.1+random()*0.3, 
                            negPos(), 1, 1));
                    particlesListBehind.push(new coloredParticle(this.x, this.y, 0.1+random()*0.2, random()*4, 
                            [200+random()*55, random()*55, random()*55], 0.1+random()*0.3, 
                            negPos(), 1, 1));
        
                    particlesListBehind.push(new coloredParticle(this.x, this.y, 0.1+random()*0.2, 0.3, 
                            [200+random()*55, random()*55, random()*55], 0.1+random()*0.3, 
                            0, 0, 0));
                }*/
    }

    get deathAnimation () {
        this.shatter;
    }

    get updateSelf () {
        //Nothing
    }

    get draw () {
        this.updateSelf;
        ctx.drawImage(
            entitiesMap,
            this.costumeX, this.costumeY, 
            this.width, this.height,
            WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth-tilePixelWidth/2, 
            HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight-tilePixelHeight/2, 
            tilePixelWidth, tilePixelHeight
        );
    }
}

class trackerEntity extends baseEntity {
    speed; trackingRange;
    constructor (costumeX, costumeY, x, y, width, height, sizeRadius, speed, trackingRange, standardColor) {
        super(costumeX, costumeY, x, y, width, height, sizeRadius);
        this.standardColor = standardColor;
        this.speed = speed;
        this.trackingRange = trackingRange;
    }

    get calcDistanceToPlayer () {
        return round(hyp(this.x-player.x, this.y-player.y));
    }

    get calcAngleToPlayer () {
        let yDif = (player.y-this.y);
        let xDif = (player.x-this.x);
        let angle = Math.atan2(yDif, xDif);

        return angle;
    }

    //This will change from tracking enemy to tracking enemy
    get inTrackingRange () {
        return (this.calcDistanceToPlayer  < this.trackingRange);
    }

    get move () {
        if (this.inTrackingRange) {
            let angle = this.calcAngleToPlayer;

            let jx = 0;
            let jy = 0;
            let jMax = 10;

            let entitiesListPlusPlayer = entitiesList.concat([player]);

            for (let i = 0; i < entitiesListPlusPlayer.length; i++) {
                for (let j = jx; j <= jMax; j++) {
                    if (hyp(
                            entitiesListPlusPlayer[i].x-this.x-cos(angle)*this.speed*deltaTime*round(1-jx/jMax), 
                            entitiesListPlusPlayer[i].y-this.y
                        ) < entitiesListPlusPlayer[i].sizeRadius 
                        && entitiesListPlusPlayer[i].x != this.x
                        && entitiesListPlusPlayer[i].y != this.y) {
                        jx++;
                    } else {break;}
                }

                for (let j  = jy; j < jMax; j++) {
                    if (hyp(entitiesListPlusPlayer[i].x-this.x,
                            entitiesListPlusPlayer[i].y-this.y-sin(angle)*this.speed*deltaTime*round(1-jy/jMax)
                        ) < entitiesListPlusPlayer[i].sizeRadius
                        && entitiesListPlusPlayer[i].x != this.x
                        && entitiesListPlusPlayer[i].y != this.y) {
                        jy++;
                    } else {break;}
                }
            }

            this.y += sin(angle)*this.speed*deltaTime*round(1-jy/jMax);
            this.x += cos(angle)*this.speed*deltaTime*round(1-jx/jMax);
        }
    }

    get updateSelf () {
        this.move;
    }
}

class camper extends trackerEntity {
    name;
    constructor (costumeX, costumeY, x, y, width, height, sizeRadius, speed, trackingRange, name, standardColor) {
        super(costumeX, costumeY, x, y, width, height, sizeRadius, speed, trackingRange, standardColor);
        this.name = name;
    }

    get updateSelf () {
        this.move;
        ctx.font = round(tilePixelWidth/2) + "px Verdana";
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.textAlign = "center";
        ctx.fillText(this.name, round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth),
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight-tilePixelHeight*2/3));
    }
}

class skeleton extends trackerEntity {
    tempx;
    constructor (x, y) {
        super(200, 1600, x, y, 100, 100, 0.1, 0.1, 1, [255, 255, 255]);
    }

    get updateSelf () {
        this.move;

        this.tempX = Date.now()%3000;

        if (this.inTrackingRange) {
            if (floor(random()*100) == 1) {
                projectilesList.push(new baseProjectile(1, this.x, this.y, this.calcAngleToPlayer, 0.3, 5, false, 10));
                projectilesList.push(new baseProjectile(1, this.x, this.y, this.calcAngleToPlayer-1/6*PI, 0.3, 5, false, 10));
                projectilesList.push(new baseProjectile(1, this.x, this.y, this.calcAngleToPlayer+1/6*PI, 0.3, 5, false, 10));                
                projectilesList.push(new baseProjectile(1, this.x, this.y, this.calcAngleToPlayer-1/12*PI, 0.3, 5, false, 10));
                projectilesList.push(new baseProjectile(1, this.x, this.y, this.calcAngleToPlayer+1/12*PI, 0.3, 5, false, 10));

            }

            for (let i = 0; i < 3; i++) {
                particlesListBehind.push(new coloredParticle(this.x-(0.3)/chunkWidth+random()*0.6/chunkWidth, this.y-(random()*0.3)/chunkHeight+sin(2*PI*this.tempX/3000)/chunkHeight/4, 0.2, random(), [200+round(random()*50), 100+round(random()*50), round(random()*50)], 0.05, 0, -1, 0));
            }
        } else {
            for (let i = 0; i < 3; i++) {
                particlesListBehind.push(new coloredParticle(this.x-(0.3)/chunkWidth+random()*0.6/chunkWidth, this.y-(random()*0.3)/chunkHeight+sin(2*PI*this.tempX/3000)/chunkHeight/4, 0.2, random(), [round(random()*50), round(random()*50), round(random()*50)], 0.05, 0, -1, 0));
            }
        }

        ctx.font = round(tilePixelWidth/2) + "px Verdana";
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.textAlign = "center";
        ctx.fillText("Dead", round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth),
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight-tilePixelHeight*2/3));
    }

    get draw () {
        this.updateSelf;
        ctx.drawImage(
            entitiesMap,
            this.costumeX, this.costumeY, 
            this.width, this.height,
            WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth-tilePixelWidth/2, 
            HEIGHT/2 + (this.y-player.y+sin(2*PI*this.tempX/3000)/chunkHeight/4)*tilePixelHeight*chunkHeight-tilePixelHeight/2, 
            tilePixelWidth, tilePixelHeight
        );
    }
}

class tree extends trackerEntity {
    tempx;
    constructor (x, y) {
        super(400, 1600, x, y, 100, 100, 0.1, 0.1, 1, [154, 90, 67]);
    }

    get updateSelf () {
        this.move;

        this.tempX = Date.now()%3000;

        particlesListBehind.push(new coloredParticle(this.x-(0.1)/chunkWidth+random()*0.2/chunkWidth, this.y+sin(2*PI*this.tempX/3000)/chunkHeight/4+0.5/chunkHeight, 0.15, 0.5, [80+random()*100, 155+random()*100, 0], 0.15, 0, 1, 0));


        ctx.font = round(tilePixelWidth/2) + "px Verdana";
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.textAlign = "center";
        ctx.fillText("Tree", round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth),
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight-tilePixelHeight*2/3));
    }

    get draw () {
        this.updateSelf;
        ctx.drawImage(
            entitiesMap,
            this.costumeX, this.costumeY, 
            this.width, this.height,
            WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth-tilePixelWidth/2, 
            HEIGHT/2 + (this.y-player.y+sin(2*PI*this.tempX/3000)/chunkHeight/4)*tilePixelHeight*chunkHeight-tilePixelHeight/2, 
            tilePixelWidth, tilePixelHeight
        );
    }
}