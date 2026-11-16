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
// Straight path to 1 banana. Teaches monkey.step(4). Optimal lines: 1.
// -------------------------------------------------------------
const level1Grid = createGrassGrid();
for (let c = 1; c <= 7; c++) level1Grid[3][c] = 'path';
level1Grid[1][2] = 'bush';
level1Grid[1][7] = 'bush';
level1Grid[5][2] = 'bush';
level1Grid[5][7] = 'bush';

// -------------------------------------------------------------
// Level 2: Around the Pond
// L-shaped path around water. Teaches monkey.turn("right") & chaining steps. Optimal lines: 3.
// -------------------------------------------------------------
const level2Grid = createGrassGrid();
// Path: (2,2) -> (5,2) -> (5,5)
for (let c = 2; c <= 5; c++) level2Grid[2][c] = 'path';
for (let r = 2; r <= 5; r++) level2Grid[r][5] = 'path';

// Water pond nestled in the bend
level2Grid[3][2] = 'water';
level2Grid[3][3] = 'water';
level2Grid[3][4] = 'water';
level2Grid[4][2] = 'water';
level2Grid[4][3] = 'water';
level2Grid[4][4] = 'water';
level2Grid[5][3] = 'water';
level2Grid[5][4] = 'water';

// Bushes framing the pond
level2Grid[1][1] = 'bush';
level2Grid[1][5] = 'bush';
level2Grid[2][6] = 'bush';
level2Grid[6][5] = 'bush';

// -------------------------------------------------------------
// Level 3: The Zig-Zag Harvest
// Repeating staircase pattern with 4 bananas. Starter code hints at for i in range(4):. Optimal lines: 5.
// -------------------------------------------------------------
const level3Grid = createGrassGrid();
// Staircase path
level3Grid[1][1] = 'path';
level3Grid[1][2] = 'path';
level3Grid[2][2] = 'path';
level3Grid[2][3] = 'path';
level3Grid[3][3] = 'path';
level3Grid[3][4] = 'path';
level3Grid[4][4] = 'path';
level3Grid[4][5] = 'path';
level3Grid[5][5] = 'path';

// Bushes along the diagonals
level3Grid[0][2] = 'bush';
level3Grid[1][4] = 'bush';
level3Grid[2][5] = 'bush';
level3Grid[3][1] = 'bush';
level3Grid[4][2] = 'bush';
level3Grid[5][3] = 'bush';
level3Grid[6][6] = 'bush';

// -------------------------------------------------------------
// Level 4: Gap Across the River
// Water separates the monkey from the banana. Teaches using two objects: bridge.extend(2) before monkey.step(4). Optimal lines: 2.
// -------------------------------------------------------------
const level4Grid = createGrassGrid();
// River down columns 3 and 4
for (let r = 0; r < 8; r++) {
  level4Grid[r][3] = 'water';
  level4Grid[r][4] = 'water';
}
// Stepping stones in the upper and lower river
level4Grid[1][3] = 'stone';
level4Grid[6][4] = 'stone';

// West bank path
level4Grid[3][1] = 'path';
level4Grid[3][2] = 'path';

// Water gap at (3,3) and (4,3) waiting for bridge.extend(2)!

// East bank path
level4Grid[3][5] = 'path';
level4Grid[3][6] = 'path';
level4Grid[3][7] = 'path';

// Decorative bank bushes
level4Grid[2][1] = 'bush';
level4Grid[5][1] = 'bush';
level4Grid[2][6] = 'bush';
level4Grid[5][6] = 'bush';

// -------------------------------------------------------------
// Level 5: Jungle Gauntlet
// Combines a rock jump (monkey.jump()), a bridge extension, and a for loop to collect 3 bananas. Optimal lines: 6.
// -------------------------------------------------------------
const level5Grid = createGrassGrid();
// River across col 4
for (let r = 0; r < 8; r++) {
  level5Grid[r][4] = 'water';
}

// West bank: Start at (1,2), rock obstacle at (2,2), landing path at (3,2)
level5Grid[2][1] = 'path';
level5Grid[2][2] = 'stone'; // Rock obstacle to jump over!
level5Grid[2][3] = 'path';

// Water gap at (4,2) waiting for bridge.extend(1)!

// East bank: Path with 3 bananas across loop
level5Grid[2][5] = 'path';
level5Grid[3][5] = 'path';
level5Grid[3][6] = 'path';
level5Grid[4][6] = 'path';
level5Grid[4][7] = 'path';
level5Grid[5][7] = 'path';

