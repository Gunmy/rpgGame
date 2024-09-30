/*
0 - common
1 - uncommon
2 - rare
3 - epic
4 - legendary
5 - mythic


*/

let myFont = new FontFace(
    "Pangolin",
    "url(https://fonts.gstatic.com/s/pangolin/v6/cY9GfjGcW0FPpi-tWMfN79z4i6BH.woff2)"
  );

  myFont.load().then((font) => {
    document.fonts.add(font);
});

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
    1: new itemType("Accessory"),
    2: new itemType("Helmet"),
    3: new itemType("Chestplate"),
    4: new itemType("Leggings"),
    5: new itemType("Wand"),
    6: new itemType("Pickaxe"),
    7: new itemType("Material")
}

//What builds the modules
class baseContainer {
    containing = false;
    amount = 0;
    costumeWidth = 100;
    costumeHeight = 100;
    extraInfo = false;
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
            ctx.textBaseline = "bottom";
            ctx.fillStyle = "#000000";
            ctx.font = round(width/5) + "px Arial";
            ctx.fillText(this.amount, x+width/2, y+height*0.95);
        }
    }

    mouseInContainer (x, y, width, height) {
        return (mouse.x > x && mouse.x < x + width && mouse.y > y && mouse.y < y + height);
    }

    get minusOne () {
        if (this.amount > 0) {
            this.amount -= 1;
            if (this.amount <= 0) {
                this.amount = 0;
                this.containing = false;
            }
        }
    }

    get interactionWithMouseHover () {
        if (this.containing && !mouse.containing) {
            let tempHeight = 200;
            let border = 5;
            let extraSpace = border * 10;
            
            let text = tilesDictionary[this.containing].name;

            if (this.amount > 1) {
                text += " [x" + this.amount + "]";
            }

            let tempWidth;
            if (ctx.measureText(text).width < 150) {
                tempWidth = 150 + extraSpace;
            } else {
                tempWidth = ctx.measureText(text).width + extraSpace;
            }

            let xOffset = 0;
            let yOffset = 0;
            if (mouse.x > WIDTH/2) {
                xOffset -= tempWidth;
            }
            if (mouse.y > HEIGHT/2) {
                yOffset -= tempHeight;
            }

            ctx.fillStyle = "white";
            ctx.fillRect(mouse.x + xOffset, mouse.y + yOffset, tempWidth, tempHeight);

            xOffset += border;
            yOffset += border;
            tempWidth -= border*2;
            tempHeight -= border*2;

            ctx.fillStyle = "#FFE3B5";
            ctx.fillRect(mouse.x + xOffset, mouse.y + yOffset, tempWidth, tempHeight);
    
            xOffset += border;
            yOffset += border;

            ctx.fillStyle = rarities[tilesDictionary[this.containing].rarity].color;
            ctx.textAlign = "start";
            ctx.textBaseline = "top";
            ctx.font = "bold 20px Calibri";
            ctx.fillText(text, mouse.x + xOffset, mouse.y + yOffset);

            yOffset += ctx.measureText(text).fontBoundingBoxDescent;

            ctx.fillStyle = "#BFA987";
            ctx.font = "italic 15px Pangolin"; 
            text = rarities[tilesDictionary[this.containing].rarity].name;
            ctx.fillText(text, mouse.x + xOffset, mouse.y + yOffset);

            ctx.fillText(itemTypes[tilesDictionary[this.containing].itemType].name, mouse.x + xOffset + border + ctx.measureText(text).width, mouse.y + yOffset);

            this.extraInfo.drawStats(mouse.x + xOffset, mouse.y + yOffset + 30);
        }
    }

    get placeItem () {
        if (this.containing == false) {
            this.containing = mouse.containing;
            this.amount = 1;
            this.extraInfo = mouse.extraInfo;
            
            mouse.amount -= 1;

            if (mouse.amount < 1) {
                mouse.amount = 0;
                mouse.extraInfo = false;
                mouse.containing = false;
            }

        } else if (mouse.containing == this.containing && mouse.extraInfo == this.extraInfo) { // Slå sammen
            this.amount += 1;
            mouse.amount -= 1;
            if (mouse.amount < 1) {
                mouse.amount = 0;
                mouse.extraInfo = false;
                mouse.containing = false;
            }
        }
    }

    get interactionWithMouseClick () {
        if (mouse.containing != this.containing || mouse.extraInfo != this.extraInfo) {
            let tempContaining = mouse.containing;
            let tempAmount = mouse.amount;
            let tempExtraInfo = mouse.extraInfo;

            mouse.containing = this.containing;
            mouse.amount = this.amount;
            mouse.extraInfo = this.extraInfo;

            this.containing = tempContaining;
            this.amount = tempAmount;
            this.extraInfo = tempExtraInfo;
        } else if (mouse.containing == this.containing && mouse.extraInfo == this.extraInfo) { // Slå sammen
            this.amount += mouse.amount;
            mouse.containing = false;
            mouse.amount = 0;
            mouse.extraInfo = false;
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

    drawContainer  (x, y, width, height) {
        ctx.drawImage(inventoryMap, 0, 0, this.costumeWidth, this.costumeHeight, x, y, width, height);
        ctx.drawImage(inventoryMap, this.restrictedTo*100, 400, this.costumeWidth, this.costumeHeight, x, y, width, height);
    }

    get interactionWithMouseClick () {
        console.log("eeeeee");
        if ((!mouse.containing || tilesDictionary[mouse.containing].itemType == this.restrictedTo) && (mouse.containing != this.containing || mouse.extraInfo != this.extraInfo)) {
            let tempContaining = mouse.containing;
            let tempAmount = mouse.amount;
            let tempExtraInfo = mouse.extraInfo;

            mouse.containing = this.containing;
            mouse.amount = this.amount;
            mouse.extraInfo = this.extraInfo;

            this.containing = tempContaining;
            this.amount = tempAmount;
            this.extraInfo = tempExtraInfo;
        } else if (mouse.containing == this.containing && this.extraInfo == mouse.extraInfo) {
            this.amount += mouse.amount;
            mouse.containing = false;
            mouse.amount = 0;
            mouse.extraInfo = false;
        }
    }

    get placeItem () {
        if (this.containing == false && tilesDictionary[mouse.containing].itemType == this.restrictedTo) {
            this.containing = mouse.containing;
            this.amount = 1;
            this.extraInfo = mouse.extraInfo;
            
            mouse.amount -= 1;

            if (mouse.amount < 1) {
                mouse.amount = 0;
                mouse.extraInfo = false;
                mouse.containing = false;
            }

        } else if (mouse.containing == this.containing && mouse.extraInfo == this.extraInfo) { // Slå sammen
            this.amount += 1;
            mouse.amount -= 1;
            if (mouse.amount < 1) {
                mouse.amount = 0;
                mouse.extraInfo = false;
                mouse.containing = false;
            }
        }
    }
}

class craftingContainer extends baseContainer {
    constructor() {
        super();
    }

    drawContainer  (x, y, width, height) {
        ctx.drawImage(inventoryMap, 0, 0, this.costumeWidth, this.costumeHeight, x, y, width, height);
        ctx.drawImage(inventoryMap, 400, 0, this.costumeWidth, this.costumeHeight, x, y, width, height);
    }

    get interactionWithMouseClick () {
        if (this.containing != false && (mouse.containing == false || (mouse.containing == this.containing && mouse.extraInfo == this.extraInfo))) {
            if (mouse.containing == false) {
                mouse.containing = this.containing;
                mouse.amount = this.amount;
                mouse.extraInfo = this.extraInfo;
            } else if (mouse.containing == this.containing && mouse.extraInfo == this.extraInfo) { // Slå sammen
                mouse.amount += this.amount;
            }
            return true;
        }
    }

    get placeItem () {
        //nothin
    }
}

//The modules themselves
class baseModule {
    x; y; width; columnCount; 
    textOffset = 30;
    content = [];

    get generateContent () {

    }

    get height () {
        return ceil(this.content.length/this.columnCount)*this.width / this.columnCount + this.textOffset;
    }

    get mouseInsideModule () {
        return (mouse.x > this.x && mouse.x < this.x + this.width && mouse.y > this.y && mouse.y < this.y + this.height);
    }

    get mouseInteractHover () {
        if (this.mouseInsideModule) {
            let side = this.width / this.columnCount;
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].mouseInContainer(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side)) {
                    this.content[i].interactionWithMouseHover;
                }
            }
        }
    }

    get placeItem () {
        if (this.mouseInsideModule) {
            console.log("frick");
            let side = this.width / this.columnCount;
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].mouseInContainer(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side)) {
                    console.log("fuck");
                    this.content[i].placeItem;
                }
            }
        } else {
            return true;
        }
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
    columnCount = 13;

    get generateContent () {
        for (let i = 0; i < 39; i++) {
            this.content.push(new baseContainer());
        }
    }

    constructor () {
        super();
    }

    get mouseInteractClick () {
        if (this.mouseInsideModule) {
            console.log("frick");
            let side = this.width / this.columnCount;
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].mouseInContainer(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side)) {
                    console.log("fuck");
                    this.content[i].interactionWithMouseClick;
                }
            }
        } else {
            return true;
        }
    }

    itemPickUp (itemID, amount, extraInfo) {
        let itemInInventory = false;
        for (let i = 0; i < this.content.length; i++) {
            if (this.content[i].containing == itemID && this.content[i].extraInfo == extraInfo) {
                itemInInventory = true;
                this.content[i].amount += amount;
                break;
            }
        }

        if (!itemInInventory) {
            for (let i = 0; i < this.content.length; i++) {
                if (!this.content[i].containing) {
                    itemInInventory = true;
                    this.content[i].amount += amount;
                    this.content[i].containing = itemID;
                    this.content[i].extraInfo = extraInfo;
                    break;
                }
            }
        }

        return itemInInventory;
    }

    get draw () {
        ctx.fillStyle = "#FFE3B5";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "#AA9779";
        ctx.font = "20px Pangolin";
        ctx.fillText("Inventory", this.x+this.width/2, this.textOffset+this.y);

        let side = this.width / this.columnCount;
        for (let i = 0; i < this.content.length; i++) {
            this.content[i].draw(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side);
        }
    }
}

