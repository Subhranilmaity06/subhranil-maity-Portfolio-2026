document.addEventListener('DOMContentLoaded', () => {
    // Add js-loaded class to body for graceful animations
    document.body.classList.add('js-loaded');

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '150px 0px 150px 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => {
        // If element is already in viewport, mark visible immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 150) {
            el.classList.add('visible');
        }
        observer.observe(el);
    });

    // Keyboard support for Lightbox
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                changeLightboxSlide(-1);
            } else if (e.key === 'ArrowRight') {
                changeLightboxSlide(1);
            }
        }
    });
});

// ===== BACK TO TOP =====
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

(function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    // only appear once you're a screenful down, so it never competes
    // with the work at the top of the page
    const threshold = () => Math.max(600, window.innerHeight * 0.8);
    let ticking = false;

    function update() {
        btn.classList.toggle('is-visible', window.pageYOffset > threshold());
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }, { passive: true });

    update();
})();

// ===== PRODUCT CAROUSEL LOGIC =====
let currentSlide = 2; // Default start on Diabevita (index 2)

function moveCarousel(direction) {
    const slides = document.querySelectorAll('#productTrack .carousel-slide');
    currentSlide += direction;
    
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    } else if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('productTrack');
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    const labels = document.querySelectorAll('#categoryLabels .category-label');
    labels.forEach((label, index) => {
        if (index === currentSlide) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    });
}

// ===== AMAZON A+ CAROUSEL LOGIC =====
let currentAmazonSlide = 2; // Default start on Diabevita (index 2)

function goToAmazonSlide(index) {
    currentAmazonSlide = index;
    updateAmazonCarousel();
    scrollToAmazonTop();
}

// Switching product mid-stack would otherwise leave you deep inside the
// new product's banners. Realign to its FIRST banner, parked just below
// the sticky nav + sticky product switcher.
function scrollToAmazonTop() {
    const section = document.querySelector('.amazon-carousel-section');
    if (!section) return;

    const nav = document.querySelector('.top-nav');
    const tabs = document.getElementById('amazonCategoryLabels');
    const stickyOffset = (nav ? nav.offsetHeight : 0) + (tabs ? tabs.offsetHeight : 0);

    const target = section.getBoundingClientRect().top + window.pageYOffset - stickyOffset - 8;
    window.scrollTo({ top: Math.max(target, 0), behavior: 'smooth' });
}

function updateAmazonCarousel() {
    const track = document.getElementById('amazonTrack');
    if (track) {
        track.style.transform = `translateX(-${currentAmazonSlide * 100}%)`;
    }
    
    const labels = document.querySelectorAll('#amazonCategoryLabels .amazon-category-label');
    labels.forEach((label, index) => {
        if (index === currentAmazonSlide) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    });
}

