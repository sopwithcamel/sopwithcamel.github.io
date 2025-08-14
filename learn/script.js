// Kannada keyboard layout
const kannadaKeyboard = {
    vowels: [
        ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ೠ'],
        ['ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಂ', 'ಃ']
    ],
    consonants: [
        ['ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ'],
        ['ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ'],
        ['ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ'],
        ['ತ', 'ಥ', 'ದ', 'ಧ', 'ನ'],
        ['ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ'],
        ['ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ'],
        ['ಸ', 'ಹ', 'ಳ', 'ೞ']
    ],
    halant: '್',
    halfConsonants: [
        ['ಕ್', 'ಖ್', 'ಗ್', 'ಘ್', 'ಙ್'],
        ['ಚ್', 'ಛ್', 'ಜ್', 'ಝ್', 'ಞ್'],
        ['ಟ್', 'ಠ್', 'ಡ್', 'ಢ್', 'ಣ್'],
        ['ತ್', 'ಥ್', 'ದ್', 'ಧ್', 'ನ್'],
        ['ಪ್', 'ಫ್', 'ಬ್', 'ಭ್', 'ಮ್'],
        ['ಯ್', 'ರ್', 'ಲ್', 'ವ್', 'ಶ್', 'ಷ್'],
        ['ಸ್', 'ಹ್', 'ಳ್', 'ೞ್']
    ],
    special: [],
};

// Game state
let currentWord = null;
let currentAnswer = '';
let usedWords = [];

// DOM elements
const englishWordEl = document.getElementById('englishWord');
const kannadaInputEl = document.getElementById('kannadaInput');
const feedbackEl = document.getElementById('feedback');
const checkBtn = document.getElementById('checkBtn');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const keyboardEl = document.getElementById('kannadaKeyboard');

// Initialize the game
async function initGame() {
    document.getElementById('keyboardContainer').classList.add('compact');
    createKeyboard();
    setupEventListeners();
    loadNewWord();
}

// Create Kannada keyboard
function createKeyboard() {
    keyboardEl.innerHTML = '';
    
    // Flatten all keys into a single array for compact layout
    const allKeys = [].concat(
        ...kannadaKeyboard.vowels,
        ...kannadaKeyboard.halfConsonants,
        [kannadaKeyboard.halant],
        kannadaKeyboard.special,
        ['Space', '⌫']
    );
    
    // Calculate optimal keys per row based on screen width
    const keysPerRow = calculateOptimalKeysPerRow();
    console.log(`Screen optimized: ${keysPerRow} keys per row`);
    
    for (let i = 0; i < allKeys.length; i += keysPerRow) {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row compact-row';
        allKeys.slice(i, i + keysPerRow).forEach(keyText => {
            let type = 'key';
            if (kannadaKeyboard.vowels.flat().includes(keyText)) type = 'vowel';
            else if (kannadaKeyboard.halfConsonants.flat().includes(keyText)) type = 'half-consonant';
            else if (keyText === kannadaKeyboard.halant) type = 'halant';
            else if (kannadaKeyboard.special.includes(keyText)) type = 'special';
            else if (keyText === 'Space') type = 'space';
            else if (keyText === '⌫') type = 'backspace';
            
            const key = createKey(keyText, type);
            rowEl.appendChild(key);
        });
        keyboardEl.appendChild(rowEl);
    }
}

