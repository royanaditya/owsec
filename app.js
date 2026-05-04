// ═══════════════════════════════════════
//  Happy Birthday App — All Logic
// ═══════════════════════════════════════

// ── AUDIO / MICROPHONE ──
let audioCtx, analyser, mic, blownCount = 0;
const totalCandles = 1;

document.getElementById('micBtn').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    mic = audioCtx.createMediaStreamSource(stream);
    mic.connect(analyser);

    document.getElementById('micBtn').style.display = 'none';
    document.getElementById('micHint').style.display = 'block';
    document.getElementById('skipHint').style.display = 'none';
    document.getElementById('soundBar').classList.add('active');

    detectBlow();
  } catch (e) {
    document.getElementById('micBtn').innerText = 'Gagal: ' + (e.name || 'Error');
    document.getElementById('micBtn').style.opacity = '0.5';
    document.getElementById('micBtn').disabled = true;
    console.error("Mic error:", e);
  }
});

function detectBlow() {
  if (!analyser) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  let blowing = false;

  function tick() {
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;

    // Update sound bars
    const bars = document.querySelectorAll('.sound-bar span');
    bars.forEach((b, i) => {
      b.style.height = Math.max(4, data[i * 8] / 5) + 'px';
    });

    if (avg > 40 && !blowing) {
      blowing = true;
      blowCandle();
    } else if (avg < 15) {
      blowing = false;
    }

    if (blownCount < totalCandles) requestAnimationFrame(tick);
  }
  tick();
}

function blowCandle() {
  const candles = ['f1', 'f2', 'f3'];
  if (blownCount < totalCandles) {
    document.getElementById(candles[blownCount]).classList.add('blown');
    blownCount++;
    if (blownCount === totalCandles) {
      setTimeout(() => blowAll(false), 500);
    }
  }
}

function blowAll(instant) {
  ['f1', 'f2', 'f3'].forEach(id => {
    document.getElementById(id).classList.add('blown');
  });
  blownCount = totalCandles;
  launchConfetti();
  setTimeout(() => goToPage(2), instant ? 800 : 1600);
}

// ── PAGE NAVIGATION ──
// Initialize history state on load
if (!history.state) {
  history.replaceState({ page: 'start' }, '', '#');
}

// Handle native back button
window.addEventListener('popstate', (e) => {
  if (e.state && typeof e.state.page !== 'undefined') {
    goToPage(e.state.page, false);
  } else {
    goToPage('start', false);
  }
});

function goToPage(n, pushHistory = true) {
  if (pushHistory) {
    history.pushState({ page: n }, '', n === 'start' ? '#' : (n === 0 ? '#envelope' : '#page' + n));
  }

  // Stop camera if leaving page 3
  if (n !== 3 && window.pbStream) {
    window.pbStream.getTracks().forEach(t => t.stop());
    window.pbStream = null;
  }

  if (n === 'start') {
    const bulb = document.getElementById('lightBulb');
    if (bulb) {
        bulb.src = 'bulb.png';
        bulb.style.filter = '';
        bulb.style.transform = '';
    }
    const pageStart = document.getElementById('page-start');
    if (pageStart) {
        pageStart.style.backgroundColor = '#080808';
    }
    const text1 = document.getElementById('darkText1');
    if (text1) text1.style.opacity = '1';
    const text2 = document.getElementById('darkText2');
    if (text2) {
        text2.innerHTML = 'Ketuk lampunya untuk menyalakan';
        text2.style.color = '#444';
        text2.style.fontSize = '0.85rem';
        text2.style.animation = 'none';
        text2.style.opacity = '1';
    }
  }

  if (n === 0) {
    if (window.resetEnvelope) {
      window.resetEnvelope();
    }
  }

  if (n === 1) {
    blownCount = 0;
    ['f1', 'f2', 'f3'].forEach(id => {
      const f = document.getElementById(id);
      if (f) f.classList.remove('blown');
    });
    const micBtn = document.getElementById('micBtn');
    if (micBtn) micBtn.style.display = 'inline-block';
    const micHint = document.getElementById('micHint');
    if (micHint) micHint.style.display = 'none';
    const skipHint = document.getElementById('skipHint');
    if (skipHint) skipHint.style.display = 'block';
    const soundBar = document.getElementById('soundBar');
    if (soundBar) soundBar.classList.remove('active');
    
    // Stop mic stream if active
    if (mic && mic.mediaStream) {
        mic.mediaStream.getTracks().forEach(t => t.stop());
    }
    if (audioCtx) {
        audioCtx.close().catch(() => {});
        audioCtx = null;
    }
    analyser = null;
    mic = null;
  }

  const fade = document.getElementById('fade');
  fade.style.transition = 'opacity 0.4s';
  fade.style.opacity = 1;
  fade.style.background = 'linear-gradient(to bottom right, #2b4566, #4a6f8f)';

  setTimeout(() => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(n === 'start' ? 'page-start' : 'page' + n).classList.add('active');

    if (n === 2 || n === 3) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }

    fade.style.opacity = 0;

    if (n === 2) {
      currentSlide = 0;
      initScrapbook();
    }
    if (n === 3) {
      const strip = document.getElementById('photostrip');
      if (strip) strip.classList.remove('out');
      const msg = document.getElementById('p3msg');
      if (msg) msg.classList.remove('show');
      
      if (window.heartInterval) {
          clearInterval(window.heartInterval);
      }
      const heartsContainer = document.getElementById('hearts');
      if (heartsContainer) heartsContainer.innerHTML = '';

      setTimeout(initPage3, 600);
    }
  }, 400);
}

