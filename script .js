// script.js

// --- Global Music Toggle ---
const audio = new Audio('music/lofi.mp3'); // Path to your music file
audio.loop = true;
let isPlaying = false;

function toggleMusic() {
    const musicIcon = document.getElementById('music-icon');
    if (isPlaying) {
        audio.pause();
        musicIcon.textContent = '🔇';
    } else {
        audio.play().catch(e => console.log("Autoplay prevented:", e));
        musicIcon.textContent = '🎵';
    }
    isPlaying = !isPlaying;
}

// Attach event listener when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', toggleMusic);
    }

    // Attempt to play music automatically, if allowed by browser
    // This often requires user interaction first, so toggleMusic handles the main interaction.
    audio.play().then(() => {
        isPlaying = true;
        if (musicToggleBtn) musicToggleBtn.querySelector('span').textContent = '🎵';
    }).catch(e => {
        console.log("Autoplay blocked. User needs to click play.", e);
        isPlaying = false;
        if (musicToggleBtn) musicToggleBtn.querySelector('span').textContent = '🔇';
    });
});


// --- Scratch Card Logic (for scratch.html) ---
let scratchCardsRevealed = 0;
const totalScratchCards = 3; // Update this based on how many cards you have

// Function to initialize a single scratch card
function initScratchCard(canvas, scratchImageSrc, revealedContent) {
    const ctx = canvas.getContext('2d');
    const cardContainer = canvas.parentElement;
    const contentDiv = cardContainer.querySelector('.content');

    let isScratching = false;
    let revealedPixels = 0;
    const revealThreshold = 0.5; // Percentage of pixels to reveal to trigger full reveal

    // Load the scratch image (overlay)
    const scratchImage = new Image();
    scratchImage.src = scratchImageSrc; // e.g., 'images/scratch_texture.png' - You can create a grey texture or use a simple color overlay
    scratchImage.onload = () => {
        ctx.drawImage(scratchImage, 0, 0, canvas.width, canvas.height);
        // Fallback if no scratchImage: fill with a solid color
        // ctx.fillStyle = 'lightgray';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function drawScratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out'; // This is the magic for "scratching"
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2, false); // Adjust 20 for scratch radius
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
    }

    function calculateRevealed() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) { // Check alpha channel
                transparentPixels++;
            }
        }
        revealedPixels = transparentPixels / (pixels.length / 4);
        if (revealedPixels > revealThreshold) {
            fullyReveal();
        }
    }

    function fullyReveal() {
        if (!cardContainer.classList.contains('revealed')) {
            cardContainer.classList.add('revealed');
            contentDiv.style.opacity = 1; // Show the content
            canvas.style.display = 'none'; // Hide the canvas
            scratchCardsRevealed++;
            checkAllCardsRevealed();
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        isScratching = true;
        drawScratch(getMousePos(canvas, e).x, getMousePos(canvas, e).y);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isScratching) return;
        drawScratch(getMousePos(canvas, e).x, getMousePos(canvas, e).y);
        calculateRevealed();
    });

    canvas.addEventListener('mouseup', () => {
        isScratching = false;
        calculateRevealed();
    });

    canvas.addEventListener('mouseleave', () => {
        isScratching = false;
    });

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling while scratching
        isScratching = true;
        const touch = e.touches[0];
        drawScratch(getMousePos(canvas, touch).x, getMousePos(canvas, touch).y);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling while scratching
        if (!isScratching) return;
        const touch = e.touches[0];
        drawScratch(getMousePos(canvas, touch).x, getMousePos(canvas, touch).y);
        calculateRevealed();
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        isScratching = false;
        calculateRevealed();
    });
}

// Lottie Animation setup (Requires lottie.js, linked in HTML)
function playConfetti() {
    const confettiContainer = document.getElementById('confetti-animation');
    if (confettiContainer && typeof lottie !== 'undefined') {
        confettiContainer.style.display = 'block';
        const animation = lottie.loadAnimation({
            container: confettiContainer,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: 'lottie/confetti.json' // Path to your Lottie JSON file
        });
        animation.onComplete = () => {
            confettiContainer.style.display = 'none'; // Hide after animation
            animation.destroy(); // Clean up
        };
    } else {
        console.warn("Lottie or confetti container not found. Confetti won't play.");
    }
}

// Check if all scratch cards are revealed
function checkAllCardsRevealed() {
    if (scratchCardsRevealed === totalScratchCards) {
        console.log("All cards revealed!");
        playConfetti(); // Trigger confetti when all cards are revealed
        // You could also show a "Next Page" button here
        const nextPageBtn = document.getElementById('next-page-after-scratch');
        if (nextPageBtn) {
             nextPageBtn.style.display = 'inline-block'; // Show the button
        }
    }
}


// Initialize scratch cards on the scratch.html page
if (window.location.pathname.includes('scratch.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const card1Canvas = document.getElementById('scratch-canvas-1');
        const card2Canvas = document.getElementById('scratch-canvas-2');
        const card3Canvas = document.getElementById('scratch-canvas-3');

        if (card1Canvas) initScratchCard(card1Canvas, 'images/scratch_overlay.png', "You're amazing!");
        if (card2Canvas) initScratchCard(card2Canvas, 'images/scratch_overlay.png', "Best laugh ever!");
        if (card3Canvas) initScratchCard(card3Canvas, 'images/scratch_overlay.png', "My coding inspiration!");
        // Add more as needed
    });
}

// Function to handle click to reveal for memory photos (memories.html)
function revealMemoryDetails(element) {
    const caption = element.querySelector('.memory-caption');
    // Toggle the display or add/remove a class that controls visibility
    // For now, the CSS hover handles showing the caption.
    // If you want an *additional* click to show, you'd add more logic here.
    // E.g., if (caption.style.transform === 'translateY(0%)') { caption.style.transform = 'translateY(100%)'; } else { caption.style.transform = 'translateY(0%)'; }
}
