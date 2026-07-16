import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Register DolaCode App Studio custom blocks
export function registerAppStudioBlocks() {
  if (typeof Blockly === 'undefined') return;

  // 1. onEvent Block
  if (!Blockly.Blocks['app_on_event']) {
    Blockly.Blocks['app_on_event'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("on event")
            .appendField(new Blockly.FieldTextInput("btnPlus"), "ELEMENT_ID")
            .appendField("triggers")
            .appendField(new Blockly.FieldDropdown([
              ["click", "click"],
              ["change", "change"],
              ["focus", "focus"],
              ["blur", "blur"],
              ["load", "load"]
            ]), "EVENT_TYPE");
        this.appendStatementInput("DO")
            .setCheck(null)
            .appendField("do");
        this.setColour('#FF4D4D');
        this.setTooltip("Run code when a component event triggers (e.g. clicking a button).");
        this.setHelpUrl("");
      }
    };

    javascriptGenerator.forBlock['app_on_event'] = function(block: any, generator: any) {
      const elementId = block.getFieldValue('ELEMENT_ID');
      const eventType = block.getFieldValue('EVENT_TYPE');
      const branch = generator.statementToCode(block, 'DO') || '';
      return `onEvent("${elementId}", "${eventType}", () => {\n${branch}});\n\n`;
    };
  }

  // 2. setProperty Block
  if (!Blockly.Blocks['app_set_property']) {
    Blockly.Blocks['app_set_property'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set property of")
            .appendField(new Blockly.FieldTextInput("countDisplay"), "ELEMENT_ID")
            .appendField("prop")
            .appendField(new Blockly.FieldDropdown([
              ["text", "text"],
              ["value", "value"],
              ["visible", "visible"],
              ["enabled", "enabled"],
              ["backgroundColor", "backgroundColor"],
              ["color", "color"]
            ]), "PROP");
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("to");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip("Change a property of a component (e.g., set button color or text).");
      }
    };

    javascriptGenerator.forBlock['app_set_property'] = function(block: any, generator: any) {
      const elementId = block.getFieldValue('ELEMENT_ID');
      const prop = block.getFieldValue('PROP');
      const value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '""';
      return `setProperty("${elementId}", "${prop}", ${value});\n`;
    };
  }

  // 3. getProperty Block
  if (!Blockly.Blocks['app_get_property']) {
    Blockly.Blocks['app_get_property'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("get property of")
            .appendField(new Blockly.FieldTextInput("inputField"), "ELEMENT_ID")
            .appendField("prop")
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
        this.setColour('#9966FF');
        this.setTooltip("Read a property value from a component.");
      }
    };

    javascriptGenerator.forBlock['app_get_property'] = function(block: any, generator: any) {
      const elementId = block.getFieldValue('ELEMENT_ID');
      const prop = block.getFieldValue('PROP');
      const code = `getProperty("${elementId}", "${prop}")`;
      return [code, generator.ORDER_FUNCTION_CALL];
    };
  }

  // 4. setText Block
  if (!Blockly.Blocks['app_set_text']) {
    Blockly.Blocks['app_set_text'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set text of")
            .appendField(new Blockly.FieldTextInput("titleLabel"), "ELEMENT_ID");
        this.appendValueInput("TEXT")
            .setCheck("String")
            .appendField("to");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip("Helper block to set the text property of a label, button, or input.");
      }
    };

    javascriptGenerator.forBlock['app_set_text'] = function(block: any, generator: any) {
      const elementId = block.getFieldValue('ELEMENT_ID');
      const text = generator.valueToCode(block, 'TEXT', generator.ORDER_NONE) || '""';
      return `setText("${elementId}", ${text});\n`;
    };
  }

  // 5. getText Block
  if (!Blockly.Blocks['app_get_text']) {
    Blockly.Blocks['app_get_text'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("get text of")
            .appendField(new Blockly.FieldTextInput("todoInput"), "ELEMENT_ID");
        this.setOutput(true, "String");
        this.setColour('#9966FF');
        this.setTooltip("Get the text value from an input field, label, or text area.");
      }
    };

    javascriptGenerator.forBlock['app_get_text'] = function(block: any, generator: any) {
      const elementId = block.getFieldValue('ELEMENT_ID');
      const code = `getText("${elementId}")`;
      return [code, generator.ORDER_FUNCTION_CALL];
    };
  }

  // 6. show / hide Block
  if (!Blockly.Blocks['app_show_hide']) {
    Blockly.Blocks['app_show_hide'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
              ["show component", "show"],
              ["hide component", "hide"]
            ]), "ACTION")
            .appendField(new Blockly.FieldTextInput("image1"), "ELEMENT_ID");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#9966FF');
        this.setTooltip("Show or hide a component dynamically.");
      }
    };

    javascriptGenerator.forBlock['app_show_hide'] = function(block: any, generator: any) {
      const action = block.getFieldValue('ACTION');
      const elementId = block.getFieldValue('ELEMENT_ID');
      return `${action}("${elementId}");\n`;
    };
  }

  // 7. navigateTo Block
  if (!Blockly.Blocks['app_navigate_to']) {
    Blockly.Blocks['app_navigate_to'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("navigate to screen")
            .appendField(new Blockly.FieldTextInput("screen2"), "SCREEN_ID");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFAB19');
        this.setTooltip("Switch the simulator to another screen.");
      }
    };

    javascriptGenerator.forBlock['app_navigate_to'] = function(block: any, generator: any) {
      const screenId = block.getFieldValue('SCREEN_ID');
      return `navigateTo("${screenId}");\n`;
    };
  }

  // 8. showAlert Block
  if (!Blockly.Blocks['app_show_alert']) {
    Blockly.Blocks['app_show_alert'] = {
      init: function() {
        this.appendValueInput("MESSAGE")
            .setCheck("String")
            .appendField("show alert modal");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFAB19');
        this.setTooltip("Display an alert modal overlay inside the simulator.");
      }
    };

    javascriptGenerator.forBlock['app_show_alert'] = function(block: any, generator: any) {
      const msg = generator.valueToCode(block, 'MESSAGE', generator.ORDER_NONE) || '""';
      return `showAlert(${msg});\n`;
    };
  }

  // 9. showToast Block
  if (!Blockly.Blocks['app_show_toast']) {
    Blockly.Blocks['app_show_toast'] = {
      init: function() {
        this.appendValueInput("MESSAGE")
            .setCheck("String")
            .appendField("show toast notice");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FFAB19');
        this.setTooltip("Display a quick slide-up notification toast.");
      }
    };

    javascriptGenerator.forBlock['app_show_toast'] = function(block: any, generator: any) {
      const msg = generator.valueToCode(block, 'MESSAGE', generator.ORDER_NONE) || '""';
      return `showToast(${msg});\n`;
    };
  }

  // 10. playAudio Block
  if (!Blockly.Blocks['app_play_audio']) {
    Blockly.Blocks['app_play_audio'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("play audio asset")
            .appendField(new Blockly.FieldTextInput("Success sound"), "ASSET_NAME");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip("Play an audio asset clip.");
      }
    };

    javascriptGenerator.forBlock['app_play_audio'] = function(block: any, generator: any) {
      const asset = block.getFieldValue('ASSET_NAME');
      return `playAudio("${asset}");\n`;
    };
  }

  // 11. saveData Block
  if (!Blockly.Blocks['app_save_data']) {
    Blockly.Blocks['app_save_data'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("save db key")
            .appendField(new Blockly.FieldTextInput("score"), "KEY");
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("value");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip("Save a value to the persistent local database.");
      }
    };

    javascriptGenerator.forBlock['app_save_data'] = function(block: any, generator: any) {
      const key = block.getFieldValue('KEY');
      const val = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || 'null';
      return `saveData("${key}", ${val});\n`;
    };
  }

  // 12. loadData Block
  if (!Blockly.Blocks['app_load_data']) {
    Blockly.Blocks['app_load_data'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("load db key")
            .appendField(new Blockly.FieldTextInput("score"), "KEY");
        this.setOutput(true, null);
        this.setColour('#FF8C1A');
        this.setTooltip("Retrieve a value from the persistent local database.");
      }
    };

    javascriptGenerator.forBlock['app_load_data'] = function(block: any, generator: any) {
      const key = block.getFieldValue('KEY');
      const code = `loadData("${key}")`;
      return [code, generator.ORDER_FUNCTION_CALL];
    };
  }

  // 13. generateRandomNumber Block
  if (!Blockly.Blocks['app_random_num']) {
    Blockly.Blocks['app_random_num'] = {
      init: function() {
        this.appendDummyInput().appendField("random number");
        this.appendValueInput("MIN")
            .setCheck("Number")
            .appendField("from");
        this.appendValueInput("MAX")
            .setCheck("Number")
            .appendField("to");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour('#59C059');
        this.setTooltip("Generate a random number within a range.");
      }
    };

    javascriptGenerator.forBlock['app_random_num'] = function(block: any, generator: any) {
      const min = generator.valueToCode(block, 'MIN', generator.ORDER_NONE) || '1';
      const max = generator.valueToCode(block, 'MAX', generator.ORDER_NONE) || '10';
      const code = `generateRandomNumber(${min}, ${max})`;
      return [code, generator.ORDER_FUNCTION_CALL];
    };
  }
}