class equipmentModule extends baseModule {
    x = 25; 
    y = 300; 
    width = WIDTH/5; 
    columnCount = 3;

    get generateContent () {
        let pattern = [
            1, 2, 1,
            1, 3, 1,
            1, 4, 1
        ];

        for (let i = 0; i < pattern.length; i++) {
            this.content.push(new restrictedContainer(pattern[i]));
        }

        for (let i = 0; i < 3; i++) {
            this.content.push(new baseContainer());
        }

        this.content[9].containing = 104;
        this.content[9].amount = 1;
        this.content[9].extraInfo = new extraInfo([4, 20, 5, 20]);
    }

    constructor () {
        super();
    }

    get mouseInteractClick () {
        if (this.mouseInsideModule) {
            console.log("frick");
            let side = this.width / this.columnCount;
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].mouseInContainer(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side)) {
                    console.log("fuck");
                    this.content[i].interactionWithMouseClick;
                }
            }
        } else {
            return true;
        }
    }

    get draw () {
        ctx.fillStyle = "#FFE3B5";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "#AA9779";
        ctx.font = "20px Pangolin";
        ctx.fillText("Equipment", this.x+this.width/2, this.textOffset+this.y);

        let side = this.width / this.columnCount;
        for (let i = 0; i < this.content.length; i++) {
            this.content[i].draw(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side);
        }
    }
}

