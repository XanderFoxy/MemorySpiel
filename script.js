const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const themeButtons = document.querySelectorAll('.theme-button');
const galleryImagesContainer = document.getElementById('gallery-images');

// NEU: Slider Elemente
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDescription = document.getElementById('difficulty-description');

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

// NEU: Schwierigkeitskonfiguration über Slider-Werte (1, 2, 3)
const difficultyConfigs = {
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '440px' }, // 4x4 Grid
    '2': { name: 'Mittel', pairs: 12, columns: 6, cardsTotal: 24, gridMaxW: '680px' }, // 4x6 Grid
    '3': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '680px' }  // 6x6 Grid
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; // Start: Mittel

const BASE_URL = 'https://xanderfoxy.github.io/MemorySpiel/Bilder/';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectRandomImagePaths(allPaths, count) {
    if (allPaths.length < count) {
        console.warn(`Nicht genug Bilder (${allPaths.length}) für ${count} Paare verfügbar. Reduziere auf ${allPaths.length} Paare.`);
        count = allPaths.length;
    }
    let shuffled = [...allPaths];
    shuffleArray(shuffled);
    return shuffled.slice(0, count);
}

function generateNumberedPaths(folderName, maxPossibleImages = 20) {
    let allNumbers = [];
    for (let i = 1; i <= maxPossibleImages; i++) {
        allNumbers.push(`${folderName}/${i}.jpg`);
    }
    return allNumbers;
}

// --- DEINE BILDERPFADE ---
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
// --- ENDE BILDERPFADE ---

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
        // Für Gemixt werden die Pfade in setupGame dynamisch ermittelt
        name: 'Gemixt'
    }
};

let currentThemeConfig = gameConfigs['InItalien']; 

// Event Listener für Slider (Schwierigkeit)
difficultySlider.addEventListener('input', (e) => {
    currentDifficulty = difficultyConfigs[e.target.value];
    difficultyDescription.textContent = `${currentDifficulty.name} (${currentDifficulty.pairs} Paare)`;
});

difficultySlider.addEventListener('change', () => {
    setupGame(); // Spiel neu starten, wenn Slider losgelassen wird
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
    matchedImages = []; // Wichtig: Galerie für neues Spiel leeren
    
    // Aktuelle Schwierigkeitseinstellungen verwenden
    const MAX_PAIRS = currentDifficulty.pairs; 
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    // Setze das Grid basierend auf der Schwierigkeit
    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    // Dies muss im CSS richtig behandelt werden, aber wir setzen den Maximalwert hier.
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    let selectedPaths = [];
    
    if (currentThemeConfig.name === 'Gemixt') {
        const otherFolders = ['BabyFox', 'ThroughTheYears', 'InItalien'];
        let allPaths = [];
        
        otherFolders.forEach(folderName => {
             const config = gameConfigs[folderName];
             // KORREKTUR: Sicherstellen, dass die Pfade vorhanden sind, bevor sie hinzugefügt werden
             if (config && config.allImagePaths) {
                 allPaths = allPaths.concat(config.allImagePaths);
             }
        });
        
        // **KORREKTUR** Die allImagePaths sind im Gemixt-Objekt nicht definiert, sie werden hier gesammelt.
        selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);

    } else if (currentThemeConfig.allImagePaths) {
        // Wählt die benötigte Anzahl zufälliger Paare aus dem aktuellen Themen-Pool
        selectedPaths = selectRandomImagePaths(currentThemeConfig.allImagePaths, MAX_PAIRS);
    }
    
    // **KORREKTUR** Falls selectedPaths leer ist (z.B. bei Gemixt-Fehler), wird hier nichts ausgeführt
    if (selectedPaths.length === 0) {
        console.error("Es konnten keine Bilder für das Spiel geladen werden.");
        // Ggf. eine Fehlermeldung auf dem Spielfeld anzeigen
        memoryGrid.innerHTML = '<p style="color:red; grid-column: 1 / -1;">Fehler: Konnte keine Bilder laden. Bitte Thema prüfen.</p>';
        return;
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
            <span class="back-face">🦊</span>
        `;

        card.addEventListener('click', flipCard);
        memoryGrid.appendChild(card);
        cards.push(card);
    });
}

// ... (flipCard, checkForMatch, disableCards, unflipCards, resetBoard, showMatchSuccess, gameOver bleiben unverändert) ...
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
    // Initialisierung des Sliders und der Beschreibung
    const initialDifficulty = difficultyConfigs[difficultySlider.value];
    difficultyDescription.textContent = `${initialDifficulty.name} (${initialDifficulty.pairs} Paare)`;
    
    // Initiales Styling für den Start-Button (Thema)
    const initialThemeButton = document.querySelector('.theme-button[data-theme="InItalien"]');
    if (initialThemeButton) {
        initialThemeButton.classList.add('active-theme');
    }

    setupGame();
});