// Calculate optimal number of keys per row based on screen size
function calculateOptimalKeysPerRow() {
    const screenWidth = window.innerWidth;
    const containerPadding = 10; // Approximate padding from container
    const keyMinWidth = 35; // Minimum key width in pixels
    const keyGap = 4; // Gap between keys
    
    // Calculate available width for keys
    const availableWidth = screenWidth - (containerPadding * 2);
    
    // Calculate maximum keys that can fit
    const maxKeysPerRow = Math.floor(availableWidth / (keyMinWidth + keyGap));
    
    // Set reasonable limits based on screen size
    let optimalKeys;
    
    if (screenWidth <= 480) {
        // Very small screens (phones in portrait)
        optimalKeys = Math.min(maxKeysPerRow, 8);
    } else if (screenWidth <= 768) {
        // Small screens (phones in landscape, small tablets)
        optimalKeys = Math.min(maxKeysPerRow, 10);
    } else if (screenWidth <= 1024) {
        // Medium screens (tablets, small laptops)
        optimalKeys = Math.min(maxKeysPerRow, 12);
    } else {
        // Large screens (laptops, desktops)
        optimalKeys = Math.min(maxKeysPerRow, 15);
    }
    
    // Ensure minimum of 6 keys per row
    return Math.max(optimalKeys, 6);
}

// Create a keyboard key
function createKey(text, type) {
    const key = document.createElement('div');
    key.className = `key ${type}`;
    key.textContent = text;
    key.addEventListener('click', () => handleKeyPress(text));
    return key;
}

// Handle keyboard key press
function handleKeyPress(key) {
    if (key === 'Space') {
        currentAnswer += ' ';
    } else if (key === '⌫') {
        // Remove last half-consonant if present, else last character
        const lastHalfConsonant = getLastHalfConsonant(currentAnswer);
        if (lastHalfConsonant) {
            currentAnswer = currentAnswer.slice(0, -lastHalfConsonant.length);
        } else {
            currentAnswer = currentAnswer.slice(0, -1);
        }
        updateInputDisplay();
    } else if (key === 'Enter') {
        checkAnswer();
    } else {
        // Only replace the last half-consonant (not all conjuncts)
        if (isVowel(key)) {
            // Find the last half-consonant in the string
            const match = currentAnswer.match(/([\u0C80-\u0CFF]್)$/);
            if (match) {
                const lastHalfConsonant = match[1];
                const idx = currentAnswer.lastIndexOf(lastHalfConsonant);
                const fullConsonant = combineHalfConsonantWithVowel(lastHalfConsonant, key);
                currentAnswer = currentAnswer.slice(0, idx) + fullConsonant;
                kannadaInputEl.value = currentAnswer;
                return;
            }
        }
        currentAnswer += key;
        updateInputDisplay();
    }
}

// Helper to get the last half-consonant (2 code points)
function getLastHalfConsonant(text) {
    // Try last 2 chars, then last 3 chars (for rare cases), else last char
    if (!text) return '';
    for (let len = 3; len >= 1; len--) {
        const part = text.slice(-len);
        if (isHalfConsonant(part)) return part;
    }
    return '';
}

// Check if a character is a vowel
function isVowel(char) {
    const vowels = ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ೠ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ'];
    return vowels.includes(char);
}

// Check if a character is a half consonant
function isHalfConsonant(char) {
    return char && char.endsWith('್');
}

// Get the last character from the current answer
function getLastCharacter(text) {
    return text.slice(-1);
}

// Combine half consonant with vowel to form full consonant
function combineHalfConsonantWithVowel(halfConsonant, vowel) {
    // Check if consonantMap is loaded from consonants.js
    if (typeof consonantMap === 'undefined') {
        console.error('consonantMap not loaded from consonants.js');
        return halfConsonant + vowel;
    }
    
    if (consonantMap[halfConsonant] && consonantMap[halfConsonant][vowel]) {
        return consonantMap[halfConsonant][vowel];
    }
    
    // If no mapping found, just return the original combination
    return halfConsonant + vowel;
}

// Update input display
function updateInputDisplay() {
    kannadaInputEl.value = currentAnswer;
}

