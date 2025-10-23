const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const themeButtons = document.querySelectorAll('.theme-button');
const galleryImagesContainer = document.getElementById('gallery-images');

const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDescription = document.getElementById('difficulty-description');

const soundMatch = document.getElementById('sound-match');
const soundError = document.getElementById('sound-error');
const soundWin = document.getElementById('sound-win');

let cards = [];
let hasFlippedCard = false; 
let lockBoard = false; 
let firstCard, secondCard; 
let moves = 0;
let pairsFound = 0;
let matchedImages = []; 

// Schwierigkeitskonfiguration mit nur ZWEI quadratischen Grids
const difficultyConfigs = {
    // 4x4 Grid
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px' }, 
    // 6x6 Grid
    '2': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '780px' } 
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; 

const BASE_URL = 'https://xanderfoxy.github.io/MemorySpiel/Bilder/';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectRandomImagePaths(allPaths, count) {
    // KORREKTUR: Die Logik zur Auswahl der zufälligen Bilder bleibt, 
    // stellt aber sicher, dass nur die benötigte Anzahl Paare (count) ausgewählt wird,
    // auch wenn mehr Bilder im Ordner sind.
    if (allPaths.length < count) {
        console.warn(`Nicht genug Bilder (${allPaths.length}) für ${count} Paare verfügbar. Reduziere auf ${allPaths.length} Paare.`);
        count = allPaths.length;
    }
    let shuffled = [...allPaths];
    shuffleArray(shuffled);
    // WICHTIG: Hier werden die exakt benötigten 8 Paare (oder 18) ausgewählt.
    return shuffled.slice(0, count);
}

function generateNumberedPaths(folderName, maxPossibleImages = 20) {
    let allNumbers = [];
    for (let i = 1; i <= maxPossibleImages; i++) {
        // Annahme: Bilder sind als 1.jpg, 2.jpg etc. gespeichert
        allNumbers.push(`${folderName}/${i}.jpg`);
    }
    return allNumbers;
}

// Hier sind die Dateinamen fixiert, um Case-Sensitivity-Probleme zu vermeiden.
const IN_ITALIEN_FILES = [
    'InItalien/Al ven77.jpeg', 'InItalien/IMG_0051.jpeg', 'InItalien/IMG_0312.jpeg', 'InItalien/IMG_6917.jpeg',
    'InItalien/IMG_8499.jpeg', 'InItalien/IMG_9287.jpeg', 'InItalien/IMG_9332.jpeg', 'InItalien/IMG_9352.jpeg',
    'InItalien/IMG_9369.jpeg', 'InItalien/IMG_9370.jpeg', 'InItalien/IMG_9470.jpeg', 'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg', 'InItalien/IMG_9593.jpeg', 'InItalien/IMG_9594.jpeg', 'InItalien/IMG_9597.jpeg',
    'InItalien/IMG_9598.jpeg', 'InItalien/IMG_9599.jpeg', 'InItalien/QgNsMtTA.jpeg' // 19 Bilder
];

const gameConfigs = {
    'InItalien': { allImagePaths: IN_ITALIEN_FILES, name: 'InItalien' },
    'BabyFox': { allImagePaths: generateNumberedPaths('BabyFox', 20), name: 'BabyFox' },
    'ThroughTheYears': { allImagePaths: generateNumberedPaths('ThroughTheYears', 20), name: 'ThroughTheYears' },
    'Gemixt': { name: 'Gemixt' }
};

let currentThemeConfig = gameConfigs['Gemixt']; 

// ... (Slider- und Theme-Event-Listener bleiben unverändert) ...
difficultySlider.addEventListener('input', (e) => {
    currentDifficulty = difficultyConfigs[e.target.value];
    const name = e.target.value === '2' ? 'Schwer' : 'Leicht';
    const pairs = e.target.value === '2' ? 18 : 8;
    difficultyDescription.textContent = `${name} (${pairs} Paare)`;
});

difficultySlider.addEventListener('change', () => {
    setupGame(); 
});

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
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    moves = 0;
    pairsFound = 0;
    matchedImages = []; 
    
    matchSuccessOverlay.classList.remove('active');
    galleryOverlay.classList.remove('active');
    
    const MAX_PAIRS = currentDifficulty.pairs; 
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    let selectedPaths = [];
    
    if (currentThemeConfig.name === 'Gemixt') {
        const allPaths = [];
        // Sammle alle verfügbaren Bilder für "Gemixt"
        ['BabyFox', 'ThroughTheYears', 'InItalien'].forEach(folderName => {
             const config = gameConfigs[folderName];
             if (config && config.allImagePaths) {
                 allPaths.push(...config.allImagePaths);
             }
        });
        selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);

    } else if (currentThemeConfig.allImagePaths) {
        // WICHTIG: Wählt MAX_PAIRS Bilder aus der Liste (z.B. 8 von 19 für Leicht)
        selectedPaths = selectRandomImagePaths(currentThemeConfig.allImagePaths, MAX_PAIRS);
    }
    
    if (selectedPaths.length === 0 || selectedPaths.length < MAX_PAIRS) {
        console.error(`Fehler: Konnte nicht genügend Bilder (${selectedPaths.length}) für das Spiel laden. Pfade prüfen!`);
        memoryGrid.innerHTML = '<p style="color:red; grid-column: 1 / -1; text-align: center; color: var(--secondary-color);">FEHLER: Konnte nicht genügend Bilder laden. Thema oder Pfade prüfen!</p>';
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
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });
    
    cards.forEach(card => card.addEventListener('click', flipCard));
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; 
    if (this.classList.contains('match')) return; 

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    
    secondCard = this;
    moves++;
    statsMoves.textContent = `Züge: ${moves}`;
    
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.path === secondCard.dataset.path;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    pairsFound++;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    soundMatch.play();
    
    // KORREKTUR: Karten bleiben dauerhaft offen durch die Klasse 'match'
    firstCard.classList.add('match');
    secondCard.classList.add('match');
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImageSrc = firstCard.querySelector('.front-face').src;
    
    // Zeige das Overlay (Volltreffer)
    showMatchSuccess(matchedImageSrc);
    
    // Füge das Bild zur Galerie hinzu, nachdem das Overlay weg ist (Simulation Animation)
    setTimeout(() => {
        matchedImages.push(matchedImageSrc);
    }, 1500);
    
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
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function showMatchSuccess(imageSrc) {
    matchedImagePreview.src = imageSrc;
    matchSuccessOverlay.classList.add('active');
    // Das Overlay ist nach 1.5 Sekunden weg, damit das Bild kurz gezeigt wird
    setTimeout(() => {
        matchSuccessOverlay.classList.remove('active');
    }, 1500); 
}

function gameOver() {
    soundWin.play();
    galleryImagesContainer.innerHTML = '';
    
    // Die Galerie wird aus den gesammelten matchedImages erstellt
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
    // Initialisierung des Sliders und der Beschreibung
    const initialDifficulty = difficultyConfigs[difficultySlider.value];
    difficultyDescription.textContent = `${initialDifficulty.name} (${initialDifficulty.pairs} Paare)`;
    
    // Setzt Gemixt als Standard-Theme
    const initialThemeButton = document.querySelector('.theme-button[data-theme="Gemixt"]');
    if (initialThemeButton) {
        themeButtons.forEach(btn => btn.classList.remove('active-theme'));
        initialThemeButton.classList.add('active-theme');
    }
    currentThemeConfig = gameConfigs['Gemixt'];

    setupGame();
});
