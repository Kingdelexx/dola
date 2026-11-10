import json
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import WebChallenge

CHALLENGES_DATA = [
    # =========================================================================
    # CLASS 1 — WEBSITE BUILDER ISLAND (Learn HTML without memorising HTML)
    # =========================================================================
    {
        "slug": "class-1-heading-island",
        "title": "Class 1.1: Island Title Beacon",
        "stage_order": 1,
        "reward_xp": 50,
        "instructions_markdown": """## Class 1 — Website Builder Island 🏝️
### Mission 1: The Heading Beacon
Learn HTML without memorising HTML!
Every island needs a big bold title so explorers know where they've landed!
1. Drag or click the **Heading** block onto your webpage.
2. When you add a heading, DolaCode reveals: `<h1>Welcome to Treasure Island!</h1>`.
3. Notice that `<h1>` stands for Heading Level 1 — the biggest title on the web!""",
        "starter_html": """<div class="island-card">
  <h1>Welcome to Treasure Island! 🏝️</h1>
</div>""",
        "starter_css": """.island-card {
  background: #0f172a;
  border: 4px solid #f59e0b;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  color: #ffffff;
}
h1 {
  color: #fbbf24;
  font-family: 'Poppins', sans-serif;
}""",
        "starter_js": "",
        "solution_criteria": {"required_tags": ["h1"], "required_classes": ["island-card"]}
    },
    {
        "slug": "class-1-story-paragraph",
        "title": "Class 1.2: Island Secret Story",
        "stage_order": 2,
        "reward_xp": 50,
        "instructions_markdown": """## Class 1 — Website Builder Island 🏝️
### Mission 2: The Island Storybook
Tell visitors the tale of your secret island!
1. Keep your `<h1>` island title.
2. Drag or click the **Paragraph** block onto your page.
3. DolaCode reveals `<p>` — which stands for Paragraph of story text!""",
        "starter_html": """<div class="island-card">
  <h1>Secret Coconut Bay 🥥</h1>
  <p>Hidden deep in the azure ocean lies an enchanted bay with glowing waterfalls and pirate gold!</p>
</div>""",
        "starter_css": """.island-card {
  background: #064e3b;
  border: 4px solid #10b981;
  border-radius: 20px;
  padding: 26px;
  text-align: center;
  color: #ecfdf5;
}
p {
  font-size: 16px;
  line-height: 1.6;
}""",
        "starter_js": "",
        "solution_criteria": {"required_tags": ["h1", "p"], "required_classes": ["island-card"]}
    },
    {
        "slug": "class-1-picture-gallery",
        "title": "Class 1.3: Island Mascot Sticker",
        "stage_order": 3,
        "reward_xp": 50,
        "instructions_markdown": """## Class 1 — Website Builder Island 🏝️
### Mission 3: Mascot Picture Tag
Websites are much more exciting with pictures!
1. Drag or click the **Picture** block into your island card.
2. DolaCode reveals: `<img src="/assets/stickers/dino.svg" width="120" alt="Island Mascot">`.
3. Notice how `<img>` tags use `src="..."` to locate the image!""",
        "starter_html": """<div class="island-card">
  <h1>Dino Lagoon 🦕</h1>
  <img src="/assets/stickers/dino.svg" width="120" alt="Island Dino Mascot">
  <p>Meet Rex, the friendly guardian of the crystal beach!</p>
</div>""",
        "starter_css": """.island-card {
  background: #1e1b4b;
  border: 4px solid #8b5cf6;
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  color: #f5f3ff;
}""",
        "starter_js": "",
        "solution_criteria": {"required_tags": ["h1", "img", "p"], "required_classes": ["island-card"]}
    },
    {
        "slug": "class-1-my-first-webpage",
        "title": "Class 1 Capstone: My First Webpage",
        "stage_order": 4,
        "reward_xp": 100,
        "instructions_markdown": """## Class 1 Project: My First Webpage 🏆
Congratulations! Assemble your first complete webpage!
Your island webpage must combine all building blocks:
1. An `<h1>` heading naming your webpage.
2. A `<p>` paragraph introducing your island base.
3. An `<img>` picture tag with your mascot sticker.
4. A `<button>` tag that invites visitors to explore!
When you drag each element, watch DolaCode reveal the real HTML tags!""",
        "starter_html": """<div class="my-first-page">
  <h1>Captain Ada's Explorer Hub 🚀</h1>
  <img src="/assets/stickers/leo-explorer.svg" width="130" alt="Explorer Avatar">
  <p>Welcome to my command center! I build web apps, solve space mysteries, and explore new coding worlds.</p>
  <button class="action-btn">Start Exploring Now 🌟</button>
</div>""",
        "starter_css": """.my-first-page {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border: 4px solid #f59e0b;
  border-radius: 24px;
  padding: 30px;
  text-align: center;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.action-btn {
  background: #f59e0b;
  color: #0f172a;
  font-weight: 800;
  padding: 12px 28px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  margin-top: 15px;
}""",
        "starter_js": "",
        "solution_criteria": {"required_tags": ["h1", "p", "img", "button"], "required_classes": ["my-first-page", "action-btn"]}
    },

    # =========================================================================
    # CLASS 2 — COLOUR MAGIC KINGDOM (Learn CSS through design)
    # =========================================================================
    {
        "slug": "class-2-colour-splash",
        "title": "Class 2.1: The Castle Color Splash",
        "stage_order": 5,
        "reward_xp": 60,
        "instructions_markdown": """## Class 2 — Colour Magic Kingdom 🎨
### Mission 1: Wake Up The Drab Castle!
Learn CSS through design!
The castle is currently trapped in boring dull grey! Use CSS to splash magical colors:
1. Decorate the dull website and instantly see the transformation.
2. Set a vibrant `background` color or `linear-gradient(135deg, #ff007f, #8b5cf6)`.
3. Give your text a bright `color: #ffffff;` so it pops!""",
        "starter_html": """<div class="drab-castle">
  <h2>The Enchanted Castle 🏰</h2>
  <p>CSS paints the web with magic and vibrance!</p>
</div>""",
        "starter_css": """.drab-castle {
  background: #64748b;
  color: #0f172a;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}""",
        "starter_js": "",
        "solution_criteria": {"required_tags": ["h2", "p"], "required_classes": ["drab-castle"], "required_css_rules": ["background", "color"]}
    },
    {
        "slug": "class-2-magic-borders",
        "title": "Class 2.2: Magic Borders & Rounded Corners",
        "stage_order": 6,
        "reward_xp": 60,
        "instructions_markdown": """## Class 2 — Colour Magic Kingdom 🎨
### Mission 2: Smooth Rounded Borders
Turn harsh box corners into smooth, friendly magic bubbles!
1. Set `border-radius: 24px;` (or higher) on `.magic-box`.
2. Add a thick decorative border: `border: 4px solid #00f2fe;`.
3. Add a glowing shadow with `box-shadow`!""",
        "starter_html": """<div class="magic-box">
  <h2>Bubble Shield Active! 🔮</h2>
  <img src="/assets/stickers/gold-star.svg" width="90" alt="Star">
  <p>Rounded corners make websites friendly and modern!</p>
</div>""",
        "starter_css": """.magic-box {
  background: #1e1b4b;
  border: 4px solid #00f2fe;
  border-radius: 24px;
  box-shadow: 0 0 25px rgba(0, 242, 254, 0.4);
  padding: 28px;
  text-align: center;
  color: white;
}""",
        "starter_js": "",
        "solution_criteria": {"required_tags": ["h2", "img", "p"], "required_classes": ["magic-box"], "required_css_rules": ["border-radius", "border"]}
    },
    {
        "slug": "class-2-colourful-personal-website",
        "title": "Class 2 Capstone: My Colourful Personal Website",
        "stage_order": 7,
        "reward_xp": 100,
        "instructions_markdown": """## Class 2 Project: My Colourful Personal Website 🏆
Decorate a dull website and instantly see the transformation!
Your colourful personal website must feature:
1. A gradient background (`linear-gradient`).
2. Smooth rounded corners (`border-radius: 20px` or more).
3. A glowing shadow (`box-shadow`).
4. Custom text colors and stylish font layout!""",
        "starter_html": """<div class="personal-card">
  <div class="avatar-badge">
    <img src="/assets/hero.png" width="110" alt="Avatar">
  </div>
  <h1 class="sparkle-title">CHIDERA's REALM ✨</h1>
  <p class="tagline">Junior Web Designer & Game Builder</p>
  <div class="skill-chips">
    <span class="chip">🎨 CSS Stylist</span>
    <span class="chip">💡 HTML Architect</span>
    <span class="chip">🎮 Game Creator</span>
  </div>
</div>""",
        "starter_css": """.personal-card {
  background: linear-gradient(135deg, #31104b, #1e1b4b, #0c4a6e);
  border: 4px solid #f9a826;
  border-radius: 28px;
  padding: 30px;
  text-align: center;
  color: white;
  box-shadow: 0 15px 35px rgba(249, 168, 38, 0.35);
}
.sparkle-title {
  color: #ffd32a;
  text-shadow: 0 0 15px rgba(255, 211, 42, 0.6);
  font-size: 26px;
  margin: 12px 0 6px;
}
.chip {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 14px;
  border-radius: 999px;
  margin: 4px;
  font-size: 13px;
  font-weight: bold;
}""",
        "starter_js": "",
        "solution_criteria": {"required_tags": ["h1", "img", "p", "div"], "required_classes": ["personal-card", "sparkle-title", "chip"], "required_css_rules": ["linear-gradient", "border-radius", "box-shadow"]}
    },

    # =========================================================================
    # CLASS 3 — BUTTON POWER CITY (Learn basic JavaScript through actions)
    # =========================================================================
    {
        "slug": "class-3-color-shifter",
        "title": "Class 3.1: The Color Shifter Button",
        "stage_order": 8,
        "reward_xp": 70,
        "instructions_markdown": """## Class 3 — Button Power City ⚡
### Mission 1: Buttons That Change Colours
Learn basic JavaScript through actions!
Make buttons change colours when clicked:
1. Inspect the button `<button onclick="shiftColor()">`.
2. Notice how JavaScript handles `shiftColor()` to update `style.backgroundColor`!
3. Click the button in your preview stage to see the color shift!""",
        "starter_html": """<div id="city-block" class="city-card">
  <h2>Neon City Sky Shifter 🌆</h2>
  <p>Click the button below to trigger JavaScript action!</p>
  <button id="shift-btn" class="power-btn" onclick="shiftColor()">Change Sky Color ⚡</button>
</div>""",
        "starter_css": """.city-card {
  background: #090d16;
  border: 4px solid #00f2fe;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  color: white;
  transition: background 0.4s ease;
}
.power-btn {
  background: #00f2fe;
  color: #090d16;
  font-weight: 800;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}""",
        "starter_js": """let colors = ['#090d16', '#4c1d95', '#064e3b', '#831843', '#1e3a8a'];
let index = 0;

function shiftColor() {
  index = (index + 1) % colors.length;
  document.getElementById('city-block').style.backgroundColor = colors[index];
}""",
        "solution_criteria": {"required_tags": ["button", "h2"], "required_classes": ["city-card", "power-btn"], "required_js_rules": ["shiftColor", "style.backgroundColor"]}
    },
    {
        "slug": "class-3-treasure-revealer",
        "title": "Class 3.2: Secret Treasure Revealer",
        "stage_order": 9,
        "reward_xp": 70,
        "instructions_markdown": """## Class 3 — Button Power City ⚡
### Mission 2: Reveal Hidden Treasures
Make buttons display messages and reveal hidden treasures!
1. A hidden clue starts with `style.display = 'none'`.
2. When the user clicks the button, call `revealTreasure()`.
3. Set `clue.style.display = 'block'` to reveal the hidden gold!""",
        "starter_html": """<div class="vault-card">
  <h2>The Secret Vault 🔒</h2>
  <button class="vault-btn" onclick="revealTreasure()">Open Secret Vault 🔑</button>
  <div id="secret-clue" style="display: none; margin-top: 15px;">
    <h3>🎉 SECRET CODE: GOLDEN-DOLA-2026</h3>
    <p>You unlocked the hidden treasure of Button Power City!</p>
  </div>
</div>""",
        "starter_css": """.vault-card {
  background: #111827;
  border: 4px solid #f59e0b;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  color: white;
}
.vault-btn {
  background: #f59e0b;
  color: #111827;
  font-weight: 800;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}""",
        "starter_js": """function revealTreasure() {
  const box = document.getElementById('secret-clue');
  box.style.display = 'block';
}""",
        "solution_criteria": {"required_tags": ["button", "div"], "required_classes": ["vault-card"], "required_js_rules": ["revealTreasure", "style.display"]}
    },
    {
        "slug": "class-3-interactive-birthday-website",
        "title": "Class 3 Capstone: Interactive Birthday Website",
        "stage_order": 10,
        "reward_xp": 100,
        "instructions_markdown": """## Class 3 Project: Interactive Birthday Website 🏆
Make buttons change colours, display messages, count clicks and reveal hidden treasures!
Your birthday site must use JavaScript actions to:
1. Count clicks on a "Send a Gift 🎁" button (`gifts = gifts + 1`).
2. Display a magical birthday wish message when pressed.
3. Fire confetti animations when celebrating!""",
        "starter_html": """<div class="birthday-card">
  <h1>🎂 HAPPY BIRTHDAY CELEBRATION! 🎉</h1>
  <div class="cake-display">
    <img src="/assets/stickers/happy-robot.svg" width="110" id="robot-mascot" alt="Robot Party">
  </div>
  <p id="party-wish">Click the buttons below to join the party!</p>
  <div class="button-row">
    <button class="action-btn gift-btn" onclick="addGift()">Send a Gift 🎁 (<span id="gift-count">0</span>)</button>
    <button class="action-btn wish-btn" onclick="revealWish()">Make a Wish ✨</button>
  </div>
</div>""",
        "starter_css": """.birthday-card {
  background: linear-gradient(135deg, #ff007f, #8b5cf6);
  border: 4px solid #ffd32a;
  border-radius: 28px;
  padding: 30px;
  text-align: center;
  color: white;
  box-shadow: 0 15px 35px rgba(255, 0, 127, 0.4);
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.action-btn {
  background: #ffd32a;
  color: #2e1065;
  font-weight: 800;
  padding: 12px 20px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}""",
        "starter_js": """let gifts = 0;

function addGift() {
  gifts = gifts + 1;
  document.getElementById('gift-count').innerText = gifts;
  document.getElementById('party-wish').innerText = "🎁 Woohoo! You delivered " + gifts + " awesome birthday gift(s)!";
}

function revealWish() {
  document.getElementById('party-wish').innerText = "🌟 Wish Granted: May your coding year be filled with wonder, games & high scores!";
}""",
        "solution_criteria": {"required_tags": ["h1", "button", "span", "div"], "required_classes": ["birthday-card", "action-btn"], "required_js_rules": ["addGift", "gifts", "revealWish"]}
    },

    # =========================================================================
    # CLASS 4 — MY ONLINE SHOP (Combine HTML, CSS & JavaScript with Naira ₦)
    # =========================================================================
    {
        "slug": "class-4-shop-shelves",
        "title": "Class 4.1: Stocking The Store Shelves",
        "stage_order": 11,
        "reward_xp": 80,
        "instructions_markdown": """## Class 4 — My Online Shop 🛒
### Mission 1: Product Cards With Naira (₦) Prices
Combine HTML, CSS, and JavaScript!
Create product cards for books, snacks or toys:
1. Display the Nigerian Naira currency symbol `₦` (e.g. `₦1,500`).
2. Add an "Add to Basket" button with `onclick="addItem('Comic', 1500)"`.
3. Style the cards with a modern green shop theme!""",
        "starter_html": """<div class="store-container">
  <h1>📚 DolaCode Kids Bookstore</h1>
  <div class="product-grid">
    <div class="product-card">
      <h3>Coding Space Comic</h3>
      <p class="naira-price">₦1,500</p>
      <button class="buy-btn" onclick="addItem('Comic', 1500)">Add to Basket 🛒</button>
    </div>
    <div class="product-card">
      <h3>Robot Science Kit</h3>
      <p class="naira-price">₦3,500</p>
      <button class="buy-btn" onclick="addItem('Kit', 3500)">Add to Basket 🛒</button>
    </div>
  </div>
</div>""",
        "starter_css": """.store-container {
  background: #0f172a;
  padding: 24px;
  border-radius: 20px;
  text-align: center;
  color: white;
}
.product-grid {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.product-card {
  background: #1e293b;
  border: 3px solid #10b981;
  border-radius: 16px;
  padding: 16px;
  width: 180px;
}
.naira-price {
  color: #34d399;
  font-size: 20px;
  font-weight: 800;
  margin: 8px 0;
}
.buy-btn {
  background: #10b981;
  color: white;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}""",
        "starter_js": """function addItem(name, price) {
  alert("Added " + name + " (₦" + price + ") to your basket!");
}""",
        "solution_criteria": {"required_tags": ["h1", "h3", "button", "p"], "required_classes": ["store-container", "product-card", "naira-price", "buy-btn"], "required_js_rules": ["addItem"]}
    },
    {
        "slug": "class-4-my-first-online-store",
        "title": "Class 4 Capstone: My First Online Store",
        "stage_order": 12,
        "reward_xp": 120,
        "instructions_markdown": """## Class 4 Project: My First Online Store 🏆
Combine HTML, CSS and JavaScript!
Create a virtual store for books, snacks or toys:
1. Add products with images and titles.
2. Display real Naira prices (e.g. `₦4,500`, `₦2,000`, `₦1,200`).
3. Calculate the live shopping basket total in Naira with JavaScript!
4. Simulate checkout with order receipts (educational simulation, no real payments).""",
        "starter_html": """<div class="store-app">
  <div class="store-header">
    <h1>🍕 LEO'S SUPER SNACK & TOY SHOP</h1>
    <p>Pick your favorites and watch your basket calculate live in Naira!</p>
  </div>

  <div class="shop-grid">
    <div class="item-card">
      <img src="/assets/stickers/happy-robot.svg" width="70" alt="Robot">
      <h3>Cyber Robot Toy</h3>
      <div class="price-tag">₦4,500</div>
      <button class="cart-btn" onclick="buyItem('Cyber Robot Toy', 4500)">Add to Cart</button>
    </div>

    <div class="item-card">
      <img src="/assets/stickers/dino.svg" width="70" alt="Dino">
      <h3>Dino Adventure Book</h3>
      <div class="price-tag">₦2,000</div>
      <button class="cart-btn" onclick="buyItem('Dino Adventure Book', 2000)">Add to Cart</button>
    </div>

    <div class="item-card">
      <img src="/assets/stickers/rocket.svg" width="70" alt="Rocket">
      <h3>Space Snack Pack</h3>
      <div class="price-tag">₦1,200</div>
      <button class="cart-btn" onclick="buyItem('Space Snack Pack', 1200)">Add to Cart</button>
    </div>
  </div>

  <div class="cart-summary">
    <h2>🛍️ Shopping Basket: <span id="cart-count">0</span> items</h2>
    <div class="total-line">
      <span>Total Amount:</span>
      <span class="total-naira" id="cart-total">₦0</span>
    </div>
    <div class="cart-actions">
      <button class="checkout-btn" onclick="checkoutOrder()">Simulate Checkout (No Real Money) 💳</button>
      <button class="clear-btn" onclick="resetCart()">Empty Basket 🗑️</button>
    </div>
    <p id="receipt-msg" class="receipt-box"></p>
  </div>
</div>""",
        "starter_css": """.store-app {
  background: #090d16;
  border: 4px solid #10b981;
  border-radius: 24px;
  padding: 24px;
  color: white;
  text-align: center;
}
.shop-grid {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
  flex-wrap: wrap;
}
.item-card {
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 16px;
  padding: 16px;
  width: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.price-tag {
  color: #34d399;
  font-weight: 900;
  font-size: 18px;
  margin: 6px 0 10px;
}
.cart-btn {
  background: #10b981;
  color: white;
  font-weight: bold;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
}
.cart-summary {
  background: #131b2e;
  border-radius: 18px;
  padding: 18px;
  margin-top: 10px;
  border: 2px dashed #10b981;
}
.total-naira {
  color: #fbbf24;
  font-size: 24px;
  font-weight: 900;
  margin-left: 10px;
}
.checkout-btn {
  background: #fbbf24;
  color: #0f172a;
  font-weight: 900;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin: 10px 6px;
}
.clear-btn {
  background: #ef4444;
  color: white;
  font-weight: bold;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}
.receipt-box {
  margin-top: 10px;
  font-weight: bold;
  color: #6ee7b7;
}""",
        "starter_js": """let cartTotal = 0;
let itemCount = 0;

function buyItem(name, price) {
  itemCount = itemCount + 1;
  cartTotal = cartTotal + price;
  
  document.getElementById('cart-count').innerText = itemCount;
  document.getElementById('cart-total').innerText = '₦' + cartTotal.toLocaleString();
  document.getElementById('receipt-msg').innerText = 'Added ' + name + ' to your basket!';
}

function resetCart() {
  cartTotal = 0;
  itemCount = 0;
  document.getElementById('cart-count').innerText = '0';
  document.getElementById('cart-total').innerText = '₦0';
  document.getElementById('receipt-msg').innerText = 'Your basket is now empty.';
}

function checkoutOrder() {
  if (itemCount === 0) {
    alert('Your basket is empty! Please choose a product first.');
    return;
  }
  document.getElementById('receipt-msg').innerText = '🎉 Order Simulated! Total: ₦' + cartTotal.toLocaleString() + ' (No real money charged). Great job building your store!';
}""",
        "solution_criteria": {"required_tags": ["h1", "h2", "h3", "button", "span", "img"], "required_classes": ["store-app", "shop-grid", "item-card", "price-tag", "cart-btn", "cart-summary"], "required_js_rules": ["buyItem", "cartTotal", "itemCount", "checkoutOrder"]}
    },

    # =========================================================================
    # CLASS 5 — WEB CREATOR CHALLENGE (Original Responsive Website & Showcase)
    # =========================================================================
    {
        "slug": "class-5-web-creator-challenge",
        "title": "Class 5: Web Creator Challenge Showcase",
        "stage_order": 13,
        "reward_xp": 150,
        "instructions_markdown": """## Class 5 — Web Creator Challenge 🚀
### Final Capstone: Build Your Original Website!
Build an original, responsive website from scratch or chosen themes:
1. 🏫 **School Website / Class Club**
2. 🎨 **Creative Portfolio & Art Gallery**
3. 🐾 **Animal Club / Pet Rescue Sanctuary**
4. 📖 **Story Website / Interactive Adventure Book**
5. 🍕 **Small Business / Bakery / Juice Bar**

Your finished website features:
- Responsive layout (looks stunning on Desktop, Tablet & Mobile)!
- HTML structure with headers, pictures, content and buttons.
- CSS colors, gradients, rounded cards, and responsive styling.
- JavaScript interactive buttons and counters.
- Shareable preview showcase!""",
        "starter_html": """<div class="creator-website">
  <header class="site-header">
    <div class="logo">🐾 Paws & Claws Animal Club</div>
    <nav class="nav-links">
      <span class="active-link">Home</span>
      <span>About</span>
      <span>Adopt</span>
    </nav>
  </header>

  <main class="hero-section">
    <h1>Welcome to Our Pet Rescue Haven 🐶🐱</h1>
    <p>We rescue, care for, and find loving homes for wonderful dogs, cats, and space creatures!</p>
    <img src="/assets/stickers/happy-robot.svg" width="120" alt="Club Mascot">
    <div class="hero-actions">
      <button class="primary-btn" onclick="showLove()">Send Love to Pets ❤️ (<span id="love-count">0</span>)</button>
      <button class="secondary-btn" onclick="toggleStory()">Our Mission 📖</button>
    </div>
    <div id="mission-box" class="story-box" style="display: none;">
      <h3>🌟 Our Club Pledge</h3>
      <p>Every pet deserves safe shelter, delicious treats, and unlimited playtime!</p>
    </div>
  </main>

  <footer class="site-footer">
    <p>Created with DolaCode Web Dev Studio &bull; Ready for the World 🌐</p>
  </footer>
</div>""",
        "starter_css": """.creator-website {
  background: #0f172a;
  color: white;
  border: 4px solid #8b5cf6;
  border-radius: 24px;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}
.site-header {
  background: #1e1b4b;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #8b5cf6;
}
.logo {
  font-weight: 900;
  color: #fbbf24;
  font-size: 16px;
}
.nav-links span {
  margin-left: 12px;
  font-size: 13px;
  cursor: pointer;
  color: #cbd5e1;
}
.nav-links .active-link {
  color: #38bdf8;
  font-weight: bold;
}
.hero-section {
  padding: 30px 20px;
  text-align: center;
}
.hero-actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.primary-btn {
  background: #ec4899;
  color: white;
  font-weight: 800;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}
.secondary-btn {
  background: #3b82f6;
  color: white;
  font-weight: 800;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}
.story-box {
  margin-top: 20px;
  background: #1e293b;
  border: 2px dashed #ec4899;
  border-radius: 16px;
  padding: 16px;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}
.site-footer {
  background: #020617;
  padding: 12px;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}""",
        "starter_js": """let loves = 0;

function showLove() {
  loves = loves + 1;
  document.getElementById('love-count').innerText = loves;
}

function toggleStory() {
  const box = document.getElementById('mission-box');
  if (box.style.display === 'none' || !box.style.display) {
    box.style.display = 'block';
  } else {
    box.style.display = 'none';
  }
}""",
        "solution_criteria": {"required_tags": ["header", "main", "footer", "h1", "p", "button", "img"], "required_classes": ["creator-website", "site-header", "hero-section", "primary-btn"], "required_js_rules": ["showLove", "toggleStory"]}
    }
]


class Command(BaseCommand):
    help = "Seeds World 4 (Web Dev Studio) classes into the database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Web Dev Studio challenge seed process..."))
        
        # Remove old outdated challenges that are not part of the 5 classes
        new_slugs = {data["slug"] for data in CHALLENGES_DATA}
        deleted_count, _ = WebChallenge.objects.exclude(slug__in=new_slugs).delete()
        if deleted_count:
            self.stdout.write(self.style.WARNING(f"Cleaned up {deleted_count} outdated challenges."))

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
                        "starter_js": data.get("starter_js", ""),
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
                f"\nSuccessfully seeded World 4 Web Dev Studio challenges! "
                f"Total: {created_count + updated_count} (Created: {created_count}, Updated: {updated_count})"
            )
        )
