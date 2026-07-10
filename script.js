/* ═══════════════════════════════════════
   VMK PORTFOLIO — SCRIPT (TÍCH HỢP SLIDER, LIGHTBOX & TỐI ƯU CHỐNG LAG)
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── AUTO OPTIMIZE IMAGES (Tự động cấu hình tối ưu tải ảnh chống lag) ──
  document.querySelectorAll('img').forEach(img => {
    // Chỉ tải ảnh khi cuộn màn hình đến gần (Lazy Load)
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    // Giải mã ảnh bất đồng bộ, không gây đơ/block luồng xử lý giao diện
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });

  // ── FOOTER YEAR ──
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── HAMBURGER / SIDEBAR ──
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);
    z-index:90;display:none;backdrop-filter:blur(2px);
  `;
  document.body.appendChild(overlay);

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  });

  // Close sidebar on nav link click (mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    });
  });

  // ── TYPEWRITER EFFECT ──
  const cmdEl  = document.getElementById('typed-cmd');
  const phrase = 'cat about_me.txt';
  let   idx    = 0;

  function type() {
    if (idx < phrase.length) {
      cmdEl.textContent += phrase[idx++];
      setTimeout(type, 65 + Math.random() * 40);
    }
  }
  // Start after a short delay
  setTimeout(type, 600);

  // ── INTERSECTION OBSERVER — SECTION REVEAL ──
  const sections = document.querySelectorAll('.section');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
        // Trigger skill bars when skills section appears
        if (entry.target.id === 'skills') animateSkillBars();
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => revealObserver.observe(s));

  // ── ACTIVE NAV LINK ON SCROLL ──
  const navLinks = document.querySelectorAll('.nav-link');
  let isManualScroll = false;

  const navObserver = new IntersectionObserver((entries) => {
    if (isManualScroll) return; 

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { 
    rootMargin: "-20% 0px -60% 0px" 
  });

  sections.forEach(s => navObserver.observe(s));

  // ── SKILL BAR ANIMATION ──
  function animateSkillBars() {
    document.querySelectorAll('.bar-fill').forEach(bar => {
      const w = bar.dataset.w;
      setTimeout(() => {
        bar.style.width = w + '%';
      }, 100 + Math.random() * 200);
    });
  }

  // ── SMOOTH SCROLL OFFSET ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        isManualScroll = true;

        const id = target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
          isManualScroll = false;
        }, 800);
      }
    });
  });

  // ── CURSOR GLOW (subtle, desktop only) ──
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position:fixed;
      pointer-events:none;
      width:200px;height:200px;
      border-radius:50%;
      background:radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%);
      transform:translate(-50%,-50%);
      transition:left 0.15s ease,top 0.15s ease;
      z-index:1;
    `;
    document.body.appendChild(glow);

    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

  // ── HONOR CARD MULTI-IMAGE SLIDER ──
  document.querySelectorAll('.honor-card').forEach(card => {
    const images = card.querySelectorAll('.slider-img');
    if (images.length <= 1) return;

    const prevBtn = card.querySelector('.prev-btn');
    const nextBtn = card.querySelector('.next-btn');
    let currentIdx = 0;

    function changeImage(nextIndex) {
      images[currentIdx].classList.remove('active');
      currentIdx = nextIndex;
      images[currentIdx].classList.add('active');
    }

    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIndex = (currentIdx + 1) % images.length;
      changeImage(nextIndex);
    });

    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIndex = (currentIdx - 1 + images.length) % images.length;
      changeImage(nextIndex);
    });
  });

  // ── LIGHTBOX FOR ALL IMAGES (Click phóng to ảnh + Hỗ trợ High-res chống lag) ──
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-modal';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close modal">ESC // CLOSE</button>
    <img class="lightbox-content" src="" alt="Enlarged view">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox-content');

  document.querySelectorAll('img').forEach(img => {
    if (img.classList.contains('lightbox-content')) return;

    img.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // MẸO CHỐNG LAG TRIỆT ĐỂ: Ưu tiên lấy ảnh gốc nét căng từ thuộc tính 'data-highres' nếu có.
      // Nếu không khai báo, nó tự lấy luôn link ảnh 'src' bình thường làm ảnh phóng to.
      const highResSrc = img.getAttribute('data-highres') || img.src;
      
      lightboxImg.src = highResSrc;
      lightboxImg.alt = img.alt || 'Portfolio Image';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden'; 
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = ''; 
    setTimeout(() => { lightboxImg.src = ''; }, 300); 
  };

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  // ── HONOR CARD HOVER GLOW ──
  document.querySelectorAll('.honor-card, .project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, var(--bg-3), var(--bg-1))`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

});