// Obstacles
level5Grid[1][1] = 'bush';
level5Grid[3][1] = 'bush';
level5Grid[1][3] = 'bush';
level5Grid[3][3] = 'bush';
level5Grid[1][6] = 'bush';
level5Grid[5][5] = 'bush';
level5Grid[6][7] = 'bush';

// -------------------------------------------------------------
// Levels Configuration Array
// -------------------------------------------------------------
export const BANANA_LEVELS: BananaLevel[] = [
  {
    id: 1,
    title: 'Level 1: First Steps',
    subtitle: 'Straight Path Movement',
    optimalLines: 1,
    starterCode: `# Level 1: First Steps
# Help our monkey friend step forward to reach the golden banana!
monkey.step(4)
`,
    grid: level1Grid,
    monkeyStart: { x: 1, y: 3, dir: 'right' },
    bananas: [{ id: 'b1-1', x: 5, y: 3 }],
    hint: 'Use monkey.step(4) to walk 4 tiles forward along the dirt path and grab the banana!'
  },
  {
    id: 2,
    title: 'Level 2: Around the Pond',
    subtitle: 'Turning & Steering',
    optimalLines: 3,
    starterCode: `# Level 2: Around the Pond
# Walk to the first banana, turn right, and step to the second!
monkey.step(3)
monkey.turn("right")
monkey.step(3)
`,
    grid: level2Grid,
    monkeyStart: { x: 2, y: 2, dir: 'right' },
    bananas: [
      { id: 'b2-1', x: 5, y: 2 },
      { id: 'b2-2', x: 5, y: 5 }
    ],
    hint: 'Take 3 steps forward to collect the first banana, turn right to face down, then take 3 steps forward!'
  },
  {
    id: 3,
    title: 'Level 3: The Zig-Zag Harvest',
    subtitle: 'Staircase Loops',
    optimalLines: 5,
    starterCode: `# Level 3: The Zig-Zag Harvest
# Use a Python for-loop to harvest all 4 bananas in a staircase!
for i in range(4):
    monkey.step(1)
    monkey.turn("right")
    monkey.step(1)
    monkey.turn("left")
`,
    grid: level3Grid,
    monkeyStart: { x: 1, y: 1, dir: 'right' },
    bananas: [
      { id: 'b3-1', x: 2, y: 1 },
      { id: 'b3-2', x: 3, y: 2 },
      { id: 'b3-3', x: 4, y: 3 },
      { id: 'b3-4', x: 5, y: 4 }
    ],
    hint: 'Notice the repeating pattern: step 1, turn right, step 1, turn left. A loop for i in range(4): collects all 4 bananas!'
  },
  {
    id: 4,
    title: 'Level 4: Gap Across the River',
    subtitle: 'Two Objects: Bridge & Monkey',
    optimalLines: 2,
    starterCode: `# Level 4: Gap Across the River
# Build 2 wooden bridge planks across the river, then step forward!
bridge.extend(2)
monkey.step(4)
`,
    grid: level4Grid,
    monkeyStart: { x: 2, y: 3, dir: 'right' },
    bananas: [{ id: 'b4-1', x: 6, y: 3 }],
    hint: 'Monkeys cannot swim in deep water! First extend the bridge 2 tiles with bridge.extend(2), then take 4 steps forward!'
  },
  {
    id: 5,
    title: 'Level 5: Jungle Gauntlet',
    subtitle: 'Jumps, Bridges & Loops',
    optimalLines: 6,
    starterCode: `# Level 5: Jungle Gauntlet
# Jump over the rock, build the bridge, and loop to collect 3 bananas!
monkey.jump()
bridge.extend(1)
monkey.step(1)
for i in range(3):
    monkey.step(1)
    monkey.turn("right")
`,
    grid: level5Grid,
    monkeyStart: { x: 1, y: 2, dir: 'right' },
    bananas: [
      { id: 'b5-1', x: 5, y: 2 },
      { id: 'b5-2', x: 6, y: 3 },
      { id: 'b5-3', x: 7, y: 4 }
    ],
    hint: 'Use monkey.jump() to clear the 1-tile rock, bridge.extend(1) to cross the water, monkey.step(1), and a 3-step loop to harvest the bananas!'
  }
];
