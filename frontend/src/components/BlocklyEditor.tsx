'use client';
import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';

// Define custom blocks
if (typeof Blockly !== 'undefined' && Blockly.Blocks) {
  // Override colors for logic blocks to make them green like math blocks
  const setBlockColor = (blockName: string, color: string) => {
    if (Blockly.Blocks[blockName]) {
      const origInit = Blockly.Blocks[blockName].init;
      if (!(origInit as any)._colorPatched) {
        Blockly.Blocks[blockName].init = function() {
          origInit.call(this);
          this.setColour(color);
        };
        (Blockly.Blocks[blockName].init as any)._colorPatched = true;
      }
    }
  };
  setBlockColor('logic_compare', '#59C059');
  setBlockColor('logic_operation', '#59C059');
  setBlockColor('logic_negate', '#59C059');
  if (!Blockly.Blocks['motion_move']) {
    Blockly.Blocks['motion_move'] = {
      init: function() {
        this.appendDummyInput().appendField("move");
        this.appendValueInput("STEPS").setCheck("Number");
        this.appendDummyInput().appendField("steps");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6'); // lightblue
      }
    };
    pythonGenerator.forBlock['motion_move'] = function(block: any, generator: any) {
      const steps = generator.valueToCode(block, 'STEPS', generator.ORDER_NONE) || '10';
      return `import js\nawait js.window.move(__SPRITE_ID__, ${steps})\nprint(f"Moving {${steps}} steps...")\n`;
    };
  }

  if (!Blockly.Blocks['motion_turn']) {
    Blockly.Blocks['motion_turn'] = {
      init: function() {
        this.appendDummyInput().appendField("turn ↻");
        this.appendValueInput("DEGREES").setCheck("Number");
        this.appendDummyInput().appendField("degrees");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6'); // lightblue
      }
    };
    pythonGenerator.forBlock['motion_turn'] = function(block: any, generator: any) {
      const deg = generator.valueToCode(block, 'DEGREES', generator.ORDER_NONE) || '15';
      return `import js\nawait js.window.turn(__SPRITE_ID__, ${deg})\nprint(f"Turning {${deg}} degrees...")\n`;
    };
  }

  if (!Blockly.Blocks['motion_goto_random']) {
    Blockly.Blocks['motion_goto_random'] = {
      init: function() {
        this.appendDummyInput().appendField("go to random position");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6'); // lightblue
      }
    };
    pythonGenerator.forBlock['motion_goto_random'] = function(block: any, generator: any) {
      return 'import random\nimport js\nx, y = random.randint(-200, 200), random.randint(-150, 150)\nawait js.window.teleport(__SPRITE_ID__, x, y)\nprint(f"Going to random position ({x}, {y})")\n';
    };
  }

  if (!Blockly.Blocks['motion_glide_to']) {
    Blockly.Blocks['motion_glide_to'] = {
      init: function() {
        this.appendDummyInput().appendField("glide to x:");
        this.appendValueInput("X").setCheck("Number");
        this.appendDummyInput().appendField("y:");
        this.appendValueInput("Y").setCheck("Number");
        this.appendDummyInput().appendField("in");
        this.appendValueInput("SECS").setCheck("Number");
        this.appendDummyInput().appendField("secs");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6'); // lightblue
      }
    };
    pythonGenerator.forBlock['motion_glide_to'] = function(block: any, generator: any) {
      const x = generator.valueToCode(block, 'X', generator.ORDER_NONE) || '0';
      const y = generator.valueToCode(block, 'Y', generator.ORDER_NONE) || '0';
      const secs = generator.valueToCode(block, 'SECS', generator.ORDER_NONE) || '1';
      return `import js\nawait js.window.goTo(__SPRITE_ID__, ${x}, ${y})\nprint(f"Gliding to ({${x}}, {${y}}) in {${secs}} seconds...")\n`;
    };
  }

  if (!Blockly.Blocks['motion_goto_xy']) {
    Blockly.Blocks['motion_goto_xy'] = {
      init: function() {
        this.appendDummyInput().appendField("go to x:");
        this.appendValueInput("X").setCheck("Number");
        this.appendDummyInput().appendField("y:");
        this.appendValueInput("Y").setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6');
      }
    };
    pythonGenerator.forBlock['motion_goto_xy'] = function(block: any, generator: any) {
      const x = generator.valueToCode(block, 'X', generator.ORDER_NONE) || '0';
      const y = generator.valueToCode(block, 'Y', generator.ORDER_NONE) || '0';
      return `import js\nawait js.window.teleport(__SPRITE_ID__, ${x}, ${y})\nprint(f"Going to ({${x}}, {${y}})")\n`;
    };
  }

  if (!Blockly.Blocks['motion_glide_goto_random']) {
    Blockly.Blocks['motion_glide_goto_random'] = {
      init: function() {
        this.appendDummyInput().appendField("glide to random position in");
        this.appendValueInput("SECS").setCheck("Number");
        this.appendDummyInput().appendField("secs");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6');
      }
    };
    pythonGenerator.forBlock['motion_glide_goto_random'] = function(block: any, generator: any) {
      const secs = generator.valueToCode(block, 'SECS', generator.ORDER_NONE) || '1';
      return `import random\nimport js\nx, y = random.randint(-200, 200), random.randint(-150, 150)\nawait js.window.goTo(__SPRITE_ID__, x, y)\nprint(f"Gliding to random position ({x}, {y}) in {${secs}} seconds...")\n`;
    };
  }

  if (!Blockly.Blocks['motion_change_x_by']) {
    Blockly.Blocks['motion_change_x_by'] = {
      init: function() {
        this.appendDummyInput().appendField("change x by");
        this.appendValueInput("DX").setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6');
      }
    };
    pythonGenerator.forBlock['motion_change_x_by'] = function(block: any, generator: any) {
      const dx = generator.valueToCode(block, 'DX', generator.ORDER_NONE) || '10';
      return `import js\nawait js.window.changeX(__SPRITE_ID__, ${dx})\nprint(f"Changed X by {${dx}}")\n`;
    };
  }

  if (!Blockly.Blocks['motion_set_x_to']) {
    Blockly.Blocks['motion_set_x_to'] = {
      init: function() {
        this.appendDummyInput().appendField("set x to");
        this.appendValueInput("X").setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6');
      }
    };
    pythonGenerator.forBlock['motion_set_x_to'] = function(block: any, generator: any) {
      const x = generator.valueToCode(block, 'X', generator.ORDER_NONE) || '0';
      return `import js\nawait js.window.setX(__SPRITE_ID__, ${x})\nprint(f"Set X to {${x}}")\n`;
    };
  }

  if (!Blockly.Blocks['motion_change_y_by']) {
    Blockly.Blocks['motion_change_y_by'] = {
      init: function() {
        this.appendDummyInput().appendField("change y by");
        this.appendValueInput("DY").setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6');
      }
    };
    pythonGenerator.forBlock['motion_change_y_by'] = function(block: any, generator: any) {
      const dy = generator.valueToCode(block, 'DY', generator.ORDER_NONE) || '10';
      return `import js\nawait js.window.changeY(__SPRITE_ID__, ${dy})\nprint(f"Changed Y by {${dy}}")\n`;
    };
  }

  if (!Blockly.Blocks['motion_set_y_to']) {
    Blockly.Blocks['motion_set_y_to'] = {
      init: function() {
        this.appendDummyInput().appendField("set y to");
        this.appendValueInput("Y").setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#5CB1D6');
      }
    };
    pythonGenerator.forBlock['motion_set_y_to'] = function(block: any, generator: any) {
      const y = generator.valueToCode(block, 'Y', generator.ORDER_NONE) || '0';
      return `import js\nawait js.window.setY(__SPRITE_ID__, ${y})\nprint(f"Set Y to {${y}}")\n`;
    };
  }

  if (!Blockly.Blocks['important_block']) {
    Blockly.Blocks['important_block'] = {
      init: function() {
        this.appendDummyInput().appendField("⭐ important block ⭐");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(330);
      }
    };
    pythonGenerator.forBlock['important_block'] = function(block: any, generator: any) {
      return 'print("Executing IMPORTANT BLOCK!")\n';
    };
  }
  if (!Blockly.Blocks['looks_say']) {
    Blockly.Blocks['looks_say'] = {
      init: function() {
        this.appendDummyInput().appendField("say");
        this.appendValueInput("TEXT").setCheck("String");
        this.appendDummyInput().appendField("for");
        this.appendValueInput("SECS").setCheck("Number");
        this.appendDummyInput().appendField("seconds");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF'); // purple
      }
    };
    pythonGenerator.forBlock['looks_say'] = function(block: any, generator: any) {
      const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '"Hello!"';
      const secs = generator.valueToCode(block, 'SECS', generator.ORDER_NONE) || '2';
      return `import js\nawait js.window.say(__SPRITE_ID__, ${text}, ${secs} * 1000)\nprint(f"Saying: {${text}}")\n`;
    };
  }

  if (!Blockly.Blocks['looks_switch_backdrop']) {
    Blockly.Blocks['looks_switch_backdrop'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("switch backdrop to")
            .appendField(new Blockly.FieldDropdown([
                ["Space", "/assets/backdrops/space.png"],
                ["Meadow", "/assets/backdrops/meadow.png"],
                ["Desert", "/assets/backdrops/desert.png"],
                ["Underwater", "/assets/backdrops/underwater.png"]
            ]), "BACKDROP");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF'); // purple
      }
    };
    pythonGenerator.forBlock['looks_switch_backdrop'] = function(block: any, generator: any) {
      const backdrop = block.getFieldValue('BACKDROP');
      return `import js\nawait js.window.switchBackdrop(__SPRITE_ID__, '${backdrop}')\nprint("Switched backdrop to ${backdrop}")\n`;
    };
  }

  if (!Blockly.Blocks['looks_hide']) {
    Blockly.Blocks['looks_hide'] = {
      init: function() {
        this.appendDummyInput().appendField("hide");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF'); // purple
      }
    };
    pythonGenerator.forBlock['looks_hide'] = function(block: any, generator: any) {
      return `import js\nawait js.window.hideSprite(__SPRITE_ID__)\nprint("Hid sprite")\n`;
    };
  }

  if (!Blockly.Blocks['looks_show']) {
    Blockly.Blocks['looks_show'] = {
      init: function() {
        this.appendDummyInput().appendField("show");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF'); // purple
      }
    };
    pythonGenerator.forBlock['looks_show'] = function(block: any, generator: any) {
      return `import js\nawait js.window.showSprite(__SPRITE_ID__)\nprint("Showed sprite")\n`;
    };
  }

  if (!Blockly.Blocks['looks_goto_layer']) {
    Blockly.Blocks['looks_goto_layer'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("go to")
            .appendField(new Blockly.FieldDropdown([["front", "front"], ["back", "back"]]), "LAYER")
            .appendField("layer");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF'); // purple
      }
    };
    pythonGenerator.forBlock['looks_goto_layer'] = function(block: any, generator: any) {
      const layer = block.getFieldValue('LAYER');
      return `import js\nawait js.window.goToLayer(__SPRITE_ID__, '${layer}')\nprint("Moved to ${layer} layer")\n`;
    };
  }

  if (!Blockly.Blocks['control_wait']) {
    Blockly.Blocks['control_wait'] = {
      init: function() {
        this.appendValueInput("DURATION").setCheck("Number");
        this.appendDummyInput().appendField("seconds");
        this.appendDummyInput().insertFieldAt(0, "wait");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFAB19'); // orange
      }
    };
    pythonGenerator.forBlock['control_wait'] = function(block: any, generator: any) {
      const dur = generator.valueToCode(block, 'DURATION', generator.ORDER_NONE) || '1';
      return `import js\nawait js.window.wait(__SPRITE_ID__, ${dur} * 1000)\nprint(f"Waiting {${dur}} seconds...")\n`;
    };
  }

  if (!Blockly.Blocks['controls_forever']) {
    Blockly.Blocks['controls_forever'] = {
      init: function() {
        this.appendDummyInput().appendField("forever");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setColour('#FFAB19');
      }
    };
    pythonGenerator.forBlock['controls_forever'] = function(block: any, generator: any) {
      const branch = generator.statementToCode(block, 'DO') || '  pass\n';
      return `while True:\n${branch}  await asyncio.sleep(0.01)\n`;
    };
  }

  if (!Blockly.Blocks['controls_if_else']) {
    Blockly.Blocks['controls_if_else'] = {
      init: function() {
        this.appendValueInput("IF0").setCheck("Boolean").appendField("if");
        this.appendStatementInput("DO0").setCheck(null).appendField("then");
        this.appendStatementInput("ELSE").setCheck(null).appendField("else");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFAB19');
      }
    };
    pythonGenerator.forBlock['controls_if_else'] = function(block: any, generator: any) {
      const condition = generator.valueToCode(block, 'IF0', generator.ORDER_NONE) || 'False';
      const branch0 = generator.statementToCode(block, 'DO0') || '  pass\n';
      const branch1 = generator.statementToCode(block, 'ELSE') || '  pass\n';
      return `if ${condition}:\n${branch0}else:\n${branch1}`;
    };
  }

  if (!Blockly.Blocks['control_wait_until']) {
    Blockly.Blocks['control_wait_until'] = {
      init: function() {
        this.appendValueInput("CONDITION").setCheck("Boolean").appendField("wait until");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFAB19');
      }
    };
    pythonGenerator.forBlock['control_wait_until'] = function(block: any, generator: any) {
      const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'False';
      return `while not (${condition}):\n  await asyncio.sleep(0.1)\n`;
    };
  }

  if (!Blockly.Blocks['controls_repeat_until']) {
    Blockly.Blocks['controls_repeat_until'] = {
      init: function() {
        this.appendValueInput("CONDITION").setCheck("Boolean").appendField("repeat until");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFAB19');
      }
    };
    pythonGenerator.forBlock['controls_repeat_until'] = function(block: any, generator: any) {
      const condition = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE) || 'False';
      const branch = generator.statementToCode(block, 'DO') || '  pass\n';
      return `while not (${condition}):\n${branch}  await asyncio.sleep(0.01)\n`;
    };
  }

  if (!Blockly.Blocks['control_stop_all']) {
    Blockly.Blocks['control_stop_all'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("stop")
            .appendField(new Blockly.FieldDropdown([["all","all"], ["this script","this script"]]), "STOP_OPTION");
        this.setPreviousStatement(true, null);
        this.setColour('#FFAB19');
      }
    };
    pythonGenerator.forBlock['control_stop_all'] = function(block: any, generator: any) {
        const option = block.getFieldValue('STOP_OPTION');
        if (option === 'all') {
            return `import js\nawait js.window.stopAll()\nreturn\n`;
        } else {
            return `return\n`;
        }
    };
  }

  if (!Blockly.Blocks['control_start_as_clone']) {
    Blockly.Blocks['control_start_as_clone'] = {
      init: function() {
        this.appendDummyInput().appendField("when I start as a clone");
        this.setNextStatement(true, null);
        this.setColour('#FFAB19');
      }
    };
    pythonGenerator.forBlock['control_start_as_clone'] = function(block: any, generator: any) {
        return `def on_clone_start(__SPRITE_ID__):\n`;
    };
  }

  if (!Blockly.Blocks['control_create_clone']) {
    Blockly.Blocks['control_create_clone'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("create clone of")
            .appendField(new Blockly.FieldDropdown([["myself", "myself"]]), "CLONE_TARGET");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFAB19');
      }
    };
    pythonGenerator.forBlock['control_create_clone'] = function(block: any, generator: any) {
        return `import js\nawait js.window.createClone(__SPRITE_ID__)\n`;
    };
  }

  if (!Blockly.Blocks['control_delete_clone']) {
    Blockly.Blocks['control_delete_clone'] = {
      init: function() {
        this.appendDummyInput().appendField("delete this clone");
        this.setPreviousStatement(true, null);
        this.setColour('#FFAB19');
      }
    };
    pythonGenerator.forBlock['control_delete_clone'] = function(block: any, generator: any) {
        return `import js\nawait js.window.deleteClone(__SPRITE_ID__)\nreturn\n`;
    };
  }

  if (!Blockly.Blocks['engine_switch_sprite']) {
    Blockly.Blocks['engine_switch_sprite'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("switch to sprite")
            .appendField(new Blockly.FieldDropdown([["Cat","Cat"], ["Robot","Robot"], ["Dog","Dog"], ["Alien","Alien"], ["Rocket","Rocket"], ["Dinosaur","Dinosaur"], ["Wizard","Wizard"]]), "SPRITE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF4D4D'); // red
      }
    };
    pythonGenerator.forBlock['engine_switch_sprite'] = function(block: any, generator: any) {
      const sprite = block.getFieldValue('SPRITE');
      return `import js\nawait js.window.activateSprite(__SPRITE_ID__, '${sprite}')\nprint(f"Switched active sprite to {${sprite}}")\n`;
    };
  }

  if (!Blockly.Blocks['action_when_run']) {
    Blockly.Blocks['action_when_run'] = {
      init: function() {
        this.appendDummyInput().appendField("when 🟢 run clicked");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour('#FF4D4D');
      }
    };
    pythonGenerator.forBlock['action_when_run'] = function(block: any, generator: any) {
        const branch = generator.statementToCode(block, 'DO') || '  pass\n';
        const funcName = `_on_run_${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        return `\nasync def ${funcName}():\n${branch}\nawait ${funcName}()\n`;
    };
  }

  if (!Blockly.Blocks['action_when_key_pressed']) {
    Blockly.Blocks['action_when_key_pressed'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when")
            .appendField(new Blockly.FieldDropdown([
                ["space", "space"],
                ["up arrow", "ArrowUp"],
                ["down arrow", "ArrowDown"],
                ["right arrow", "ArrowRight"],
                ["left arrow", "ArrowLeft"],
                ["any", "any"],
                ["a", "a"],
                ["b", "b"]
            ]), "KEY")
            .appendField("key pressed");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour('#FF4D4D');
      }
    };
    pythonGenerator.forBlock['action_when_key_pressed'] = function(block: any, generator: any) {
        const key = block.getFieldValue('KEY');
        const branch = generator.statementToCode(block, 'DO') || '  pass\n';
        const funcName = `_on_key_${key.replace(/[^a-zA-Z0-9]/g, '')}_${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        return `
async def ${funcName}():
    while True:
        if js.window.isKeyPressed('${key}'):
${branch.split('\\n').map((l: string) => l.trim() ? '            ' + l.trimStart() : '').join('\\n')}
            await asyncio.sleep(0.2)
        await asyncio.sleep(0.01)

asyncio.ensure_future(${funcName}())
`;
    };
  }

  if (!Blockly.Blocks['action_when_sprite_clicked']) {
    Blockly.Blocks['action_when_sprite_clicked'] = {
      init: function() {
        this.appendDummyInput().appendField("when this sprite clicked");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour('#FF4D4D');
      }
    };
    pythonGenerator.forBlock['action_when_sprite_clicked'] = function(block: any, generator: any) {
        const branch = generator.statementToCode(block, 'DO') || '  pass\n';
        const funcName = `_on_sprite_click_${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        return `
async def ${funcName}():
    while True:
        if js.window.isSpriteClicked(__SPRITE_ID__):
${branch.split('\\n').map((l: string) => l.trim() ? '            ' + l.trimStart() : '').join('\\n')}
            await asyncio.sleep(0.2)
        await asyncio.sleep(0.01)

asyncio.ensure_future(${funcName}())
`;
    };
  }

  if (!Blockly.Blocks['action_when_backdrop_switches']) {
    Blockly.Blocks['action_when_backdrop_switches'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("when backdrop switches to")
            .appendField(new Blockly.FieldDropdown([
                ["Space", "/assets/backdrops/space.png"],
                ["Meadow", "/assets/backdrops/meadow.png"],
                ["Desert", "/assets/backdrops/desert.png"],
                ["Underwater", "/assets/backdrops/underwater.png"]
            ]), "BACKDROP");
        this.appendStatementInput("DO").setCheck(null);
        this.setColour('#FF4D4D');
      }
    };
    pythonGenerator.forBlock['action_when_backdrop_switches'] = function(block: any, generator: any) {
        const backdrop = block.getFieldValue('BACKDROP');
        const branch = generator.statementToCode(block, 'DO') || '  pass\n';
        const funcName = `_on_backdrop_${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        return `
async def ${funcName}():
    _last_backdrop = js.window.getCurrentBackdrop()
    while True:
        _current = js.window.getCurrentBackdrop()
        if _current == '${backdrop}' and _current != _last_backdrop:
${branch.split('\\n').map((l: string) => l.trim() ? '            ' + l.trimStart() : '').join('\\n')}
        _last_backdrop = _current
        await asyncio.sleep(0.01)

asyncio.ensure_future(${funcName}())
`;
    };
  }

  if (!Blockly.Blocks['sensing_key_pressed']) {
    Blockly.Blocks['sensing_key_pressed'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("key")
            .appendField(new Blockly.FieldDropdown([
                ["space", "space"],
                ["up arrow", "ArrowUp"],
                ["down arrow", "ArrowDown"],
                ["right arrow", "ArrowRight"],
                ["left arrow", "ArrowLeft"],
                ["any", "any"],
                ["a", "a"],
                ["b", "b"]
            ]), "KEY")
            .appendField("pressed?");
        this.setOutput(true, "Boolean");
        this.setColour('#FFD500'); // Sensing color
      }
    };
    pythonGenerator.forBlock['sensing_key_pressed'] = function(block: any, generator: any) {
        const key = block.getFieldValue('KEY');
        return [`js.window.isKeyPressed('${key}')`, generator.ORDER_NONE];
    };
  }

  if (!Blockly.Blocks['sensing_touching_color']) {
    Blockly.Blocks['sensing_touching_color'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("touching color")
            .appendField(new Blockly.FieldDropdown([
                ["red", "#ff0000"],
                ["green", "#00ff00"],
                ["blue", "#0000ff"],
                ["yellow", "#ffff00"],
                ["black", "#000000"],
                ["white", "#ffffff"]
            ]), "COLOR")
            .appendField("?");
        this.setOutput(true, "Boolean");
        this.setColour('#FFD500');
      }
    };
    pythonGenerator.forBlock['sensing_touching_color'] = function(block: any, generator: any) {
        const color = block.getFieldValue('COLOR');
        return [`js.window.isTouchingColor(__SPRITE_ID__, '${color}')`, generator.ORDER_NONE];
    };
  }

  if (!Blockly.Blocks['sensing_touching']) {
    Blockly.Blocks['sensing_touching'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("touching")
            .appendField(new Blockly.FieldDropdown([["Cat","Cat"], ["Robot","Robot"], ["Dog","Dog"], ["Alien","Alien"], ["Rocket","Rocket"], ["Dinosaur","Dinosaur"], ["Wizard","Wizard"]]), "TARGET");
        this.setOutput(true, "Boolean");
        this.setColour('#FFD500'); // yellow
      }
    };
    pythonGenerator.forBlock['sensing_touching'] = function(block: any, generator: any) {
      const target = block.getFieldValue('TARGET');
      return [`js.window.isTouching(__SPRITE_ID__, '${target}')`, generator.ORDER_NONE];
    };
  }
}

