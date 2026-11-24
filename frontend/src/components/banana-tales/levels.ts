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
// Level 1: First Steps (Scaffolded)
// Straight path to 1 banana. Teaches monkey.step(4). Optimal lines: 1.
// -------------------------------------------------------------
const level1Grid = createGrassGrid();
for (let c = 1; c <= 7; c++) level1Grid[3][c] = 'path';
level1Grid[1][2] = 'bush';
level1Grid[1][7] = 'bush';
level1Grid[5][2] = 'bush';
level1Grid[5][7] = 'bush';

// -------------------------------------------------------------
// Level 2: Around the Pond (Scaffolded)
// L-shaped path around water. Teaches monkey.turn("right") & chaining steps. Optimal lines: 3.
// -------------------------------------------------------------
const level2Grid = createGrassGrid();
for (let c = 2; c <= 5; c++) level2Grid[2][c] = 'path';
for (let r = 2; r <= 5; r++) level2Grid[r][5] = 'path';

level2Grid[3][2] = 'water';
level2Grid[3][3] = 'water';
level2Grid[3][4] = 'water';
level2Grid[4][2] = 'water';
level2Grid[4][3] = 'water';
level2Grid[4][4] = 'water';
level2Grid[5][3] = 'water';
level2Grid[5][4] = 'water';

level2Grid[1][1] = 'bush';
level2Grid[1][5] = 'bush';
level2Grid[2][6] = 'bush';
level2Grid[6][5] = 'bush';

// -------------------------------------------------------------
// Level 3: The Zig-Zag Harvest (Scaffolded)
// Repeating staircase pattern with 4 bananas. Starter code hints at for i in range(4):. Optimal lines: 5.
// -------------------------------------------------------------
const level3Grid = createGrassGrid();
level3Grid[1][1] = 'path';
level3Grid[1][2] = 'path';
level3Grid[2][2] = 'path';
level3Grid[2][3] = 'path';
level3Grid[3][3] = 'path';
level3Grid[3][4] = 'path';
level3Grid[4][4] = 'path';
level3Grid[4][5] = 'path';
level3Grid[5][5] = 'path';

level3Grid[0][2] = 'bush';
level3Grid[1][4] = 'bush';
level3Grid[2][5] = 'bush';
level3Grid[3][1] = 'bush';
level3Grid[4][2] = 'bush';
level3Grid[5][3] = 'bush';
level3Grid[6][6] = 'bush';

// -------------------------------------------------------------
// Level 4: Gap Across the River (Scaffolded)
// Water separates monkey from banana. Teaches bridge.extend(2) before monkey.step(4). Optimal lines: 2.
// -------------------------------------------------------------
const level4Grid = createGrassGrid();
for (let r = 0; r < 8; r++) {
  level4Grid[r][3] = 'water';
  level4Grid[r][4] = 'water';
}
level4Grid[1][3] = 'stone';
level4Grid[6][4] = 'stone';

level4Grid[3][1] = 'path';
level4Grid[3][2] = 'path';
level4Grid[3][5] = 'path';
level4Grid[3][6] = 'path';
level4Grid[3][7] = 'path';

level4Grid[2][1] = 'bush';
level4Grid[5][1] = 'bush';
level4Grid[2][6] = 'bush';
level4Grid[5][6] = 'bush';

// -------------------------------------------------------------
// Level 5: Jungle Gauntlet (Scaffolded)
// Combines a rock jump (monkey.jump()), bridge extension, and loop. Optimal lines: 6.
// -------------------------------------------------------------
const level5Grid = createGrassGrid();
for (let r = 0; r < 8; r++) {
  level5Grid[r][4] = 'water';
}
level5Grid[2][1] = 'path';
level5Grid[2][2] = 'stone'; // Boulder obstacle to jump!
level5Grid[2][3] = 'path';

level5Grid[2][5] = 'path';
level5Grid[3][5] = 'path';
level5Grid[3][6] = 'path';
level5Grid[4][6] = 'path';
level5Grid[4][7] = 'path';
level5Grid[5][7] = 'path';

level5Grid[1][1] = 'bush';
level5Grid[3][1] = 'bush';
level5Grid[1][3] = 'bush';
level5Grid[3][3] = 'bush';
level5Grid[1][6] = 'bush';
level5Grid[5][5] = 'bush';
level5Grid[6][7] = 'bush';

