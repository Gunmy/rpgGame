class chunkTypes {
    scatterTile; mainTile; preferredNeighbours; name; bannedBiomes; structures;

    constructor (scatterTile, mainTile, preferredNeighbours, bannedBiomes, structures, name) {
        this.scatterTile = scatterTile;
        this.mainTile = mainTile;
        this.preferredNeighbours = preferredNeighbours;
        this.name = name;
        this.bannedBiomes = bannedBiomes;
        this.structures = structures;
    }
}

//Scattertile, maintiles, preferredNeighbours, bannedBiomes, structures, name
chunkTypeDictionary = {
    0: new chunkTypes([1], [1], [0, 0, 0, 0, 0, 0, 0, 0, 1, 4], [5, 6, 10, 11], [0, 2, 7, 8], "Grasslands"),
    1: new chunkTypes([3], [3], [1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4], [2, 3, 5, 6, 7, 10, 11], [3, 7, 8], "Ocean"),
    2: new chunkTypes([4], chanceArrayGen([4, 30, 5, 1, 9, 2]), [2, 2, 2, 2, 2, 3], [, 11], [1, 7, 8, 13], "Desert"),
    3: new chunkTypes([4], chanceArrayGen([4, 20, 3, 2]), [3, 3, 2, 2, 3, 2], [5, 6, 7, 11], [5, 6, 7, 8], "Oasis"),
    4: new chunkTypes([4], [4], [4, 4, 4, 1, 1], [11], [7, 8], "Beach"),
    5: new chunkTypes([7], chanceArrayGen([7, 10, 6, 1]), [7, 7, 5, 5, 5, 6, 6, 6, 6], [1, 0, 10, 3, 11], [4, 7, 8], "Obsidianlands"),
    6: new chunkTypes([6], chanceArrayGen([6, 30, 7, 1]), [7, 6, 6, 6, 5, 6, 7, 6], [0, 1, 2, 3, 4, 8, 10, 11], [4, 7], "Lavalands"),
    7: new chunkTypes([2], chanceArrayGen([2, 10, 7, 8, 9, 2]), [7, 7, 7, 6, 6, 5], [1, 10, 3, 7, 11], [7, 8], "Dirtlands"),
    8: new chunkTypes([1], chanceArrayGen([1, 20, 3, 3]), [0, 0, 0, 0, 8], [5, 6, 7, 10, 11], [5, 6, 7, 8], "Grassland oasis"),
    9: new chunkTypes([9], chanceArrayGen([9, 40, 10, 1, 11, 1, 12, 1, 13, 1, 14, 1]), chanceArrayGen([9, 2, 11, 5]), [11], [8], "Mountains"),
    10: new chunkTypes([8], [8], [2, 3, 4, 10], [0, 1, 5, 6, 7, 8, 11], [], "Quicksand"),
    11: new chunkTypes([9], chanceArrayGen([9, 40, 22, 30, 10, 1, 11, 1, 12, 1, 13, 1, 14, 1]), [9, 11], [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11], [8], "Cobble Mountains"),
    12: new chunkTypes([23], chanceArrayGen([23, 40, 24, 1, 25, 1,26, 1, 27, 1]), chanceArrayGen([12, 5]), [9, 11], [8], "Quartz mountains"),
    13: new chunkTypes([33], chanceArrayGen([33, 20, 32, 1]), chanceArrayGen([13, 20]), [], [9, 10, 11, 12, 14], "Cursed lands"),
    14: new chunkTypes([1], chanceArrayGen([1, 20, 36, 2, 21, 1]), [0, 0, 0, 0, 0, 0, 0, 0, 1, 4], [5, 6, 10, 11], [0, 2, 7, 8], "Forest")
}