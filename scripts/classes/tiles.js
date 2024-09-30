
tileExtraInfo = new extraInfo([])
class tile {
    x; y; width; height; name; level; rbg; rarity; drop; breakingPower;
    isFluid = false;
    itemType = 0;

    constructor (x, y, width, height, name, level, rgb, rarity, drop, breakingPower) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.level = level;
        this.rgb = rgb;
        this.rarity = rarity;
        this.drop = drop;
        this.breakingPower = breakingPower;
    }

    drawBorder (x, y, surroundings) {
        if (tilePixelHeight > 50 || tilePixelWidth > 50) {
        //Draws border in an L shape (if all tiles are not equal)
            for (let k = 0; k < patternX.length; k++) {
                ctx.fillStyle = "#FFFFFF";
                if (surroundings[[patternX[k], patternY[k]]] == false) {
                    if (patternX[k] == 0 && patternY[k] == 1) {
                        ctx.fillRect(x, 
                                    y + tilePixelHeight-tileBorderHeight, 
                                    tilePixelWidth, tileBorderHeight);
                    } else if (patternX[k] == -1 && patternY[k] == 0) {
                        ctx.fillRect(x, 
                            y, 
                            tileBorderWidth, tilePixelHeight);
                    } else if (patternX[k] == -1 && patternY[k] == 1) {
                        ctx.fillRect(x, 
                            y + tilePixelHeight - tileBorderHeight, 
                            tileBorderWidth, tileBorderHeight);
                    }
                }
            }
        }
    }

    drawShadow (x, y, tileAbove) {
        if (tilePixelHeight > 20 || tilePixelWidth > 20) {
            if (tileAbove > this.level) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillRect(x, y, tilePixelWidth, tilePixelHeight/5*(tileAbove-this.level));
            }
        }
    }

    draw (x, y, surroundings, tileAbove) {
        if (tilePixelWidth > 30) {
            ctx.drawImage(
                tileMap,
                this.x, this.y, this.width, this.height,
                x-tilePixelHeight*(this.width/100-1), y-tilePixelHeight*(this.height/100-1), 
                tilePixelWidth*(this.width/100), tilePixelHeight*(this.height/100)
            );
        } else {
            ctx.beginPath();
            ctx.fillStyle = this.rgb;
            ctx.fillRect(x, y, tilePixelWidth, tilePixelHeight);
            ctx.fill();
        }

        this.drawBorder(x, y, surroundings);
        this.drawShadow(x, y, tileAbove);

        
    }

    mouse (x, y, sizeConstant) {
        ctx.drawImage(
            tileMap,
            this.x, this.y, this.width, this.height,
            x-round(sizeConstant/2), y-round(sizeConstant/2), 
            sizeConstant, sizeConstant
        );
    }

    mouseClick () {
        map[mouse.chunk].placeTile(mouse.tile);
    }
}

class equipment {
    x; y; width; height; name; rarity; itemType; color;

    constructor (x, y, width, height, name, rarity, itemType, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.rarity = rarity;
        this.itemType = itemType;
        this.color = color;
    }

    mouse (x, y, sizeConstant) {
        ctx.drawImage(
            tileMap,
            this.x, this.y, this.width, this.height,
            x-round(sizeConstant/2), y-round(sizeConstant/2), 
            sizeConstant, sizeConstant
        );
    }


    mouseClick () {

    }
}

class item {
    x; y; width; height; name; rarity; itemType;

    constructor (x, y, width, height, name, rarity, itemType) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.rarity = rarity;
        this.itemType = itemType;
    }

    mouse (x, y, sizeConstant) {
        ctx.drawImage(
            tileMap,
            this.x, this.y, this.width, this.height,
            x-round(sizeConstant/2), y-round(sizeConstant/2), 
            sizeConstant, sizeConstant
        );
    }


    mouseClick () {

    }
}

class pickaxe {
    x; y; width; height; name; rarity; itemType = 6;

    constructor (x, y, width, height, name, rarity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.rarity = rarity;
    }

    mouse (x, y, sizeConstant) {
        ctx.drawImage(
            tileMap,
            this.x, this.y, this.width, this.height,
            x-round(sizeConstant/2), y-round(sizeConstant/2), 
            sizeConstant, sizeConstant
        );
    }


    mouseClick () {
        map[mouse.chunk].destroyTile(mouse.tile);
    }
}

class wands {
    x; y; width; height; name; rarity; itemType = 5; manaCost;

