// filepath: /Users/amur/Documents/GitHub/sopwithcamel.github.io/learn/user-stats.js
class UserStats {
    constructor() {
        this.stats = {
            gamesPlayed: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            wordGuesses: new Map() // word -> array of {correct: boolean, date: timestamp}
        };
        // Expertise tracking (not stored, computed from guesses)
        this.wordExpertise = new Map(); // word -> float (0-1)
    }
    
    // =============================================================================
    // TUNING PARAMETERS - Adjust these to fine-tune the expertise calculations
    // =============================================================================
    
    static EXPERTISE_CONFIG = {
        // Word-level expertise calculation
        TIME_DECAY_HALFLIFE_DAYS: 7,           // Days for guess weight to halve
        CONFIDENCE_MIN_ATTEMPTS: 3,            // Attempts needed for full confidence
        CONFIDENCE_UNCERTAIN_BASELINE: 0.5,    // Score for uncertain words (low attempts)
        
        // Overall expertise calculation - coverage thresholds
        COVERAGE_VERY_EARLY_THRESHOLD: 0.1,    // < 10% coverage = very early stage
        COVERAGE_EARLY_THRESHOLD: 0.3,         // < 30% coverage = early stage  
        COVERAGE_MIDDLE_THRESHOLD: 0.7,        // < 70% coverage = middle stage
        
        // Overall expertise calculation - penalties/adjustments
        VERY_EARLY_PENALTY: 0.3,               // Very early: use only 30% of attempted expertise (higher penalty)
        EARLY_MIN_BLEND_FACTOR: 0.5,           // Early: minimum 50% of attempted expertise
        MIDDLE_MAX_PENALTY: 0.3,               // Middle: up to 30% penalty for unattempted
        
        // Garbage collection
        CLEANUP_DAYS_THRESHOLD: 30             // Remove guesses older than 30 days
    };
    
    // =============================================================================
    
    // Reset stats to initial values
    reset() {
        this.stats = {
            gamesPlayed: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            wordGuesses: new Map()
        };
        this.wordExpertise = new Map();
        console.log('User stats reset to initial values');
    }
    
    // Load stats from parsed data (from localStorage or Firestore)
    loadFromData(data) {
        this.stats = {
            ...this.stats,
            ...data,
            wordGuesses: new Map(data.wordGuesses || [])
        };
        console.log('User stats loaded from data:', this.stats);
        
        // Run garbage collection after loading
        this.cleanupOldGuesses();
        
        // Compute expertise for all words with guesses
        this.recomputeAllExpertise();
    }
    
    // Update stats with a new guess
    updateWithGuess(isCorrect, word) {
        this.stats.totalAnswers++;
        
        // Record the guess for this word
        if (!this.stats.wordGuesses.has(word)) {
            this.stats.wordGuesses.set(word, []);
        }
        this.stats.wordGuesses.get(word).push({
            correct: isCorrect,
            date: Date.now()
        });
        
        if (isCorrect) {
            this.stats.correctAnswers++;
        }
        
        // Update expertise for this word
        this.updateWordExpertise(word);
        
        console.log(`Stats updated for word "${word}": ${isCorrect ? 'correct' : 'incorrect'}, expertise: ${this.wordExpertise.get(word)?.toFixed(3)}`);
    }
    
    // Garbage collect guesses older than 30 days
    cleanupOldGuesses() {
        const config = UserStats.EXPERTISE_CONFIG;
        const cleanupThreshold = Date.now() - (config.CLEANUP_DAYS_THRESHOLD * 24 * 60 * 60 * 1000);
        let totalRemovedGuesses = 0;
        let wordsToDelete = [];
        let hasChanges = false;
        
        for (const [word, guesses] of this.stats.wordGuesses) {
            const recentGuesses = guesses.filter(guess => guess.date > cleanupThreshold);
            
            if (recentGuesses.length === 0) {
                // No recent guesses, mark word for deletion
                wordsToDelete.push(word);
                totalRemovedGuesses += guesses.length;
                hasChanges = true;
            } else if (recentGuesses.length < guesses.length) {
                // Some guesses were old, update with only recent ones
                this.stats.wordGuesses.set(word, recentGuesses);
                totalRemovedGuesses += (guesses.length - recentGuesses.length);
                hasChanges = true;
            }
        }
        
        // Remove words with no recent guesses
        wordsToDelete.forEach(word => {
            this.stats.wordGuesses.delete(word);
            // Also remove expertise for deleted words
            this.wordExpertise.delete(word);
        });
        
        if (hasChanges) {
            console.log(`Garbage collection: Removed ${totalRemovedGuesses} old guesses for ${wordsToDelete.length} words`);
            // Recompute expertise after cleanup since recent guesses may have changed
            this.recomputeAllExpertise();
        }
        
        return { hasChanges, totalRemovedGuesses, wordsDeleted: wordsToDelete.length };
    }
    
