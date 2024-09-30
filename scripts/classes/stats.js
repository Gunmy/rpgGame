class stat {
    name; color; symbol;
    constructor (name, color, symbol) {
        this.name = name;
        this.color = color;
        this.symbol = symbol;
    }
}

let statsList = {
    0: new stat("Health", "#FF0000", "♥"),
    1: new stat("Defence", "#FF99FF", "♜"),
    2: new stat("Damage", "#FF0000", "✱"),
    3: new stat("Mana", "#99GG99", "۞"),
    4: new stat("Breaking power", "#FF0000", "ϟ"),
    5: new stat("Movement speed", "#FFFFFF", "✦"),
    6: new stat("Projectile speed", "#FFFFFF", "✧"),
    7: new stat("Projectile duration", "#000000", "✢"),
    8: new stat("Strength", "#FF0000", "✪")
}


class extraInfo {
    stats = {}

    constructor (statsInput) {
        for (let i = 0; i < Object.keys(statsList).length; i++) {
            this.stats[i] = 0;
        }

        for (let i = 0; i < statsInput.length; i+=2) {
            this.stats[statsInput[i]] = statsInput[i+1];
        }
    }

    get anyStats () {
        for (let i = 0; i < Object.keys(this.stats).length; i++) {
            if (this.stats[i] > 0) {
                return true;
            }
        }
        return false;
    }

    get returnStats () {
        let tempList = [];
        for (let i = 0; i < Object.keys(this.stats).length; i++) {
            if (this.stats[i] > 0) {
                tempList.push(i);
                tempList.push(this.stats[i]);
            }
        }
        return tempList;
    }
    
    drawStats (x, y) {
        ctx.textAlign = "start";
        ctx.textBaseline = "top";
        ctx.font = "bold 15px Calibri"; 

        let height = ctx.measureText("Test").fontBoundingBoxDescent;

        let xOffset = 0;
        let yOffset = 0;

        if (this.anyStats) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText("Stats:", x + xOffset, y + yOffset);

            xOffset += 5;
            
            for (let i = 0; i < Object.keys(this.stats).length; i++) {
                if (this.stats[i] > 0) {
                    yOffset += height;
                    ctx.fillStyle = statsList[i].color;
                    let text = statsList[i].symbol + " " + statsList[i].name + ":";
                    ctx.fillText(text, x+xOffset, y+yOffset);
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillText(this.stats[i], x+xOffset + ctx.measureText(text).width + 5, y+yOffset);
                }
            }
        }

        return yOffset;
    }


}