// -------------------------------------------------------------
// Level 6: The Twin Rivers (Scaffolded)
// Cross two separate rivers with turns between them. Optimal lines: 7.
// -------------------------------------------------------------
const level6Grid = createGrassGrid();
for (let r = 0; r < 8; r++) {
  level6Grid[r][3] = 'water'; // River 1
  level6Grid[r][6] = 'water'; // River 2
}
level6Grid[2][1] = 'path';
level6Grid[2][2] = 'path';
level6Grid[2][4] = 'path';
level6Grid[2][5] = 'path';
level6Grid[3][5] = 'path';
level6Grid[4][5] = 'path';
level6Grid[5][5] = 'path';
level6Grid[5][7] = 'path';
level6Grid[5][8] = 'path';

level6Grid[0][3] = 'stone';
level6Grid[7][6] = 'stone';
level6Grid[1][1] = 'bush';
level6Grid[3][1] = 'bush';
level6Grid[1][5] = 'bush';
level6Grid[6][5] = 'bush';
level6Grid[4][8] = 'bush';
level6Grid[6][8] = 'bush';

// -------------------------------------------------------------
// Level 7: The Orchard Square (Scaffolded - Final Guided Level)
// 4-sided square loop collecting 4 bananas on each corner. Optimal lines: 3.
// -------------------------------------------------------------
const level7Grid = createGrassGrid();
for (let c = 2; c <= 6; c++) {
  level7Grid[2][c] = 'path';
  level7Grid[6][c] = 'path';
}
for (let r = 2; r <= 6; r++) {
  level7Grid[r][2] = 'path';
  level7Grid[r][6] = 'path';
}
level7Grid[3][3] = 'water';
level7Grid[3][4] = 'water';
level7Grid[4][3] = 'water';
level7Grid[4][4] = 'water';
level7Grid[1][1] = 'bush';
level7Grid[1][7] = 'bush';
level7Grid[7][1] = 'bush';
level7Grid[7][7] = 'bush';

// =============================================================
// AFTER STAGE 7: PRO CODER MODE (NO PREWRITTEN CODE)
// The kids must write their own Python code from scratch!
// =============================================================

// -------------------------------------------------------------
// Level 8: The Great Chasm (PRO CODER MODE - No Prewritten Code)
// 3-tile wide river gap. Player must build 3 wooden planks and steer to bananas. Optimal lines: 4.
// -------------------------------------------------------------
const level8Grid = createGrassGrid();
for (let r = 0; r < 8; r++) {
  level8Grid[r][3] = 'water';
  level8Grid[r][4] = 'water';
  level8Grid[r][5] = 'water';
}
level8Grid[3][1] = 'path';
level8Grid[3][2] = 'path';
level8Grid[3][6] = 'path';
level8Grid[3][7] = 'path';
level8Grid[4][7] = 'path';
level8Grid[5][7] = 'path';

level8Grid[0][4] = 'stone';
level8Grid[7][4] = 'stone';
level8Grid[1][2] = 'bush';
level8Grid[5][2] = 'bush';
level8Grid[1][7] = 'bush';
level8Grid[6][7] = 'bush';

// -------------------------------------------------------------
// Level 9: Boulder Leap & River Sprint (PRO CODER MODE - No Prewritten Code)
// Jump over a boulder obstacle, turn towards river, build bridge and grab bananas. Optimal lines: 5.
// -------------------------------------------------------------
const level9Grid = createGrassGrid();
level9Grid[4][1] = 'path';
level9Grid[4][2] = 'path';
level9Grid[4][3] = 'stone'; // Boulder to jump!
level9Grid[4][4] = 'path';
level9Grid[3][4] = 'path';
level9Grid[2][4] = 'water';
level9Grid[1][4] = 'water';
level9Grid[0][4] = 'path'; // Far island

for (let c = 2; c <= 7; c++) {
  level9Grid[2][c] = 'water';
}
level9Grid[5][1] = 'bush';
level9Grid[5][4] = 'bush';
level9Grid[3][2] = 'bush';
level9Grid[0][2] = 'bush';
level9Grid[0][6] = 'bush';

// -------------------------------------------------------------
// Level 10: The Spiral Grove (PRO CODER MODE - No Prewritten Code)
// Winding spiral path into the center of the grove with 5 bananas. Optimal lines: 6.
// -------------------------------------------------------------
const level10Grid = createGrassGrid();
for (let c = 1; c <= 8; c++) level10Grid[1][c] = 'path'; // Top run: (1,1) to (8,1)
for (let r = 1; r <= 6; r++) level10Grid[r][8] = 'path'; // Right run: (8,1) to (8,6)
for (let c = 8; c >= 2; c--) level10Grid[6][c] = 'path'; // Bottom run: (8,6) to (2,6)
for (let r = 6; r >= 3; r--) level10Grid[r][2] = 'path'; // Left run: (2,6) to (2,3)
for (let c = 2; c <= 5; c++) level10Grid[3][c] = 'path'; // Inner run: (2,3) to (5,3)

