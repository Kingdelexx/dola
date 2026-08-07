import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { useAppStudioStore } from '../store/useAppStudioStore';
import { registerAppStudioBlocks } from './BlocklyHelper';

export default function BlocklyWorkspace() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const isSwitchingRef = useRef(false);

  const { 
    projects, 
    currentProjectId, 
    activeTab,
    updateCode, 
    updateBlocklyXml 
  } = useAppStudioStore();

  const currentProject = projects.find(p => p.id === currentProjectId);

  // Initialize and register custom blocks
  useEffect(() => {
    registerAppStudioBlocks();
  }, []);

  const getToolboxXml = () => {
    return `<xml>
      <category name="⚡ Events" colour="#E6A100" web-class="cat-events">
        <block type="app_on_start"></block>
        <block type="app_on_close"></block>
        <block type="app_on_screen_open"></block>
        <block type="app_on_screen_close"></block>
        <block type="app_on_event"></block>
        <block type="app_on_input_event"></block>
        <block type="app_on_timer_tick"></block>
        <block type="app_on_device_event"></block>
      </category>

      <category name="📱 UI Controls" colour="#2196F3" web-class="cat-ui">
        <block type="app_set_text">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">Hello World</field>
            </shadow>
          </value>
        </block>
        <block type="app_get_text"></block>
        <block type="app_get_number"></block>
        <block type="app_set_number">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="app_clear_text"></block>
        <block type="app_set_property"></block>
        <block type="app_get_property"></block>
        <block type="app_get_checked"></block>
        <block type="app_set_checked"></block>
        <block type="app_show_hide"></block>
        <block type="app_set_enabled"></block>
        <block type="app_set_image_url"></block>
      </category>

      <category name="🔢 Variables" colour="#FF9800" custom="VARIABLE" web-class="cat-vars">
        <block type="app_create_variable">
          <value name="VALUE">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
        <block type="app_set_variable"></block>
        <block type="app_change_variable_by">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
      </category>

      <category name="🧮 Math &amp; Numbers" colour="#4CAF50" web-class="cat-math">
        <block type="math_number">
          <field name="NUM">1</field>
        </block>
        <block type="math_arithmetic"></block>
        <block type="math_single"></block>
        <block type="math_round"></block>
        <block type="app_random_num">
          <value name="MIN">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="MAX">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
        </block>
        <block type="app_math_min_max"></block>
        <block type="app_math_power"></block>
      </category>

      <category name="⚖️ Logic &amp; Decisions" colour="#2E7D32" web-class="cat-logic">
        <block type="controls_if"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_negate"></block>
        <block type="logic_boolean"></block>
      </category>

      <category name="🔁 Loops &amp; Control" colour="#9C27B0" web-class="cat-loops">
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="controls_whileUntil"></block>
        <block type="controls_for"></block>
        <block type="app_loop_forever"></block>
        <block type="controls_flow_statements"></block>
      </category>

      <category name="🔤 Text &amp; Strings" colour="#E91E63" web-class="cat-text">
        <block type="text">
          <field name="TEXT">Hello</field>
        </block>
        <block type="text_join"></block>
        <block type="text_length"></block>
        <block type="app_text_contains"></block>
        <block type="app_text_starts_ends_with"></block>
        <block type="app_text_replace"></block>
        <block type="text_changeCase"></block>
        <block type="text_trim"></block>
      </category>

      <category name="📜 Lists &amp; Arrays" colour="#F44336" web-class="cat-lists">
        <block type="lists_create_with"></block>
        <block type="app_list_append"></block>
        <block type="app_list_remove"></block>
        <block type="app_list_clear"></block>
        <block type="app_list_contains"></block>
        <block type="lists_length"></block>
        <block type="lists_getIndex"></block>
        <block type="lists_setIndex"></block>
      </category>

      <category name="📦 Objects &amp; JSON" colour="#795548" web-class="cat-objects">
        <block type="app_object_create"></block>
        <block type="app_object_set_prop"></block>
        <block type="app_object_get_prop"></block>
        <block type="app_object_delete_prop"></block>
        <block type="app_object_keys"></block>
      </category>

      <category name="📅 Date &amp; Time" colour="#009688" web-class="cat-date">
        <block type="app_date_current"></block>
        <block type="app_date_format"></block>
      </category>

      <category name="🚀 Navigation" colour="#FF8F00" web-class="cat-nav">
        <block type="app_navigate_to"></block>
        <block type="app_close_screen"></block>
        <block type="app_open_url"></block>
        <block type="app_share_content"></block>
      </category>

      <category name="💾 Storage" colour="#E65100" web-class="cat-storage">
        <block type="app_save_data"></block>
        <block type="app_load_data"></block>
        <block type="app_delete_data"></block>
        <block type="app_clear_storage"></block>
      </category>

      <category name="🗄️ Database" colour="#3F51B5" web-class="cat-db">
        <block type="app_db_create_record"></block>
        <block type="app_db_read_record"></block>
        <block type="app_db_delete_record"></block>
      </category>

      <category name="🌐 Networking &amp; APIs" colour="#00BCD4" web-class="cat-net">
        <block type="app_net_http_request"></block>
        <block type="app_net_download_file"></block>
      </category>

      <category name="🎵 Media &amp; Sounds" colour="#673AB7" web-class="cat-media">
        <block type="app_play_audio"></block>
        <block type="app_media_pause_stop_audio"></block>
        <block type="app_media_take_picture"></block>
      </category>

      <category name="🔔 Notifications" colour="#FF5722" web-class="cat-notif">
        <block type="app_show_alert">
          <value name="MESSAGE">
            <shadow type="text">
              <field name="TEXT">Alert message!</field>
            </shadow>
          </value>
        </block>
        <block type="app_show_toast">
          <value name="MESSAGE">
            <shadow type="text">
              <field name="TEXT">Success toast notice</field>
            </shadow>
          </value>
        </block>
        <block type="app_confirm_dialog"></block>
      </category>

      <category name="📲 Device Features" colour="#607D8B" web-class="cat-device">
        <block type="app_device_vibrate"></block>
        <block type="app_device_flashlight"></block>
      </category>

      <category name="🤖 AI Blocks (Dola AI)" colour="#8B5CF6" web-class="cat-ai">
        <block type="app_ai_ask">
          <value name="PROMPT">
            <shadow type="text">
              <field name="TEXT">Tell me a fun trivia question</field>
            </shadow>
          </value>
        </block>
        <block type="app_ai_generate_code"></block>
        <block type="app_ai_explain_code"></block>
        <block type="app_ai_fix_error"></block>
        <block type="app_ai_generate_image"></block>
        <block type="app_ai_summarize"></block>
        <block type="app_ai_translate"></block>
      </category>

      <category name="⚙️ Functions" colour="#455A64" custom="PROCEDURE" web-class="cat-func"></category>

      <category name="💬 Comments" colour="#9E9E9E" web-class="cat-comments">
        <block type="app_comment"></block>
      </category>

      <category name="🎨 Themes &amp; Style" colour="#EC4899" web-class="cat-themes">
        <block type="app_theme_set"></block>
      </category>

      <category name="✨ Animation" colour="#0EA5E9" web-class="cat-anim">
        <block type="app_anim_animate"></block>
      </category>

      <category name="📡 Sensors" colour="#D97706" web-class="cat-sensors">
        <block type="app_sensor_get_val"></block>
      </category>
    </xml>`;
  };

  useEffect(() => {
    if (!blocklyDiv.current) return;

    if (!workspaceRef.current) {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: getToolboxXml(),
        grid: {
          spacing: 20,
          length: 3,
          colour: '#334155',
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true
          },
          drag: true,
          wheel: true
        },
        trashcan: true,
        sounds: false
      });

      // Listen for block changes and generate JavaScript code
      workspaceRef.current.addChangeListener((e) => {
        if (isSwitchingRef.current || !workspaceRef.current) return;
        if (e.isUiEvent) return;

        // Compile blocks to Javascript
        try {
          const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
          updateCode(code);

          // Save XML state to project
          const xmlText = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspaceRef.current));
          updateBlocklyXml(xmlText);
        } catch (err) {
          console.error("Generator compile error:", err);
        }
      });
    }

    // Resize blockly workspace dynamically
    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Resize workspace whenever activeTab changes or panel becomes visible
  useEffect(() => {
    const timer = setTimeout(() => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Sync workspace state on project change
  useEffect(() => {
    if (!workspaceRef.current || !currentProject) return;
    
    isSwitchingRef.current = true;
    workspaceRef.current.clear();
    
    if (currentProject.blocklyXml) {
      try {
        const dom = Blockly.utils.xml.textToDom(currentProject.blocklyXml);
        Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
      } catch (err) {
        console.error("Error restoring blockly XML:", err);
      }
    }
    isSwitchingRef.current = false;
  }, [currentProjectId]);

  return (
    <div className="flex-1 bg-slate-950 border border-slate-900 overflow-hidden flex flex-col h-full relative">
      {/* Workspace Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 z-10">
        <span className="font-bold text-indigo-400">Block Program Workspace</span>
        <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-850">Visual Blocks Mode</span>
      </div>

      {/* Blockly container */}
      <div ref={blocklyDiv} className="flex-1 h-full w-full relative select-text" style={{ minHeight: '300px' }} />
    </div>
  );
}
