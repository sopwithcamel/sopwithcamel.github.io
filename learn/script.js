// Vocabulary data from the notebook
const vocabulary = [
    { english: "full moon", kannada: "ಹುಣ್ಣಿಮೆ" },
    { english: "soil", kannada: "ಮಣ್ಣು" },   
    { english: "tears", kannada: "ಕಣ್ಣೀರು" },
    { english: "design", kannada: "ಚಿತ್ತಾರ" },
    { english: "encouragement", kannada: "ಉತ್ತೇಜನ" },
    { english: "neck", kannada: "ಕುತ್ತಿಗೆ" },
    { english: "charcoal", kannada: "ಇದ್ದಿಲು" },
    { english: "highway", kannada: "ಹೆದ್ದಾರಿ" },
    { english: "ragi ball", kannada: "ರಾಗಿ ಮುದ್ದೆ" },
    { english: "situation", kannada: "ಸನ್ನಿವೇಶ" },
    { english: "background", kannada: "ಹಿನ್ನೆಲೆ" },
    { english: "spectacles", kannada: "ಕನ್ನಡಕ" },
    { english: "seashell", kannada: "ಕಪ್ಪೆಚಿಪ್ಪು" },
    { english: "pickle", kannada: "ಉಪ್ಪಿನಕಾಯಿ" },
    { english: "clap", kannada: "ಚಪ್ಪಾಳೆ" },
    { english: "iron", kannada: "ಕಬ್ಬಿಣ" },
    { english: "python", kannada: "ಹೆಬ್ಬಾವು" },
    { english: "darkness", kannada: "ಮಬ್ಬು" },
    { english: "blacksmith", kannada: "ಕಮ್ಮಾರ" }
];

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
let score = 0;
let streak = 0;
let totalAnswered = 0;
let usedWords = [];

// DOM elements
const englishWordEl = document.getElementById('englishWord');
const kannadaInputEl = document.getElementById('kannadaInput');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const totalEl = document.getElementById('total');
const checkBtn = document.getElementById('checkBtn');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const keyboardEl = document.getElementById('kannadaKeyboard');

