// ... (Konstanten und Variablen bleiben wie in der letzten korrigierten Version) ...
const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
// ... (restliche Konstanten) ...

// ... (difficultyConfigs, BASE_URL, Hilfsfunktionen, IN_ITALIEN_FILES, gameConfigs bleiben unverändert) ...

// ... (Slider- und Theme-Event-Listener bleiben unverändert) ...


function setupGame() {
    memoryGrid.innerHTML = '';
    cards = [];
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    pairsFound = 0;
    matchedImages = []; 
    
    // WICHTIG: Verstecke die Overlays am Anfang
    matchSuccessOverlay.classList.remove('active');
    galleryOverlay.classList.remove('active');
    
    const MAX_PAIRS = currentDifficulty.pairs; 
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    // Setze das Grid basierend auf der Schwierigkeit
    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    // ... (Logik zur Bildauswahl bleibt unverändert) ...
    let selectedPaths = [];
    
    if (currentThemeConfig.name === 'Gemixt') {
        const otherFolders = ['BabyFox', 'ThroughTheYears', 'InItalien'];
        let allPaths = [];
        
        otherFolders.forEach(folderName => {
             const config = gameConfigs[folderName];
             if (config && config.allImagePaths) {
                 allPaths = allPaths.concat(config.allImagePaths);
             }
        });
        selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);

    } else if (currentThemeConfig.allImagePaths) {
        selectedPaths = selectRandomImagePaths(currentThemeConfig.allImagePaths, MAX_PAIRS);
    }
    
    if (selectedPaths.length === 0) {
        console.error("Es konnten keine Bilder für das Spiel geladen werden.");
        memoryGrid.innerHTML = '<p style="color:red; grid-column: 1 / -1; text-align: center;">Fehler: Konnte keine Bilder laden. Bitte Thema prüfen.</p>';
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
        
        // Die Bilder sind nur in der Kartenstruktur enthalten. 
        // Es gibt keine Möglichkeit für sie, außerhalb des Spielfelds zu erscheinen, 
        // es sei denn, ein Browser-Add-on oder ein früherer Debug-Code war aktiv.
        card.innerHTML = `
            <img class="front-face" src="${imageURL}" alt="Memory Bild">
            <span class="back-face">🦊</span>
        `;

        card.addEventListener('click', flipCard);
        memoryGrid.appendChild(card);
        cards.push(card);
    });
}

// ... (flipCard, checkForMatch, disableCards, unflipCards, resetBoard, showMatchSuccess, gameOver, closeGalleryButton.addEventListener bleiben unverändert, da die Logik bereits korrigiert wurde) ...

// ... (DOMContentLoad-Initialisierung bleibt unverändert) ...
