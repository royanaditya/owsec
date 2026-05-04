import re

def update_index_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Update envelope hint color
    hint_match = re.search(r'\.envelope-hint\s*\{[^}]*\}', text)
    if hint_match:
        old_hint = hint_match.group(0)
        new_hint = old_hint.replace('color: var(--mauve);', 'color: var(--cream);\n      text-shadow: 0 2px 6px rgba(0,0,0,0.5);')
        text = text.replace(old_hint, new_hint)

    # 2. Upgrade nav-btn
    nav_btn_css = r'''    .nav-btn {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: var(--cream);
      padding: 10px 18px;
      border-radius: 30px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    
    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
    }'''
    
    # Replace old nav-btn CSS
    text = re.sub(r'    \.nav-btn \{[\s\S]*?\.nav-btn:hover \{[\s\S]*?\}', nav_btn_css, text)

    # 3. Page 3 Overflow
    text = text.replace('#page3 {\n      /* background removed */\n      overflow: hidden;\n    }', '#page3 {\n      /* background removed */\n      overflow-y: auto;\n      overflow-x: hidden;\n    }')
    text = text.replace('<div style="display:flex;flex-direction:column;align-items:center;gap:0;position:relative;z-index:1;">', '<div style="display:flex;flex-direction:column;align-items:center;gap:0;position:relative;z-index:1; padding-bottom: 15vh; padding-top: 80px;">')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("index.html updated")

def update_transition_js():
    with open('transition.js', 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Add resetEnvelope to the end of the IIFE
    reset_logic = r'''
  // ── RESET ENVELOPE (For seamless back navigation) ──
  window.resetEnvelope = function() {
    opened = false;
    envelope.classList.remove('opened');
    
    const sceneEl = document.getElementById('envelopeScene');
    sceneEl.style.transition = 'none';
    sceneEl.style.transform = 'translateY(0) scale(1)';
    sceneEl.style.opacity = '1';
    sceneEl.style.pointerEvents = 'auto';
    sceneEl.style.visibility = 'visible';
    
    const letter = document.getElementById('letterScene');
    letter.classList.remove('visible');
    
    const card = envelope.querySelector('.envelope-card');
    card.style.transition = 'none';
    card.style.transform = 'none';
    card.style.opacity = '1';
    
    petals = [];
    petalAnimating = false;
    if (petalSpawnTimer) clearInterval(petalSpawnTimer);
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    envelope.style.opacity = '1';
    envelope.style.transform = 'translateY(0) scale(1)';
    const hint = document.querySelector('.envelope-hint');
    if (hint) {
      hint.style.opacity = '0.7';
      hint.style.transform = 'translateY(0)';
    }
  };
})();'''

    text = re.sub(r'\}\)\(\);\s*$', reset_logic, text)
    with open('transition.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("transition.js updated")

def update_app_js():
    with open('app.js', 'r', encoding='utf-8') as f:
        text = f.read()

    new_goToPage = '''// ── PAGE NAVIGATION ──
// Initialize history state on load
if (!history.state) {
  history.replaceState({ page: 0 }, '', '#');
}

// Handle native back button
window.addEventListener('popstate', (e) => {
  if (e.state && typeof e.state.page === 'number') {
    goToPage(e.state.page, false);
  } else {
    goToPage(0, false);
  }
});

function goToPage(n, pushHistory = true) {
  if (pushHistory) {
    history.pushState({ page: n }, '', n === 0 ? '#' : '#page' + n);
  }

  if (n === 0) {
    if (window.resetEnvelope) {
      window.resetEnvelope();
    }
  }

  const fade = document.getElementById('fade');
  fade.style.transition = 'opacity 0.4s';
  fade.style.opacity = 1;
  fade.style.background = 'linear-gradient(to bottom right, #2b4566, #4a6f8f)';

  setTimeout(() => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page' + n).classList.add('active');

    if (n === 2 || n === 3) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }

    fade.style.opacity = 0;

    if (n === 2) {
      initScrapbook();
    }
    if (n === 3) {
      setTimeout(initPage3, 600);
    }
  }, 400);
}'''

    text = re.sub(r'// ── PAGE NAVIGATION ──[\s\S]*?\}, 400\);\n\}', new_goToPage, text)
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("app.js updated")

update_index_html()
update_transition_js()
update_app_js()
