export interface Level {
  id: number;
  title: string;
  theme: string;
  objective: string;
  hint?: string;
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
    hint: "Drag the 'move 10 steps' block into your workspace and change 10 to 50 or more!",
    startBackdrop: "/assets/backdrops/space.png",
    startSprites: [{ name: "Rocket", url: "/assets/sprites/rocket.png" }],
    allowedBlocks: ['motion_move', 'math_number'],
    unlockedAbility: "Turn Block",
    validate: (code: string) => {
      const match = code.match(/Moving \{?(\d+)\}? steps/);
      if (match && parseInt(match[1]) >= 50) return true;
      const jsMatch = code.match(/window\.move\([^,]+,\s*(\d+)\)/);
      if (jsMatch && parseInt(jsMatch[1]) >= 50) return true;
      return false;
    }
  },
  {
    id: 9,
    title: "Level 9: Space Maneuvers",
    theme: "Space",
    objective: "Make the Rocket move 50 steps, then turn 90 degrees.",
    hint: "Snap a 'move 50 steps' block, then snap a 'turn ↻ 90 degrees' block right below it.",
    startBackdrop: "/assets/backdrops/space.png",
    startSprites: [{ name: "Rocket", url: "/assets/sprites/rocket.png" }],
    allowedBlocks: ['motion_move', 'motion_turn', 'math_number'],
    unlockedAbility: "Loops",
    validate: (code: string) => {
      const hasMove = /Moving|window\.move/.test(code);
      const hasTurn = /Turning \{?90\}?|window\.turn\([^,]+,\s*90\)/.test(code);
      const moveIndex = Math.max(code.indexOf("Moving"), code.indexOf("window.move"));
      const turnIndex = Math.max(code.indexOf("Turning"), code.indexOf("window.turn"));
      return hasMove && hasTurn && moveIndex > -1 && turnIndex > -1 && turnIndex > moveIndex;
    }
  },
  {
    id: 10,
    title: "Level 10: Underwater Exploration",
    theme: "Underwater",
    objective: "Use a loop to move 10 steps, 5 times.",
    hint: "From Logic & Control, wrap a 'move 10 steps' block inside a 'repeat 5 times' loop block.",
    startBackdrop: "/assets/backdrops/underwater.png",
    startSprites: [{ name: "Alien", url: "/assets/sprites/alien.png" }],
    allowedBlocks: ['motion_move', 'motion_turn', 'controls_repeat_ext', 'math_number'],
    unlockedAbility: "All Logic Blocks",
    validate: (code: string) => {
      const hasForLoop = /for .* in range\(.*5.*\):/.test(code);
      const hasMove = /Moving|window\.move/.test(code);
      return hasForLoop && hasMove;
    }
  },
  {
    id: 11,
    title: "Level 11: Dog Square Path",
    theme: "Meadow",
    objective: "Use a loop to make the Dog walk a square path (4 sides) using Move and Turn.",
    hint: "Inside a 'repeat 4 times' loop, put a 'move 40 steps' block followed by a 'turn ↻ 90 degrees' block.",
    startBackdrop: "/assets/backdrops/meadow.png",
    startSprites: [{ name: "Dog", url: "/assets/sprites/dog.png" }],
    allowedBlocks: ['motion_move', 'motion_turn', 'controls_repeat_ext', 'math_number'],
    unlockedAbility: "Looks Blocks (Speech)",
    validate: (code: string) => {
      const hasForLoop = /for .* in range\(.*4.*\):/.test(code);
      const hasMove = /Moving|window\.move/.test(code);
      const hasTurn90 = /Turning \{?90\}?|window\.turn\([^,]+,\s*90\)/.test(code);
      return hasForLoop && hasMove && hasTurn90;
    }
  },
  {
    id: 12,
    title: "Level 12: Alien First Contact",
    theme: "Deep Space",
    objective: "Make the Alien move forward at least 20 steps, then say a greeting like 'Hello Earth!' for 2 seconds.",
    hint: "Snap: 'move 20 steps' -> 'say [Hello Earth!] for 2 seconds'.",
    startBackdrop: "/assets/backdrops/space.png",
    startSprites: [{ name: "Alien", url: "/assets/sprites/alien.png" }],
    allowedBlocks: ['motion_move', 'looks_say', 'math_number', 'text'],
    unlockedAbility: "Wait Block",
    validate: (code: string) => {
      const isMoving = /Moving|window\.move/.test(code);
      const isSaying = /Saying:|window\.say/.test(code);
      return isMoving && isSaying;
    }
  },
  {
    id: 13,
    title: "Level 13: Robot Dance Beat",
    theme: "Meadow Carnival",
    objective: "Program a dance! Make the Robot move 30 steps, wait 1 second, turn 90 degrees, and move 30 steps again.",
    hint: "Snap: Move 30 -> Wait 1 second -> Turn 90 -> Move 30.",
    startBackdrop: "/assets/backdrops/meadow.png",
    startSprites: [{ name: "Robot", url: "/assets/sprites/robot.png" }],
    allowedBlocks: ['motion_move', 'motion_turn', 'control_wait', 'math_number', 'controls_repeat_ext'],
    unlockedAbility: "Glide & Coordinates",
    validate: (code: string) => {
      const moveCount = (code.match(/Moving|window\.move/g) || []).length;
      const hasWait = /Waiting|window\.wait/.test(code);
      const hasTurn = /Turning|window\.turn/.test(code);
      return (moveCount >= 2 && hasWait) || (hasTurn && hasWait && moveCount >= 1);
    }
  },
  {
    id: 14,
    title: "Level 14: Dinosaur Desert Glide",
    theme: "Prehistoric Desert",
    objective: "Guide the Dinosaur across the desert! Use 'glide to x, y' or 'go to random position' to explore.",
    hint: "Drag the 'glide to x: 80 y: 40 in 1 secs' or 'go to random position' block into the workspace and run it!",
    startBackdrop: "/assets/backdrops/desert.png",
    startSprites: [{ name: "Dinosaur", url: "/assets/sprites/dinosaur.png" }],
    allowedBlocks: ['motion_move', 'motion_goto_random', 'motion_glide_to', 'motion_goto_xy', 'motion_glide_goto_random', 'math_number'],
    unlockedAbility: "Math Operations",
    validate: (code: string) => {
      const usesGlide = /Gliding to|window\.goTo/i.test(code);
      const usesRandom = /random position|teleport/i.test(code);
      return usesGlide || usesRandom;
    }
  },
  {
    id: 15,
    title: "Level 15: Rocket Math Boost",
    theme: "Space Station",
    objective: "Calculate hyper-speed! Place a Math (+) or (*) operation block inside the Move block so the rocket moves (25 + 25) steps.",
    hint: "From the Math category, drag the '+' block and snap it directly inside the Move block's steps slot!",
    startBackdrop: "/assets/backdrops/space.png",
    startSprites: [{ name: "Rocket", url: "/assets/sprites/rocket.png" }],
    allowedBlocks: ['motion_move', 'math_number', 'math_arithmetic'],
    unlockedAbility: "Variables",
    validate: (code: string) => {
      const moves = /Moving|window\.move/.test(code);
      const doesMath = /\+|\-|\*|\//.test(code);
      return moves && doesMath;
    }
  },
  {
    id: 16,
    title: "Level 16: Variable Speed Racer",
    theme: "Meadow Track",
    objective: "Create a variable (like 'speed'), set it to 50, and snap it into the Move block to race across the meadow!",
    hint: "Open the Variables category, click 'Create variable...' and name it 'speed'. Set speed to 50, then drag 'speed' into 'move [ ] steps'.",
    startBackdrop: "/assets/backdrops/meadow.png",
    startSprites: [{ name: "Dog", url: "/assets/sprites/dog.png" }],
    allowedBlocks: ['motion_move', 'math_number', 'variables'],
    unlockedAbility: "Collision Sensing",
    validate: (code: string) => {
      const setsVariable = /=\s*\d+/.test(code);
      const moves = /Moving|window\.move/.test(code);
      return setsVariable && moves;
    }
  },
  {
    id: 17,
    title: "Level 17: Space Tag & Sensing",
    theme: "Deep Space",
    objective: "Multi-Sprite coordination! Make the Rocket move towards the Alien, and use an IF Touching block or Say block to tag the Alien!",
    hint: "Make the Rocket move forward, and snap 'if touching Alien then say [Tagged you!]' or 'say [Tagged you!]'.",
    startBackdrop: "/assets/backdrops/space.png",
    startSprites: [
      { name: "Rocket", url: "/assets/sprites/rocket.png" },
      { name: "Alien", url: "/assets/sprites/alien.png" }
    ],
    allowedBlocks: ['motion_move', 'motion_turn', 'looks_say', 'controls_if', 'sensing_touching', 'math_number', 'text'],
    unlockedAbility: "Keyboard Event Controls",
    validate: (code: string) => {
      const moves = /Moving|window\.move/.test(code);
      const touchesOrSays = /isTouching|Saying:|window\.say|Tagged/i.test(code);
      return moves && touchesOrSays;
    }
  },
  {
    id: 18,
    title: "Level 18: Keyboard Hero Controls",
    theme: "Arcade Arena",
    objective: "Make your character playable! Snap a Move block inside 'when right arrow key pressed' or 'when space key pressed' and drive your character with the keyboard!",
    hint: "From the Action category, drag 'when [right arrow] key pressed' and put a 'move 20 steps' block inside it. Then press that arrow key on your keyboard!",
    startBackdrop: "/assets/backdrops/meadow.png",
    startSprites: [{ name: "Cat", url: "/assets/sprites/cat.png" }],
    allowedBlocks: ['action_when_key_pressed', 'action_when_run', 'motion_move', 'motion_turn', 'motion_change_x_by', 'motion_change_y_by', 'looks_say', 'math_number', 'text'],
    unlockedAbility: "Game Loops (Forever)",
    validate: (code: string) => {
      const hasKey = /_on_key_|isKeyPressed|Registered key listener|when.*key pressed/i.test(code);
      const hasAction = /Moving|Turning|changeX|changeY|Saying|window\.move/i.test(code);
      return hasKey && hasAction;
    }
  },
  {
    id: 19,
    title: "Level 19: Forever Patrol Loop",
    theme: "Underwater Reef",
    objective: "Build a continuous game animation! Use a 'forever' loop to make the Alien patrol back and forth: move 30 steps, turn 180 degrees, and wait 0.5 seconds!",
    hint: "Wrap your Move, Turn 180, and Wait blocks inside a 'forever' block. Hit Run to see the infinite patrol!",
    startBackdrop: "/assets/backdrops/underwater.png",
    startSprites: [{ name: "Alien", url: "/assets/sprites/alien.png" }],
    allowedBlocks: ['controls_forever', 'motion_move', 'motion_turn', 'control_wait', 'math_number'],
    unlockedAbility: "Score Counter & Variables",
    validate: (code: string) => {
      const hasForever = /while True:|forever|Starting forever loop/i.test(code);
      const hasMoveOrTurn = /Moving|Turning|window\.move|window\.turn/i.test(code);
      return hasForever && hasMoveOrTurn;
    }
  },
  {
    id: 20,
    title: "Level 20: Star Catcher & Score",
    theme: "Cosmic Galaxy",
    objective: "Build game logic! In a loop, move the Rocket forward and check IF touching Alien, then say 'Score +1!' to collect the star!",
    hint: "Use a loop or forever block, place 'if touching Alien' inside, and put 'say [Score +1!]' inside the IF block.",
    startBackdrop: "/assets/backdrops/space.png",
    startSprites: [
      { name: "Rocket", url: "/assets/sprites/rocket.png" },
      { name: "Alien", url: "/assets/sprites/alien.png" }
    ],
    allowedBlocks: ['controls_forever', 'controls_repeat_ext', 'controls_if', 'sensing_touching', 'motion_move', 'looks_say', 'variables', 'math_number', 'text'],
    unlockedAbility: "Wizard Cloning Magic",
    validate: (code: string) => {
      const hasCondition = /if .*isTouching|if.*touching/i.test(code);
      const hasMove = /Moving|window\.move/i.test(code);
      const hasFeedback = /Saying:|Score|window\.say/i.test(code);
      return (hasCondition && hasMove) || (hasCondition && hasFeedback) || (hasMove && hasFeedback);
    }
  },
  {
    id: 21,
    title: "Level 21: Wizard Clone Army",
    theme: "Magic Forest",
    objective: "Unleash magic cloning! Use 'create clone of myself' or 'switch backdrop' inside a repeat loop to multiply your Wizard!",
    hint: "From Logic & Control, drag 'create clone of myself' inside a 'repeat 3 times' loop, or use 'switch backdrop' to change the realm!",
    startBackdrop: "/assets/backdrops/meadow.png",
    startSprites: [{ name: "Wizard", url: "/assets/sprites/wizard.png" }],
    allowedBlocks: ['control_create_clone', 'control_start_as_clone', 'looks_switch_backdrop', 'looks_say', 'motion_goto_random', 'controls_repeat_ext', 'math_number', 'text'],
    unlockedAbility: "Capstone Studio Master! 🏆",
    validate: (code: string) => {
      const hasClone = /createClone|on_clone_start|Created clone/i.test(code);
      const hasBackdrop = /switchBackdrop|Switched backdrop/i.test(code);
      const hasSayOrRandom = /Saying:|teleport|goTo|window\.say/i.test(code);
      return hasClone || hasBackdrop || hasSayOrRandom;
    }
  },
  {
    id: 22,
    title: "Level 22: Capstone: My Dream Game Studio",
    theme: "Capstone Solver",
    objective: "Master Block Coder! Use all your unlocked blocks (Motion, Looks, Loops, Events, Sensing, Variables) to build your ultimate project!",
    hint: "Plan your project with the SOLVE wizard, then snap blocks together to bring your dream game or story to life!",
    startBackdrop: "/assets/backdrops/space.png",
    startSprites: [
      { name: "Cat", url: "/assets/sprites/cat.png" },
      { name: "Rocket", url: "/assets/sprites/rocket.png" }
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
    unlockedAbility: "World 3 Python Pioneer Unlocked! 🚀🏆",
    isCapstone: true,
    validate: (code: string) => {
      return code.trim().length > 0;
    }
  }
];
