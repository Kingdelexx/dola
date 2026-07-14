export interface NumeracyLevel {
  id: number;       // 1 to 10 within the part
  globalId: number; // 1 to 50 across the whole stage
  title: string;
  topic: string;
  objective: string;
  codingLink: string;
  unlockedAbility: string;
  gameType: 
    | 'counting' | 'recognition' | 'comparison' | 'sequencing' | 'odd-even' 
    | 'place-value' | 'addition' | 'subtraction' | 'bonds' | 'skip-counting' 
    | 'addition-regrouping' | 'subtraction-borrowing' | 'multiplication-basics' | 'division-basics' 
    | 'times-tables' | 'factors-multiples' | 'word-problems' | 'estimation-rounding' 
    | 'money-calculations' | 'speed-maths'
    // Part 3 game types
    | 'number-patterns' | 'shape-patterns' | 'growing-patterns' | 'missing-patterns' 
    | 'simple-sequences' | 'rule-based-patterns' | 'matching-sorting' | 'classification' 
    | 'boolean-statements' | 'conditional-reasoning'
    // Part 4 game types
    | 'basic-shapes' | '2d-3d-shapes' | 'symmetry' | 'position-direction' | 'relative-movement' 
    | 'turns-clockwise' | 'angles-basics' | 'grid-movement' | 'cartesian-coordinates' | 'maps-routes'
    // Part 5 game types
    | 'measure-length' | 'measure-height' | 'measure-weight' | 'measure-time' | 'measure-calendar'
    | 'speed-basics' | 'measure-distance' | 'measure-temperature' | 'measure-area' | 'measure-perimeter'
    // Part 6 game types
    | 'fraction-whole' | 'fraction-equivalence' | 'fraction-comparison' | 'fraction-addition' | 'decimal-basics'
    | 'decimal-money' | 'percentage-basics' | 'percentage-discount' | 'ratio-basics' | 'proportion-basics'
    // Part 7 game types
    | 'data-collecting' | 'data-tables' | 'data-pictograms' | 'data-bar-charts' | 'data-line-graphs'
    | 'data-pie-charts' | 'data-mean' | 'data-median' | 'data-mode' | 'data-interpretation'
    // Part 8 game types
    | 'algo-steps' | 'algo-decomposition' | 'algo-bugs' | 'algo-math-bugs' | 'algo-logic-puzzles'
    | 'algo-word-problems' | 'algo-brain-teasers' | 'algo-strategy' | 'algo-flowchart' | 'algo-design';
  gameData: any;
}

export interface NumeracyPart {
  id: number;
  title: string;
  ageGroup: string;
  description: string;
  levels: NumeracyLevel[];
}

