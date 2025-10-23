const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
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
let hasFlippedCard = false; // Wird genutzt, um zu prüfen, ob es die erste oder zweite Karte ist
let lockBoard = false; 
let firstCard, secondCard; 
let moves = 0;
let pairsFound = 0;
let matchedImages = []; 

const difficultyConfigs = {
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, cardSize: '110px' }, // 4x4 Grid
    '2': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, cardSize: '100px' } // 6x6 Grid
};

// Initialwert: Leicht (1)
let currentDifficulty = difficultyConfigs[difficultySlider.value]; 
const BASE_URL = 'Bilder/'; 

// --- Datenstrukturen und Hilfsfunktionen (Pfade und Shuffle) ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectRandomImagePaths(allPaths, count) {
    if (allPaths.length < count) {
        // Falls nicht genug Bilder vorhanden, nimm alle und warne.
        console.warn(`WARNUNG: Nur ${allPaths.length} Bilder gefunden, obwohl ${count} Paare benötigt.`);
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

// Hier die korrigierten Pfade
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

// Standard-Start: Gemixt
let currentThemeConfig = gameConfigs['Gemixt']; 

// --- FAVORITEN UND GALERIE LOGIK (Beibehalten) ---

function getFavorites() {
    // ... Logik unverändert ...
    try {
        const favorites = localStorage.getItem('memoryFavorites');
        return favorites ? [...new Set(JSON.parse(favorites).filter(Boolean))] : []; 
    } catch (e) {
        return [];
    }
}

function saveFavorites(favorites) {
    // ... Logik unverändert ...
    try {
        localStorage.setItem('memoryFavorites', JSON.stringify([...new Set(favorites)]));
    } catch (e) {
        // Fehlerbehandlung
    }
}

function createGalleryItem(imagePath, isFavorite = false) {
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

    icon.addEventListener('click', (e) => {
        e.stopPropagation(); 
        toggleFavorite(imagePath, icon);
    });
    
    item.addEventListener('click', () => {
        showImageDetail(fullSrc); 
    });

    item.appendChild(icon);
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

// --- SPIELLOGIK ---

difficultySlider.addEventListener('input', (e) => {
    // Aktualisiert die Anzeige des Sliders
    currentDifficulty = difficultyConfigs[e.target.value];
    difficultyDescription.textContent = `${currentDifficulty.name} (${currentDifficulty.pairs} Paare)`;
});

difficultySlider.addEventListener('change', () => {
    // Startet das Spiel neu, wenn der Slider losgelassen wird
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

    // Grid-Anpassung basierend auf der Schwierigkeit
    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    // Setzt die Kartengröße für CSS (wichtig für die Darstellung)
    document.documentElement.style.setProperty('--card-size', currentDifficulty.cardSize); 
    
    let allPaths = [];
    if (currentThemeConfig.name === 'Gemixt') {
        // Sammle alle Pfade von allen Themen
        allPaths = IN_ITALIEN_FILES.concat(BABYFOX_FILES, THROUGH_THE_YEARS_FILES);
    } else if (currentThemeConfig.allImagePaths) {
        allPaths = currentThemeConfig.allImagePaths;
    }
    
    const selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);

    if (selectedPaths.length === 0 || selectedPaths.length < MAX_PAIRS) {
        console.error(`Fehler: Konnte nicht genügend Bilder (${selectedPaths.length}) für das Spiel laden. Pfade überprüfen.`);
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
            <div class="front-face">
                <img src="${imageURL}" alt="Memory Bild">
            </div>
            <span class="back-face">🦊</span>
        `;
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });
    
    // Event Listener für Karten HIER hinzufügen!
    cards.forEach(card => card.addEventListener('click', flipCard));
}


function flipCard() {
    // Problem: Das `this` war ein div, aber in der alten Version wurde das `div` als Karte behandelt.
    // Ich fixiere hier die Logik der Karten-Identifizierung und des Lockings.
    if (lockBoard) return;
    if (this === firstCard) return; 
    if (this.classList.contains('match')) return; 

    this.classList.add('flip');

    if (!hasFlippedCard) {
        // Erste Karte umgedreht
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    
    // Zweite Karte umgedreht
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
    
    firstCard.classList.add('match'); 
    secondCard.classList.add('match'); 
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImagePath = firstCard.dataset.path;
    const matchedImageSrc = `${BASE_URL}${matchedImagePath}`;
    
    showMatchSuccess(matchedImageSrc);
    
    // Fügt das Bild zur permanenten Galerie hinzu (mit Verzögerung)
    setTimeout(() => {
        matchedImages.push(matchedImagePath);
        loadPermanentGallery(); 
    }, 150); 

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
    setTimeout(() => {
        matchSuccessOverlay.classList.remove('active');
    }, 1500);
}

function gameOver() {
    soundWin.play();
    galleryImagesContainer.innerHTML = '';
    
    const favorites = getFavorites();

    matchedImages.forEach(path => {
        const item = createGalleryItem(path, favorites.includes(path));
        // Entferne den Klick-Listener vom Icon in der temporären Galerie
        const icon = item.querySelector('.favorite-icon');
        if(icon) {
            icon.removeEventListener('click', icon.onclick);
        }
        item.removeEventListener('click', item.onclick);
        galleryImagesContainer.appendChild(item);
    });
    galleryOverlay.classList.add('active');
}

closeGalleryButton.addEventListener('click', () => {
    galleryOverlay.classList.remove('active');
    setupGame(); 
});


document.addEventListener('DOMContentLoaded', () => {
    // Setze die Standardeinstellungen für die Benutzeroberfläche: Leicht & Gemixt
    const initialDifficulty = difficultyConfigs[difficultySlider.value];
    difficultyDescription.textContent = `${initialDifficulty.name} (${initialDifficulty.pairs} Paare)`;
    
    const initialThemeButton = document.querySelector('.theme-button[data-theme="Gemixt"]');
    if (initialThemeButton) {
        themeButtons.forEach(btn => btn.classList.remove('active-theme'));
        initialThemeButton.classList.add('active-theme');
    }
    currentThemeConfig = gameConfigs['Gemixt'];

    loadPermanentGallery();
    
    // WICHTIG: Spielstart mit initialen Einstellungen
    setupGame(); 
});
