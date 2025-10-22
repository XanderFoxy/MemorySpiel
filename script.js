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
let maxPairs = 0;
let matchedImages = []; 

const BASE_URL = 'https://xanderfoxy.github.io/MemorySpiel/Bilder/';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const IN_ITALIEN_FILES = [
    'InItalien/1.jpg', 'InItalien/2.jpg', 'InItalien/3.jpg', 'InItalien/4.jpg', 
    'InItalien/5.jpg', 'InItalien/6.jpg', 'InItalien/7.jpg', 'InItalien/8.jpg', 
    'InItalien/9.jpg', 'InItalien/10.jpg', 'InItalien/11.jpg', 'InItalien/12.jpg'
];

const BABY_FOX_FILES = [
    'BabyFox/1.jpg', 'BabyFox/2.jpg', 'BabyFox/3.jpg', 'BabyFox/4.jpg', 
    'BabyFox/5.jpg', 'BabyFox/6.jpg', 'BabyFox/7.jpg', 'BabyFox/8.jpg', 
    'BabyFox/9.jpg', 'BabyFox/10.jpg', 'BabyFox/11.jpg', 'BabyFox/12.jpg'
];

const THROUGH_THE_YEARS_FILES = [
    'ThroughTheYears/1.jpg', 'ThroughTheYears/2.jpg', 'ThroughTheYears/3.jpg', 'ThroughTheYears/4.jpg', 
    'ThroughTheYears/5.jpg', 'ThroughTheYears/6.jpg', 'ThroughTheYears/7.jpg', 'ThroughTheYears/8.jpg', 
    'ThroughTheYears/9.jpg', 'ThroughTheYears/10.jpg', 'ThroughTheYears/11.jpg', 'ThroughTheYears/12.jpg'
];

const ALL_THEME_PATHS = [
    ...IN_ITALIEN_FILES,
    ...BABY_FOX_FILES,
    ...THROUGH_THE_YEARS_FILES
];

const gameConfigs = {
    'InItalien': {
        imageCount: 12, 
        gridColumns: 6,
        imagePaths: IN_ITALIEN_FILES
    },
    'BabyFox': { 
        imageCount: 12, 
        gridColumns: 6, 
        imagePaths: BABY_FOX_FILES
    },
    'ThroughTheYears': { 
        imageCount: 12, 
        gridColumns: 6,
        imagePaths: THROUGH_THE_YEARS_FILES
    },
    'Gemixt': { 
        imageCount: 12, 
        gridColumns: 6,
        imagePaths: ALL_THEME_PATHS
    }
};

let currentConfig = gameConfigs['InItalien']; 

themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        currentConfig = gameConfigs[theme];
        
        themeButtons.forEach(btn => {
            btn.style.backgroundColor = '#4a4387';
            btn.style.color = 'white';
        });
        e.target.style.backgroundColor = '#f7b731';
        e.target.style.color = '#5d54a4';
        
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
    maxPairs = currentConfig.imageCount;
    matchedImages = [];
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    memoryGrid.style.gridTemplateColumns = `repeat(${currentConfig.gridColumns}, 1fr)`;

    let selectedPaths;
    
    if (currentConfig.imagePaths === ALL_THEME_PATHS) {
        let shuffledAllPaths = [...ALL_THEME_PATHS];
        shuffleArray(shuffledAllPaths);
        // Wähle 12 zufällige Pfade aus allen Themen aus
        selectedPaths = shuffledAllPaths.slice(0, 12);
    } else {
        selectedPaths = currentConfig.imagePaths;
    }

    let gameCardValues = []; 
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
            <span class="back-face"><i class="fas fa-question-circle"></i></span>
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
        initialButton.style.backgroundColor = '#f7b731';
        initialButton.style.color = '#5d54a4';
    }
    setupGame();
});
