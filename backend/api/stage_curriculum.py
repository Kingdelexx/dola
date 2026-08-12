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
        "title": "World 4: App Studio",
        "description": "Mobile application design studio. Building user interface components (buttons, text, sliders, canvas), event handlers, and JavaScript/Block logic."
    },
    "4": {
        "title": "World 3: Python Pro",
        "description": "Real text-based Python programming with an AI sidekick. Covers variables, data types, print statements, loops, functions, and algorithm challenges."
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

    if extra_context:
        summary += f"\nTask Context: {extra_context}"

    return summary
