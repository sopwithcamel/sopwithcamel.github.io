import React, { useState, useEffect, useMemo } from 'react';
import { Star, CheckCircle, XCircle, ArrowRight, Trophy, HelpCircle, RefreshCw, Lock, Upload, Image as ImageIcon } from 'lucide-react';

// --- CONFIGURATION ---

// Default image path (works in the creator's session)
const DEFAULT_GRID_IMAGE_URL = "https://img.buzzfeed.com/store-an-image-prod-us-east-1/RjKCQNKzO.png?output-format=auto&output-quality=auto";

// Grid Dimensions (Columns x Rows)
const COLS = 5;
const ROWS = 8;

// --- DATA REPOSITORIES ---

const QUESTION_REPOSITORY = [
    // --- HUMAN BODY ---
    { q: "Which organ pumps blood to all parts of the body?", a: "Heart", options: ["Brain", "Lungs", "Heart"] },
    { q: "Which internal organ helps us think and remember?", a: "Brain", options: ["Stomach", "Brain", "Liver"] },
    { q: "Which organs filter blood to remove waste?", a: "Kidneys", options: ["Kidneys", "Heart", "Lungs"] },
    { q: "How many lungs does a human body have?", a: "Two", options: ["One", "Two", "Four"] },
    { q: "Which gas does the body use to produce energy?", a: "Oxygen", options: ["Carbon Dioxide", "Oxygen", "Nitrogen"] },
    { q: "Which gas is removed when we breathe out?", a: "Carbon Dioxide", options: ["Oxygen", "Carbon Dioxide", "Hydrogen"] },
    { q: "Where does the digestion of food begin?", a: "Mouth", options: ["Stomach", "Mouth", "Small Intestine"] },
    { q: "Which tube connects the mouth to the stomach?", a: "Food pipe", options: ["Windpipe", "Food pipe", "Blood vessel"] },
    { q: "Where is digestion of food completed?", a: "Small Intestine", options: ["Stomach", "Large Intestine", "Small Intestine"] },
    { q: "Which vessels carry blood AWAY from the heart?", a: "Arteries", options: ["Veins", "Arteries", "Nerves"] },
    { q: "Which vessels bring blood BACK to the heart?", a: "Veins", options: ["Arteries", "Veins", "Bones"] },
    { q: "What is the waste liquid removed by kidneys called?", a: "Urine", options: ["Sweat", "Blood", "Urine"] },
    { q: "Which organ covers the body and protects it?", a: "Skin", options: ["Muscle", "Skin", "Bone"] },
    { q: "The nose, windpipe, and lungs form which system?", a: "Respiratory", options: ["Digestive", "Circulatory", "Respiratory"] },
    { q: "The heart and blood vessels form which system?", a: "Circulatory", options: ["Excretory", "Circulatory", "Nervous"] },
    { q: "Which organ stores food for a few hours?", a: "Stomach", options: ["Liver", "Stomach", "Heart"] },
    { q: "Which organ helps us breathe?", a: "Lungs", options: ["Heart", "Lungs", "Brain"] },
    { q: "Which system cleans the blood?", a: "Excretory", options: ["Digestive", "Excretory", "Respiratory"] },
    { q: "What should we do before eating?", a: "Wash hands", options: ["Sleep", "Wash hands", "Run"] },
    { q: "How many kidneys does a human have?", a: "Two", options: ["One", "Two", "Three"] },

    // --- FOOD & NUTRITION ---
    { q: "What gives us energy to work and play?", a: "Food", options: ["Sleep", "Food", "Toys"] },
    { q: "Which nutrients provide energy to the body?", a: "Carbohydrates", options: ["Vitamins", "Carbohydrates", "Minerals"] },
    { q: "Which nutrients help the body grow and repair?", a: "Proteins", options: ["Fats", "Proteins", "Water"] },
    { q: "Fruits and vegetables are rich in Vitamins and ___?", a: "Minerals", options: ["Fats", "Minerals", "Sugars"] },
    { q: "What is a diet with all nutrients in right amounts?", a: "Balanced diet", options: ["Fast food", "Balanced diet", "Liquid diet"] },
    { q: "Why should we cook food?", a: "To make it soft", options: ["To make it hard", "To make it soft", "To change color"] },
    { q: "What protects the body from disease?", a: "Vitamins", options: ["Carbohydrates", "Vitamins", "Fats"] },

    // --- PLANTS ---
    { q: "Which part of the plant grows under the ground?", a: "Root", options: ["Stem", "Leaf", "Root"] },
    { q: "Which part of the plant bears branches and leaves?", a: "Stem", options: ["Root", "Stem", "Seed"] },
    { q: "What are the tiny pores on a leaf called?", a: "Stomata", options: ["Holes", "Stomata", "Pores"] },
    { q: "What is the green substance in leaves?", a: "Chlorophyll", options: ["Paint", "Chlorophyll", "Water"] },
    { q: "Which roots have one main root and many smaller ones?", a: "Taproot", options: ["Fibrous root", "Taproot", "Grass root"] },
    { q: "Grasses and wheat have which type of roots?", a: "Fibrous roots", options: ["Taproots", "Fibrous roots", "Carrot roots"] },
    { q: "What do leaves use to make food?", a: "Sunlight, Air, Water", options: ["Darkness", "Sunlight, Air, Water", "Juice"] },
    { q: "What does a seed contain inside it?", a: "Baby plant", options: ["Flower", "Baby plant", "Fruit"] },
    { q: "What connects the roots to the rest of the plant?", a: "Stem", options: ["Leaf", "Stem", "Flower"] },
    { q: "Which part of the plant is called the 'food factory'?", a: "Leaf", options: ["Root", "Stem", "Leaf"] },
    { q: "Which part of the plant absorbs water?", a: "Root", options: ["Leaf", "Root", "Flower"] },
    { q: "Do plants move from place to place?", a: "No", options: ["Yes", "No", "Only at night"] },
    { q: "Which plant closes its leaves when touched?", a: "Touch-me-not", options: ["Rose", "Touch-me-not", "Sunflower"] },
    { q: "What type of roots do bean plants have?", a: "Taproot", options: ["Fibrous", "Taproot", "No root"] },
    { q: "What is the main vein of a leaf called?", a: "Midrib", options: ["Side vein", "Midrib", "Stalk"] },

    // --- ANIMALS ---
    { q: "Animals that eat only plants are called?", a: "Herbivores", options: ["Carnivores", "Herbivores", "Omnivores"] },
    { q: "Animals that eat only other animals are called?", a: "Carnivores", options: ["Herbivores", "Omnivores", "Carnivores"] },
    { q: "Animals that eat both plants and animals are called?", a: "Omnivores", options: ["Insectivores", "Omnivores", "Herbivores"] },
    { q: "Which animal chews the cud?", a: "Cow", options: ["Lion", "Cow", "Dog"] },
    { q: "Where do lions live?", a: "Den/Forest", options: ["Stable", "Den/Forest", "Water"] },
    { q: "Which animal has a trunk?", a: "Elephant", options: ["Giraffe", "Elephant", "Camel"] },
    { q: "Which animal is a carnivore?", a: "Tiger", options: ["Deer", "Tiger", "Rabbit"] },
    { q: "What do herbivores have to grind food?", a: "Flat teeth", options: ["Sharp teeth", "Flat teeth", "No teeth"] },
    { q: "What do carnivores use to tear flesh?", a: "Sharp teeth", options: ["Flat teeth", "Beak", "Sharp teeth"] },
    { q: "Where do rabbits live?", a: "Burrows", options: ["Nests", "Burrows", "Caves"] },
    { q: "What is a pattern of eating and being eaten?", a: "Food chain", options: ["Food line", "Food chain", "Food circle"] },
    { q: "Where do monkeys live?", a: "Trees", options: ["Water", "Trees", "Burrows"] },
    { q: "What do frogs use to catch insects?", a: "Sticky tongue", options: ["Teeth", "Sticky tongue", "Hands"] },
    { q: "Which animal gives us wool?", a: "Sheep", options: ["Cow", "Sheep", "Horse"] },
    { q: "Which animal carries loads for us?", a: "Donkey", options: ["Dog", "Donkey", "Cat"] },

    // --- BIRDS ---
    { q: "What do birds have instead of teeth?", a: "Beak", options: ["Lips", "Beak", "Gums"] },
    { q: "What helps a bird's body stay warm?", a: "Down feathers", options: ["Flight feathers", "Down feathers", "Skin"] },
    { q: "What kind of bones do birds have?", a: "Hollow", options: ["Solid", "Heavy", "Hollow"] },
    { q: "What helps a bird fly?", a: "Wings", options: ["Tail", "Wings", "Beak"] },
    { q: "Which bird cannot fly?", a: "Ostrich", options: ["Eagle", "Ostrich", "Parrot"] },
    { q: "Which bird lays eggs in a crow's nest?", a: "Cuckoo", options: ["Sparrow", "Cuckoo", "Pigeon"] },
    { q: "What shape is an eagle's beak?", a: "Hooked", options: ["Flat", "Hooked", "Long"] },
    { q: "What do ducks have to help them swim?", a: "Webbed feet", options: ["Fins", "Webbed feet", "Talons"] },
    { q: "What helps a bird grip a tree branch?", a: "Claws/Feet", options: ["Beak", "Wings", "Claws/Feet"] },
    { q: "Which bird has a broad flat beak?", a: "Duck", options: ["Eagle", "Duck", "Sparrow"] },
    { q: "What do eagles use to catch prey?", a: "Talons", options: ["Beak", "Talons", "Wings"] },
    { q: "Do birds have teeth?", a: "No", options: ["Yes", "No", "Some do"] },
    { q: "Which bird cannot fly?", a: "Penguin", options: ["Crow", "Parrot", "Penguin"] },

    // --- INSECTS & OTHERS ---
    { q: "How many legs do insects have?", a: "Six", options: ["Four", "Six", "Eight"] },
    { q: "What are the hair-like parts on an insect's head?", a: "Feelers", options: ["Horns", "Feelers", "Ears"] },
    { q: "Which insect is known as the 'farmer's friend'?", a: "Ladybird", options: ["Mosquito", "Ladybird", "Housefly"] },
    { q: "What is the middle part of an insect's body called?", a: "Thorax", options: ["Abdomen", "Head", "Thorax"] },
    { q: "What do butterflies suck from flowers?", a: "Nectar", options: ["Water", "Honey", "Nectar"] },
    { q: "Insects breathe through what?", a: "Tiny holes", options: ["Nose", "Gills", "Tiny holes"] },
    { q: "Which insect spreads malaria?", a: "Mosquito", options: ["Ant", "Mosquito", "Bee"] },
    { q: "What is the larva of a butterfly called?", a: "Caterpillar", options: ["Maggot", "Caterpillar", "Pupa"] },
    { q: "What do bees collect from flowers?", a: "Nectar", options: ["Water", "Nectar", "Seeds"] },
    { q: "Which insect makes a web?", a: "Spider", options: ["Ant", "Spider", "Bee"] },
    { q: "Which part of the insect has the legs?", a: "Thorax", options: ["Head", "Thorax", "Abdomen"] },
    { q: "Ants have these on their heads to feel.", a: "Feelers", options: ["Ears", "Feelers", "Nose"] },
    { q: "What is the first stage of a butterfly's life?", a: "Egg", options: ["Pupa", "Egg", "Larva"] },
    { q: "What is the inactive stage of an insect called?", a: "Pupa", options: ["Egg", "Pupa", "Larva"] },
    { q: "What feeds on dead plants and wood?", a: "Termites", options: ["Bees", "Termites", "Butterflies"] },
    { q: "Which insect lives in a beehive?", a: "Bee", options: ["Ant", "Bee", "Spider"] },
    { q: "What does a dung beetle feed on?", a: "Animal dung", options: ["Leaves", "Animal dung", "Nectar"] },
    { q: "How many pairs of wings do most insects have?", a: "Two", options: ["One", "Two", "Three"] },

    // --- LIVING/NON-LIVING & FISH ---
    { q: "What helps fish swim?", a: "Fins", options: ["Legs", "Fins", "Wings"] },
    { q: "What do fish use to breathe?", a: "Gills", options: ["Lungs", "Skin", "Gills"] },
    { q: "Do non-living things grow on their own?", a: "No", options: ["Yes", "No", "Sometimes"] },
    { q: "Do animals grow throughout their entire life?", a: "No", options: ["Yes", "No", "Maybe"] },
    { q: "Is the sun a living thing?", a: "No", options: ["Yes", "No", "Maybe"] },
    { q: "What do snakes do to their food?", a: "Swallow whole", options: ["Chew it", "Swallow whole", "Cut it"] },
];

