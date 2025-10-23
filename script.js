const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const themeButtons = document.querySelectorAll('.theme-button');
const difficultyButtons = document.querySelectorAll('.difficulty-button'); // NEU: Schwierigkeitsbuttons
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
let matchedImages = []; 

// NEU: Schwierigkeitskonfiguration
const difficultyConfigs = {
    'easy': { pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '440px' }, // 4x4 Grid
    'medium': { pairs: 12, columns: 6, cardsTotal: 24, gridMaxW: '680px' }, // 4x6 Grid
    'hard': { pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '680px' }  // 6x6 Grid
};

let currentDifficulty = difficultyConfigs['medium']; // Standard: Mittel

// WICHTIG: Deine vorhandenen Pfade und BASE_URL bleiben UNVERÄNDERT.
const BASE_URL = 'https://xanderfoxy.github.io/MemorySpiel/Bilder/';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Diese Funktion wählt zufällig eine bestimmte Anzahl von Pfaden aus.
function selectRandomImagePaths(allPaths, count) {
    // Stellen Sie sicher, dass genügend Bilder vorhanden sind
    if (allPaths.length < count) {
        console.error(`Nicht genug Bilder (${allPaths.length}) für ${count} Paare verfügbar!`);
        // Im Fehlerfall so viele Paare wie möglich verwenden
        count = allPaths.length;
    }
    let shuffled = [...allPaths];
    shuffleArray(shuffled);
    return shuffled.slice(0, count);
}

// Die maximale Anzahl potenzieller Bilder pro Themenordner ist 20.
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
    'InItalien/QgNsMtTA.jpeg' // Total 19 Bilder
];
// --- ENDE NEUE BILDER ---

const gameConfigs = {
    'InItalien': {
        allImagePaths: IN_ITALIEN_FILES, 
        name: 'InItalien'
    },
    'BabyFox': { 
        allImagePaths: generateNumberedPaths('BabyFox', 20),
        name: 'BabyFox'
    },
    'ThroughTheYears': { 
        allImagePaths: generateNumberedPaths('ThroughTheYears', 20),
        name: 'ThroughTheYears'
    },
    'Gemixt': { 
        // wird unten gefüllt
        name: 'Gemixt'
    }
};

let currentThemeConfig = gameConfigs['InItalien']; 


// Event Listener für Schwierigkeit
difficultyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const difficulty = e.target.dataset.difficulty;
        currentDifficulty = difficultyConfigs[difficulty];
        
        difficultyButtons.forEach(btn => btn.classList.remove('active-difficulty'));
        e.target.classList.add('active-difficulty');
        
        setupGame();
    });
});

// Event Listener für Thema
themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        currentThemeConfig = gameConfigs[theme];
        
        themeButtons.forEach(btn => btn.classList.remove('active-theme'));
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
    
    // Setze maxPairs basierend auf der gewählten Schwierigkeit
    const MAX_PAIRS = currentDifficulty.pairs; 
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    // Setze das Grid basierend auf der Schwierigkeit
    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    let selectedPaths;
    
    if (currentThemeConfig.name === 'Gemixt') {
        const otherFolders = ['BabyFox', 'ThroughTheYears', 'InItalien'];
        let allPaths = [];
        
        otherFolders.forEach(folderName => {
             const config = gameConfigs[folderName];
             if (config && config.allImagePaths) {
                 allPaths = allPaths.concat(config.allImagePaths);
             }
        });

        // Wähle die benötigte Anzahl zufälliger Paare aus dem großen Pool
        selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);

    } else if (currentThemeConfig.allImagePaths) {
        // Wählt die benötigte Anzahl zufälliger Paare aus dem aktuellen Themen-Pool
        selectedPaths = selectRandomImagePaths(currentThemeConfig.allImagePaths, MAX_PAIRS);
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
    
    // Prüfe gegen die aktuelle MAX_PAIRS der Schwierigkeit
    if (pairsFound === currentDifficulty.pairs) { 
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
    matchedImages = []; 
}

closeGalleryButton.addEventListener('click', () => {
    galleryOverlay.classList.remove('active');
    setupGame(); 
});

document.addEventListener('DOMContentLoaded', () => {
    // Initiales Styling für den Start-Button (Thema)
    const initialThemeButton = document.querySelector('.theme-button[data-theme="InItalien"]');
    if (initialThemeButton) {
        initialThemeButton.classList.add('active-theme');
    }
    // Initiales Styling für den Start-Button (Schwierigkeit)
    const initialDifficultyButton = document.querySelector('.difficulty-button[data-difficulty="medium"]');
     if (initialDifficultyButton) {
        initialDifficultyButton.classList.add('active-difficulty');
    }

    setupGame();
});