export const STAGE1_NUMERACY_PARTS: NumeracyPart[] = [
  {
    id: 1,
    title: "Part 1: Number Sense Foundation",
    ageGroup: "Ages 5–7",
    description: "Start your coding journey by mastering number identification, skip loops, comparing ports, and binary sequencing.",
    levels: [
      {
        id: 1,
        globalId: 1,
        title: "Level 1: Binary Step Counter",
        topic: "Counting forward and backward",
        objective: "Help Robo-Rover complete the missing step numbers in the sequence to cross the chasm.",
        codingLink: "Step-by-step Execution. Computers execute instructions in a strict sequence, one step after another. Counting forward or backward is the simplest form of step execution!",
        unlockedAbility: "Sequence Operator",
        gameType: "counting",
        gameData: {
          steps: [
            { sequence: [3, 4, 5, null, 7], options: [5, 6, 8], correctAnswer: 6, label: "Count Forward" },
            { sequence: [10, 9, null, 7, 6], options: [8, 5, 4], correctAnswer: 8, label: "Count Backward" }
          ]
        }
      },
      {
        id: 2,
        globalId: 2,
        title: "Level 2: Signal Pulse Decoder",
        topic: "Number recognition",
        objective: "Count the active neon signal cells in the data register to decode the digital value.",
        codingLink: "Data Representation. Computers represent all real-world items (images, sound, text) as numbers. Counting signals is how processors read memory cells!",
        unlockedAbility: "Signal Reader",
        gameType: "recognition",
        gameData: {
          grid: [true, false, true, true, false, true, true, true, false], // 6 active cells
          correctAnswer: 6,
          options: [4, 5, 6, 7]
        }
      },
      {
        id: 3,
        globalId: 3,
        title: "Level 3: Logic Gate Compare",
        topic: "Comparing numbers: greater than, less than, equal to",
        objective: "Choose the correct logic operator (<, >, or =) to open the data firewall.",
        codingLink: "Conditionals & Logic. Programs use comparison operators to make choices, like: `if score > 100: display_victory()`. Comparison is the foundation of computer decision-making!",
        unlockedAbility: "Conditional branch (if/else)",
        gameType: "comparison",
        gameData: {
          challenges: [
            { left: 15, right: 9, correctAnswer: ">" },
            { left: 24, right: 42, correctAnswer: "<" },
            { left: 88, right: 88, correctAnswer: "=" }
          ]
        }
      },
      {
        id: 4,
        globalId: 4,
        title: "Level 4: Execution Queue Sorter",
        topic: "Number order and sequencing",
        objective: "Drag or click the numbered instructions to sort them in ascending order (smallest to largest) so they compile correctly.",
        codingLink: "Order of Operations. Program instructions must execute in a precise order. If the sequence is jumbled, the code will fail to compile or do the wrong thing!",
        unlockedAbility: "Instruction Queue",
        gameType: "sequencing",
        gameData: {
          items: [18, 5, 33, 12],
          correctAnswer: [5, 12, 18, 33]
        }
      },
      {
        id: 5,
        globalId: 5,
        title: "Level 5: Modulo Bit Classifier",
        topic: "Odd and even numbers",
        objective: "Sort incoming data packets into Even Ports (Modulo 0) and Odd Ports (Modulo 1).",
        codingLink: "Modulo Operator. Programmers use the modulo operator (%) to find if a number is odd or even by dividing it by 2. If the remainder is 0, it's even!",
        unlockedAbility: "Modulo (%) Operator",
        gameType: "odd-even",
        gameData: {
          numbers: [9, 14, 21, 8, 33]
        }
      },
      {
        id: 6,
        globalId: 6,
        title: "Level 6: Memory Bit Calculator",
        topic: "Place value (tens and units)",
        objective: "Set the register switches to match the exact decimal target value.",
        codingLink: "Memory Allocation. Computer registers allocate bits in standard configurations like base-10 slots. Setting switches assigns correct values to active memory units!",
        unlockedAbility: "Bit Switcher",
        gameType: "place-value",
        gameData: {
          target: 245
        }
      },
      {
        id: 7,
        globalId: 7,
        title: "Level 7: ALU Arithmetic Adder",
        topic: "Addition",
        objective: "Compute the sum of incoming signal streams to configure the ALU output.",
        codingLink: "ALU Operations. The Arithmetic Logic Unit (ALU) performs basic addition at the core of all calculations, handling instruction counters and data index shifting!",
        unlockedAbility: "ALU Add Operator",
        gameType: "addition",
        gameData: {
          num1: 17,
          num2: 8,
          correctAnswer: 25,
          options: [23, 24, 25, 26]
        }
      },
      {
        id: 8,
        globalId: 8,
        title: "Level 8: Heat Subtraction Balancer",
        topic: "Subtraction",
        objective: "Perform subtraction to balance the coolant flow temperature.",
        codingLink: "Decrement Operations. Systems use decrement operations to count down time limits, drain status points, or calculate relative distance values in gaming grids!",
        unlockedAbility: "ALU Sub Operator",
        gameType: "subtraction",
        gameData: {
          start: 35,
          subtract: 14,
          correctAnswer: 21,
          options: [19, 21, 22, 29]
        }
      },
      {
        id: 9,
        globalId: 9,
        title: "Level 9: Target Complement Key",
        topic: "Number bonds to 10",
        objective: "Provide the complementary value to make the sum exactly 10 and secure the handshake.",
        codingLink: "Handshake Validation. Data packets are verified by comparing their checksum complement values. Generating the exact complement completes the handshake request!",
        unlockedAbility: "Handshake Complementer",
        gameType: "bonds",
        gameData: {
          target: 10,
          value: 7,
          correctAnswer: 3,
          options: [2, 3, 4, 7]
        }
      },
      {
        id: 10,
        globalId: 10,
        title: "Level 10: Skip-Loop Iterator",
        topic: "Skip counting",
        objective: "Solve the skip-sequence offsets to verify loop iterators.",
        codingLink: "Loop Steps. Loops can execute by stepping values, such as: `for i = 0 to 10 step 2`. Skip counting directly defines these loop step variables!",
        unlockedAbility: "Skip-Loop Compiler",
        gameType: "skip-counting",
        gameData: {
          challenges: [
            { sequence: [5, 10, 15, null, 25], step: 5, correctAnswer: 20, options: [18, 20, 22] },
            { sequence: [3, 6, null, 12, 15], step: 3, correctAnswer: 9, options: [8, 9, 10] },
            { sequence: [10, 20, 30, null, 50], step: 10, correctAnswer: 40, options: [35, 40, 45] }
          ]
        }
      }
    ]
  },
  {
    id: 2,
    title: "Part 2: Operations and Mental Maths",
    ageGroup: "Ages 7–9",
    description: "Master carry/borrow arithmetic, array scaling, balance division, and speed maths stream processors.",
    levels: [
      {
        id: 1,
        globalId: 11,
        title: "Level 11: Carry Flag ALU",
        topic: "Addition with regrouping",
        objective: "Sum the values and trigger the carry status bit if the digit sum overflows 9.",
        codingLink: "Carry Flags. When addition exceeds the register bounds, processors trigger a Carry Flag (overflow status) to pass 1 to the next high byte!",
        unlockedAbility: "Carry-Flag Register",
        gameType: "addition-regrouping",
        gameData: {
          num1: 28,
          num2: 15,
          correctAnswer: 43
        }
      },
      {
        id: 2,
        globalId: 12,
        title: "Level 12: Underflow Borrow Core",
        topic: "Subtraction with borrowing",
        objective: "Perform subtraction by borrowing from the higher register slot when units underflow.",
        codingLink: "Register Underflow. Borrowing represents underflow management. When subtracting values, logic controllers borrow from higher bits to maintain integrity!",
        unlockedAbility: "Borrow Operator Register",
        gameType: "subtraction-borrowing",
        gameData: {
          start: 42,
          subtract: 17,
          correctAnswer: 25
        }
      },
      {
        id: 3,
        globalId: 13,
        title: "Level 13: Loop Multiplier Node",
        topic: "Multiplication basics",
        objective: "Calculate the product by determining total outputs over repeated loop iterations.",
        codingLink: "Repeated Actions. Multiplication is repeated loop additions. `3 x 4` translates to running a loop that adds 4 units, 3 separate times!",
        unlockedAbility: "Repeated Loop Multiplier",
        gameType: "multiplication-basics",
        gameData: {
          factor1: 3,
          factor2: 4,
          correctAnswer: 12,
          options: [8, 10, 12, 16]
        }
      },
      {
        id: 4,
        globalId: 14,
        title: "Level 14: Load Balance Divisor",
        topic: "Division basics",
        objective: "Distribute the incoming data packets evenly among the active output slots.",
        codingLink: "Load Balancing. Division represents load balancing. Distributing tasks evenly across multiple servers ensures optimal CPU performance!",
        unlockedAbility: "Load Balancer API",
        gameType: "division-basics",
        gameData: {
          total: 12,
          divisor: 3,
          correctAnswer: 4,
          options: [2, 3, 4, 6]
        }
      },
      {
        id: 5,
        globalId: 15,
        title: "Level 15: Array Multiplication Stream",
        topic: "Times tables",
        objective: "Solve the multiplication stream to retrieve stored variables.",
        codingLink: "Lookup Tables. Programmers store pre-calculated products in arrays (Lookup Tables) to quickly query values without recalculating them on the fly!",
        unlockedAbility: "Times-Table Lookup Stream",
        gameType: "times-tables",
        gameData: {
          challenges: [
            { question: "7 x 6", correctAnswer: 42, options: [35, 42, 48, 49] },
            { question: "8 x 4", correctAnswer: 32, options: [28, 30, 32, 36] },
            { question: "9 x 5", correctAnswer: 45, options: [40, 45, 50, 54] }
          ]
        }
      },
      {
        id: 6,
        globalId: 16,
        title: "Level 16: Factor Filter compiler",
        topic: "Factors and multiples",
        objective: "Identify all factors that divide the target integer with zero remainder.",
        codingLink: "Remainder Functions. Finding factors is critical to cryptography and hashing. If `A % B == 0`, B is an exact factor of the key!",
        unlockedAbility: "Key Hash Filter",
        gameType: "factors-multiples",
        gameData: {
          target: 12,
          items: [1, 2, 3, 5, 6, 7, 8, 12],
          correctAnswers: [1, 2, 3, 6, 12]
        }
      },
      {
        id: 7,
        globalId: 17,
        title: "Level 17: Logic Variable Parser",
        topic: "Simple word problems",
        objective: "Parse the word statement and calculate the state changes of the system variables.",
        codingLink: "System State Updates. Word problems represent program logic. Converting statements like 'add 5 items, remove 2' translates to updating variables: `x = x + 5 - 2`!",
        unlockedAbility: "State Variable Parser",
        gameType: "word-problems",
        gameData: {
          question: "Robo-Rover starts with 15 power cells. It consumes 6 cells running a search function, then gains 4 cells from solar charging. How many cells does it have now?",
          correctAnswer: 13,
          options: [9, 13, 15, 21]
        }
      },
      {
        id: 8,
        globalId: 18,
        title: "Level 18: Float-to-Int Rounder",
        topic: "Estimation and rounding",
        objective: "Round the decimal float sensor value to the nearest whole integer ten to clean up the data.",
        codingLink: "Data Casting. Floating-point sensor inputs are rounded or 'cast' to integers in game development (e.g. `Math.round(58.3)`) to align sprites to solid screen pixels!",
        unlockedAbility: "Data Rounder (Math.round)",
        gameType: "estimation-rounding",
        gameData: {
          value: 58,
          correctAnswer: 60,
          options: [50, 58, 60, 70]
        }
      },
      {
        id: 9,
        globalId: 19,
        title: "Level 19: Coin Ledger Auditor",
        topic: "Money calculations",
        objective: "Determine the correct change balance after buying the digital items.",
        codingLink: "Float Precision. E-commerce systems run transactions using integer penny registers (e.g. 150 cents instead of $1.50) to prevent floating-point division errors!",
        unlockedAbility: "Currency Ledger API",
        gameType: "money-calculations",
        gameData: {
          price: 1.50,
          paid: 2.00,
          correctAnswer: 0.50,
          options: [0.25, 0.50, 0.75, 1.00]
        }
      },
      {
        id: 10,
        globalId: 20,
        title: "Level 20: CPU Speed Loop",
        topic: "Speed maths games",
        objective: "Respond to the simple calculation stream before the CPU clock tick runs out!",
        codingLink: "Real-time Clock Cycle. Speed maths mimics CPU clock speeds. Programs must execute functions before the next clock tick (like 60 FPS in gaming) to run smoothly!",
        unlockedAbility: "Part 3 Unlock",
        gameType: "speed-maths",
        gameData: {
          challenges: [
            { q: "5 + 3", a: 8, options: [7, 8, 9] },
            { q: "12 - 7", a: 5, options: [4, 5, 6] },
            { q: "4 x 3", a: 12, options: [8, 10, 12] }
          ]
        }
      }
    ]
  },
  {
    id: 3,
    title: "Part 3: Patterns, Logic and Sequences",
    ageGroup: "Ages 9–11",
    description: "Prepare for high-level programming by mastering loops, nesting, recursive systems, function rules, boolean flags, and branching logic.",
    levels: [
      {
        id: 1,
        globalId: 21,
        title: "Level 21: Loop Step Iterator",
        topic: "Number patterns",
        objective: "Identify the pattern of numbers generated by the step loop and fill the final array slot.",
        codingLink: "Loop Step Parameters. Loop increments step forward in custom increments (e.g. `for i in range(2, 12, 2)`). Pattern recognition is how programmers verify loop logic!",
        unlockedAbility: "Loop Iterator",
        gameType: "number-patterns",
        gameData: {
          sequence: [2, 4, 6, 8, 10, null],
          correctAnswer: 12,
          options: [10, 11, 12, 14]
        }
      },
      {
        id: 2,
        globalId: 22,
        title: "Level 22: Render Matrix Pattern",
        topic: "Shape patterns",
        objective: "Identify the pattern of repeating shapes and select the shape that fills the next grid cell.",
        codingLink: "Nested Loop Layouts. Graphics engines draw repeating shape layouts (e.g. brick walls) using grids and nested loops. Matching shape patterns develops pattern matching engines!",
        unlockedAbility: "Shape Matrix Grid",
        gameType: "shape-patterns",
        gameData: {
          sequence: ["triangle", "circle", "square", "triangle", "circle", null],
          correctAnswer: "square",
          options: ["triangle", "circle", "square"]
        }
      },
      {
        id: 3,
        globalId: 23,
        title: "Level 23: Exponential Growth Node",
        topic: "Growing patterns",
        objective: "Analyze the exponential growth of the data packets and select the correct terminal value.",
        codingLink: "Algorithm Scaling. Exponential patterns (e.g. 1, 2, 4, 8, 16) represent binary address scaling or tree division. Understanding growth is key to calculating Big O time complexity!",
        unlockedAbility: "Exponential Scale (Big O)",
        gameType: "growing-patterns",
        gameData: {
          sequence: [1, 2, 4, 8, 16, null],
          correctAnswer: 32,
          options: [24, 30, 32, 64]
        }
      },
      {
        id: 4,
        globalId: 24,
        title: "Level 24: Array Syntax Debugger",
        topic: "Missing number patterns",
        objective: "Inspect the list of data elements, identify the missing pattern element, and repair the compilation block.",
        codingLink: "Syntax Debugging. A broken list or sequence in database inputs creates underflow/overflow compile errors. Finding the missing value patches the code array!",
        unlockedAbility: "Sequence Array Patch",
        gameType: "missing-patterns",
        gameData: {
          sequence: [5, 10, null, 20, 25],
          correctAnswer: 15,
          options: [12, 15, 18, 30]
        }
      },
      {
        id: 5,
        globalId: 25,
        title: "Level 25: Program Queue Sorter",
        topic: "Simple sequences",
        objective: "Sort the instructions so the program queue runs in the correct, logic-valid order.",
        codingLink: "Execution Pipelines. Instructions in CPU registers are placed on a FIFO (First In First Out) execution pipeline. Sorting sequence ensures execution runs error-free!",
        unlockedAbility: "FIFO Queue Pipeline",
        gameType: "simple-sequences",
        gameData: {
          items: ["Initialize Variables", "Calculate Formula", "Print Output"],
          correctAnswer: ["Initialize Variables", "Calculate Formula", "Print Output"]
        }
      },
      {
        id: 6,
        globalId: 26,
        title: "Level 26: Custom Function Machine",
        topic: "Rule-based patterns",
        objective: "Apply the function rule (Multiply by 2 and Add 1) to calculate the final output block.",
        codingLink: "Custom Functions. A rule is a math function: `def f(x): return x * 2 + 1`. Giving inputs to calculate outputs is the basis of function modules!",
        unlockedAbility: "Function Calculator",
        gameType: "rule-based-patterns",
        gameData: {
          rule: "Multiply by 2, then add 1",
          inputVal: 4,
          correctAnswer: 9,
          options: [7, 8, 9, 10]
        }
      },
      {
        id: 7,
        globalId: 27,
        title: "Level 27: Sorting Algorithm Matcher",
        topic: "Matching and sorting",
        objective: "Match the code command to its matching outcome register.",
        codingLink: "Key-Value Matching. Associative arrays map keys to values (e.g. `user['name'] = 'Alice'`). Matching attributes helps query records inside Databases!",
        unlockedAbility: "Key-Value Dictionary",
        gameType: "matching-sorting",
        gameData: {
          matches: [
            { key: "integer", val: "Number without decimals" },
            { key: "string", val: "Text block in quotes" },
            { key: "boolean", val: "Logical state (True/False)" }
          ],
          options: ["Logical state (True/False)", "Number without decimals", "Text block in quotes"]
        }
      },
      {
        id: 8,
        globalId: 28,
        title: "Level 28: Class Classifier Core",
        topic: "Classification",
        objective: "Classify the items into their correct Object Oriented Type classifications.",
        codingLink: "Object-Oriented Classes. Programmers declare Classes to group similar objects together (e.g. `Dog` and `Cat` inherit from `Animal`).",
        unlockedAbility: "Class Inheritance Constructor",
        gameType: "classification",
        gameData: {
          categories: ["Variables", "Values"],
          items: [
            { name: "x", category: "Variables" },
            { name: "score", category: "Variables" },
            { name: "45", category: "Values" },
            { name: "'hello'", category: "Values" }
          ]
        }
      },
      {
        id: 9,
        globalId: 29,
        title: "Level 29: Logical Boolean Gate",
        topic: "True or false statements",
        objective: "Decide whether the logical binary expression is True (1) or False (0).",
        codingLink: "Boolean Algebra. Computer gates execute logic using boolean equations. A conditional evaluates to a single True or False value to determine route branches!",
        unlockedAbility: "Boolean logic (AND/OR/NOT)",
        gameType: "boolean-statements",
        gameData: {
          expression: "5 > 3 AND 10 == 10",
          correctAnswer: true,
          options: [true, false]
        }
      },
      {
        id: 10,
        globalId: 30,
        title: "Level 30: If-Else Instruction Router",
        topic: "If-this-then-that reasoning",
        objective: "Determine the final output variable based on the execution of the If-Else block.",
        codingLink: "Branching Logic. Conditional `if-else` blocks route the execution flow. If the condition is met, the `if` block fires, else the `else` block triggers!",
        unlockedAbility: "Part 4 Unlock",
        gameType: "conditional-reasoning",
        gameData: {
          condition: "IF cells < 10 THEN charge = 100 ELSE charge = 0",
          state: "cells = 8",
          correctAnswer: 100,
          options: [0, 100, 8]
        }
      }
    ]
  },
  {
    id: 4,
    title: "Part 4: Shapes, Space and Coordinates",
    ageGroup: "Ages 11+",
    description: "Connect spatial layouts, angles, rotations, grid vectors, and Cartesian coordinates to game engines and robotics logic.",
    levels: [
      {
        id: 1,
        globalId: 31,
        title: "Level 31: Vector Shape Raster",
        topic: "Basic shapes",
        objective: "Identify the vector drawing properties of basic geometric sprites.",
        codingLink: "Vector graphics rendering. Canvas engines draw basic shapes using mathematical coordinates (radius, width, height) rather than static pixel arrays.",
        unlockedAbility: "Vector Shape Engine",
        gameType: "basic-shapes",
        gameData: {
          properties: [
            { shape: "Triangle", sides: 3, correctAnswer: "3 sides, 3 corners" },
            { shape: "Circle", sides: 0, correctAnswer: "1 curved side, 0 corners" }
          ]
        }
      },
      {
        id: 2,
        globalId: 32,
        title: "Level 32: Depth Projection Core",
        topic: "2D and 3D shapes",
        objective: "Determine whether the geometric token is a 2D flat shape or a 3D depth-projected shape.",
        codingLink: "Z-axis Depth Projection. 3D engines calculate rendering projections by mapping flat X/Y polygons into Z-depth coordinate dimensions.",
        unlockedAbility: "3D Projection Matrix",
        gameType: "2d-3d-shapes",
        gameData: {
          items: [
            { name: "Cube", type: "3D" },
            { name: "Square", type: "2D" },
            { name: "Sphere", type: "3D" },
            { name: "Triangle", type: "2D" }
          ]
        }
      },
      {
        id: 3,
        globalId: 33,
        title: "Level 33: Mirror Sprite Symmetry",
        topic: "Symmetry",
        objective: "Complete the horizontal reflective symmetry of the binary grid matrix.",
        codingLink: "Mirror Transformations. Game sprite flipping and horizontal texture reflections use matrix sign inversions (e.g. scaleX = -1).",
        unlockedAbility: "Symmetry Mirror Tool",
        gameType: "symmetry",
        gameData: {
          leftSide: [true, false, true, true],
          correctAnswer: [true, false, true, true],
          options: [
            [true, false, true, true],
            [false, true, false, false],
            [true, true, false, false]
          ]
        }
      },
      {
        id: 4,
        globalId: 34,
        title: "Level 34: Vector Heading Aligner",
        topic: "Position and direction",
        objective: "Determine the target cardinal direction based on the current bearing angle.",
        codingLink: "Vector heading orientations. Game AI navigation loops read a robot's vector heading to align movement paths correctly.",
        unlockedAbility: "Heading Orientation Vector",
        gameType: "position-direction",
        gameData: {
          bearing: 90,
          correctAnswer: "East",
          options: ["North", "East", "South", "West"]
        }
      },
      {
        id: 5,
        globalId: 35,
        title: "Level 35: Relative Position Shift",
        topic: "Left, right, up, down",
        objective: "Modify relative translation coordinates to guide the rover sprite through the tunnel.",
        codingLink: "Relative coordinate modifiers. Pressing keys increments/decrements positions relative to active axes (e.g. y += speed for down, x -= speed for left).",
        unlockedAbility: "Sprite Translation Controller",
        gameType: "relative-movement",
        gameData: {
          start: { x: 2, y: 2 },
          moves: ["Up", "Left", "Left", "Up"],
          correctAnswer: { x: 0, y: 0 }
        }
      },
      {
        id: 6,
        globalId: 36,
        title: "Level 36: Rotational Transformation Core",
        topic: "Turns: clockwise and anticlockwise",
        objective: "Calculate the sprite's rotation angle after turning relative to its origin.",
        codingLink: "Rotational Transforms. Turning sprites clockwise (e.g. angle += 90) or anticlockwise modifies angular rotation offsets.",
        unlockedAbility: "Angular Rotation Register",
        gameType: "turns-clockwise",
        gameData: {
          startAngle: 0,
          turn: "90° Clockwise",
          correctAnswer: 90,
          options: [90, 180, 270, 360]
        }
      },
      {
        id: 7,
        globalId: 37,
        title: "Level 37: Angle Classification Node",
        topic: "Angles basics",
        objective: "Classify the target angle based on its degree properties.",
        codingLink: "Trigonometric orientation. Finding angles is key to firing projectiles or rotating cameras to follow a target.",
        unlockedAbility: "Trigonometric classifier",
        gameType: "angles-basics",
        gameData: {
          angle: 90,
          correctAnswer: "Right Angle",
          options: ["Acute Angle", "Right Angle", "Obtuse Angle"]
        }
      },
      {
        id: 8,
        globalId: 38,
        title: "Level 38: 2D Grid Array Explorer",
        topic: "Grid movement",
        objective: "Navigate the sprite to the target grid index cell.",
        codingLink: "2D Grid arrays. Game maps map coordinate nodes onto rows and columns (e.g. map[row][col]).",
        unlockedAbility: "2D Map Array Compiler",
        gameType: "grid-movement",
        gameData: {
          targetRow: 2,
          targetCol: 3,
          options: ["Row 2, Col 3", "Row 3, Col 2", "Row 1, Col 3"]
        }
      },
      {
        id: 9,
        globalId: 39,
        title: "Level 39: Cartesian Map Pointer",
        topic: "Coordinates",
        objective: "Identify the Cartesian coordinate address (X, Y) of the glowing database node.",
        codingLink: "Cartesian Coordinates. Display layouts position sprites on an X/Y grid from top-left (0,0) or center anchor points.",
        unlockedAbility: "Cartesian Mapping API",
        gameType: "cartesian-coordinates",
        gameData: {
          xVal: 3,
          yVal: 4,
          correctAnswer: "(3, 4)",
          options: ["(3, 4)", "(4, 3)", "(2, 4)", "(3, 3)"]
        }
      },
      {
        id: 10,
        globalId: 40,
        title: "Level 40: Shortest Path Routing",
        topic: "Maps and routes",
        objective: "Verify the routing path that connects the starting point to the server hub in the fewest steps.",
        codingLink: "A* Pathfinding routes. Robots and games compute routes using path nodes (Start -> A -> B -> End) to navigate obstacles.",
        unlockedAbility: "Part 5 Unlock",
        gameType: "maps-routes",
        gameData: {
          path: ["Start", "Node A", "Server Hub"],
          correctAnswer: ["Start", "Node A", "Server Hub"],
          options: ["Node B", "Server Hub", "Start", "Node A"]
        }
      }
    ]
  },
  {
    id: 5,
    title: "Part 5: Measurement and Real-Life Maths",
    ageGroup: "Ages 11+",
    description: "Measure real-life values like length, height, weight, time, distance, temperature, and grid area/perimeter to build sensors, tickers, and physical coding engines.",
    levels: [
      {
        id: 1,
        globalId: 41,
        title: "Level 41: Sensor Length Unit",
        topic: "Length",
        objective: "Determine the length of the line segment in centimeters.",
        codingLink: "Sensor reading metrics. Code processes analog signals (voltage levels) and normalizes them into real-world values like centimeters or inches.",
        unlockedAbility: "Length Normalization API",
        gameType: "measure-length",
        gameData: {
          lineLength: 8,
          correctAnswer: 8,
          options: [6, 8, 10, 12]
        }
      },
      {
        id: 2,
        globalId: 42,
        title: "Level 42: Depth & Height Scanner",
        topic: "Height",
        objective: "Compare heights of structures to align the collision detection framework.",
        codingLink: "Hitbox Height calculations. Platformers compute sprite height variables to check for ceiling bumps and landing collisions.",
        unlockedAbility: "Height Collision Solver",
        gameType: "measure-height",
        gameData: {
          heights: { A: 12, B: 15, C: 9 },
          question: "Which structure has a height of 15 units?",
          correctAnswer: "B",
          options: ["A", "B", "C"]
        }
      },
      {
        id: 3,
        globalId: 43,
        title: "Level 43: Payload Weight Balancer",
        topic: "Weight",
        objective: "Balance the payload cargo so the drone can lift off safely.",
        codingLink: "Physics variables. Game weight/mass coefficients directly affect acceleration and gravity formulas in code.",
        unlockedAbility: "Mass Physics Core",
        gameType: "measure-weight",
        gameData: {
          leftWeight: 25,
          rightWeightsNeeded: [10, 15],
          correctAnswer: 25,
          options: [20, 25, 30, 35]
        }
      },
      {
        id: 4,
        globalId: 44,
        title: "Level 44: Execution Clock Ticker",
        topic: "Time",
        objective: "Set the system clock time to match the task execution schedule.",
        codingLink: "Timers & Ticks. Game loops run on execution delta-times (milliseconds/seconds) to schedule screen frame refreshes.",
        unlockedAbility: "Execution Delta Timer",
        gameType: "measure-time",
        gameData: {
          timeToShow: "03:00",
          correctAnswer: "3:00",
          options: ["3:00", "4:30", "12:15"]
        }
      },
      {
        id: 5,
        globalId: 45,
        title: "Level 45: Cron Scheduler Calendar",
        topic: "Calendar",
        objective: "Schedule automatic tasks by finding date/day sequences in a monthly calendar.",
        codingLink: "Cron Job Schedules. Code executes automated backup scripts or event notifications on specific calendar day intervals.",
        unlockedAbility: "Calendar Cron Scheduler",
        gameType: "measure-calendar",
        gameData: {
          sequence: ["Monday", "Wednesday", "Friday"],
          question: "If backups occur every other day, what day comes after Friday?",
          correctAnswer: "Sunday",
          options: ["Saturday", "Sunday", "Monday"]
        }
      },
      {
        id: 6,
        globalId: 46,
        title: "Level 46: Animation Speed Basics",
        topic: "Speed basics",
        objective: "Adjust the animation velocity coefficient so the sprite reaches the gate in time.",
        codingLink: "Velocity Vectors. Sprite speed determines how many pixels the object translates per update cycle (position += speed * delta).",
        unlockedAbility: "Linear Velocity Driver",
        gameType: "speed-basics",
        gameData: {
          distance: 100,
          time: 5,
          correctAnswer: 20,
          options: [10, 15, 20, 25]
        }
      },
      {
        id: 7,
        globalId: 47,
        title: "Level 47: Robotics Distance Sensor",
        topic: "Distance",
        objective: "Determine the straight-line distance between the robot sensor and the wall obstacle.",
        codingLink: "Ultrasonic Sensors. Robotic distance sensors measure time-of-flight bounce to determine distance values.",
        unlockedAbility: "Obstacle Distance Finder",
        gameType: "measure-distance",
        gameData: {
          points: { A: 2, B: 10 },
          correctAnswer: 8,
          options: [6, 8, 10, 12]
        }
      },
      {
        id: 8,
        globalId: 48,
        title: "Level 48: Core Temperature Regulating",
        topic: "Temperature",
        objective: "Read the CPU thermostat temperature to trigger the system cooling fan.",
        codingLink: "Thermostat Thresholds. Hardware monitoring scripts trigger cooling relays when temperature floats exceed limits.",
        unlockedAbility: "Thermostat Control Loop",
        gameType: "measure-temperature",
        gameData: {
          temperatureVal: 75,
          correctAnswer: 75,
          options: [60, 75, 90, 105]
        }
      },
      {
        id: 9,
        globalId: 49,
        title: "Level 49: Buffer Grid Area Block",
        topic: "Area basics",
        objective: "Calculate the total grid cell area inside the shaded active region.",
        codingLink: "2D Canvas Area. Render buffers allocate video memory sizes based on length * height area matrices.",
        unlockedAbility: "Grid Area Allocator",
        gameType: "measure-area",
        gameData: {
          width: 5,
          height: 4,
          correctAnswer: 20,
          options: [15, 18, 20, 24]
        }
      },
      {
        id: 10,
        globalId: 50,
        title: "Level 50: Perimeter Collision Boundary",
        topic: "Perimeter basics",
        objective: "Calculate the total bounding box perimeter line segment length of the network firewall.",
        codingLink: "Bounding Perimeter. Collision detectors check if a sprite's perimeter coordinates intersect with solid maps.",
        unlockedAbility: "Part 6 Unlock",
        gameType: "measure-perimeter",
        gameData: {
          width: 6,
          height: 4,
          correctAnswer: 20,
          options: [10, 16, 20, 24]
        }
      }
    ]
  },
  {
    id: 6,
    title: "Part 6: Fractions, Decimals and Percentages",
    ageGroup: "Ages 9-12",
    description: "Work with parts of a whole, equivalences, comparisons, decimals, shopping transactions, percentages, discounts, and visual aspect ratios.",
    levels: [
      {
        id: 1,
        globalId: 51,
        title: "Level 51: Partition Fraction Scanner",
        topic: "Fractions as parts of a whole",
        objective: "Identify the fraction represented by the highlighted grid cells of the memory buffer.",
        codingLink: "Progress Bars. A fraction is the ratio of completed tasks to total tasks (e.g. 3/8 tasks complete), representing loading states.",
        unlockedAbility: "Fractional Progress API",
        gameType: "fraction-whole",
        gameData: {
          numerator: 3,
          denominator: 8,
          options: ["3/8", "1/2", "5/8", "3/4"],
          correctAnswer: "3/8"
        }
      },
      {
        id: 2,
        globalId: 52,
        title: "Level 52: Equivalent Aspect Ratio",
        topic: "Equivalent fractions",
        objective: "Find the equivalent fraction to match the scaled resolution matrix.",
        codingLink: "Scale Factors. Adjusting resolution dimensions keeps ratios equivalent (e.g. 1/2 size of 800x600 is 400x300, keeping aspects equal).",
        unlockedAbility: "Aspect Ratio Scaler",
        gameType: "fraction-equivalence",
        gameData: {
          base: "2/3",
          options: ["4/9", "6/9", "6/6", "8/9"],
          correctAnswer: "6/9"
        }
      },
      {
        id: 3,
        globalId: 53,
        title: "Level 53: Fraction Comparator Gate",
        topic: "Comparing fractions",
        objective: "Compare the two fractions to route resources to the larger pipeline.",
        codingLink: "Sorting algorithms. Comparing floating-point partition rates determines execution ordering and thread prioritization.",
        unlockedAbility: "Fraction Comparator Core",
        gameType: "fraction-comparison",
        gameData: {
          f1: "3/4",
          f2: "5/8",
          correctAnswer: ">",
          options: [">", "<", "="]
        }
      },
      {
        id: 4,
        globalId: 54,
        title: "Level 54: Memory Buffer Aggregator",
        topic: "Adding simple fractions",
        objective: "Combine the shared memory sector fractions to find the total allocated space.",
        codingLink: "Memory Segment allocation. Accumulating fractional memory pages gives total usage (e.g. 1/5 + 3/5 = 4/5 of storage).",
        unlockedAbility: "Buffer Accumulator Loop",
        gameType: "fraction-addition",
        gameData: {
          f1: "1/5",
          f2: "3/5",
          correctAnswer: "4/5",
          options: ["2/5", "3/5", "4/5", "5/5"]
        }
      },
      {
        id: 5,
        globalId: 55,
        title: "Level 55: Floating Point Register",
        topic: "Decimals",
        objective: "Convert the fractional progress coordinate into a floating-point decimal value.",
        codingLink: "Floating-Point Arithmetic. Game physics uses double or single-precision floats (e.g. 0.75 opacity or scale) for precise transforms.",
        unlockedAbility: "Floating-Point Arithmetic Unit",
        gameType: "decimal-basics",
        gameData: {
          fraction: "3/4",
          correctAnswer: 0.75,
          options: [0.34, 0.5, 0.7, 0.75]
        }
      },
      {
        id: 6,
        globalId: 56,
        title: "Level 56: Ledger Cost Aggregator",
        topic: "Money and decimals",
        objective: "Calculate the total transactional cost in decimal currency format.",
        codingLink: "Financial Transaction precision. In databases, monetary values must be represented precisely with decimal bounds to prevent drift errors.",
        unlockedAbility: "Transaction Precision Ledger",
        gameType: "decimal-money",
        gameData: {
          prices: [2.50, 1.25, 3.10],
          correctAnswer: 6.85,
          options: [6.50, 6.75, 6.85, 7.00]
        }
      },
      {
        id: 7,
        globalId: 57,
        title: "Level 57: Percentage Loading Monitor",
        topic: "Percentages",
        objective: "Convert the download progress ratio into a readable percentage output.",
        codingLink: "HUD Progress Renderers. Converting fraction coefficients (e.g. 0.8) to display percent (80%) is a standard UI design pattern.",
        unlockedAbility: "HUD Percentage Display",
        gameType: "percentage-basics",
        gameData: {
          fraction: "4/5",
          correctAnswer: 80,
          options: [40, 60, 80, 90]
        }
      },
      {
        id: 8,
        globalId: 58,
        title: "Level 58: Dynamic Discount Engine",
        topic: "Discount and price changes",
        objective: "Compute the discounted server hosting cost using the percentage code.",
        codingLink: "Discount checkout pipelines. Code checks promo discount rates and applies them to baseline products (Price = Price * (1 - Discount/100)).",
        unlockedAbility: "Checkout Discount Pipeline",
        gameType: "percentage-discount",
        gameData: {
          originalPrice: 80,
          discount: 25,
          correctAnswer: 60,
          options: [50, 55, 60, 65]
        }
      },
      {
        id: 9,
        globalId: 59,
        title: "Level 59: Palette Asset Ratio",
        topic: "Ratio basics",
        objective: "Determine the ratio of active green nodes to standby purple nodes.",
        codingLink: "Color Palette distribution. Ratios define proportional distributions like color balance, layout scaling, or audio mixing balances.",
        unlockedAbility: "Palette Balance Allocator",
        gameType: "ratio-basics",
        gameData: {
          green: 4,
          purple: 6,
          correctAnswer: "2:3",
          options: ["1:2", "2:3", "3:4", "4:5"]
        }
      },
      {
        id: 10,
        globalId: 60,
        title: "Level 60: System Resource Proportion",
        topic: "Proportion basics",
        objective: "Scale resources proportionally: if 2 worker nodes handle 10 tasks, how many tasks can 6 nodes handle?",
        codingLink: "Horizontal Scaling. Proportion helps calculate needed resources. If 2 servers handle 10k requests, 6 servers can handle 30k.",
        unlockedAbility: "Part 7 Unlock",
        gameType: "proportion-basics",
        gameData: {
          nodes: 2,
          tasks: 10,
          targetNodes: 6,
          correctAnswer: 30,
          options: [20, 25, 30, 40]
        }
      }
    ]
  },
  {
    id: 7,
    title: "Part 7: Data and Statistics",
    ageGroup: "Ages 9-12",
    description: "Gather and compile datasets, interpret structures like tables, pictograms, bar charts, and line graphs, and calculate core statistics like mean, median, and mode.",
    levels: [
      {
        id: 1,
        globalId: 61,
        title: "Level 61: Telemetry Data Gatherer",
        topic: "Collecting data",
        objective: "Count the active telemetry packets of each pattern class to compile a dataset.",
        codingLink: "Data Aggregation. Programs collect raw logs and count event frequencies to display in dashboard trackers.",
        unlockedAbility: "Dataset Compilation API",
        gameType: "data-collecting",
        gameData: {
          items: ["Server Logs", "Database", "Server Logs", "API Request", "Database", "Server Logs"],
          correctAnswer: { A: 3, B: 2, C: 1 }
        }
      },
      {
        id: 2,
        globalId: 62,
        title: "Level 62: Matrix Table Reader",
        topic: "Tables",
        objective: "Query the spreadsheet matrix table to extract the specific server response value.",
        codingLink: "2D Array Queries. Searching tables matches rows and columns to return specific cell data (e.g. data[row][col]).",
        unlockedAbility: "2D Matrix Query Engine",
        gameType: "data-tables",
        gameData: {
          table: [
            { location: "US-East", ping: 45 },
            { location: "EU-West", ping: 120 },
            { location: "AP-South", ping: 210 }
          ],
          correctAnswer: "US-East",
          options: ["US-East", "EU-West", "AP-South"]
        }
      },
      {
        id: 3,
        globalId: 63,
        title: "Level 63: Pictogram Decoder Console",
        topic: "Pictograms",
        objective: "Decode the visual dataset where each glyph represents a scale factor.",
        codingLink: "Vector icon grids. Pictograms display data volumes visually, e.g. drawing 1 icon per 10 items in a responsive list.",
        unlockedAbility: "Iconic Grid Decoder",
        gameType: "data-pictograms",
        gameData: {
          key: 5,
          categories: [
            { name: "Server Logs", stars: 3 },
            { name: "Database Queries", stars: 4 },
            { name: "API Packets", stars: 2 }
          ],
          correctAnswer: 15,
          options: [10, 15, 20, 25]
        }
      },
      {
        id: 4,
        globalId: 64,
        title: "Level 64: Bar Chart Visualizer",
        topic: "Bar charts",
        objective: "Identify the category with the highest system load on the graph console.",
        codingLink: "Chart Layout Frameworks. Chart widgets convert numeric arrays into SVG height values to render bar shapes.",
        unlockedAbility: "SVG Chart Layout Engine",
        gameType: "data-bar-charts",
        gameData: {
          categories: [
            { name: "DB", value: 40 },
            { name: "Web", value: 80 },
            { name: "Cache", value: 50 }
          ],
          correctAnswer: "Web",
          options: ["DB", "Web", "Cache"]
        }
      },
      {
        id: 5,
        globalId: 65,
        title: "Level 65: Line Graph Tracker",
        topic: "Line graphs",
        objective: "Read the line graph coordinates to detect the bandwidth spike.",
        codingLink: "Time-series graphs. Line charts map data values over time intervals onto sequential canvas path points.",
        unlockedAbility: "Time-Series Path Tracker",
        gameType: "data-line-graphs",
        gameData: {
          points: [10, 30, 20, 35, 15],
          correctAnswer: 20,
          options: [10, 20, 30, 35]
        }
      },
      {
        id: 6,
        globalId: 66,
        title: "Level 66: Allocation Pie Chart",
        topic: "Pie charts basics",
        objective: "Determine which system resource holds the largest sector of the memory pool.",
        codingLink: "Pie Chart Angles. Sector percentages correspond to angular slices of a circle (360 degrees * ratio).",
        unlockedAbility: "Radial Slice Allocator",
        gameType: "data-pie-charts",
        gameData: {
          sectors: [
            { name: "OS", value: 50, color: "#6366f1" },
            { name: "App", value: 30, color: "#a855f7" },
            { name: "Free", value: 20, color: "#10b981" }
          ],
          correctAnswer: "OS",
          options: ["OS", "App", "Free"]
        }
      },
      {
        id: 7,
        globalId: 67,
        title: "Level 67: Telemetry Mean Calculator",
        topic: "Mean",
        objective: "Calculate the arithmetic average of the response speed records.",
        codingLink: "Analytics reporting. Averaging ping speeds, page loads, or frame rates smooths out random spikes for reporting.",
        unlockedAbility: "Arithmetic Mean Solver",
        gameType: "data-mean",
        gameData: {
          values: [4, 8, 12],
          correctAnswer: 8,
          options: [6, 8, 10, 12]
        }
      },
      {
        id: 8,
        globalId: 68,
        title: "Level 68: Response Median Locator",
        topic: "Median",
        objective: "Locate the middle value of the sorted speed records.",
        codingLink: "Median filters. Median statistics strip away extreme outliers (like a single 5-second lag) to find typical system performance.",
        unlockedAbility: "Median Filter Engine",
        gameType: "data-median",
        gameData: {
          values: [3, 5, 7, 8, 10],
          correctAnswer: 7,
          options: [5, 7, 8, 10]
        }
      },
      {
        id: 9,
        globalId: 69,
        title: "Level 69: Frequent Mode Classifier",
        topic: "Mode",
        objective: "Identify the telemetry value code that occurs with the highest frequency.",
        codingLink: "Telemetry telemetry. Tracking modes isolates the most common system events, errors, or popular actions.",
        unlockedAbility: "Mode Frequency Classifier",
        gameType: "data-mode",
        gameData: {
          values: [2, 4, 4, 6, 8],
          correctAnswer: 4,
          options: [2, 4, 6, 8]
        }
      },
      {
        id: 10,
        globalId: 70,
        title: "Level 70: Multi-metric Interpreter",
        topic: "Simple data interpretation",
        objective: "Calculate the difference between the maximum and minimum server loads.",
        codingLink: "Dynamic Range. Finding difference boundaries (Max - Min) measures telemetry variance in real-time widgets.",
        unlockedAbility: "Part 8 Unlock",
        gameType: "data-interpretation",
        gameData: {
          values: [10, 50, 90],
          correctAnswer: 80,
          options: [40, 50, 80, 90]
        }
      }
    ]
  },
  {
    id: 8,
    title: "Part 8: Problem Solving and Algorithmic Thinking",
    ageGroup: "Ages 11+",
    description: "Engage in step-by-step sequencing, decomposition, error checking, flowchart execution, logical puzzles, and algorithm designs that bridge mathematics directly to block and script programming.",
    levels: [
      {
        id: 1,
        globalId: 71,
        title: "Level 71: Logic Execution Sequencer",
        topic: "Step-by-step problem solving",
        objective: "Arrange the action steps in the correct chronological sequence to boot up the spacecraft.",
        codingLink: "Sequential Execution. Computers run commands strictly in order from top to bottom (Step 1 -> Step 2 -> Step 3).",
        unlockedAbility: "Sequential Execution Parser",
        gameType: "algo-steps",
        gameData: {
          steps: ["Power Core", "Heat Engines", "Deploy Solar Panel"],
          correctAnswer: ["Power Core", "Heat Engines", "Deploy Solar Panel"]
        }
      },
      {
        id: 2,
        globalId: 72,
        title: "Level 72: Problem Decomposition Node",
        topic: "Breaking big problems into small steps",
        objective: "Decompose the master draw task into its essential sub-routines.",
        codingLink: "Decomposition. Complex systems are engineered by breaking them down into modular functions (e.g. building a game involves init(), update(), draw()).",
        unlockedAbility: "Modular Decomposition Resolver",
        gameType: "algo-decomposition",
        gameData: {
          goal: "Draw a House",
          subTasks: ["Draw a Square Base", "Draw a Triangle Roof", "Bake a Cake", "Fly to Space"],
          correctAnswer: ["Draw a Square Base", "Draw a Triangle Roof"]
        }
      },
      {
        id: 3,
        globalId: 73,
        title: "Level 73: Syntax Bug Investigator",
        topic: "Finding mistakes",
        objective: "Locate the anomalous bug step that halts the rover execution track.",
        codingLink: "Code Debugging. Developers inspect lines of log traces to find logic faults or typos that trigger compilation crashes.",
        unlockedAbility: "Debugger Log Console",
        gameType: "algo-bugs",
        gameData: {
          steps: ["Move Forward", "Crash into Wall", "Turn Right", "Reach Goal"],
          correctAnswer: "Crash into Wall",
          options: ["Move Forward", "Crash into Wall", "Turn Right", "Reach Goal"]
        }
      },
      {
        id: 4,
        globalId: 74,
        title: "Level 74: Arithmetic Compiler Patch",
        topic: "Debugging maths errors",
        objective: "Find the math step containing the logical calculation error.",
        codingLink: "Math assertions. Bugs in physics or score arithmetic propagate faults. Finding and patching them restores compiler integrity.",
        unlockedAbility: "Math Assertion Compiler",
        gameType: "algo-math-bugs",
        gameData: {
          steps: ["Step 1: x = 10", "Step 2: y = x + 5 (y is 15)", "Step 3: z = y * 2 (z is 45)"],
          correctAnswer: "Step 3: z = y * 2 (z is 45)",
          options: ["Step 1: x = 10", "Step 2: y = x + 5 (y is 15)", "Step 3: z = y * 2 (z is 45)"]
        }
      },
      {
        id: 5,
        globalId: 75,
        title: "Level 75: Logical Deduction Engine",
        topic: "Logical puzzles",
        objective: "Solve the comparison puzzle: if A > B and B > C, who is the largest?",
        codingLink: "Logical Operators. Conditionals use logic chains (AND, OR, NOT) to evaluate state changes and game events.",
        unlockedAbility: "Logical Operator Parser",
        gameType: "algo-logic-puzzles",
        gameData: {
          text: "A is faster than B. B is faster than C. Who is the fastest?",
          correctAnswer: "A",
          options: ["A", "B", "C"]
        }
      },
      {
        id: 6,
        globalId: 76,
        title: "Level 76: Algorithm Word Logic",
        topic: "Word problems",
        objective: "Translate the situational story into a single execution formula.",
        codingLink: "Functional Requirements. Translating a client story into technical logic is the core task of code design.",
        unlockedAbility: "Requirements Parser API",
        gameType: "algo-word-problems",
        gameData: {
          text: "A server starts with 10 files. It receives 5 more, then deletes 3. How many files remain?",
          correctAnswer: 12,
          options: [10, 12, 15, 18]
        }
      },
      {
        id: 7,
        globalId: 77,
        title: "Level 77: Pattern Cryptography Node",
        topic: "Brain teasers",
        objective: "Decipher the numeric code sequence hidden within the encrypted database.",
        codingLink: "Cryptography. Deciphering sequence codes, hashes, and patterns keeps communications secure from database breaches.",
        unlockedAbility: "Decryption Key Register",
        gameType: "algo-brain-teasers",
        gameData: {
          sequence: [2, 4, 8, 16, "?"],
          correctAnswer: 32,
          options: [24, 28, 30, 32]
        }
      },
      {
        id: 8,
        globalId: 78,
        title: "Level 78: Optimization Strategy Solver",
        topic: "Strategy games",
        objective: "Select the optimal action step that secures victory in the grid matrix challenge.",
        codingLink: "Game AI. Game agents scan candidate move nodes (using minimax or heuristics) to pick the best move path.",
        unlockedAbility: "AI Heuristic Engine",
        gameType: "algo-strategy",
        gameData: {
          routes: [
            { name: "Route Alpha", steps: 3, loss: 0, description: "Direct fiber connection with backup nodes." },
            { name: "Route Beta", steps: 5, loss: 15, description: "Congested public gateway route." },
            { name: "Route Gamma", steps: 4, loss: 10, description: "Wireless node link with high jitter." }
          ],
          correctAnswer: "Route Alpha",
          options: ["Route Alpha", "Route Beta", "Route Gamma"]
        }
      },
      {
        id: 9,
        globalId: 79,
        title: "Level 79: Flowchart Branch Tracer",
        topic: "Flowchart thinking",
        objective: "Trace the condition path in the flowchart: If temperature > 80, set fan to 1. Else set fan to 0. Thermostat reads 85. What is fan?",
        codingLink: "Condition branches. Flowcharts directly represent conditional IF/ELSE blocks inside executable computer memory.",
        unlockedAbility: "Conditional Branch Evaluator",
        gameType: "algo-flowchart",
        gameData: {
          input: 85,
          condition: "Temp > 80?",
          correctAnswer: 1,
          options: [0, 1]
        }
      },
      {
        id: 10,
        globalId: 80,
        title: "Level 80: Loop Execution Architect",
        topic: "Algorithm design for kids",
        objective: "Design the looping routine to repeat the grid movement to reach the exit gate.",
        codingLink: "Loop Structures. Loops (like FOR or WHILE) repeat code segments a set number of times without repeating instructions.",
        unlockedAbility: "Stage 2: Blockly Coding!",
        gameType: "algo-design",
        gameData: {
          goal: "Repeat the forward movement 3 times to reach the destination gate.",
          correctAnswer: "Repeat 3 times: [Move Forward]",
          options: ["Repeat 3 times: [Move Forward]", "Move Forward", "Repeat 2 times: [Move Forward]"]
        }
      }
    ]
  }
];
