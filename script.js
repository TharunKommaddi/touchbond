document.addEventListener('DOMContentLoaded', function() {
    // Variables
    let currentPage = 0;
    const totalPages = document.querySelectorAll('.page').length;
    let isAnimating = false;
    
    // Elements
    const pages = document.querySelectorAll('.page');
    const prevCorner = document.getElementById('prev-corner');
    const nextCorner = document.getElementById('next-corner');
    const pageNumber = document.getElementById('page-number');
    const swipeInstruction = document.getElementById('swipe-instruction');
    
    // Initialize
    updatePageNumber();
    
    // Hide swipe instruction after a few seconds
    setTimeout(() => {
        swipeInstruction.classList.add('hidden');
    }, 5000);
    
    // Event listeners for arrows
    prevCorner.addEventListener('click', previousPage);
    nextCorner.addEventListener('click', nextPage);
    
    // Event listeners for keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft') previousPage();
        if (e.code === 'ArrowRight') nextPage();
    });
    
    // Touch/swipe functionality
    let touchStartX = 0;
    let touchEndX = 0;
    const MIN_SWIPE_DISTANCE = 50;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchStartX - touchEndX > MIN_SWIPE_DISTANCE) {
            // Swiped left - next page
            nextPage();
        } else if (touchEndX - touchStartX > MIN_SWIPE_DISTANCE) {
            // Swiped right - previous page
            previousPage();
        }
    }
    
    // Functions for navigation
    function nextPage() {
        if (isAnimating || currentPage >= totalPages - 1) return;
        
        turnPage('next');
    }
    
    function previousPage() {
        if (isAnimating || currentPage <= 0) return;
        
        turnPage('previous');
    }
    
    function turnPage(direction) {
        isAnimating = true;
        
        // Get current and next page
        const currentPageElem = pages[currentPage];
        
        // Add turning animation
        currentPageElem.classList.add('turning');
        
        // After animation completes
        setTimeout(() => {
            // Hide current page
            currentPageElem.classList.add('hidden');
            currentPageElem.classList.remove('turning');
            
            // Update current page
            if (direction === 'next') {
                currentPage++;
            } else {
                currentPage--;
            }
            
            // Show new page
            const newPageElem = pages[currentPage];
            newPageElem.classList.remove('hidden');
            
            // Update page number
            updatePageNumber();
            
            isAnimating = false;
        }, 600); // Match this to CSS transition time
    }
    
    function updatePageNumber() {
        // Don't show page number on cover or back cover
        if (currentPage === 0 || currentPage === totalPages - 1) {
            pageNumber.textContent = '';
        } else {
            // Page numbers start at 1 for users
            pageNumber.textContent = `${currentPage} / ${totalPages - 2}`;
        }
        
        // Hide/show navigation based on current page
        prevCorner.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        nextCorner.style.visibility = currentPage < totalPages - 1 ? 'visible' : 'hidden';
    }
});