// Load a new word
function loadNewWord() {
    console.log('loadNewWord called');
    console.log('englishWordEl:', englishWordEl);
    
    // Check if vocabulary is loaded
    if (typeof vocabulary === 'undefined' || !vocabulary || vocabulary.length === 0) {
        console.error('Vocabulary not loaded yet!');
        setTimeout(() => {
            console.log('Retrying loadNewWord...');
            loadNewWord();
        }, 100);
        return;
    }
    
    console.log('vocabulary length:', vocabulary.length);
    
    // Reset used words if all words have been used
    if (usedWords.length === vocabulary.length) {
        usedWords = [];
    }
    // Find a word that hasn't been used (track by English word string)
    let availableWords = vocabulary.filter(word => !usedWords.includes(word.english));
    if (availableWords.length === 0) {
        // All words used, reset and use all
        availableWords = [...vocabulary];
        usedWords = [];
    }
    // If only one word is available, use it
    if (availableWords.length === 1) {
        currentWord = availableWords[0];
    } else {
        // Pick a word that is not the current word
        let filtered = availableWords.filter(word => !currentWord || word.english !== currentWord.english);
        if (filtered.length === 0) {
            filtered = availableWords;
        }
        currentWord = filtered[Math.floor(Math.random() * filtered.length)];
    }
    usedWords.push(currentWord.english);
    
    console.log('Selected word:', currentWord);
    
    // Update display
    if (englishWordEl) {
        englishWordEl.textContent = currentWord.english;
        console.log('Updated englishWordEl with:', currentWord.english);
    } else {
        console.error('englishWordEl is null!');
    }
    currentAnswer = '';
    updateInputDisplay();
    clearFeedback();
}

// Check answer
function checkAnswer() {
    if (!currentWord) return;
    
    const userAnswer = currentAnswer.trim();
    const correctAnswer = currentWord.kannada.trim();
    
    if (userAnswer === correctAnswer) {
        showFeedback('Correct! Well done! 🎉', 'correct');
        console.log('Setting timeout for next word...');
        setTimeout(() => {
            console.log('Loading next word...');
            loadNewWord();
        }, 2000);
    } else {
        showFeedback(`Incorrect. The correct answer is: ${correctAnswer}`, 'incorrect');
        console.log('Setting timeout for next word (incorrect answer)...');
        setTimeout(() => {
            console.log('Loading next word (incorrect answer)...');
            loadNewWord();
        }, 2000);
    }
}

