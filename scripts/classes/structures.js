class structure {
    name; layout; spawnChance; width; height; rotateable;

    constructor (name, spawnChance, layout, rotateable) {
        this.layout = layout;
        this.spawnChance = spawnChance;
        this.name = name;
        this.width = this.layout[0].length;
        this.height = this.layout.length;
        this.rotateable = rotateable;
    }

    addStructure (tiles) {
        let rdm = floor(random()*4);
        
        let rotatedLayout = this.layout;
        if (this.rotateable) {
            switch (rdm) {
                case 0:
                    break;
                case 1:
                    rotatedLayout.reverse();
                    break;
                case 2:
                    for (let n = 0; n < this.height; n++) {
                        rotatedLayout[n].reverse();
                    }
                    break;
                case 3:
                    rotatedLayout.reverse();
                    for (let n = 0; n < this.height; n++) {
                        rotatedLayout[n].reverse();
                    }
                    break;
            }
        }  


        let x = floor(random()*(chunkWidth-this.width));
        let y = floor(random()*(chunkHeight-this.height));

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (rotatedLayout[j][i] != 0) {
                    tiles[[i+x, j+y]] = rotatedLayout[j][i];
                }
            }
        }
        return tiles;
    }
}

let structureDictionary = {
    0: new structure("Stone ring", 10, [
        [0, 9, 15, 9, 0],
        [9, 0, 0, 0, 22],
        [15, 0, 15, 0, 15],
        [9, 0, 0, 0, 9],
        [0, 22, 15, 9, 0]
    ], true),
    1: new structure("Pyramid", 200, [
        [0, 0, 0, 41, 0, 0, 0],
        [0, 0, 17, 17, 17, 0, 0],
        [0, 17, 17, 17, 17, 17, 0],
        [17, 17, 17, 17, 17, 17, 17]
    ], false),
    2: new structure("Stone house", 10, [
        [15, 15, 15, 15, 15, 0, 0, 0],
        [15, 19, 19, 19, 22, 15, 22, 22],
        [22, 19, 19, 19, 19, 19, 19, 22],
        [15, 19, 19, 19, 19, 19, 19, 15],
        [15, 19, 19, 19, 19, 19, 19, 15],
        [22, 15, 15, 15, 22, 19, 19, 15],
        [0,  0,  0,  0,  15, 15, 19, 15]
    ], true),
    3: new structure("Ship", 10, [
        [0,  20, 20, 20, 20, 20,  0,  0,  0, 0],
        [20, 19, 19, 19, 19, 19, 20, 20,  0, 0],
        [20, 19, 19, 20, 19, 19, 19, 19, 19, 19],
        [20, 19, 19, 19, 19, 19, 20, 20, 0, 0],
        [0,  20, 20, 20, 20, 20,  0, 0,  0,  0]
    ], true),
    4: new structure("Castle", 10, [
        [16, 16, 16, 0,  0,  0,  0,   16, 16, 16],
        [16, 19, 16, 22, 16, 16, 16,  16, 19, 16],
        [16, 16, 16, 1,  1,  1,  1,   16, 22, 22],
        [0,  16, 1,  1,  1,  1,  1,   1,  22, 0 ],
        [0,  16, 1,  1,  21, 21, 1,   1,  16, 0 ],
        [0,  16, 1,  1,  21, 21, 1,   1,  16, 0 ],
        [0,  16, 1,  1,  1,  1,  1,   1,  22, 0 ],
        [16, 16, 16, 1,  1,  1,  1,   16, 16, 16],
        [22, 19, 16, 18, 19, 19, 18,  16, 19, 16],
        [16, 16, 16, 0,  19,  19,  0,   16, 22, 16]
        
    ], true),
    5: new structure("Oasis", 100, [
        [0,  4,  9,  0,  0,  21, 0,  0],
        [4,  3,  3,  21, 0,  4,  4,  0],
        [4,  3,  3,  3,  0,  3,  3,  4],
        [0,  4,  3,  3,  3,  3,  3,  3],
        [0,  0,  3,  3,  3,  3,  3,  3],
        [0,  0,  4,  4,  3,  3,  9,  0],
        [0,  21, 0,  4,  4,  4,  0,  0]
    ], true),
    6: new structure("Paraidse", 100, [
        [21, 0, 1, 1, 1, 1, 0, 21, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 3, 3, 3, 1, 1, 0],
        [1, 1, 3, 3, 9, 3, 3, 21,0],
        [1, 1, 3, 9, 22,3, 1, 1, 1],
        [1, 21, 3, 3, 3, 3, 1, 1, 1],
        [0, 1, 1, 3, 3, 1, 1, 0, 0],
        [0, 0, 1, 1, 21, 1, 0, 0, 0]
    ], true),
    7: new structure("Stone hedge", 5, [
        [15, 15, 15, 0, 0, 0, 0],
        [22, 0, 9, 0, 0, 15, 0],
        [9, 0, 22, 0, 0, 0, 0],
        [0, 0, 0, 0, 15, 15, 15],
        [0, 15, 0, 0, 22, 0, 22],
        [0, 9, 0, 0, 9, 0, 22]
    ], false),

    8: new structure("Camp sight", 10, [
        [0, 1, 1, 20, 1, 0],
        [1, 1, 20, 19, 20, 1],
        [1, 20, 19, 19, 19, 20],
        [1, 22, 1, 1, 3, 1],
        [22, 6, 22, 1, 3, 1],
        [1, 22, 1, 1, 21, 1],
        [0, 1, 1, 1, 1, 0]
    ]),
    9: new structure("Ruined building", 100, [
        [16, 16, 16, 0],
        [16, 0, 0, 0],
        [0, 0, 0, 16],
        [0, 40, 0, 0]
    ], true),

    10: new structure("Graveyard", 100, [
        [34, 0, 34, 0, 35, 0, 34],
        [2, 0, 2, 0, 2, 0, 38],
        [2, 0, 2, 0, 2, 0, 38]
    ], true),

    11: new structure("Marble structure", 50, [
        [28, 39, 39, 39, 28],
        [39, 30, 30, 30, 39],
        [39, 30, 29, 30, 39],
        [39, 30, 30, 30, 39],
        [28, 39, 0, 39, 28]
    ], true),

    12: new structure("Cursed pond", 100, [
        [0, 2,  2,  2,  0,  0,  0],
        [2, 31, 31, 31, 31, 2,  2],
        [2, 31, 31, 31, 31, 31, 31],
        [31, 31, 31, 31, 31, 31, 2],
        [2, 31, 31, 31, 31,  2, 0],
        [0, 2, 31, 31, 2,  2, 0],
        [0, 0, 2, 2, 0,  0, 0]
    ], true),

    13: new structure("Quicksand line", 100, [
        [0, 0, 0, 0, 8],
        [0, 0, 8, 8, 8],
        [0, 0, 0, 8, 8],
        [0, 0, 8, 8, 0],
        [0, 0, 8, 0, 0],
        [0, 8, 8, 0, 0],
        [8, 8, 0, 0, 8]
    ], true),

    14: new structure("Graveyard2", 100, [
        [34, 0, 37, 0, 34, 0, 35],
        [2, 0, 38, 0, 2, 0, 2],
        [2, 0, 38, 0, 2, 0, 2]
    ], true)
}
