document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once it has become visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => {
        observer.observe(el);
    });
});

let currentSlide = 2; // Start on Diabevita (index 2) to match Figma initial state
function moveCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
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
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    const labels = document.querySelectorAll('#categoryLabels .category-label');
    labels.forEach((label, index) => {
        if (index === currentSlide) {
            label.classList.add('active');
            label.style.borderBottomColor = '#1a5632';
            label.style.color = '#1a5632';
        } else {
            label.classList.remove('active');
            label.style.borderBottomColor = 'transparent';
            label.style.color = ''; // reset to default
        }
    });
}

let currentAmazonSlide = 2; // Start on Diabevita
function goToAmazonSlide(index) {
    currentAmazonSlide = index;
    updateAmazonCarousel();
}

function updateAmazonCarousel() {
    const track = document.getElementById('amazonTrack');
    track.style.transform = `translateX(-${currentAmazonSlide * 100}%)`;
    
    const labels = document.querySelectorAll('#amazonCategoryLabels .amazon-category-label');
    labels.forEach((label, index) => {
        if (index === currentAmazonSlide) {
            label.classList.add('active');
            label.style.borderBottomColor = '#1a5632';
            label.style.color = '#1a5632';
        } else {
            label.classList.remove('active');
            label.style.borderBottomColor = 'transparent';
            label.style.color = ''; // reset to default
        }
    });
}

// Lightbox Logic
const socialSeries = {
    'diabevita': [
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/DiabeVita/Social Creatives/Diabevita 1.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/DiabeVita/Social Creatives/Diabevita 2.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/DiabeVita/Social Creatives/Diabevita 3.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/DiabeVita/Social Creatives/Diabevita 4.png'
    ],
    'ecovita': [
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/EcoVita Plant Protein/Social Creatives/2026 creatives for socials101.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/EcoVita Plant Protein/Social Creatives/2026 creatives for socials102.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/EcoVita Plant Protein/Social Creatives/2026 creatives for socials103.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/EcoVita Plant Protein/Social Creatives/2026 creatives for socials104.png'
    ],
    'collagen': [
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/Skin Power Collagen/Social Creatives/2026 creatives for socials11.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/Skin Power Collagen/Social Creatives/2026 creatives for socials12.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/Skin Power Collagen/Social Creatives/2026 creatives for socials13.png',
        'file:///Users/subhranilmaity/Downloads/portfolio/My works/Ecowell/Skin Power Collagen/Social Creatives/2026 creatives for socials14.png'
    ]
};

let currentLightboxSeries = [];
let currentLightboxIndex = 0;

function openLightbox(seriesId) {
    if (socialSeries[seriesId]) {
        currentLightboxSeries = socialSeries[seriesId];
    } else {
        // Fallback for placeholder cards
        currentLightboxSeries = ['']; 
    }
    
    currentLightboxIndex = 0;
    
    // Generate Thumbnails
    const thumbnailsContainer = document.getElementById('lightboxThumbnails');
    thumbnailsContainer.innerHTML = ''; // clear previous
    
    currentLightboxSeries.forEach((imgSrc, index) => {
        if (imgSrc) {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = 'lightbox-thumb';
            img.onclick = () => goToLightboxSlide(index);
            thumbnailsContainer.appendChild(img);
        }
    });

    updateLightboxUI();
    
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'flex';
    // tiny delay to allow display block to apply before opacity fade-in
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    
    // Wait for transition to finish
    setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }, 300);
}

function changeLightboxSlide(direction) {
    currentLightboxIndex += direction;
    
    // Loop around
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
    
    imgElement.src = currentLightboxSeries[currentLightboxIndex] || '';
    counterElement.textContent = `${currentLightboxIndex + 1} / ${currentLightboxSeries.length}`;
    
    // Update thumbnail active state
    const thumbnails = document.querySelectorAll('.lightbox-thumb');
    thumbnails.forEach((thumb, index) => {
        if (index === currentLightboxIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}
