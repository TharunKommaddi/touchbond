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
    const bookContainer = document.querySelector('.book-container');
    
    // Create page turn container
    const pageTurnContainer = document.createElement('div');
    pageTurnContainer.className = 'page-turn-container';
    bookContainer.appendChild(pageTurnContainer);
    
    // Create page curl indicators
    const leftCurl = document.createElement('div');
    leftCurl.className = 'page-curl left';
    leftCurl.addEventListener('click', previousPage);
    bookContainer.appendChild(leftCurl);
    
    const rightCurl = document.createElement('div');
    rightCurl.className = 'page-curl right';
    rightCurl.addEventListener('click', nextPage);
    bookContainer.appendChild(rightCurl);
    
    // Add page turn sound
    const pageTurnSound = document.createElement('audio');
    pageTurnSound.className = 'page-turn-sound';
    pageTurnSound.innerHTML = `
        <source src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD09PT09PUVFRUVFRVJSUlJSUmBgYGBgYG1tbW1tbXt7e3t7e4iIiIiIiJaWlpaWlqOjo6Ojo7CwsLCwsL29vb29vcvLy8vLy9jY2NjY2OXl5eXl5fLy8vLy8v///////wAAADxMQVZDNTguMTMuMTAyAAAAAAAAAAAAAAAkAkgAAP/7kGQAAAAAAAAAAAAAAAAAAAAAAFhpbmcAAAAPAAAADQAACZkAAgICAgICAgICAgICAgICAgICAgICAgICAgICDg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYKysrKysrKysrKysrKysrKysrKysrKysrKysrK0RERERERERERERERERERERERERERERERERERFdXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV2pqampqampqampqampqampqampqampqampqan19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1//MUZAAANXtUyQkMABvPXqbgzgAF8AGZ5/kGeJ9nwTJ8D4Jv/E+D5PgjgThJ/8ToYLgQH/+KDkVKnRUmiXpGZ2dKVkh2h2dKMdGZq88QOEM8MYJCQ8N4GTwspdB0S0PQdEsUHQdB0HQdEsHQdB0HQdB0SwdB0HQdB0SxQdB0HQdB0SwdB0HQdB0HQdEsHQdB0HQdEsUHQdB0HQdEtD0PRLFEtD4GRphhIaZJ/k+sCQTfjCcXA8DwPE9DwPxPJvE8m8T4nwTeJwTeJwTeJwTeJwYnCcGJ8DYYtcWOC2GK3tMU9S6WpdepaWpdepaWpdi8tS7F5LEXlsXlsReVYYsljSWGLnFji5xY8lgiwRYIljSwRYIsESOKBHFAjjgRxwI48CQPAkDwJA8CQPA4Dw" type="audio/mp3">
    `;
    bookContainer.appendChild(pageTurnSound);
    
    // Initialize
    updatePageNumber();
    setupIndexLinks();
    
    // Hide swipe instruction after a few seconds
    setTimeout(() => {
        swipeInstruction.classList.add('hidden');
    }, 5000);
    
    // Add event listeners for keyboard navigation
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
    
    // Setup clickable index links
    function setupIndexLinks() {
        const indexEntries = document.querySelectorAll('.index-page ol li');
        indexEntries.forEach((entry, index) => {
            // Add clickable class
            entry.classList.add('index-link');
            // Add click handler
            entry.addEventListener('click', () => {
                // Target page is index + 3 (cover + acknowledgement + index page)
                const targetPage = index + 3;
                if (targetPage !== currentPage) {
                    goToPage(targetPage);
                }
            });
        });
    }
    
    // Function to go to a specific page with animation
    function goToPage(targetPage) {
        if (isAnimating) return;
        
        if (targetPage > currentPage) {
            // Turn pages forward
            turnPagesSequence(currentPage, targetPage, 'forward');
        } else if (targetPage < currentPage) {
            // Turn pages backward
            turnPagesSequence(currentPage, targetPage, 'backward');
        }
    }
    
    // Function to turn pages in sequence
    function turnPagesSequence(startPage, endPage, direction) {
        isAnimating = true;
        
        // For large jumps, use a faster animation
        const jumpSize = Math.abs(endPage - startPage);
        const delay = jumpSize > 5 ? 300 : 600; // Faster for larger jumps
        
        // Set current page
        let currentSeqPage = startPage;
        
        // Function to turn one page in the sequence
        function turnOnePage() {
            if ((direction === 'forward' && currentSeqPage < endPage) || 
                (direction === 'backward' && currentSeqPage > endPage)) {
                
                // Turn the page
                if (direction === 'forward') {
                    turnPageWithAnimation(currentSeqPage, 'forward');
                    currentSeqPage++;
                } else {
                    turnPageWithAnimation(currentSeqPage, 'backward');
                    currentSeqPage--;
                }
                
                // Schedule next page turn
                setTimeout(turnOnePage, delay);
            } else {
                // Done with sequence
                isAnimating = false;
                updatePageNumber();
            }
        }
        
        // Start the sequence
        turnOnePage();
    }
    
    // Functions for navigation
    function nextPage() {
        if (isAnimating || currentPage >= totalPages - 1) return;
        
        turnPageWithAnimation(currentPage, 'forward');
        currentPage++;
        updatePageNumber();
        
        // Play sound
        playPageTurnSound();
    }
    
    function previousPage() {
        if (isAnimating || currentPage <= 0) return;
        
        turnPageWithAnimation(currentPage, 'backward');
        currentPage--;
        updatePageNumber();
        
        // Play sound
        playPageTurnSound();
    }
    
    function turnPageWithAnimation(pageIndex, direction) {
        isAnimating = true;
        
        // Create turning page element
        const turningPage = document.createElement('div');
        turningPage.className = `turning-page turning-page-${direction}`;
        
        // Take screenshot of current page
        const pageRect = pages[pageIndex].getBoundingClientRect();
        
        // Set position and size
        turningPage.style.width = pageRect.width / 2 + 'px';
        turningPage.style.height = pageRect.height + 'px';
        
        // Add to container
        pageTurnContainer.innerHTML = '';
        pageTurnContainer.appendChild(turningPage);
        
        // Show correct pages
        if (direction === 'forward') {
            // Hide current page when animation completes
            setTimeout(() => {
                pages[pageIndex].classList.add('hidden');
                // Show next page
                pages[pageIndex + 1].classList.remove('hidden');
                // Clear animation container
                pageTurnContainer.innerHTML = '';
                isAnimating = false;
            }, 1200); // Match animation duration
        } else {
            // Show previous page immediately
            pages[pageIndex - 1].classList.remove('hidden');
            // Hide current page when animation completes
            setTimeout(() => {
                pages[pageIndex].classList.add('hidden');
                // Clear animation container
                pageTurnContainer.innerHTML = '';
                isAnimating = false;
            }, 1200); // Match animation duration
        }
    }
    
    function playPageTurnSound() {
        // Reset and play the sound
        pageTurnSound.currentTime = 0;
        pageTurnSound.play().catch(e => {
            // Sound playback failed, likely due to user interaction requirements
            console.log("Sound couldn't play automatically");
        });
    }
    
    function updatePageNumber() {
        // Don't show page number on cover or back cover
        if (currentPage === 0 || currentPage === totalPages - 1) {
            pageNumber.textContent = '';
        } else {
            // Page numbers start at 1 for users
            pageNumber.textContent = `${currentPage} / ${totalPages - 2}`;
        }
        
        // Update page curl visibility
        leftCurl.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        rightCurl.style.visibility = currentPage < totalPages - 1 ? 'visible' : 'hidden';
        
        // Update visible page
        pages.forEach((page, index) => {
            if (index === currentPage) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
    }
});