    constructor (x, y, width, height, name, rarity, manaCost) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.rarity = rarity;
        this.manaCost = manaCost;
    }

    mouse (x, y, sizeConstant) {
        ctx.drawImage(
            tileMap,
            this.x, this.y, this.width, this.height,
            x-round(sizeConstant/2), y-round(sizeConstant/2), 
            sizeConstant, sizeConstant
        );
    }

    get ability () {
        //ability
    }

    mouseClick () {
        if (player.manaLeft >= this.manaCost) {
            let audio = new Audio('soundEffects/spell_cast.mp3');
            audio.volume = 0.1;
            audio.play();
            this.ability;
            player.manaLastActive = Date.now();
            player.manaLeft -= this.manaCost;
        }
    }
}

class greenWand extends wands {
    constructor () {
        super(1300, 800, 100, 100, "Great green wand", 5, 100);
    }

    get ability () {
        let yDif = (mouse.y-HEIGHT/2);
        let xDif = (mouse.x-WIDTH/2);
        let angle = Math.atan2(yDif, xDif);
        projectilesList.push(new explodingProjectile(3, player.x, player.y, angle, 0.3, 2, true, player.realStats.stats[2], player.realStats.stats[8], 5));
    }
}

class skeletonWand extends wands {
    constructor () {
        super(1400, 800, 100, 100, "Great skeleton wand", 5, 20);
    }

    get ability () {
        let yDif = (mouse.y-HEIGHT/2);
        let xDif = (mouse.x-WIDTH/2);
        let angle = Math.atan2(yDif, xDif);
        projectilesList.push(new baseProjectile(1, player.x, player.y, angle, 0.3, 2, true, player.realStats.stats[2], player.realStats.stats[8]));
    }
}

class tileFluid extends tile {
    length; frames; offset;
    isFluid = true;
    constructor (x, y, width, height, name, length, level, rgb, rarity, drop, breakingPower) {
        super(x, y, width, height, name, level, rgb, rarity, drop, breakingPower);

        this.frames = frames;
        this.length = length;
    }

    draw (x, y, surroundings, tileAbove) {
        if (tilePixelWidth > 30) {
            this.offset = ((Date.now()%(this.length*1000))/(this.length*1000));
            ctx.drawImage(
                tileMap,
                this.x + this.width*this.offset, 
                this.y + this.height*this.offset, 
                this.width, this.height,
                x, y, tilePixelWidth, tilePixelHeight
            );
        } else {
            ctx.beginPath();
            ctx.fillStyle = this.rgb;
            ctx.fillRect(x, y, tilePixelWidth, tilePixelHeight);
            ctx.fill();
        }

        this.drawBorder(x, y, surroundings);
        this.drawShadow(x, y, tileAbove);
    }

}

