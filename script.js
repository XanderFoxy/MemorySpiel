const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const themeButtons = document.querySelectorAll('.theme-button');
const galleryImagesContainer = document.getElementById('gallery-images');

const soundMatch = document.getElementById('sound-match');
const soundError = document.getElementById('sound-error');
const soundWin = document.getElementById('sound-win');

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let pairsFound = 0;
const maxPairs = 12; // Feste Größe für ein klassisches 6x4 Memory
let matchedImages = []; 
const GRID_COLUMNS = 6; // 6x4 Grid
const CARDS_TO_SELECT = 12; // 12 Paare

const BASE_URL = 'https://xanderfoxy.github.io/MemorySpiel/Bilder/';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- FESTE BILDER FÜR DEN ORDER 'InItalien' (zur Auswahl von 12) ---
const IN_ITALIEN_FILES = [
    'InItalien/Al ven7.jpeg', 'InItalien/IMG_0051.jpeg', 'InItalien/IMG_0312.jpeg',
    'InItalien/IMG_6917.jpeg', 'InItalien/IMG_8499.jpeg', 'InItalien/IMG_9287.jpeg',
    'InItalien/IMG_9332.jpeg', 'InItalien/IMG_9352.jpeg', 'InItalien/IMG_9369.jpeg',
    'InItalien/IMG_9370.jpeg', 'InItalien/IMG_9470.jpeg', 'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg', 'InItalien/IMG_9593.jpeg', 'InItalien/IMG_9594.jpeg',
    'InItalien/IMG_9597.jpeg', 'InItalien/IMG_9598.jpeg', 'InItalien/IMG_9599.jpeg',
    'InItalien/QgNsMtTA.jpeg'
];
// --- ENDE NEUE BILDER ---

// Generische Funktion zur Auswahl einer festen Anzahl an Bildpfaden
function getSelectedImagePaths(folderName, allPossibleImages) {
    // Wenn es feste Pfade gibt (InItalien), nutze diese als Basis, ansonsten generiere Pfade
    let possiblePaths = allPossibleImages ? allPossibleImages.slice() : [];

    if (!allPossibleImages) {
         // Generiert Pfade, falls keine feste Liste existiert (für BabyFox, ThroughTheYears, Gemixt)
        const maxPossibleImages = 20; 
        for (let i = 1; i <= maxPossibleImages; i++) {
            possiblePaths.push(`${folderName}/${i}.jpg`);
        }
    }
    
    shuffleArray(possiblePaths);
    // Wählt immer 12 zufällige Pfade aus der verfügbaren Liste
    return possiblePaths.slice(0, CARDS_TO_SELECT);
}

const gameConfigs = {
    'InItalien': {
        folderName: 'InItalien', 
        allImages: IN_ITALIEN_FILES 
    },
    'BabyFox': { 
        folderName: 'BabyFox'
    },
    'ThroughTheYears': { 
        folderName: 'ThroughTheYears'
    },
    'Gemixt': { 
        folderName: 'Gemixt' // Wird in setupGame separat behandelt
    }
};

let currentConfig = gameConfigs['InItalien']; // Startet mit InItalien

themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        currentConfig = gameConfigs[theme];
        
        // Button-Highlighting
        themeButtons.forEach(btn => {
            btn.classList.remove('active-theme');
        });
        e.target.classList.add('active-theme');
        
        setupGame();
    });
});

function setupGame() {
    memoryGrid.innerHTML = '';
    cards = [];
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    pairsFound = 0;
    matchedImages = [];
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    // Setzt das Grid fest auf 6 Spalten für 24 Karten (6x4)
    memoryGrid.style.gridTemplateColumns = `repeat(${GRID_COLUMNS}, 1fr)`;

    let selectedPaths;
    
    if (currentConfig.folderName === 'Gemixt') {
        const otherFolders = ['BabyFox', 'ThroughTheYears', 'InItalien']; 
        let allPaths = [];
        
        // Sammelt alle möglichen Pfade aus allen Ordnern
        otherFolders.forEach(folder => {
            const possibleImages = (folder === 'InItalien') ? IN_ITALIEN_FILES : null;
            const paths = getSelectedImagePaths(folder, possibleImages);
            allPaths = allPaths.concat(paths);
        });

        // Wählt 12 zufällige, gemischte Pfade aus allen gesammelten Pfaden
        shuffleArray(allPaths);
        selectedPaths = allPaths.slice(0, CARDS_TO_SELECT);
    } else {
        // Wählt 12 zufällige Pfade aus dem aktuellen Thema
        selectedPaths = getSelectedImagePaths(currentConfig.folderName, currentConfig.allImages);
    }

    let gameCardValues = []; 
    selectedPaths.forEach(fullPath => {
        gameCardValues.push(fullPath, fullPath); // Jedes Bild doppelt
    });

    shuffleArray(gameCardValues);

    gameCardValues.forEach(fullPath => { 
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.path = fullPath; 

        const imageURL = `${BASE_URL}${fullPath}`;

        card.innerHTML = `
            <img class="front-face" src="${imageURL}" alt="Memory Bild">
            <span class="back-face">🦊</span>
        `;

        card.addEventListener('click', flipCard);
        memoryGrid.appendChild(card);
        cards.push(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains('match')) return;
    this.classList.add('flip');
    if (!firstCard) {
        firstCard = this;
        return;
    }
    secondCard = this;
    moves++;
    statsMoves.textContent = `Züge: ${moves}`;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.path === secondCard.dataset.path;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    pairsFound++;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    soundMatch.play();
    firstCard.classList.add('match');
    secondCard.classList.add('match');
    const matchedImageSrc = firstCard.querySelector('.front-face').src;
    matchedImages.push(matchedImageSrc);
    showMatchSuccess(matchedImageSrc);
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
    if (pairsFound === maxPairs) {
        setTimeout(gameOver, 1000); 
    }
}

function unflipCards() {
    lockBoard = true; 
    soundError.play();
    firstCard.classList.add('error');
    secondCard.classList.add('error');
    setTimeout(() => {
        firstCard.classList.remove('flip', 'error');
        secondCard.classList.remove('flip', 'error');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function showMatchSuccess(imageSrc) {
    matchedImagePreview.src = imageSrc;
    matchSuccessOverlay.classList.add('active');
    setTimeout(() => {
        matchSuccessOverlay.classList.remove('active');
    }, 1500);
}

function gameOver() {
    soundWin.play();
    galleryImagesContainer.innerHTML = '';
    matchedImages.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Gefundenes Bild';
        galleryImagesContainer.appendChild(img);
    });
    galleryOverlay.classList.add('active');
}

closeGalleryButton.addEventListener('click', () => {
    galleryOverlay.classList.remove('active');
    setupGame(); 
});

document.addEventListener('DOMContentLoaded', () => {
    // Setzt das initiale Theme-Highlight
    const initialButton = document.querySelector('.theme-button[data-theme="InItalien"]');
    if (initialButton) {
        initialButton.classList.add('active-theme');
    }
    setupGame();
});
