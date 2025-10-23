const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const themeButtons = document.querySelectorAll('.theme-button');
const galleryImagesContainer = document.getElementById('gallery-images'); 
const permanentGallery = document.getElementById('permanent-gallery');
const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');
const closeDetailButton = document.getElementById('close-detail');
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
let matchedImages = []; // Aktuell gefundene Paare (Pfade)

const difficultyConfigs = {
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px' }, 
    '2': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '780px' } 
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; 
const BASE_URL = 'Bilder/'; 
let currentThemeConfig = null; // Wird beim DOMContentLoaded gesetzt

// --- Datengrundlagen und Hilfsfunktionen (Pfade und Shuffle bleiben gleich) ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectRandomImagePaths(allPaths, count) {
    if (allPaths.length < count) {
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

// Integrierte Pfade (wie in der Anforderung aktualisiert)
const BABYFOX_FILES = [
    'BabyFox/01292D1E-FB2F-423E-B43C-EFFC54B7DDA8.png', 
    'BabyFox/9978574A-F56F-4AFF-9C68-490AE67EB5DA.png', 
    'BabyFox/IMG_0688.jpeg', 
    'BabyFox/Photo648578813890.1_inner_0-0-749-0-0-1000-749-1000.jpeg', 
    'BabyFox/Photo648581525823_inner_46-11-953-11-46-705-953-705.jpeg',
    ...generateNumberedPaths('BabyFox', 20)
];
const IN_ITALIEN_FILES = [
    'InItalien/Al ven77.jpeg', 'InItalien/IMG_0051.jpeg', 'InItalien/IMG_0312.jpeg', 'InItalien/IMG_6917.jpeg',
    'InItalien/IMG_8499.jpeg', 'InItalien/IMG_9287.jpeg', 'InItalien/IMG_9332.jpeg', 'InItalien/IMG_9352.jpeg',
    'InItalien/IMG_9369.jpeg', 'InItalien/IMG_9370.jpeg', 'InItalien/IMG_9470.jpeg', 'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg', 'InItalien/IMG_9593.jpeg', 'InItalien/IMG_9594.jpeg', 'InItalien/IMG_9597.jpeg',
    'InItalien/IMG_9598.jpeg', 'InItalien/IMG_9599.jpeg', 'InItalien/QgNsMtTA.jpeg' 
];
const THROUGH_THE_YEARS_FILES = generateNumberedPaths('ThroughTheYears', 20);

const gameConfigs = {
    'InItalien': { allImagePaths: IN_ITALIEN_FILES, name: 'InItalien' },
    'BabyFox': { allImagePaths: BABYFOX_FILES, name: 'BabyFox' }, 
    'ThroughTheYears': { allImagePaths: THROUGH_THE_YEARS_FILES, name: 'ThroughTheYears' },
    'Gemixt': { name: 'Gemixt' }
};

// --- Score/Fortschritt-Logik ---

function getGameProgress() {
    try {
        const progress = localStorage.getItem('memoryGameProgress');
        return progress ? JSON.parse(progress) : { currentTheme: 'Gemixt', currentDifficulty: '1', moves: 0, pairsFound: 0, collectedPaths: [] };
    } catch (e) {
        return { currentTheme: 'Gemixt', currentDifficulty: '1', moves: 0, pairsFound: 0, collectedPaths: [] };
    }
}

function saveGameProgress(currentPaths, isNewGame = false) {
    if (isNewGame) {
         // Beim Start eines neuen Spiels (neues Thema/Schwierigkeit), speichere nur die Konfiguration
        const progress = {
            currentTheme: currentThemeConfig.name,
            currentDifficulty: currentDifficulty.name,
            moves: 0,
            pairsFound: 0,
            collectedPaths: []
        };
        localStorage.setItem('memoryGameProgress', JSON.stringify(progress));
    } else if (currentPaths && currentPaths.length > 0) {
        // Spiel im Gange: Speichere den Zustand (Pfade, Züge etc.)
        const progress = {
            currentTheme: currentThemeConfig.name,
            currentDifficulty: currentDifficulty.name,
            moves: moves,
            pairsFound: pairsFound,
            collectedPaths: currentPaths // Liste der Paare/Pfade
        };
        localStorage.setItem('memoryGameProgress', JSON.stringify(progress));
    }
}

// --- Galerielogik (Kurzversion) ---

function getFavorites() {
    try {
        const favorites = localStorage.getItem('memoryFavorites');
        return favorites ? [...new Set(JSON.parse(favorites).filter(Boolean))] : []; 
    } catch (e) {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem('memoryFavorites', JSON.stringify([...new Set(favorites)]));
}

function createGalleryItem(imagePath, isFavorite = false, isFinalGallery = false) {
    const fullSrc = `${BASE_URL}${imagePath}`;
    const item = document.createElement('div');
    item.classList.add('gallery-item');
    item.dataset.path = imagePath; 
    
    const img = document.createElement('img');
    img.src = fullSrc;
    img.alt = 'Gefundenes Bild';
    item.appendChild(img);

    const icon = document.createElement('span');
    icon.classList.add('favorite-icon', 'fas', 'fa-heart');
    if (isFavorite) {
        icon.classList.add('active');
    }

    if (!isFinalGallery) {
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); 
            toggleFavorite(imagePath, icon);
        });
    }
    
    item.addEventListener('click', () => {
        showImageDetail(fullSrc); 
    });

    if (!isFinalGallery) {
        item.appendChild(icon);
    }
    return item;
}

