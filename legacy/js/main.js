/* ═══════════════════════════════════════════════════
   CONSCIOUS OMNIUM — Shared JavaScript v2
   GSAP + ScrollTrigger, page transitions, NO cursor
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    initLoader();
    initHeader();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initPageTransitions();
    initHeroSlideshow();
});


// ═══════════════════════════════════════════════════
// LOADER — Brand intro
// ═══════════════════════════════════════════════════
function initLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return;

    const tl = gsap.timeline();

    tl.to('.loader-brand', {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
    }, 0)
    .to('.loader-line', {
        scaleX: 1,
        duration: 1.0,
        ease: 'power2.inOut'
    }, 0.2)
    .to('.loader-artist', {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
    }, 0.5)
    .to('.loader', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        delay: 0.4
    })
    .set('.loader', { display: 'none' })
    .call(() => { animateHero(); });
}


// ═══════════════════════════════════════════════════
// HERO ENTRANCE
// ═══════════════════════════════════════════════════
function animateHero() {
    const heroElements = document.querySelectorAll('.hero-animate');
    if (!heroElements.length) return;

    gsap.fromTo(heroElements,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.05 }
    );

    const heroImg = document.querySelector('.hero-img-animate');
    if (heroImg) {
        gsap.fromTo(heroImg,
            { scale: 1.06, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out', delay: 0.15 }
        );
    }

    // Subtle zoom on active hero slide
    const activeSlide = document.querySelector('.hero-slide.active img');
    if (activeSlide) {
        gsap.fromTo(activeSlide,
            { scale: 1.12 },
            { scale: 1, duration: 2.5, ease: 'power2.out', delay: 0.1 }
        );
    }

    // Animate indicators in
    const indicators = document.querySelectorAll('.hero-indicator');
    if (indicators.length) {
        gsap.fromTo(indicators, { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.08, delay: 0.8 });
    }
}


// ═══════════════════════════════════════════════════
// HERO SLIDESHOW
// ═══════════════════════════════════════════════════
let slideshowInterval = null;

function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-indicator');
    const nowShowingEl = document.getElementById('hero-now-showing');
    if (slides.length < 2) return;

    let current = 0;

    function goToSlide(index) {
        slides[current].classList.remove('active');
        if (indicators[current]) indicators[current].classList.remove('active');

        current = index;

        slides[current].classList.add('active');
        if (indicators[current]) indicators[current].classList.add('active');

        // Ken Burns subtle zoom on entering slide
        gsap.fromTo(slides[current].querySelector('img'),
            { scale: 1.08 },
            { scale: 1, duration: 6, ease: 'power1.out' }
        );

        // Update "Now Showing" text
        if (nowShowingEl && slides[current].dataset.title) {
            nowShowingEl.textContent = 'Now Showing — ' + slides[current].dataset.title;
        }
    }

    function nextSlide() {
        goToSlide((current + 1) % slides.length);
    }

    // Auto advance every 5 seconds
    slideshowInterval = setInterval(nextSlide, 5000);

    // Indicator click
    indicators.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(slideshowInterval);
            goToSlide(i);
            slideshowInterval = setInterval(nextSlide, 5000);
        });
    });
}


// ═══════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════
function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}


// ═══════════════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════════════
function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const close = document.getElementById('menu-close');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    if (close) close.addEventListener('click', closeMobileMenu);

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.remove('open');
        document.body.style.overflow = '';
    }
}


// ═══════════════════════════════════════════════════
// SCROLL ANIMATIONS (GSAP + ScrollTrigger)
// ═══════════════════════════════════════════════════
function initScrollAnimations() {
    // Fade up reveals
    gsap.utils.toArray('.gs-reveal').forEach(el => {
        gsap.fromTo(el,
            { y: 45, opacity: 0, visibility: 'hidden' },
            {
                y: 0, opacity: 1, visibility: 'visible',
                duration: 1.1, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
            }
        );
    });

    // Staggered children
    gsap.utils.toArray('.gs-stagger').forEach(parent => {
        const children = parent.querySelectorAll('.gs-stagger-child');
        gsap.fromTo(children,
            { y: 35, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1,
                scrollTrigger: { trigger: parent, start: 'top 85%', toggleActions: 'play none none none' }
            }
        );
    });

    // Image clip reveals
    gsap.utils.toArray('.gs-img-reveal').forEach(img => {
        gsap.fromTo(img,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
                clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut',
                scrollTrigger: { trigger: img, start: 'top 85%', toggleActions: 'play none none none' }
            }
        );
    });

    // HR lines
    gsap.utils.toArray('.hr-animated').forEach(line => {
        gsap.to(line, {
            scaleX: 1, duration: 1.2, ease: 'power2.inOut',
            scrollTrigger: { trigger: line, start: 'top 90%', toggleActions: 'play none none none' }
        });
    });

    // Scale in images
    gsap.utils.toArray('.gs-scale-in').forEach(el => {
        gsap.fromTo(el,
            { scale: 0.93, opacity: 0 },
            {
                scale: 1, opacity: 1, duration: 1.4, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
            }
        );
    });

    // Parallax
    gsap.utils.toArray('.gs-parallax').forEach(el => {
        gsap.to(el, {
            yPercent: -8, ease: 'none',
            scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
    });
}


// ═══════════════════════════════════════════════════
// SMOOTH SCROLL
// ═══════════════════════════════════════════════════
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const pos = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: pos, behavior: 'smooth' });
            }
        });
    });
}


// ═══════════════════════════════════════════════════
// PAGE TRANSITIONS — Brand screen between pages
// ═══════════════════════════════════════════════════
function initPageTransitions() {
    const overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) return;

    // On page load: reveal from transition
    gsap.set(overlay, { yPercent: 0 });

    const entranceTl = gsap.timeline();
    entranceTl
        .to(overlay.querySelector('.pt-brand'), { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0)
        .to(overlay.querySelector('.pt-line'), { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, 0.1)
        .to(overlay.querySelector('.pt-artist'), { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.2)
        .to(overlay, { yPercent: -100, duration: 0.7, ease: 'power3.inOut', delay: 0.3 })
        .set(overlay, { yPercent: 100, pointerEvents: 'none' })
        // Reset inner elements for next use
        .set(overlay.querySelector('.pt-brand'), { opacity: 0, y: 12 })
        .set(overlay.querySelector('.pt-line'), { scaleX: 0 })
        .set(overlay.querySelector('.pt-artist'), { opacity: 0 });

    // Intercept internal navigation links
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('tel:')) return;
        if (link.getAttribute('target') === '_blank') return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const destination = href;

            // Bring overlay in from bottom
            gsap.set(overlay, { yPercent: 100, pointerEvents: 'all' });
            
            const exitTl = gsap.timeline();
            exitTl
                .to(overlay, { yPercent: 0, duration: 0.5, ease: 'power3.inOut' })
                .to(overlay.querySelector('.pt-brand'), { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.25)
                .to(overlay.querySelector('.pt-line'), { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, 0.3)
                .to(overlay.querySelector('.pt-artist'), { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.35)
                .call(() => {
                    window.location.href = destination;
                }, null, '+=0.2');
        });
    });
}


// ═══════════════════════════════════════════════════
// EXHIBITION TOGGLE
// ═══════════════════════════════════════════════════
function toggleExhibition(el) {
    const content = el.querySelector('.exhibition-content');
    const arrow = el.querySelector('.exhibition-arrow');
    if (!content) return;
    const isExpanded = content.classList.contains('expanded');
    content.classList.toggle('expanded');
    if (arrow) arrow.style.transform = isExpanded ? '' : 'rotate(180deg)';
}


// ═══════════════════════════════════════════════════
// ARTWORK MODAL
// ═══════════════════════════════════════════════════
let currentArtwork = 0;
let artworksData = [];

function setArtworksData(data) { artworksData = data; }

function openArtwork(index) {
    currentArtwork = index;
    const art = artworksData[index];
    if (!art) return;
    document.getElementById('modal-image').src = art.image;
    document.getElementById('modal-image').alt = art.title + ' by Shivjeet Potdar';
    document.getElementById('modal-title').textContent = art.title;
    document.getElementById('modal-year').textContent = art.year;
    document.getElementById('modal-medium').textContent = art.medium;
    document.getElementById('modal-dimensions').textContent = art.dimensions;
    document.getElementById('modal-series').textContent = art.series;
    document.getElementById('modal-description').textContent = art.description;
    document.getElementById('artwork-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeArtwork() {
    const modal = document.getElementById('artwork-modal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}
function nextArtwork() { currentArtwork = (currentArtwork + 1) % artworksData.length; openArtwork(currentArtwork); }
function prevArtwork() { currentArtwork = (currentArtwork - 1 + artworksData.length) % artworksData.length; openArtwork(currentArtwork); }

document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('artwork-modal');
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeArtwork();
    if (e.key === 'ArrowRight') nextArtwork();
    if (e.key === 'ArrowLeft') prevArtwork();
});


// ═══════════════════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════════════════
function handleContactSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if (form) {
        gsap.to(form, {
            opacity: 0, y: -20, duration: 0.4, ease: 'power2.in',
            onComplete: () => {
                form.style.display = 'none';
                if (success) {
                    success.style.display = 'block';
                    gsap.fromTo(success, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
                }
            }
        });
    }
}
