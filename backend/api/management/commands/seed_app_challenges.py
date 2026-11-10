import json
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import AppChallenge

APP_CHALLENGES_DATA = [
    # =========================================================================
    # CLASS 1 — APP BUILDER PLAYGROUND
    # =========================================================================
    {
        "slug": "class-1-hello-app",
        "title": "Class 1: My First Hello App",
        "class_number": 1,
        "stage_order": 1,
        "reward_xp": 60,
        "instructions_markdown": """## Class 1 — App Builder Playground 📱
### Understand App Screens & Components
Welcome to mobile app development! Every mobile app is made of building blocks called **Components**:
1. 🏷️ **Labels**: Show titles, welcome messages, and greetings.
2. 🖼️ **Pictures**: Show avatars, logos, and stickers.
3. 📝 **Text Boxes**: Allow users to type their name or notes.
4. 🔘 **Buttons**: Tappable actions that bring your app alive!

**Project Goal**: Build **My First Hello App**!
- Drag or tap a **Label** to welcome visitors.
- Add an **Avatar / Picture** sticker.
- Add an **Input Box** for the user's name.
- Add a **Greeting Button** that says hello when pressed!""",
        "starter_screens": [
            {
                "id": "screen1",
                "name": "Main Screen",
                "backgroundColor": "#0f172a",
                "elements": [
                    {
                        "id": "appTitle",
                        "type": "label",
                        "name": "Welcome Label",
                        "text": "Welcome to My App! 👋",
                        "style": {"x": 30, "y": 50, "width": 260, "height": 45, "fontSize": 20, "fontWeight": "bold", "color": "#facc15", "textAlign": "center", "position": "absolute", "zIndex": 1}
                    },
                    {
                        "id": "avatarImg",
                        "type": "image",
                        "name": "Mascot Avatar",
                        "src": "/assets/stickers/happy-robot.svg",
                        "style": {"x": 105, "y": 110, "width": 110, "height": 110, "position": "absolute", "zIndex": 2}
                    },
                    {
                        "id": "nameInput",
                        "type": "input",
                        "name": "Name Input Box",
                        "hint": "Type your name here...",
                        "style": {"x": 35, "y": 240, "width": 250, "height": 45, "backgroundColor": "#1e293b", "color": "#ffffff", "fontSize": 15, "borderRadius": 12, "position": "absolute", "zIndex": 3}
                    },
                    {
                        "id": "helloBtn",
                        "type": "button",
                        "name": "Greeting Button",
                        "text": "Say Hello! 🚀",
                        "style": {"x": 35, "y": 305, "width": 250, "height": 50, "backgroundColor": "#10b981", "color": "#ffffff", "fontSize": 16, "fontWeight": "bold", "borderRadius": 16, "position": "absolute", "zIndex": 4}
                    },
                    {
                        "id": "greetingOutput",
                        "type": "label",
                        "name": "Greeting Output",
                        "text": "Tap the button to test your app!",
                        "style": {"x": 30, "y": 380, "width": 260, "height": 60, "fontSize": 14, "color": "#94a3b8", "textAlign": "center", "position": "absolute", "zIndex": 5}
                    }
                ]
            }
        ],
        "starter_code": """onEvent("helloBtn", "click", () => {
  let userName = getText("nameInput") || "Explorer";
  setProperty("greetingOutput", "text", "Hello " + userName + "! Welcome to your first mobile app! 🎉");
  playSound("cheer");
  log("Greeted user: " + userName);
});""",
        "solution_criteria": {"required_elements": ["button", "label", "image", "input"], "required_events": ["click"]}
    },

    # =========================================================================
    # CLASS 2 — MAGIC BUTTON LAB
    # =========================================================================
    {
        "slug": "class-2-soundboard-app",
        "title": "Class 2: Funny Soundboard App",
        "class_number": 2,
        "stage_order": 2,
        "reward_xp": 75,
        "instructions_markdown": """## Class 2 — Magic Button Lab ⚡
### Understand Events and Actions
Apps don't just sit there—they respond when you interact with them!
Connect visual action blocks:
- **WHEN** button tapped 👆 → **THEN** show message, play funny sound, change picture, or update score!

**Project Goal**: Build a **Funny Soundboard App**!
- Create at least 3-4 sound buttons (Laser, Boing, Cowbell, Victory Fanfare).
- Connect `onEvent(button, "click")` to play funny sounds.
- Display a funny reaction label and update the tap score counter!""",
        "starter_screens": [
            {
                "id": "screen1",
                "name": "Soundboard Stage",
                "backgroundColor": "#1e1b4b",
                "elements": [
                    {
                        "id": "sbTitle",
                        "type": "label",
                        "name": "Board Title",
                        "text": "🎉 FUNNY SOUNDBOARD 🎶",
                        "style": {"x": 20, "y": 40, "width": 280, "height": 40, "fontSize": 18, "fontWeight": "bold", "color": "#f472b6", "textAlign": "center", "position": "absolute", "zIndex": 1}
                    },
                    {
                        "id": "mascotImg",
                        "type": "image",
                        "name": "Sound DJ",
                        "src": "/assets/stickers/dino.svg",
                        "style": {"x": 110, "y": 85, "width": 100, "height": 100, "position": "absolute", "zIndex": 2}
                    },
                    {
                        "id": "soundMsg",
                        "type": "label",
                        "name": "Reaction Label",
                        "text": "Tap any button for funny sounds!",
                        "style": {"x": 20, "y": 195, "width": 280, "height": 30, "fontSize": 13, "color": "#fbbf24", "textAlign": "center", "position": "absolute", "zIndex": 3}
                    },
                    {
                        "id": "btnLaser",
                        "type": "button",
                        "name": "Laser Button",
                        "text": "⚡ Laser Zap!",
                        "style": {"x": 30, "y": 240, "width": 125, "height": 55, "backgroundColor": "#06b6d4", "color": "#ffffff", "fontSize": 14, "fontWeight": "bold", "borderRadius": 14, "position": "absolute", "zIndex": 4}
                    },
                    {
                        "id": "btnBoing",
                        "type": "button",
                        "name": "Boing Button",
                        "text": "🦘 Boing!",
                        "style": {"x": 165, "y": 240, "width": 125, "height": 55, "backgroundColor": "#ec4899", "color": "#ffffff", "fontSize": 14, "fontWeight": "bold", "borderRadius": 14, "position": "absolute", "zIndex": 5}
                    },
                    {
                        "id": "btnCheer",
                        "type": "button",
                        "name": "Cheer Button",
                        "text": "📣 Victory!",
                        "style": {"x": 30, "y": 310, "width": 125, "height": 55, "backgroundColor": "#10b981", "color": "#ffffff", "fontSize": 14, "fontWeight": "bold", "borderRadius": 14, "position": "absolute", "zIndex": 6}
                    },
                    {
                        "id": "btnCowbell",
                        "type": "button",
                        "name": "Cowbell Button",
                        "text": "🔔 Cowbell",
                        "style": {"x": 165, "y": 310, "width": 125, "height": 55, "backgroundColor": "#f59e0b", "color": "#ffffff", "fontSize": 14, "fontWeight": "bold", "borderRadius": 14, "position": "absolute", "zIndex": 7}
                    },
                    {
                        "id": "scoreLabel",
                        "type": "label",
                        "name": "Score Counter",
                        "text": "Sounds Played: 0",
                        "style": {"x": 30, "y": 390, "width": 260, "height": 30, "fontSize": 14, "color": "#a5b4fc", "textAlign": "center", "fontWeight": "bold", "position": "absolute", "zIndex": 8}
                    }
                ]
            }
        ],
        "starter_code": """let soundCount = 0;

function registerSound(name, msg) {
  soundCount = soundCount + 1;
  setProperty("scoreLabel", "text", "Sounds Played: " + soundCount);
  setProperty("soundMsg", "text", msg);
  playSound(name);
}

onEvent("btnLaser", "click", () => registerSound("laser", "Pew pew! Cosmic laser fired! ⚡"));
onEvent("btnBoing", "click", () => registerSound("boing", "Boing! Super bouncy jump! 🦘"));
onEvent("btnCheer", "click", () => registerSound("cheer", "Crowd cheers! High five! 📣"));
onEvent("btnCowbell", "click", () => registerSound("cowbell", "More cowbell! Clang clang! 🔔"));""",
        "solution_criteria": {"required_elements": ["button", "label", "image"], "required_events": ["click"], "required_keywords": ["soundCount", "playSound"]}
    },

    # =========================================================================
    # CLASS 3 — SMART PET APP
    # =========================================================================
    {
        "slug": "class-3-virtual-pet",
        "title": "Class 3: My Virtual Pet",
        "class_number": 3,
        "stage_order": 3,
        "reward_xp": 90,
        "instructions_markdown": """## Class 3 — Smart Pet App 🐾
### Learn Variables, Conditions & State
Virtual pets have feelings! Learn how variables store numbers that change over time:
- 💖 `happiness` (0 to 100)
- 🍎 `hunger` (0 to 100)
- ⚡ `energy` (0 to 100)

**Conditions (If/Else)**:
- IF hunger > 80: Pet says "I'm so hungry! Feed me apples! 🍎"
- IF energy < 20: Pet says "Zzz... Sleepy time! 😴"
- IF happiness >= 80: Pet does a happy dance!

**Project Goal**: Build **My Virtual Pet**!
- Add buttons to **Feed Snack 🍕**, **Play Fetch 🎾**, and **Take Nap 🛏️**.
- Update progress gauges and pet mood messages in real-time!""",
        "starter_screens": [
            {
                "id": "screen1",
                "name": "Pet Room",
                "backgroundColor": "#064e3b",
                "elements": [
                    {
                        "id": "petTitle",
                        "type": "label",
                        "name": "Pet Name",
                        "text": "🐶 BUBBLES THE SMART PET",
                        "style": {"x": 20, "y": 30, "width": 280, "height": 35, "fontSize": 17, "fontWeight": "bold", "color": "#6ee7b7", "textAlign": "center", "position": "absolute", "zIndex": 1}
                    },
                    {
                        "id": "petAvatar",
                        "type": "image",
                        "name": "Pet Sprite",
                        "src": "/assets/stickers/happy-robot.svg",
                        "style": {"x": 105, "y": 70, "width": 110, "height": 110, "position": "absolute", "zIndex": 2}
                    },
                    {
                        "id": "moodSpeech",
                        "type": "label",
                        "name": "Speech Bubble",
                        "text": "Woof! I am happy and ready to play! 🌟",
                        "style": {"x": 25, "y": 185, "width": 270, "height": 45, "fontSize": 13, "color": "#fef08a", "textAlign": "center", "fontWeight": "bold", "position": "absolute", "zIndex": 3}
                    },
                    {
                        "id": "statHappiness",
                        "type": "label",
                        "name": "Happiness Stat",
                        "text": "💖 Happiness: 80%",
                        "style": {"x": 30, "y": 235, "width": 260, "height": 25, "fontSize": 13, "color": "#f472b6", "fontWeight": "bold", "position": "absolute", "zIndex": 4}
                    },
                    {
                        "id": "statHunger",
                        "type": "label",
                        "name": "Hunger Stat",
                        "text": "🍎 Hunger: 20%",
                        "style": {"x": 30, "y": 265, "width": 260, "height": 25, "fontSize": 13, "color": "#facc15", "fontWeight": "bold", "position": "absolute", "zIndex": 5}
                    },
                    {
                        "id": "statEnergy",
                        "type": "label",
                        "name": "Energy Stat",
                        "text": "⚡ Energy: 85%",
                        "style": {"x": 30, "y": 295, "width": 260, "height": 25, "fontSize": 13, "color": "#38bdf8", "fontWeight": "bold", "position": "absolute", "zIndex": 6}
                    },
                    {
                        "id": "btnFeed",
                        "type": "button",
                        "name": "Feed Button",
                        "text": "🍕 Feed Snack",
                        "style": {"x": 20, "y": 340, "width": 85, "height": 45, "backgroundColor": "#f59e0b", "color": "#ffffff", "fontSize": 12, "fontWeight": "bold", "borderRadius": 12, "position": "absolute", "zIndex": 7}
                    },
                    {
                        "id": "btnPlay",
                        "type": "button",
                        "name": "Play Button",
                        "text": "🎾 Play Fetch",
                        "style": {"x": 115, "y": 340, "width": 90, "height": 45, "backgroundColor": "#ec4899", "color": "#ffffff", "fontSize": 12, "fontWeight": "bold", "borderRadius": 12, "position": "absolute", "zIndex": 8}
                    },
                    {
                        "id": "btnSleep",
                        "type": "button",
                        "name": "Sleep Button",
                        "text": "🛏️ Take Nap",
                        "style": {"x": 215, "y": 340, "width": 85, "height": 45, "backgroundColor": "#3b82f6", "color": "#ffffff", "fontSize": 12, "fontWeight": "bold", "borderRadius": 12, "position": "absolute", "zIndex": 9}
                    }
                ]
            }
        ],
        "starter_code": """let happiness = 80;
let hunger = 20;
let energy = 85;

function updatePetState() {
  setProperty("statHappiness", "text", "💖 Happiness: " + happiness + "%");
  setProperty("statHunger", "text", "🍎 Hunger: " + hunger + "%");
  setProperty("statEnergy", "text", "⚡ Energy: " + energy + "%");

  if (hunger >= 75) {
    setProperty("moodSpeech", "text", "Tummy is rumbling! Feed me a snack! 🍎");
  } else if (energy <= 20) {
    setProperty("moodSpeech", "text", "Yawn... I need a cozy nap! 😴");
  } else if (happiness >= 85) {
    setProperty("moodSpeech", "text", "Yay! Best day ever with my favorite friend! 🎉");
  } else {
    setProperty("moodSpeech", "text", "I love exploring with you! What next? 🐾");
  }
}

onEvent("btnFeed", "click", () => {
  hunger = Math.max(0, hunger - 25);
  happiness = Math.min(100, happiness + 10);
  playSound("cheer");
  updatePetState();
});

onEvent("btnPlay", "click", () => {
  happiness = Math.min(100, happiness + 20);
  energy = Math.max(0, energy - 20);
  hunger = Math.min(100, hunger + 15);
  playSound("boing");
  updatePetState();
});

onEvent("btnSleep", "click", () => {
  energy = Math.min(100, energy + 35);
  hunger = Math.min(100, hunger + 10);
  playSound("cowbell");
  updatePetState();
});""",
        "solution_criteria": {"required_elements": ["button", "label", "image"], "required_events": ["click"], "required_keywords": ["happiness", "hunger", "energy", "updatePetState"]}
    },

    # =========================================================================
    # CLASS 4 — QUIZ & GAME FACTORY
    # =========================================================================
    {
        "slug": "class-4-quiz-app",
        "title": "Class 4: My Own Quiz App",
        "class_number": 4,
        "stage_order": 4,
        "reward_xp": 110,
        "instructions_markdown": """## Class 4 — Quiz & Game Factory 🎮
### Learn Screens, Navigation, Lists & Scoring
Real mobile apps have more than one screen! Learn how to switch between screens and track game scores:
1. 📱 **Screen Navigation**: `setScreen("questionScreen")` and `setScreen("resultsScreen")`.
2. 📋 **Lists & Questions**: Storing trivia questions and answer choices.
3. 🏆 **Score Tracking**: If answer is correct → `score = score + 1`!
4. 🎉 **Results Screen**: Celebrate with trophies and confetti!

**Project Goal**: Build **My Own Quiz App**!
- Create a **Title Screen** with a Start Quiz button.
- Build a **Quiz Screen** with multiple-choice buttons.
- Build a **Results Screen** showing final score and celebration badge!""",
        "starter_screens": [
            {
                "id": "startScreen",
                "name": "Start Screen",
                "backgroundColor": "#1e1b4b",
                "elements": [
                    {
                        "id": "quizTitle",
                        "type": "label",
                        "name": "Quiz Title",
                        "text": "🧠 SUPER CODING QUIZ!",
                        "style": {"x": 20, "y": 60, "width": 280, "height": 45, "fontSize": 20, "fontWeight": "bold", "color": "#facc15", "textAlign": "center", "position": "absolute", "zIndex": 1}
                    },
                    {
                        "id": "trophyIcon",
                        "type": "image",
                        "name": "Trophy Sticker",
                        "src": "/assets/stickers/gold-star.svg",
                        "style": {"x": 110, "y": 120, "width": 100, "height": 100, "position": "absolute", "zIndex": 2}
                    },
                    {
                        "id": "quizIntro",
                        "type": "label",
                        "name": "Intro Text",
                        "text": "Answer 3 fun questions to earn your Junior App Developer Badge!",
                        "style": {"x": 30, "y": 240, "width": 260, "height": 50, "fontSize": 14, "color": "#e2e8f0", "textAlign": "center", "position": "absolute", "zIndex": 3}
                    },
                    {
                        "id": "btnStartQuiz",
                        "type": "button",
                        "name": "Start Quiz Button",
                        "text": "START QUIZ 🚀",
                        "style": {"x": 40, "y": 320, "width": 240, "height": 55, "backgroundColor": "#10b981", "color": "#ffffff", "fontSize": 17, "fontWeight": "bold", "borderRadius": 18, "position": "absolute", "zIndex": 4}
                    }
                ]
            },
            {
                "id": "quizScreen",
                "name": "Question Screen",
                "backgroundColor": "#0f172a",
                "elements": [
                    {
                        "id": "qProgress",
                        "type": "label",
                        "name": "Progress Indicator",
                        "text": "Question 1 of 3",
                        "style": {"x": 20, "y": 30, "width": 280, "height": 25, "fontSize": 13, "color": "#38bdf8", "textAlign": "center", "fontWeight": "bold", "position": "absolute", "zIndex": 1}
                    },
                    {
                        "id": "qText",
                        "type": "label",
                        "name": "Question Label",
                        "text": "What HTML tag creates the biggest heading?",
                        "style": {"x": 20, "y": 65, "width": 280, "height": 60, "fontSize": 17, "color": "#ffffff", "textAlign": "center", "fontWeight": "bold", "position": "absolute", "zIndex": 2}
                    },
                    {
                        "id": "ansA",
                        "type": "button",
                        "name": "Choice A",
                        "text": "A) <h1>",
                        "style": {"x": 30, "y": 140, "width": 260, "height": 50, "backgroundColor": "#1e293b", "color": "#f8fafc", "fontSize": 15, "borderRadius": 14, "position": "absolute", "zIndex": 3}
                    },
                    {
                        "id": "ansB",
                        "type": "button",
                        "name": "Choice B",
                        "text": "B) <p>",
                        "style": {"x": 30, "y": 205, "width": 260, "height": 50, "backgroundColor": "#1e293b", "color": "#f8fafc", "fontSize": 15, "borderRadius": 14, "position": "absolute", "zIndex": 4}
                    },
                    {
                        "id": "ansC",
                        "type": "button",
                        "name": "Choice C",
                        "text": "C) <button>",
                        "style": {"x": 30, "y": 270, "width": 260, "height": 50, "backgroundColor": "#1e293b", "color": "#f8fafc", "fontSize": 15, "borderRadius": 14, "position": "absolute", "zIndex": 5}
                    },
                    {
                        "id": "feedbackMsg",
                        "type": "label",
                        "name": "Feedback Label",
                        "text": "Pick the right answer above!",
                        "style": {"x": 20, "y": 340, "width": 280, "height": 40, "fontSize": 14, "color": "#facc15", "textAlign": "center", "fontWeight": "bold", "position": "absolute", "zIndex": 6}
                    }
                ]
            },
            {
                "id": "resultsScreen",
                "name": "Results Screen",
                "backgroundColor": "#111827",
                "elements": [
                    {
                        "id": "resTitle",
                        "type": "label",
                        "name": "Results Header",
                        "text": "🏆 QUIZ FINISHED!",
                        "style": {"x": 20, "y": 50, "width": 280, "height": 45, "fontSize": 22, "fontWeight": "bold", "color": "#facc15", "textAlign": "center", "position": "absolute", "zIndex": 1}
                    },
                    {
                        "id": "finalScore",
                        "type": "label",
                        "name": "Final Score Label",
                        "text": "Score: 3 / 3 (100%)",
                        "style": {"x": 20, "y": 140, "width": 280, "height": 50, "fontSize": 20, "fontWeight": "bold", "color": "#34d399", "textAlign": "center", "position": "absolute", "zIndex": 2}
                    },
                    {
                        "id": "btnRestart",
                        "type": "button",
                        "name": "Play Again Button",
                        "text": "Play Again 🔄",
                        "style": {"x": 40, "y": 270, "width": 240, "height": 50, "backgroundColor": "#3b82f6", "color": "#ffffff", "fontSize": 16, "fontWeight": "bold", "borderRadius": 14, "position": "absolute", "zIndex": 3}
                    }
                ]
            }
        ],
        "starter_code": """let quizScore = 0;

onEvent("btnStartQuiz", "click", () => {
  quizScore = 0;
  setScreen("quizScreen");
});

onEvent("ansA", "click", () => {
  quizScore = quizScore + 1;
  playSound("cheer");
  setProperty("feedbackMsg", "text", "Correct! <h1> is the biggest heading! 🎉");
  setTimeout(() => {
    setScreen("resultsScreen");
    setProperty("finalScore", "text", "You Scored: " + quizScore + " / 1 (Master!)");
  }, 1200);
});

onEvent("ansB", "click", () => {
  playSound("boing");
  setProperty("feedbackMsg", "text", "Oops! <p> is for Paragraphs. Try <h1>!");
});

onEvent("ansC", "click", () => {
  playSound("boing");
  setProperty("feedbackMsg", "text", "Oops! <button> makes buttons. Try <h1>!");
});

onEvent("btnRestart", "click", () => {
  setScreen("startScreen");
});""",
        "solution_criteria": {"required_elements": ["button", "label"], "required_min_screens": 2, "required_events": ["click"], "required_keywords": ["setScreen", "quizScore"]}
    },

    # =========================================================================
    # CLASS 5 — APP INVENTOR CHALLENGE
    # =========================================================================
    {
        "slug": "class-5-app-inventor",
        "title": "Class 5: App Inventor Challenge",
        "class_number": 5,
        "stage_order": 5,
        "reward_xp": 150,
        "instructions_markdown": """## Class 5 — App Inventor Challenge 🚀
### Create a Useful App Independently
Now you have the superpowers of an App Developer! Choose one of 4 useful real-world app themes:
1. 💰 **Savings Tracker**: Set a savings goal in Nigerian Naira (`₦`), log weekly deposits, and calculate progress toward your dream toy or book!
2. 📚 **Study Planner**: Daily subject checklist, study timer countdown, and homework streak!
3. 📝 **Homework Organiser**: Add assignments, mark done, track due dates and priority badges!
4. 📖 **Reading Tracker**: Log books read, page counter, rate with stars, and earn reading medals!

**Final Project Deliverables**:
- A completed, responsive mobile app with buttons, labels, and pictures.
- Working event logic with sounds and counters.
- Fullscreen phone simulator preview with a shareable project card & export link!""",
        "starter_screens": [
            {
                "id": "screen1",
                "name": "Savings Dashboard",
                "backgroundColor": "#090d16",
                "elements": [
                    {
                        "id": "appHeader",
                        "type": "label",
                        "name": "Header",
                        "text": "💰 DOLA SAVINGS TRACKER",
                        "style": {"x": 20, "y": 30, "width": 280, "height": 35, "fontSize": 17, "fontWeight": "bold", "color": "#facc15", "textAlign": "center", "position": "absolute", "zIndex": 1}
                    },
                    {
                        "id": "piggyImg",
                        "type": "image",
                        "name": "Savings Mascot",
                        "src": "/assets/stickers/gold-star.svg",
                        "style": {"x": 115, "y": 70, "width": 90, "height": 90, "position": "absolute", "zIndex": 2}
                    },
                    {
                        "id": "goalLabel",
                        "type": "label",
                        "name": "Target Goal",
                        "text": "Goal: Bicycle 🚲 (₦15,000)",
                        "style": {"x": 20, "y": 170, "width": 280, "height": 25, "fontSize": 14, "color": "#94a3b8", "textAlign": "center", "position": "absolute", "zIndex": 3}
                    },
                    {
                        "id": "savedAmount",
                        "type": "label",
                        "name": "Current Savings",
                        "text": "₦5,000 Saved",
                        "style": {"x": 20, "y": 200, "width": 280, "height": 45, "fontSize": 26, "fontWeight": "bold", "color": "#34d399", "textAlign": "center", "position": "absolute", "zIndex": 4}
                    },
                    {
                        "id": "statusMsg",
                        "type": "label",
                        "name": "Progress Message",
                        "text": "Keep saving! ₦10,000 left to reach your goal!",
                        "style": {"x": 20, "y": 255, "width": 280, "height": 30, "fontSize": 12, "color": "#fef08a", "textAlign": "center", "position": "absolute", "zIndex": 5}
                    },
                    {
                        "id": "btnAdd500",
                        "type": "button",
                        "name": "Add 500 Naira",
                        "text": "+ ₦500 Deposit",
                        "style": {"x": 30, "y": 300, "width": 125, "height": 45, "backgroundColor": "#10b981", "color": "#ffffff", "fontSize": 13, "fontWeight": "bold", "borderRadius": 12, "position": "absolute", "zIndex": 6}
                    },
                    {
                        "id": "btnAdd1000",
                        "type": "button",
                        "name": "Add 1000 Naira",
                        "text": "+ ₦1,000 Deposit",
                        "style": {"x": 165, "y": 300, "width": 125, "height": 45, "backgroundColor": "#059669", "color": "#ffffff", "fontSize": 13, "fontWeight": "bold", "borderRadius": 12, "position": "absolute", "zIndex": 7}
                    },
                    {
                        "id": "btnReset",
                        "type": "button",
                        "name": "Reset Tracker",
                        "text": "Reset Goal 🔄",
                        "style": {"x": 90, "y": 360, "width": 140, "height": 35, "backgroundColor": "#334155", "color": "#cbd5e1", "fontSize": 12, "borderRadius": 10, "position": "absolute", "zIndex": 8}
                    }
                ]
            }
        ],
        "starter_code": """let totalSaved = 5000;
let goalAmount = 15000;

function updateSavings() {
  setProperty("savedAmount", "text", "₦" + totalSaved.toLocaleString() + " Saved");
  let remaining = goalAmount - totalSaved;
  
  if (remaining <= 0) {
    setProperty("statusMsg", "text", "🎉 GOAL REACHED! You can buy your bicycle! 🚲");
    playSound("cheer");
  } else {
    setProperty("statusMsg", "text", "Keep saving! ₦" + remaining.toLocaleString() + " left to reach your goal!");
    playSound("laser");
  }
}

onEvent("btnAdd500", "click", () => {
  totalSaved = totalSaved + 500;
  updateSavings();
});

onEvent("btnAdd1000", "click", () => {
  totalSaved = totalSaved + 1000;
  updateSavings();
});

onEvent("btnReset", "click", () => {
  totalSaved = 0;
  updateSavings();
});""",
        "solution_criteria": {"required_elements": ["button", "label", "image"], "required_events": ["click"], "required_keywords": ["totalSaved", "updateSavings"]}
    }
]


class Command(BaseCommand):
    help = "Seeds World 5 (App Dev Studio) challenges into the database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting App Dev Studio challenge seed process..."))

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for data in APP_CHALLENGES_DATA:
                obj, created = AppChallenge.objects.update_or_create(
                    slug=data["slug"],
                    defaults={
                        "title": data["title"],
                        "class_number": data["class_number"],
                        "stage_order": data["stage_order"],
                        "reward_xp": data["reward_xp"],
                        "instructions_markdown": data["instructions_markdown"],
                        "starter_screens": data["starter_screens"],
                        "starter_code": data["starter_code"],
                        "solution_criteria": data["solution_criteria"]
                    }
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  + Created: [Class {obj.class_number}] {obj.title} ({obj.slug})"))
                else:
                    updated_count += 1
                    self.stdout.write(self.style.WARNING(f"  ~ Updated: [Class {obj.class_number}] {obj.title} ({obj.slug})"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully seeded World 5 App Dev Studio challenges! "
                f"Total: {created_count + updated_count} (Created: {created_count}, Updated: {updated_count})"
            )
        )
