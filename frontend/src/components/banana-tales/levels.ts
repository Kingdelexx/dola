import { BananaLevel, TileType } from './types';

// Helper to create an 8x10 grass grid
function createGrassGrid(): TileType[][] {
  const grid: TileType[][] = [];
  for (let r = 0; r < 8; r++) {
    const row: TileType[] = [];
    for (let c = 0; c < 10; c++) {
      row.push('grass');
    }
    grid.push(row);
  }
  return grid;
}

// -------------------------------------------------------------
// Level 1: First Steps
// -------------------------------------------------------------
const level1Grid = createGrassGrid();
for (let c = 1; c <= 7; c++) level1Grid[3][c] = 'path';
level1Grid[1][2] = 'bush';
level1Grid[1][7] = 'bush';
level1Grid[5][3] = 'bush';
level1Grid[5][6] = 'bush';

// -------------------------------------------------------------
// Level 2: The Forest Bend
// -------------------------------------------------------------
const level2Grid = createGrassGrid();
for (let c = 2; c <= 5; c++) level2Grid[2][c] = 'path';
for (let r = 2; r <= 5; r++) level2Grid[r][5] = 'path';

level2Grid[1][3] = 'bush';
level2Grid[3][3] = 'bush';
level2Grid[3][4] = 'bush';
level2Grid[2][6] = 'bush';
level2Grid[4][6] = 'bush';
level2Grid[6][4] = 'bush';

// -------------------------------------------------------------
// Level 3: The Broken Bridge (Build Planks)
// -------------------------------------------------------------
const level3Grid = createGrassGrid();
// River down col 4 and 5
for (let r = 0; r < 8; r++) {
  level3Grid[r][4] = 'water';
  level3Grid[r][5] = 'water';
}
// River stepping stones at row 1 and row 6
level3Grid[1][4] = 'stone';
level3Grid[6][5] = 'stone';

// Path on west bank
for (let c = 1; c <= 3; c++) level3Grid[3][c] = 'path';
// Water gap at (4,3) and (5,3) that needs bridge.extend(2)!
// Path on east bank
for (let c = 6; c <= 8; c++) level3Grid[3][c] = 'path';

// Bushes
level3Grid[2][2] = 'bush';
level3Grid[5][2] = 'bush';
level3Grid[2][7] = 'bush';
level3Grid[5][7] = 'bush';

// -------------------------------------------------------------
// Level 4: Loop Island (The Power of Loops)
// -------------------------------------------------------------
const level4Grid = createGrassGrid();
for (let c = 1; c <= 8; c++) {
  level4Grid[4][c] = 'path';
}
for (let c = 0; c < 10; c++) {
  level4Grid[1][c] = 'water';
  level4Grid[6][c] = 'water';
}
level4Grid[1][4] = 'stone';
level4Grid[6][5] = 'stone';

level4Grid[3][2] = 'bush';
level4Grid[3][4] = 'bush';
level4Grid[3][6] = 'bush';
level4Grid[5][3] = 'bush';
level4Grid[5][5] = 'bush';
level4Grid[5][7] = 'bush';

// -------------------------------------------------------------
// Level 5: Grand Jungle Archipelago
// -------------------------------------------------------------
const level5Grid = createGrassGrid();
// River 1 down col 3
for (let r = 0; r < 8; r++) level5Grid[r][3] = 'water';
// River 2 down col 7
for (let r = 0; r < 8; r++) level5Grid[r][7] = 'water';

// Pre-existing bridge on River 2
level5Grid[5][7] = 'bridge_h';

// River 1 has a water gap at (3,2) waiting for bridge.extend(1)!

// Paths
for (let c = 1; c <= 5; c++) level5Grid[2][c] = 'path';
for (let r = 2; r <= 5; r++) level5Grid[r][5] = 'path';
for (let c = 5; c <= 8; c++) level5Grid[5][c] = 'path';