// Define Custom Theme for standard blocks
const kidsTheme = Blockly.Theme.defineTheme('kidsTheme', {
  'name': 'kidsTheme',
  'base': Blockly.Themes.Classic,
  'blockStyles': {
    'math_blocks': { 'colourPrimary': '#59C059' }, // green
    'logic_blocks': { 'colourPrimary': '#FFAB19' }, // orange
    'loop_blocks': { 'colourPrimary': '#FFAB19' }, // orange
    'text_blocks': { 'colourPrimary': '#FF66B2' }, // pink
    'variable_blocks': { 'colourPrimary': '#FF8C1A' }
  },
  'categoryStyles': {},
  'componentStyles': {},
  'fontStyle': {},
  'startHats': false
});

export default function BlocklyEditor({ 
  onCodeChange, 
  allowedBlocks,
  activeSpriteId,
  workspaceStates,
  onWorkspaceChange
}: { 
  onCodeChange?: (code: string) => void, 
  allowedBlocks?: string[],
  activeSpriteId?: string | null,
  workspaceStates?: Record<string, any>,
  onWorkspaceChange?: (spriteId: string, state: any, code: string) => void
}) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const isSwitchingRef = useRef(false);
  const workspaceStatesRef = useRef(workspaceStates);
  
  const onCodeChangeRef = useRef(onCodeChange);
  const onWorkspaceChangeRef = useRef(onWorkspaceChange);
  const activeSpriteIdRef = useRef(activeSpriteId);

  useEffect(() => {
      workspaceStatesRef.current = workspaceStates;
  }, [workspaceStates]);

  useEffect(() => {
      onCodeChangeRef.current = onCodeChange;
      onWorkspaceChangeRef.current = onWorkspaceChange;
      activeSpriteIdRef.current = activeSpriteId;
  }, [onCodeChange, onWorkspaceChange, activeSpriteId]);

  const getToolboxXml = (blocks?: string[]) => {
    const hasBlock = (type: string) => !blocks || blocks.includes(type);

    let xml = `<xml>`;
    
    // Motion Category
    if (hasBlock('motion_move') || hasBlock('motion_turn') || hasBlock('motion_goto_random') || hasBlock('motion_glide_to') || hasBlock('motion_goto_xy') || hasBlock('motion_glide_goto_random') || hasBlock('motion_change_x_by') || hasBlock('motion_set_x_to') || hasBlock('motion_change_y_by') || hasBlock('motion_set_y_to')) {
        xml += `<category name="Motion" colour="#5CB1D6">`;
        if (hasBlock('motion_move')) xml += `<block type="motion_move"><value name="STEPS"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>`;
        if (hasBlock('motion_turn')) xml += `<block type="motion_turn"><value name="DEGREES"><shadow type="math_number"><field name="NUM">15</field></shadow></value></block>`;
        if (hasBlock('motion_goto_random')) xml += `<block type="motion_goto_random"></block>`;
        if (hasBlock('motion_goto_xy')) xml += `<block type="motion_goto_xy"><value name="X"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block>`;
        if (hasBlock('motion_glide_to')) xml += `<block type="motion_glide_to"><value name="X"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="SECS"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>`;
        if (hasBlock('motion_glide_goto_random')) xml += `<block type="motion_glide_goto_random"><value name="SECS"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>`;
        if (hasBlock('motion_change_x_by')) xml += `<block type="motion_change_x_by"><value name="DX"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>`;
        if (hasBlock('motion_set_x_to')) xml += `<block type="motion_set_x_to"><value name="X"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block>`;
        if (hasBlock('motion_change_y_by')) xml += `<block type="motion_change_y_by"><value name="DY"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>`;
        if (hasBlock('motion_set_y_to')) xml += `<block type="motion_set_y_to"><value name="Y"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block>`;
        xml += `</category>`;
    }

    // Looks Category
    if (hasBlock('looks_say') || hasBlock('looks_switch_backdrop') || hasBlock('looks_hide') || hasBlock('looks_show') || hasBlock('looks_goto_layer')) {
        xml += `<category name="Looks" colour="#9966FF">`;
        if (hasBlock('looks_say')) xml += `<block type="looks_say"><value name="TEXT"><shadow type="text"><field name="TEXT">Hello!</field></shadow></value><value name="SECS"><shadow type="math_number"><field name="NUM">2</field></shadow></value></block>`;
        if (hasBlock('looks_switch_backdrop')) xml += `<block type="looks_switch_backdrop"></block>`;
        if (hasBlock('looks_hide')) xml += `<block type="looks_hide"></block>`;
        if (hasBlock('looks_show')) xml += `<block type="looks_show"></block>`;
        if (hasBlock('looks_goto_layer')) xml += `<block type="looks_goto_layer"></block>`;
        xml += `</category>`;
    }

    // Logic & Control Category
    if (hasBlock('control_wait') || hasBlock('controls_repeat_ext') || hasBlock('controls_forever') || hasBlock('controls_if') || hasBlock('controls_if_else') || hasBlock('control_wait_until') || hasBlock('controls_repeat_until') || hasBlock('control_stop_all') || hasBlock('control_start_as_clone') || hasBlock('control_create_clone') || hasBlock('control_delete_clone')) {
        xml += `<category name="Logic &amp; Control" colour="#FFAB19">`;
        if (hasBlock('control_wait')) xml += `<block type="control_wait"><value name="DURATION"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>`;
        if (hasBlock('controls_repeat_ext')) xml += `<block type="controls_repeat_ext"><value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>`;
        if (hasBlock('controls_forever')) xml += `<block type="controls_forever"></block>`;
        if (hasBlock('controls_if')) xml += `<block type="controls_if"></block>`;
        if (hasBlock('controls_if_else')) xml += `<block type="controls_if_else"></block>`;
        if (hasBlock('control_wait_until')) xml += `<block type="control_wait_until"></block>`;
        if (hasBlock('controls_repeat_until')) xml += `<block type="controls_repeat_until"></block>`;
        if (hasBlock('control_stop_all')) xml += `<block type="control_stop_all"></block>`;
        if (hasBlock('control_start_as_clone')) xml += `<block type="control_start_as_clone"></block>`;
        if (hasBlock('control_create_clone')) xml += `<block type="control_create_clone"></block>`;
        if (hasBlock('control_delete_clone')) xml += `<block type="control_delete_clone"></block>`;
        xml += `</category>`;
    }

    // Text Category
    if (hasBlock('text') || hasBlock('text_print')) {
        xml += `<category name="Text" colour="#FF66B2">`;
        if (hasBlock('text')) xml += `<block type="text"></block>`;
        if (hasBlock('text_print')) xml += `<block type="text_print"></block>`;
        xml += `</category>`;
    }

    // Mathematical Operations Category
    if (hasBlock('math_number') || hasBlock('math_arithmetic') || hasBlock('math_random_int') || hasBlock('logic_compare') || hasBlock('logic_operation') || hasBlock('logic_negate')) {
        xml += `<category name="Math" colour="#59C059">`;
        if (hasBlock('math_number')) xml += `<block type="math_number"><field name="NUM">1</field></block>`;
        if (hasBlock('math_arithmetic')) xml += `<block type="math_arithmetic"></block>`;
        if (hasBlock('math_random_int')) xml += `<block type="math_random_int"><value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value><value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block>`;
        if (hasBlock('logic_compare')) xml += `<block type="logic_compare"></block>`;
        if (hasBlock('logic_operation')) xml += `<block type="logic_operation"></block>`;
        if (hasBlock('logic_negate')) xml += `<block type="logic_negate"></block>`;
        xml += `</category>`;
    }

    // Action Commands Category
    if (hasBlock('engine_switch_sprite') || hasBlock('action_when_run') || hasBlock('action_when_key_pressed') || hasBlock('action_when_sprite_clicked') || hasBlock('action_when_backdrop_switches')) {
        xml += `<category name="Action" colour="#FF4D4D">`;
        if (hasBlock('action_when_run')) xml += `<block type="action_when_run"></block>`;
        if (hasBlock('action_when_key_pressed')) xml += `<block type="action_when_key_pressed"></block>`;
        if (hasBlock('action_when_sprite_clicked')) xml += `<block type="action_when_sprite_clicked"></block>`;
        if (hasBlock('action_when_backdrop_switches')) xml += `<block type="action_when_backdrop_switches"></block>`;
        if (hasBlock('engine_switch_sprite')) xml += `<block type="engine_switch_sprite"></block>`;
        xml += `</category>`;
    }

    // Sensing Category
    if (hasBlock('sensing_touching') || hasBlock('sensing_key_pressed') || hasBlock('sensing_touching_color')) {
        xml += `<category name="Sensing" colour="#FFD500">`;
        if (hasBlock('sensing_touching')) xml += `<block type="sensing_touching"></block>`;
        if (hasBlock('sensing_key_pressed')) xml += `<block type="sensing_key_pressed"></block>`;
        if (hasBlock('sensing_touching_color')) xml += `<block type="sensing_touching_color"></block>`;
        xml += `</category>`;
    }

    // Variables automatically enabled via string tag `variables`
    if (hasBlock('variables')) {
        xml += `<category name="Variables" colour="#FF8C1A" custom="VARIABLE"></category>`;
    }

    xml += `</xml>`;
    return xml;
  };

  useEffect(() => {
    if (!blocklyDiv.current) return;
    
    // Only inject if not already injected (StrictMode workaround)
    if (!workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: getToolboxXml(allowedBlocks),
        theme: kidsTheme
      });

      // Override default prompt dialogs to avoid native browser alerts
      if (Blockly.dialog) {
        const createCustomDialog = (message: string, defaultValue: string, callback: (value: string | null) => void, isPrompt: boolean = false, isConfirm: boolean = false) => {
          const overlay = document.createElement('div');
          overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-200';
          const modal = document.createElement('div');
          modal.className = 'bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200';
          const title = document.createElement('h3');
          title.className = 'text-xl font-bold text-slate-800 mb-4';
          title.innerText = message;
          
          let input: HTMLInputElement | null = null;
          if (isPrompt) {
              input = document.createElement('input');
              input.className = 'w-full px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800';
              input.value = defaultValue;
              input.type = 'text';
              modal.appendChild(title);
              modal.appendChild(input);
          } else {
              modal.appendChild(title);
          }

          const buttons = document.createElement('div');
          buttons.className = 'flex justify-end gap-3 mt-4';
          
          if (isPrompt || isConfirm) {
              const cancelBtn = document.createElement('button');
              cancelBtn.className = 'px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors';
              cancelBtn.innerText = 'Cancel';
              cancelBtn.onclick = () => { document.body.removeChild(overlay); callback(null); };
              buttons.appendChild(cancelBtn);
          }
          
          const okBtn = document.createElement('button');
          okBtn.className = 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors';
          okBtn.innerText = 'OK';
          okBtn.onclick = () => { 
              document.body.removeChild(overlay); 
              callback(input ? input.value : 'true'); 
          };
          buttons.appendChild(okBtn);
          
          if (input) {
              input.onkeydown = (e) => {
                if (e.key === 'Enter') okBtn.click();
                if (e.key === 'Escape') { document.body.removeChild(overlay); callback(null); }
              };
          }

          modal.appendChild(buttons);
          overlay.appendChild(modal);
          document.body.appendChild(overlay);
          if (input) {
              input.focus();
              input.select();
          } else {
              okBtn.focus();
          }
        };

        Blockly.dialog.setPrompt(function(message: string, defaultValue: string, callback: (value: string | null) => void) {
          createCustomDialog(message, defaultValue, callback, true);
        });
        Blockly.dialog.setAlert(function(message: string, callback?: () => void) {
          createCustomDialog(message, '', () => { if (callback) callback(); }, false);
        });
        Blockly.dialog.setConfirm(function(message: string, callback: (value: boolean) => void) {
          createCustomDialog(message, '', (val) => callback(val !== null), false, true);
        });
      }
    } else {
      // Update toolbox dynamically when allowedBlocks change
      workspace.current.updateToolbox(getToolboxXml(allowedBlocks));
    }

    const onChange = (event: any) => {
      if (isSwitchingRef.current) return; // Prevent saving/generating during workspace switch
      
      if (workspace.current) {
        const code = pythonGenerator.workspaceToCode(workspace.current);
        if (onCodeChangeRef.current) onCodeChangeRef.current(code);
        
        const currentSpriteId = activeSpriteIdRef.current;
        if (currentSpriteId && onWorkspaceChangeRef.current && !event.isUiEvent) {
           const state = Blockly.serialization.workspaces.save(workspace.current);
           onWorkspaceChangeRef.current(currentSpriteId, state, code);
        }
      }
    };
    workspace.current.addChangeListener(onChange);
    
    const onClickListener = (event: any) => {
        if (event.type === Blockly.Events.CLICK || (event.type === Blockly.Events.UI && event.element === 'click')) {
            const block = workspace.current?.getBlockById(event.blockId);
            if (!block) return;
            const win = (window as any);
            const currentSpriteId = activeSpriteIdRef.current;
            if (win.move && currentSpriteId) {
                if (block.type === 'motion_goto_random') {
                    win.teleport(currentSpriteId, Math.random() * 400 - 200, Math.random() * 300 - 150);
                } else if (block.type === 'motion_goto_xy') {
                    const x = block.getInputTargetBlock('X')?.getFieldValue('NUM') || 0;
                    const y = block.getInputTargetBlock('Y')?.getFieldValue('NUM') || 0;
                    win.teleport(currentSpriteId, Number(x), Number(y));
                } else if (block.type === 'motion_glide_to') {
                    const x = block.getInputTargetBlock('X')?.getFieldValue('NUM') || 0;
                    const y = block.getInputTargetBlock('Y')?.getFieldValue('NUM') || 0;
                    win.goTo(currentSpriteId, Number(x), Number(y));
                } else if (block.type === 'motion_glide_goto_random') {
                    win.goTo(currentSpriteId, Math.random() * 400 - 200, Math.random() * 300 - 150);
                } else if (block.type === 'motion_change_x_by') {
                    const dx = block.getInputTargetBlock('DX')?.getFieldValue('NUM') || 10;
                    win.changeX(currentSpriteId, Number(dx));
                } else if (block.type === 'motion_set_x_to') {
                    const x = block.getInputTargetBlock('X')?.getFieldValue('NUM') || 0;
                    win.setX(currentSpriteId, Number(x));
                } else if (block.type === 'motion_change_y_by') {
                    const dy = block.getInputTargetBlock('DY')?.getFieldValue('NUM') || 10;
                    win.changeY(currentSpriteId, Number(dy));
                } else if (block.type === 'motion_set_y_to') {
                    const y = block.getInputTargetBlock('Y')?.getFieldValue('NUM') || 0;
                    win.setY(currentSpriteId, Number(y));
                } else if (block.type === 'motion_move') {
                    const steps = block.getInputTargetBlock('STEPS')?.getFieldValue('NUM') || 10;
                    win.move(currentSpriteId, Number(steps));
                } else if (block.type === 'motion_turn') {
                    const degrees = block.getInputTargetBlock('DEGREES')?.getFieldValue('NUM') || 15;
                    win.turn(currentSpriteId, Number(degrees));
                } else if (block.type === 'looks_say') {
                    const text = block.getInputTargetBlock('TEXT')?.getFieldValue('TEXT') || "Hello!";
                    const secs = block.getInputTargetBlock('SECS')?.getFieldValue('NUM') || 2;
                    win.say(currentSpriteId, String(text), Number(secs) * 1000);
                } else if (block.type === 'looks_switch_backdrop') {
                    const backdrop = block.getFieldValue('BACKDROP') || '/assets/backdrops/space.png';
                    win.switchBackdrop(currentSpriteId, String(backdrop));
                } else if (block.type === 'looks_hide') {
                    win.hideSprite(currentSpriteId);
                } else if (block.type === 'looks_show') {
                    win.showSprite(currentSpriteId);
                } else if (block.type === 'looks_goto_layer') {
                    const layer = block.getFieldValue('LAYER') || 'front';
                    win.goToLayer(currentSpriteId, String(layer));
                } else if (block.type === 'engine_switch_sprite') {
                    const sprite = block.getFieldValue('SPRITE') || 'Cat';
                    win.activateSprite(currentSpriteId, String(sprite));
                }
            }
        }
    };
    workspace.current.addChangeListener(onClickListener);

    return () => {
      workspace.current?.removeChangeListener(onChange);
      workspace.current?.removeChangeListener(onClickListener);
    };
  }, [allowedBlocks]); // Only re-run if allowedBlocks actually changes

  useEffect(() => {
     if (!workspace.current || !activeSpriteId) return;
     
     isSwitchingRef.current = true;
     
     workspace.current.clear();
     
     const states = workspaceStatesRef.current;
     if (states && states[activeSpriteId]) {
        Blockly.serialization.workspaces.load(states[activeSpriteId], workspace.current);
     }
     
     isSwitchingRef.current = false;
     
     // After loading, generate the code and pass it up
     const code = pythonGenerator.workspaceToCode(workspace.current);
     if (onCodeChangeRef.current) onCodeChangeRef.current(code);
     
  }, [activeSpriteId]); // Only run when activeSpriteId changes

  return <div ref={blocklyDiv} className="w-full h-[500px] border border-gray-300 rounded shadow-sm bg-white" />;
}
