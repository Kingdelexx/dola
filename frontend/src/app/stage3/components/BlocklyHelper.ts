import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Register DolaCode / DevNaija App Studio custom blocks
export function registerAppStudioBlocks() {
  if (typeof Blockly === 'undefined') return;

  // Helper function to register block safely
  const registerBlock = (name: string, definition: any, generatorFn: Function) => {
    if (!Blockly.Blocks[name]) {
      Blockly.Blocks[name] = definition;
      javascriptGenerator.forBlock[name] = function(block: any, generator: any) {
        return generatorFn(block, generator);
      };
    }
  };

  // ==========================================
  // 1. ⚡ EVENTS (Yellow #E6A100)
  // ==========================================
  registerBlock('app_on_start', {
    init: function(this: any) {
      this.appendDummyInput().appendField("🚀 When App Starts");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#E6A100');
      this.setTooltip("Runs automatically when the app initializes.");
    }
  }, (block: any, generator: any) => {
    const branch = generator.statementToCode(block, 'DO') || '';
    return `// When App Starts\n${branch}\n`;
  });

  registerBlock('app_on_close', {
    init: function(this: any) {
      this.appendDummyInput().appendField("🛑 When App Closes");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#E6A100');
    }
  }, (block: any, generator: any) => {
    const branch = generator.statementToCode(block, 'DO') || '';
    return `onAppClose(() => {\n${branch}});\n`;
  });

  registerBlock('app_on_screen_open', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("📱 When Screen")
          .appendField(new Blockly.FieldTextInput("screen1"), "SCREEN_ID")
          .appendField("Opens");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#E6A100');
      this.setTooltip("Runs when a specific screen becomes active.");
    }
  }, (block: any, generator: any) => {
    const screenId = block.getFieldValue('SCREEN_ID');
    const branch = generator.statementToCode(block, 'DO') || '';
    return `onScreenOpen("${screenId}", () => {\n${branch}});\n\n`;
  });

  registerBlock('app_on_screen_close', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("📱 When Screen")
          .appendField(new Blockly.FieldTextInput("screen1"), "SCREEN_ID")
          .appendField("Closes");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#E6A100');
    }
  }, (block: any, generator: any) => {
    const screenId = block.getFieldValue('SCREEN_ID');
    const branch = generator.statementToCode(block, 'DO') || '';
    return `onScreenClose("${screenId}", () => {\n${branch}});\n`;
  });

  registerBlock('app_on_event', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("⚡ When Component")
          .appendField(new Blockly.FieldTextInput("btn1"), "ELEMENT_ID")
          .appendField(new Blockly.FieldDropdown([
            ["Click 🖱️", "click"],
            ["Double Click 🖱️🖱️", "dblclick"],
            ["Long Press 🖐️", "contextmenu"],
            ["Hover / Mouse Enter 🎯", "mouseenter"]
          ]), "EVENT_TYPE");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#E6A100');
      this.setTooltip("Triggers when user clicks or presses a component.");
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const eventType = block.getFieldValue('EVENT_TYPE');
    const branch = generator.statementToCode(block, 'DO') || '';
    return `onEvent("${elementId}", "${eventType}", (event) => {\n${branch}});\n\n`;
  });

  registerBlock('app_on_input_event', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("⌨️ When Input")
          .appendField(new Blockly.FieldTextInput("input1"), "ELEMENT_ID")
          .appendField(new Blockly.FieldDropdown([
            ["Text Changes", "change"],
            ["Gains Focus", "focus"],
            ["Loses Focus (Blur)", "blur"],
            ["Enter Pressed", "keyup"]
          ]), "EVENT_TYPE");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#E6A100');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const eventType = block.getFieldValue('EVENT_TYPE');
    const branch = generator.statementToCode(block, 'DO') || '';
    return `onEvent("${elementId}", "${eventType}", (event) => {\n${branch}});\n\n`;
  });

  registerBlock('app_on_timer_tick', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("⏱️ Every")
          .appendField(new Blockly.FieldNumber(1, 0.1, 3600), "INTERVAL")
          .appendField("seconds");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#E6A100');
      this.setTooltip("Runs code repeatedly at a set interval.");
    }
  }, (block: any, generator: any) => {
    const interval = block.getFieldValue('INTERVAL');
    const branch = generator.statementToCode(block, 'DO') || '';
    return `setInterval(() => {\n${branch}}, ${interval * 1000});\n\n`;
  });

  registerBlock('app_on_device_event', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("📲 When Device")
          .appendField(new Blockly.FieldDropdown([
            ["Location Changes 📍", "location"],
            ["Camera Opens 📷", "camera"],
            ["Shake Phone 🫨", "shake"],
            ["Orientation Changes 🔄", "orientation"]
          ]), "EVENT_TYPE");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#E6A100');
    }
  }, (block: any, generator: any) => {
    const eventType = block.getFieldValue('EVENT_TYPE');
    const branch = generator.statementToCode(block, 'DO') || '';
    return `onDeviceEvent("${eventType}", () => {\n${branch}});\n\n`;
  });

  // ==========================================
  // 2. 📱 UI BLOCKS (Blue #2196F3)
  // ==========================================
  registerBlock('app_set_text', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Set Text of")
          .appendField(new Blockly.FieldTextInput("label1"), "ELEMENT_ID");
      this.appendValueInput("TEXT").setCheck(null).appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    return `setText("${elementId}", ${text});\n`;
  });

  registerBlock('app_get_text', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Get Text of")
          .appendField(new Blockly.FieldTextInput("input1"), "ELEMENT_ID");
      this.setOutput(true, "String");
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    return [`getText("${elementId}")`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_get_number', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Get Number from")
          .appendField(new Blockly.FieldTextInput("numberInput1"), "ELEMENT_ID");
      this.setOutput(true, "Number");
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    return [`Number(getText("${elementId}") || 0)`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_set_number', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Set Number of")
          .appendField(new Blockly.FieldTextInput("numberInput1"), "ELEMENT_ID");
      this.appendValueInput("NUM").setCheck("Number").appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const num = generator.valueToCode(block, 'NUM', generator.ORDER_NONE) || '0';
    return `setText("${elementId}", String(${num}));\n`;
  });

  registerBlock('app_clear_text', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Clear Input")
          .appendField(new Blockly.FieldTextInput("input1"), "ELEMENT_ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    return `setText("${elementId}", "");\n`;
  });

  registerBlock('app_set_property', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Set Property of")
          .appendField(new Blockly.FieldTextInput("btn1"), "ELEMENT_ID")
          .appendField(new Blockly.FieldDropdown([
            ["text", "text"],
            ["value", "value"],
            ["visible", "visible"],
            ["enabled", "enabled"],
            ["backgroundColor", "backgroundColor"],
            ["color", "color"],
            ["width", "width"],
            ["height", "height"],
            ["fontSize", "fontSize"]
          ]), "PROP");
      this.appendValueInput("VALUE").setCheck(null).appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const prop = block.getFieldValue('PROP');
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '""';
    return `setProperty("${elementId}", "${prop}", ${value});\n`;
  });

  registerBlock('app_get_property', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Get Property of")
          .appendField(new Blockly.FieldTextInput("btn1"), "ELEMENT_ID")
          .appendField(new Blockly.FieldDropdown([
            ["text", "text"],
            ["value", "value"],
            ["visible", "visible"],
            ["enabled", "enabled"],
            ["backgroundColor", "backgroundColor"],
            ["color", "color"]
          ]), "PROP");
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const prop = block.getFieldValue('PROP');
    return [`getProperty("${elementId}", "${prop}")`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_get_checked', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Get Checked state of")
          .appendField(new Blockly.FieldTextInput("checkbox1"), "ELEMENT_ID");
      this.setOutput(true, "Boolean");
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    return [`Boolean(getProperty("${elementId}", "checked"))`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_set_checked', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Set Checked state of")
          .appendField(new Blockly.FieldTextInput("checkbox1"), "ELEMENT_ID");
      this.appendValueInput("CHECKED").setCheck("Boolean").appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const checked = generator.valueToCode(block, 'CHECKED', generator.ORDER_NONE) || 'false';
    return `setProperty("${elementId}", "checked", ${checked});\n`;
  });

  registerBlock('app_show_hide', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Show Component 👁️", "show"],
            ["Hide Component 🙈", "hide"]
          ]), "ACTION")
          .appendField(new Blockly.FieldTextInput("image1"), "ELEMENT_ID");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const action = block.getFieldValue('ACTION');
    const elementId = block.getFieldValue('ELEMENT_ID');
    return `${action}("${elementId}");\n`;
  });

  registerBlock('app_set_enabled', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Enable Component ✅", "true"],
            ["Disable Component ⛔", "false"]
          ]), "STATE")
          .appendField(new Blockly.FieldTextInput("btnSubmit"), "ELEMENT_ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const state = block.getFieldValue('STATE');
    const elementId = block.getFieldValue('ELEMENT_ID');
    return `setProperty("${elementId}", "enabled", ${state});\n`;
  });

  registerBlock('app_set_image_url', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Set Image URL of")
          .appendField(new Blockly.FieldTextInput("image1"), "ELEMENT_ID");
      this.appendValueInput("URL").setCheck("String").appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2196F3');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const url = generator.valueToCode(block, 'URL', generator.ORDER_NONE) || '""';
    return `setProperty("${elementId}", "src", ${url});\n`;
  });

  // ==========================================
  // 3. 🔢 VARIABLES (Orange #FF9800)
  // ==========================================
  registerBlock('app_create_variable', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Create Variable")
          .appendField(new Blockly.FieldTextInput("score"), "VAR_NAME");
      this.appendValueInput("VALUE").setCheck(null).appendField("=");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF9800');
    }
  }, (block: any, generator: any) => {
    const varName = block.getFieldValue('VAR_NAME');
    const val = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '0';
    return `var ${varName} = ${val};\n`;
  });

  registerBlock('app_set_variable', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Set Variable")
          .appendField(new Blockly.FieldTextInput("score"), "VAR_NAME");
      this.appendValueInput("VALUE").setCheck(null).appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF9800');
    }
  }, (block: any, generator: any) => {
    const varName = block.getFieldValue('VAR_NAME');
    const val = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '0';
    return `${varName} = ${val};\n`;
  });

  registerBlock('app_change_variable_by', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("Change Variable")
          .appendField(new Blockly.FieldTextInput("score"), "VAR_NAME")
          .appendField("by");
      this.appendValueInput("NUM").setCheck("Number");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF9800');
    }
  }, (block: any, generator: any) => {
    const varName = block.getFieldValue('VAR_NAME');
    const num = generator.valueToCode(block, 'NUM', generator.ORDER_NONE) || '1';
    return `${varName} = (typeof ${varName} !== 'undefined' ? ${varName} : 0) + (${num});\n`;
  });

  // ==========================================
  // 4. 🧮 MATH & NUMBERS (Green #4CAF50)
  // ==========================================
  registerBlock('app_random_num', {
    init: function(this: any) {
      this.appendDummyInput().appendField("🎲 Random Number");
      this.appendValueInput("MIN").setCheck("Number").appendField("from");
      this.appendValueInput("MAX").setCheck("Number").appendField("to");
      this.setInputsInline(true);
      this.setOutput(true, "Number");
      this.setColour('#4CAF50');
    }
  }, (block: any, generator: any) => {
    const min = generator.valueToCode(block, 'MIN', generator.ORDER_NONE) || '1';
    const max = generator.valueToCode(block, 'MAX', generator.ORDER_NONE) || '100';
    return [`generateRandomNumber(${min}, ${max})`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_math_min_max', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Minimum of", "min"],
            ["Maximum of", "max"]
          ]), "OP");
      this.appendValueInput("A").setCheck("Number");
      this.appendValueInput("B").setCheck("Number").appendField("and");
      this.setInputsInline(true);
      this.setOutput(true, "Number");
      this.setColour('#4CAF50');
    }
  }, (block: any, generator: any) => {
    const op = block.getFieldValue('OP');
    const a = generator.valueToCode(block, 'A', generator.ORDER_NONE) || '0';
    const b = generator.valueToCode(block, 'B', generator.ORDER_NONE) || '0';
    return [`Math.${op}(${a}, ${b})`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_math_power', {
    init: function(this: any) {
      this.appendValueInput("BASE").setCheck("Number");
      this.appendValueInput("EXP").setCheck("Number").appendField("^ (Power)");
      this.setInputsInline(true);
      this.setOutput(true, "Number");
      this.setColour('#4CAF50');
    }
  }, (block: any, generator: any) => {
    const base = generator.valueToCode(block, 'BASE', generator.ORDER_NONE) || '1';
    const exp = generator.valueToCode(block, 'EXP', generator.ORDER_NONE) || '1';
    return [`Math.pow(${base}, ${exp})`, generator.ORDER_FUNCTION_CALL];
  });

  // ==========================================
  // 5. 🔁 LOOPS (Purple #9C27B0)
  // ==========================================
  registerBlock('app_loop_forever', {
    init: function(this: any) {
      this.appendDummyInput().appendField("♾️ Repeat Forever");
      this.appendStatementInput("DO").appendField("do");
      this.setColour('#9C27B0');
    }
  }, (block: any, generator: any) => {
    const branch = generator.statementToCode(block, 'DO') || '';
    return `while(true) {\n${branch}}\n`;
  });

  // ==========================================
  // 6. 🔤 TEXT & STRINGS (Pink #E91E63)
  // ==========================================
  registerBlock('app_text_contains', {
    init: function(this: any) {
      this.appendValueInput("TEXT").setCheck("String").appendField("Text");
      this.appendValueInput("SEARCH").setCheck("String").appendField("contains");
      this.setInputsInline(true);
      this.setOutput(true, "Boolean");
      this.setColour('#E91E63');
    }
  }, (block: any, generator: any) => {
    const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    const search = generator.valueToCode(block, 'SEARCH', generator.ORDER_NONE) || '""';
    return [`String(${text}).includes(String(${search}))`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_text_starts_ends_with', {
    init: function(this: any) {
      this.appendValueInput("TEXT").setCheck("String").appendField("Text");
      this.appendDummyInput().appendField(new Blockly.FieldDropdown([
        ["starts with", "startsWith"],
        ["ends with", "endsWith"]
      ]), "OP");
      this.appendValueInput("SUB").setCheck("String");
      this.setInputsInline(true);
      this.setOutput(true, "Boolean");
      this.setColour('#E91E63');
    }
  }, (block: any, generator: any) => {
    const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    const op = block.getFieldValue('OP');
    const sub = generator.valueToCode(block, 'SUB', generator.ORDER_NONE) || '""';
    return [`String(${text}).${op}(String(${sub}))`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_text_replace', {
    init: function(this: any) {
      this.appendValueInput("TEXT").setCheck("String").appendField("In text");
      this.appendValueInput("FROM").setCheck("String").appendField("replace");
      this.appendValueInput("TO").setCheck("String").appendField("with");
      this.setInputsInline(true);
      this.setOutput(true, "String");
      this.setColour('#E91E63');
    }
  }, (block: any, generator: any) => {
    const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    const from = generator.valueToCode(block, 'FROM', generator.ORDER_NONE) || '""';
    const to = generator.valueToCode(block, 'TO', generator.ORDER_NONE) || '""';
    return [`String(${text}).replaceAll(${from}, ${to})`, generator.ORDER_FUNCTION_CALL];
  });

  // ==========================================
  // 7. 📜 LISTS & ARRAYS (Red #F44336)
  // ==========================================
  registerBlock('app_list_append', {
    init: function(this: any) {
      this.appendValueInput("LIST").setCheck("Array").appendField("Add item");
      this.appendValueInput("ITEM").setCheck(null).appendField("to list");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F44336');
    }
  }, (block: any, generator: any) => {
    const list = generator.valueToCode(block, 'LIST', generator.ORDER_NONE) || '[]';
    const item = generator.valueToCode(block, 'ITEM', generator.ORDER_NONE) || 'null';
    return `${list}.push(${item});\n`;
  });

  registerBlock('app_list_remove', {
    init: function(this: any) {
      this.appendValueInput("LIST").setCheck("Array").appendField("Remove item at index");
      this.appendValueInput("INDEX").setCheck("Number");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F44336');
    }
  }, (block: any, generator: any) => {
    const list = generator.valueToCode(block, 'LIST', generator.ORDER_NONE) || '[]';
    const index = generator.valueToCode(block, 'INDEX', generator.ORDER_NONE) || '0';
    return `${list}.splice(${index}, 1);\n`;
  });

  registerBlock('app_list_clear', {
    init: function(this: any) {
      this.appendValueInput("LIST").setCheck("Array").appendField("Clear all items in list");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F44336');
    }
  }, (block: any, generator: any) => {
    const list = generator.valueToCode(block, 'LIST', generator.ORDER_NONE) || '[]';
    return `${list}.length = 0;\n`;
  });

  registerBlock('app_list_contains', {
    init: function(this: any) {
      this.appendValueInput("LIST").setCheck("Array").appendField("List");
      this.appendValueInput("ITEM").setCheck(null).appendField("contains item");
      this.setInputsInline(true);
      this.setOutput(true, "Boolean");
      this.setColour('#F44336');
    }
  }, (block: any, generator: any) => {
    const list = generator.valueToCode(block, 'LIST', generator.ORDER_NONE) || '[]';
    const item = generator.valueToCode(block, 'ITEM', generator.ORDER_NONE) || 'null';
    return [`${list}.includes(${item})`, generator.ORDER_FUNCTION_CALL];
  });

  // ==========================================
  // 8. 📦 OBJECTS & JSON (Brown #795548)
  // ==========================================
  registerBlock('app_object_create', {
    init: function(this: any) {
      this.appendDummyInput().appendField("📦 Create Empty Object {}");
      this.setOutput(true, "Object");
      this.setColour('#795548');
    }
  }, (block: any, generator: any) => {
    return ['{}', generator.ORDER_ATOMIC];
  });

  registerBlock('app_object_set_prop', {
    init: function(this: any) {
      this.appendValueInput("OBJ").setCheck("Object").appendField("In object");
      this.appendValueInput("KEY").setCheck("String").appendField("set key");
      this.appendValueInput("VAL").setCheck(null).appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#795548');
    }
  }, (block: any, generator: any) => {
    const obj = generator.valueToCode(block, 'OBJ', generator.ORDER_NONE) || '{}';
    const key = generator.valueToCode(block, 'KEY', generator.ORDER_NONE) || '""';
    const val = generator.valueToCode(block, 'VAL', generator.ORDER_NONE) || 'null';
    return `${obj}[${key}] = ${val};\n`;
  });

  registerBlock('app_object_get_prop', {
    init: function(this: any) {
      this.appendValueInput("OBJ").setCheck("Object").appendField("Get key");
      this.appendValueInput("KEY").setCheck("String").appendField("from object");
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour('#795548');
    }
  }, (block: any, generator: any) => {
    const obj = generator.valueToCode(block, 'OBJ', generator.ORDER_NONE) || '{}';
    const key = generator.valueToCode(block, 'KEY', generator.ORDER_NONE) || '""';
    return [`(${obj} ? ${obj}[${key}] : undefined)`, generator.ORDER_MEMBER];
  });

  registerBlock('app_object_delete_prop', {
    init: function(this: any) {
      this.appendValueInput("OBJ").setCheck("Object").appendField("Delete key");
      this.appendValueInput("KEY").setCheck("String").appendField("from object");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#795548');
    }
  }, (block: any, generator: any) => {
    const obj = generator.valueToCode(block, 'OBJ', generator.ORDER_NONE) || '{}';
    const key = generator.valueToCode(block, 'KEY', generator.ORDER_NONE) || '""';
    return `delete ${obj}[${key}];\n`;
  });

  registerBlock('app_object_keys', {
    init: function(this: any) {
      this.appendValueInput("OBJ").setCheck("Object").appendField("Get Object Keys");
      this.setOutput(true, "Array");
      this.setColour('#795548');
    }
  }, (block: any, generator: any) => {
    const obj = generator.valueToCode(block, 'OBJ', generator.ORDER_NONE) || '{}';
    return [`Object.keys(${obj})`, generator.ORDER_FUNCTION_CALL];
  });

  // ==========================================
  // 9. 📅 DATE & TIME (Teal #009688)
  // ==========================================
  registerBlock('app_date_current', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("📅 Current")
          .appendField(new Blockly.FieldDropdown([
            ["Date String 📆", "dateString"],
            ["Time String 🕒", "timeString"],
            ["Year 📅", "year"],
            ["Month 📅", "month"],
            ["Day 📅", "day"],
            ["Hour (24h) ⏰", "hour"],
            ["Minute ⏱️", "minute"]
          ]), "PART");
      this.setOutput(true, null);
      this.setColour('#009688');
    }
  }, (block: any, generator: any) => {
    const part = block.getFieldValue('PART');
    let code = 'new Date().toLocaleDateString()';
    if (part === 'timeString') code = 'new Date().toLocaleTimeString()';
    if (part === 'year') code = 'new Date().getFullYear()';
    if (part === 'month') code = '(new Date().getMonth() + 1)';
    if (part === 'day') code = 'new Date().getDate()';
    if (part === 'hour') code = 'new Date().getHours()';
    if (part === 'minute') code = 'new Date().getMinutes()';
    return [code, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_date_format', {
    init: function(this: any) {
      this.appendDummyInput().appendField("Format Current Date");
      this.setOutput(true, "String");
      this.setColour('#009688');
    }
  }, (block: any, generator: any) => {
    return ['new Date().toISOString().split("T")[0]', generator.ORDER_FUNCTION_CALL];
  });

  // ==========================================
  // 10. 🚀 NAVIGATION (Amber #FF8F00)
  // ==========================================
  registerBlock('app_navigate_to', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🚀 Open Screen")
          .appendField(new Blockly.FieldTextInput("screen2"), "SCREEN_ID");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF8F00');
    }
  }, (block: any, generator: any) => {
    const screenId = block.getFieldValue('SCREEN_ID');
    return `navigateTo("${screenId}");\n`;
  });

  registerBlock('app_close_screen', {
    init: function(this: any) {
      this.appendDummyInput().appendField("🔙 Close Current Screen");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF8F00');
    }
  }, (block: any, generator: any) => {
    return `closeScreen();\n`;
  });

  registerBlock('app_open_url', {
    init: function(this: any) {
      this.appendValueInput("URL").setCheck("String").appendField("🌐 Open Web URL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF8F00');
    }
  }, (block: any, generator: any) => {
    const url = generator.valueToCode(block, 'URL', generator.ORDER_NONE) || '"https://google.com"';
    return `openUrl(${url});\n`;
  });

  registerBlock('app_share_content', {
    init: function(this: any) {
      this.appendValueInput("TEXT").setCheck("String").appendField("📤 Share Text");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF8F00');
    }
  }, (block: any, generator: any) => {
    const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    return `shareText(${text});\n`;
  });

  // ==========================================
  // 11. 💾 STORAGE (Orange #E65100)
  // ==========================================
  registerBlock('app_save_data', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("💾 Save Key")
          .appendField(new Blockly.FieldTextInput("score"), "KEY");
      this.appendValueInput("VALUE").setCheck(null).appendField("value");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#E65100');
    }
  }, (block: any, generator: any) => {
    const key = block.getFieldValue('KEY');
    const val = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
    return `saveData("${key}", ${val});\n`;
  });

  registerBlock('app_load_data', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🔍 Load Key")
          .appendField(new Blockly.FieldTextInput("score"), "KEY");
      this.setOutput(true, null);
      this.setColour('#E65100');
    }
  }, (block: any, generator: any) => {
    const key = block.getFieldValue('KEY');
    return [`loadData("${key}")`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_delete_data', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🗑️ Delete Key")
          .appendField(new Blockly.FieldTextInput("score"), "KEY");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#E65100');
    }
  }, (block: any, generator: any) => {
    const key = block.getFieldValue('KEY');
    return `deleteData("${key}");\n`;
  });

  registerBlock('app_clear_storage', {
    init: function(this: any) {
      this.appendDummyInput().appendField("🧹 Clear All App Storage");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#E65100');
    }
  }, (block: any, generator: any) => {
    return `clearStorage();\n`;
  });

  // ==========================================
  // 12. 🗄️ DATABASE (Indigo #3F51B5)
  // ==========================================
  registerBlock('app_db_create_record', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🗄️ DB Add Record to Collection")
          .appendField(new Blockly.FieldTextInput("users"), "COLLECTION");
      this.appendValueInput("DATA").setCheck("Object").appendField("data");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#3F51B5');
    }
  }, (block: any, generator: any) => {
    const col = block.getFieldValue('COLLECTION');
    const data = generator.valueToCode(block, 'DATA', generator.ORDER_NONE) || '{}';
    return `dbCreateRecord("${col}", ${data});\n`;
  });

  registerBlock('app_db_read_record', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🗄️ DB Read Record in")
          .appendField(new Blockly.FieldTextInput("users"), "COLLECTION");
      this.appendValueInput("ID").setCheck("String").appendField("with ID");
      this.setInputsInline(true);
      this.setOutput(true, "Object");
      this.setColour('#3F51B5');
    }
  }, (block: any, generator: any) => {
    const col = block.getFieldValue('COLLECTION');
    const id = generator.valueToCode(block, 'ID', generator.ORDER_NONE) || '""';
    return [`dbReadRecord("${col}", ${id})`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_db_delete_record', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🗄️ DB Delete Record in")
          .appendField(new Blockly.FieldTextInput("users"), "COLLECTION");
      this.appendValueInput("ID").setCheck("String").appendField("with ID");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#3F51B5');
    }
  }, (block: any, generator: any) => {
    const col = block.getFieldValue('COLLECTION');
    const id = generator.valueToCode(block, 'ID', generator.ORDER_NONE) || '""';
    return `dbDeleteRecord("${col}", ${id});\n`;
  });

  // ==========================================
  // 13. 🌐 NETWORKING (Cyan #00BCD4)
  // ==========================================
  registerBlock('app_net_http_request', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🌐 HTTP")
          .appendField(new Blockly.FieldDropdown([
            ["GET", "GET"],
            ["POST", "POST"],
            ["PUT", "PUT"],
            ["DELETE", "DELETE"]
          ]), "METHOD");
      this.appendValueInput("URL").setCheck("String").appendField("URL");
      this.appendStatementInput("ON_SUCCESS").appendField("on response (data)");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#00BCD4');
    }
  }, (block: any, generator: any) => {
    const method = block.getFieldValue('METHOD');
    const url = generator.valueToCode(block, 'URL', generator.ORDER_NONE) || '""';
    const branch = generator.statementToCode(block, 'ON_SUCCESS') || '';
    return `httpRequest("${method}", ${url}, (response) => {\n${branch}});\n`;
  });

  registerBlock('app_net_download_file', {
    init: function(this: any) {
      this.appendValueInput("URL").setCheck("String").appendField("📥 Download File URL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#00BCD4');
    }
  }, (block: any, generator: any) => {
    const url = generator.valueToCode(block, 'URL', generator.ORDER_NONE) || '""';
    return `downloadFile(${url});\n`;
  });

  // ==========================================
  // 14. 🎵 MEDIA (Deep Purple #673AB7)
  // ==========================================
  registerBlock('app_play_audio', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🔊 Play Sound")
          .appendField(new Blockly.FieldTextInput("Success sound"), "ASSET_NAME");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#673AB7');
    }
  }, (block: any, generator: any) => {
    const asset = block.getFieldValue('ASSET_NAME');
    return `playAudio("${asset}");\n`;
  });

  registerBlock('app_media_pause_stop_audio', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Pause Audio ⏸️", "pause"],
            ["Stop Audio ⏹️", "stop"]
          ]), "ACTION");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#673AB7');
    }
  }, (block: any, generator: any) => {
    const action = block.getFieldValue('ACTION');
    return `${action}Audio();\n`;
  });

  registerBlock('app_media_take_picture', {
    init: function(this: any) {
      this.appendDummyInput().appendField("📷 Take Picture / Pick Image");
      this.appendStatementInput("ON_PHOTO").appendField("on photo (photoUrl)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#673AB7');
    }
  }, (block: any, generator: any) => {
    const branch = generator.statementToCode(block, 'ON_PHOTO') || '';
    return `takePicture((photoUrl) => {\n${branch}});\n`;
  });

  // ==========================================
  // 15. 🔔 NOTIFICATIONS (Deep Orange #FF5722)
  // ==========================================
  registerBlock('app_show_alert', {
    init: function(this: any) {
      this.appendValueInput("MESSAGE").setCheck(null).appendField("💬 Show Alert Modal");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF5722');
    }
  }, (block: any, generator: any) => {
    const msg = generator.valueToCode(block, 'MESSAGE', generator.ORDER_NONE) || '""';
    return `showAlert(${msg});\n`;
  });

  registerBlock('app_show_toast', {
    init: function(this: any) {
      this.appendValueInput("MESSAGE").setCheck(null).appendField("🍞 Show Toast Notice");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF5722');
    }
  }, (block: any, generator: any) => {
    const msg = generator.valueToCode(block, 'MESSAGE', generator.ORDER_NONE) || '""';
    return `showToast(${msg});\n`;
  });

  registerBlock('app_confirm_dialog', {
    init: function(this: any) {
      this.appendValueInput("QUESTION").setCheck("String").appendField("❓ Confirm Dialog Question");
      this.appendStatementInput("ON_YES").appendField("if Yes");
      this.appendStatementInput("ON_NO").appendField("if No");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF5722');
    }
  }, (block: any, generator: any) => {
    const question = generator.valueToCode(block, 'QUESTION', generator.ORDER_NONE) || '"Are you sure?"';
    const onYes = generator.statementToCode(block, 'ON_YES') || '';
    const onNo = generator.statementToCode(block, 'ON_NO') || '';
    return `confirmDialog(${question}, () => {\n${onYes}}, () => {\n${onNo}});\n`;
  });

  // ==========================================
  // 16. 📲 DEVICE FEATURES (Slate #607D8B)
  // ==========================================
  registerBlock('app_device_vibrate', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("📳 Vibrate Phone for")
          .appendField(new Blockly.FieldNumber(500, 100, 5000), "MS")
          .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607D8B');
    }
  }, (block: any, generator: any) => {
    const ms = block.getFieldValue('MS');
    return `vibrateDevice(${ms});\n`;
  });

  registerBlock('app_device_flashlight', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🔦 Turn Flashlight")
          .appendField(new Blockly.FieldDropdown([
            ["ON 💡", "on"],
            ["OFF 🌑", "off"]
          ]), "STATE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#607D8B');
    }
  }, (block: any, generator: any) => {
    const state = block.getFieldValue('STATE');
    return `toggleFlashlight("${state}");\n`;
  });

  // ==========================================
  // 17. 🤖 AI BLOCKS (Violet #8B5CF6)
  // ==========================================
  registerBlock('app_ai_ask', {
    init: function(this: any) {
      this.appendValueInput("PROMPT").setCheck("String").appendField("🤖 Ask AI Assistant");
      this.appendStatementInput("ON_REPLY").appendField("on reply (aiResult)");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#8B5CF6');
    }
  }, (block: any, generator: any) => {
    const prompt = generator.valueToCode(block, 'PROMPT', generator.ORDER_NONE) || '"Hello"';
    const branch = generator.statementToCode(block, 'ON_REPLY') || '';
    return `askAI(${prompt}, (aiResult) => {\n${branch}});\n`;
  });

  registerBlock('app_ai_generate_code', {
    init: function(this: any) {
      this.appendValueInput("PROMPT").setCheck("String").appendField("💻 AI Generate Code");
      this.setOutput(true, "String");
      this.setColour('#8B5CF6');
    }
  }, (block: any, generator: any) => {
    const prompt = generator.valueToCode(block, 'PROMPT', generator.ORDER_NONE) || '""';
    return [`generateCodeAI(${prompt})`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_ai_explain_code', {
    init: function(this: any) {
      this.appendValueInput("CODE").setCheck("String").appendField("❓ AI Explain Code");
      this.setOutput(true, "String");
      this.setColour('#8B5CF6');
    }
  }, (block: any, generator: any) => {
    const code = generator.valueToCode(block, 'CODE', generator.ORDER_NONE) || '""';
    return [`explainCodeAI(${code})`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_ai_fix_error', {
    init: function(this: any) {
      this.appendValueInput("ERR").setCheck("String").appendField("🛠️ AI Fix Error");
      this.setOutput(true, "String");
      this.setColour('#8B5CF6');
    }
  }, (block: any, generator: any) => {
    const err = generator.valueToCode(block, 'ERR', generator.ORDER_NONE) || '""';
    return [`fixErrorAI(${err})`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_ai_generate_image', {
    init: function(this: any) {
      this.appendValueInput("PROMPT").setCheck("String").appendField("🖼️ AI Generate Image");
      this.setOutput(true, "String");
      this.setColour('#8B5CF6');
    }
  }, (block: any, generator: any) => {
    const prompt = generator.valueToCode(block, 'PROMPT', generator.ORDER_NONE) || '""';
    return [`generateImageAI(${prompt})`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_ai_summarize', {
    init: function(this: any) {
      this.appendValueInput("TEXT").setCheck("String").appendField("✨ AI Summarize Text");
      this.setOutput(true, "String");
      this.setColour('#8B5CF6');
    }
  }, (block: any, generator: any) => {
    const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    return [`summarizeText(${text})`, generator.ORDER_FUNCTION_CALL];
  });

  registerBlock('app_ai_translate', {
    init: function(this: any) {
      this.appendValueInput("TEXT").setCheck("String").appendField("🌐 AI Translate Text");
      this.appendValueInput("LANG").setCheck("String").appendField("to language");
      this.setInputsInline(true);
      this.setOutput(true, "String");
      this.setColour('#8B5CF6');
    }
  }, (block: any, generator: any) => {
    const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
    const lang = generator.valueToCode(block, 'LANG', generator.ORDER_NONE) || '"Spanish"';
    return [`translateText(${text}, ${lang})`, generator.ORDER_FUNCTION_CALL];
  });

  // ==========================================
  // 18. ✨ ANIMATION (Sky Blue #0EA5E9)
  // ==========================================
  registerBlock('app_anim_animate', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("✨ Animate Component")
          .appendField(new Blockly.FieldTextInput("btn1"), "ELEMENT_ID")
          .appendField(new Blockly.FieldDropdown([
            ["Bounce 🏀", "bounce"],
            ["Shake 🫨", "shake"],
            ["Fade In 🌫️", "fadeIn"],
            ["Fade Out 🫥", "fadeOut"],
            ["Pulse 💓", "pulse"],
            ["Rotate 360° 🔄", "rotate"],
            ["Scale Up 🔍", "scale"]
          ]), "ANIM_TYPE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0EA5E9');
    }
  }, (block: any, generator: any) => {
    const elementId = block.getFieldValue('ELEMENT_ID');
    const animType = block.getFieldValue('ANIM_TYPE');
    return `animateElement("${elementId}", "${animType}");\n`;
  });

  // ==========================================
  // 19. 📡 SENSORS (Gold #D97706)
  // ==========================================
  registerBlock('app_sensor_get_val', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("📡 Sensor Value")
          .appendField(new Blockly.FieldDropdown([
            ["Battery Level % 🔋", "battery"],
            ["Mic Audio Level 🎙️", "micLevel"],
            ["Light Level 💡", "light"],
            ["Accelerometer X 📈", "accelX"],
            ["Gyroscope Y 🔄", "gyroY"],
            ["Proximity Sensor 🖐️", "proximity"]
          ]), "SENSOR");
      this.setOutput(true, "Number");
      this.setColour('#D97706');
    }
  }, (block: any, generator: any) => {
    const sensor = block.getFieldValue('SENSOR');
    return [`getSensorValue("${sensor}")`, generator.ORDER_FUNCTION_CALL];
  });

  // ==========================================
  // 20. 💬 COMMENTS & 21. THEMES
  // ==========================================
  registerBlock('app_comment', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("💬 Note:")
          .appendField(new Blockly.FieldTextInput("Explain this code logic..."), "TEXT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9E9E9E');
    }
  }, (block: any, generator: any) => {
    const text = block.getFieldValue('TEXT');
    return `// ${text}\n`;
  });

  registerBlock('app_theme_set', {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🎨 Set App Theme")
          .appendField(new Blockly.FieldDropdown([
            ["Dark Mode 🌙", "dark"],
            ["Light Mode ☀️", "light"],
            ["Cyberpunk ⚡", "cyberpunk"]
          ]), "THEME");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899');
    }
  }, (block: any, generator: any) => {
    const theme = block.getFieldValue('THEME');
    return `setTheme("${theme}");\n`;
  });
}
