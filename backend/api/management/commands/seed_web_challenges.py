import json
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import WebChallenge

CHALLENGES_DATA = [
    # STAGE 1: HTML BASICS (THE ARCHITECT)
    {
        "slug": "secret-agent-id-badge",
        "title": "Secret Agent ID Badge",
        "stage_order": 1,
        "reward_xp": 50,
        "instructions_markdown": """## Mission Goal 🕵️‍♂️
Welcome Agent! Create your confidential spy identity card. Your card needs:
1. An `<h1>` heading with your agent codename.
2. An `<h3>` subheading for your secret division.
3. A `<p>` paragraph describing your superpower!""",
        "starter_html": """<div class="card">
  <h1>AGENT LEO</h1>
  <h3>CYBER INTELLIGENCE DIVISION</h3>
  <p>Superpower: Instant Code Mastery and Quantum Hacking!</p>
</div>""",
        "starter_css": """.card {
  background: #0f172a;
  border: 3px solid #00f2fe;
  border-radius: 16px;
  padding: 24px;
  color: #f8fafc;
  text-align: center;
}""",
        "solution_criteria": {"required_tags": ["h1", "h3", "p"], "required_classes": ["card"]}
    },
    {
        "slug": "adopt-an-alien-pet",
        "title": "Adopt an Alien Pet",
        "stage_order": 2,
        "reward_xp": 50,
        "instructions_markdown": """## Mission Goal 👽
Give a home to a cosmic monster pet! Your pet profile needs:
1. An `<h2>` header with your pet's name.
2. An `<img>` tag with sticker `/assets/stickers/dino.svg`.
3. A `<p>` tag describing what your pet loves to eat!""",
        "starter_html": """<div class="alien-home">
  <h2>ZOGG THE DINO</h2>
  <img src="/assets/stickers/dino.svg" width="100" alt="Alien Pet Dino">
  <p>Zogg loves eating space stardust and playing cosmic fetch!</p>
</div>""",
        "starter_css": """.alien-home {
  background: #1e1b4b;
  border: 4px solid #10b981;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
}""",
        "solution_criteria": {"required_tags": ["h2", "img", "p"], "required_classes": ["alien-home"]}
    },
    {
        "slug": "ice-cream-sundae-builder",
        "title": "The Ice Cream Sundae Builder",
        "stage_order": 3,
        "reward_xp": 50,
        "instructions_markdown": """## Mission Goal 🍦
Build a mega delicious ice cream sundae! Your menu needs:
1. An `<h1>` title for your Sundae Shop.
2. An unordered list `<ul>` with at least three `<li>` list items for your favorite toppings!""",
        "starter_html": """<div class="sundae-card">
  <h1>SUPER SUNDAE MENU</h1>
  <ul>
    <li>Rainbow Sprinkles</li>
    <li>Hot Fudge Sauce</li>
    <li>Giant Golden Cherry</li>
  </ul>
</div>""",
        "starter_css": """.sundae-card {
  background: #2e1065;
  border: 4px solid #ff007f;
  border-radius: 18px;
  padding: 20px;
  color: #fff;
}
ul {
  padding-left: 20px;
}""",
        "solution_criteria": {"required_tags": ["h1", "ul", "li"], "required_classes": ["sundae-card"]}
    },
    {
        "slug": "rocket-launch-button",
        "title": "The Rocket Launch Button",
        "stage_order": 4,
        "reward_xp": 50,
        "instructions_markdown": """## Mission Goal 🚀
Prepare for blastoff! Build a space launch control box:
1. An `<h1>` mission header.
2. An `<img>` rocket sticker (`/assets/stickers/rocket.svg`).
3. A `<button class="launch-btn">` tag to trigger launch countdown!""",
        "starter_html": """<div class="launch-pad">
  <h1>MISSION TO MARS</h1>
  <img src="/assets/stickers/rocket.svg" width="100" alt="Rocket">
  <button class="launch-btn">LAUNCH ROCKET! 🚀</button>
</div>""",
        "starter_css": """.launch-pad {
  background: #090d16;
  border: 4px solid #f59e0b;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
}
.launch-btn {
  background: #f59e0b;
  color: #090d16;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
}""",
        "solution_criteria": {"required_tags": ["h1", "img", "button"], "required_classes": ["launch-pad", "launch-btn"]}
    },

    # STAGE 2: CSS MAGIC (THE STYLIST)
    {
        "slug": "cyberpunk-neon-sign",
        "title": "Cyberpunk Neon Sign",
        "stage_order": 5,
        "reward_xp": 60,
        "instructions_markdown": """## Mission Goal ⚡
Light up the neon city! Style your neon sign title with CSS color and text-shadow glow:
1. Set `color: #00f2fe;` on your `.neon-text` class.
2. Add a vibrant `text-shadow: 0 0 15px #00f2fe;` to make it shine!""",
        "starter_html": """<div class="neon-card">
  <h1 class="neon-text">DOLACITY 2099</h1>
  <p>Welcome to the Future of Coding</p>
</div>""",
        "starter_css": """.neon-card {
  background: #050515;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
}
.neon-text {
  color: #00f2fe;
  text-shadow: 0 0 15px #00f2fe;
  font-size: 32px;
}""",
        "solution_criteria": {"required_tags": ["h1", "p"], "required_classes": ["neon-card", "neon-text"], "required_css_rules": ["text-shadow", "#00f2fe"]}
    },
    {
        "slug": "space-porthole-window",
        "title": "Space Capsule Window",
        "stage_order": 6,
        "reward_xp": 60,
        "instructions_markdown": """## Mission Goal 🌌
Create a round space capsule porthole window! Your CSS needs:
1. A thick border around your `.porthole` container.
2. Set `border-radius: 50%;` to turn your square box into a circular window!""",
        "starter_html": """<div class="porthole">
  <img src="/assets/hero.png" width="100" alt="Space Leo">
</div>""",
        "starter_css": """.porthole {
  width: 180px;
  height: 180px;
  background: #0b0f19;
  border: 6px solid #fbbf24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
}""",
        "solution_criteria": {"required_tags": ["div", "img"], "required_classes": ["porthole"], "required_css_rules": ["border-radius: 50%", "border"]}
    },
    {
        "slug": "mood-ring-gradient",
        "title": "Mood Ring Gradient Card",
        "stage_order": 7,
        "reward_xp": 70,
        "instructions_markdown": """## Mission Goal 🔮
Create a colorful mood ring card! Your CSS needs:
1. Set `background: linear-gradient(135deg, #ff007f, #8b5cf6);` on `.mood-card`.
2. Style your title with a shiny gold star badge sticker!""",
        "starter_html": """<div class="mood-card">
  <h2>MY COSMIC MOOD</h2>
  <img src="/assets/stickers/gold-star.svg" width="80">
  <p>Status: Super Charged & Ready!</p>
</div>""",
        "starter_css": """.mood-card {
  background: linear-gradient(135deg, #ff007f, #8b5cf6);
  padding: 24px;
  border-radius: 20px;
  text-align: center;
  color: white;
}""",
        "solution_criteria": {"required_tags": ["h2", "img", "p"], "required_classes": ["mood-card"], "required_css_rules": ["linear-gradient"]}
    },

    # STAGE 3: INTERACTIVE & ANIMATED (THE WIZARD)
    {
        "slug": "hovering-power-button",
        "title": "The Hovering Super Button",
        "stage_order": 8,
        "reward_xp": 80,
        "instructions_markdown": """## Mission Goal ✨
Make your button jump to life when hovered over! Your CSS needs:
1. A `.power-btn:hover` pseudo-class.
2. Apply `transform: scale(1.1);` or `transform: translateY(-4px);` when hovering!""",
        "starter_html": """<div class="control-room">
  <h3>PRESS FOR SUPERPOWERS</h3>
  <button class="power-btn">ACTIVATE SHIELD! 🛡️</button>
</div>""",
        "starter_css": """.control-room {
  background: #0f172a;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
}
.power-btn {
  background: #10b981;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  transition: all 0.2s ease;
}
.power-btn:hover {
  transform: scale(1.1);
  background: #34d399;
}""",
        "solution_criteria": {"required_tags": ["h3", "button"], "required_classes": ["control-room", "power-btn"], "required_css_rules": [":hover", "transform"]}
    },
    {
        "slug": "zero-gravity-astronaut",
        "title": "Zero-Gravity Astronaut Float",
        "stage_order": 9,
        "reward_xp": 90,
        "instructions_markdown": """## Mission Goal 👨‍🚀
Make an astronaut float smoothly in zero gravity! Your CSS needs:
1. Define `@keyframes floatAnimation` with `0%` and `100%` positions.
2. Apply `animation: floatAnimation 3s infinite ease-in-out;` to `.floating-hero`!""",
        "starter_html": """<div class="space-station">
  <img src="/assets/stickers/happy-robot.svg" class="floating-hero" width="110">
  <h2>Zero Gravity Zone</h2>
</div>""",
        "starter_css": """.space-station {
  background: #090d16;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
}
.floating-hero {
  animation: floatAnimation 3s infinite ease-in-out;
}
@keyframes floatAnimation {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}""",
        "solution_criteria": {"required_tags": ["div", "img", "h2"], "required_classes": ["space-station", "floating-hero"], "required_css_rules": ["@keyframes", "animation"]}
    },
    {
        "slug": "monster-battle-card-capstone",
        "title": "Monster Battle Card Capstone",
        "stage_order": 10,
        "reward_xp": 100,
        "instructions_markdown": """## Capstone Mission Goal 🏆
Build a complete animated Monster Battle Trading Card! Your card must combine:
1. An `<h1>` title, `<img>` pet avatar, and `<button class="battle-btn">` attack button.
2. A custom gradient card background with glowing border and rounded corners.
3. Hover scale effects on the battle button!""",
        "starter_html": """<div class="battle-card">
  <div class="card-header">
    <h1>LAVA DINO BOSS</h1>
  </div>
  <img src="/assets/stickers/dino.svg" width="120" alt="Lava Dino">
  <div class="stats">
    <p>⚡ Power: 9500 | 🛡️ Shield: 800</p>
  </div>
  <button class="battle-btn">UNLEASH LAVA BLAST! 🔥</button>
</div>""",
        "starter_css": """.battle-card {
  background: linear-gradient(145deg, #1e1b4b, #31104b);
  border: 4px solid #f9a826;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 0 20px rgba(249, 168, 38, 0.4);
  color: white;
}
.battle-btn {
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  color: white;
  font-weight: 800;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.battle-btn:hover {
  transform: scale(1.08);
}""",
        "solution_criteria": {"required_tags": ["h1", "img", "p", "button"], "required_classes": ["battle-card", "battle-btn"], "required_css_rules": ["linear-gradient", "transition"]}
    }
]


class Command(BaseCommand):
    help = "Seeds 10 gamified, kid-friendly Web Dev Studio challenges into the database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Web Dev Studio challenge seed process..."))
        
        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for data in CHALLENGES_DATA:
                obj, created = WebChallenge.objects.update_or_create(
                    slug=data["slug"],
                    defaults={
                        "title": data["title"],
                        "stage_order": data["stage_order"],
                        "reward_xp": data["reward_xp"],
                        "instructions_markdown": data["instructions_markdown"],
                        "starter_html": data["starter_html"],
                        "starter_css": data["starter_css"],
                        "solution_criteria": data["solution_criteria"]
                    }
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  + Created: [{obj.stage_order}] {obj.title} ({obj.slug})"))
                else:
                    updated_count += 1
                    self.stdout.write(self.style.WARNING(f"  ~ Updated: [{obj.stage_order}] {obj.title} ({obj.slug})"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully seeded Web Dev Studio challenges! "
                f"Total: {created_count + updated_count} (Created: {created_count}, Updated: {updated_count})"
            )
        )