const LEVELS = [
    {
        id: 1,
        characterName: "Harry Potter",
        themeColor: "from-red-900 to-red-600",
        imageText: "The Chosen One",
        row: 5, col: 3, // Harry
    },
    {
        id: 2,
        characterName: "Hermione Granger",
        themeColor: "from-purple-900 to-purple-600",
        imageText: "Brightest Witch",
        row: 6, col: 0, // Hermione
    },
    {
        id: 3,
        characterName: "Ron Weasley",
        themeColor: "from-orange-800 to-orange-600",
        imageText: "Loyal Friend",
        row: 0, col: 3, // Ron (Young)
    },
    {
        id: 4,
        characterName: "Albus Dumbledore",
        themeColor: "from-blue-900 to-indigo-800",
        imageText: "Headmaster",
        row: 4, col: 2, // Dumbledore
    },
    {
        id: 5,
        characterName: "Dobby",
        themeColor: "from-stone-700 to-stone-500",
        imageText: "Free Elf",
        row: 0, col: 1, // Dobby
    },
    {
        id: 6,
        characterName: "Severus Snape",
        themeColor: "from-green-900 to-green-700",
        imageText: "Potions Master",
        row: 3, col: 3, // Snape
    },
    {
        id: 7,
        characterName: "Rubeus Hagrid",
        themeColor: "from-yellow-900 to-yellow-700",
        imageText: "Gamekeeper",
        row: 5, col: 4, // Hagrid
    },
    {
        id: 8,
        characterName: "Draco Malfoy",
        themeColor: "from-emerald-900 to-emerald-600",
        imageText: "Slytherin",
        row: 6, col: 1, // Draco
    }
];

