Const memoryGrid = document.querySelector('.memory-grid');
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
let maxPairs = 12; // Feste Größe für das klassische 4x6 Memory
let matchedImages = []; 

const BASE_URL = 'https://xanderfoxy.github.io/MemorySpiel/Bilder/';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Wählt zufällig 'count' Pfade aus dem Array 'allPaths' aus.
function selectRandomPaths(allPaths, count) {
    shuffleArray(allPaths);
    return allPaths.slice(0, count);
}

// Die maximale Anzahl potenzieller Bilder pro Themenordner (BabyFox, ThroughTheYears) ist 20.
function getRandomImagePaths(folderName, maxPossibleImages = 20) {
    let allNumbers = [];
    for (let i = 1; i <= maxPossibleImages; i++) {
        allNumbers.push(`${folderName}/${i}.jpg`);
    }
    return allNumbers;
}

// --- FESTE BILDER FÜR DEN ORDER 'InItalien' ---
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
// --- ENDE BILDER ---

const PAIR_COUNT = 12; // Immer 12 Paare für das 4x6 Grid

const gameConfigs = {
    'InItalien': {
        type: 'fixed',
        allImagePaths: IN_ITALIEN_FILES 
    },
    'BabyFox': { 
        type: 'folder',
        folderName: 'BabyFox',
        maxPossibleImages: 20
    },
    'ThroughTheYears': { 
        type: 'folder',
        folderName: 'ThroughTheYears',
        maxPossibleImages: 20
    },
    'Gemixt': { 
        type: 'mixed',
        folders: ['BabyFox', 'ThroughTheYears']
    }
};

let currentConfig = gameConfigs['InItalien']; 

themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        currentConfig = gameConfigs[theme];
        
        // Fügt das visuelle Feedback für den aktiven Button hinzu
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
    maxPairs = PAIR_COUNT; 
    matchedImages = [];
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    // WICHTIG: Die Spaltenanzahl wird NICHT mehr hier festgelegt,
    // sondern vollständig vom responsive CSS gesteuert.

    let selectedPaths = [];
    
    // Logik zur Auswahl der 12 Paare
    if (currentConfig.type === 'mixed') {
        let allPaths = [];
        currentConfig.folders.forEach(folder => {
            allPaths = allPaths.concat(getRandomImagePaths(folder, 20));
        });
        selectedPaths = selectRandomPaths(allPaths, PAIR_COUNT);

    } else if (currentConfig.type === 'fixed') {
        selectedPaths = selectRandomPaths(currentConfig.allImagePaths, PAIR_COUNT);

    } else if (currentConfig.type === 'folder') {
        const allPaths = getRandomImagePaths(currentConfig.folderName, currentConfig.maxPossibleImages);
        selectedPaths = selectRandomPaths(allPaths, PAIR_COUNT);
    }
    
    // Sicherheitsprüfung, falls zu wenige Bilder verfügbar sind
    if (selectedPaths.length !== PAIR_COUNT) {
        // Dies sollte nur passieren, wenn in einem Ordner weniger als 12 Bilder sind.
        console.error(`FEHLER: Konnte nicht die erforderliche Anzahl von Bildpfaden (${PAIR_COUNT}) abrufen. (${selectedPaths.length} gefunden)`);
        memoryGrid.innerHTML = '<p style="color:red; text-align:center;">Fehler beim Laden: Es wurden nicht genügend einzigartige Bilder für dieses Thema gefunden.</p>';
        return; 
    }


    let gameCardValues = []; 
    selectedPaths.forEach(fullPath => {
        gameCardValues.push(fullPath, fullPath); // Dupliziert für Paare
    });
    
    shuffleArray(gameCardValues);

    // ERSTELLUNG UND EINFÜGEN DER KARTE
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
    const initialButton = document.querySelector('.theme-button[data-theme="InItalien"]');
    if (initialButton) {
        initialButton.classList.add('active-theme');
    }
    setupGame();
});
