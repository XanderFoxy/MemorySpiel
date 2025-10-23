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

// Die maximale Anzahl potenzieller Bilder pro Themenordner (BabyFox, ThroughTheYears) ist 20.
function getRandomImagePaths(folderName, maxPossibleImages = 20) {
    let allNumbers = [];
    for (let i = 1; i <= maxPossibleImages; i++) {
        allNumbers.push(`${folderName}/${i}.jpg`);
    }
    shuffleArray(allNumbers);
    return allNumbers.slice(0, 12);
}

// --- NEUE, FESTE BILDER FÜR DEN ORDER 'InItalien' ---
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
        imageCount: IN_ITALIEN_FILES.length, // Nutzt alle 19 Bilder für das Spiel
        gridColumns: 5, // Passt das Grid an (4x5 = 20, 4x4 = 16) -> 19 Paare geht nicht ganz auf, 
        imagePaths: IN_ITALIEN_FILES 
    },
    'BabyFox': { 
        imageCount: 12, 
        gridColumns: 6, 
        folderName: 'BabyFox'
    },
    'ThroughTheYears': { 
        imageCount: 12, 
        gridColumns: 6,
        folderName: 'ThroughTheYears'
    },
    'Gemixt': { 
        imageCount: 12, 
        gridColumns: 6,
        folderName: 'Gemixt'
    }
};

let currentConfig = gameConfigs['InItalien']; 
maxPairs = currentConfig.imageCount; // Setzt maxPairs korrekt für das Initialthema

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
    
    // Setzt maxPairs basierend auf der Konfiguration
    if (currentConfig.imagePaths) {
         // Für InItalien: alle Bilder verwenden
        maxPairs = currentConfig.imagePaths.length;
    } else {
        // Für BabyFox, ThroughTheYears, Gemixt: 12 Paare
        maxPairs = 12;
    }
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    // Wenn die Anzahl der Paare ungerade ist (wie 19), verwenden wir das nächste gerade Grid (4x5=20)
    let totalCards = maxPairs * 2;
    let effectiveGridColumns = currentConfig.gridColumns;
    if (totalCards > 24 && currentConfig.folderName === 'InItalien') {
        // 19 Paare = 38 Karten. 6x4 Grid ist zu klein (24). Wir verwenden 6x7 = 42
        effectiveGridColumns = 7; 
        memoryGrid.style.gridTemplateColumns = `repeat(${effectiveGridColumns}, 1fr)`;
    } else {
        memoryGrid.style.gridTemplateColumns = `repeat(${effectiveGridColumns}, 1fr)`;
    }


    let selectedPaths;
    
    if (currentConfig.folderName === 'Gemixt') {
        const otherFolders = ['BabyFox', 'ThroughTheYears']; // InItalien wird nicht gemischt
        let allPaths = [];
        
        otherFolders.forEach(folder => {
            const paths = getRandomImagePaths(folder, 20); 
            allPaths = allPaths.concat(paths);
        });

        shuffleArray(allPaths);
        // Bei Gemixt immer 12 Paare
        selectedPaths = allPaths.slice(0, 12);
    } else if (currentConfig.imagePaths) {
        // Feste Pfade (InItalien) - Alle verwenden
        selectedPaths = currentConfig.imagePaths;
    } else {
        // Zufällige Pfade (BabyFox, ThroughTheYears) - 12 von 20
        selectedPaths = getRandomImagePaths(currentConfig.folderName, 20);
    }

    let gameCardValues = []; 
    selectedPaths.forEach(fullPath => {
        gameCardValues.push(fullPath, fullPath); 
    });
    
    // Hinzufügen einer Platzhalterkarte, falls die Anzahl ungerade ist (z.B. 19 Paare = 38 Karten)
    if (gameCardValues.length % 2 !== 0) {
        // Um ein ungerades Paar zu vermeiden, entfernen wir das letzte Bild, 
        // oder Sie könnten eine dritte Karte für ein "Triple" hinzufügen,
        // aber das würde die Spielmechanik ändern. Wir entfernen hier das letzte Bild.
        gameCardValues.pop();
        maxPairs = (gameCardValues.length / 2);
    }

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
