with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Root Variables
text = text.replace('--rose: #c96a5a;', '--rose: #c18b60;')
text = text.replace('--mauve: #7a4a5a;', '--mauve: #8c5a35;')

# 2. Update Envelope Body
text = text.replace('linear-gradient(160deg, #6a3a50, var(--mauve), #5a3048)', 'linear-gradient(160deg, #8c5a35, var(--mauve), #6b4226)')
text = text.replace('linear-gradient(to bottom, #7a4a5a, #6a3a50)', 'linear-gradient(to bottom, #8c5a35, #6b4226)')
text = text.replace('linear-gradient(to top, #7a4a5a, #6a3a50)', 'linear-gradient(to top, #8c5a35, #6b4226)')
text = text.replace('linear-gradient(to right, #6a3a50, var(--mauve))', 'linear-gradient(to right, #6b4226, var(--mauve))')
text = text.replace('linear-gradient(to left, #6a3a50, var(--mauve))', 'linear-gradient(to left, #6b4226, var(--mauve))')

# 3. Update Seal (Brass)
text = text.replace('radial-gradient(circle at 40% 35%, #9a2020, #6a1010 70%, #4a0808)', 'radial-gradient(circle at 40% 35%, #c59b27, #8b6508 70%, #5c4305)')
text = text.replace('radial-gradient(circle at 40% 35%, #8a1818, #5a0a0a)', 'radial-gradient(circle at 40% 35%, #b3881b, #705004)')

# 4. Insert Navigation CSS and HTML

nav_css = """
    /* ── NAVIGATION BUTTONS ── */
    .top-nav {
      position: absolute;
      top: env(safe-area-inset-top, 20px);
      left: env(safe-area-inset-left, 20px);
      z-index: 100;
      display: flex;
      gap: 10px;
    }
    
    .nav-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      color: var(--cream);
      padding: 8px 16px;
      border-radius: 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.3s, transform 0.2s;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    
    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
"""

if "/* ── NAVIGATION BUTTONS ── */" not in text:
    text = text.replace('/* ── PAGES ── */', nav_css + '\n    /* ── PAGES ── */')

page1_nav = '''  <!-- ══ PAGE 1 ══ -->
  <div class="page" id="page1">
    <div class="top-nav">
      <button class="nav-btn" onclick="goToPage(0)">
        <span>←</span> Amplop
      </button>
    </div>'''
text = text.replace('  <!-- ══ PAGE 1 ══ -->\n  <div class="page" id="page1">', page1_nav)

page2_nav = '''  <!-- ══ PAGE 2 ══ -->
  <div class="page" id="page2">
    <div class="top-nav">
      <button class="nav-btn" onclick="goToPage(1)">
        <span>←</span> Kue
      </button>
    </div>'''
text = text.replace('  <!-- ══ PAGE 2 ══ -->\n  <div class="page" id="page2">', page2_nav)

page3_nav = '''  <!-- ══ PAGE 3 ══ -->
  <div class="page" id="page3">
    <div class="top-nav">
      <button class="nav-btn" onclick="goToPage(2)">
        <span>←</span> Scrapbook
      </button>
      <button class="nav-btn" onclick="goToPage(0)">
        <span>🏠</span> Awal
      </button>
    </div>'''
text = text.replace('  <!-- ══ PAGE 3 ══ -->\n  <div class="page" id="page3">', page3_nav)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done modifying index.html')
