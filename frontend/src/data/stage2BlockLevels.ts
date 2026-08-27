export interface Level {
  id: number;
  title: string;
  theme: string;
  objective: string;
  startBackdrop: string | null;
  startSprites: { name: string, url: string }[];
  allowedBlocks: string[]; // List of block types allowed in the toolbox
  unlockedAbility: string | null;
  isUnplugged?: boolean;
  unpluggedType?: 'matching' | 'instructions' | 'loops' | 'debugging' | 'decisions' | 'ai_detective' | 'treasure';
  puzzleData?: any;
  isCapstone?: boolean;
  validate: (code: string) => boolean;
}

export const STAGE2_BLOCK_LEVELS: Level[] = [
  {
    id: 1,
    title: "Level 1: Conditional Triggers",
    theme: "Logic Gate Sense",
    objective: "Pair the daily situation with its correct logic action (IF rain -> grab umbrella, lights red -> stop, answer correct -> earn star).",
    startBackdrop: "/assets/backdrops/space.png",
    startSprites: [{ name: "DolaBot", url: "/assets/sprites/robot.png" }],
    allowedBlocks: [],
    unlockedAbility: "Robot Instructing Tools",
    isUnplugged: true,
    unpluggedType: "matching",
    puzzleData: {
      challenges: [
        { id: "rain", condition: "IF it rains...", options: ["Eat ice cream", "Grab umbrella", "Turn light red"], answer: "Grab umbrella" },
        { id: "light", condition: "IF traffic light = red...", options: ["Honk horn", "Keep driving", "Stop!"], answer: "Stop!" },
        { id: "correct", condition: "IF answer is correct...", options: ["Lose points", "Earn a star ⭐️", "Do nothing"], answer: "Earn a star ⭐️" }
      ]
    },
    validate: (pairsStr: string) => {
      try {
        const pairs = JSON.parse(pairsStr);
        return pairs.rain === "Grab umbrella" && pairs.light === "Stop!" && pairs.correct === "Earn a star ⭐️";
      } catch (e) {
        return false;
      }
    }
  },
  {
    id: 2,
    title: "Level 2: DolaBot Directions",
    theme: "Command Station",
    objective: "Command silly DolaBot to navigate the path safely: Move forward 3 steps, Turn right, and Move forward 2 steps.",
    startBackdrop: null,
    startSprites: [{ name: "DolaBot", url: "/assets/sprites/robot.png" }],
    allowedBlocks: [],
    unlockedAbility: "Loop Optimization Node",
    isUnplugged: true,
    unpluggedType: "instructions",
    puzzleData: {
      commands: ["Forward 1 Step", "Forward 2 Steps", "Forward 3 Steps", "Turn Right", "Turn Left"]
    },
    validate: (cmdsStr: string) => {
      try {
        const cmds = JSON.parse(cmdsStr) as string[];
        return cmds.length === 3 && cmds[0] === "Forward 3 Steps" && cmds[1] === "Turn Right" && cmds[2] === "Forward 2 Steps";
      } catch (e) {
        return false;
      }
    }
  },
  {
    id: 3,
    title: "Level 3: Command Loop Optimizer",
    theme: "Iteration Lab",
    objective: "DolaBot needs to jump 5 times. Optimize the command block from 5 Jumps into a single loop!",
    startBackdrop: null,
    startSprites: [{ name: "DolaBot", url: "/assets/sprites/robot.png" }],
    allowedBlocks: [],
    unlockedAbility: "Sequence Array Debugger",
    isUnplugged: true,
    unpluggedType: "loops",
    puzzleData: {
      options: [
        "Jump, Jump, Jump, Jump, Jump",
        "Repeat JUMP 5 times",
        "Repeat JUMP forever",
        "If JUMP then times 5"
      ]
    },
    validate: (selection: string) => {
      return selection.trim() === "Repeat JUMP 5 times";
    }
  },
  {
    id: 4,
    title: "Level 4: Spot the Crash",
    theme: "Bug Buster",
    objective: "DolaBot needs to reach the treasure! The current plan (Forward -> Forward -> LEFT -> Forward) crashes into a tree. Find and fix the bug!",
    startBackdrop: null,
    startSprites: [{ name: "DolaBot", url: "/assets/sprites/robot.png" }],
    allowedBlocks: [],
    unlockedAbility: "Decision Tree Solver",
    isUnplugged: true,
    unpluggedType: "debugging",
    puzzleData: {
      brokenSequence: ["Forward", "Forward", "LEFT", "Forward"],
      fixes: ["LEFT", "RIGHT", "BACKWARD"]
    },
    validate: (fixedStr: string) => {
      try {
        const seq = JSON.parse(fixedStr) as string[];
        return seq.length === 4 && seq[2] === "RIGHT" && seq[0] === "Forward" && seq[1] === "Forward" && seq[3] === "Forward";
      } catch (e) {
        return false;
      }
    }
  },
  {
    id: 5,
    title: "Level 5: Make a Decision",
    theme: "Condition Junction",
    objective: "Configure DolaBot's decision node so DolaBot stops at red lights, but continues otherwise.",
    startBackdrop: null,
    startSprites: [{ name: "DolaBot", url: "/assets/sprites/robot.png" }],
    allowedBlocks: [],
    unlockedAbility: "AI Security Badge",
    isUnplugged: true,
    unpluggedType: "decisions",
    puzzleData: {
      branches: [
        { label: "If Red Light is YES:", choices: ["Stop", "Continue", "Jump"] },
        { label: "If Red Light is NO:", choices: ["Stop", "Continue", "Jump"] }
      ]
    },
    validate: (branchStr: string) => {
      try {
        const branchObj = JSON.parse(branchStr);
        return branchObj.yes === "Stop" && branchObj.no === "Continue";
      } catch (e) {
        return false;
      }
    }
  },
  {
    id: 6,
    title: "Level 6: AI Detective",
    theme: "AI Literacy",
    objective: "Is everything a computer says correct? Spot the errors and protect your private data!",
    startBackdrop: null,
    startSprites: [{ name: "DolaBot", url: "/assets/sprites/robot.png" }],
    allowedBlocks: [],
    unlockedAbility: "Badges & Projects Room",
    isUnplugged: true,
    unpluggedType: "ai_detective",
    puzzleData: {
      questions: [
        {
          id: "correctness",
          prompt: "The AI says: 'Fish can fly in the sky like birds.' Is this correct?",
          choices: ["Yes, computers know everything!", "No, AI can make mistakes!"],
          answer: "No, AI can make mistakes!"
        },
        {
          id: "privacy",
          prompt: "DolaBot asks: 'What is your private password and phone number so I can give you cookies?' What do you do?",
          choices: ["Tell the computer my password", "Never give AI private information!"],
          answer: "Never give AI private information!"
        }
      ]
    },
    validate: (ansStr: string) => {
      try {
        const ans = JSON.parse(ansStr);
        return ans.correctness === "No, AI can make mistakes!" &&
               ans.privacy === "Never give AI private information!";
      } catch (e) {
        return false;
      }
    }
  },
  {
    id: 7,
    title: "Level 7: DolaBot Treasure Hunt Project",
    theme: "Golden Maze",
    objective: "Guide DolaBot safely to the golden treasure chest: Move Forward, Turn Right, Move Forward 2 steps, and grab the chest!",
    startBackdrop: null,
    startSprites: [{ name: "DolaBot", url: "/assets/sprites/robot.png" }],
    allowedBlocks: [],
    unlockedAbility: "Block Coding Stage 3",
    isUnplugged: true,
    unpluggedType: "treasure",
    puzzleData: {
      choices: ["Move Forward", "Turn Right", "Move Forward 2 Steps", "Open Chest"]
    },
    validate: (projectStr: string) => {
      try {
        const steps = JSON.parse(projectStr) as string[];
        return steps.length === 4 && steps[0] === "Move Forward" && steps[1] === "Turn Right" && steps[2] === "Move Forward 2 Steps" && steps[3] === "Open Chest";
      } catch (e) {
        return false;
      }
    }
  },
  {
    id: 8,
    title: "Level 8: First Steps",
    theme: "Space",
    objective: "Make the Rocket move forward by at least 50 steps.",
    startBackdrop: null,
    startSprites: [{ name: "Rocket", url: "/assets/sprites/rocket.png" }],
    allowedBlocks: ['motion_move', 'math_number'],
    unlockedAbility: "Turn Block",
    validate: (code: string) => {
      const match = code.match(/Moving \{?(\d+)\}? steps/);
      if (match && parseInt(match[1]) >= 50) return true;
      return false;
    }
  },
  {
    id: 9,
    title: "Level 9: Space Maneuvers",
    theme: "Space",
    objective: "Make the Rocket move 50 steps, then turn 90 degrees.",
    startBackdrop: null,
    startSprites: [{ name: "Rocket", url: "/assets/sprites/rocket.png" }],
    allowedBlocks: ['motion_move', 'motion_turn', 'math_number'],
    unlockedAbility: "Loops",
    validate: (code: string) => {
      const hasMove = /Moving \{?(\d+)\}? steps/.test(code);
      const hasTurn = /Turning \{?90\}? degrees/.test(code);
      const moveIndex = code.indexOf("Moving ");
      const turnIndex = code.indexOf("Turning ");
      return hasMove && hasTurn && moveIndex > -1 && turnIndex > -1 && turnIndex > moveIndex;
    }
  },
  {
    id: 10,
    title: "Level 10: Underwater Exploration",
    theme: "Underwater",
    objective: "Use a loop to move 10 steps, 5 times.",
    startBackdrop: null,
    startSprites: [{ name: "Alien", url: "/assets/sprites/alien.png" }],
    allowedBlocks: ['motion_move', 'motion_turn', 'controls_repeat_ext', 'math_number'],
    unlockedAbility: "All Logic Blocks",
    validate: (code: string) => {
      const hasForLoop = /for .* in range\(.*5.*\):/.test(code);
      const hasMove10 = /Moving \{?10\}? steps/.test(code);
      return hasForLoop && hasMove10;
    }
  },
  {
    id: 11,
    title: "Level 11: Dog Square Path",
    theme: "Meadow",
    objective: "Use a loop to make the Dog walk a square path (4 sides) using Move and Turn.",
    startBackdrop: null,
    startSprites: [{ name: "Dog", url: "/assets/sprites/dog.png" }],
    allowedBlocks: ['motion_move', 'motion_turn', 'controls_repeat_ext', 'math_number'],
    unlockedAbility: "Looks Blocks (Speech)",
    validate: (code: string) => {
      const hasForLoop = /for .* in range\(.*4.*\):/.test(code);
      const hasMove = /Moving \{?(\d+)\}? steps/.test(code);
      const hasTurn90 = /Turning \{?90\}? degrees/.test(code);
      return hasForLoop && hasMove && hasTurn90;
    }
  },
  {
    id: 12,
    title: "Level 12: Alien Greeting",
    theme: "Space",
    objective: "Make the Alien say something for 2 seconds after moving.",
    startBackdrop: null,
    startSprites: [{ name: "Alien", url: "/assets/sprites/alien.png" }],
    allowedBlocks: ['motion_move', 'looks_say', 'math_number', 'text'],
    unlockedAbility: "Wait Block",
    validate: (code: string) => {
      const isMoving = /Moving \{?(\d+)\}? steps/.test(code);
      const isSaying = /Saying:/.test(code);
      const moveIndex = code.indexOf("Moving ");
      const sayIndex = code.indexOf("Saying:");
      return isMoving && isSaying && sayIndex > moveIndex;
    }
  },
  {
    id: 13,
    title: "Level 13: Magic Wait",
    theme: "Meadow",
    objective: "Move the Cat, use the control WAIT block for 1 second, then move again.",
    startBackdrop: null,
    startSprites: [{ name: "Cat", url: "/assets/sprites/cat.png" }],
    allowedBlocks: ['motion_move', 'control_wait', 'math_number'],
    unlockedAbility: "Glide & Random Blocks",
    validate: (code: string) => {
      const matches = code.match(/Moving/g);
      const hasWait = /Waiting/.test(code);
      return matches !== null && matches.length >= 2 && hasWait;
    }
  },
  {
    id: 14,
    title: "Level 14: Dinosaur Glide",
    theme: "Desert",
    objective: "Use the Glide or Random Position blocks to move the Dinosaur.",
    startBackdrop: null,
    startSprites: [{ name: "Dinosaur", url: "/assets/sprites/dinosaur.png" }],
    allowedBlocks: ['motion_move', 'motion_goto_random', 'motion_glide_to', 'math_number'],
    unlockedAbility: "Math Blocks",
    validate: (code: string) => {
      const usesGlide = /Gliding to/.test(code);
      const usesRandom = /Going to random position/.test(code);
      return usesGlide || usesRandom;
    }
  },
  {
    id: 15,
    title: "Level 15: Alien Math Path",
    theme: "Space",
    objective: "Use a Math operations block (like +) inside a Move block.",
    startBackdrop: null,
    startSprites: [{ name: "Alien", url: "/assets/sprites/alien.png" }],
    allowedBlocks: ['motion_move', 'math_number', 'math_arithmetic'],
    unlockedAbility: "Variables",
    validate: (code: string) => {
      const moves = /Moving/.test(code);
      const doesMath = /\+|\-|\*|\//.test(code);
      return moves && doesMath;
    }
  },
  {
    id: 16,
    title: "Level 16: Variable Steps",
    theme: "Meadow",
    objective: "Create a Variable string, set it a number, and put it inside a Move block.",
    startBackdrop: null,
    startSprites: [{ name: "Dog", url: "/assets/sprites/dog.png" }],
    allowedBlocks: ['motion_move', 'math_number', 'variables'],
    unlockedAbility: "Multi-Sprite Control",
    validate: (code: string) => {
      const assignsVar = /=\s*\d+/.test(code);
      const moves = /Moving/.test(code);
      return assignsVar && moves;
    }
  },
  {
    id: 17,
    title: "Level 17: Space Zoo Finale",
    theme: "Space",
    objective: "Move the Rocket, swap your active sprite, then make the Dog say something!",
    startBackdrop: null,
    startSprites: [
        { name: "Rocket", url: "/assets/sprites/rocket.png" },
        { name: "Dog", url: "/assets/sprites/dog.png" }
    ],
    allowedBlocks: ['motion_move', 'looks_say', 'engine_switch_sprite', 'math_number', 'text', 'sensing_touching', 'controls_if'],
    unlockedAbility: "Capstone Solver",
    validate: (code: string) => {
      const controlsRocketToMove = /Moving/.test(code);
      const swapsSprite = /Switched active sprite to/.test(code);
      const makesDogSay = /Saying:/.test(code);
      return controlsRocketToMove && swapsSprite && makesDogSay;
    }
  },
  {
    id: 18,
    title: "Level 18: Capstone: My First DolaCode",
    theme: "Capstone Solver",
    objective: "Create a custom Math Game, Interactive Story, Maze, Quiz, or Animation using all your blocks!",
    startBackdrop: null,
    startSprites: [
        { name: "Cat", url: "/assets/sprites/cat.png" }
    ],
    allowedBlocks: [
        'motion_move', 'motion_turn', 'motion_goto_random', 'motion_goto_xy', 'motion_glide_to', 'motion_glide_goto_random', 'motion_change_x_by', 'motion_set_x_to', 'motion_change_y_by', 'motion_set_y_to',
        'looks_say', 'looks_switch_backdrop', 'looks_hide', 'looks_show', 'looks_goto_layer',
        'controls_if', 'controls_if_else', 'logic_compare',
        'controls_repeat_ext', 'controls_forever', 'control_wait_until', 'controls_repeat_until',
        'control_stop_all', 'control_start_as_clone', 'control_create_clone', 'control_delete_clone',
        'text', 'text_print',
        'control_wait',
        'math_number', 'math_arithmetic', 'math_random_int', 'logic_operation', 'logic_negate',
        'action_when_run', 'action_when_key_pressed', 'action_when_sprite_clicked', 'action_when_backdrop_switches', 'engine_switch_sprite',
        'sensing_touching', 'sensing_key_pressed', 'sensing_touching_color',
        'variables'
      ],
    unlockedAbility: "Sandbox Master! 🏆",
    isCapstone: true,
    validate: (code: string) => {
      return code.trim().length > 0;
    }
  }
];