class craftingModule extends baseModule {
    x = WIDTH/2; 
    y = 300; 
    width = WIDTH/5; 
    columnCount = 3;

    get generateContent () {
        let pattern = [
            0, 0, 0,
            0, 1, 0,
            0, 0, 0
        ];

        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] == 0) {
                this.content.push(new baseContainer());
            } else if (pattern[i] == 1) {
                this.content.push(new craftingContainer());
            }
        }
    }

    constructor () {
        super();
    }

    get update () {
        this.content[4].amount = 0;
        this.content[4].containing = false;
        this.content[4].extraInfo = false;

        for (let i = 0; i < recipeList.length; i++) {                
            let tempCont = [];
            for (let j = 0;  j < this.content.length; j++) {
                if (j != 4) {
                    tempCont.push(this.content[j].containing);
                }
            }

            let tempMat = recipeList[i].material;
            let tempLen = tempMat.length;
            for (let j = 0; j < 8-tempLen; j++) {
                tempMat.push(false);
            }

            let recipe = true;
            for (let j = 0; j < tempMat.length; j++) {
                let tempRecipe = false;
                if (recipeList[i].pattern == true) {
                    console.log("yeet");
                    if (tempMat[j] == tempCont[j]) {
                        tempRecipe = true;
                    }
                } else {
                    for (let n = 0; n < tempCont.length; n++) {
                        if (tempMat[j] == tempCont[n]) {
                            tempRecipe = true;
                            tempCont.splice(n, 1);
                            break;
                        }
                    }
                }

                if (!tempRecipe) {
                    recipe = false;
                    break;
                }
            }
            if (recipe) {
                this.content[4].amount = recipeList[i].amount;
                this.content[4].containing = recipeList[i].product;
                this.content[4].extraInfo = recipeList[i].extraInfo;
                break;
            }
        }
    }

    get placeItem () {
        if (this.mouseInsideModule) {
            console.log("frick");
            let side = this.width / this.columnCount;
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].mouseInContainer(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side)) {
                    console.log("fuck");
                    this.content[i].placeItem;
                }
            }
            this.update;
        } else {
            return true;
        }
    }

    get mouseInteractClick () {
        if (this.mouseInsideModule) {
            console.log("frick");
            let side = this.width / this.columnCount;
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].mouseInContainer(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side)) {
                    if (this.content[i].interactionWithMouseClick) {
                        for (let i = 0; i < this.content.length; i++) {
                            this.content[i].amount -= 1;
                            if (this.content[i].amount <= 0) {
                                this.content[i].containing = false;
                                this.content[i].amount = 0;
                                this.content[i].extraInfo = false;
                            }
                        }
                    }
                }
            }

            this.update;
        } else {
            return true;
        }
    }

    get draw () {
        ctx.fillStyle = "#FFE3B5";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "#AA9779";
        ctx.font = "20px Pangolin";
        ctx.fillText("Crafting", this.x+this.width/2, this.textOffset+this.y);

        let side = this.width / this.columnCount;
        for (let i = 0; i < this.content.length; i++) {
            this.content[i].draw(this.x+side*i-hMONIN(this.columnCount, i)*this.columnCount*side, this.y+side*hMONIN(this.columnCount, i)+this.textOffset, side, side);
        }
    }
}


