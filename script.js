// Initialize Carousels on Page Load
document.addEventListener('DOMContentLoaded', function () {
    initCarousels();
});

function initCarousels() {
    // Check if auctionData exists
    if (typeof auctionData === 'undefined') return;

    // Find all cards with data-auction-id
    const cards = document.querySelectorAll('.auction-card[data-auction-id]');

    cards.forEach(card => {
        const auctionId = card.getAttribute('data-auction-id');
        const data = auctionData[auctionId];

        if (data && data.images && data.images.length > 0) {
            const carouselContainer = card.querySelector('.carousel-images');
            if (carouselContainer) {
                // Clear existing static images
                carouselContainer.innerHTML = '';

                // Add images from data source
                data.images.forEach((imgUrl, index) => {
                    const img = document.createElement('img');
                    img.src = imgUrl;
                    img.alt = `${data.title} ${index + 1}`;
                    img.className = index === 0 ? 'carousel-img active' : 'carousel-img';
                    carouselContainer.appendChild(img);
                });

                // Reset index
                carouselContainer.setAttribute('data-current-index', 0);
            }
        }
    });
}
// Carousel Functionality
function moveCarousel(event, cardId, direction) {
    // Prevent the click from bubbling up to the link
    event.preventDefault();
    event.stopPropagation();

    // Find the carousel container within the specific card
    const card = document.getElementById(cardId);
    if (!card) return;

    const imagesContainer = card.querySelector('.carousel-images');
    const images = imagesContainer.querySelectorAll('.carousel-img');
    let currentIndex = parseInt(imagesContainer.getAttribute('data-current-index')) || 0;

    // Hide current image
    images[currentIndex].classList.remove('active');

    // Calculate new index
    currentIndex += direction;
    if (currentIndex >= images.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }

    // Show new image and update index
    images[currentIndex].classList.add('active');
    imagesContainer.setAttribute('data-current-index', currentIndex);
}

// Header scroll effect - transitions to solid black
window.addEventListener('scroll', function () {
    const header = document.querySelector('.hero-header');

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
