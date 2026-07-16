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
      <category name="Events &amp; UI" colour="#FF4D4D">
        <block type="app_on_event"></block>
        <block type="app_set_property"></block>
        <block type="app_get_property"></block>
        <block type="app_set_text">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">Hello World</field>
            </shadow>
          </value>
        </block>
        <block type="app_get_text"></block>
        <block type="app_show_hide"></block>
      </category>

      <category name="Navigation &amp; Alerts" colour="#FFAB19">
        <block type="app_navigate_to"></block>
        <block type="app_show_alert">
          <value name="MESSAGE">
            <shadow type="text">
              <field name="TEXT">Alert message</field>
            </shadow>
          </value>
        </block>
        <block type="app_show_toast">
          <value name="MESSAGE">
            <shadow type="text">
              <field name="TEXT">Success!</field>
            </shadow>
          </value>
        </block>
        <block type="app_play_audio"></block>
      </category>

      <category name="Database (Storage)" colour="#FF8C1A">
        <block type="app_save_data"></block>
        <block type="app_load_data"></block>
      </category>

      <category name="Logic" colour="#59C059">
        <block type="controls_if"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_negate"></block>
        <block type="logic_boolean"></block>
      </category>

      <category name="Loops &amp; Control" colour="#59C059">
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
      </category>

      <category name="Math &amp; Numbers" colour="#59C059">
        <block type="math_number">
          <field name="NUM">1</field>
        </block>
        <block type="math_arithmetic"></block>
        <block type="app_random_num">
          <value name="MIN">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="MAX">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
      </category>

      <category name="Variables" colour="#FF8C1A" custom="VARIABLE"></category>
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
          colour: '#1e293b',
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
        trashcan: true
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
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      <div ref={blocklyDiv} className="flex-1 h-full w-full" style={{ minHeight: '300px' }} />
    </div>
  );
}