class statsModule extends baseModule {
    height = 200;
    x = WIDTH-WIDTH/5-50; 
    y = HEIGHT-this.height-50; 
    width = WIDTH/5; 
    columnCount = 3; 

    get generateContent () {

    }

    get mouseInteractHover () {

    }

    get placeItem () {

    }

    get mouseInteractClick () {

    }

    constructor() {
        super();
        this.generateContent;
    }

    get draw () {
        ctx.beginPath;
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        player.realStats.drawStats(this.x+10, this.y+10);
    }

}


function inventoryClick () {
    //mouseHolding, mouseAmount
    if (inventoryBasic.mouseInteractClick && equipmentBasic.mouseInteractClick && craftingBasic.mouseInteractClick && mouse.containing != false) {
                    droppedItemsList.push(new droppedItem(mouse.containing, player.x, player.y, calcAngleToMouse(WIDTH/2, HEIGHT/2), 0.2, 30, mouse.amount, mouse.extraInfo));
                    mouse.containing = false;
                    mouse.amount = 0;
                    mouse.extraInfo = false;
                }
            

}

function inventoryHover () {
    
    inventoryBasic.mouseInteractHover;
    equipmentBasic.mouseInteractHover;
    craftingBasic.mouseInteractHover;

}

function placeItem () {
    inventoryBasic.placeItem;
    equipmentBasic.placeItem;
    craftingBasic.placeItem;
}