document.addEventListener('DOMContentLoaded', function() {
    // Variables
    let currentPage = 0;
    const totalPages = 23; // FIXED: Updated to match actual number of pages (0-22: cover + ack + index + 19 letters + back)
    // const totalPages = 27; // Original commented - was causing out of bounds errors
    // const totalPages = document.querySelectorAll('.page').length; // Alternative method commented
    let isAnimating = false;
    
    // Elements
    const pages = document.querySelectorAll('.page');
    const prevCorner = document.getElementById('prev-corner'); // FIXED: Now properly exists in HTML
    const nextCorner = document.getElementById('next-corner'); // FIXED: Now properly exists in HTML
    const pageNumber = document.getElementById('page-number');
    const swipeInstruction = document.getElementById('swipe-instruction');
    const bookContainer = document.querySelector('.book-container');
    
    // FIXED: Validate required elements exist
    if (!bookContainer) {
        console.error('Book container not found!');
        return;
    }
    
    // Create page flip container
    const pageFlipContainer = document.createElement('div');
    pageFlipContainer.className = 'page-flip-container';
    bookContainer.appendChild(pageFlipContainer);
    
    // Create page corner folds (dynamic ones for animations)
    const rightFold = document.createElement('div');
    rightFold.className = 'page-fold right-bottom';
    rightFold.addEventListener('click', nextPage);
    bookContainer.appendChild(rightFold);
    
    const leftFold = document.createElement('div');
    leftFold.className = 'page-fold left-bottom';
    leftFold.addEventListener('click', previousPage);
    bookContainer.appendChild(leftFold);
    
    // Create page turn sound
    const pageTurnSound = document.createElement('audio');
    pageTurnSound.className = 'page-turn-sound';
    pageTurnSound.innerHTML = `
        <source src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD09PT09PUVFRUVFRVJSUlJSUmBgYGBgYG1tbW1tbXt7e3t7e4iIiIiIiJaWlpaWlqOjo6Ojo7CwsLCwsL29vb29vcvLy8vLy9jY2NjY2OXl5eXl5fLy8vLy8v///////wAAADxMQVZDNTguMTMuMTAyAAAAAAAAAAAAAAAkAkgAAP/7kGQAAAAAAAAAAAAAAAAAAAAAAFhpbmcAAAAPAAAADQAACZkAAgICAgICAgICAgICAgICAgICAgICAgICAgICDg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYKysrKysrKysrKysrKysrKysrKysrKysrKysrK0RERERERERERERERERERERERERERERERERERFdXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV2pqampqampqampqampqampqampqampqampqan19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1//MUZAAANXtUyQkMABvPXqbgzgAF8AGZ5/kGeJ9nwTJ8D4Jv/E+D5PgjgThJ/8ToYLgQH/+KDkVKnRUmiXpGZ2dKVkh2h2dKMdGZq88QOEM8MYJCQ8N4GTwspdB0S0PQdEsUHQdB0HQdEsHQdB0HQdB0SwdB0HQdB0SxQdB0HQdB0SwdB0HQdB0HQdEsHQdB0HQdEsUHQdB0HQdEtD0PRLFEtD4GRphhIaZJ/k+sCQTfjCcXA8DwPE9DwPxPJvE8m8T4nwTeJwTeJwTeJwTeJwYnCcGJ8DYYtcWOC2GK3tMU9S6WpdepaWpdepaWpdi8tS7F5LEXlsXlsReVYYsljSWGLnFji5xY8lgiwRYIljSwRYIsESOKBHFAjjgRxwI48CQPAkDwJA8CQPA4Dw" type="audio/mp3">
    `;
    bookContainer.appendChild(pageTurnSound);
    
    // FIXED: Initialize - Show first page properly and hide all others
    showPage(0);
    updatePageNumber();
    setupIndexLinks();
    
    // FIXED: Add event listeners to static page corners if they exist
    if (prevCorner) {
        prevCorner.addEventListener('click', previousPage);
    }
    if (nextCorner) {
        nextCorner.addEventListener('click', nextPage);
    }
    
    // Hide swipe instruction after a few seconds
    setTimeout(() => {
        if (swipeInstruction) {
            swipeInstruction.classList.add('hidden');
        }
    }, 5000);
    
    // Add event listeners for keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') previousPage();
        if (e.code === 'ArrowRight' || e.key === 'ArrowRight') nextPage();
        if (e.key === 'Home') goToPage(0);
        if (e.key === 'End') goToPage(totalPages - 1);
        // FIXED: Prevent default for arrow keys to avoid page scrolling
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            e.preventDefault();
        }
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
    
    // FIXED: Function to show specific page and hide others properly
    function showPage(pageIndex) {
        // FIXED: Validate page index bounds
        if (pageIndex < 0 || pageIndex >= totalPages) {
            console.warn(`Invalid page index: ${pageIndex}. Valid range: 0-${totalPages - 1}`);
            return false;
        }
        
        // FIXED: Ensure pages exist
        if (!pages || pages.length === 0) {
            console.error('No pages found!');
            return false;
        }
        
        pages.forEach((page, index) => {
            if (index === pageIndex) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
        
        currentPage = pageIndex;
        return true;
    }
    
    // FIXED: Setup clickable index links with proper error handling
    function setupIndexLinks() {
        const indexPage = document.querySelector('.index-page ol');
        if (!indexPage) {
            console.warn('Index page not found');
            return;
        }
        
        const indexItems = indexPage.querySelectorAll('li');
        if (indexItems.length === 0) {
            console.warn('No index items found');
            return;
        }
        
        indexItems.forEach((item, index) => {
            // Add clickable class
            item.classList.add('index-link');
            
            // FIXED: Add click event with proper bounds checking
            item.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                const targetPage = index + 3; // Offset for cover, acknowledgement, index
                
                // FIXED: Add bounds checking for target page
                if (targetPage >= 0 && targetPage < totalPages) {
                    goToPage(targetPage);
                } else {
                    console.warn(`Target page ${targetPage} is out of bounds. Index: ${index}, Total pages: ${totalPages}`);
                }
            });
            
            // FIXED: Add keyboard navigation for accessibility
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
            
            // FIXED: Make focusable for keyboard navigation
            item.setAttribute('tabindex', '0');
        });
        
        console.log(`Setup ${indexItems.length} index links`);
    }
    
    // FIXED: Go to specific page with improved logic
    function goToPage(targetPage) {
        // FIXED: Better validation and animation handling
        if (isAnimating) {
            console.log('Animation in progress, ignoring navigation');
            return false;
        }
        
        if (targetPage === currentPage) {
            console.log('Already on target page');
            return false;
        }
        
        if (targetPage < 0 || targetPage >= totalPages) {
            console.error(`Target page ${targetPage} out of bounds (0-${totalPages - 1})`);
            return false;
        }
        
        // For large jumps (like from index), do immediate transition to prevent getting stuck
        const jumpDistance = Math.abs(targetPage - currentPage);
        if (jumpDistance > 3) {
            console.log(`Large jump detected (${jumpDistance} pages), using immediate transition`);
            isAnimating = true;
            
            // Show target page immediately for large jumps
            if (showPage(targetPage)) {
                updatePageNumber();
                
                // Add a brief visual effect
                bookContainer.classList.add('quick-transition');
                setTimeout(() => {
                    bookContainer.classList.remove('quick-transition');
                    isAnimating = false;
                }, 300);
                return true;
            } else {
                isAnimating = false;
                return false;
            }
        } else {
            // For small jumps, use sequential page turns
            if (targetPage > currentPage) {
                return turnPagesSequence(targetPage, 'forward');
            } else {
                return turnPagesSequence(targetPage, 'backward');
            }
        }
    }
    
    // FIXED: Turn pages in sequence - Fixed animation and timing issues
    function turnPagesSequence(targetPage, direction) {
        if (isAnimating) {
            console.log('Already animating sequence');
            return false;
        }
        
        isAnimating = true;
        let sequenceRunning = true;
        let currentSequencePage = currentPage;
        
        function turnNextInSequence() {
            if (!sequenceRunning) {
                isAnimating = false;
                return;
            }
            
            if ((direction === 'forward' && currentSequencePage < targetPage) || 
                (direction === 'backward' && currentSequencePage > targetPage)) {
                
                if (direction === 'forward') {
                    performPageTurn(currentSequencePage, 'right');
                    currentSequencePage++;
                } else {
                    performPageTurn(currentSequencePage, 'left');
                    currentSequencePage--;
                }
                
                // FIXED: Update page display and current page properly
                setTimeout(() => {
                    if (showPage(currentSequencePage)) {
                        updatePageNumber();
                    }
                }, 300); // Half of animation time
                
                // Schedule next page turn - FIXED timing
                setTimeout(turnNextInSequence, 600);
            } else {
                sequenceRunning = false;
                isAnimating = false;
                // Final update to ensure we're on the correct page
                showPage(targetPage);
                updatePageNumber();
                console.log(`Sequence complete, now on page ${targetPage}`);
            }
        }
        
        // Start the sequence
        turnNextInSequence();
        return true;
    }
    
    // FIXED: Functions for navigation with better error handling
    function nextPage() {
        if (isAnimating) {
            console.log('Animation in progress, ignoring next page');
            return false;
        }
        
        if (currentPage >= totalPages - 1) {
            console.log('Already on last page');
            return false;
        }
        
        isAnimating = true;
        performPageTurn(currentPage, 'right');
        
        // FIXED: Update page after animation starts
        setTimeout(() => {
            if (showPage(currentPage + 1)) {
                updatePageNumber();
                playPageTurnSound();
            }
        }, 300); // Half of animation duration
        
        // FIXED: Reset animation flag after full animation
        setTimeout(() => {
            isAnimating = false;
        }, 600);
        
        return true;
    }
    
    function previousPage() {
        if (isAnimating) {
            console.log('Animation in progress, ignoring previous page');
            return false;
        }
        
        if (currentPage <= 0) {
            console.log('Already on first page');
            return false;
        }
        
        isAnimating = true;
        performPageTurn(currentPage, 'left');
        
        // FIXED: Update page after animation starts
        setTimeout(() => {
            if (showPage(currentPage - 1)) {
                updatePageNumber();
                playPageTurnSound();
            }
        }, 300); // Half of animation duration
        
        // FIXED: Reset animation flag after full animation
        setTimeout(() => {
            isAnimating = false;
        }, 600);
        
        return true;
    }
    
    // FIXED: Improved page turn animation with error handling
    function performPageTurn(pageIndex, direction) {
        if (!pageFlipContainer) {
            console.error('Page flip container not found');
            return;
        }
        
        // Create page flipper elements
        pageFlipContainer.innerHTML = '';
        
        const flipper = document.createElement('div');
        flipper.className = 'page-flipper';
        
        const frontPage = document.createElement('div');
        frontPage.className = 'page-front';
        
        const backPage = document.createElement('div');
        backPage.className = 'page-back';
        
        const shadow = document.createElement('div');
        shadow.className = 'page-shadow';
        
        const dogEar = document.createElement('div');
        dogEar.className = 'dog-ear';
        
        // FIXED: Better page content handling for animation
        const pageBackground = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`
        
        if (direction === 'right') {
            frontPage.style.backgroundImage = pageBackground;
            backPage.style.backgroundImage = pageBackground;
            
            // Add page content if needed - commented for performance
            // if (pages[pageIndex]) frontPage.textContent = pages[pageIndex].textContent;
            // if (pages[pageIndex + 1]) backPage.textContent = pages[pageIndex + 1].textContent;
        } else {
            frontPage.style.backgroundImage = pageBackground;
            backPage.style.backgroundImage = pageBackground;
            
            // Add page content if needed - commented for performance
            // if (pages[pageIndex]) frontPage.textContent = pages[pageIndex].textContent;
            // if (pages[pageIndex - 1]) backPage.textContent = pages[pageIndex - 1].textContent;
        }
        
        // Assemble the elements
        flipper.appendChild(frontPage);
        flipper.appendChild(backPage);
        flipper.appendChild(dogEar);
        pageFlipContainer.appendChild(flipper);
        pageFlipContainer.appendChild(shadow);
        
        // Apply turning animation
        if (direction === 'right') {
            pageFlipContainer.classList.add('turning-right');
            pageFlipContainer.classList.remove('turning-left');
        } else {
            pageFlipContainer.classList.add('turning-left');
            pageFlipContainer.classList.remove('turning-right');
        }
        
        // Clear animation after it completes
        setTimeout(() => {
            pageFlipContainer.innerHTML = '';
            pageFlipContainer.classList.remove('turning-right', 'turning-left');
        }, 1200); // Match animation duration
    }
    
    // FIXED: Improved sound handling
    function playPageTurnSound() {
        if (!pageTurnSound) {
            console.warn('Page turn sound not available');
            return;
        }
        
        try {
            // Reset and play the sound
            pageTurnSound.currentTime = 0;
            pageTurnSound.play().catch(e => {
                // Sound playback may fail due to autoplay restrictions
                console.log("Sound couldn't play automatically:", e.message);
            });
        } catch (e) {
            console.warn('Error playing sound:', e.message);
        }
    }
    
    // FIXED: Improved page number display and corner visibility
    function updatePageNumber() {
        // Don't show page number on cover or back cover
        if (currentPage === 0 || currentPage === totalPages - 1) {
            if (pageNumber) pageNumber.textContent = '';
        } else {
            // Page numbers start at 1 for users
            if (pageNumber) pageNumber.textContent = `${currentPage} / ${totalPages - 2}`;
        }
        
        // FIXED: Update page corner visibility with null checks
        if (leftFold) {
            leftFold.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        }
        if (rightFold) {
            rightFold.style.visibility = currentPage < totalPages - 1 ? 'visible' : 'hidden';
        }
        
        // Update static corners if they exist (original code compatibility)
        if (prevCorner) {
            prevCorner.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        }
        if (nextCorner) {
            nextCorner.style.visibility = currentPage < totalPages - 1 ? 'visible' : 'hidden';
        }
    }
    
    // FIXED: Debug function with comprehensive info
    window.debugBook = function() {
        console.log('=== BOOK DEBUG INFO ===');
        console.log('Current Page:', currentPage);
        console.log('Total Pages:', totalPages);
        console.log('Is Animating:', isAnimating);
        console.log('Pages found:', pages ? pages.length : 'No pages');
        console.log('Visible pages:', pages ? Array.from(pages).filter(p => !p.classList.contains('hidden')).length : 0);
        console.log('Page flip container:', pageFlipContainer ? 'Found' : 'Missing');
        console.log('Index items:', document.querySelectorAll('.index-page li').length);
        console.log('Navigation elements:');
        console.log('  - prevCorner:', prevCorner ? 'Found' : 'Missing');
        console.log('  - nextCorner:', nextCorner ? 'Found' : 'Missing');
        console.log('  - leftFold:', leftFold ? 'Found' : 'Missing');
        console.log('  - rightFold:', rightFold ? 'Found' : 'Missing');
        console.log('========================');
        
        // Test page validation
        for (let i = 0; i < totalPages; i++) {
            const pageExists = document.getElementById(`page-${i}`);
            if (!pageExists) {
                console.warn(`Missing page: page-${i}`);
            }
        }
    };
    
    // FIXED: Additional safety check - ensure only one page is visible on load
    setTimeout(() => {
        if (pages) {
            let visiblePages = Array.from(pages).filter(p => !p.classList.contains('hidden'));
            if (visiblePages.length > 1) {
                console.warn(`Multiple pages visible (${visiblePages.length}), fixing...`);
                showPage(currentPage);
            } else if (visiblePages.length === 0) {
                console.warn('No pages visible, showing first page...');
                showPage(0);
            }
        }
    }, 100);
    
    // FIXED: Window resize handler for responsive behavior
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            updatePageNumber();
        }, 250);
    });
    
    // FIXED: Error boundary for unhandled errors
    window.addEventListener('error', function(e) {
        console.error('Book app error:', e.error);
        isAnimating = false; // Reset animation state on error
    });
    
    // FIXED: Page visibility change handler
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Page is now hidden, pause any audio
            if (pageTurnSound && !pageTurnSound.paused) {
                pageTurnSound.pause();
            }
        }
    });
    
    // FIXED: Initial load complete
    console.log(`Book initialized with ${totalPages} pages. Current page: ${currentPage}`);
    
    // FIXED: Expose useful functions for external access
    window.bookNavigation = {
        goToPage: goToPage,
        nextPage: nextPage,
        previousPage: previousPage,
        getCurrentPage: () => currentPage,
        getTotalPages: () => totalPages,
        isAnimating: () => isAnimating
    };
});
