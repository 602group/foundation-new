function initFilters() {
    window.filtersInitDone = true;

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const minPriceSelect = document.getElementById('min-price-select');
    const maxPriceSelect = document.getElementById('max-price-select');
    const sortSelect = document.getElementById('sort-select');
    const auctionGrid = document.getElementById('auction-grid');
    const resultsCount = document.getElementById('results-count');

    // New Filter Selects
    const rankingsSelect = document.getElementById('rankings-select');
    const locationSelect = document.getElementById('location-select');
    const architectSelect = document.getElementById('architect-select');

    const cards = Array.from(document.querySelectorAll('.auction-card'));
    if (!cards.length) return; // Wait for cards to exist

    // Function to apply filters
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const minPrice = parseInt(minPriceSelect.value) || 0;
        const maxPrice = parseInt(maxPriceSelect.value) || Infinity;

        // Get values from new dropdowns
        const selectedRank = rankingsSelect.value;
        const selectedState = locationSelect.value;
        const selectedArchitect = architectSelect.value;

        let visibleCount = 0;

        cards.forEach(card => {
            // Get Data Attributes
            // Removing commas just in case data was manually entered with them
            const price = parseInt(card.getAttribute('data-price')) || 0;
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const location = card.querySelector('.card-location').textContent.toLowerCase();

            const cardState = card.getAttribute('data-state') || '';
            const cardRank = card.getAttribute('data-rank') || '';
            const cardArchitect = card.getAttribute('data-architect') || '';

            // 1. Search Filter
            const matchesSearch = title.includes(searchTerm) || location.includes(searchTerm);

            // 2. Price Filter
            const matchesPrice = price >= minPrice && price <= maxPrice;

            // 3. Location Filter
            const matchesLocation = selectedState === "" || cardState === selectedState;

            // 4. Architect Filter
            const matchesArchitect = selectedArchitect === "" || cardArchitect === selectedArchitect;

            // 5. Ranking Filter
            // Logic: If I select "Top 50", I expect to see "top25" and "top50" cards.
            // Simplified for now: Exact match or "top25" included in "top50" logic if we want.
            // A better way is hierarchy: top25 is inside top50 is inside top100.
            let matchesRank = false;

            if (selectedRank === "") {
                matchesRank = true;
            } else if (selectedRank === "top100") {
                // All ranked cards are in top 100 basically
                matchesRank = ["top25", "top50", "top100"].includes(cardRank);
            } else if (selectedRank === "top50") {
                matchesRank = ["top25", "top50"].includes(cardRank);
            } else if (selectedRank === "top25") {
                matchesRank = cardRank === "top25";
            }

            // Combine All
            const isVisible = matchesSearch && matchesPrice && matchesLocation && matchesArchitect && matchesRank;

            if (isVisible) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Update Count
        resultsCount.textContent = `Showing ${visibleCount} Listings`;
    }

    // Event Listeners
    searchInput.addEventListener('input', applyFilters);
    minPriceSelect.addEventListener('change', applyFilters);
    maxPriceSelect.addEventListener('change', applyFilters);

    // New Listeners
    rankingsSelect.addEventListener('change', applyFilters);
    locationSelect.addEventListener('change', applyFilters);
    architectSelect.addEventListener('change', applyFilters);

    // Sort Listener
    sortSelect.addEventListener('change', function () {
        const criteria = sortSelect.value;
        // Sort ALL cards, not just visible ones, so the order is maintained even if filters change
        cards.sort((a, b) => {
            const priceA = parseInt(a.getAttribute('data-price')) || 0;
            const priceB = parseInt(b.getAttribute('data-price')) || 0;

            // Default large number for end time so missing times go to end
            const timeA = parseInt(a.getAttribute('data-end-time')) || 9999999999;
            const timeB = parseInt(b.getAttribute('data-end-time')) || 9999999999;

            if (criteria === 'price-asc') {
                return priceA - priceB;
            } else if (criteria === 'price-desc') {
                return priceB - priceA;
            } else if (criteria === 'ending') {
                return timeA - timeB;
            } else if (criteria === 'newest') {
                // Determine logic for newest. If ID or order implies it.
                // For now, let's assume default DOM order was "Newest" or we reverse default.
                // We'll just return 0 to rely on stable sort or original index if we tracked it.
                return 0;
            }
            return 0;
        });

        // Re-append all cards in new order
        cards.forEach(card => auctionGrid.appendChild(card));
    });

    // Reset Button Logic
    document.querySelector('.reset-btn').addEventListener('click', function () {
        searchInput.value = '';
        minPriceSelect.selectedIndex = 0;
        maxPriceSelect.selectedIndex = 0;

        rankingsSelect.value = '';
        locationSelect.value = '';
        architectSelect.value = '';
        sortSelect.selectedIndex = 0;

        applyFilters();
    });

    // Initial Run
    applyFilters();
}

// Auto-init if not called manually
document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.filtersInitDone === 'undefined') {
        initFilters();
    }
});