let tilesDictionary = {
    0: new tile(0, 0, 100, 100, "Unknown", 0, "#000000", 0, 0, 100),
    1: new tile(100, 0, 100, 100, "Grass", 0, "#7C8A4A", 0, 1, 10),
    2: new tile(200, 0, 100, 100, "Dirt", 0, "#553323", 0, 2, 0),
    3: new tileFluid(900, 300, 100, 100, "Water", 5, 0, "#368CD3", 0, 3, 100),
    4: new tile(300, 0, 100, 100, "Sand", 0, "#FFECBF", 0, 4, 100),
    5: new tile(300, 100, 100, 100, "Cactus", 2, "#117F20", 0, 5, 10),
    6: new tileFluid(1100, 300, 100, 100, "Lava", 10, 0, "#FF8312", 0, 6, 100),
    7: new tile(400, 0, 100, 100, "Obsidian", 1, "#451B30", 1, 7, 1000),
    8: new tileFluid(1300, 300, 100, 100, "Quicksand", 50, 0, "#F1D187", 1, 8, 100),
    9: new tile(100, 100, 100, 100, "Stone", 3, "#707070", 0, 22, 100),
    10: new tile(100, 200, 100, 100, "Iron ore", 3, "#D3BF7E", 1, 204, 100),
    11: new tile(100, 300, 100, 100, "Gold ore", 3, "#FFDD00", 1, 202, 100),
    12: new tile(100, 400, 100, 100, "Diamond ore", 3, "#00FAFF", 2, 203, 100),
    13: new tile(100, 500, 100, 100, "Coal ore", 3, "#191919", 1, 201, 100),
    14: new tile(100, 600, 100, 100, "Copper ore", 3, "#915900", 1, 200, 100),
    15: new tile(700, 000, 100, 100, "Stone bricks", 3, "#505151", 0, 15, 100),
    16: new tile(800, 000, 100, 100, "Dark bricks", 3, "#54334B", 1, 16, 100),
    17: new tile(900, 000, 100, 100, "Sandstone bricks", 3, "#D3CB7E", 0, 17, 100),
    18: new tile(1000, 000, 100, 100, "Redstone bricks", 3, "#F70400", 0, 18, 100),
    19: new tile(1100, 000, 100, 100, "Planks", 0, "#BA7050", 0, 19, 100),
    20: new tile(1200, 000, 100, 100, "Log", 3, "#6B3F2F", 0, 20, 100),
    21: new tile(1300, 000, 100, 100, "Bush", 2, "#4F7315", 0, 21, 10),
    22: new tile(100, 700, 100, 100, "Cobblestone", 3, "#5D6665", 0, 22, 100),
    23: new tile(200, 100, 100, 100, "Quartz", 3, "#F9F9F9", 0, 23, 100),
    24: new tile(200, 200, 100, 100, "Redstone ore", 3, "#D81200", 1, 205, 100),
    25: new tile(200, 300, 100, 100, "Lapiz ore", 3, "#0015DB", 1, 206, 100),
    26: new tile(200, 400, 100, 100, "Emerald ore", 3, "#0EE000", 1, 207, 100),
    27: new tile(200, 500, 100, 100, "Silicone ore", 3, "#A8A8A8", 1, 208, 100),
    28: new tile(700, 100, 100, 100, "Marble pillar", 3, "#EFEFEF", 0, 28, 100),
    29: new tile(800, 100, 100, 100, "Marble lore tile", 0, "#E2E2E2", 0, 29, 100),
    30: new tile(900, 100, 100, 100, "Marble tile", 0, "#F9F9F9", 0, 30, 100),
    31: new tileFluid(1500, 300, 100, 100, "Cursed fluid", 10, 0, "#7D41D0", 1, 31, 100),
    32: new tile(1400, 0, 100, 100, "Cursed bush", 2, "#A8561F", 0, 32, 100),
    33: new tile(1500, 0, 100, 100, "Cursed grass", 0, "#583E74", 0, 33, 100),
    34: new tile(1400, 100, 100, 100, "Gravestone", 3, "#2D1E33", 2, 34, 250),
    35: new tile(600, 700, 100, 200, "Player statue", 3, "#FFFF21", 2, 35, 500),
    36: new tile(800, 700, 100, 200, "Tree", 3, "#F7916C", 1, 36, 100),
    37: new tile(400, 700, 100, 200, "Skeleton statue", 3, "#FFFF21", 2, 37, 500),
    38: new tile(0, 100, 100, 100, "Gravel", 0, "#7D8491", 0, 38, 100),
    39: new tile(1000, 100, 100, 100, "Marmor brick wall", 3, "#C1C1C1", 0, 39, 100),
    40: new tile(800, 500, 100, 200, "Rune stone", 4, "#FFFF21", 3, 40, 1000),
    41: new tile(400, 200, 100, 100, "Gold block", 3, "#FFFF21", 1, 41, 250),


    100: new equipment(1200, 600, 100, 100, "Gold ring", 4, 1),
    101: new equipment(1300, 600, 100, 100, "Wizards helmet", 5, 2, "#858CF6"),
    102: new equipment(1400, 600, 100, 100, "Wizards chestplate", 5, 3, ["#858CF6", "#EADE00"]),
    103: new equipment(1500, 600, 100, 100, "Wizards leggings", 5, 4, ["#858CF6", "#EADE00", "#934A32"]),
    104: new pickaxe(1200, 700, 100, 100, "Pickaxe", 4),
    105: new equipment(1400, 700, 100, 100, "Skeleton crown", 5, 2, "#EADE00"),

    106: new greenWand(),
    107: new skeletonWand(),

    200: new item(100, 800, 100, 100, "Raw copper", 1, 7),
    201: new item(200, 800, 100, 100, "Coal", 1, 7),
    202: new item(100, 900, 100, 100, "Raw gold", 1, 7),
    203: new item(200, 900, 100, 100, "Diamond", 1, 7),
    204: new item(100, 1000, 100, 100, "Raw iron", 1, 7),
    205: new item(200, 1000, 100, 100, "Redstone", 1, 7),
    206: new item(100, 1100, 100, 100, "Lapiz", 1, 7),
    207: new item(200, 1100, 100, 100, "Emerald", 1, 7),
    208: new item(200, 1200, 100, 100, "Raw silocone", 1, 7),
    209: new item(800, 1000, 100, 100, "Tied grass", 1, 7)
}