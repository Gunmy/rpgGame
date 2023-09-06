
class baseProjectile {
    type; x; y;
    angle;
    speed; duration; spawnTime = Date.now()/1000;
    owner; damage;

    constructor (type, x, y, angle, speed, duration, ownedByPlayer, damage) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.duration = duration;
        this.ownedByPlayer = ownedByPlayer;
        this.damage = damage;
    }

    get stillAlive () {
        return (Date.now()/1000 - this.spawnTime <= this.duration);
    }

    get shatter () {
        let max = 2;
        for (let i = 0; i < max; i++) {
            for (let j = 0; j < max; j++) {
                particlesListBehind.push(new imageParticle(this.x-(0.5-i/max)*baseProjectilesInfo[this.type].size/chunkWidth, this.y-(0.5-j/max)*baseProjectilesInfo[this.type].size/chunkHeight, 
                    baseProjectilesInfo[this.type].costumeX+baseProjectilesInfo[this.type].width/max*i, baseProjectilesInfo[this.type].costumeY+baseProjectilesInfo[this.type].height/max*j, baseProjectilesInfo[this.type].width/max, baseProjectilesInfo[this.type].height/max, baseProjectilesInfo[this.type].size/max, baseProjectilesInfo[this.type].size/max,
                    1+1*random(), 0.1+0.1*random(), negPos(), 1, 1));
            }
        }
    }

    get deathAnimation () {
        this.shatter;
    }

    get damageParticle () {
        particlesListInFront.push(new textParticle(this.x, this.y, 0.3+random()*0.3, random()*2,  
                        [200, 50, 0], 0.3, 
                        negPos(), 1, 1, this.damage));
    }

    calcDistanceToEntity (entity) {
        return hyp(this.x-entity.x, this.y-entity.y);
    }

    get move () {
        this.x += cos(this.angle)*this.speed*deltaTime;
        this.y += sin(this.angle)*this.speed*deltaTime;
    
        if (this.ownedByPlayer) {
            for (let i = 0; i < entitiesList.length; i++) {
                if (this.calcDistanceToEntity(entitiesList[i]) < (baseProjectilesInfo[this.type].sizeRadius + entitiesList[i].sizeRadius)) {
                    entitiesList[i].health -= this.damage;
                    this.damageParticle;
                    this.duration = 0;
                    break;
                }
            }
        } else {
            if (this.calcDistanceToEntity(player) < (baseProjectilesInfo[this.type].sizeRadius + player.hitBox)) {
                player.health -= this.damage;
                this.damageParticle;
                this.duration = 0;
            }
        }    
    }

    get updateSelf () {
        this.move;

        if (floor(random()*20) == 1) {
            particlesListBehind.push(new coloredParticle(this.x, this.y, 0.2, 1, baseProjectilesInfo[this.type].rgb, 0.05, cos(this.angle), sin(this.angle), 0));
        }
    }

    get draw () {
        this.updateSelf;
        
        ctx.save();
        ctx.translate(round(WIDTH/2  + (this.x-player.x)*tilePixelWidth*chunkWidth), 
        round(HEIGHT/2 + (this.y-player.y)*tilePixelHeight*chunkHeight));
        ctx.rotate(this.angle+1/2*PI);

        ctx.drawImage(
            entitiesMap,
            baseProjectilesInfo[this.type].costumeX, baseProjectilesInfo[this.type].costumeY, 
            baseProjectilesInfo[this.type].width, baseProjectilesInfo[this.type].height,
            -tilePixelWidth*baseProjectilesInfo[this.type].size/2, 
            -tilePixelHeight*baseProjectilesInfo[this.type].size/2, 
            tilePixelWidth*baseProjectilesInfo[this.type].size, tilePixelHeight*baseProjectilesInfo[this.type].size
        );

        ctx.restore();
    }
}

class explodingProjectile extends baseProjectile {
    amount; 
    constructor(type, x, y, angle, speed, duration, ownedByPlayer, damage, amount) {
        super(type, x, y, angle, speed, duration, ownedByPlayer, damage);
        this.amount = amount;
    }

    get deathAnimation () {
        this.shatter();
        let offset = 1/3*PI/((this.amount-1)/2);
        let start = -1/3*PI+this.angle;
        for (let i = 0; i < this.amount; i++) {
            projectilesList.push(new baseProjectile(baseProjectilesInfo[this.type].explosionProjectile, this.x, this.y, start+offset*i, 0.3, 5, this.ownerByPlayer, this.damage/3))
        }
    }


}


class baseProjectileInfo {
    costumeX; costumeY; width; height; sizeRadius; size; rgb;
    constructor (costumeX, costumeY, width, height, sizeRadius, size, rgb) {
        this.costumeX = costumeX; 
        this.costumeY = costumeY; 
        this.width = width; 
        this.height = height; 
        this.sizeRadius = sizeRadius; 
        this.size = size; 
        this.rgb = rgb;
    }
}

class explodingProjectileInfo extends baseProjectileInfo {
    explodingProjectile;
    constructor (costumeX, costumeY, width, height, sizeRadius, size, rgb, explosionProjectile) {
        super(costumeX, costumeY, width, height, sizeRadius, size, rgb);
        this.explosionProjectile = explosionProjectile;
    }
}

let baseProjectilesInfo = {
    1: new baseProjectileInfo(200, 1400, 50, 50, 0.01, 0.5, [0, 0, 0]),
    2: new baseProjectileInfo(250, 1450, 50, 50, 0.01, 0.5, [124, 173, 32]),
    3: new explodingProjectileInfo(250, 1450, 50, 50, 0.01, 1, [124, 173, 32], 2)
}


function shoot () {
    let yDif = (mouse.y-HEIGHT/2);
    let xDif = (mouse.x-WIDTH/2);
    let angle = Math.atan2(yDif, xDif);
    projectilesList.push(new baseProjectile(2, player.x, player.y, angle, 0.3, 2, true, 10));
}