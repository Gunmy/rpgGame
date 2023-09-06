/*
0 - common
1 - uncommon
2 - rare
3 - epic
4 - legendary
5 - mythic


*/

class rarity {
    color; name;

    constructor (name, color) {
        this.name = name;
        this.color = color;
    }
}

rarities = {
    0: new rarity("Common", "#D6D6D6"),
    1: new rarity("Uncommon", "#00D60A"),
    2: new rarity("Rare", "#0284D6"),
    3: new rarity("Epic", "#A220D6"),
    4: new rarity("Legendary", "#FFb600"),
    5: new rarity("Mythic", "#FF00CB")
}

class itemType {
    name;

    constructor (name) {
        this.name = name;
    }
}

let itemTypes = {
    0: new itemType("Placeable"),
    1: new itemType("Wand"),
    2: new itemType("Accessory"),
    3: new itemType("Helmet"),
    4: new itemType("Chestplate"),
    5: new itemType("Leggings")
}

//What builds the modules
class baseContainer {
    containing = false;
    amount = 0;
    costumeWidth = 100;
    costumeHeight = 100;
    constructor() {
    }

    drawRarity (x, y, radius) {
        let item = tilesDictionary[this.containing];

        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.fillStyle = rarities[item.rarity].color;
        ctx.arc(x, y, radius, 0, 2*PI);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    drawItem (x, y, width, height) {
        if (this.containing != false) {
            this.drawRarity(x+width/2, y+height/2, width*0.3);
            let item = tilesDictionary[this.containing];
            ctx.drawImage(tileMap, item.x, item.y, item.width, item.height, x+0.3*width, y+0.3*height, width*0.4, height*0.4);
        }
    }

    drawContainer  (x, y, width, height) {
        ctx.drawImage(inventoryMap, 0, 0, this.costumeWidth, this.costumeHeight, x, y, width, height);
    }

    drawAmount (x, y, width, height) {
        if (this.amount > 1) {
            ctx.drawImage(inventoryMap, 200, 0, this.costumeWidth, this.costumeHeight, x, y, width, height);
            ctx.textAlign = "center";
            ctx.fillStyle = "#000000";
            ctx.font = round(width/5) + "px Arial";
            ctx.fillText(this.amount, x+width/2, y+height*0.9);
        }
    }

    mouseInContainer (x, y, width, height) {
        return (mouse.x > x && mouse.x < x + width && mouse.y > y && mouse.y < y + height);
    }



    get interactionWithMouseClick () {
        if (mouse.containing != this.containing) {
            let tempContaining = mouse.containing;
            let tempAmount = mouse.amount;

            mouse.containing = this.containing;
            mouse.amount = this.amount;

            this.containing = tempContaining;
            this.amount = tempAmount;
        } else { // Slå sammen
            this.amount += mouse.amount;
            mouse.containing = false;
            mouse.amount = 0;
        }
    }

    draw (x, y, width, height) {
        this.drawContainer(x, y, width, height);
        this.drawItem(x, y, width, height);
        this.drawAmount(x, y, width, height);
    }
}

class restrictedContainer extends baseContainer {
    restrictedTo;
    constructor(restrictedTo) {
        super();
        this.restrictedTo = restrictedTo;
    }

    get interactionWithMouseClick () {
        console.log("eeeeee");
        if ((!mouse.containing || tilesDictionary[mouse.containing].itemType == this.restrictedTo) && mouse.containing != this.containing) {
            let tempContaining = mouse.containing;
            let tempAmount = mouse.amount;

            mouse.containing = this.containing;
            mouse.amount = this.amount;

            this.containing = tempContaining;
            this.amount = tempAmount;
        } else if (!mouse.containing || tilesDictionary[mouse.containing].itemType == this.restrictedTo) {
            this.amount += mouse.amount;
            mouse.containing = false;
            mouse.amount = 0;
        }
    }
}


class craftedContainer extends baseContainer {

}

class accessoryContainer extends baseContainer {

}

class helmetContainer extends baseContainer {

}

class chestplateContainer extends baseContainer {

}

class leggingsContainer extends baseContainer {

}


//The modules themselves
class baseModule {
    x; y; width; rowCount; 
    content = [];

    get generateContent () {

    }

    get height () {
        return ceil(this.content.length/this.rowCount)*this.width / this.rowCount;
    }

    get mouseInsideModule () {
        return (mouse.x > this.x && mouse.x < this.x + this.width && mouse.y > this.y && mouse.y < this.y + this.height);
    }

    get mouseInteractClick () {
        //Do something!
    }

    constructor() {
        this.generateContent;
    }

}

class inventoryModule extends baseModule {
    x = 25; 
    y = 25; 
    width = WIDTH-50; 
    rowCount = 13;

    get generateContent () {
        for (let i = 0; i < 39; i++) {
            this.content.push(new baseContainer());
            this.content[i].containing = i+1;
            this.content[i].amount = ceil(random()*40);
        }
        this.content.push(new restrictedContainer(2));
    }

    constructor () {
        super();
    }

    get mouseInteractClick () {
        if (this.mouseInsideModule) {
            console.log("frick");
            let side = this.width / this.rowCount;
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].mouseInContainer(this.x+side*i-hMONIN(this.rowCount, i)*this.rowCount*side, this.y+side*hMONIN(this.rowCount, i), side, side)) {
                    console.log("fuck");
                    this.content[i].interactionWithMouseClick;
                }
            }
        }
    }

    get draw () {
        ctx.fillStyle = "#FFE3B5";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        let side = this.width / this.rowCount;
        for (let i = 0; i < this.content.length; i++) {
            this.content[i].draw(this.x+side*i-hMONIN(this.rowCount, i)*this.rowCount*side, this.y+side*hMONIN(this.rowCount, i), side, side);
        }
    }
}

class craftingModule {

}

class equipmentModule {

}

function inventoryClick () {
    //mouseHolding, mouseAmount

    inventoryBasic.mouseInteractClick;


}