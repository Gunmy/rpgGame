class recipe {
    material; product; amount; extraInfo; pattern;
    constructor (material, product, amount, extraInfo, pattern) {
        this.material = material;
        this.product  = product;
        this.amount   = amount;
        this.extraInfo = extraInfo;
        this.pattern = pattern;
    }
}

let recipeList = [
    new recipe(
        [22, 22, 22, 22, 22, 22, 22, 201], 9, 7, tileExtraInfo, false
    ),

    new recipe(
        [9, 9, 9, 9, 9, 9, 9, 9], 15, 8, tileExtraInfo, false
    ),

    new recipe([203, 206, 203, 
                202,      202], 
                101, 1, new extraInfo([3, 100, 5, 10, 0, 20, 1, 100]), true),
    
    new recipe([1, 1, 1], 209, 1, tileExtraInfo, false),

    new recipe([1], 106, 1, new extraInfo([2, 10, 8, 10, 3, 100]), false)
]