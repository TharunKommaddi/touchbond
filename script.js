document.addEventListener('DOMContentLoaded', function() {
    // Variables
    let currentPage = 0;
    const totalPages = 23; // Fixed: Updated to match actual number of pages (0-22)
    // const totalPages = 27; // Original commented - was causing out of bounds errors
    // const totalPages = document.querySelectorAll('.page').length; // Alternative method commented
    let isAnimating = false;
    
    // Elements
    const pages = document.querySelectorAll('.page');
    const prevCorner = document.getElementById('prev-corner');
    const nextCorner = document.getElementById('next-corner');
    const pageNumber = document.getElementById('page-number');
    const swipeInstruction = document.getElementById('swipe-instruction');
    const bookContainer = document.querySelector('.book-container');
    
    // Create page flip container
    const pageFlipContainer = document.createElement('div');
    pageFlipContainer.className = 'page-flip-container';
    bookContainer.appendChild(pageFlipContainer);
    
    // Create page corner folds
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
    
    // Initialize - Fixed: Show first page properly and hide all others
    showPage(0);
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
    
    // Fixed: Function to show specific page and hide others properly
    function showPage(pageIndex) {
        // Validate page index bounds
        if (pageIndex < 0 || pageIndex >= totalPages) {
            console.warn(`Invalid page index: ${pageIndex}`);
            return;
        }
        
        pages.forEach((page, index) => {
            if (index === pageIndex) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
        currentPage = pageIndex;
    }
    
    // Setup clickable index links
    function setupIndexLinks() {
        const indexPage = document.querySelector('.index-page ol');
        if (!indexPage) return;
        
        const indexItems = indexPage.querySelectorAll('li');
        indexItems.forEach((item, index) => {
            // Add clickable class
            item.classList.add('index-link');
            
            // Fixed: Add click event with proper bounds checking
            item.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                const targetPage = index + 3; // Offset for cover, acknowledgement, index
                
                // Fixed: Add bounds checking for target page
                if (targetPage >= 0 && targetPage < totalPages) {
                    goToPage(targetPage);
                } else {
                    console.warn(`Target page ${targetPage} is out of bounds`);
                }
            });
        });
    }
    
    // Fixed: Go to specific page with improved logic
    function goToPage(targetPage) {
        // Fixed: Better validation and animation handling
        if (isAnimating || targetPage === currentPage || targetPage < 0 || targetPage >= totalPages) {
            return;
        }
        
        // For large jumps (like from index), do immediate transition to prevent getting stuck
        const jumpDistance = Math.abs(targetPage - currentPage);
        if (jumpDistance > 3) {
            isAnimating = true;
            
            // Show target page immediately for large jumps
            showPage(targetPage);
            updatePageNumber();
            
            // Add a brief animation effect
            pageFlipContainer.classList.add('quick-transition');
            setTimeout(() => {
                pageFlipContainer.classList.remove('quick-transition');
                isAnimating = false;
            }, 300);
        } else {
            // For small jumps, use sequential page turns
            if (targetPage > currentPage) {
                turnPagesSequence(targetPage, 'forward');
            } else {
                turnPagesSequence(targetPage, 'backward');
            }
        }
    }
    
    // Turn pages in sequence - Fixed animation and timing issues
    function turnPagesSequence(targetPage, direction) {
        if (isAnimating) return;
        
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
                
                // Fixed: Update page display and current page properly
                setTimeout(() => {
                    showPage(currentSequencePage);
                    updatePageNumber();
                }, 300); // Half of animation time
                
                // Schedule next page turn - Fixed timing
                setTimeout(turnNextInSequence, 600);
            } else {
                sequenceRunning = false;
                isAnimating = false;
                // Final update
                showPage(targetPage);
                updatePageNumber();
            }
        }
        
        // Start the sequence
        turnNextInSequence();
    }
    
    // Functions for navigation - Fixed timing and page display
    function nextPage() {
        if (isAnimating || currentPage >= totalPages - 1) return;
        
        isAnimating = true;
        performPageTurn(currentPage, 'right');
        
        // Fixed: Update page after animation starts
        setTimeout(() => {
            showPage(currentPage + 1);
            updatePageNumber();
            playPageTurnSound();
        }, 300); // Half of animation duration
        
        // Fixed: Reset animation flag after full animation
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }
    
    function previousPage() {
        if (isAnimating || currentPage <= 0) return;
        
        isAnimating = true;
        performPageTurn(currentPage, 'left');
        
        // Fixed: Update page after animation starts
        setTimeout(() => {
            showPage(currentPage - 1);
            updatePageNumber();
            playPageTurnSound();
        }, 300); // Half of animation duration
        
        // Fixed: Reset animation flag after full animation
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }
    
    // Fixed: Improved page turn animation
    function performPageTurn(pageIndex, direction) {
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
        
        // Fixed: Better page content handling for animation
        if (direction === 'right') {
            frontPage.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`;
            backPage.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`;
            
            // Add page content if needed - commented for performance
            // frontPage.textContent = pages[pageIndex] ? pages[pageIndex].textContent : '';
            // backPage.textContent = pages[pageIndex + 1] ? pages[pageIndex + 1].textContent : '';
        } else {
            frontPage.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`;
            backPage.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`;
            
            // Add page content if needed - commented for performance
            // frontPage.textContent = pages[pageIndex] ? pages[pageIndex].textContent : '';
            // backPage.textContent = pages[pageIndex - 1] ? pages[pageIndex - 1].textContent : '';
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
            
            // Fixed: Show next page behind the animation - commented original approach
            // setTimeout(() => {
            //     pages[pageIndex].classList.add('hidden');
            //     pages[pageIndex + 1].classList.remove('hidden');
            // }, 600); // Half of animation time
        } else {
            pageFlipContainer.classList.add('turning-left');
            pageFlipContainer.classList.remove('turning-right');
            
            // Fixed: Show previous page behind the animation - commented original approach
            // setTimeout(() => {
            //     pages[pageIndex].classList.add('hidden');
            //     pages[pageIndex - 1].classList.remove('hidden');
            // }, 600); // Half of animation time
        }
        
        // Clear animation after it completes
        setTimeout(() => {
            pageFlipContainer.innerHTML = '';
            pageFlipContainer.classList.remove('turning-right', 'turning-left');
        }, 1200); // Match animation duration
    }
    
    function playPageTurnSound() {
        // Reset and play the sound
        pageTurnSound.currentTime = 0;
        pageTurnSound.play().catch(e => {
            // Sound playback may fail due to autoplay restrictions
            console.log("Sound couldn't play automatically");
        });
    }
    
    // Fixed: Improved page number display and corner visibility
    function updatePageNumber() {
        // Don't show page number on cover or back cover
        if (currentPage === 0 || currentPage === totalPages - 1) {
            pageNumber.textContent = '';
        } else {
            // Page numbers start at 1 for users
            pageNumber.textContent = `${currentPage} / ${totalPages - 2}`;
        }
        
        // Fixed: Update page corner visibility with null checks
        if (leftFold) {
            leftFold.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        }
        if (rightFold) {
            rightFold.style.visibility = currentPage < totalPages - 1 ? 'visible' : 'hidden';
        }
        
        // Update prevCorner and nextCorner if they exist (original code compatibility)
        if (prevCorner) {
            prevCorner.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        }
        if (nextCorner) {
            nextCorner.style.visibility = currentPage < totalPages - 1 ? 'visible' : 'hidden';
        }
    }
    
    // Debug function - can be called from console
    window.debugBook = function() {
        console.log('Debug Info:');
        console.log('Current Page:', currentPage);
        console.log('Total Pages:', totalPages);
        console.log('Is Animating:', isAnimating);
        console.log('Pages found:', pages.length);
        console.log('Visible pages:', Array.from(pages).filter(p => !p.classList.contains('hidden')).length);
    };
    
    // Additional safety check - ensure only one page is visible on load
    setTimeout(() => {
        let visiblePages = Array.from(pages).filter(p => !p.classList.contains('hidden'));
        if (visiblePages.length > 1) {
            console.warn('Multiple pages visible, fixing...');
            showPage(currentPage);
        }
    }, 100);
});