// River stones
level5Grid[0][3] = 'stone';
level5Grid[6][3] = 'stone';
level5Grid[1][7] = 'stone';
level5Grid[7][7] = 'stone';

// Bushes
level5Grid[1][1] = 'bush';
level5Grid[3][1] = 'bush';
level5Grid[1][5] = 'bush';
level5Grid[4][4] = 'bush';
level5Grid[6][6] = 'bush';

// -------------------------------------------------------------
// Levels Array
// -------------------------------------------------------------
export const BANANA_LEVELS: BananaLevel[] = [
  {
    id: 1,
    title: 'Level 1: First Steps',
    subtitle: 'Sequencing & Movement',
    optimalLines: 1,
    starterCode: `# Level 1: Step forward to reach the golden banana!
monkey.step(4)
`,
    grid: level1Grid,
    monkeyStart: { x: 1, y: 3, dir: 'right' },
    bananas: [{ id: 'b1-1', x: 5, y: 3 }],
    hint: 'Use monkey.step(4) to walk straight along the dirt path and collect the golden banana!'
  },
  {
    id: 2,
    title: 'Level 2: The Forest Bend',
    subtitle: 'Turning & Steering',
    optimalLines: 3,
    starterCode: `# Level 2: Walk to the first banana, then turn!
monkey.step(3)
monkey.turn("down")
monkey.step(3)
`,
    grid: level2Grid,
    monkeyStart: { x: 2, y: 2, dir: 'right' },
    bananas: [
      { id: 'b2-1', x: 5, y: 2 },
      { id: 'b2-2', x: 5, y: 5 }
    ],
    hint: 'Walk 3 steps forward to collect the first banana, turn down, and take 3 steps to the second banana!'
  },
  {
    id: 3,
    title: 'Level 3: The Broken Bridge',
    subtitle: 'Building Wooden Planks',
    optimalLines: 3,
    starterCode: `# Level 3: Walk to the river and extend the bridge!
monkey.step(2)
bridge.extend(2)
monkey.step(4)
`,
    grid: level3Grid,
    monkeyStart: { x: 1, y: 3, dir: 'right' },
    bananas: [{ id: 'b3-1', x: 7, y: 3 }],
    hint: 'Monkeys can not swim in deep water! Walk 2 steps to the bank, use bridge.extend(2) to lay wooden planks, then cross over!'
  },
  {
    id: 4,
    title: 'Level 4: Loop Island',
    subtitle: 'Python For-Loops',
    optimalLines: 2,
    starterCode: `# Level 4: Collect all 3 bananas with a loop!
for i in range(3):
    monkey.step(2)
`,
    grid: level4Grid,
    monkeyStart: { x: 1, y: 4, dir: 'right' },
    bananas: [
      { id: 'b4-1', x: 3, y: 4 },
      { id: 'b4-2', x: 5, y: 4 },
      { id: 'b4-3', x: 7, y: 4 }
    ],
    hint: 'Each banana is 2 steps away! A loop for i in range(3): repeats your step command 3 times in just 2 lines!'
  },
  {
    id: 5,
    title: 'Level 5: Grand Archipelago',
    subtitle: 'Master Jungle Challenge',
    optimalLines: 7,
    starterCode: `# Level 5: Build bridges, turn, and navigate the archipelago!
monkey.step(1)
bridge.extend(1)
monkey.step(3)
monkey.turn("down")
monkey.step(3)
monkey.turn("right")
monkey.step(3)
`,
    grid: level5Grid,
    monkeyStart: { x: 1, y: 2, dir: 'right' },
    bananas: [
      { id: 'b5-1', x: 5, y: 2 },
      { id: 'b5-2', x: 5, y: 5 },
      { id: 'b5-3', x: 8, y: 5 }
    ],
    hint: 'Step 1 tile, extend the wooden bridge across the river, walk to banana 1, turn down to banana 2, and cross bridge 2 to banana 3!'
  }
];