level10Grid[4][4] = 'bush';
level10Grid[4][5] = 'bush';
level10Grid[0][0] = 'bush';
level10Grid[0][9] = 'bush';
level10Grid[7][0] = 'bush';
level10Grid[7][9] = 'bush';

// -------------------------------------------------------------
// Level 11: Island Hop & Leap (PRO CODER MODE - No Prewritten Code)
// Multi-island traverse with water gap, stone boulder, and second water gap. Optimal lines: 5.
// -------------------------------------------------------------
const level11Grid = createGrassGrid();
for (let r = 0; r < 8; r++) {
  level11Grid[r][3] = 'water';
  level11Grid[r][7] = 'water';
}
level11Grid[3][1] = 'path';
level11Grid[3][2] = 'path';
level11Grid[3][4] = 'path'; // Island 1
level11Grid[3][5] = 'stone'; // Boulder to leap!
level11Grid[3][6] = 'path'; // Island 2
level11Grid[3][8] = 'path'; // Island 3

level11Grid[2][1] = 'bush';
level11Grid[4][1] = 'bush';
level11Grid[2][4] = 'bush';
level11Grid[4][4] = 'bush';
level11Grid[2][8] = 'bush';
level11Grid[4][8] = 'bush';

// -------------------------------------------------------------
// Level 12: Grand Jungle Champion (MASTER CHALLENGE - No Prewritten Code)
// The ultimate test combining bridges, jumps, turns, and loops to collect 4 bananas! Optimal lines: 6.
// -------------------------------------------------------------
const level12Grid = createGrassGrid();
level12Grid[1][1] = 'path';
level12Grid[1][2] = 'path';
level12Grid[1][3] = 'water'; // Water chasm
level12Grid[1][4] = 'path';
level12Grid[1][5] = 'stone'; // Boulder to jump!
level12Grid[1][6] = 'path';
level12Grid[1][7] = 'path'; // Banana 1

for (let r = 2; r <= 5; r++) level12Grid[r][7] = 'path'; // Banana 2 at (7,5)

level12Grid[5][6] = 'path';
level12Grid[5][5] = 'water'; // Water chasm 2
level12Grid[5][4] = 'path';
level12Grid[5][3] = 'path';
level12Grid[5][2] = 'path'; // Banana 3 at (2,5)

level12Grid[4][2] = 'path';
level12Grid[3][2] = 'path'; // Banana 4 at (2,3)

level12Grid[0][3] = 'stone';
level12Grid[6][5] = 'stone';
level12Grid[0][1] = 'bush';
level12Grid[0][7] = 'bush';
level12Grid[6][2] = 'bush';
level12Grid[6][7] = 'bush';
level12Grid[3][4] = 'bush';