    // Calculate expertise for a single word based on weighted recent performance
    updateWordExpertise(word) {
        const guesses = this.getWordGuessHistory(word);
        if (guesses.length === 0) {
            this.wordExpertise.delete(word);
            return;
        }
        
        const expertise = this.calculateWordExpertise(guesses);
        this.wordExpertise.set(word, expertise);
    }
    
    // Recompute expertise for all words that have guesses
    recomputeAllExpertise() {
        this.wordExpertise.clear();
        for (const word of this.getAllWordsWithGuesses()) {
            this.updateWordExpertise(word);
        }
        console.log(`Recomputed expertise for ${this.wordExpertise.size} words`);
    }
    
    // Calculate expertise score (0-1) based on weighted recent performance
    calculateWordExpertise(guesses) {
        if (guesses.length === 0) return 0;
        
        const config = UserStats.EXPERTISE_CONFIG;
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
        
        let weightedScore = 0;
        let totalWeight = 0;
        
        // Process guesses with time-based weighting (more recent = higher weight)
        for (const guess of guesses) {
            const daysAgo = (now - guess.date) / oneDay;
            
            // Exponential decay: weight = e^(-daysAgo/halflife)
            // This gives recent guesses much higher weight
            const weight = Math.exp(-daysAgo / config.TIME_DECAY_HALFLIFE_DAYS);
            
            const score = guess.correct ? 1 : 0;
            weightedScore += score * weight;
            totalWeight += weight;
        }
        
        if (totalWeight === 0) return 0;
        
        const rawExpertise = weightedScore / totalWeight;
        
        // Apply confidence adjustment based on number of attempts
        // More attempts = more confidence in the score
        const confidenceMultiplier = Math.min(1, guesses.length / config.CONFIDENCE_MIN_ATTEMPTS);
        
        // For fewer attempts, pull the score toward uncertain baseline
        const adjustedExpertise = rawExpertise * confidenceMultiplier + 
                                  config.CONFIDENCE_UNCERTAIN_BASELINE * (1 - confidenceMultiplier);
        
        // Ensure result is between 0 and 1
        return Math.max(0, Math.min(1, adjustedExpertise));
    }
    
    // Get expertise for a specific word
    getWordExpertise(word) {
        return this.wordExpertise.get(word) || 0;
    }
    
    // Get all words sorted by expertise (lowest to highest - words needing most practice first)
    getWordsByExpertise() {
        const words = this.getAllWordsWithGuesses();
        return words.map(word => ({
            word,
            expertise: this.getWordExpertise(word),
            totalGuesses: this.getTotalGuessesForWord(word),
            accuracy: this.getWordAccuracy(word)
        })).sort((a, b) => a.expertise - b.expertise);
    }
    
    // Calculate overall expertise with progressive coverage adjustment
    getOverallExpertise(totalVocabularySize = 100) {
        const config = UserStats.EXPERTISE_CONFIG;
        const attemptedWords = this.getAllWordsWithGuesses();
        
        if (attemptedWords.length === 0) return 0;
        
        // Calculate average expertise of attempted words
        const totalExpertise = attemptedWords.reduce((sum, word) => {
            return sum + this.getWordExpertise(word);
        }, 0);
        const averageAttemptedExpertise = totalExpertise / attemptedWords.length;
        
        // Coverage ratio (0 to 1)
        const coverageRatio = Math.min(1, attemptedWords.length / totalVocabularySize);
        
        // Progressive adjustment based on coverage milestones
        let adjustedExpertise;
        
        if (coverageRatio < config.COVERAGE_VERY_EARLY_THRESHOLD) {
            // Very early stage (< 10% coverage): Apply higher penalty to prevent overconfidence
            // Use configurable penalty (default 50% of attempted expertise)
            adjustedExpertise = averageAttemptedExpertise * config.VERY_EARLY_PENALTY;
            
        } else if (coverageRatio < config.COVERAGE_EARLY_THRESHOLD) {
            // Early stage (10-30% coverage): Blend attempted expertise with coverage scaling
            // Formula: attemptedExpertise * (min_blend + (1-min_blend) * normalized_coverage)
            const normalizedCoverage = (coverageRatio - config.COVERAGE_VERY_EARLY_THRESHOLD) / 
                                     (config.COVERAGE_EARLY_THRESHOLD - config.COVERAGE_VERY_EARLY_THRESHOLD);
            const blendFactor = config.EARLY_MIN_BLEND_FACTOR + 
                               (1 - config.EARLY_MIN_BLEND_FACTOR) * normalizedCoverage;
            adjustedExpertise = averageAttemptedExpertise * blendFactor;
            
        } else if (coverageRatio < config.COVERAGE_MIDDLE_THRESHOLD) {
            // Middle stage (30-70% coverage): Increasingly factor in unattempted words
            // Gradually transition from attempted-focused to full vocabulary
            const unattentedPenalty = (1 - coverageRatio) * config.MIDDLE_MAX_PENALTY;
            adjustedExpertise = averageAttemptedExpertise * (1 - unattentedPenalty);
            
        } else {
            // Advanced stage (70%+ coverage): Use weighted average of all vocabulary
            // Count unattempted words as 0 expertise, user has proven broad knowledge
            adjustedExpertise = totalExpertise / totalVocabularySize;
        }
        
        // Ensure result is between 0 and 1
        return Math.max(0, Math.min(1, adjustedExpertise));
    }
    
