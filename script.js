document.addEventListener('DOMContentLoaded', function() {
    // Variables
    let currentPage = 0;
   const totalPages = 27; // Total number of pages (1 cover + 1 acknowledgement + 1 index + 18 letters + 1 back cover)
    //const totalPages = document.querySelectorAll('.page').length;
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
        const indexPage = document.querySelector('.index-page ol');
        if (!indexPage) return;
        
        const indexItems = indexPage.querySelectorAll('li');
        indexItems.forEach((item, index) => {
            // Add clickable class
            item.classList.add('index-link');
            
            // Add click event
            item.addEventListener('click', () => {
                const targetPage = index + 3; // Offset for cover, acknowledgement, index
                goToPage(targetPage);
            });
        });
    }
    
    // Go to specific page
    function goToPage(targetPage) {
        if (isAnimating || targetPage === currentPage) return;
        
        if (targetPage > currentPage) {
            // Forward sequence
            turnPagesSequence(targetPage, 'forward');
        } else {
            // Backward sequence
            turnPagesSequence(targetPage, 'backward');
        }
    }
    
    // Turn pages in sequence
    function turnPagesSequence(targetPage, direction) {
        let sequenceRunning = true;
        let currentSequencePage = currentPage;
        
        function turnNextInSequence() {
            if (sequenceRunning) {
                if ((direction === 'forward' && currentSequencePage < targetPage) || 
                    (direction === 'backward' && currentSequencePage > targetPage)) {
                    
                    if (direction === 'forward') {
                        performPageTurn(currentSequencePage, 'right');
                        currentSequencePage++;
                    } else {
                        performPageTurn(currentSequencePage, 'left');
                        currentSequencePage--;
                    }
                    
                    // Schedule next page turn
                    setTimeout(turnNextInSequence, 600);
                } else {
                    sequenceRunning = false;
                    currentPage = targetPage;
                    updatePageNumber();
                }
            }
        }
        
        // Start the sequence
        turnNextInSequence();
    }
    
    // Functions for navigation
    function nextPage() {
        if (isAnimating || currentPage >= totalPages - 1) return;
        
        performPageTurn(currentPage, 'right');
        currentPage++;
        updatePageNumber();
        
        // Play sound
        playPageTurnSound();
    }
    
    function previousPage() {
        if (isAnimating || currentPage <= 0) return;
        
        performPageTurn(currentPage, 'left');
        currentPage--;
        updatePageNumber();
        
        // Play sound
        playPageTurnSound();
    }
    
    function performPageTurn(pageIndex, direction) {
        if (isAnimating) return;
        isAnimating = true;
        
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
        
        // Take screenshots or copy content
        if (direction === 'right') {
            frontPage.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`;
            backPage.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`;
            
            // Add page content if needed
            // frontPage.textContent = pages[pageIndex].textContent;
            // backPage.textContent = pages[pageIndex + 1].textContent;
        } else {
            frontPage.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`;
            backPage.style.backgroundImage = `url('data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f3e9d8" /></svg>')}')`;
            
            // Add page content if needed
            // frontPage.textContent = pages[pageIndex].textContent;
            // backPage.textContent = pages[pageIndex - 1].textContent;
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
            
            // Show next page behind the animation
            setTimeout(() => {
                pages[pageIndex].classList.add('hidden');
                pages[pageIndex + 1].classList.remove('hidden');
            }, 600); // Half of animation time
        } else {
            pageFlipContainer.classList.add('turning-left');
            pageFlipContainer.classList.remove('turning-right');
            
            // Show previous page behind the animation
            setTimeout(() => {
                pages[pageIndex].classList.add('hidden');
                pages[pageIndex - 1].classList.remove('hidden');
            }, 600); // Half of animation time
        }
        
        // Clear animation after it completes
        setTimeout(() => {
            pageFlipContainer.innerHTML = '';
            pageFlipContainer.classList.remove('turning-right', 'turning-left');
            isAnimating = false;
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
    
    function updatePageNumber() {
        // Don't show page number on cover or back cover
        if (currentPage === 0 || currentPage === totalPages - 1) {
            pageNumber.textContent = '';
        } else {
            // Page numbers start at 1 for users
            pageNumber.textContent = `${currentPage} / ${totalPages - 2}`;
        }
        
        // Update page corner visibility
        leftFold.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
        rightFold.style.visibility = currentPage < totalPages - 1 ? 'visible' : 'hidden';
    }
});