// Show feedback
function showFeedback(message, type) {
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback ${type}`;
}

// Clear feedback
function clearFeedback() {
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
}

// Show answer
function showAnswer() {
    if (!currentWord) return;
    showFeedback(`The answer is: ${currentWord.kannada}`, 'hint');
    console.log('Setting timeout for next word (show answer)...');
    setTimeout(() => {
        console.log('Loading next word (show answer)...');
        loadNewWord();
    }, 2000);
}

// Start new game
function newGame() {
    usedWords = [];
    loadNewWord();
    clearFeedback();
}

// Setup event listeners
function setupEventListeners() {
    checkBtn.addEventListener('click', checkAnswer);
    showAnswerBtn.addEventListener('click', showAnswer);
    
    // Set up responsive keyboard
    setupResponsiveKeyboard();

    // Keyboard input
    kannadaInputEl.addEventListener('input', (e) => {
        currentAnswer = e.target.value;
        updateInputDisplay();
    });
    
    // Enter key to check answer
    kannadaInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Backspace key (only for keyboard mode)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && document.activeElement !== kannadaInputEl) {
            const lastHalfConsonant = getLastHalfConsonant(currentAnswer);
            if (lastHalfConsonant) {
                currentAnswer = currentAnswer.slice(0, -lastHalfConsonant.length);
            } else {
                currentAnswer = currentAnswer.slice(0, -1);
            }
            updateInputDisplay();
        }
    });
}

// Add some CSS for keyboard sections
const style = document.createElement('style');
style.textContent = `
    .keyboard-section {
        margin-bottom: 20px;
    }
    
    .keyboard-section h4 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 10px;
        font-size: 1.1rem;
    }
    
    .key.number {
        background: #e8f5e8;
        border-color: #4caf50;
    }
    
    .key.special {
        background: #fff8e1;
        border-color: #ffc107;
    }
    
    .key.half-consonant {
        background: #fce4ec;
        border-color: #e91e63;
    }
    
    /* Remove English word box styling and reduce spacing */
    .english-word {
        background: none !important;
        border: none !important;
        box-shadow: none !important;
        padding: 5px 0 !important;
        margin: 5px 0 !important;
        font-size: 2.5rem !important;
        font-weight: bold !important;
        color: #2c3e50 !important;
        text-align: center !important;
    }
    
    /* Reduce spacing in question area */
    .question-area {
        margin-bottom: 8px !important;
        padding: 5px 0 !important;
    }
    
    /* Reduce spacing in answer area */
    .answer-area {
        margin-top: 8px !important;
        margin-bottom: 8px !important;
        padding: 5px 0 !important;
    }
    
    /* Compact input container */
    .input-container {
        margin-bottom: 8px !important;
        gap: 6px !important;
    }
    
    /* Reduce input field padding */
    #kannadaInput {
        padding: 8px 12px !important;
        margin: 5px 0 !important;
    }
    
    /* Space key styling - larger size */
    .key.space {
        background: #e8f5e8 !important;
        border-color: #4caf50 !important;
        font-weight: bold;
        min-width: 80px !important;
        max-width: 120px !important;
        flex: 0 0 auto;
    }
    
    .key.space:hover {
        background: #4caf50 !important;
        color: white !important;
    }
    
    /* Responsive space key sizing */
    @media (min-width: 1024px) {
        .key.space {
            min-width: 120px !important;
            max-width: 150px !important;
        }
    }
    
    @media (max-width: 768px) and (min-width: 481px) {
        .key.space {
            min-width: 80px !important;
            max-width: 100px !important;
        }
        
        .english-word {
            font-size: 2.2rem !important;
        }
    }
    
    @media (max-width: 480px) {
        .key.space {
            min-width: 60px !important;
            max-width: 80px !important;
            font-size: 0.9rem;
        }
        
        .english-word {
            font-size: 2rem !important;
            padding: 3px 0 !important;
            margin: 3px 0 !important;
        }
        
        .question-area {
            padding: 3px 0 !important;
            margin-bottom: 5px !important;
        }
        
        .answer-area {
            margin-top: 5px !important;
            margin-bottom: 5px !important;
        }
    }
    
    @media (max-width: 360px) {
        .key.space {
            min-width: 50px !important;
            max-width: 70px !important;
            font-size: 0.8rem;
        }
        
        .english-word {
            font-size: 1.8rem !important;
        }
    }
`;
document.head.appendChild(style);

// Calculate optimal keys per row based on screen width
function calculateOptimalKeysPerRow() {
    const screenWidth = window.innerWidth;
    const containerPadding = 10; // Approximate padding from container
    const keyMinWidth = 35; // Minimum key width in pixels
    const keyGap = 4; // Gap between keys
    
    // Calculate available width for keys
    const availableWidth = screenWidth - (containerPadding * 2);
    
    // Calculate maximum keys that can fit
    const maxKeysPerRow = Math.floor(availableWidth / (keyMinWidth + keyGap));
    
    // Set reasonable limits based on screen size
    let optimalKeys;
    
    if (screenWidth <= 480) {
        // Very small screens (phones in portrait)
        optimalKeys = Math.min(maxKeysPerRow, 8);
    } else if (screenWidth <= 768) {
        // Small screens (phones in landscape, small tablets)
        optimalKeys = Math.min(maxKeysPerRow, 10);
    } else if (screenWidth <= 1024) {
        // Medium screens (tablets, small laptops)
        optimalKeys = Math.min(maxKeysPerRow, 12);
    } else {
        // Large screens (laptops, desktops)
        optimalKeys = Math.min(maxKeysPerRow, 15);
    }
    
    // Ensure minimum of 6 keys per row
    return Math.max(optimalKeys, 6);
}

// Add a resize listener to recreate keyboard when screen size changes
function setupResponsiveKeyboard() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('Screen resized, recreating keyboard...');
            createKeyboard();
        }, 250); // Debounce resize events
    });
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