// -------------------------------------------------------------
// Complete Banana Tales Curriculum (12 Levels)
// -------------------------------------------------------------
export const BANANA_LEVELS: BananaLevel[] = [
  // --- Guided Stages 1 to 7 (Scaffolded starter code) ---
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
  },
  {
    id: 6,
    title: 'Level 6: The Twin Rivers',
    subtitle: 'Multi-River Navigation',
    optimalLines: 7,
    starterCode: `# Level 6: The Twin Rivers
# Cross River 1, turn down to the lower path, then cross River 2!
bridge.extend(1)
monkey.step(3)
monkey.turn("right")
monkey.step(3)
monkey.turn("left")
bridge.extend(1)
monkey.step(3)
`,
    grid: level6Grid,
    monkeyStart: { x: 2, y: 2, dir: 'right' },
    bananas: [
      { id: 'b6-1', x: 5, y: 2 },
      { id: 'b6-2', x: 8, y: 5 }
    ],
    hint: 'Extend 1 bridge to cross River 1, take 3 steps to the first banana, turn right, step 3 down, turn left, extend 1 bridge, and step 3 to the second banana!'
  },
  {
    id: 7,
    title: 'Level 7: The Orchard Square',
    subtitle: 'Perimeter Loop Mastery',
    optimalLines: 3,
    starterCode: `# Level 7: The Orchard Square
# Use a Python for-loop to patrol all 4 sides of the square orchard!
for i in range(4):
    monkey.step(4)
    monkey.turn("right")
`,
    grid: level7Grid,
    monkeyStart: { x: 2, y: 2, dir: 'right' },
    bananas: [
      { id: 'b7-1', x: 6, y: 2 },
      { id: 'b7-2', x: 6, y: 6 },
      { id: 'b7-3', x: 2, y: 6 },
      { id: 'b7-4', x: 2, y: 3 }
    ],
    hint: 'A square has 4 equal sides of length 4. A loop for i in range(4): with monkey.step(4) and monkey.turn("right") sweeps all 4 corners!'
  },

  // --- STAGES AFTER STAGE 7: PRO CODER MODE (NO PREWRITTEN CODE) ---
  {
    id: 8,
    title: 'Level 8: The Great Chasm',
    subtitle: '⭐ Pro Coder Challenge (Self-Coded)',
    optimalLines: 4,
    starterCode: `# Level 8: The Great Chasm [PRO CODER MODE]
# MISSION: Build a 3-plank wooden bridge across the wide river,
# then walk across and turn right to collect both golden bananas!
# (Type your own Python code below):

`,
    grid: level8Grid,
    monkeyStart: { x: 2, y: 3, dir: 'right' },
    bananas: [
      { id: 'b8-1', x: 6, y: 3 },
      { id: 'b8-2', x: 7, y: 5 }
    ],
    hint: 'Build 3 bridge planks with bridge.extend(3), step forward 5 tiles with monkey.step(5) to grab banana 1 and reach the corner, turn right with monkey.turn("right"), and step 2 down with monkey.step(2)!'
  },
  {
    id: 9,
    title: 'Level 9: Boulder Leap & River Sprint',
    subtitle: '⭐ Pro Coder Challenge (Self-Coded)',
    optimalLines: 5,
    starterCode: `# Level 9: Boulder Leap & River Sprint [PRO CODER MODE]
# MISSION: Jump over the boulder to grab the first banana,
# turn towards the river, build a 2-tile bridge, and reach the second!
# (Type your own Python code below):

`,
    grid: level9Grid,
    monkeyStart: { x: 1, y: 4, dir: 'right' },
    bananas: [
      { id: 'b9-1', x: 4, y: 4 },
      { id: 'b9-2', x: 0, y: 4 }
    ],
    hint: 'Step 1 forward, leap over the rock with monkey.jump(), turn left to face up, extend 2 bridge planks with bridge.extend(2), and step 3 to the island!'
  },
  {
    id: 10,
    title: 'Level 10: The Spiral Grove',
    subtitle: '⭐ Pro Coder Challenge (Self-Coded)',
    optimalLines: 6,
    starterCode: `# Level 10: The Spiral Grove [PRO CODER MODE]
# MISSION: Navigate the winding spiral path into the heart of the grove
# to harvest all 5 golden bananas!
# (Type your own Python code below):

`,
    grid: level10Grid,
    monkeyStart: { x: 1, y: 1, dir: 'right' },
    bananas: [
      { id: 'b10-1', x: 8, y: 1 },
      { id: 'b10-2', x: 8, y: 6 },
      { id: 'b10-3', x: 2, y: 6 },
      { id: 'b10-4', x: 2, y: 3 },
      { id: 'b10-5', x: 5, y: 3 }
    ],
    hint: 'Follow the spiral winding inwards: step 7 & turn right, step 5 & turn right, step 6 & turn right, step 3 & turn right, step 3!'
  },
  {
    id: 11,
    title: 'Level 11: Island Hop & Leap',
    subtitle: '⭐ Pro Coder Challenge (Self-Coded)',
    optimalLines: 5,
    starterCode: `# Level 11: Island Hop & Leap [PRO CODER MODE]
# MISSION: Bridge the water, leap over the rock to the next island,
# bridge the second river, and reach the final banana!
# (Type your own Python code below):

`,
    grid: level11Grid,
    monkeyStart: { x: 1, y: 3, dir: 'right' },
    bananas: [
      { id: 'b11-1', x: 4, y: 3 },
      { id: 'b11-2', x: 8, y: 3 }
    ],
    hint: 'Bridge the first river with bridge.extend(1), step 2 to island 1, leap over the boulder with monkey.jump(), extend 1 bridge, and step 2 to the end!'
  },
  {
    id: 12,
    title: 'Level 12: Grand Jungle Champion',
    subtitle: '👑 Master Challenge (Self-Coded)',
    optimalLines: 6,
    starterCode: `# Level 12: Grand Jungle Champion [MASTER CHALLENGE]
# MISSION: Conquer the entire jungle kingdom! Collect all 4 golden bananas
# by combining bridges, jumps, loops, and turns!
# (Type your own Python code below):

`,
    grid: level12Grid,
    monkeyStart: { x: 1, y: 1, dir: 'right' },
    bananas: [
      { id: 'b12-1', x: 7, y: 1 },
      { id: 'b12-2', x: 7, y: 5 },
      { id: 'b12-3', x: 2, y: 5 },
      { id: 'b12-4', x: 2, y: 3 }
    ],
    hint: 'Use everything you learned! Step 1, bridge.extend(1), step 2, monkey.jump(), step 2 (banana 1), turn right, step 4 (banana 2), turn right, step 2, bridge.extend(1), step 3 (banana 3), turn right, step 2 (banana 4)!'
  }
];
