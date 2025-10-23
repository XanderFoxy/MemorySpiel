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
// Festgelegt auf 12 Paare für ein 4x6 Grid, wie gewünscht
const MAX_PAIRS = 12; 
let matchedImages = []; 

// WICHTIG: Deine vorhandenen Pfade und BASE_URL bleiben UNVERÄNDERT.
const BASE_URL = 'https://xanderfoxy.github.io/MemorySpiel/Bilder/';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Diese Funktion wählt zufällig eine bestimmte Anzahl von Pfaden aus.
// maxPossibleImages wird nur für die zufällig nummerierten Ordner verwendet.
function selectRandomImagePaths(allPaths, count) {
    let shuffled = [...allPaths];
    shuffleArray(shuffled);
    return shuffled.slice(0, count);
}

// Die maximale Anzahl potenzieller Bilder pro Themenordner (BabyFox, ThroughTheYears) ist 20.
function generateNumberedPaths(folderName, maxPossibleImages = 20) {
    let allNumbers = [];
    for (let i = 1; i <= maxPossibleImages; i++) {
        allNumbers.push(`${folderName}/${i}.jpg`);
    }
    return allNumbers;
}

// --- NEUE, FESTE BILDER FÜR DEN ORDER 'InItalien' (Deine Pfade) ---
const IN_ITALIEN_FILES = [
    'InItalien/Al ven7.jpeg',
    'InItalien/IMG_0051.jpeg',
    'InItalien/IMG_0312.jpeg',
    'InItalien/IMG_6917.jpeg',
    'InItalien/IMG_8499.jpeg',
    'InItalien/IMG_9287.jpeg',
    'InItalien/IMG_9332.jpeg',
    'InItalien/IMG_9352.jpeg',
    'InItalien/IMG_9369.jpeg',
    'InItalien/IMG_9370.jpeg',
    'InItalien/IMG_9470.jpeg',
    'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg',
    'InItalien/IMG_9593.jpeg',
    'InItalien/IMG_9594.jpeg',
    'InItalien/IMG_9597.jpeg',
    'InItalien/IMG_9598.jpeg',
    'InItalien/IMG_9599.jpeg',
    'InItalien/QgNsMtTA.jpeg'
];
// --- ENDE NEUE BILDER ---

const gameConfigs = {
    'InItalien': {
        allImagePaths: IN_ITALIEN_FILES, // 19 Bilder
    },
    'BabyFox': { 
        allImagePaths: generateNumberedPaths('BabyFox', 20), // 20 Bilder
    },
    'ThroughTheYears': { 
        allImagePaths: generateNumberedPaths('ThroughTheYears', 20), // 20 Bilder
    },
    'Gemixt': { 
        // Für Gemixt werden die Pfade in setupGame gemischt
    }
};

let currentConfig = gameConfigs['InItalien']; 

themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        currentConfig = gameConfigs[theme];
        
        themeButtons.forEach(btn => {
            btn.style.backgroundColor = 'var(--card-back-color)'; // Dunkles Rot
            btn.style.color = 'white';
        });
        e.target.style.backgroundColor = 'var(--secondary-color)'; // Gelb
        e.target.style.color = 'var(--primary-color)'; // Dunkles Lila
        
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
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    // Setze das Grid immer auf 4 Reihen und 6 Spalten für 24 Karten
    memoryGrid.style.gridTemplateColumns = `repeat(6, 1fr)`;
    memoryGrid.style.maxWidth = '680px'; // Feste Breite für das Grid 

    let selectedPaths = [];
    
    if (currentConfig.allImagePaths) {
        // Wählt 12 zufällige Pfade aus den verfügbaren Bildern des Themas
        selectedPaths = selectRandomImagePaths(currentConfig.allImagePaths, MAX_PAIRS);
    } else if (currentConfig.allImagePaths === undefined && currentConfig.name === 'Gemixt') {
        // Gemixtes Thema
        const otherFolders = ['BabyFox', 'ThroughTheYears', 'InItalien'];
        let allPaths = [];
        
        // Sammle alle möglichen Pfade aus allen Themen (mindestens 19+20+20 = 59)
        otherFolders.forEach(folderName => {
             const config = gameConfigs[folderName];
             if (config) {
                 allPaths = allPaths.concat(config.allImagePaths);
             }
        });

        // Wähle 12 zufällige Pfade aus dem großen Pool
        selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);
    }
    
    let gameCardValues = []; 
    // Erstelle die Paare
    selectedPaths.forEach(fullPath => {
        gameCardValues.push(fullPath, fullPath); 
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
    // Prüfe gegen die feste MAX_PAIRS
    if (pairsFound === MAX_PAIRS) { 
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
    // Leere die Galerie für das nächste Spiel, wenn es neu gestartet wird
    matchedImages = []; 
}

closeGalleryButton.addEventListener('click', () => {
    galleryOverlay.classList.remove('active');
    setupGame(); 
});

document.addEventListener('DOMContentLoaded', () => {
    // Initiales Styling für den Start-Button
    const initialButton = document.querySelector('.theme-button[data-theme="InItalien"]');
    if (initialButton) {
        initialButton.style.backgroundColor = 'var(--secondary-color)';
        initialButton.style.color = 'var(--primary-color)';
    }
    setupGame();
});
