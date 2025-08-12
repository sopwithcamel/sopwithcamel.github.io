# ಕನ್ನಡ ಪದ ಕಲಿಕೆ ಆಟ (Kannada Word Learning Game)

A fun and interactive HTML5 game to learn Kannada vocabulary based on your notebook entries. The game presents English words and challenges you to type the corresponding Kannada words using a built-in Kannada keyboard.

## Features

### 🎮 Game Mechanics
- **Vocabulary Testing**: 18 Kannada words from your notebook with English translations
- **Scoring System**: Earn points for correct answers with bonus points for streaks
- **Progress Tracking**: Monitor your score, streak, and total questions answered
- **Random Word Selection**: Words are presented in random order without repetition

### ⌨️ Kannada Keyboard
- **Complete Character Set**: All vowels (ಸ್ವರಗಳು) and consonants (ವ್ಯಂಜನಗಳು)
- **Special Characters**: Halant (್), numbers (೦-೯), and other special symbols
- **Color-Coded Keys**: Different colors for vowels, consonants, numbers, and special characters
- **Control Keys**: Space, Backspace, and Enter functionality

### 🎨 User Interface
- **Modern Design**: Beautiful gradient backgrounds and smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Visual Feedback**: Clear feedback for correct/incorrect answers
- **Accessibility**: Keyboard shortcuts and intuitive controls

## Vocabulary Included

The game includes all 18 words from your notebook:

| English | Kannada |
|---------|---------|
| full moon | ಹುಣ್ಣಿಮೆ |
| tears | ಕಣ್ಣೀರು |
| design | ವಿನ್ಯಾಸ |
| encouragement | ಪ್ರೋತ್ಸಾಹ |
| neck | ಕುತ್ತಿಗೆ |
| charcoal | ಇಂಗಾಲ |
| highway | ಹೆದ್ದಾರಿ |
| ragi ball | ರಾಗಿ ಮುದ್ದೆ |
| situation | ಸ್ಥಿತಿ |
| background | ಹಿನ್ನೆಲೆ |
| spectator | ಪ್ರೇಕ್ಷಕ |
| seashell | ಶಂಖ |
| pickle | ಉಪ್ಪಿನಕಾಯಿ |
| clap | ಚಪ್ಪಾಳೆ |
| iron | ಕಬ್ಬಿಣ |
| python | ಹೆಬ್ಬಾವು |
| darkness | ಕತ್ತಲೆ |
| blacksmith | ಕಮ್ಮಾರ |

## How to Play

1. **Start the Game**: Open `index.html` in your web browser
2. **Read the Question**: Look at the English word displayed
3. **Type the Answer**: Use the Kannada keyboard to type the corresponding Kannada word
4. **Submit Answer**: Click "Check Answer" or press Enter
5. **Review Feedback**: See if your answer was correct
6. **Continue**: The game automatically loads the next word after 2 seconds

## Controls

### Keyboard Shortcuts
- **Enter**: Submit answer
- **Backspace**: Delete last character
- **Space**: Add space between words

### Mouse Controls
- **Click keys**: Type Kannada characters
- **Check Answer**: Verify your response
- **Skip**: Move to next word (resets streak)
- **New Game**: Start over with fresh score

## Scoring System

- **Correct Answer**: 10 points + (streak × 2) bonus points
- **Incorrect Answer**: 0 points, streak resets to 0
- **Skip**: 0 points, streak resets to 0
- **Streak Bonus**: Build consecutive correct answers for higher scores

## Technical Details

### Files Structure
```
learningfun/
├── index.html      # Main game interface
├── styles.css      # Styling and responsive design
├── script.js       # Game logic and keyboard implementation
└── README.md       # This documentation
```

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Technologies Used
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Game logic, keyboard implementation, and DOM manipulation

## Getting Started

1. **Download/Clone**: Get all the files in a folder
2. **Open**: Double-click `index.html` or open it in your web browser
3. **Play**: Start learning Kannada vocabulary immediately!

No installation or internet connection required - the game runs entirely in your browser.

## Customization

### Adding More Words
To add more vocabulary, edit the `vocabulary` array in `script.js`:

```javascript
const vocabulary = [
    { english: "new word", kannada: "ಹೊಸ ಪದ" },
    // ... existing words
];
```

### Modifying the Keyboard
The Kannada keyboard layout can be customized in the `kannadaKeyboard` object in `script.js`.

## Learning Tips

1. **Practice Regularly**: Use the game daily to reinforce vocabulary
2. **Build Streaks**: Focus on accuracy to build high-scoring streaks
3. **Use the Keyboard**: Familiarize yourself with the Kannada character layout
4. **Review Mistakes**: Pay attention to feedback to learn from errors
5. **Start New Games**: Reset periodically to test retention

## Future Enhancements

Potential features for future versions:
- Audio pronunciation
- Multiple difficulty levels
- Progress tracking across sessions
- Additional vocabulary categories
- Offline storage for high scores
- Social sharing of achievements

---

**Enjoy learning Kannada! ಸಂತೋಷದಿಂದ ಕನ್ನಡ ಕಲಿಯಿರಿ!** 🇮🇳