function toggleFavorite(imagePath, iconElement) {
    let favorites = getFavorites();
    const index = favorites.indexOf(imagePath);

    if (index === -1) {
        favorites.push(imagePath);
        iconElement.classList.add('active');
    } else {
        favorites.splice(index, 1);
        iconElement.classList.remove('active');
    }
    saveFavorites(favorites);
    loadPermanentGallery(); 
}

function showImageDetail(imageSrc) {
    detailImage.src = imageSrc;
    imageDetailOverlay.classList.add('active');
}

if (closeDetailButton) {
    closeDetailButton.addEventListener('click', () => {
        imageDetailOverlay.classList.remove('active');
    });
}

function loadPermanentGallery() {
    permanentGallery.innerHTML = '';
    const favorites = getFavorites();
    
    if (favorites.length > 0) {
        favorites.forEach(path => {
            permanentGallery.appendChild(createGalleryItem(path, true)); 
        });
    } else {
         const message = document.createElement('p');
         message.textContent = "Markiere Bilder als Favoriten (❤️), um sie hier dauerhaft zu speichern.";
         message.style.color = 'var(--primary-color)';
         permanentGallery.appendChild(message);
    }
}

// --- Spiel-Flow und Setup ---

themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        currentThemeConfig = gameConfigs[theme];
        
        themeButtons.forEach(btn => btn.classList.remove('active-theme'));
        e.target.classList.add('active-theme');
        
        setupGame(true); // Neues Spiel starten
    });
});

difficultySlider.addEventListener('change', (e) => {
    currentDifficulty = difficultyConfigs[e.target.value];
    setupGame(true); // Neues Spiel starten
});

