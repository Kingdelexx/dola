export interface Level {
  id: number;
  title: string;
  theme: string;
  objective: string;
  startBackdrop: string | null;
  startSprites: { name: string, url: string }[];
  allowedBlocks: string[]; // List of block types allowed in the toolbox
  unlockedAbility: string | null;
  validate: (pythonCode: string) => boolean;
}

export const STAGE2_BLOCK_LEVELS: Level[] = [
  {
    id: 1,
    title: "Level 1: First Steps",
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
    id: 2,
    title: "Level 2: Space Maneuvers",
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
    id: 3,
    title: "Level 3: Underwater Exploration",
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
    id: 4,
    title: "Level 4: Dog Square Path",
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
    id: 5,
    title: "Level 5: Alien Greeting",
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
    id: 6,
    title: "Level 6: Magic Wait",
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
    id: 7,
    title: "Level 7: Dinosaur Glide",
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
    id: 8,
    title: "Level 8: Alien Math Path",
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
    id: 9,
    title: "Level 9: Variable Steps",
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
    id: 10,
    title: "Level 10: Space Zoo Finale",
    theme: "Space",
    objective: "Move the Rocket, swap your active sprite, then make the Dog say something!",
    startBackdrop: null,
    startSprites: [
        { name: "Rocket", url: "/assets/sprites/rocket.png" },
        { name: "Dog", url: "/assets/sprites/dog.png" }
    ],
    allowedBlocks: ['motion_move', 'looks_say', 'engine_switch_sprite', 'math_number', 'text', 'sensing_touching', 'controls_if'],
    unlockedAbility: "Stage 3: Python Code!",
    validate: (code: string) => {
      const controlsRocketToMove = /Moving/.test(code);
      const swapsSprite = /Switched active sprite to/.test(code);
      const makesDogSay = /Saying:/.test(code);
      return controlsRocketToMove && swapsSprite && makesDogSay;
    }
  },
  {
    id: 11,
    title: "Level 11: Free Play Sandbox",
    theme: "Sandbox",
    objective: "You have all the blocks! Build whatever you want.",
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
    unlockedAbility: "Sandbox Master!",
    validate: (code: string) => {
      return code.trim().length > 0;
    }
  }
];