// Initialize the game
function initGame() {
    createKeyboard();
    loadNewWord();
    setupEventListeners();
    updateScoreDisplay();
    compactLayout();
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
    // Calculate keys per row for compactness (e.g., 12 per row)
    const keysPerRow = 12;
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
// Compact layout adjustments
function compactLayout() {
    // Scoreboard: move to single row
    const scoreboard = document.createElement('div');
    scoreboard.id = 'scoreboardRow';
    scoreboard.style.display = 'flex';
    scoreboard.style.justifyContent = 'center';
    scoreboard.style.alignItems = 'center';
    scoreboard.style.gap = '16px';
    scoreboard.style.marginBottom = '8px';
    scoreboard.innerHTML = `
        <span>Score: <span id="score"></span></span>
        <span>Streak: <span id="streak"></span></span>
        <span>Total: <span id="total"></span></span>
    `;
    // Replace old scoreboard
    const oldScore = document.getElementById('score');
    if (oldScore && oldScore.parentElement) {
        oldScore.parentElement.parentElement.replaceWith(scoreboard);
    }
    // Move buttons next to text box
    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.alignItems = 'center';
    inputRow.style.gap = '8px';
    inputRow.style.marginBottom = '8px';
    inputRow.appendChild(document.getElementById('kannadaInput'));
    inputRow.appendChild(document.getElementById('checkBtn'));
    inputRow.appendChild(document.getElementById('showAnswerBtn'));
    // Place input row before keyboard
    const kb = document.getElementById('kannadaKeyboard');
    kb.parentElement.insertBefore(inputRow, kb);
    // Compact keyboard style
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-row.compact-row {
            display: flex;
            gap: 2px;
            margin-bottom: 2px;
        }
        .key {
            flex: 1 1 0;
            min-width: 0;
            padding: 6px 0;
            font-size: 1.1rem;
            text-align: center;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: #f9f9f9;
            margin: 0;
        }
        .key.space {
            flex: 2 1 0;
        }
        #scoreboardRow span {
            font-size: 1rem;
        }
    `;
    document.head.appendChild(style);
}
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
    const consonantMap = {
        'ಕ್': { 'ಅ': 'ಕ', 'ಆ': 'ಕಾ', 'ಇ': 'ಕಿ', 'ಈ': 'ಕೀ', 'ಉ': 'ಕು', 'ಊ': 'ಕೂ', 'ಋ': 'ಕೃ', 'ೠ': 'ಕೄ', 'ಎ': 'ಕೆ', 'ಏ': 'ಕೇ', 'ಐ': 'ಕೈ', 'ಒ': 'ಕೊ', 'ಓ': 'ಕೋ', 'ಔ': 'ಕೌ' },
        'ಖ್': { 'ಅ': 'ಖ', 'ಆ': 'ಖಾ', 'ಇ': 'ಖಿ', 'ಈ': 'ಖೀ', 'ಉ': 'ಖು', 'ಊ': 'ಖೂ', 'ಋ': 'ಖೃ', 'ೠ': 'ಖೄ', 'ಎ': 'ಖೆ', 'ಏ': 'ಖೇ', 'ಐ': 'ಖೈ', 'ಒ': 'ಖೊ', 'ಓ': 'ಖೋ', 'ಔ': 'ಖೌ' },
        'ಗ್': { 'ಅ': 'ಗ', 'ಆ': 'ಗಾ', 'ಇ': 'ಗಿ', 'ಈ': 'ಗೀ', 'ಉ': 'ಗು', 'ಊ': 'ಗೂ', 'ಋ': 'ಗೃ', 'ೠ': 'ಗೄ', 'ಎ': 'ಗೆ', 'ಏ': 'ಗೇ', 'ಐ': 'ಗೈ', 'ಒ': 'ಗೊ', 'ಓ': 'ಗೋ', 'ಔ': 'ಗೌ' },
        'ಘ್': { 'ಅ': 'ಘ', 'ಆ': 'ಘಾ', 'ಇ': 'ಘಿ', 'ಈ': 'ಘೀ', 'ಉ': 'ಘು', 'ಊ': 'ಘೂ', 'ಋ': 'ಘೃ', 'ೠ': 'ಘೄ', 'ಎ': 'ಘೆ', 'ಏ': 'ಘೇ', 'ಐ': 'ಘೈ', 'ಒ': 'ಘೊ', 'ಓ': 'ಘೋ', 'ಔ': 'ಘೌ' },
        'ಙ್': { 'ಅ': 'ಙ', 'ಆ': 'ಙಾ', 'ಇ': 'ಙಿ', 'ಈ': 'ಙೀ', 'ಉ': 'ಙು', 'ಊ': 'ಙೂ', 'ಋ': 'ಙೃ', 'ೠ': 'ಙೄ', 'ಎ': 'ಙೆ', 'ಏ': 'ಙೇ', 'ಐ': 'ಙೈ', 'ಒ': 'ಙೊ', 'ಓ': 'ಙೋ', 'ಔ': 'ಙೌ' },
        'ಚ್': { 'ಅ': 'ಚ', 'ಆ': 'ಚಾ', 'ಇ': 'ಚಿ', 'ಈ': 'ಚೀ', 'ಉ': 'ಚು', 'ಊ': 'ಚೂ', 'ಋ': 'ಚೃ', 'ೠ': 'ಚೄ', 'ಎ': 'ಚೆ', 'ಏ': 'ಚೇ', 'ಐ': 'ಚೈ', 'ಒ': 'ಚೊ', 'ಓ': 'ಚೋ', 'ಔ': 'ಚೌ' },
        'ಛ್': { 'ಅ': 'ಛ', 'ಆ': 'ಛಾ', 'ಇ': 'ಛಿ', 'ಈ': 'ಛೀ', 'ಉ': 'ಛು', 'ಊ': 'ಛೂ', 'ಋ': 'ಛೃ', 'ೠ': 'ಛೄ', 'ಎ': 'ಛೆ', 'ಏ': 'ಛೇ', 'ಐ': 'ಛೈ', 'ಒ': 'ಛೊ', 'ಓ': 'ಛೋ', 'ಔ': 'ಛೌ' },
        'ಜ್': { 'ಅ': 'ಜ', 'ಆ': 'ಜಾ', 'ಇ': 'ಜಿ', 'ಈ': 'ಜೀ', 'ಉ': 'ಜು', 'ಊ': 'ಜೂ', 'ಋ': 'ಜೃ', 'ೠ': 'ಜೄ', 'ಎ': 'ಜೆ', 'ಏ': 'ಜೇ', 'ಐ': 'ಜೈ', 'ಒ': 'ಜೊ', 'ಓ': 'ಜೋ', 'ಔ': 'ಜೌ' },
        'ಝ್': { 'ಅ': 'ಝ', 'ಆ': 'ಝಾ', 'ಇ': 'ಝಿ', 'ಈ': 'ಝೀ', 'ಉ': 'ಝು', 'ಊ': 'ಝೂ', 'ಋ': 'ಝೃ', 'ೠ': 'ಝೄ', 'ಎ': 'ಝೆ', 'ಏ': 'ಝೇ', 'ಐ': 'ಝೈ', 'ಒ': 'ಝೊ', 'ಓ': 'ಝೋ', 'ಔ': 'ಝೌ' },
        'ಞ್': { 'ಅ': 'ಞ', 'ಆ': 'ಞಾ', 'ಇ': 'ಞಿ', 'ಈ': 'ಞೀ', 'ಉ': 'ಞು', 'ಊ': 'ಞೂ', 'ಋ': 'ಞೃ', 'ೠ': 'ಞೄ', 'ಎ': 'ಞೆ', 'ಏ': 'ಞೇ', 'ಐ': 'ಞೈ', 'ಒ': 'ಞೊ', 'ಓ': 'ಞೋ', 'ಔ': 'ಞೌ' },
        'ಟ್': { 'ಅ': 'ಟ', 'ಆ': 'ಟಾ', 'ಇ': 'ಟಿ', 'ಈ': 'ಟೀ', 'ಉ': 'ಟು', 'ಊ': 'ಟೂ', 'ಋ': 'ಟೃ', 'ೠ': 'ಟೄ', 'ಎ': 'ಟೆ', 'ಏ': 'ಟೇ', 'ಐ': 'ಟೈ', 'ಒ': 'ಟೊ', 'ಓ': 'ಟೋ', 'ಔ': 'ಟೌ' },
        'ಠ್': { 'ಅ': 'ಠ', 'ಆ': 'ಠಾ', 'ಇ': 'ಠಿ', 'ಈ': 'ಠೀ', 'ಉ': 'ಠು', 'ಊ': 'ಠೂ', 'ಋ': 'ಠೃ', 'ೠ': 'ಠೄ', 'ಎ': 'ಠೆ', 'ಏ': 'ಠೇ', 'ಐ': 'ಠೈ', 'ಒ': 'ಠೊ', 'ಓ': 'ಠೋ', 'ಔ': 'ಠೌ' },
        'ಡ್': { 'ಅ': 'ಡ', 'ಆ': 'ಡಾ', 'ಇ': 'ಡಿ', 'ಈ': 'ಡೀ', 'ಉ': 'ಡು', 'ಊ': 'ಡೂ', 'ಋ': 'ಡೃ', 'ೠ': 'ಡೄ', 'ಎ': 'ಡೆ', 'ಏ': 'ಡೇ', 'ಐ': 'ಡೈ', 'ಒ': 'ಡೊ', 'ಓ': 'ಡೋ', 'ಔ': 'ಡೌ' },
        'ಢ್': { 'ಅ': 'ಢ', 'ಆ': 'ಢಾ', 'ಇ': 'ಢಿ', 'ಈ': 'ಢೀ', 'ಉ': 'ಢು', 'ಊ': 'ಢೂ', 'ಋ': 'ಢೃ', 'ೠ': 'ಢೄ', 'ಎ': 'ಢೆ', 'ಏ': 'ಢೇ', 'ಐ': 'ಢೈ', 'ಒ': 'ಢೊ', 'ಓ': 'ಢೋ', 'ಔ': 'ಢೌ' },
        'ಣ್': { 'ಅ': 'ಣ', 'ಆ': 'ಣಾ', 'ಇ': 'ಣಿ', 'ಈ': 'ಣೀ', 'ಉ': 'ಣು', 'ಊ': 'ಣೂ', 'ಋ': 'ಣೃ', 'ೠ': 'ಣೄ', 'ಎ': 'ಣೆ', 'ಏ': 'ಣೇ', 'ಐ': 'ಣೈ', 'ಒ': 'ಣೊ', 'ಓ': 'ಣೋ', 'ಔ': 'ಣೌ' },
        'ತ್': { 'ಅ': 'ತ', 'ಆ': 'ತಾ', 'ಇ': 'ತಿ', 'ಈ': 'ತೀ', 'ಉ': 'ತು', 'ಊ': 'ತೂ', 'ಋ': 'ತೃ', 'ೠ': 'ತೄ', 'ಎ': 'ತೆ', 'ಏ': 'ತೇ', 'ಐ': 'ತೈ', 'ಒ': 'ತೊ', 'ಓ': 'ತೋ', 'ಔ': 'ತೌ' },
        'ಥ್': { 'ಅ': 'ಥ', 'ಆ': 'ಥಾ', 'ಇ': 'ಥಿ', 'ಈ': 'ಥೀ', 'ಉ': 'ಥು', 'ಊ': 'ಥೂ', 'ಋ': 'ಥೃ', 'ೠ': 'ಥೄ', 'ಎ': 'ಥೆ', 'ಏ': 'ಥೇ', 'ಐ': 'ಥೈ', 'ಒ': 'ಥೊ', 'ಓ': 'ಥೋ', 'ಔ': 'ಥೌ' },
        'ದ್': { 'ಅ': 'ದ', 'ಆ': 'ದಾ', 'ಇ': 'ದಿ', 'ಈ': 'ದೀ', 'ಉ': 'ದು', 'ಊ': 'ದೂ', 'ಋ': 'ದೃ', 'ೠ': 'ದೄ', 'ಎ': 'ದೆ', 'ಏ': 'ದೇ', 'ಐ': 'ದೈ', 'ಒ': 'ದೊ', 'ಓ': 'ದೋ', 'ಔ': 'ದೌ' },
        'ಧ್': { 'ಅ': 'ಧ', 'ಆ': 'ಧಾ', 'ಇ': 'ಧಿ', 'ಈ': 'ಧೀ', 'ಉ': 'ಧು', 'ಊ': 'ಧೂ', 'ಋ': 'ಧೃ', 'ೠ': 'ಧೄ', 'ಎ': 'ಧೆ', 'ಏ': 'ಧೇ', 'ಐ': 'ಧೈ', 'ಒ': 'ಧೊ', 'ಓ': 'ಧೋ', 'ಔ': 'ಧೌ' },
        'ನ್': { 'ಅ': 'ನ', 'ಆ': 'ನಾ', 'ಇ': 'ನಿ', 'ಈ': 'ನೀ', 'ಉ': 'ನು', 'ಊ': 'ನೂ', 'ಋ': 'ನೃ', 'ೠ': 'ನೄ', 'ಎ': 'ನೆ', 'ಏ': 'ನೇ', 'ಐ': 'ನೈ', 'ಒ': 'ನೊ', 'ಓ': 'ನೋ', 'ಔ': 'ನೌ' },
        'ಪ್': { 'ಅ': 'ಪ', 'ಆ': 'ಪಾ', 'ಇ': 'ಪಿ', 'ಈ': 'ಪೀ', 'ಉ': 'ಪು', 'ಊ': 'ಪೂ', 'ಋ': 'ಪೃ', 'ೠ': 'ಪೄ', 'ಎ': 'ಪೆ', 'ಏ': 'ಪೇ', 'ಐ': 'ಪೈ', 'ಒ': 'ಪೊ', 'ಓ': 'ಪೋ', 'ಔ': 'ಪೌ' },
        'ಫ್': { 'ಅ': 'ಫ', 'ಆ': 'ಫಾ', 'ಇ': 'ಫಿ', 'ಈ': 'ಫೀ', 'ಉ': 'ಫು', 'ಊ': 'ಫೂ', 'ಋ': 'ಫೃ', 'ೠ': 'ಫೄ', 'ಎ': 'ಫೆ', 'ಏ': 'ಫೇ', 'ಐ': 'ಫೈ', 'ಒ': 'ಫೊ', 'ಓ': 'ಫೋ', 'ಔ': 'ಫೌ' },
        'ಬ್': { 'ಅ': 'ಬ', 'ಆ': 'ಬಾ', 'ಇ': 'ಬಿ', 'ಈ': 'ಬೀ', 'ಉ': 'ಬು', 'ಊ': 'ಬೂ', 'ಋ': 'ಬೃ', 'ೠ': 'ಬೄ', 'ಎ': 'ಬೆ', 'ಏ': 'ಬೇ', 'ಐ': 'ಬೈ', 'ಒ': 'ಬೊ', 'ಓ': 'ಬೋ', 'ಔ': 'ಬೌ' },
        'ಭ್': { 'ಅ': 'ಭ', 'ಆ': 'ಭಾ', 'ಇ': 'ಭಿ', 'ಈ': 'ಭೀ', 'ಉ': 'ಭು', 'ಊ': 'ಭೂ', 'ಋ': 'ಭೃ', 'ೠ': 'ಭೄ', 'ಎ': 'ಭೆ', 'ಏ': 'ಭೇ', 'ಐ': 'ಭೈ', 'ಒ': 'ಭೊ', 'ಓ': 'ಭೋ', 'ಔ': 'ಭೌ' },
        'ಮ್': { 'ಅ': 'ಮ', 'ಆ': 'ಮಾ', 'ಇ': 'ಮಿ', 'ಈ': 'ಮೀ', 'ಉ': 'ಮು', 'ಊ': 'ಮೂ', 'ಋ': 'ಮೃ', 'ೠ': 'ಮೄ', 'ಎ': 'ಮೆ', 'ಏ': 'ಮೇ', 'ಐ': 'ಮೈ', 'ಒ': 'ಮೊ', 'ಓ': 'ಮೋ', 'ಔ': 'ಮೌ' },
        'ಯ್': { 'ಅ': 'ಯ', 'ಆ': 'ಯಾ', 'ಇ': 'ಯಿ', 'ಈ': 'ಯೀ', 'ಉ': 'ಯು', 'ಊ': 'ಯೂ', 'ಋ': 'ಯೃ', 'ೠ': 'ಯೄ', 'ಎ': 'ಯೆ', 'ಏ': 'ಯೇ', 'ಐ': 'ಯೈ', 'ಒ': 'ಯೊ', 'ಓ': 'ಯೋ', 'ಔ': 'ಯೌ' },
        'ರ್': { 'ಅ': 'ರ', 'ಆ': 'ರಾ', 'ಇ': 'ರಿ', 'ಈ': 'ರೀ', 'ಉ': 'ರು', 'ಊ': 'ರೂ', 'ಋ': 'ರೃ', 'ೠ': 'ರೄ', 'ಎ': 'ರೆ', 'ಏ': 'ರೇ', 'ಐ': 'ರೈ', 'ಒ': 'ರೊ', 'ಓ': 'ರೋ', 'ಔ': 'ರೌ' },
        'ಲ್': { 'ಅ': 'ಲ', 'ಆ': 'ಲಾ', 'ಇ': 'ಲಿ', 'ಈ': 'ಲೀ', 'ಉ': 'ಲು', 'ಊ': 'ಲೂ', 'ಋ': 'ಲೃ', 'ೠ': 'ಲೄ', 'ಎ': 'ಲೆ', 'ಏ': 'ಲೇ', 'ಐ': 'ಲೈ', 'ಒ': 'ಲೊ', 'ಓ': 'ಲೋ', 'ಔ': 'ಲೌ' },
        'ವ್': { 'ಅ': 'ವ', 'ಆ': 'ವಾ', 'ಇ': 'ವಿ', 'ಈ': 'ವೀ', 'ಉ': 'ವು', 'ಊ': 'ವೂ', 'ಋ': 'ವೃ', 'ೠ': 'ವೄ', 'ಎ': 'ವೆ', 'ಏ': 'ವೇ', 'ಐ': 'ವೈ', 'ಒ': 'ವೊ', 'ಓ': 'ವೋ', 'ಔ': 'ವೌ' },
        'ಶ್': { 'ಅ': 'ಶ', 'ಆ': 'ಶಾ', 'ಇ': 'ಶಿ', 'ಈ': 'ಶೀ', 'ಉ': 'ಶು', 'ಊ': 'ಶೂ', 'ಋ': 'ಶೃ', 'ೠ': 'ಶೄ', 'ಎ': 'ಶೆ', 'ಏ': 'ಶೇ', 'ಐ': 'ಶೈ', 'ಒ': 'ಶೊ', 'ಓ': 'ಶೋ', 'ಔ': 'ಶೌ' },
        'ಷ್': { 'ಅ': 'ಷ', 'ಆ': 'ಷಾ', 'ಇ': 'ಷಿ', 'ಈ': 'ಷೀ', 'ಉ': 'ಷು', 'ಊ': 'ಷೂ', 'ಋ': 'ಷೃ', 'ೠ': 'ಷೄ', 'ಎ': 'ಷೆ', 'ಏ': 'ಷೇ', 'ಐ': 'ಷೈ', 'ಒ': 'ಷೊ', 'ಓ': 'ಷೋ', 'ಔ': 'ಷೌ' },
        'ಸ್': { 'ಅ': 'ಸ', 'ಆ': 'ಸಾ', 'ಇ': 'ಸಿ', 'ಈ': 'ಸೀ', 'ಉ': 'ಸು', 'ಊ': 'ಸೂ', 'ಋ': 'ಸೃ', 'ೠ': 'ಸೄ', 'ಎ': 'ಸೆ', 'ಏ': 'ಸೇ', 'ಐ': 'ಸೈ', 'ಒ': 'ಸೊ', 'ಓ': 'ಸೋ', 'ಔ': 'ಸೌ' },
        'ಹ್': { 'ಅ': 'ಹ', 'ಆ': 'ಹಾ', 'ಇ': 'ಹಿ', 'ಈ': 'ಹೀ', 'ಉ': 'ಹು', 'ಊ': 'ಹೂ', 'ಋ': 'ಹೃ', 'ೠ': 'ಹೄ', 'ಎ': 'ಹೆ', 'ಏ': 'ಹೇ', 'ಐ': 'ಹೈ', 'ಒ': 'ಹೊ', 'ಓ': 'ಹೋ', 'ಔ': 'ಹೌ' },
        'ಳ್': { 'ಅ': 'ಳ', 'ಆ': 'ಳಾ', 'ಇ': 'ಳಿ', 'ಈ': 'ಳೀ', 'ಉ': 'ಳು', 'ಊ': 'ಳೂ', 'ಋ': 'ಳೃ', 'ೠ': 'ಳೄ', 'ಎ': 'ಳೆ', 'ಏ': 'ಳೇ', 'ಐ': 'ಳೈ', 'ಒ': 'ಳೊ', 'ಓ': 'ಳೋ', 'ಔ': 'ಳೌ' },
        'ೞ್': { 'ಅ': 'ೞ', 'ಆ': 'ೞಾ', 'ಇ': 'ೞಿ', 'ಈ': 'ೞೀ', 'ಉ': 'ೞು', 'ಊ': 'ೞೂ', 'ಋ': 'ೞೃ', 'ೠ': 'ೞೄ', 'ಎ': 'ೞೆ', 'ಏ': 'ೞೇ', 'ಐ': 'ೞೈ', 'ಒ': 'ೞೊ', 'ಓ': 'ೞೋ', 'ಔ': 'ೞೌ' }
    };
    
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
    // Reset used words if all words have been used
    if (usedWords.length === vocabulary.length) {
        usedWords = [];
    }
    
    // Find a word that hasn't been used
    let availableWords = vocabulary.filter(word => !usedWords.includes(word));
    currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(currentWord);
    
    // Update display
    englishWordEl.textContent = currentWord.english;
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
        score += 10 + (streak * 2);
        streak++;
    } else {
        showFeedback(`Incorrect. The correct answer is: ${correctAnswer}`, 'incorrect');
        streak = 0;
    }
    
    totalAnswered++;
    updateScoreDisplay();
    
    // Load next word after a delay
    setTimeout(() => {
        loadNewWord();
    }, 2000);
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

// Update score display
function updateScoreDisplay() {
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    totalEl.textContent = totalAnswered;
}

// Show answer
function showAnswer() {
    if (!currentWord) return;
    showFeedback(`The answer is: ${currentWord.kannada}`, 'hint');
    streak = 0;
    totalAnswered++;
    updateScoreDisplay();
    setTimeout(() => {
        loadNewWord();
    }, 2000);
}

// Start new game
function newGame() {
    score = 0;
    streak = 0;
    totalAnswered = 0;
    usedWords = [];
    updateScoreDisplay();
    loadNewWord();
    clearFeedback();
}

// Setup event listeners
function setupEventListeners() {
    checkBtn.addEventListener('click', checkAnswer);
    showAnswerBtn.addEventListener('click', showAnswer);
    
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
    
    // Backspace key
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
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