// --- Helper Functions ---

// Shuffle array and pick n items
const getRandomQuestions = (count) => {
    const shuffled = [...QUESTION_REPOSITORY].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// --- Components ---

const Modal = ({ isOpen, question, onAnswer, onClose }) => {
    if (!isOpen || !question) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border-4 border-slate-800">
                <div className="bg-slate-900 p-4 flex justify-between items-center border-b-4 border-yellow-500">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2 font-serif tracking-wide">
                        <HelpCircle className="w-5 h-5 text-yellow-400" />
                        Spell Casting
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 bg-slate-50">
                    <p className="text-xl font-medium text-slate-800 mb-6 text-center font-serif leading-relaxed">
                        {question.q}
                    </p>
                    <div className="space-y-3">
                        {question.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => onAnswer(option)}
                                className="w-full py-3 px-4 bg-white hover:bg-yellow-100 hover:border-yellow-500 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 text-left active:scale-95 shadow-sm"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CharacterReveal = ({ level, revealedTiles, onTileClick, gridImage }) => {
    const isFullyRevealed = revealedTiles.length === 16;

    // Helper to calculate background position for a specific cell based on dynamic image
    const spriteStyle = {
        backgroundImage: `url(${gridImage})`,
        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
        backgroundPosition: `${(level.col / (COLS - 1)) * 100}% ${(level.row / (ROWS - 1)) * 100}%`,
    };

    return (
        <div className="relative w-full max-w-md aspect-square bg-slate-200 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 group">

            {/* The "Hidden" Image (Grid Sprite) */}
            <div
                className="absolute inset-0 w-full h-full transition-transform duration-700"
                style={spriteStyle}
            />

            {/* Overlay Text */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${revealedTiles.length > 0 ? 'opacity-0' : 'opacity-100'}`}>
                <div className="bg-black/50 p-4 rounded-full mb-2 border border-white/20">
                    <HelpCircle className="w-12 h-12 text-white/80" />
                </div>
                <p className="text-white font-bold text-xl shadow-black drop-shadow-lg">Who is this?</p>
            </div>

            {/* The Grid of Tiles */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                {Array.from({ length: 16 }).map((_, index) => {
                    const isRevealed = revealedTiles.includes(index);
                    return (
                        <div
                            key={index}
                            onClick={() => onTileClick(index)}
                            className={`
                relative border border-slate-900/40 transition-all duration-500 transform bg-slate-800
                ${isRevealed ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100 cursor-pointer hover:bg-slate-700'}
              `}
                        >
                            {/* Tile visual */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-slate-500 font-bold text-sm opacity-30">
                                    {index + 1}
                                </div>
                            </div>
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        </div>
                    );
                })}
            </div>

            {/* Full Reveal Name Badge */}
            {isFullyRevealed && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-center animate-in slide-in-from-bottom duration-500">
                    <h2 className="text-3xl font-black text-white tracking-wide font-serif text-yellow-400 drop-shadow-md">
                        {level.characterName}
                    </h2>
                    <p className="text-white/80 text-sm font-medium uppercase tracking-widest mt-1">
                        {level.imageText}
                    </p>
                </div>
            )}
        </div>
    );
};

export default function App() {
    const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
    const [revealedTiles, setRevealedTiles] = useState([]);
    const [selectedTile, setSelectedTile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [gameStatus, setGameStatus] = useState('playing');

    // Image State
    const [gridImage, setGridImage] = useState(DEFAULT_GRID_IMAGE_URL);

    // Generate questions for the current level
    const [levelQuestions, setLevelQuestions] = useState([]);

    // Store all shuffled questions
    const [allQuestions, setAllQuestions] = useState([]);

    // Initialize questions on mount
    useEffect(() => {
        const shuffled = [...QUESTION_REPOSITORY].sort(() => 0.5 - Math.random());
        setAllQuestions(shuffled);
    }, []);

    const currentLevel = LEVELS[currentLevelIdx];

    // Initialize questions when level changes
    useEffect(() => {
        if (allQuestions.length > 0) {
            const startIdx = currentLevelIdx * 16;
            // Ensure we don't go out of bounds, wrap around if needed or just take what's left
            // For this game, we assume repository is large enough or we just wrap
            const questionsForLevel = [];
            for (let i = 0; i < 16; i++) {
                questionsForLevel.push(allQuestions[(startIdx + i) % allQuestions.length]);
            }
            setLevelQuestions(questionsForLevel);
        }
    }, [currentLevelIdx, allQuestions]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setGridImage(imageUrl);
        }
    };

    const handleTileClick = (index) => {
        if (revealedTiles.includes(index)) return;
        setSelectedTile(index);
        setShowModal(true);
        setFeedback(null);
    };

    const handleAnswer = (answer) => {
        const question = levelQuestions[selectedTile];

        if (answer === question.a) {
            // Correct
            setRevealedTiles((prev) => [...prev, selectedTile]);
            setFeedback({ type: 'success', msg: 'Correct! Uncovering...' });
            setTimeout(() => {
                setShowModal(false);
                setFeedback(null);
                checkLevelCompletion([...revealedTiles, selectedTile]);
            }, 800);
        } else {
            // Incorrect
            setFeedback({ type: 'error', msg: 'Incorrect! Try again.' });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    const checkLevelCompletion = (newRevealedList) => {
        if (newRevealedList.length === 16) {
            setTimeout(() => {
                setGameStatus('level_complete');
            }, 1000);
        }
    };

    const nextLevel = () => {
        if (currentLevelIdx + 1 < LEVELS.length) {
            setCurrentLevelIdx(prev => prev + 1);
            setRevealedTiles([]);
            setGameStatus('playing');
        } else {
            setGameStatus('all_complete');
        }
    };

    const resetGame = () => {
        setCurrentLevelIdx(0);
        setRevealedTiles([]);
        setGameStatus('playing');
        // Reshuffle questions for a new game
        const shuffled = [...QUESTION_REPOSITORY].sort(() => 0.5 - Math.random());
        setAllQuestions(shuffled);
    };

    // --- Render Functions ---

    if (gameStatus === 'all_complete') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-10 text-center space-y-8 animate-in fade-in zoom-in duration-500 border-8 border-double border-yellow-500">
                    <div className="flex justify-center">
                        <Trophy className="w-32 h-32 text-yellow-500 drop-shadow-lg animate-bounce" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 font-serif">Mischief Managed!</h1>
                        <p className="text-slate-600 text-lg">You have uncovered all the characters and mastered the Environmental Studies quiz!</p>
                    </div>
                    <button
                        onClick={resetGame}
                        className="w-full py-4 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-6 h-6" /> Play Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans selection:bg-indigo-200 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">

            {/* Header */}
            <header className="bg-slate-900 text-white py-4 px-6 shadow-lg sticky top-0 z-30 border-b-4 border-yellow-500">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                        <h1 className="text-2xl font-bold flex items-center gap-2 font-serif tracking-wider">
                            <span className="text-yellow-400 text-3xl">⚡</span>
                            Potter Quiz
                        </h1>
                        {/* Mobile Upload Button */}
                        <label className="md:hidden flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded cursor-pointer transition-colors border border-slate-600 text-slate-300">
                            <Upload className="w-4 h-4" />
                            <span>Upload Grid</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
                        {/* Desktop Upload Button */}
                        <label className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded cursor-pointer transition-colors border border-slate-600 text-slate-300 mr-4">
                            <ImageIcon className="w-4 h-4" />
                            <span>Missing Images? Upload Grid</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        <span className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">Level {currentLevelIdx + 1} / {LEVELS.length}</span>
                        <div className="flex items-center gap-1 text-yellow-400 font-bold">
                            <Lock className="w-4 h-4" />
                            <span>{16 - revealedTiles.length} Left</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 gap-8">

                {/* Instructions */}
                <div className="max-w-xl w-full text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800 font-serif">Reveal the Character</h2>
                    <p className="text-slate-600">Answer questions correctly to remove the tiles.</p>
                </div>

                {/* Game Area */}
                <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-12">

                    {/* The Grid / Character */}
                    <div className="w-full max-w-md shrink-0">
                        {/* Tiles Grid Wrapper */}
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 rotate-1 hover:rotate-0 transition-transform duration-300">
                            <CharacterReveal
                                level={currentLevel}
                                revealedTiles={revealedTiles}
                                onTileClick={handleTileClick}
                                gridImage={gridImage} // Pass the dynamic image
                            />
                        </div>
                    </div>

                    {/* Progress / Status Side Panel */}
                    <div className="flex-1 w-full max-w-sm flex flex-col gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="text-lg font-bold text-slate-800">Magic Progress</h3>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
                                    {Math.round((revealedTiles.length / 16) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500 ease-out"
                                    style={{ width: `${(revealedTiles.length / 16) * 100}%` }}
                                />
                            </div>
                        </div>

                        {gameStatus === 'level_complete' ? (
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-500 border-2 border-yellow-400/50">
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 font-serif">
                                    <Star className="w-6 h-6 text-yellow-300 fill-current animate-spin-slow" />
                                    Splendid!
                                </h3>
                                <p className="mb-6 text-indigo-100">
                                    You have revealed <span className="font-bold text-white text-lg">{currentLevel.characterName}</span>.
                                </p>
                                <button
                                    onClick={nextLevel}
                                    className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Next Level <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white/60 rounded-2xl p-6 border border-dashed border-slate-300 text-center text-slate-500">
                                <p className="text-sm">Complete the puzzle to advance.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Question Modal */}
            {showModal && selectedTile !== null && levelQuestions.length > 0 && (
                <Modal
                    isOpen={showModal}
                    question={levelQuestions[selectedTile]}
                    onAnswer={handleAnswer}
                    onClose={() => setShowModal(false)}
                />
            )}

            {/* Feedback Toast */}
            {feedback && (
                <div className={`
          fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 font-bold text-white flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in border-2 border-white/20
          ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
        `}>
                    {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {feedback.msg}
                </div>
            )}

        </div>
    );
}