// ==============================================================================
// 📄 slider.js
// Verwaltet die visuelle Darstellung des Schwierigkeitssliders und des Fuchskopfs.
// ==============================================================================

/**
 * Berechnet die genaue Position des Fuchskopfes und setzt den Farbverlauf.
 * @param {boolean} updatePostit - Steuert, ob das Post-it aktualisiert werden soll.
 */
function updateDifficultyDisplay(updatePostit = true) {
    const slider = document.getElementById('difficulty-slider');
    const foxHead = document.getElementById('fox-head-slider');
    const postitDescription = document.getElementById('difficulty-description-postit');

    if (!slider || !foxHead) return;

    const value = parseInt(slider.value);
    const min = parseInt(slider.min); // 1
    const max = parseInt(slider.max); // 3

    // Berechne den Prozentsatz: 0% bei min, 50% bei 2, 100% bei max
    const percentage = ((value - min) / (max - min)) * 100;

    // Fuchskopf-Positionierung
    // Der Offset von 8px korrigiert die Zentrierung des Fuchskopfes über dem Thumb.
    // Der Fox Head muss sich von 0% bis 100% bewegen.
    foxHead.style.left = `calc(${percentage}% - 8px)`; 
    
    // Hintergrundfarbe-Verlauf (Gelb -> Orange -> Rot)
    let fillStyle;
    
    // Die Farb-Variablen müssen in style.css definiert sein:
    // --match-color (Leicht/Gelb), --wait-color (Mittel/Orange), --error-color (Schwer/Rot)
    const easyColor = 'var(--match-color)'; 
    const mediumColor = 'var(--wait-color)'; 
    const hardColor = 'var(--error-color)'; 
    
    // Linearen Farbverlauf von 0% bis zur aktuellen Position erstellen.
    if (percentage <= 50) {
        // Übergang von Leicht (Gelb, 0%) zu Mittel (Orange, 50%)
        const progress = percentage * 2; // Skaliert von 0-100%
        fillStyle = `linear-gradient(to right, ${easyColor} 0%, ${mediumColor} ${progress}%, var(--button-bg-inactive) ${progress}%)`;
    } else {
        // Übergang von Mittel (Orange, 50%) zu Schwer (Rot, 100%)
        // Die ersten 50% sind bereits Orange. Jetzt den Übergang von 50% bis 100% berechnen.
        const progress = (percentage - 50) * 2; // Skaliert von 0-100%
        fillStyle = `linear-gradient(to right, ${easyColor} 0%, ${mediumColor} 50%, ${hardColor} ${50 + (progress / 2)}%, var(--button-bg-inactive) ${percentage}%)`;
    }
    
    // Den Farbverlauf anwenden
    slider.style.backgroundImage = fillStyle;


    // Post-it Beschreibung aktualisieren
    if (updatePostit && window.currentDifficulty && postitDescription) {
         postitDescription.innerHTML = `**${window.currentDifficulty.name}:** ${window.currentDifficulty.description}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('difficulty-slider');
    
    if (slider && window.difficultyConfigs) {
        
        // Initialer Aufruf beim Laden (setzt Fuchskopf und Farbe)
        updateDifficultyDisplay(false); 

        // Event Listener für die Bewegung des Sliders
        slider.addEventListener('input', () => {
             // 1. Schwierigkeit im globalen Scope aktualisieren
             window.currentDifficulty = window.difficultyConfigs[slider.value];
             
             // 2. Anzeige und Post-it aktualisieren
             updateDifficultyDisplay(true); 
        });
        
        // WICHTIG: Erlaubt dem Fuchskopf, die finale Position zu erreichen, wenn der Benutzer loslässt.
        slider.addEventListener('change', () => {
             // Stellt sicher, dass die finale Position korrekt gerendert wird
             updateDifficultyDisplay(true); 
        });
    }
});

// Mache die Funktion global verfügbar für loadOrStartGame in script.js
window.updateDifficultyDisplay = updateDifficultyDisplay;
