// Globale Abhängigkeiten: difficultyNote, POST_IT_CLOSED_KEY
// Die Variable 'isPostItClosed' wird global im window-Scope von diesem Skript verwaltet.

const POST_IT_CLOSED_KEY = 'memoryPostItClosed'; 

/**
 * Holt den Status, ob das Post-it geschlossen wurde, aus dem localStorage.
 */
function getPostItClosedStatus() {
    return localStorage.getItem(POST_IT_CLOSED_KEY) === 'true';
}

/**
 * Speichert den Status, dass das Post-it geschlossen wurde.
 * Diese Funktion wird auch von script.js aufgerufen, wenn der erste Zug erfolgt.
 */
function setPostItClosedStatus(isClosed) {
    if (isClosed) {
        localStorage.setItem(POST_IT_CLOSED_KEY, 'true');
    } else {
        localStorage.removeItem(POST_IT_CLOSED_KEY);
    }
}


// Event Listener für den Post-it Schließen Button
document.addEventListener('DOMContentLoaded', () => {
    const difficultyNoteElement = document.getElementById('difficulty-note');
    const closePostItButtonElement = document.getElementById('close-post-it');
    
    // Initialisiere die globale Variable (window.isPostItClosed)
    window.isPostItClosed = getPostItClosedStatus();
    
    // Mache die setPostItClosedStatus Funktion global verfügbar für script.js
    window.setPostItClosedStatus = setPostItClosedStatus;

    if (closePostItButtonElement && difficultyNoteElement) {
        
        closePostItButtonElement.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Post-it visuell ausblenden (Animation)
            difficultyNoteElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-in';
            difficultyNoteElement.style.opacity = '0';
            difficultyNoteElement.style.transform = 'rotate(10deg) translateX(100px) translateY(-50px)';
            
            // Nach der Animation ausblenden und Status speichern
            setTimeout(() => {
                difficultyNoteElement.classList.add('hidden-by-default');
                difficultyNoteElement.style.transition = 'none'; 
                difficultyNoteElement.style.transform = 'rotate(2deg)'; // Reset für das nächste Spiel
                
                // Globale Variable und localStorage aktualisieren
                window.isPostItClosed = true; 
                setPostItClosedStatus(true);
            }, 500); 
        });
    }
});
