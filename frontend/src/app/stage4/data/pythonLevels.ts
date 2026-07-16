export interface PythonLevel {
  id: string;
  chapter: number;
  levelNum: number;
  chapterTitle: string;
  title: string;
  narrative: string;
  instructions: string;
  type: 'scaffold' | 'typing' | 'sandbox';
  starterCode: string;
  solutionKeywords: string[];
  forbiddenKeywords?: string[];
  hints: string[];
  xpReward: number;
  isBoss?: boolean;
  visualSetup: {
    scene: 'forest' | 'cave' | 'garden' | 'castle';
    hero: { x: number; y: number; dir: 'right' | 'left' };
    targets: { id: string; type: 'chest' | 'goblin' | 'gem' | 'gate' | 'potion' | 'flower' | 'dragon'; x: number; y: number; collected?: boolean }[];
  };
  testCases: {
    assertPython: string; // Python script to append and run to check results
    expectedStdout?: string;
  }[];
  scaffoldSnippets?: string[]; // Parsons-style block hints for dragging/clicking
}

export const pythonLevels: PythonLevel[] = [
  // CHAPTER 1: PRINT & STRINGS
  {
    id: 'ch1_l1',
    chapter: 1,
    levelNum: 1,
    chapterTitle: 'Dialogue & Print Spell',
    title: 'The Magic Voice 🗣️',
    narrative: 'Welcome to Python Valley! Rover the Robo-Guide is standing before the Ancient Gate. To unlock it, you must cast the "Print Spell" and shout the magic password to the gate keeper.',
    instructions: 'Use the `print()` statement to output the password: `"Open Sesame!"` (make sure to match capital letters and quotes exactly).',
    type: 'scaffold',
    starterCode: '# Cast your print spell below!\n',
    solutionKeywords: ['print', 'Open Sesame!'],
    hints: [
      'Type print("Open Sesame!") in the editor.',
      'Make sure you put the password inside double quotes inside the parentheses!',
      'Check that it is spelled exactly: "Open Sesame!"'
    ],
    xpReward: 50,
    visualSetup: {
      scene: 'forest',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'gate1', type: 'gate', x: 80, y: 50 }]
    },
    testCases: [
      {
        assertPython: '',
        expectedStdout: 'Open Sesame!'
      }
    ],
    scaffoldSnippets: ['print("Open Sesame!")', 'print()', '"Open Sesame!"']
  },
  // CHAPTER 2: VARIABLES
  {
    id: 'ch2_l1',
    chapter: 2,
    levelNum: 1,
    chapterTitle: 'Variables & Inventories',
    title: 'Equipping Your Stats 🛡️',
    narrative: 'To prepare for the quest ahead, you need to store your stats in Python memory! Let\'s create variables for your health points and gold.',
    instructions: 'Create a variable named `hp` and set it to `100`. Then, create a variable named `gold` and set it to `50`. Finally, print both.',
    type: 'scaffold',
    starterCode: '# Define your stats here!\n',
    solutionKeywords: ['hp', 'gold', 'print'],
    hints: [
      'To make a variable: hp = 100',
      'Then make: gold = 50',
      'At the bottom, use: print(hp) and print(gold)'
    ],
    xpReward: 50,
    visualSetup: {
      scene: 'forest',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'chest1', type: 'chest', x: 50, y: 50 }]
    },
    testCases: [
      {
        assertPython: 'assert hp == 100, "HP must be 100!"\nassert gold == 50, "Gold must be 50!"\nprint("hp_ok")'
      }
    ],
    scaffoldSnippets: ['hp = 100', 'gold = 50', 'print(hp)', 'print(gold)']
  },
  // CHAPTER 3: CONDITIONALS
  {
    id: 'ch3_l1',
    chapter: 3,
    levelNum: 1,
    chapterTitle: 'Conditionals & Quest Choices',
    title: 'The Potion Check 🧪',
    narrative: 'A sneaky Goblin stands in your path! To pass, you must decide whether to drink your healing potion. You should only drink it if your health is low.',
    instructions: 'Create a variable `hp` set to `40`. Write an `if` statement: if `hp < 50`, print `"drink"`, otherwise print `"fight"`.',
    type: 'typing',
    starterCode: '# Goblin checkpoint! Set hp and write conditional\nhp = 40\n',
    solutionKeywords: ['if', 'hp', 'print', 'else'],
    hints: [
      'Write: if hp < 50:',
      'Indent the next line: print("drink")',
      'Write: else:',
      'Indent the next line: print("fight")'
    ],
    xpReward: 60,
    visualSetup: {
      scene: 'cave',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'goblin1', type: 'goblin', x: 70, y: 50 }]
    },
    testCases: [
      {
        assertPython: 'assert "drink" in sys.stdout.getvalue().lower(), "Make sure you print \'drink\' when HP is below 50!"'
      }
    ]
  },
  // CHAPTER 4: LOOPS
  {
    id: 'ch4_l1',
    chapter: 4,
    levelNum: 1,
    chapterTitle: 'Loops & Casting Spells',
    title: 'The Gem Miner ⛏️',
    narrative: 'You have entered a magical cavern rich with sparkling emeralds! Instead of picking them up one by one, use a loop spell to walk forward and collect 5 gems.',
    instructions: 'Use a `for` loop with `range(5)` to call `print("collect")` five times, which commands the hero to mine all 5 gems.',
    type: 'typing',
    starterCode: '# Write a loop to mine 5 gems!\n',
    solutionKeywords: ['for', 'in', 'range', 'print', 'collect'],
    hints: [
      'Write: for i in range(5):',
      'Inside the loop (indented), type: print("collect")'
    ],
    xpReward: 60,
    visualSetup: {
      scene: 'cave',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [
        { id: 'gem1', type: 'gem', x: 30, y: 50 },
        { id: 'gem2', type: 'gem', x: 40, y: 50 },
        { id: 'gem3', type: 'gem', x: 50, y: 50 },
        { id: 'gem4', type: 'gem', x: 60, y: 50 },
        { id: 'gem5', type: 'gem', x: 70, y: 50 }
      ]
    },
    testCases: [
      {
        assertPython: 'assert sys.stdout.getvalue().count("collect") >= 5, "You must print \'collect\' at least 5 times using a loop!"'
      }
    ]
  },
  // CHAPTER 5: LISTS
  {
    id: 'ch5_l1',
    chapter: 5,
    levelNum: 1,
    chapterTitle: 'Lists & Inventory Bags',
    title: 'The Loot Bag 🎒',
    narrative: 'Let\'s organize your backpack. You found a magical pouch that holds multiple items. Python calls this a List!',
    instructions: 'Create a list variable named `bag` containing three strings: `"sword"`, `"shield"`, and `"potion"`. Then print the list.',
    type: 'typing',
    starterCode: '# Create and print your bag list!\n',
    solutionKeywords: ['bag', 'sword', 'shield', 'potion', 'print'],
    hints: [
      'Define it like: bag = ["sword", "shield", "potion"]',
      'Then print: print(bag)'
    ],
    xpReward: 70,
    visualSetup: {
      scene: 'garden',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'potion1', type: 'potion', x: 50, y: 50 }]
    },
    testCases: [
      {
        assertPython: 'assert isinstance(bag, list), "bag must be a list!"\nassert "sword" in bag and "shield" in bag, "Your bag is missing equipment!"'
      }
    ]
  },
  // CHAPTER 6: FUNCTIONS
  {
    id: 'ch6_l1',
    chapter: 6,
    levelNum: 1,
    chapterTitle: 'Functions & Spellbooks',
    title: 'Casting Fireballs 🔥',
    narrative: 'A grand Wizard wants to teach you a reusable Fireball spell. Instead of writing the spell commands repeatedly, pack them in a custom Function!',
    instructions: 'Define a function named `cast_fireball` that prints `"fireball!"`. Then call your function once to fire the spell.',
    type: 'typing',
    starterCode: '# Define and call cast_fireball\n',
    solutionKeywords: ['def', 'cast_fireball', 'print'],
    hints: [
      'Define the function: def cast_fireball():',
      'Indent the print statement: print("fireball!")',
      'Call the function below (not indented): cast_fireball()'
    ],
    xpReward: 70,
    visualSetup: {
      scene: 'garden',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'goblin2', type: 'goblin', x: 60, y: 50 }]
    },
    testCases: [
      {
        assertPython: 'assert callable(cast_fireball), "You must define cast_fireball as a function!"\nassert "fireball!" in sys.stdout.getvalue().lower(), "You must call cast_fireball so it prints fireball!"'
      }
    ]
  },
  // CHAPTER 7: DICTIONARIES
  {
    id: 'ch7_l1',
    chapter: 7,
    levelNum: 1,
    chapterTitle: 'Dictionaries & Character Sheets',
    title: 'The Monster Index 📇',
    narrative: 'You find a magical beast library. In Python, we can store structured key-value profiles in a Dictionary.',
    instructions: 'Create a dictionary named `beast` with three keys: `"name"` set to `"Grog"`, `"power"` set to `85`, and `"type"` set to `"Earth"`. Print the beast name.',
    type: 'typing',
    starterCode: '# Define your beast dictionary\n',
    solutionKeywords: ['beast', 'name', 'power', 'type', 'print'],
    hints: [
      'Define it like: beast = {"name": "Grog", "power": 85, "type": "Earth"}',
      'Print the name using the key: print(beast["name"])'
    ],
    xpReward: 80,
    visualSetup: {
      scene: 'garden',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'goblin3', type: 'goblin', x: 60, y: 50 }]
    },
    testCases: [
      {
        assertPython: 'assert isinstance(beast, dict), "beast must be a dictionary!"\nassert beast["power"] == 85, "Grog power should be 85!"\nassert "Grog" in sys.stdout.getvalue(), "Make sure you print Grog\'s name!"'
      }
    ]
  },
  // CHAPTER 8: INTRO TO CLASSES
  {
    id: 'ch8_l1',
    chapter: 8,
    levelNum: 1,
    chapterTitle: 'Object Oriented Creatures',
    title: 'Hatching a Companion 🥚',
    narrative: 'You found a mystical Dragon Egg! To make it hatch, you must write a Class blueprint in Python that constructs a Companion object.',
    instructions: 'Create a class named `Companion` with an `__init__` constructor that sets `self.name`. Add a method `greet(self)` that prints `"hello!"`. Instantiate it as `pet` with name `"Sparky"` and call `pet.greet()`.',
    type: 'typing',
    starterCode: '# Implement the Companion class blueprint!\n',
    solutionKeywords: ['class', 'def', '__init__', 'self', 'greet', 'print'],
    hints: [
      'Write: class Companion:',
      'Constructor: def __init__(self, name):\\n    self.name = name',
      'Method: def greet(self):\\n    print("hello!")',
      'Create: pet = Companion("Sparky")',
      'Call: pet.greet()'
    ],
    xpReward: 90,
    visualSetup: {
      scene: 'castle',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'dragon1', type: 'dragon', x: 70, y: 50 }]
    },
    testCases: [
      {
        assertPython: 'assert hasattr(pet, "name"), "Your pet has no name!"\nassert pet.name == "Sparky", "Pet name should be Sparky!"\nassert "hello!" in sys.stdout.getvalue().lower(), "You must call greet() so it prints hello!"'
      }
    ]
  },
  // CHAPTER 9: DEBUGGING & BUG HUNTING
  {
    id: 'ch9_l1',
    chapter: 9,
    levelNum: 1,
    chapterTitle: 'Bug Hunting Tracebacks',
    title: 'Fixing the Wizard Forge ⚙️',
    narrative: 'A dark curse has hit the Wizard\'s weapon forging script! It has a syntax / indentation error that stops it from running. Read the error and fix the bug.',
    instructions: 'Fix the indentation error inside the script below so that the forge function runs and completes the level.',
    type: 'typing',
    starterCode: 'def forge():\nprint("forging...") # BUG: This line is not indented!\n\nforge()\n',
    solutionKeywords: ['def', 'forge', 'print'],
    hints: [
      'Python functions must have indented bodies.',
      'Add 4 spaces or a tab before print("forging...") so it sits inside def forge():'
    ],
    xpReward: 90,
    visualSetup: {
      scene: 'castle',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'chest2', type: 'chest', x: 60, y: 50 }]
    },
    testCases: [
      {
        assertPython: 'assert "forging..." in sys.stdout.getvalue().lower(), "Ensure the forge function runs and prints forging..."'
      }
    ]
  },
  // CHAPTER 10 (CAPSTONE): BOSS LEVEL
  {
    id: 'ch10_l1',
    chapter: 10,
    levelNum: 1,
    chapterTitle: 'The Final Python Boss',
    title: 'Defeating the Void Dragon 🐉',
    narrative: 'This is the final battle! A colossal Void Dragon blocks your exit. You must combine print, variables, loops, and conditions to defeat it!',
    instructions: 'Create variables `damage = 30` and `dragon_hp = 100`. Use a `for` loop to attack 4 times: subtract `damage` from `dragon_hp` in each iteration. Inside the loop, if `dragon_hp <= 0`, print `"victory"`. Finally, print the remaining `dragon_hp`.',
    type: 'typing',
    starterCode: '# Combine loops, variables, and conditions!\ndamage = 30\ndragon_hp = 100\n',
    solutionKeywords: ['for', 'if', 'print', 'dragon_hp', 'damage'],
    hints: [
      'Write: for i in range(4):',
      'Subtract inside the loop: dragon_hp = dragon_hp - damage',
      'Check if HP is below 0: if dragon_hp <= 0: print("victory")',
      'Print HP outside loop: print(dragon_hp)'
    ],
    xpReward: 150,
    isBoss: true,
    visualSetup: {
      scene: 'castle',
      hero: { x: 10, y: 50, dir: 'right' },
      targets: [{ id: 'dragon2', type: 'dragon', x: 70, y: 50 }]
    },
    testCases: [
      {
        assertPython: 'assert dragon_hp < 0, "The dragon\'s health is still too high! Did you attack 4 times?"\nassert "victory" in sys.stdout.getvalue().lower(), "You must print \'victory\' once the dragon\'s HP falls to 0 or below!"'
      }
    ]
  }
];

export function getChapterLevels(chapter: number): PythonLevel[] {
  return pythonLevels.filter(l => l.chapter === chapter);
}

export function getLevelById(id: string): PythonLevel | undefined {
  return pythonLevels.find(l => l.id === id);
}