// ── LIGHT SWITCH ──
function turnOnLight() {
  const bulb = document.getElementById('lightBulb');
  bulb.src = 'bulb_yellow.png';
  bulb.style.filter = 'drop-shadow(0 0 20px #ffea00) drop-shadow(0 0 50px #ffea00)';
  bulb.style.transform = 'scale(1.1)';
  
  const pageStart = document.getElementById('page-start');
  pageStart.style.transition = 'background-color 2s ease';
  pageStart.style.backgroundColor = '#fdf6ec';

  const text1 = document.getElementById('darkText1');
  const text2 = document.getElementById('darkText2');
  
  if (text1) {
    text1.style.animation = 'none';
    text1.style.transition = 'opacity 0.5s ease';
    text1.style.opacity = '0';
  }
  
  if (text2) {
    text2.style.opacity = '0';
    setTimeout(() => {
      text2.innerHTML = '✨ Ada surat untuk <strong>Dorinta Preludea Imaani!</strong> ✨';
      text2.style.color = '#8c5a35';
      text2.style.fontSize = '1.1rem';
      text2.style.animation = 'popUpText 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    }, 500);
  }

  setTimeout(() => {
    goToPage(0);
  }, 3500);
}

// ── PHOTO SLIDESHOW ──
const slideImages = [
  '1.png', '2.png', '3.png', '4.png', '5.png', '6.png'
];
let currentSlide = 0;
let isAnimating = false;

function initScrapbook() {
  const container = document.getElementById('slideshow');
  const dotsContainer = document.getElementById('slideDots');

  // Clear any placeholder content
  container.querySelectorAll('.slide').forEach(el => el.remove());

  // Create initial slide
  const slide = document.createElement('div');
  slide.className = 'slide active';
  slide.innerHTML = `<img src="${slideImages[currentSlide]}" alt="Moment ${currentSlide + 1}">`;
  container.appendChild(slide);

  // Generate dots
  dotsContainer.innerHTML = slideImages.map((_, i) =>
    `<div class="slide-dot${i === 0 ? ' active' : ''}" onclick="goToSlide(${i})"></div>`
  ).join('');

  updateNav();
}

function changeSlide(direction) {
  if (isAnimating) return;
  const target = currentSlide + direction;
  goToSlide(target, direction);
}

function goToSlide(target, direction = null) {
  if (isAnimating || target < 0 || target >= slideImages.length || target === currentSlide) return;

  isAnimating = true;
  const container = document.getElementById('slideshow');
  const currentEl = container.querySelector('.slide.active');

  // Determine direction if not provided (for dot navigation)
  if (direction === null) {
    direction = target > currentSlide ? 1 : -1;
  }

  // Create new slide
  const newEl = document.createElement('div');
  // Start position based on direction
  newEl.className = `slide ${direction === 1 ? 'next-slide' : 'prev-slide'}`;
  newEl.innerHTML = `<img src="${slideImages[target]}" alt="Moment ${target + 1}">`;
  container.appendChild(newEl);

  // Trigger reflow
  newEl.offsetHeight;

  // Transition
  if (currentEl) {
    currentEl.classList.remove('active');
    currentEl.classList.add(direction === 1 ? 'prev-slide-out' : 'next-slide-out');
  }
  newEl.classList.remove('next-slide', 'prev-slide');
  newEl.classList.add('active');

  // Update state
  currentSlide = target;
  updateNav();

  // Cleanup after animation
  setTimeout(() => {
    if (currentEl) currentEl.remove();
    isAnimating = false;
  }, 800);
}

// Swipe support for slideshow (Responsive)
let swipeStartX = 0;
let isSwiping = false;

document.addEventListener('DOMContentLoaded', () => {
  const slideshow = document.getElementById('slideshow');
  if (slideshow) {
    // Hide notification function
    const hideNotif = () => {
      const notif = document.getElementById('swipeNotif');
      if (notif) {
        notif.style.animation = 'none';
        notif.style.opacity = '0';
        notif.style.visibility = 'hidden';
      }
    };

    // Touch events (Mobile)
    let swipeStartY = 0;
    slideshow.addEventListener('touchstart', e => {
      swipeStartX = e.changedTouches[0].screenX;
      swipeStartY = e.changedTouches[0].screenY;
      isSwiping = true;
      hideNotif();
    }, { passive: true });

    // Prevent browser native swipe-to-go-back gesture
    slideshow.addEventListener('touchmove', e => {
      if (!isSwiping) return;
      const touchX = e.changedTouches[0].screenX;
      const touchY = e.changedTouches[0].screenY;
      const diffX = Math.abs(touchX - swipeStartX);
      const diffY = Math.abs(touchY - swipeStartY);

      // If moving more horizontally than vertically, prevent default scrolling/navigation
      if (diffX > diffY) {
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    slideshow.addEventListener('touchend', e => {
      if (!isSwiping) return;
      isSwiping = false;
      const swipeEndX = e.changedTouches[0].screenX;
      handleSwipeEnd(swipeStartX, swipeEndX);
    }, { passive: true });

    // Mouse events (Desktop)
    slideshow.addEventListener('mousedown', e => {
      swipeStartX = e.clientX;
      isSwiping = true;
      hideNotif();
    });

    window.addEventListener('mouseup', e => {
      if (!isSwiping) return;
      isSwiping = false;
      const swipeEndX = e.clientX;
      handleSwipeEnd(swipeStartX, swipeEndX);
    });

    // Prevent default drag
    slideshow.addEventListener('dragstart', e => e.preventDefault());
  }
});

function handleSwipeEnd(start, end) {
  const delta = end - start;
  const swipeThreshold = 30; // Very responsive

  if (delta < -swipeThreshold) {
    changeSlide(1); // Swipe left -> next
  } else if (delta > swipeThreshold) {
    changeSlide(-1); // Swipe right -> prev
  }
}

function updateNav() {
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const counter = document.getElementById('slideCounter');
  const toPage3Btn = document.getElementById('toPage3Btn');

  // Update buttons
  if (prevBtn) prevBtn.disabled = currentSlide === 0;
  if (nextBtn) nextBtn.disabled = currentSlide === slideImages.length - 1;

  // Show "Next Page" button on last slide
  if (toPage3Btn) {
    toPage3Btn.style.display = currentSlide === slideImages.length - 1 ? 'inline-block' : 'none';
  }

  // Update counter
  if (counter) counter.innerText = `${currentSlide + 1} / ${slideImages.length}`;

  // Update dots
  const dots = document.querySelectorAll('.slide-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}


// ── PAGE 3 INIT ──
function initPage3() {
  setTimeout(() => {
    document.getElementById('photostrip').classList.add('out');
  }, 200);
  setTimeout(() => {
    const msg = document.getElementById('p3msg');
    if (msg) msg.classList.add('show');
  }, 4500); // Wait for the print animation
  startHearts();
}

function startHearts() {
  if (window.heartInterval) clearInterval(window.heartInterval);
  const container = document.getElementById('hearts');
  if (container) container.innerHTML = '';
  const emojis = ['💕', '💖', '🌸', '✨', '💝', '🌙', '⭐'];

  window.heartInterval = setInterval(() => {
    const h = document.createElement('div');
    h.className = 'heart';
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = Math.random() * 100 + 'vw';
    h.style.bottom = '-50px';
    h.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
    h.style.animationDuration = (4 + Math.random() * 4) + 's';
    h.style.animationDelay = Math.random() * 0.5 + 's';
    container.appendChild(h);
    setTimeout(() => h.remove(), 8000);
  }, 400);
}

// ── CONFETTI ──
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 8,
    r: Math.random() * Math.PI * 2,
    dr: (Math.random() - 0.5) * 0.2,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    color: ['#f2c4b8', '#d4a843', '#c96a5a', '#7a4a5a', '#94baa8', '#fdf6ec'][Math.floor(Math.random() * 6)]
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.dr;
      p.vy += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (pieces.some(p => p.y < canvas.height + 20)) {
      frame = requestAnimationFrame(draw);
    } else {
      canvas.style.display = 'none';
      cancelAnimationFrame(frame);
    }
  }
  draw();
}

// ── PHOTOBOOTH ──
const templatesData = [
  { id: 1, src: typeof tplB64 !== 'undefined' ? tplB64[1] : "template1_trans.png", regions: [{"x": 189, "y": 194, "w": 420, "h": 573}, {"x": 189, "y": 1162, "w": 420, "h": 571}] },
  { id: 2, src: typeof tplB64 !== 'undefined' ? tplB64[2] : "template2_trans.png", regions: [{"x": 204, "y": 115, "w": 418, "h": 582}, {"x": 204, "y": 804, "w": 418, "h": 582}, {"x": 204, "y": 1493, "w": 418, "h": 582}] },
  { id: 3, src: typeof tplB64 !== 'undefined' ? tplB64[3] : "template3_trans.png", regions: [{"x": 217, "y": 264, "w": 366, "h": 622}, {"x": 217, "y": 1190, "w": 366, "h": 622}] },
  { id: 4, src: typeof tplB64 !== 'undefined' ? tplB64[4] : "template4_trans.png", regions: [{"x": 217, "y": 264, "w": 366, "h": 622}, {"x": 217, "y": 1190, "w": 366, "h": 622}] },
  { id: 5, src: typeof tplB64 !== 'undefined' ? tplB64[5] : "template5_trans.png", regions: [{"x": 183, "y": 433, "w": 433, "h": 467}, {"x": 183, "y": 900, "w": 433, "h": 467}, {"x": 183, "y": 1367, "w": 433, "h": 469}] },
  { id: 6, src: typeof tplB64 !== 'undefined' ? tplB64[6] : "template6_trans.png", regions: [{"x": 226, "y": 217, "w": 571, "h": 423}, {"x": 226, "y": 640, "w": 571, "h": 423}, {"x": 226, "y": 1063, "w": 571, "h": 423}] }
];

let pbStream = null;
let pbPhotos = [];
let pbMaxPhotos = 2;
let pbIsTaking = false;
let pbSelectedTemplate = null;
let pbCurrentFilter = 'none';

function startPhotobooth() {
  const btn = document.getElementById('start-pb-btn');
  const container = document.getElementById('pb-container');
  btn.style.display = 'none';
  container.style.display = 'flex';
  
  const list = document.getElementById('template-list');
  list.innerHTML = templatesData.map(t => 
    `<img src="${t.src}" onclick="selectTemplate(${t.id})" id="thumb-${t.id}" style="height: 120px; border-radius: 6px; border: 3px solid transparent; cursor: pointer; transition: transform 0.3s, border 0.3s; background: white; margin: 4px;">`
  ).join('');
  
  selectTemplate(1);
}

function selectTemplate(id) {
  pbSelectedTemplate = templatesData.find(t => t.id === id);
  pbMaxPhotos = pbSelectedTemplate.regions.length;
  
  // Update Preview Image
  const previewImg = document.getElementById('template-preview-img');
  if (previewImg) {
    previewImg.src = pbSelectedTemplate.src;
  }
  
  templatesData.forEach(t => {
    const el = document.getElementById(`thumb-${t.id}`);
    if(t.id === id) {
      el.style.border = '3px solid var(--gold)';
      el.style.transform = 'scale(1.1)';
    } else {
      el.style.border = '3px solid transparent';
      el.style.transform = 'scale(1)';
    }
  });
  
  const startCamBtn = document.getElementById('pb-start-cam-btn');
  startCamBtn.disabled = false;
  startCamBtn.innerText = `Mulai Kamera (${pbMaxPhotos} Foto)`;
}

async function startCamera() {
  document.getElementById('pb-template-select').style.display = 'none';
  document.getElementById('pb-camera-view').style.display = 'flex';
  
  // Show preview canvas above video
  const liveCanvas = document.getElementById('pb-live-canvas');
  liveCanvas.style.display = 'block';
  
  const video = document.getElementById('pb-video');
  const captureBtn = document.getElementById('pb-capture-btn');
  
  captureBtn.innerText = `Ambil Foto (0/${pbMaxPhotos})`;
  pbPhotos = [];
  pbIsTaking = false;
  
  try {
    if (!pbStream) {
      pbStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      video.srcObject = pbStream;
    }
    await video.play();
    
    const ctx = liveCanvas.getContext('2d');
    
    if (window.pbDrawFrame) cancelAnimationFrame(window.pbDrawFrame);
    
    function drawLive() {
      if (!pbStream) return;
      
      const vRatio = video.videoWidth / video.videoHeight;
      const cRatio = liveCanvas.width / liveCanvas.height;
      
      if (vRatio && cRatio && video.videoWidth > 0) {
        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
        if (vRatio > cRatio) {
          sw = video.videoHeight * cRatio;
          sx = (video.videoWidth - sw) / 2;
        } else {
          sh = video.videoWidth / cRatio;
          sy = (video.videoHeight - sh) / 2;
        }
        ctx.save();
        ctx.translate(liveCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, liveCanvas.width, liveCanvas.height);
        ctx.restore();
      }
      window.pbDrawFrame = requestAnimationFrame(drawLive);
    }
    
    drawLive();
  } catch (err) {
    alert('Kamera tidak bisa diakses: ' + err.message);
  }
}

function takePhoto() {
  if (pbIsTaking || pbPhotos.length >= pbMaxPhotos) return;
  pbIsTaking = true;
  
  const countdownEl = document.getElementById('pb-countdown');
  const flashEl = document.getElementById('pb-flash');
  let count = 3;
  countdownEl.style.display = 'flex';
  countdownEl.innerText = count;
  
  const timer = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.innerText = count;
    } else {
      clearInterval(timer);
      countdownEl.style.display = 'none';
      
      flashEl.style.opacity = '1';
      setTimeout(() => { flashEl.style.transition = 'opacity 0.5s'; flashEl.style.opacity = '0'; }, 50);
      setTimeout(() => { flashEl.style.transition = ''; }, 600);
      
      try {
        const video = document.getElementById('pb-video');
        const liveCanvas = document.getElementById('pb-live-canvas');
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = liveCanvas.width;
        tempCanvas.height = liveCanvas.height;
        const tCtx = tempCanvas.getContext('2d');
        
        const vRatio = video.videoWidth / video.videoHeight;
        const cRatio = tempCanvas.width / tempCanvas.height;
        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
        
        if (vRatio > cRatio) {
          sw = video.videoHeight * cRatio;
          sx = (video.videoWidth - sw) / 2;
        } else {
          sh = video.videoWidth / cRatio;
          sy = (video.videoHeight - sh) / 2;
        }
        
        tCtx.translate(tempCanvas.width, 0);
        tCtx.scale(-1, 1);
        tCtx.drawImage(video, sx, sy, sw, sh, 0, 0, tempCanvas.width, tempCanvas.height);
        
        const imgData = tempCanvas.toDataURL('image/jpeg', 0.9);
        pbPhotos.push(imgData);
      } catch (err) {
        console.error("Gagal mengambil foto:", err);
        // Fallback agar tidak stuck
        const blankCanvas = document.createElement('canvas');
        blankCanvas.width = 600; blankCanvas.height = 800;
        pbPhotos.push(blankCanvas.toDataURL('image/jpeg', 0.9));
      }
      
      const captureBtn = document.getElementById('pb-capture-btn');
      captureBtn.innerText = `Ambil Foto (${pbPhotos.length}/${pbMaxPhotos})`;
      pbIsTaking = false;
      
      if (pbPhotos.length >= pbMaxPhotos) {
        document.getElementById('pb-capture-btn').style.display = 'none';
        finishPhotobooth();
      }
    }
  }, 1000);
}

function applyFilter(filter, btn) {
  pbCurrentFilter = filter;
  
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  
  renderFinalPhotostrip();
}

function finishPhotobooth() {
  // Do NOT stop camera here so we don't ask permission again on retake
  if (window.pbDrawFrame) cancelAnimationFrame(window.pbDrawFrame);
  document.getElementById('pb-filter-view').style.display = 'flex';
  document.getElementById('pb-retake-btn').style.display = 'inline-block';
  pbCurrentFilter = 'none';
  renderFinalPhotostrip();
}

function renderFinalPhotostrip() {
  const liveCanvas = document.getElementById('pb-live-canvas');
  const ctxLive = liveCanvas.getContext('2d');
  ctxLive.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
  ctxLive.fillStyle = '#000';
  ctxLive.fillRect(0, 0, liveCanvas.width, liveCanvas.height);
  ctxLive.fillStyle = '#fff';
  ctxLive.font = '24px DM Sans';
  ctxLive.textAlign = 'center';
  ctxLive.fillText('Memproses...', liveCanvas.width/2, liveCanvas.height/2);
  
  const finalCanvas = document.getElementById('pb-final-canvas');
  const ctx = finalCanvas.getContext('2d');
  const template = pbSelectedTemplate;
  
  const templateImg = new Image();
  templateImg.onload = () => {
    ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    
    let loadedPhotos = 0;
    const photoImgs = [];
    
    for (let i = 0; i < pbMaxPhotos; i++) {
      const img = new Image();
      photoImgs.push(img);
      img.onload = () => {
        loadedPhotos++;
        if (loadedPhotos === pbMaxPhotos) {
          ctx.save();
          ctx.filter = pbCurrentFilter;
          for (let j = 0; j < pbMaxPhotos; j++) {
            const r = template.regions[j];
            ctx.drawImage(photoImgs[j], r.x, r.y, r.w, r.h);
          }
          ctx.restore();
          
          ctx.drawImage(templateImg, 0, 0, finalCanvas.width, finalCanvas.height);
          
          ctxLive.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
          const scale = Math.min(liveCanvas.width / finalCanvas.width, liveCanvas.height / finalCanvas.height);
          const dw = finalCanvas.width * scale;
          const dh = finalCanvas.height * scale;
          const dx = (liveCanvas.width - dw) / 2;
          const dy = (liveCanvas.height - dh) / 2;
          ctxLive.drawImage(finalCanvas, dx, dy, dw, dh);
        }
      };
      img.src = pbPhotos[i];
    }
  };
  templateImg.src = template.src;
}

function resetPhotobooth() {
  document.getElementById('pb-filter-view').style.display = 'none';
  document.getElementById('pb-retake-btn').style.display = 'none';
  document.getElementById('pb-capture-btn').style.display = 'inline-block';
  pbPhotos = [];
  
  // Reset active filter button visually to Normal
  document.querySelectorAll('.filter-btn').forEach((b, idx) => {
    if (idx === 0) b.classList.add('active');
    else b.classList.remove('active');
  });
  
  startCamera();
}

function changeFramePhotobooth() {
  document.getElementById('pb-camera-view').style.display = 'none';
  document.getElementById('pb-filter-view').style.display = 'none';
  document.getElementById('pb-template-select').style.display = 'flex';
  
  document.getElementById('pb-retake-btn').style.display = 'none';
  document.getElementById('pb-capture-btn').style.display = 'inline-block';
  
  pbPhotos = [];
  
  const liveCanvas = document.getElementById('pb-live-canvas');
  if (liveCanvas) {
    const ctx = liveCanvas.getContext('2d');
    ctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
  }
  
  // Reset active filter button visually to Normal
  document.querySelectorAll('.filter-btn').forEach((b, idx) => {
    if (idx === 0) b.classList.add('active');
    else b.classList.remove('active');
  });
}

function downloadPhotostrip() {
  try {
    const finalCanvas = document.getElementById('pb-final-canvas');
    const dataURL = finalCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'dorin_22nd_birthday.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    alert("Gagal mendownload karena batasan keamanan browser (Tainted Canvas). Pastikan kamu menjalankan HTML ini melalui Local Server (misalnya VSCode Live Server) dan bukan membuka file secara langsung (file:///).");
    console.error("Download error:", err);
  }
}
