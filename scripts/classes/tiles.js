class tile {
    x; y; width; height; name; level; rbg; rarity;
    isFluid = false;
    itemType = 0;

    constructor (x, y, width, height, name, level, rgb, rarity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.level = level;
        this.rgb = rgb;
        this.rarity = rarity;
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

    mouse (x, y) {
        ctx.drawImage(
            tileMap,
            this.x, this.y, this.width, this.height,
            x-round(tilePixelWidth/4), y-round(tilePixelWidth/4), 
            round(tilePixelWidth/2), round(tilePixelHeight/2)
        );
    }
}

class accessory {
    x; y; width; height; name; rarity;
    itemType = 2;

    constructor (x, y, width, height, name, rarity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
        this.rarity = rarity;
    }

    mouse (x, y) {
        ctx.drawImage(
            tileMap,
            this.x, this.y, this.width, this.height,
            x-round(tilePixelWidth/4), y-round(tilePixelWidth/4), 
            round(tilePixelWidth/2), round(tilePixelHeight/2)
        );
    }
}

class tileFluid extends tile {
    length; frames; offset;
    isFluid = true;
    constructor (x, y, width, height, name, length, level, rgb, rarity) {
        super(x, y, width, height, name, level, rgb, rarity);

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
    0: new tile(0, 0, 100, 100, "Unknown", 0, "#000000", 0),
    1: new tile(100, 0, 100, 100, "Grass", 0, "#7C8A4A", 0),
    2: new tile(200, 0, 100, 100, "Dirt", 0, "#553323", 0),
    3: new tileFluid(900, 300, 100, 100, "Water", 5, 0, "#368CD3", 0),
    4: new tile(300, 0, 100, 100, "Sand", 0, "#FFECBF", 0),
    5: new tile(300, 100, 100, 100, "Cactus", 2, "#117F20", 0),
    6: new tileFluid(1100, 300, 100, 100, "Lava", 10, 0, "#FF8312", 0),
    7: new tile(400, 0, 100, 100, "Obsidian", 1, "#451B30", 1),
    8: new tileFluid(1300, 300, 100, 100, "Quicksand", 50, 0, "#F1D187", 1),
    9: new tile(100, 100, 100, 100, "Stone", 3, "#707070", 0),
    10: new tile(100, 200, 100, 100, "Iron ore", 3, "#D3BF7E", 1),
    11: new tile(100, 300, 100, 100, "Gold ore", 3, "#FFDD00", 1),
    12: new tile(100, 400, 100, 100, "Diamond ore", 3, "#00FAFF", 2),
    13: new tile(100, 500, 100, 100, "Coal ore", 3, "#191919", 1),
    14: new tile(100, 600, 100, 100, "Copper ore", 3, "#915900", 1),
    15: new tile(700, 000, 100, 100, "Stone bricks", 3, "#505151", 0),
    16: new tile(800, 000, 100, 100, "Dark bricks", 3, "#54334B", 1),
    17: new tile(900, 000, 100, 100, "Sandstone bricks", 3, "#D3CB7E", 0),
    18: new tile(1000, 000, 100, 100, "Redstone bricks", 3, "#F70400", 0),
    19: new tile(1100, 000, 100, 100, "Planks", 0, "#BA7050", 0),
    20: new tile(1200, 000, 100, 100, "Log", 3, "#6B3F2F", 0),
    21: new tile(1300, 000, 100, 100, "Bush", 2, "#4F7315", 0),
    22: new tile(100, 700, 100, 100, "Cobblestone", 3, "#5D6665", 0),
    23: new tile(200, 100, 100, 100, "Quartz", 3, "#F9F9F9", 0),
    24: new tile(200, 200, 100, 100, "Redstone ore", 3, "#D81200", 1),
    25: new tile(200, 300, 100, 100, "Lapiz ore", 3, "#0015DB", 1),
    26: new tile(200, 400, 100, 100, "Emerald ore", 3, "#0EE000", 1),
    27: new tile(200, 500, 100, 100, "Silicone ore", 3, "#A8A8A8", 1),
    28: new tile(700, 100, 100, 100, "Marble pillar", 3, "#EFEFEF", 0),
    29: new tile(800, 100, 100, 100, "Marble lore tile", 0, "#E2E2E2", 0),
    30: new tile(900, 100, 100, 100, "Marble tile", 0, "#F9F9F9", 0),
    31: new tileFluid(1500, 300, 100, 100, "Cursed fluid", 10, 0, "#7D41D0", 1),
    32: new tile(1400, 0, 100, 100, "Cursed bush", 2, "#A8561F", 0),
    33: new tile(1500, 0, 100, 100, "Cursed grass", 0, "#583E74", 0),
    34: new tile(1400, 100, 100, 100, "Gravestone", 3, "#2D1E33", 2),
    35: new tile(600, 700, 100, 200, "Player statue", 3, "#FFFF21", 2),
    36: new tile(800, 700, 100, 200, "Tree", 3, "#F7916C", 1),
    37: new tile(400, 700, 100, 200, "Skeleton statue", 3, "#FFFF21", 2),
    38: new tile(0, 100, 100, 100, "Gravel", 0, "#7D8491", 0),
    39: new tile(1000, 100, 100, 100, "Marmor brick wall", 3, "#C1C1C1", 0),
    40: new tile(800, 500, 100, 200, "Rune stone", 4, "#FFFF21", 3),
    41: new tile(400, 200, 100, 100, "Gold block", 3, "#FFFF21", 2),


    100: new accessory(1200, 600, 100, 100, "Gold ring", 4)

}