// ===== SOCIAL LIGHTBOX DATA & LOGIC =====
const socialSeries = {
    'ecovita': [
        'images/social/2026 creatives for socials101.webp',
        'images/social/2026 creatives for socials102.webp',
        'images/social/2026 creatives for socials103.webp',
        'images/social/2026 creatives for socials104.webp',
        'images/social/2026 creatives for socials105.webp'
    ],
    'over40': [
        'images/social/2026 creatives for socials71.webp',
        'images/social/2026 creatives for socials72.webp',
        'images/social/2026 creatives for socials73.webp',
        'images/social/2026 creatives for socials74.webp',
        'images/social/2026 creatives for socials75.webp',
        'images/social/2026 creatives for socials76.webp',
        'images/social/2026 creatives for socials77.webp'
    ],
    'graceful': [
        'images/social/2026 creatives for socials11.webp',
        'images/social/2026 creatives for socials12.webp',
        'images/social/2026 creatives for socials13.webp',
        'images/social/2026 creatives for socials14.webp',
        'images/social/2026 creatives for socials15.webp',
        'images/social/2026 creatives for socials16.webp',
        'images/social/2026 creatives for socials17.webp'
    ],
    'antiaging': [
        'images/social/2026 creatives for socials21.webp',
        'images/social/2026 creatives for socials22.webp',
        'images/social/2026 creatives for socials23.webp',
        'images/social/2026 creatives for socials24.webp',
        'images/social/2026 creatives for socials25.webp'
    ],
    'sugar': [
        'images/social/2026 creatives for socials91.webp',
        'images/social/2026 creatives for socials92.webp',
        'images/social/2026 creatives for socials93.webp',
        'images/social/2026 creatives for socials94.webp',
        'images/social/2026 creatives for socials95.webp',
        'images/social/2026 creatives for socials96.webp',
        'images/social/2026 creatives for socials97.webp',
        'images/social/2026 creatives for socials98.webp'
    ],
    'bloodsugar': [
        'images/social/2026 creatives for socials141.webp',
        'images/social/2026 creatives for socials142.webp',
        'images/social/2026 creatives for socials143.webp',
        'images/social/2026 creatives for socials144.webp',
        'images/social/2026 creatives for socials145.webp',
        'images/social/2026 creatives for socials146.webp'
    ],
    'proteinaging': [
        'images/social/2026 creatives for socials41.webp',
        'images/social/2026 creatives for socials42.webp',
        'images/social/2026 creatives for socials43.webp',
        'images/social/2026 creatives for socials44.webp',
        'images/social/2026 creatives for socials45.webp'
    ],
    'insulin': [
        'images/social/2026 creatives for socials111.webp',
        'images/social/2026 creatives for socials112.webp',
        'images/social/2026 creatives for socials113.webp',
        'images/social/2026 creatives for socials114.webp',
        'images/social/2026 creatives for socials115.webp',
        'images/social/2026 creatives for socials116.webp'
    ],
    'karela': [
        'images/social/2026 creatives for socials121.webp',
        'images/social/2026 creatives for socials122.webp',
        'images/social/2026 creatives for socials123.webp',
        'images/social/2026 creatives for socials124.webp',
        'images/social/2026 creatives for socials125.webp',
        'images/social/2026 creatives for socials126.webp'
    ],
    'berberine': [
        'images/social/2026 creatives for socials131.webp',
        'images/social/2026 creatives for socials132.webp',
        'images/social/2026 creatives for socials133.webp',
        'images/social/2026 creatives for socials134.webp',
        'images/social/2026 creatives for socials135.webp',
        'images/social/2026 creatives for socials136.webp'
    ]
};

let currentLightboxSeries = [];
let currentLightboxIndex = 0;

function openLightbox(seriesId) {
    if (socialSeries[seriesId] && socialSeries[seriesId].length > 0) {
        currentLightboxSeries = socialSeries[seriesId];
    } else {
        return;
    }
    
    currentLightboxIndex = 0;
    
    // Generate Thumbnails
    const thumbnailsContainer = document.getElementById('lightboxThumbnails');
    thumbnailsContainer.innerHTML = '';
    
    currentLightboxSeries.forEach((imgSrc, index) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'lightbox-thumb';
        img.alt = `Slide thumbnail ${index + 1}`;
        img.onclick = () => goToLightboxSlide(index);
        thumbnailsContainer.appendChild(img);
    });

    updateLightboxUI();
    
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'flex';
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    
    setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

function changeLightboxSlide(direction) {
    currentLightboxIndex += direction;
    
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = currentLightboxSeries.length - 1;
    } else if (currentLightboxIndex >= currentLightboxSeries.length) {
        currentLightboxIndex = 0;
    }
    
    updateLightboxUI();
}

function goToLightboxSlide(index) {
    currentLightboxIndex = index;
    updateLightboxUI();
}

function updateLightboxUI() {
    const imgElement = document.getElementById('lightboxImage');
    const counterElement = document.getElementById('lightboxCounter');
    
    if (currentLightboxSeries.length > 0) {
        imgElement.src = currentLightboxSeries[currentLightboxIndex];
        counterElement.textContent = `${currentLightboxIndex + 1} / ${currentLightboxSeries.length}`;
    }
    
    const thumbnails = document.querySelectorAll('.lightbox-thumb');
    thumbnails.forEach((thumb, index) => {
        if (index === currentLightboxIndex) {
            thumb.classList.add('active');
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            thumb.classList.remove('active');
        }
    });
}
