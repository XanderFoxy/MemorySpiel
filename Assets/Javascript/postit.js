// ==============================================================================
// 📄 postit.js
// Verwaltet den Zustand und die Animation des Post-it-Hinweises.
// ==============================================================================

const POST_IT_CLOSED_KEY = 'memoryPostItClosed'; 

/**
 * Holt den Status, ob das Post-it geschlossen wurde, aus dem localStorage.
 */
function getPostItClosedStatus() {
    return localStorage.getItem(POST_IT_CLOSED_KEY) === 'true';
}

/**
 * Speichert den Status, dass das Post-it geschlossen wurde und steuert die Animation.
 * Diese Funktion wird auch von script.js aufgerufen, wenn der erste Zug erfolgt.
 */
function setPostItClosedStatus(isClosed) {
    const difficultyNoteElement = document.getElementById('difficulty-note');
    
    if (!difficultyNoteElement) return;

    if (isClosed) {
        localStorage.setItem(POST_IT_CLOSED_KEY, 'true');
        window.isPostItClosed = true; 
        
        // Prüfen, ob bereits hidden, um Animation zu vermeiden
        if (!difficultyNoteElement.classList.contains('hidden-by-default')) {
            // Abreiß-Animation starten
            difficultyNoteElement.classList.add('ripped');
            
            // Nach der Animation (0.7s) aus dem DOM entfernen und Reset
            setTimeout(() => {
                difficultyNoteElement.classList.add('hidden-by-default');
                difficultyNoteElement.classList.remove('ripped'); // Animation zurücksetzen
            }, 700); // Muss länger sein als die CSS-Transition (0.3s + 0.4s)
        } else {
             // Wenn bereits versteckt, nur Status setzen
             difficultyNoteElement.classList.add('hidden-by-default');
        }

    } else {
        localStorage.removeItem(POST_IT_CLOSED_KEY);
        window.isPostItClosed = false; 
        
        // Post-it visuell wiederherstellen (wird in script.js beim Start gesteuert)
        difficultyNoteElement.classList.remove('hidden-by-default');
    }
}


// Event Listener für die Post-it Ecke
document.addEventListener('DOMContentLoaded', () => {
    const postItCornerElement = document.querySelector('.post-it-corner');
    
    // Initialisiere die globale Variable 
    window.isPostItClosed = getPostItClosedStatus();
    
    // Mache die setPostItClosedStatus Funktion global verfügbar für script.js
    window.setPostItClosedStatus = setPostItClosedStatus;
    
    // Post-it initial verstecken, wenn es geschlossen wurde
    const difficultyNoteElement = document.getElementById('difficulty-note');
    if (difficultyNoteElement && window.isPostItClosed) {
         difficultyNoteElement.classList.add('hidden-by-default');
    }

    if (postItCornerElement) {
        
        // Klick auf die Ecke löst die Schließ- und Abreiß-Logik aus
        postItCornerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            setPostItClosedStatus(true);
        });
    }
});

// Post-it Klick-Logik (Klick auf den Body des Zettels schließt ihn nicht, nur die Ecke)
// Das wird in der script.js geregelt, wenn window.gameStarted = true gesetzt wird.
