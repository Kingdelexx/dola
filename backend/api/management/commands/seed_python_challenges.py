from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import PythonChallenge

PYTHON_CHALLENGES_DATA = [
    # =========================================================================
    # CLASS 1 — ROBO MOTION ISLAND
    # =========================================================================
    {
        "slug": "class-1-robo-motion",
        "title": "Class 1: Robo Motion Island",
        "class_number": 1,
        "stage_order": 1,
        "reward_xp": 60,
        "instructions_markdown": """## Class 1 — Robo Motion Island 🤖
### Understand Python Commands & Sequencing
In Python, programs are sequences of commands executed line-by-line from top to bottom.
Your robot character responds to Python function calls:
- `hero.move_right(steps)`: Walk right across the island tiles.
- `hero.move_up(steps)`: Climb up toward higher ground.
- `hero.jump()`: Leap over spike pits and obstacles!
- `hero.collect()`: Pick up glowing energy crystals.
- `hero.say("message")`: Show an animated speech bubble!

**Project Goal**: Build **Robo Treasure Run**!
- Navigate through the island maze avoiding the spike pit.
- Collect all 3 energy crystals.
- Step into the exit portal to teleport home!""",
        "what_to_achieve": "Project: Robo Treasure Run. Guide your robot to collect 3 power crystals, hop over the spike pit with hero.jump(), and reach the extraction pad.",
        "starter_code": """# 🌟 Class 1: Robo Motion Island
# Guide Leo the Explorer using Python sequence commands!

hero.say("Let's hunt for energy crystals! 🚀")
hero.move_right(2)
hero.collect()

hero.jump()
hero.move_right(3)
hero.collect()

hero.move_up(2)
hero.collect()
hero.say("Mission complete! Teleporting home! ✨")""",
        "game_config": {
            "scene": "island",
            "gridWidth": 10,
            "gridHeight": 7,
            "heroStart": {"x": 1, "y": 3, "dir": "right"},
            "gems": [
                {"id": "g1", "x": 3, "y": 3},
                {"id": "g2", "x": 7, "y": 3},
                {"id": "g3", "x": 7, "y": 1}
            ],
            "traps": [
                {"id": "t1", "x": 4, "y": 3}
            ],
            "exitPortal": {"x": 8, "y": 1}
        },
        "solution_criteria": {
            "required_methods": ["hero.move_right", "hero.collect", "hero.jump"],
            "required_keywords": ["hero"]
        }
    },

    # =========================================================================
    # CLASS 2 — POWER LOOP REALM
    # =========================================================================
    {
        "slug": "class-2-power-loops",
        "title": "Class 2: Power Loop Realm",
        "class_number": 2,
        "stage_order": 2,
        "reward_xp": 75,
        "instructions_markdown": """## Class 2 — Power Loop Realm ⚡
### Master For Loops & Repetition
Don't Repeat Yourself (DRY)! Why write 15 lines of code when you can write a loop in 3 lines?
In Python, we use `for step in range(count):`
```python
for step in range(5):
    hero.build_bridge()
    hero.move_right()
    hero.collect()
```
The computer repeats every indented line inside the loop!

**Project Goal**: Build **Cosmic Bridge Builder**!
- Build an automated bridge across the 5-tile cosmic void.
- Collect star power along the route.
- Reach the floating Sky Citadel!""",
        "what_to_achieve": "Project: Cosmic Bridge Builder. Cross a 5-tile cosmic void using a for loop, building bridges and gathering stars to enter the Sky Citadel.",
        "starter_code": """# ⚡ Class 2: Power Loop Realm
# Don't repeat yourself! Use a for loop to build bridges and collect stars.

hero.say("Powering up the Loop Generator! ⚡")

for step in range(5):
    hero.build_bridge()
    hero.move_right()
    hero.collect()

hero.say("Sky Citadel reached with loop power! 🏰")""",
        "game_config": {
            "scene": "space",
            "gridWidth": 10,
            "gridHeight": 7,
            "heroStart": {"x": 1, "y": 3, "dir": "right"},
            "stars": [
                {"id": "s1", "x": 2, "y": 3},
                {"id": "s2", "x": 3, "y": 3},
                {"id": "s3", "x": 4, "y": 3},
                {"id": "s4", "x": 5, "y": 3},
                {"id": "s5", "x": 6, "y": 3}
            ],
            "voidGaps": [2, 3, 4, 5, 6],
            "exitPortal": {"x": 7, "y": 3}
        },
        "solution_criteria": {
            "required_methods": ["hero.build_bridge", "hero.move_right"],
            "required_keywords": ["for", "in", "range"]
        }
    },

    # =========================================================================
    # CLASS 3 — VARIABLE VAULT
    # =========================================================================
    {
        "slug": "class-3-variable-vault",
        "title": "Class 3: Variable Vault",
        "class_number": 3,
        "stage_order": 3,
        "reward_xp": 90,
        "instructions_markdown": """## Class 3 — Variable Vault 💰
### Learn Variables, Math & Score Counters
Variables are labeled storage boxes in your computer's memory!
```python
coins = 0
coins = coins + 25  # increases coins
coins = coins - 15  # buys key
```
Use `print("Coins:", coins)` to inspect your values in the terminal!

**Project Goal**: Build **Vault Master Heist**!
- Collect gold nuggets to increase your `coins` variable.
- Pay 15 coins to the Goblin Merchant to buy the Golden Key.
- Unlock the Master Vault with coins remaining!""",
        "what_to_achieve": "Project: Vault Master Heist. Manage coin variables, purchase the Golden Key from the merchant, and unlock the vault door.",
        "starter_code": """# 💰 Class 3: Variable Vault
# Store numbers in variables and calculate purchases!

coins = 0
health = 100

hero.move_right(2)
coins = coins + 25
hero.pick_up_gold(25)
print("Coins collected:", coins)

hero.move_right(2)
# The Goblin Merchant asks for 15 coins for the Golden Key!
coins = coins - 15
hero.buy_item("golden_key", 15)
print("Coins left after purchase:", coins)

hero.move_right(2)
hero.unlock_vault()
hero.say("Vault open! Treasures unlocked! 🏆")""",
        "game_config": {
            "scene": "dungeon",
            "gridWidth": 10,
            "gridHeight": 7,
            "heroStart": {"x": 1, "y": 3, "dir": "right"},
            "goldPiles": [{"id": "gold1", "x": 3, "y": 3, "amount": 25}],
            "merchant": {"id": "goblin", "x": 5, "y": 3, "itemName": "golden_key", "price": 15},
            "vaultDoor": {"x": 7, "y": 3}
        },
        "solution_criteria": {
            "required_methods": ["hero.pick_up_gold", "hero.buy_item", "hero.unlock_vault"],
            "required_keywords": ["coins", "print"]
        }
    },

    # =========================================================================
    # CLASS 4 — DECISION DUNGEON
    # =========================================================================
    {
        "slug": "class-4-decision-dungeon",
        "title": "Class 4: Decision Dungeon",
        "class_number": 4,
        "stage_order": 4,
        "reward_xp": 110,
        "instructions_markdown": """## Class 4 — Decision Dungeon 🧠
### Learn Conditionals: If, Elif, Else
Smart robots make decisions using conditions:
```python
color = hero.scan_gate()
if color == "red":
    hero.use_laser("blue")
elif color == "green":
    hero.use_laser("yellow")
else:
    hero.use_laser("white")
```
When conditions are checked, only the matching branch executes!

**Project Goal**: Build **Smart Scanner Drone**!
- Program your robot to scan 3 security gates.
- Fire the counter-element beam to disarm each gate.
- Safely cross through the laser security corridor!""",
        "what_to_achieve": "Project: Smart Scanner Drone. Program robot decision logic using if, elif, and else to scan and disarm all security gates.",
        "starter_code": """# 🧠 Class 4: Decision Dungeon
# Use if, elif, and else so your robot makes smart choices!

for step in range(3):
    color = hero.scan_gate()
    
    if color == "red":
        hero.use_laser("blue")
        hero.say("Freezing red laser with blue frost beam! ❄️")
    elif color == "green":
        hero.use_laser("yellow")
        hero.say("Disarming green gate with yellow spark! ⚡")
    else:
        hero.use_laser("white")
        hero.say("Neutralizing with pure white beam! 🌟")
        
    hero.move_right(2)

hero.say("All security laser gates safely passed! 🚀")""",
        "game_config": {
            "scene": "cyber",
            "gridWidth": 10,
            "gridHeight": 7,
            "heroStart": {"x": 1, "y": 3, "dir": "right"},
            "gates": [
                {"id": "g1", "x": 3, "y": 3, "color": "red"},
                {"id": "g2", "x": 5, "y": 3, "color": "green"},
                {"id": "g3", "x": 7, "y": 3, "color": "purple"}
            ],
            "exitPortal": {"x": 8, "y": 3}
        },
        "solution_criteria": {
            "required_methods": ["hero.scan_gate", "hero.use_laser", "hero.move_right"],
            "required_keywords": ["if", "elif", "else"]
        }
    },

    # =========================================================================
    # CLASS 5 — CODE MASTER CHALLENGE
    # =========================================================================
    {
        "slug": "class-5-code-master",
        "title": "Class 5: Code Master Challenge",
        "class_number": 5,
        "stage_order": 5,
        "reward_xp": 150,
        "instructions_markdown": """## Class 5 — Code Master Challenge 🐉
### Combine Functions, Loops & Battle the Cyber Dragon!
Functions (`def`) bundle multiple commands into reusable superpowers!
```python
def super_defense():
    hero.raise_shield()
    hero.say("Shields online! 🛡️")

def attack_combo(hits):
    for i in range(hits):
        hero.cast_fireball(25)
        hero.dodge()
```
Call your custom functions to execute a battle strategy and defeat the boss!

**Final Project Deliverables**:
- A complete Python battle script with custom functions (`def`).
- Strategic shield deployment and fireball combo hits.
- Reduce the Cyber Dragon's HP from 100 to 0 and celebrate with a victory dance!""",
        "what_to_achieve": "Final Project: Epic Cyber Dragon Defense. Define custom functions with def, defeat the Cyber Dragon boss with 4 combo attacks, and earn your Python Master certificate.",
        "starter_code": """# 🐉 Class 5: Code Master Challenge (Boss Battle Arena)
# Define custom functions to unleash powerful combos!

def super_defense():
    hero.raise_shield()
    hero.say("Cyber shields online! Ready for battle! 🛡️")

def attack_combo(hits):
    for i in range(hits):
        hero.cast_fireball(25)
        hero.dodge()

# Battle execution plan:
super_defense()
attack_combo(4)
hero.victory_dance()
hero.say("The Cyber Dragon is defeated! Python Master status achieved! 🏆")""",
        "game_config": {
            "scene": "arena",
            "gridWidth": 10,
            "gridHeight": 7,
            "heroStart": {"x": 2, "y": 3, "dir": "right"},
            "boss": {"id": "cyber_dragon", "name": "Cyber Dragon", "x": 7, "y": 3, "maxHp": 100}
        },
        "solution_criteria": {
            "required_methods": ["hero.raise_shield", "hero.cast_fireball", "hero.dodge", "hero.victory_dance"],
            "required_keywords": ["def", "for", "range"]
        }
    }
]


class Command(BaseCommand):
    help = "Seeds World 3 (Python Pro) challenges into the database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Python Pro challenge seed process..."))

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for c_data in PYTHON_CHALLENGES_DATA:
                challenge, created = PythonChallenge.objects.update_or_create(
                    slug=c_data["slug"],
                    defaults={
                        "title": c_data["title"],
                        "class_number": c_data["class_number"],
                        "stage_order": c_data["stage_order"],
                        "instructions_markdown": c_data["instructions_markdown"],
                        "what_to_achieve": c_data["what_to_achieve"],
                        "starter_code": c_data["starter_code"],
                        "game_config": c_data["game_config"],
                        "solution_criteria": c_data["solution_criteria"],
                        "reward_xp": c_data["reward_xp"],
                    }
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully processed Python Pro challenges: {created_count} created, {updated_count} updated."
            )
        )
