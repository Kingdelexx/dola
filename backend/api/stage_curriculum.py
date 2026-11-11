"""
DolaCode Stage & Level Curriculum Knowledge Base for Lizzy AI
Provides rich contextual knowledge about each stage, part, chapter, and level
so Lizzy AI tutor can give precise, concept-aware hints.
"""

STAGE_KNOWLEDGE = {
    "1": {
        "title": "World 1: DolaCode Numeracy",
        "description": "Maths foundations for coding: numbers, logic, patterns, shapes, measurement, fractions, data, and algorithmic thinking.",
        "parts": {
            1: "Part 1: Number Sense Foundation (counting, recognition, comparison, sequencing, odd/even, place value, addition, subtraction, bonds, skip counting)",
            2: "Part 2: Primary Operations & Arithmetic (addition regrouping, subtraction borrowing, multiplication, division, times tables, factors, word problems, rounding, money, speed math)",
            3: "Part 3: Patterns, Sequences & Logic (number/shape/growing patterns, missing terms, simple sequences, rule-based patterns, matching, classification, booleans, conditionals)",
            4: "Part 4: Geometry, Spatial Reasoning & Positioning (shapes 2D/3D, symmetry, bearings, relative movement, turns, angles, grid movement, cartesian coordinates, route mapping)",
            5: "Part 5: Measurement, Scale & Physical Computing (length, height, weight, time, calendar, speed, distance, temperature, area, perimeter)",
            6: "Part 6: Fractions, Decimals & Percentages (whole fractions, equivalence, comparison, addition, decimals, transaction ledgers, percentages, discounts, ratios, proportions)",
            7: "Part 7: Data & Statistics (data collecting, tables, pictograms, bar charts, line graphs, pie charts, mean, median, mode, range interpretation)",
            8: "Part 8: Problem Solving & Algorithmic Thinking (execution sequences, decomposition, syntax bugs, math bugs, logic puzzles, word logic, cryptography, optimization, flowcharts, loop design)"
        }
    },
    "2": {
        "title": "World 2: Block Coding",
        "description": "Visual drag-and-drop programming using blocks. Teaches loops, events, motion, sprite animation, variables, and concurrent execution."
    },
    "3": {
        "title": "World 3: Python Pro",
        "description": "Code-control animated Python studio. Children write real typed Python to navigate obstacle mazes, build cosmic bridges with for loops, manage coin and health variables in vaults, dodge traps with if/else conditionals, and code modular functions to defeat the Cyber Dragon in boss battles.",
        "classes": {
            1: "Class 1: Robo Motion Island — Python Commands & Sequencing. Learn Python statements and function arguments (hero.move_right(3), hero.jump(), hero.collect(), hero.say()). Move through grid mazes and grab energy gems. Project: Robo Treasure Run.",
            2: "Class 2: Power Loop Realm — For Loops & Repetition. Master 'for i in range(count):' without repeating code. Build bridges across voids and climb cosmic star stairs. Project: Cosmic Bridge Builder.",
            3: "Class 3: Variable Vault — Variables, Math & Score Counters. Learn variables that store numbers (coins = 0, health = 100, coins = coins + 20, coins = coins - 15). Pay the Goblin Merchant for the Golden Key and unlock the vault. Project: Vault Master Heist.",
            4: "Class 4: Decision Dungeon — Conditionals (If, Elif, Else). Teach robots to scan sensor hazards and match color-coded security gates (if gate == 'red'). Project: Smart Scanner Drone.",
            5: "Class 5: Code Master Challenge — Functions & Boss Battle. Define modular reusable functions (def attack_combo():), combine loops and health variables, and defeat the Cyber Dragon. Final Project: Epic Cyber Dragon Defense."
        }
    },
    "4": {
        "title": "World 4: Web Dev Studio",
        "description": "Interactive kid-friendly web development studio covering HTML, CSS, and JavaScript across 5 guided classes with live preview.",
        "classes": {
            1: "Class 1: Website Builder Island — Learn HTML without memorising HTML. Children drag headings, pictures, buttons, and paragraphs onto a blank webpage. DolaCode reveals <h1>Hello!</h1>. Project: My First Webpage.",
            2: "Class 2: Colour Magic Kingdom — Learn CSS through design. Change colours, fonts, borders, backgrounds, and layouts. Transform a dull website instantly. Project: My Colourful Personal Website.",
            3: "Class 3: Button Power City — Learn basic JavaScript through actions. Make buttons change colours, display messages, count clicks, and reveal hidden treasures. Project: Interactive Birthday Website.",
            4: "Class 4: My Online Shop — Combine HTML, CSS, and JavaScript. Create a virtual store for books, snacks, or toys. Add products, display Naira (₦) prices, and calculate shopping basket totals. Project: My First Online Store.",
            5: "Class 5: Web Creator Challenge — Build an original responsive website choosing between school, portfolio, animal club, story, or small business. Final Project: Finished responsive website with shareable preview."
        }
    },
    "5": {
        "title": "World 5: App Dev Studio",
        "description": "Mobile application design and development studio. Teaches UI components, event-driven actions, variables, multi-screen navigation, and app creation across 5 classes.",
        "classes": {
            1: "Class 1: App Builder Playground — Understand app screens and components. Children drag buttons, pictures, labels and text boxes onto a phone. Project: My First Hello App.",
            2: "Class 2: Magic Button Lab — Understand events and actions. Connect visual blocks: WHEN button tapped → show message, play sound, change picture or update score. Project: Funny Soundboard App.",
            3: "Class 3: Smart Pet App — Learn variables, conditions and state. Build a virtual pet whose happiness, hunger and energy change when buttons are pressed. Project: My Virtual Pet.",
            4: "Class 4: Quiz & Game Factory — Learn screens, navigation, lists and scoring. Build a quiz with multiple questions, answers, scores and a results screen. Project: My Own Quiz App.",
            5: "Class 5: App Inventor Challenge — Create a useful app independently: savings tracker (with Nigerian Naira ₦), study planner, homework organiser, or reading tracker. Final Project: A completed app with a preview and shareable project link."
        }
    }
}

def get_curriculum_context(stage, level, extra_context=""):
    stage_str = str(stage)
    level_str = str(level)

    info = STAGE_KNOWLEDGE.get(stage_str, {
        "title": f"World Stage {stage_str}",
        "description": "Interactive coding challenge"
    })

    summary = f"Stage: {info['title']}\nOverview: {info['description']}\nLevel: {level_str}"
    
    if stage_str == "1" and "parts" in info:
        try:
            lvl_num = int(level_str)
            part_num = min(8, max(1, (lvl_num - 1) // 10 + 1))
            part_desc = info["parts"].get(part_num, "")
            summary += f"\nCurriculum Area: {part_desc}"
        except ValueError:
            pass
    elif stage_str in ["3", "4", "5"] and "classes" in info:
        try:
            cls_num = int(level_str)
            cls_desc = info["classes"].get(cls_num, "")
            if cls_desc:
                summary += f"\nClass Focus: {cls_desc}"
        except ValueError:
            pass

    if extra_context:
        summary += f"\nTask Context: {extra_context}"

    return summary