    // Get a detailed expertise summary for analytics/debugging
    getExpertiseSummary(totalVocabularySize = 100) {
        const attemptedWords = this.getAllWordsWithGuesses();
        const coverageRatio = attemptedWords.length / totalVocabularySize;
        
        const expertiseLevels = {
            novice: 0,      // 0.0 - 0.3
            learning: 0,    // 0.3 - 0.6
            proficient: 0,  // 0.6 - 0.8
            expert: 0       // 0.8 - 1.0
        };
        
        attemptedWords.forEach(word => {
            const expertise = this.getWordExpertise(word);
            if (expertise < 0.3) expertiseLevels.novice++;
            else if (expertise < 0.6) expertiseLevels.learning++;
            else if (expertise < 0.8) expertiseLevels.proficient++;
            else expertiseLevels.expert++;
        });
        
        return {
            overallExpertise: this.getOverallExpertise(totalVocabularySize),
            attemptedWords: attemptedWords.length,
            totalVocabulary: totalVocabularySize,
            coverageRatio: coverageRatio,
            distribution: expertiseLevels,
            averageAttemptedExpertise: attemptedWords.length > 0 
                ? attemptedWords.reduce((sum, word) => sum + this.getWordExpertise(word), 0) / attemptedWords.length 
                : 0
        };
    }
    
    // Get current stats object
    getStats() {
        return this.stats;
    }
    
    // Export stats for saving (converts Map to array for JSON compatibility)
    exportForSave() {
        return {
            ...this.stats,
            wordGuesses: Array.from(this.stats.wordGuesses),
            lastUpdated: new Date().toISOString()
        };
    }
    
    // Export stats for Firestore (converts Map to object)
    exportForFirestore() {
        const wordGuessesFlat = {};
        for (const [word, guesses] of this.stats.wordGuesses) {
            wordGuessesFlat[word] = guesses;
        }
        
        return {
            ...this.stats,
            wordGuesses: wordGuessesFlat,
            lastUpdated: new Date().toISOString()
        };
    }
    
    // Calculate accuracy percentage
    getAccuracy() {
        return this.stats.totalAnswers > 0 
            ? Math.round((this.stats.correctAnswers / this.stats.totalAnswers) * 100)
            : 0;
    }
    
    // Helper methods for word guess tracking
    getWordGuessHistory(word) {
        return this.stats.wordGuesses.get(word) || [];
    }
    
    getWordAccuracy(word) {
        const guesses = this.getWordGuessHistory(word);
        if (guesses.length === 0) return 0;
        
        const correctGuesses = guesses.filter(guess => guess.correct).length;
        return Math.round((correctGuesses / guesses.length) * 100);
    }
    
    getTotalGuessesForWord(word) {
        return this.getWordGuessHistory(word).length;
    }
    
    getCorrectGuessesForWord(word) {
        return this.getWordGuessHistory(word).filter(guess => guess.correct).length;
    }
    
    getRecentGuessesForWord(word, limit = 5) {
        const guesses = this.getWordGuessHistory(word);
        return guesses.slice(-limit);
    }
    
    getAllWordsWithGuesses() {
        return Array.from(this.stats.wordGuesses.keys());
    }
    
    getWordsLearned(minCorrectAnswers = 1) {
        return this.getAllWordsWithGuesses().filter(word => {
            return this.getCorrectGuessesForWord(word) >= minCorrectAnswers;
        });
    }
    
    getWordsNeedingPractice(accuracyThreshold = 70, minGuesses = 3) {
        return this.getAllWordsWithGuesses().filter(word => {
            const accuracy = this.getWordAccuracy(word);
            const totalGuesses = this.getTotalGuessesForWord(word);
            return totalGuesses >= minGuesses && accuracy < accuracyThreshold;
        });
    }
    
    getWordsByAccuracy() {
        const words = this.getAllWordsWithGuesses();
        return words.map(word => ({
            word,
            accuracy: this.getWordAccuracy(word),
            totalGuesses: this.getTotalGuessesForWord(word),
            correctGuesses: this.getCorrectGuessesForWord(word)
        })).sort((a, b) => a.accuracy - b.accuracy);
    }
}