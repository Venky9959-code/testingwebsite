document.addEventListener('DOMContentLoaded', () => {
  initDraggableStickers();
  initHeadlineSlider();
  initScratchCard();
  initStatsCounter();
  initProjectModal();
  initMobileMenu();
});

function initHeadlineSlider() {
  const slides = document.querySelectorAll('.headline-slide');
  if (!slides.length) return;

  let currentIndex = 0;

  setInterval(() => {
    const prevSlide = slides[currentIndex];
    prevSlide.classList.remove('active');
    prevSlide.classList.add('exit');

    setTimeout(() => {
      prevSlide.classList.remove('exit');
    }, 700);

    currentIndex = (currentIndex + 1) % slides.length;
    const nextSlide = slides[currentIndex];
    nextSlide.classList.add('active');
  }, 2000);
}

function initDraggableStickers() {
  const stickers = document.querySelectorAll('.sticker-badge');

  stickers.forEach((sticker) => {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    setTimeout(() => {
      sticker.style.opacity = '1';
      sticker.style.transform = sticker.getAttribute('data-original-transform') || sticker.style.transform;
    }, 300);

    const onStart = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = sticker.getBoundingClientRect();
      const parentRect = sticker.parentElement.getBoundingClientRect();

      startX = clientX;
      startY = clientY;
      initialLeft = rect.left - parentRect.left;
      initialTop = rect.top - parentRect.top;

      sticker.style.zIndex = '100';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    };

    const onMove = (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - startX;
      const dy = clientY - startY;

      sticker.style.left = `${initialLeft + dx}px`;
      sticker.style.top = `${initialTop + dy}px`;
    };

    const onEnd = () => {
      isDragging = false;
      sticker.style.zIndex = '30';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };

    sticker.addEventListener('mousedown', onStart);
    sticker.addEventListener('touchstart', onStart, { passive: false });
  });
}

function initScratchCard() {
  const canvas = document.getElementById('scratchCanvas');
  const hint = document.getElementById('scratchHint');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let isScratching = false;

  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;

    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFC72E';
    ctx.font = '900 18px "Space Grotesk", "Syne", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SCRATCH HERE TO UNVEIL OUR SERVICES ⚡', canvas.width / 2, canvas.height / 2);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    if (hint) {
      hint.classList.add('hidden');
    }
  }

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  canvas.addEventListener('mousedown', (e) => {
    isScratching = true;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isScratching) return;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  });

  window.addEventListener('mouseup', () => { isScratching = false; });

  canvas.addEventListener('touchstart', (e) => {
    isScratching = true;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!isScratching) return;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  }, { passive: true });
}

function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalVal = parseInt(target.getAttribute('data-target'), 10);
        const suffix = target.getAttribute('data-suffix') || '';

        let current = 0;
        const duration = 1500;
        const stepTime = Math.abs(Math.floor(duration / finalVal));

        const timer = setInterval(() => {
          current += 1;
          target.innerText = current + suffix;
          if (current >= finalVal) {
            target.innerText = finalVal + suffix;
            clearInterval(timer);
          }
        }, stepTime);

        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach((num) => observer.observe(num));
}

function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const openBtns = document.querySelectorAll('.js-open-modal');
  if (!modal) return;

  let currentStep = 1;
  const projectData = {
    services: [],
    budget: '',
    name: '',
    email: '',
    phone: ''
  };

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      showStep(1);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  function closeModal() {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  const optionCards = modal.querySelectorAll('.modal-option-card');
  optionCards.forEach((card) => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-type');
      const val = card.getAttribute('data-val');

      if (type === 'service') {
        card.classList.toggle('selected');
      } else if (type === 'budget') {
        modal.querySelectorAll('[data-type="budget"]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        projectData.budget = val;
      }
    });
  });

  const nextBtns = modal.querySelectorAll('.js-next-step');
  nextBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (currentStep === 1) {
        const selectedServices = Array.from(modal.querySelectorAll('[data-type="service"].selected'))
          .map(c => c.getAttribute('data-val'));
        if (selectedServices.length === 0) {
          alert('Please select at least one service to continue!');
          return;
        }
        projectData.services = selectedServices;
      } else if (currentStep === 2) {
        if (!projectData.budget) {
          alert('Please select your budget range!');
          return;
        }
      }
      currentStep++;
      showStep(currentStep);
    });
  });

  const prevBtns = modal.querySelectorAll('.js-prev-step');
  prevBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentStep--;
      showStep(currentStep);
    });
  });

  const modalForm = document.getElementById('modalProjectForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      projectData.name = document.getElementById('clientName').value;
      projectData.email = document.getElementById('clientEmail').value;
      projectData.phone = document.getElementById('clientPhone').value;

      showStep(4);
    });
  }

  function showStep(stepNum) {
    currentStep = stepNum;
    const steps = modal.querySelectorAll('.modal-step');
    steps.forEach((s, idx) => {
      if (idx + 1 === stepNum) {
        s.style.display = 'block';
      } else {
        s.style.display = 'none';
      }
    });
  }
}

function initMobileMenu() {
  const toggle = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileMenuDrawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    drawer.classList.toggle('is-open');
    const isOpen = drawer.classList.contains('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
    });
  });
}
