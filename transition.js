// ═══════════════════════════════════════
//  ENVELOPE TRANSITION — Royal Edition
//  Color palette: cream/rose/mauve/gold
// ═══════════════════════════════════════

(function () {
  const scene = document.getElementById('envelopeScene');
  const envelope = document.getElementById('envelope');
  let opened = false;

  // ── PARTICLE CANVAS ──
  const particleCanvas = document.createElement('canvas');
  particleCanvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:300;';
  document.body.appendChild(particleCanvas);
  const ctx = particleCanvas.getContext('2d');
  let particles = [];
  let animatingParticles = false;

  function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ── GOLD & ROSE PARTICLE BURST (from seal) ──
  function burstFromSeal() {
    const seal = envelope.querySelector('.envelope-seal');
    const rect = seal.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Warm palette matching the site
    const colors = ['#d4a843', '#f2c4b8', '#c96a5a', '#f0d080', '#7a4a5a', '#ffe6a0', '#fdf6ec'];

    // Burst circle
    for (let i = 0; i < 70; i++) {
      const angle = (Math.PI * 2 * i) / 70 + (Math.random() - 0.5) * 0.6;
      const speed = 2.5 + Math.random() * 5.5;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        type: 'circle'
      });
    }

    // Star sparkles
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.006 + Math.random() * 0.01,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        type: 'star'
      });
    }

    if (!animatingParticles) {
      animatingParticles = true;
      animateParticles();
    }
  }

  // ── RISING SPARKLES ──
  function risingSparkles() {
    const colors = ['#d4a843', '#f2c4b8', '#c96a5a', '#fdf6ec', '#7a4a5a'];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * w,
        y: h + 20 + Math.random() * 120,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(1.5 + Math.random() * 3.5),
        size: 1.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.004 + Math.random() * 0.007,
        type: Math.random() > 0.7 ? 'star' : 'circle',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1
      });
    }

    if (!animatingParticles) {
      animatingParticles = true;
      animateParticles();
    }
  }

  // ── DRAW STAR ──
  function drawStar(x, y, size, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation || 0);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── PARTICLE LOOP ──
  function animateParticles() {
    // If petal animation is running, it handles particle drawing too
    if (petalAnimating) {
      animatingParticles = false;
      return;
    }

    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    particles = particles.filter(p => p.life > 0);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.life -= p.decay;

      ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'star') {
        p.rotation = (p.rotation || 0) + (p.rotSpeed || 0);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        drawStar(p.x, p.y, p.size, p.rotation);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;

    if (particles.length > 0) {
      requestAnimationFrame(animateParticles);
    } else {
      animatingParticles = false;
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    }
  }

  // ── SCREEN GLOW ──
  function flashGlow() {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position:fixed;inset:0;z-index:250;pointer-events:none;
      background:radial-gradient(circle at 50% 45%, rgba(212,168,67,0.35), rgba(201,106,90,0.15) 40%, transparent 70%);
      opacity:0;transition:opacity 0.3s ease;
    `;
    document.body.appendChild(glow);

    requestAnimationFrame(() => {
      glow.style.opacity = '1';
      setTimeout(() => {
        glow.style.transition = 'opacity 0.8s ease';
        glow.style.opacity = '0';
        setTimeout(() => glow.remove(), 800);
      }, 350);
    });
  }

  // ── ENVELOPE SHAKE ──
  function shakeEnvelope() {
    return new Promise(resolve => {
      const keyframes = [
        { transform: 'translateY(0) rotate(0deg)' },
        { transform: 'translateY(-3px) rotate(-1.5deg)' },
        { transform: 'translateY(1px) rotate(1.2deg)' },
        { transform: 'translateY(-4px) rotate(-1deg)' },
        { transform: 'translateY(1px) rotate(0.6deg)' },
        { transform: 'translateY(-2px) rotate(-0.4deg)' },
        { transform: 'translateY(0) rotate(0deg)' }
      ];
      envelope.animate(keyframes, {
        duration: 600,
        easing: 'ease-in-out'
      }).onfinish = resolve;
    });
  }

  // ── ZOOM CARD FORWARD ──
  function zoomCardForward() {
    const card = envelope.querySelector('.envelope-card');
    card.style.transition = 'transform 1.2s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s ease 0.7s';
    card.style.transform = 'translateY(-130px) scale(2)';
    card.style.opacity = '0';
  }

  // ═══════════════════════════════════
  //  3D FLOWER PETALS — Falling Effect
  // ═══════════════════════════════════
  let petals = [];
  let petalAnimating = false;
  let petalSpawnTimer = null;

  // Petal shapes & colors — BIG & visible
  const petalTypes = [
    // Cherry blossom — soft pink
    { color1: '#ffb7c5', color2: '#ff8fa3', w: 28, h: 24, type: 'blossom' },
    { color1: '#ffc8d6', color2: '#ff9bb3', w: 24, h: 20, type: 'blossom' },
    // Rose petal — deeper pink
    { color1: '#e88ca5', color2: '#c96a8a', w: 32, h: 36, type: 'rose' },
    { color1: '#f2a0b8', color2: '#d4708a', w: 28, h: 32, type: 'rose' },
    // White flower
    { color1: '#fff5f5', color2: '#f0d8e0', w: 26, h: 22, type: 'blossom' },
    // Lavender
    { color1: '#d4b0d8', color2: '#b888c0', w: 22, h: 18, type: 'blossom' },
    // Extra large sakura
    { color1: '#ffcdd8', color2: '#ff99b0', w: 36, h: 30, type: 'blossom' },
    // Extra large rose
    { color1: '#e07898', color2: '#c05878', w: 38, h: 42, type: 'rose' },
  ];

  function createPetal() {
    const w = window.innerWidth;
    const template = petalTypes[Math.floor(Math.random() * petalTypes.length)];
    const depth = 0.7 + Math.random() * 0.6; // bigger depth range

    return {
      x: Math.random() * (w + 100) - 50,
      y: -30 - Math.random() * 60,
      z: depth,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 0.8 + Math.random() * 1.5,
      // 3D rotation angles
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      // Rotation speeds
      drx: (Math.random() - 0.5) * 0.04,
      dry: (Math.random() - 0.5) * 0.06,
      drz: (Math.random() - 0.5) * 0.03,
      // Wind sway
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
      swayAmp: 0.6 + Math.random() * 1.2,
      // Visual
      w: template.w * depth,
      h: template.h * depth,
      color1: template.color1,
      color2: template.color2,
      type: template.type,
      life: 1,
      opacity: 0.65 + Math.random() * 0.35,
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = p.opacity * p.life;

    // Simulate 3D rotation projection
    const cosRx = Math.cos(p.rx);
    const cosRy = Math.cos(p.ry);
    const cosRz = Math.cos(p.rz);
    const sinRz = Math.sin(p.rz);

    // Scale based on "depth" rotation (flipping effect)
    const scaleX = Math.abs(cosRy) * 0.3 + 0.7;
    const scaleY = Math.abs(cosRx) * 0.3 + 0.7;

    ctx.rotate(p.rz);
    ctx.scale(scaleX, scaleY);

    // Draw petal shape
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.w);
    grd.addColorStop(0, p.color1);
    grd.addColorStop(1, p.color2);
    ctx.fillStyle = grd;

    if (p.type === 'blossom') {
      // Cherry blossom — soft rounded petal
      ctx.beginPath();
      ctx.moveTo(0, -p.h * 0.5);
      ctx.bezierCurveTo(p.w * 0.6, -p.h * 0.5, p.w * 0.7, p.h * 0.2, 0, p.h * 0.5);
      ctx.bezierCurveTo(-p.w * 0.7, p.h * 0.2, -p.w * 0.6, -p.h * 0.5, 0, -p.h * 0.5);
      ctx.fill();
      // Subtle vein line
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -p.h * 0.3);
      ctx.lineTo(0, p.h * 0.35);
      ctx.stroke();
    } else {
      // Rose petal — teardrop
      ctx.beginPath();
      ctx.moveTo(0, -p.h * 0.5);
      ctx.bezierCurveTo(p.w * 0.55, -p.h * 0.3, p.w * 0.5, p.h * 0.3, 0, p.h * 0.5);
      ctx.bezierCurveTo(-p.w * 0.5, p.h * 0.3, -p.w * 0.55, -p.h * 0.3, 0, -p.h * 0.5);
      ctx.fill();
      // Gradient highlight
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.ellipse(-p.w * 0.15, -p.h * 0.1, p.w * 0.15, p.h * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle shadow for depth
    ctx.shadowColor = 'rgba(0,0,0,0.06)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.restore();
  }

  function updatePetals() {
    const h = window.innerHeight;

    petals.forEach(p => {
      // Wind sway
      p.swayPhase += p.swaySpeed;
      p.vx += Math.sin(p.swayPhase) * p.swayAmp * 0.01;

      // Apply velocity
      p.x += p.vx * p.z;
      p.y += p.vy * p.z;

      // Gentle gravity
      p.vy += 0.008;

      // Air resistance
      p.vx *= 0.998;
      p.vy = Math.min(p.vy, 3);

      // 3D rotation
      p.rx += p.drx;
      p.ry += p.dry;
      p.rz += p.drz;

      // Random tumble variation
      if (Math.random() < 0.005) {
        p.drx += (Math.random() - 0.5) * 0.02;
        p.dry += (Math.random() - 0.5) * 0.02;
      }

      // Fade out near bottom
      if (p.y > h - 100) {
        p.life -= 0.015;
      }
      if (p.y > h + 30) {
        p.life = 0;
      }
    });

    // Remove dead petals
    petals = petals.filter(p => p.life > 0);
  }

  function animatePetals() {
    if (!petalAnimating) return;

    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    // Draw regular particles first
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.life -= p.decay;
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.type === 'star') {
        p.rotation = (p.rotation || 0) + (p.rotSpeed || 0);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        drawStar(p.x, p.y, p.size, p.rotation);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    particles = particles.filter(p => p.life > 0);
    ctx.globalAlpha = 1;

    // Draw petals
    updatePetals();
    petals.forEach(drawPetal);

    if (petals.length > 0 || particles.length > 0) {
      requestAnimationFrame(animatePetals);
    } else {
      petalAnimating = false;
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    }
  }

  function startFlowerRain(duration) {
    let elapsed = 0;
    const isMobile = window.innerWidth <= 640;
    const interval = isMobile ? 70 : 50;
    const burstCount = isMobile ? 35 : 60;
    const perTick = isMobile ? [2, 3] : [3, 4]; // [min, range]

    // Big initial burst
    for (let i = 0; i < burstCount; i++) {
      const p = createPetal();
      p.y = -Math.random() * window.innerHeight * 0.7;
      petals.push(p);
    }

    petalSpawnTimer = setInterval(() => {
      elapsed += interval;

      // Spawn 3-6 petals per tick
      const count = perTick[0] + Math.floor(Math.random() * perTick[1]);
      for (let i = 0; i < count; i++) {
        petals.push(createPetal());
      }

      // Also spawn from sides frequently
      if (Math.random() < 0.5) {
        const p = createPetal();
        p.x = Math.random() < 0.5 ? -30 : window.innerWidth + 30;
        p.vx = p.x < 0 ? 1.5 + Math.random() * 2.5 : -(1.5 + Math.random() * 2.5);
        p.y = Math.random() * window.innerHeight * 0.6;
        petals.push(p);
      }

      if (elapsed >= duration) {
        clearInterval(petalSpawnTimer);
      }
    }, interval);

    if (!petalAnimating) {
      petalAnimating = true;
      animatePetals();
    }
  }

  // ── FADE ENVELOPE → SHOW LETTER ──
  function showLetter() {
    const sceneEl = document.getElementById('envelopeScene');
    // Fade out envelope
    sceneEl.style.transition = 'transform 1s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.6s ease';
    sceneEl.style.transform = 'scale(1.08)';
    sceneEl.style.opacity = '0';
    sceneEl.style.pointerEvents = 'none';

    // After envelope fades, show letter + flower rain
    setTimeout(() => {
      sceneEl.style.visibility = 'hidden';
      const letter = document.getElementById('letterScene');
      letter.classList.add('visible');

      // Start 3D flower petal rain for 10 seconds
      startFlowerRain(10000);
    }, 650);
  }

  // ── MAIN SEQUENCE ──
  async function openEnvelope() {
    if (opened) return;
    opened = true;

    // Play background music
    const bgm = document.getElementById('bgm');
    if (bgm) {
      bgm.volume = 0.5; // optional, set initial volume
      bgm.play().catch(e => console.log('Audio play failed:', e));
    }

    // Step 1: Shake
    await shakeEnvelope();

    // Step 2: Seal burst + glow + balloons + open
    burstFromSeal();
    flashGlow();
    launchBalloons();
    envelope.classList.add('opened');

    // Step 3: Rising sparkles
    setTimeout(risingSparkles, 500);

    // Step 4: Card zooms forward
    setTimeout(zoomCardForward, 800);

    // Step 5: Fade envelope → show letter
    setTimeout(() => {
      showLetter();
    }, 1500);
  }

  // ═══════════════════════════════════
  //  BALLOON ANIMATION
  // ═══════════════════════════════════
  const balloonColors = [
    // [body, highlight, string]
    ['#ff6b8a', '#ff9eb5', '#cc5570'],
    ['#7ec8e3', '#a8dff0', '#5a9ab5'],
    ['#ffd166', '#ffe599', '#cca44d'],
    ['#a8d5ba', '#c4e8d0', '#7ab090'],
    ['#c8a2c8', '#dfc4df', '#9a7a9a'],
    ['#ffb07c', '#ffc9a3', '#cc8a60'],
    ['#ff8fa3', '#ffb3c1', '#cc6680'],
    ['#87ceeb', '#aee0f5', '#5ea8c4'],
  ];

  function createBalloon() {
    const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    const size = 35 + Math.random() * 25;
    const x = 10 + Math.random() * 80; // 10-90% of screen width
    const wobbleAmp = 15 + Math.random() * 25;
    const wobbleSpeed = 2 + Math.random() * 2;
    const riseDuration = 3 + Math.random() * 3;
    const delay = Math.random() * 0.8;

    const balloon = document.createElement('div');
    balloon.style.cssText = `
      position: fixed;
      left: ${x}%;
      bottom: -${size + 60}px;
      width: ${size}px;
      height: ${size * 1.2}px;
      z-index: 200;
      pointer-events: none;
      animation: balloonRise ${riseDuration}s ease-out ${delay}s forwards;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
    `;

    // Balloon body
    const body = document.createElement('div');
    body.style.cssText = `
      width: 100%;
      height: 100%;
      background: radial-gradient(ellipse at 35% 25%, ${color[1]}, ${color[0]} 50%, ${color[2]} 100%);
      border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
      position: relative;
      animation: balloonWobble ${wobbleSpeed}s ease-in-out ${delay}s infinite alternate;
    `;

    // Shine highlight
    const shine = document.createElement('div');
    shine.style.cssText = `
      position: absolute;
      top: 15%;
      left: 22%;
      width: 30%;
      height: 35%;
      background: radial-gradient(ellipse, rgba(255,255,255,0.5), transparent 70%);
      border-radius: 50%;
      transform: rotate(-15deg);
    `;
    body.appendChild(shine);

    // Knot
    const knot = document.createElement('div');
    knot.style.cssText = `
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      background: ${color[2]};
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    `;
    body.appendChild(knot);

    // String
    const string = document.createElement('div');
    string.style.cssText = `
      position: absolute;
      bottom: -45px;
      left: 50%;
      transform: translateX(-50%);
      width: 1px;
      height: 40px;
      background: linear-gradient(to bottom, ${color[2]}, rgba(0,0,0,0.15));
    `;

    balloon.appendChild(body);
    balloon.appendChild(string);
    document.body.appendChild(balloon);

    // Remove after animation
    setTimeout(() => balloon.remove(), (riseDuration + delay) * 1000 + 500);
  }

  function launchBalloons() {
    // Add CSS animation keyframes if not already added
    if (!document.getElementById('balloonStyles')) {
      const style = document.createElement('style');
      style.id = 'balloonStyles';
      style.textContent = `
        @keyframes balloonRise {
          0% { transform: translateY(0) scale(0.3); opacity: 0; }
          10% { opacity: 1; transform: translateY(0) scale(1); }
          100% { transform: translateY(-120vh) scale(0.9); opacity: 0.8; }
        }
        @keyframes balloonWobble {
          0% { transform: rotate(-5deg) translateX(-8px); }
          100% { transform: rotate(5deg) translateX(8px); }
        }
      `;
      document.head.appendChild(style);
    }

    // Launch 12 balloons with staggered timing
    for (let i = 0; i < 12; i++) {
      setTimeout(() => createBalloon(), i * 120);
    }
  }

  // ── EVENT ──
  scene.addEventListener('click', openEnvelope);

  // ── ENTRANCE FLOAT-IN ──
  window.addEventListener('load', () => {
    envelope.style.opacity = '0';
    envelope.style.transform = 'translateY(40px) scale(0.92)';

    const hint = document.querySelector('.envelope-hint');
    if (hint) {
      hint.style.opacity = '0';
      hint.style.transform = 'translateY(12px)';
    }

    requestAnimationFrame(() => {
      envelope.style.transition = 'opacity 1s ease, transform 1s cubic-bezier(0.23, 1, 0.32, 1)';
      envelope.style.opacity = '1';
      envelope.style.transform = 'translateY(0) scale(1)';

      if (hint) {
        setTimeout(() => {
          hint.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
          hint.style.opacity = '0.7';
          hint.style.transform = 'translateY(0)';
        }, 700);
      }
    });
  });

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
})();