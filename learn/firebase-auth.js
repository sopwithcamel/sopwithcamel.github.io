class FirebaseAuth {
    constructor() {
        this.user = null;
        this.isRegistering = false;
        this.userStats = new UserStats(); // Use the separate UserStats class

        this.firebaseModules = null;
        this.init();
    }

    async init() {
        // Wait for Firebase to be initialized
        let attempts = 0;
        while (!window.auth && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.auth) {
            console.error('Firebase not initialized after 3 seconds - using fallback mode');
            this.setupFallbackMode();
            return;
        }

        try {
            // Import Firebase modules
            this.firebaseModules = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');

            // Store references to Firebase functions
            this.signInWithPopup = this.firebaseModules.signInWithPopup;
            this.GoogleAuthProvider = this.firebaseModules.GoogleAuthProvider;
            this.signInAnonymously = this.firebaseModules.signInAnonymously;
            this.signOut = this.firebaseModules.signOut;
            this.onAuthStateChanged = this.firebaseModules.onAuthStateChanged;

            // Add email/password auth functions
            this.createUserWithEmailAndPassword = this.firebaseModules.createUserWithEmailAndPassword;
            this.signInWithEmailAndPassword = this.firebaseModules.signInWithEmailAndPassword;
            this.updateProfile = this.firebaseModules.updateProfile;

            // Initialize Firebase AI Logic with Gemini 2.5 Flash
            await this.initializeAI();

            console.log('Firebase modules loaded successfully');

            // Listen for auth state changes
            this.onAuthStateChanged(window.auth, (user) => {
                this.handleAuthStateChange(user);
            });

            this.setupEventListeners();

            // Check if user is already authenticated
            if (window.auth.currentUser) {
                console.log('User already authenticated');
                this.handleAuthStateChange(window.auth.currentUser);
            } else {
                this.showLoginModal();
            }

        } catch (error) {
            console.error('Error initializing Firebase modules:', error);
            this.setupFallbackMode();
        }
    }

    setupFallbackMode() {
        console.log('Setting up fallback mode without Firebase');
        this.setupEventListeners();
        this.showLoginModal();
    }

    // Initialize Firebase AI Logic with Gemini 2.5 Flash
    async initializeAI() {
        try {
            // Import Firebase AI SDK
            const { getAI, getGenerativeModel, GoogleAIBackend } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-ai.js');
            let aiConfig = { backend: new GoogleAIBackend() };

            try {
                // Import AppCheck for production
                const { getAppCheck, initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app-check.js');

                // Initialize AppCheck if not already initialized
                let appCheck;
                try {
                    appCheck = getAppCheck(window.firebaseApp);
                } catch (error) {
                    console.log('AppCheck not initialized, initializing for production...');
                    // Initialize AppCheck with ReCaptcha V3
                    appCheck = initializeAppCheck(window.firebaseApp, {
                        provider: new ReCaptchaV3Provider('6LdFdrMrAAAAABIWCBzvQLTUyYPVyqHrQ1YGGnfz'),
                        isTokenAutoRefreshEnabled: true
                    });
                }

                aiConfig.appCheck = appCheck;
                console.log('AppCheck enabled for production environment');
            } catch (appCheckError) {
                console.warn('AppCheck failed to initialize, continuing without it:', appCheckError);
            }

            // Initialize the Gemini Developer API backend service
            this.ai = getAI(window.firebaseApp, aiConfig);

            // Create generative model instance with Gemini 2.5 Flash
            this.generativeModel = getGenerativeModel(this.ai, {
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 1000,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            });
            console.log(`Firebase AI with Gemini 2.5 Flash initialized successfully}`);
        } catch (error) {
            console.error('Failed to initialize Firebase AI:', error);
            this.generativeModel = null;
        }
    }

    // Generate a funny fact about a specific snake
    async generateSnakeFact(snakeName) {
        if (!this.generativeModel) {
            console.warn('AI model not available, returning default fact');
            return `The ${snakeName} is amazing! Did you know snakes can't blink? They have fixed transparent scales over their eyes instead of eyelids! 🐍`;
        }

        try {
            const prompt = `Write a short, funny and interesting fact about the "${snakeName}" snake. 
            
            Make it:
            1. Educational but entertaining
            2. 1-2 sentences maximum
            3. Family-friendly and fun
            4. Include its scientific name
            
            Focus on something unique, quirky, or surprising about this specific snake species.`;

            const result = await this.generativeModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating snake fact:', error);
            return `The ${snakeName} is fascinating! Fun fact: Snakes smell with their tongues by collecting chemical information from the air! 🐍`;
        }
    }

    setupEventListeners() {
        const googleBtn = document.getElementById('googleLoginBtn');
        const anonymousBtn = document.getElementById('anonymousLoginBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        // New email/password elements
        const emailLoginBtn = document.getElementById('emailLoginBtn');
        const backToOptionsBtn = document.getElementById('backToOptionsBtn');
        const loginToggle = document.getElementById('loginToggle');
        const registerToggle = document.getElementById('registerToggle');
        const authForm = document.getElementById('authForm');

        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                console.log('Google login clicked');
                if (this.signInWithPopup) {
                    this.loginWithGoogle();
                } else {
                    this.showError('Google login requires Firebase setup. Using guest mode instead.');
                    this.loginAsLocalGuest();
                }
            });
        }

        if (anonymousBtn) {
            anonymousBtn.addEventListener('click', () => {
                console.log('Anonymous login clicked');
                if (this.signInAnonymously && window.auth) {
                    this.loginAnonymously();
                } else {
                    console.log('Firebase not available, using local guest mode');
                    this.loginAsLocalGuest();
                }
            });
        }

        if (emailLoginBtn) {
            emailLoginBtn.addEventListener('click', () => {
                this.showEmailForm();
            });
        }

        if (backToOptionsBtn) {
            backToOptionsBtn.addEventListener('click', () => {
                this.hideEmailForm();
            });
        }

        if (loginToggle) {
            loginToggle.addEventListener('click', () => {
                this.switchToLogin();
            });
        }

        if (registerToggle) {
            registerToggle.addEventListener('click', () => {
                this.switchToRegister();
            });
        }

        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailAuth();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // Fallback method - pure localStorage, no Firebase
    loginAsLocalGuest() {
        console.log('Logging in as local guest (no Firebase)');

        // Reset stats for fresh guest session
        this.resetStats();

        // Create a fake user object
        this.user = {
            uid: 'local-guest-' + Date.now(),
            isAnonymous: true,
            isLocalGuest: true, // Custom property to identify local guests
            displayName: null,
            email: null
        };

        // Load any existing local stats (or keep reset stats for fresh start)
        this.loadLocalStats();
        this.hideLoginModal();
        this.showUserBar();

        // Dispatch custom event that the main app can listen to
        window.dispatchEvent(new CustomEvent('userAuthenticated', {
            detail: { user: this.user, stats: this.userStats }
        }));
    }

    async loginWithGoogle() {
        try {
            console.log('Attempting Google login...');
            if (!this.signInWithPopup || !this.GoogleAuthProvider) {
                throw new Error('Firebase modules not loaded');
            }

            const provider = new this.GoogleAuthProvider();
            const result = await this.signInWithPopup(window.auth, provider);
            console.log('Google login successful:', result.user.uid);
        } catch (error) {
            console.error('Google login failed:', error);
            this.showError('Google login failed. Please check if popups are blocked.');
        }
    }

    async loginAnonymously() {
        try {
            console.log('Attempting Firebase anonymous login...');

            if (!this.signInAnonymously) {
                throw new Error('Firebase signInAnonymously not loaded');
            }

            const result = await this.signInAnonymously(window.auth);
            console.log('Anonymous login successful:', result.user.uid);
        } catch (error) {
            console.error('Anonymous login failed:', error);

            if (error.code === 'auth/admin-restricted-operation') {
                console.log('Anonymous auth disabled, falling back to local guest mode');
                this.showError('Using local guest mode (Anonymous auth disabled in Firebase)');
                setTimeout(() => {
                    this.loginAsLocalGuest();
                }, 2000);
            } else {
                console.log('Firebase error, falling back to local guest mode');
                this.loginAsLocalGuest();
            }
        }
    }

    async logout() {
        try {
            if (this.user && this.user.isLocalGuest) {
                // Local guest logout - clear local stats
                console.log('Logging out local guest');
                localStorage.removeItem('kannadaLearnerStats');
                this.resetStats();
                this.user = null;
                this.hideUserBar();
                this.showLoginModal();
                return;
            }

            if (this.signOut && window.auth) {
                // Firebase logout - clear local stats but keep Firestore data
                localStorage.removeItem('kannadaLearnerStats');
                this.resetStats();
                await this.signOut(window.auth);
                console.log('User logged out from Firebase');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            this.showError('Logout failed: ' + error.message);
        }
    }

    // Add a method to reset stats to initial values
    resetStats() {
        this.userStats.reset();
    }

    async handleAuthStateChange(user) {
        console.log('Auth state changed:', user ? user.uid : 'null');

        if (user) {
            // If switching from a different user type, reset stats first
            if (this.user && this.user.uid !== user.uid) {
                console.log('Switching users, resetting stats');
                this.resetStats();
            }

            this.user = user;

            // Only use Firestore for non-anonymous users
            if (!user.isAnonymous) {
                await this.loadUserStats();
            } else {
                console.log('Anonymous user - using local storage for stats');
                this.loadLocalStats();
            }

            this.hideLoginModal();
            this.showUserBar();

            // Dispatch custom event that the main app can listen to
            window.dispatchEvent(new CustomEvent('userAuthenticated', {
                detail: { user, stats: this.userStats }
            }));
        } else {
            // User logged out - reset everything
            console.log('User logged out - resetting stats');
            this.resetStats();
            this.user = null;
            this.hideUserBar();
            this.showLoginModal();
        }
    }

    loadLocalStats() {
        // Load stats from localStorage for anonymous users
        const savedStats = localStorage.getItem('kannadaLearnerStats');
        if (savedStats) {
            try {
                const parsed = JSON.parse(savedStats);
                this.userStats.loadFromData(parsed);

                // Save cleaned data if cleanup occurred
                const cleanup = this.userStats.cleanupOldGuesses();
                if (cleanup.hasChanges) {
                    this.saveLocalStats();
                }
            } catch (error) {
                console.error('Error loading local stats:', error);
            }
        }
        // If no saved stats found, keep the reset stats (fresh start)
    }

    saveLocalStats() {
        // Save stats to localStorage for anonymous/local users
        if (this.user && (this.user.isAnonymous || this.user.isLocalGuest)) {
            const statsToSave = this.userStats.exportForSave();
            localStorage.setItem('kannadaLearnerStats', JSON.stringify(statsToSave));
            console.log('Local stats saved');
        }
    }

    async loadUserStats() {
        if (!this.user || this.user.isAnonymous || this.user.isLocalGuest) {
            return;
        }

        if (!window.db) {
            console.log('Firestore not available');
            return;
        }

        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');

            const userDoc = await getDoc(doc(window.db, 'users', this.user.uid));

            if (userDoc.exists()) {
                const data = userDoc.data();

                // Reconstruct wordGuesses Map from Firestore object
                const wordGuessesMap = new Map();
                if (data.wordGuesses) {
                    for (const [word, guesses] of Object.entries(data.wordGuesses)) {
                        wordGuessesMap.set(word, guesses);
                    }
                }

                // Prepare data for UserStats
                const statsData = {
                    ...data,
                    wordGuesses: wordGuessesMap
                };

                this.userStats.loadFromData(statsData);

                // Save cleaned data if cleanup occurred
                const cleanup = this.userStats.cleanupOldGuesses();
                if (cleanup.hasChanges) {
                    this.saveUserStats();
                }
            } else {
                // Create new user document
                console.log('Creating new user document');
                await this.saveUserStats();
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    async saveUserStats() {
        if (!this.user) return;

        // Save to localStorage for anonymous/local users
        if (this.user.isAnonymous || this.user.isLocalGuest) {
            this.saveLocalStats();
            return;
        }

        // Save to Firestore for authenticated users
        if (!window.db) return;

        try {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');

            const statsToSave = this.userStats.exportForFirestore();

            await setDoc(doc(window.db, 'users', this.user.uid), statsToSave);
            console.log('User stats saved to Firestore');
        } catch (error) {
            console.error('Error saving user stats:', error);
        }
    }

    async saveWordGuess(word, isCorrect) {
        if (!this.user) return;

        // Save to localStorage for anonymous/local users
        if (this.user.isAnonymous || this.user.isLocalGuest) {
            this.saveLocalStats();
            return;
        }

        // Save to Firestore for authenticated users
        if (!window.db) return;

        try {
            const { doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');

            const guessData = {
                correct: isCorrect,
                date: Date.now()
            };

            const updateData = {
                [`wordGuesses.${word}`]: arrayUnion(guessData),
                correctAnswers: this.userStats.getStats().correctAnswers,
                totalAnswers: this.userStats.getStats().totalAnswers,
                lastUpdated: new Date().toISOString()
            };

            await updateDoc(doc(window.db, 'users', this.user.uid), updateData);
            console.log('Word guess saved efficiently to Firestore for word:', word);
        } catch (error) {
            console.error('Error saving word guess:', error);
            // Fallback to full document save if partial update fails
            console.log('Falling back to full document save...');
            await this.saveUserStats();
        }
    }

    updateStats(isCorrect, word) {
        // Update stats using UserStats class
        this.userStats.updateWithGuess(isCorrect, word);

        // Use efficient word-specific save for Firestore
        this.saveWordGuess(word, isCorrect);
        this.updateStatsDisplay();
    }

    // Record when user clicks "Show" - counts as wrong answer
    recordShowAnswer(word) {
        this.updateStats(false, word);
        console.log('Show answer recorded as wrong for word:', word);
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            console.log('Login modal shown');
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('Login modal hidden');
        }
    }

    showUserBar() {
        const userBar = document.getElementById('userBar');
        const userDisplay = document.getElementById('userDisplay');

        if (this.user && userBar && userDisplay) {
            let displayName;

            if (this.user.isLocalGuest) {
                displayName = '🎮 Local Guest';
            } else if (this.user.isAnonymous) {
                displayName = '🎮 Anonymous User';
            } else {
                displayName = `👋 ${this.user.displayName || this.user.email || 'User'}`;
            }

            userDisplay.textContent = displayName;
            this.updateStatsDisplay();
            userBar.style.display = 'flex';
            console.log('User bar shown for:', displayName);
        }
    }

    updateStatsDisplay() {
        const levelImage = document.getElementById('levelImage');
        const statItem = levelImage ? levelImage.closest('.stat-item') : null;

        if (levelImage) {
            // Get actual vocabulary size from vocabulary.js
            const totalVocabularySize = typeof vocabulary !== 'undefined' ? vocabulary.length : 100;

            // Get current expertise level
            const levelData = this.userStats.getExpertiseLevel(totalVocabularySize);

            // Update image source and alt text
            const imageNumber = levelData.level.toString().padStart(2, '0');
            levelImage.src = `img/${imageNumber}.png`;
            levelImage.alt = levelData.name;

            // Update tooltip with level name and progress
            if (statItem) {
                const tooltipText = levelData.isMaxLevel
                    ? `${levelData.name} (Master Level)`
                    : `${levelData.name} (${levelData.progressInLevel}% to ${levelData.nextLevel.name})`;
                statItem.setAttribute('data-tooltip', tooltipText);
            }

            console.log('Stats display updated:', {
                level: levelData.level,
                name: levelData.name,
                expertise: `${levelData.expertisePercentage}%`,
                progress: `${levelData.progressInLevel}%`,
                vocabularySize: totalVocabularySize
            });
        }
    }

    hideUserBar() {
        const userBar = document.getElementById('userBar');
        if (userBar) {
            userBar.style.display = 'none';
        }
    }

    showError(message) {
        console.error('Auth Error:', message);

        // Create a simple error popup
        const errorPopup = document.createElement('div');
        errorPopup.className = 'feedback-popup hint show';
        errorPopup.textContent = message;
        errorPopup.style.top = '20px';
        errorPopup.style.zIndex = '3000';

        document.body.appendChild(errorPopup);

        // Auto-hide after 4 seconds
        setTimeout(() => {
            errorPopup.classList.add('hide');
            setTimeout(() => {
                if (errorPopup.parentNode) {
                    errorPopup.parentNode.removeChild(errorPopup);
                }
            }, 300);
        }, 4000);
    }

    getCurrentUser() {
        return this.user;
    }

    getUserStats() {
        return this.userStats;
    }

    isAuthenticated() {
        return !!this.user;
    }

    showEmailForm() {
        document.getElementById('mainOptions').style.display = 'none';
        document.getElementById('emailForm').style.display = 'block';
        document.getElementById('emailInput').focus();
    }

    hideEmailForm() {
        document.getElementById('emailForm').style.display = 'none';
        document.getElementById('mainOptions').style.display = 'block';
        this.clearFormErrors();
    }

    switchToLogin() {
        document.getElementById('loginToggle').classList.add('active');
        document.getElementById('registerToggle').classList.remove('active');
        document.getElementById('confirmPasswordDiv').style.display = 'none';
        document.getElementById('submitBtn').textContent = 'Login';
        this.isRegistering = false;
        this.clearFormErrors();
    }

    switchToRegister() {
        document.getElementById('registerToggle').classList.add('active');
        document.getElementById('loginToggle').classList.remove('active');
        document.getElementById('confirmPasswordDiv').style.display = 'block';
        document.getElementById('submitBtn').textContent = 'Register';
        this.isRegistering = true;
        this.clearFormErrors();
    }

    async handleEmailAuth() {
        const email = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value;
        const confirmPassword = document.getElementById('confirmPasswordInput').value;

        // Clear previous errors
        this.clearFormErrors();

        // Validation
        if (!email || !password) {
            this.showFormError('Please fill in all fields.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showFormError('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            this.showFormError('Password must be at least 6 characters long.');
            return;
        }

        if (this.isRegistering && password !== confirmPassword) {
            this.showFormError('Passwords do not match.');
            return;
        }

        try {
            if (this.isRegistering) {
                await this.registerWithEmail(email, password);
            } else {
                await this.loginWithEmail(email, password);
            }
        } catch (error) {
            console.error('Email auth error:', error);
            this.handleAuthError(error);
        }
    }

    async registerWithEmail(email, password) {
        try {
            console.log('Attempting email registration...');
            if (!this.createUserWithEmailAndPassword) {
                throw new Error('Email registration not available - Firebase not loaded');
            }

            const userCredential = await this.createUserWithEmailAndPassword(window.auth, email, password);
            console.log('Registration successful:', userCredential.user.uid);

            // Optionally update display name
            const displayName = email.split('@')[0]; // Use part before @ as display name
            if (this.updateProfile) {
                await this.updateProfile(userCredential.user, { displayName });
            }

            this.showFeedback('Account created successfully! Welcome! 🎉', 'correct');
        } catch (error) {
            throw error;
        }
    }

    async loginWithEmail(email, password) {
        try {
            console.log('Attempting email login...');
            if (!this.signInWithEmailAndPassword) {
                throw new Error('Email login not available - Firebase not loaded');
            }

            const userCredential = await this.signInWithEmailAndPassword(window.auth, email, password);
            console.log('Login successful:', userCredential.user.uid);

            this.showFeedback('Login successful! Welcome back! 🎉', 'correct');
        } catch (error) {
            throw error;
        }
    }

    handleAuthError(error) {
        let message = 'Authentication failed. Please try again.';

        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists. Try logging in instead.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/user-not-found':
                message = 'No account found with this email. Try registering instead.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later.';
                break;
            default:
                message = error.message || 'Authentication failed. Please try again.';
        }

        this.showFormError(message);
    }

    showFormError(message) {
        // Remove existing error
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        // Add after the form
        const form = document.getElementById('authForm');
        if (form) {
            form.parentNode.insertBefore(errorDiv, form.nextSibling);
        }
    }

    clearFormErrors() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFeedback(message, type) {
        // Remove any existing popup
        const existingPopup = document.querySelector('.feedback-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup element
        const popup = document.createElement('div');
        popup.className = `feedback-popup ${type}`;
        popup.textContent = message;
        popup.style.top = '20px';
        popup.style.zIndex = '3000';

        // Add popup to body
        document.body.appendChild(popup);

        // Show popup with animation
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);

        // Auto-hide popup after 3 seconds
        setTimeout(() => {
            popup.classList.add('hide');
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Firebase Auth...');
    window.firebaseAuth = new FirebaseAuth();
});