function setupGame(isNewGame = false) {
    // Wenn es kein neues Spiel ist, laden Sie den gespeicherten Zustand
    if (!isNewGame) {
        const progress = getGameProgress();
        currentThemeConfig = gameConfigs[progress.currentTheme];
        currentDifficulty = difficultyConfigs[progress.currentDifficulty === 'Leicht' ? '1' : '2'];
        
        moves = progress.moves;
        pairsFound = progress.pairsFound;
        matchedImages = progress.collectedPaths;
        
        // Aktualisiere UI-Elemente
        difficultySlider.value = currentDifficulty.name === 'Leicht' ? '1' : '2';
        difficultyDescription.textContent = `${currentDifficulty.name} (${currentDifficulty.pairs} Paare)`;
        
        themeButtons.forEach(btn => btn.classList.remove('active-theme'));
        document.querySelector(`.theme-button[data-theme="${progress.currentTheme}"]`).classList.add('active-theme');
    } else {
        // Starte von Null
        moves = 0;
        pairsFound = 0;
        matchedImages = [];
        saveGameProgress(matchedImages, true); // Speichere neue Spielkonfiguration
    }

    // UI-Initialisierung
    memoryGrid.innerHTML = '';
    cards = [];
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;

    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    galleryOverlay.classList.remove('active');
    
    const MAX_PAIRS = currentDifficulty.pairs; 

    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    let selectedPaths = [];
    
    if (currentThemeConfig.name === 'Gemixt') {
        const allPaths = [...IN_ITALIEN_FILES, ...BABYFOX_FILES, ...THROUGH_THE_YEARS_FILES];
        selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);
    } else {
        selectedPaths = selectRandomImagePaths(currentThemeConfig.allImagePaths, MAX_PAIRS);
    }
    
    if (selectedPaths.length === 0 || selectedPaths.length < MAX_PAIRS) {
        memoryGrid.innerHTML = `<p style="color:var(--secondary-color); grid-column: 1 / -1; text-align: center;">FEHLER: Konnte nicht genügend Bilder (${selectedPaths.length}/${MAX_PAIRS}) laden!</p>`;
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
        const isMatched = matchedImages.includes(fullPath);

        card.innerHTML = `
            <div class="front-face">
                <img src="${imageURL}" alt="Memory Bild">
            </div>
            <span class="back-face">🦊</span>
        `;
        
        // Karten Event Listener und Wiederherstellung des Spielstands
        if (isMatched) {
            card.classList.add('flip', 'match');
        } else {
             card.addEventListener('click', flipCard); 
        }

        memoryGrid.appendChild(card);
        cards.push(card);
    });
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
    
    // Fügt Match-Klassen hinzu (für den Glow)
    firstCard.classList.add('match'); 
    secondCard.classList.add('match'); 
    
    // Entfernt Listener
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImagePath = firstCard.dataset.path;
    
    // Animation/Hinzufügen zur Galerie
    matchedImages.push(matchedImagePath);
    saveGameProgress(matchedImages); // Spielstand speichern
    loadPermanentGallery(); 

    resetBoard(); 
    
    if (pairsFound === currentDifficulty.pairs) { 
        setTimeout(gameOver, 1000); 
    } else {
         // Grüner Glow nach 1.5s wieder leicht entfernen, wenn das Spiel weitergeht
         setTimeout(() => {
             firstCard.style.boxShadow = '0 6px 10px rgba(0, 0, 0, 0.3)';
             secondCard.style.boxShadow = '0 6px 10px rgba(0, 0, 0, 0.3)';
         }, 1500);
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
        
        // Roten Glow nach dem Unflip entfernen
        firstCard.style.boxShadow = '0 6px 10px rgba(0, 0, 0, 0.3)';
        secondCard.style.boxShadow = '0 6px 10px rgba(0, 0, 0, 0.3)';
        
        resetBoard(); 
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}


function gameOver() {
    soundWin.play();
    galleryImagesContainer.innerHTML = '';
    
    const favorites = getFavorites();

    matchedImages.forEach(path => {
        // Finale Galerie, Icons entfernt
        const item = createGalleryItem(path, favorites.includes(path), true);
        galleryImagesContainer.appendChild(item);
    });
    galleryOverlay.classList.add('active');
    
    // Setze das gespeicherte Spiel zurück, wenn es gewonnen wurde
    saveGameProgress([], true);
}

closeGalleryButton.addEventListener('click', () => {
    galleryOverlay.classList.remove('active');
    setupGame(true); // Starte ein neues Spiel
});


document.addEventListener('DOMContentLoaded', () => {
    // Initiales Laden des Spiels (oder Fortsetzen)
    loadPermanentGallery();
    setupGame(false);
});
