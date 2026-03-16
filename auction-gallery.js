// Photo Gallery Functionality
let galleryImages = [
    'hero.png',
    'hero.png',
    'hero.png',
    'hero.png'
];

function setGalleryImages(images) {
    if (Array.isArray(images) && images.length > 0) {
        galleryImages = images;
        // Update gallery grid in DOM
        const grid = document.querySelector('.gallery-grid');
        if (grid) {
            grid.innerHTML = ''; // Clear existing
            images.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Gallery Image ${index + 1}`;
                img.onclick = () => openLightbox(index);
                grid.appendChild(img);
            });
        }
    }
}

let currentLightboxIndex = 0;

// Open the gallery modal (white grid view)
function openGallery() {
    document.getElementById('galleryModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close the gallery modal
function closeGallery() {
    document.getElementById('galleryModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Open lightbox with specific image (black full view)
function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxImage();
    document.getElementById('lightboxModal').style.display = 'flex';
    document.getElementById('galleryModal').style.display = 'none';
}

// Close lightbox and return to gallery
function closeLightbox() {
    document.getElementById('lightboxModal').style.display = 'none';
    document.getElementById('galleryModal').style.display = 'flex';
}

// Change lightbox image (prev/next)
function changeLightboxImage(direction) {
    currentLightboxIndex += direction;

    // Loop around if at the end
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = galleryImages.length - 1;
    } else if (currentLightboxIndex >= galleryImages.length) {
        currentLightboxIndex = 0;
    }

    updateLightboxImage();
}

// Update the lightbox image and counter
function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightboxImage');
    const counter = document.querySelector('.lightbox-counter');

    lightboxImage.src = galleryImages[currentLightboxIndex];
    counter.textContent = `${currentLightboxIndex + 1}/${galleryImages.length}`;
}

// Close modals on escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (document.getElementById('lightboxModal').style.display === 'flex') {
            closeLightbox();
        } else if (document.getElementById('galleryModal').style.display === 'flex') {
            closeGallery();
        }
    }

    // Arrow keys for lightbox navigation
    if (document.getElementById('lightboxModal').style.display === 'flex') {
        if (e.key === 'ArrowLeft') {
            changeLightboxImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeLightboxImage(1);
        }
    }
});

// Close gallery if clicking outside the content
document.getElementById('galleryModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeGallery();
    }
});

document.getElementById('lightboxModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeLightbox();
    }
});
