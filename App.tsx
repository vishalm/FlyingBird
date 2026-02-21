import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  useWindowDimensions,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Platform,
  Linking,
  Image,
  Easing,
} from 'react-native';

// --- ANIMAL ASSETS IMPORT ---
import birdImg from './assets/animals/bird.png';
import owlImg from './assets/animals/owl.png';
import batImg from './assets/animals/bat.png';
import beeImg from './assets/animals/bee.png';
import penguinImg from './assets/animals/penguin.png';
import foxImg from './assets/animals/fox.png';
import duckImg from './assets/animals/duck.png';
import monkeyImg from './assets/animals/monkey.png';
import tigerImg from './assets/animals/tiger.png';
import snakeImg from './assets/animals/snake.png';
import elephantImg from './assets/animals/elephant.png';
import bearImg from './assets/animals/bear.png';
import frogImg from './assets/animals/frog.png';
import dinosaurImg from './assets/animals/dinosaur.png';
import octopusImg from './assets/animals/octopus.png';
import giraffeImg from './assets/animals/giraffe.png';
import lionImg from './assets/animals/lion.png';
import hippoImg from './assets/animals/hippo.png';
import slothImg from './assets/animals/sloth.png';
import unicornImg from './assets/animals/unicorn.png';

const initialWidth = Dimensions.get('window').width;
const initialHeight = Dimensions.get('window').height || 800;

const isWeb = Platform.OS === 'web';

const textShadow = (color: string, radius: number, x = 0, y = 0) =>
  Platform.select({
    web: { textShadow: `${x}px ${y}px ${radius}px ${color}` },
    default: { textShadowColor: color, textShadowOffset: { width: x, height: y }, textShadowRadius: radius }
  });

const boxShadow = (color: string, radius: number, x = 0, y = 0) =>
  Platform.select({
    web: { boxShadow: `${x}px ${y}px ${radius}px ${color}` },
    default: { shadowColor: color, shadowOffset: { width: x, height: y }, shadowOpacity: 1, shadowRadius: radius }
  });

// Different landscapes for every 10 points
const LANDSCAPES = [
  'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2564&auto=format&fit=crop', // Sunny sky/clouds
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2564&auto=format&fit=crop', // Green field
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2564&auto=format&fit=crop', // Mountains
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2564&auto=format&fit=crop', // Nature/trees
  'https://images.unsplash.com/photo-1506015391300-4b2efebdff81?q=80&w=2564&auto=format&fit=crop', // Beach
  'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=2564&auto=format&fit=crop', // Hot air balloons
];

const getBackgroundUrl = (score: number) => {
  const index = Math.min(Math.floor(score / 10), LANDSCAPES.length - 1);
  return LANDSCAPES[index];
};

// --- SYNTHETIC LEADERBOARD GENERATION ---
const BOTS = ["ShadowFlapper", "NeonGlider", "SkyKing99", "PixelHawk", "VoidRunner", "CloudSurfer", "SynthBird", "RetroAce", "CyberWing", "StarDiver", "LunaMoth", "GalacticOwl", "CometTail", "AeroDynamo", "GlitchEagle", "TurboFalcon", "Zenith", "ApexPredator", "CosmicJay"];

const generateInitialLeaderboard = () => {
  const board = [];
  // Generate 19 random high scores, sorted descending
  const baseScore = Math.floor(Math.random() * 50) + 100; // top score between 100-150
  for (let i = 0; i < 19; i++) {
    board.push({
      id: `bot-${i}`,
      name: BOTS[i] || `Player${Math.floor(Math.random() * 9999)}`,
      score: Math.max(5, baseScore - Math.floor(Math.random() * 5 + i * 8)),
      isUser: false
    });
  }
  board.sort((a, b) => b.score - a.score);
  return board;
};

// --- PLAYER ANIMALS COLLECTION ---
const PLAYER_ANIMALS = [
  { img: birdImg, name: 'Bird' },
  { img: owlImg, name: 'Owl' },
  { img: batImg, name: 'Bat' },
  { img: beeImg, name: 'Bee' },
  { img: penguinImg, name: 'Penguin' },
  { img: foxImg, name: 'Fox' },
  { img: duckImg, name: 'Duck' },
];

const getRandomPlayerAnimal = () => PLAYER_ANIMALS[Math.floor(Math.random() * PLAYER_ANIMALS.length)];

// --- EXPANDED HD ANIMALS COLLECTION ---
const ANIMALS = [
  { img: monkeyImg, name: 'Monkey' },
  { img: tigerImg, name: 'Tiger' },
  { img: snakeImg, name: 'Snake' },
  { img: elephantImg, name: 'Elephant' },
  { img: bearImg, name: 'Bear' },
  { img: frogImg, name: 'Frog' },
  { img: dinosaurImg, name: 'Dinosaur' },
  { img: foxImg, name: 'Fox' },
  { img: batImg, name: 'Bat' },
  { img: octopusImg, name: 'Octopus' },
  { img: owlImg, name: 'Owl' },
  { img: giraffeImg, name: 'Giraffe' },
  { img: lionImg, name: 'Lion' },
  { img: hippoImg, name: 'Hippo' },
  { img: penguinImg, name: 'Penguin' },
  { img: beeImg, name: 'Bee' },
  { img: slothImg, name: 'Sloth' },
  { img: birdImg, name: 'Bird' },
  { img: duckImg, name: 'Duck' },
  { img: unicornImg, name: 'Unicorn' }
];

const getRandomAnimal = () => ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

type GameMode = 'turtle' | 'bunny' | 'cheetah';

const getModeSettings = (mode: GameMode) => {
  if (mode === 'turtle') {
    return {
      gravity: 0.2, jump: -6, speedBase: 0.35, gapBase: 250,
      name: 'TURTLE POWER', subtitle: 'Super Slow & Friendly! 🐢',
      bgColor: 'rgba(0, 200, 100, 0.8)', borderColor: '#00FF66', innerBgColor: 'rgba(0, 200, 100, 0.9)'
    };
  }
  if (mode === 'bunny') {
    return {
      gravity: 0.45, jump: -8, speedBase: 0.5, gapBase: 200,
      name: 'BUNNY HOP', subtitle: 'Medium Speed Fun! 🐰',
      bgColor: 'rgba(0, 150, 255, 0.8)', borderColor: '#00D4FF', innerBgColor: 'rgba(0, 150, 255, 0.9)'
    };
  }
  return {
    gravity: 0.7, jump: -10, speedBase: 0.7, gapBase: 150,
    name: 'CHEETAH DASH', subtitle: 'Fast & Furious! 🐆',
    bgColor: 'rgba(255, 0, 100, 0.8)', borderColor: '#FF0055', innerBgColor: 'rgba(255, 0, 100, 0.9)'
  };
};


const HeroText = ({ text, style }: any) => {
  return (
    <View style={styles.glitchContainer}>
      <Text style={[styles.glitchText, style]}>{text}</Text>
    </View>
  );
};

interface CardProps {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  variant?: 'default' | 'gold' | 'neon';
}

const Card = ({ title, subtitle, icon, onPress, variant = 'default' }: CardProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: !isWeb,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: !isWeb,
    }).start();
  };

  const getBorderColor = () => {
    if (variant === 'gold') return 'rgba(255, 215, 0, 0.4)';
    if (variant === 'neon') return 'rgba(0, 255, 255, 0.4)';
    return 'rgba(255, 255, 255, 0.15)';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale }] },
          { borderColor: getBorderColor() },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function App() {
  const { width, height } = useWindowDimensions();
  const [activeScreen, setActiveScreen] = useState('menu');
  const [isLoadingScreen, setIsLoadingScreen] = useState(false);
  const [loadingAnimalIndex, setLoadingAnimalIndex] = useState(0);
  const [activePlayer, setActivePlayer] = useState(() => getRandomPlayerAnimal());

  // Reroll the flying player character every time we reset to the main menu!
  useEffect(() => {
    if (activeScreen === 'menu') {
      setActivePlayer(getRandomPlayerAnimal());
    }
  }, [activeScreen]);

  // AUDIO STATE
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    isMutedRef.current = !isMuted;

    const globalWindow = globalThis as any;
    if (!isMuted && Platform.OS === 'web' && globalWindow.window?.speechSynthesis) {
      globalWindow.window.speechSynthesis.cancel();
    }
  };

  // Rapid speech for animals in loading screen
  const speakLoadingAnimal = (animalName: string) => {
    const globalWindow = globalThis as any;
    if (!isMutedRef.current && Platform.OS === 'web' && globalWindow.window?.speechSynthesis) {
      globalWindow.window.speechSynthesis.cancel();
      const Utterance = globalWindow.SpeechSynthesisUtterance;
      if (Utterance) {
        const utterance = new Utterance(animalName);
        utterance.rate = 1.8; // Speak faster for loading screen!
        utterance.pitch = 1.5; // Fun high pitch!
        globalWindow.window.speechSynthesis.speak(utterance);
      }
    }
  };

  // MENU ANIMATIONS
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const chaseAnim = useRef(new Animated.Value(-150)).current;

  // Chase Animation Logic
  useEffect(() => {
    if (isLoadingScreen) {
      chaseAnim.setValue(-150);
      Animated.loop(
        Animated.timing(chaseAnim, {
          toValue: width + 50,
          duration: 3500,
          easing: Easing.linear,
          useNativeDriver: !isWeb,
        })
      ).start();
    } else {
      chaseAnim.stopAnimation();
    }
  }, [isLoadingScreen, width]);

  // LEADERBOARD STATE
  const [leaderboard] = useState(generateInitialLeaderboard());
  const [highScore, setHighScore] = useState(0);
  const [concurrentUsers, setConcurrentUsers] = useState(Math.floor(Math.random() * 500) + 1200);

  // Fluctuating concurrent users every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setConcurrentUsers(prev => prev + Math.floor(Math.random() * 11) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute Full Leaderboard for UI
  const getRankedLeaderboard = () => {
    const fullBoard = [...leaderboard, { id: 'user', name: 'You', score: highScore, isUser: true }];
    fullBoard.sort((a, b) => b.score - a.score);
    return fullBoard.slice(0, 25); // Top 25
  };

  const rankedBoard = getRankedLeaderboard();
  const userRank = rankedBoard.findIndex(p => p.isUser) + 1;


  // GAME STATE
  const gameState = useRef({
    y: initialHeight / 2,
    velocity: 0,
    pipes: [{ x: initialWidth, gapY: initialHeight / 2, passed: false, animal: getRandomAnimal(), spoken: true }],
    score: 0,
    isGameOver: false,
    isPlaying: false,
    isAutopilot: false, // UI Test Bot mode!
    gameMode: 'turtle' as GameMode,
  });
  const [, setFrame] = useState(0);

  useEffect(() => {
    // Menu Background Animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: !isWeb,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: !isWeb,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: !isWeb,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: !isWeb,
        }),
      ]),
    ).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: !isWeb,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: !isWeb,
      }),
    ]).start();
  }, [fadeAnim, floatAnim, pulseAnim, slideUpAnim]);


  // GAME LOOP ENGINE
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const gameLoop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 16, 2); // normalize speed across different frame rates
      lastTime = now;

      const state = gameState.current;
      if (activeScreen === 'game' && !isLoadingScreen && state.isPlaying && !state.isGameOver) {

        const config = getModeSettings(state.gameMode);

        // Autopilot Bot Logic (UI Test Case) - Advanced Lookahead
        if (state.isAutopilot) {
          const birdLeft = width * 0.25;
          const nextPipe = state.pipes.find(p => p.x + 70 > birdLeft);
          if (nextPipe) {
            // Target slightly above the center of the gap to account for the arch of a jump 
            const targetY = nextPipe.gapY - 15;
            // Project the Bird's Y coordinate 3 frames into the future
            const lookAheadDrop = state.velocity * 3;

            if (state.y + lookAheadDrop > targetY && state.velocity > config.jump / 3) {
              state.velocity = config.jump; // Precision micro-flap
            }
          } else if (state.y > height / 2 + 50 && state.velocity > 0) {
            // Hover safely before pipes arrive
            state.velocity = config.jump;
          }
        }

        // Physics
        state.velocity += config.gravity * dt; // gravity changes by mode
        state.y += state.velocity * dt;

        // Ground & Ceiling hit detection
        if (state.y > height - 100 || state.y < -50) {
          state.isGameOver = true;
        }

        // Complexity increases slowly for kids (game gets faster slower)
        const speedMultiplier = config.speedBase + (Math.floor(state.score / 15) * 0.02); // Pipe speed changes by mode
        const gapSize = Math.max(150, config.gapBase - (Math.floor(state.score / 10) * 5)); // Gaps change by mode

        // Pipe updating & hit detection
        for (let p of state.pipes) {
          p.x -= (4 * speedMultiplier) * dt;

          // Speak animal name when entering screen
          if (!p.spoken && p.x < width) {
            p.spoken = true;
            const globalWindow = globalThis as any;
            if (!isMutedRef.current && Platform.OS === 'web' && globalWindow.window?.speechSynthesis) {
              globalWindow.window.speechSynthesis.cancel();

              const Utterance = globalWindow.SpeechSynthesisUtterance;
              if (Utterance) {
                const utterance = new Utterance(p.animal.name);
                utterance.rate = 1.0;
                utterance.pitch = 1.2;
                globalWindow.window.speechSynthesis.speak(utterance);
              }
            }
          }

          const birdLeft = width * 0.25;
          const birdRight = birdLeft + 40;
          const birdTop = state.y;
          const birdBottom = state.y + 40;

          const pipeLeft = p.x;
          const pipeRight = p.x + 70; // pipe width

          // Forgiving hitboxes for kids! 20px margin of error
          if (birdRight - 20 > pipeLeft && birdLeft + 20 < pipeRight) {
            // Use dynamically shrinking gap
            if (birdTop + 20 < p.gapY - gapSize || birdBottom - 20 > p.gapY + gapSize) {
              state.isGameOver = true;
            }
          }

          // Score logic
          if (!p.passed && p.x + 70 < birdLeft) {
            p.passed = true;
            state.score += 1;
            // Update Highscore real-time if autopilot or normal play
            setHighScore(prev => Math.max(prev, state.score));
          }
        }

        // Spawning new pipes (safely away from edges)
        if (state.pipes[state.pipes.length - 1].x < width - (320 / speedMultiplier)) {
          const safeMargin = gapSize + 40;
          const minGapY = safeMargin;
          const maxGapY = Math.max(safeMargin + 10, height - safeMargin);
          state.pipes.push({
            x: width,
            gapY: minGapY + Math.random() * (maxGapY - minGapY),
            passed: false,
            animal: getRandomAnimal(),
            spoken: false
          });
        }

        // Despawning old pipes
        if (state.pipes[0].x < -100) {
          state.pipes.shift();
        }
      }

      if (activeScreen === 'game' && !isLoadingScreen) {
        // Force re-render to visually sync with JS game engine state
        setFrame(f => f + 1);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeScreen, isLoadingScreen, width, height]);

  // Handle Keyboard Spacebar for Flying/Flapping
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const globalWindow = globalThis as any;

    const handleKeyDown = (e: any) => {
      // Spacebar or ArrowUp to flap
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (activeScreen === 'game' && !isLoadingScreen) {
          e.preventDefault(); // prevent scrolling if focused elsewhere
          handleFlap();
        }
      }
    };

    if (globalWindow.window) {
      globalWindow.window.addEventListener('keydown', handleKeyDown);
      return () => globalWindow.window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeScreen, isLoadingScreen]);

  const handleFlap = () => {
    const state = gameState.current;
    if (state.isAutopilot) return; // Prevent manual flap stealing control from autopilot
    const config = getModeSettings(state.gameMode);

    if (state.isGameOver) {
      // Reset Game
      state.y = height / 2;
      state.velocity = config.jump * 0.8;
      state.pipes = [{ x: width, gapY: height / 2, passed: false, animal: getRandomAnimal(), spoken: true }];
      state.score = 0;
      state.isGameOver = false;
      state.isPlaying = true;
    } else {
      state.isPlaying = true;
      state.velocity = config.jump; // Dynamic jump
    }
  };

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.profileBadge}
        onPress={() => setActiveScreen('leaderboard')}
      >
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1549488344-c6eaf6a3e590?auto=format&fit=crop&w=150&q=80',
          }}
          style={styles.avatar}
          imageStyle={styles.avatarImage}
        />
        <View>
          <Text style={styles.playerName}>You</Text>
          <Text style={styles.playerTitle}>Rank: {userRank}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.currencyContainer}>
        <View style={[styles.currencyPill, styles.liveBadge]}>
          <View style={styles.liveDot} />
          <Text style={styles.currencyText}>{concurrentUsers} LIVE</Text>
        </View>
        <View style={[styles.currencyPill, styles.gemPill]}>
          <Text style={styles.currencyIcon}>⭐</Text>
          <Text style={styles.currencyText}>{highScore} PTS</Text>
        </View>
      </View>
    </View>
  );

  const renderMenu = () => (
    <Animated.View
      style={[
        styles.menuContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
      ]}
    >
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <HeroText text="FLYING" style={styles.titleTextTop} />
        <HeroText text={activePlayer.name.toUpperCase()} style={styles.titleTextBottom} />
      </Animated.View>

      <Text style={styles.seasonText}>SUPER KIDS FUN MODE: SLOW & EASY TO PLAY! 🎈</Text>

      <View style={styles.mainActions}>
        {(['turtle', 'bunny', 'cheetah'] as GameMode[]).map((mode) => {
          const config = getModeSettings(mode);
          return (
            <TouchableOpacity
              key={mode}
              activeOpacity={0.9}
              style={{ marginBottom: 15 }}
              onPress={() => {
                gameState.current.gameMode = mode;
                gameState.current.y = height / 2;
                gameState.current.velocity = 0;
                gameState.current.score = 0;
                gameState.current.isGameOver = false;
                gameState.current.isPlaying = false;
                gameState.current.isAutopilot = false;
                gameState.current.pipes = [{ x: width, gapY: height / 2, passed: false, animal: getRandomAnimal(), spoken: true }];

                setIsLoadingScreen(true);
                setActiveScreen('game');
                setLoadingAnimalIndex(0);

                let flashes = 0;
                const loadingInterval = setInterval(() => {
                  flashes++;
                  const nextIdx = flashes % ANIMALS.length;
                  setLoadingAnimalIndex(nextIdx);
                  speakLoadingAnimal(ANIMALS[nextIdx].name);

                  // Slowed down to 1200ms per animal, showing 4 animals total
                  if (flashes >= 4) {
                    clearInterval(loadingInterval);
                    setIsLoadingScreen(false);
                    gameState.current.isPlaying = true;
                  }
                }, 1500);
              }}
            >
              <Animated.View
                style={[
                  styles.playButton,
                  {
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                    shadowColor: config.borderColor,
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <View style={[styles.playButtonInner, { backgroundColor: config.innerBgColor }]}>
                  <Text style={styles.playButtonText}>{config.name}</Text>
                  <Text style={styles.playButtonSubInfo}>{config.subtitle}</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}

        {/* UI TEST CASE / BOT MODE TOGGLE */}
        <TouchableOpacity
          style={styles.botModeBtn}
          onPress={() => {
            gameState.current.gameMode = 'turtle';
            gameState.current.y = height / 2;
            gameState.current.velocity = 0;
            gameState.current.score = 0;
            gameState.current.isGameOver = false;
            gameState.current.isAutopilot = true;
            gameState.current.isPlaying = false; // pause physics during load
            gameState.current.pipes = [{ x: width, gapY: height / 2, passed: false, animal: getRandomAnimal(), spoken: true }];

            // LAUNCH THE FUN LOADING SCREEN FOR BOT TOO!
            setIsLoadingScreen(true);
            setActiveScreen('game');
            setLoadingAnimalIndex(0);

            let flashes = 0;
            const loadingInterval = setInterval(() => {
              flashes++;
              const nextIdx = flashes % ANIMALS.length;
              setLoadingAnimalIndex(nextIdx);
              speakLoadingAnimal(ANIMALS[nextIdx].name);

              if (flashes >= 4) {
                clearInterval(loadingInterval);
                setIsLoadingScreen(false);
                gameState.current.isPlaying = true; // launch bot!
              }
            }, 1500);
          }}
        >
          <Text style={styles.botModeText}>🤖 RUN UI TEST (AUTOPILOT)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsGrid}>
        <Card
          title="Global Ranks"
          subtitle={`You: #${userRank}`}
          icon="🏆"
          variant="gold"
          onPress={() => setActiveScreen('leaderboard')}
        />
        <Card
          title="Sponsor"
          subtitle="Support Us!"
          icon="☕"
          variant="neon"
          onPress={() => setActiveScreen('shop')}
        />
      </View>
    </Animated.View>
  );

  const renderLeaderboard = () => (
    <View style={styles.shopContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>EARTH CYCLE #42</Text>
        <TouchableOpacity onPress={() => setActiveScreen('menu')}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.seasonText}>COMPETITION RESTS DAILY. POINTS ERASED.</Text>

      <View style={styles.leaderboardHeaders}>
        <Text style={styles.lbHeadRank}>RANK</Text>
        <Text style={styles.lbHeadName}>PILOT</Text>
        <Text style={styles.lbHeadScore}>SCORE</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {rankedBoard.map((p, i) => (
          <View key={p.id} style={[styles.lbRow, p.isUser && styles.lbUserRow]}>
            <Text style={[styles.lbRank, p.isUser && styles.lbUserText]}>#{i + 1}</Text>
            <Text style={[styles.lbName, p.isUser && styles.lbUserText]}>{p.name}</Text>
            <Text style={[styles.lbScore, p.isUser && styles.lbUserText]}>{p.score}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderShop = () => (
    <View style={styles.shopContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>SPONSOR US</Text>
        <TouchableOpacity onPress={() => setActiveScreen('menu')}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sponsorBody}>
          FlyingPro is 100% free to play. If you love the game and want to support development, consider buying us a coffee! ☕
        </Text>
        <View style={styles.shopSection}>
          <Text style={styles.sectionTitle}>Sponsor Tiers</Text>
          <TouchableOpacity style={styles.shopItem} onPress={() => Linking.openURL('https://ko-fi.com/flyingbirdalways')}>
            <Text style={styles.shopItemIcon}>☕</Text>
            <View style={styles.shopItemDetails}>
              <Text style={styles.shopItemName}>1 Coffee</Text>
              <Text style={styles.shopItemDesc}>Support indie dev</Text>
            </View>
            <View style={styles.shopItemPriceBtn}>
              <Text style={styles.shopItemPrice}>$10.00</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shopItem, styles.premiumItem]} onPress={() => Linking.openURL('https://ko-fi.com/flyingbirdalways')}>
            <Text style={styles.shopItemIcon}>☕☕</Text>
            <View style={styles.shopItemDetails}>
              <Text style={styles.shopItemName}>2 Coffees</Text>
              <Text style={styles.shopItemDesc}>Double the caffeine!</Text>
            </View>
            <View style={styles.shopItemPriceBtn}>
              <Text style={styles.shopItemPrice}>$20.00</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shopItem, styles.sponsorTier3]} onPress={() => Linking.openURL('https://ko-fi.com/flyingbirdalways')}>
            <Text style={styles.shopItemIcon}>☕☕☕</Text>
            <View style={styles.shopItemDetails}>
              <Text style={styles.shopItemName}>3 Coffees</Text>
              <Text style={styles.shopItemDesc}>You are amazing! 🎉</Text>
            </View>
            <View style={styles.shopItemPriceBtn}>
              <Text style={styles.shopItemPrice}>$30.00</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderGame = () => {
    const state = gameState.current;

    // Loading Screen Override
    if (isLoadingScreen) {
      const activeAnimal = ANIMALS[loadingAnimalIndex];
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>LOADING ALL ANIMALS...</Text>

          {/* CHASE SCENE HD ANIMATION */}
          <View style={styles.chaseSceneContainer}>
            <Animated.View style={[styles.chaserWrapper, { transform: [{ translateX: chaseAnim }] }]}>
              {/* Animal Chasing */}
              <Image source={activeAnimal.img} style={[styles.chasingAnimalImg, { transform: [{ scaleX: -1 }] }]} resizeMode="contain" />
              {/* Bird Running */}
              <Image source={activePlayer.img} style={[styles.fleeingBirdImg, { transform: [{ scaleX: -1 }] }]} resizeMode="contain" />
            </Animated.View>
          </View>

          <View style={styles.loadingAnimalBox}>
            <Image source={activeAnimal.img} style={styles.loadingAnimalTargetImg} resizeMode="contain" />
          </View>
          <Text style={styles.loadingAnimalTargetName}>Loading {activeAnimal.name}...</Text>

          <TouchableOpacity style={[styles.muteButton, { marginTop: 40 }]} onPress={toggleMute}>
            <Text style={styles.muteButtonText}>{isMuted ? '🔇 Muted' : '🔊 Sound On'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Dynamically Shrinking Gap logic for UI rendering to match physics
    const config = getModeSettings(state.gameMode);
    const gapSize = Math.max(150, config.gapBase - (Math.floor(state.score / 10) * 5));

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.gameContainer}
        onPress={handleFlap}
      >
        {/* PIPES (ANIMALS) Rendering */}
        {state.pipes.map((pipe, i) => {
          const topGap = Math.max(0, pipe.gapY - gapSize);
          const bottomGap = Math.max(0, height - (pipe.gapY + gapSize));

          return (
            <React.Fragment key={i}>
              {/* Top Animal Container */}
              <View style={[styles.pipeOuter, styles.pipeTop, { left: pipe.x, height: topGap }]}>
                {topGap > 60 && (
                  <View style={styles.animalPillarContainer}>
                    <Image source={pipe.animal.img} style={styles.animalImgHero} resizeMode="contain" />
                    <Text style={styles.animalPillarName}>{pipe.animal.name}</Text>
                  </View>
                )}
              </View>
              {/* Bottom Animal Container */}
              <View style={[styles.pipeOuter, styles.pipeBottom, { left: pipe.x, top: pipe.gapY + gapSize, height: bottomGap }]}>
                {bottomGap > 60 && (
                  <View style={styles.animalPillarContainer}>
                    <Image source={pipe.animal.img} style={styles.animalImgHero} resizeMode="contain" />
                    <Text style={styles.animalPillarName}>{pipe.animal.name}</Text>
                  </View>
                )}
              </View>
            </React.Fragment>
          );
        })}

        {/* HUD Overlay */}
        <View style={styles.gameHud}>
          <View style={styles.topGameHudRow}>
            <Text style={styles.stageText}>STAGE {Math.floor(state.score / 10) + 1}</Text>

            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
              <Text style={styles.muteButtonText}>{isMuted ? '🔇 Muted' : '🔊 Sound On'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.scoreText}>{state.score}</Text>
          {state.isGameOver && (
            <View style={styles.gameOverBox}>
              <Text style={styles.gameOverText}>OOPS!</Text>
              <Text style={styles.tapToRestart}>Tap Anywhere to Try Again</Text>
            </View>
          )}
          {!state.isPlaying && !state.isGameOver && !state.isAutopilot && (
            <Text style={styles.tapToRestart}>Tap Anywhere to Start Fun! 🚀</Text>
          )}
          {state.isAutopilot && (
            <Text style={[styles.tapToRestart, styles.autopilotHighlight]}>Autopilot Engaged</Text>
          )}
        </View>

        {/* THE HD REALISTIC BIRD WITH ANIMATION */}
        {/* We dynamically compute the rotation so when jumping it looks up, when falling it aims down */}
        <Animated.View style={[styles.birdWrapper, { top: state.y, left: width * 0.25, transform: [{ scaleX: -1 }, { rotate: `${Math.max(-25, Math.min(25, state.velocity * 3))}deg` }] }]}>
          <Image source={activePlayer.img} style={styles.birdImgHero} resizeMode="contain" />
        </Animated.View>

        <TouchableOpacity
          style={styles.gameOverlayBtn}
          onPress={() => {
            state.isPlaying = false;
            setActiveScreen('menu');
          }}
        >
          <Text style={styles.backText}>&lt; Quit Run</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const bgUrl = activeScreen === 'game'
    ? getBackgroundUrl(gameState.current.score)
    : LANDSCAPES[0];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ImageBackground
        source={{ uri: bgUrl }}
        style={styles.bgImage}
        blurRadius={activeScreen === 'menu' ? 0 : 10}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          {activeScreen !== 'game' && renderTopBar()}
          {activeScreen === 'menu' && renderMenu()}
          {activeScreen === 'shop' && renderShop()}
          {activeScreen === 'leaderboard' && renderLeaderboard()}
          {activeScreen === 'game' && renderGame()}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87CEEB' }, // Sky blue kids theme!
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Bright overly
  },
  safeArea: { flex: 1 },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    zIndex: 10,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingRight: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD700',
    ...boxShadow('rgba(0,0,0,0.1)', 10, 0, 4)
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarImage: { borderRadius: 20 },
  playerName: { color: '#333', fontSize: 14, fontWeight: '900' },
  playerTitle: { color: '#FF9900', fontSize: 12, fontWeight: '900' },

  currencyContainer: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: { marginRight: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF00', marginRight: 6 },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
    ...boxShadow('rgba(0,0,0,0.1)', 5, 0, 3)
  },
  gemPill: { borderColor: '#FFD700' },
  currencyIcon: { fontSize: 16, marginRight: 6 },
  currencyText: { color: '#FF4500', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

  // Menu
  menuContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },

  // Hero Text
  glitchContainer: { alignItems: 'center', marginVertical: -5 },
  glitchText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFF',
    ...textShadow('#FF4500', 0, 3, 3) // chunky cartoon shadow
  },
  glitchLayer1: { display: 'none' }, // Remove glitch for kids
  glitchLayer2: { display: 'none' }, // Remove glitch for kids
  titleTextTop: { fontSize: 64, letterSpacing: -1, color: '#FFD700', ...textShadow('#FF4500', 0, 4, 4) },
  titleTextBottom: {
    fontSize: 72,
    color: '#00FF00',
    ...textShadow('#008000', 0, 4, 4)
  },
  seasonText: {
    color: '#FF1493',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 15,
    marginBottom: 10,
    ...textShadow('#FFF', 0, 2, 2)
  },

  // Play Button
  mainActions: { alignItems: 'center', marginVertical: 30 },
  playButton: {
    width: 250,
    height: 85,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    elevation: 8,
  },
  playButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    ...textShadow('rgba(0,0,0,0.2)', 0, 2, 2)
  },
  playButtonSubInfo: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.9,
  },
  botModeBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    ...boxShadow('rgba(0,0,0,0.1)', 4, 0, 2)
  },
  botModeText: {
    color: '#333',
    fontWeight: '800',
    fontSize: 12,
  },

  // Grid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 20,
  },
  card: {
    flex: 1,
    minWidth: 140,
    maxWidth: 200,
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 15,
    borderWidth: 3,
    ...boxShadow('rgba(0,0,0,0.1)', 8, 0, 4),
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 28, marginRight: 10 },
  cardTitle: { color: '#333', fontSize: 16, fontWeight: '900' },
  cardSubtitle: { color: '#FF4500', fontSize: 12, fontWeight: '800' },

  // GAME UI Mechanics
  gameContainer: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  gameHud: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    zIndex: 10
  },
  topGameHudRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    alignItems: 'center'
  },
  stageText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0FF',
    letterSpacing: 4,
    ...textShadow('#F0F', 5)
  },
  muteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  muteButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  scoreText: {
    fontSize: 80,
    fontWeight: '900',
    color: '#FFF',
    ...textShadow('#000', 10)
  },
  gameOverBox: {
    marginTop: 40,
    backgroundColor: 'rgba(255, 0, 80, 0.4)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF0055'
  },
  gameOverText: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: 2 },
  tapToRestart: { color: '#0FF', fontSize: 18, fontWeight: '700', marginTop: 10 },
  autopilotHighlight: { color: '#F0F' },

  // Game Animal Obstacles
  pipeOuter: {
    position: 'absolute',
    width: 100,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'hidden',
  },
  pipeTop: {
    top: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10
  },
  pipeBottom: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10
  },
  animalPillarContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 20,
    width: 90
  },
  animalImgHero: {
    width: 60,
    height: 60,
  },
  animalPillarName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
    textTransform: 'uppercase',
    ...textShadow('#000', 5)
  },

  // FUN LOADING SCREEN STYLES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 5, 20, 0.85)',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0FF',
    marginBottom: 40,
    letterSpacing: 3,
    ...textShadow('#F0F', 8)
  },
  chaseSceneContainer: {
    width: '100%',
    height: 100,
    overflow: 'hidden',
    marginBottom: 40,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 50,
  },
  chaserWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    gap: 100,
    position: 'absolute',
    height: '100%',
  },
  chasingAnimalImg: {
    width: 70,
    height: 70,
  },
  fleeingBirdImg: {
    width: 60,
    height: 60,
    transform: [{ scaleX: -1 }] // Bird looks to the right!
  },
  loadingAnimalBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FF0055',
    ...boxShadow('#FF0055', 20),
    marginBottom: 20,
  },
  loadingAnimalTargetImg: {
    width: 120,
    height: 120,
  },
  loadingAnimalTargetName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },

  // "HD Bird" Mechanics
  birdWrapper: {
    position: 'absolute',
  },
  birdImgHero: {
    width: 60,
    height: 60,
    ...boxShadow('#0FF', 15)
  },

  gameOverlayBtn: { position: 'absolute', top: 50, left: 20, zIndex: 100 },
  backText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  // Leaderboard Modal
  leaderboardHeaders: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: 2, borderColor: '#EEE', marginBottom: 10 },
  lbHeadRank: { flex: 0.5, color: '#888', fontSize: 14, fontWeight: '900' },
  lbHeadName: { flex: 2, color: '#888', fontSize: 14, fontWeight: '900' },
  lbHeadScore: { flex: 1, color: '#888', fontSize: 14, fontWeight: '900', textAlign: 'right' },
  lbRow: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  lbUserRow: { backgroundColor: '#FFF0F5', borderColor: '#FF1493', borderRadius: 15, borderWidth: 2 },
  lbRank: { flex: 0.5, color: '#FF4500', fontWeight: '900', fontSize: 18 },
  lbName: { flex: 2, color: '#333', fontWeight: '900', fontSize: 18 },
  lbScore: { flex: 1, color: '#00D4FF', fontWeight: '900', fontSize: 18, textAlign: 'right' },
  lbUserText: { color: '#FF1493' },

  // Shop / Modals
  shopContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 20,
    padding: 20,
    ...boxShadow('rgba(0,0,0,0.1)', 20, 0, -10)
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 28, fontWeight: '900', color: '#FF4500' },
  closeBtn: { fontSize: 28, color: '#FF4500', fontWeight: '900' },
  shopSection: { marginBottom: 25 },
  sectionTitle: {
    color: '#00D4FF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 15,
    letterSpacing: 1,
  },
  sponsorBody: { color: '#666', fontSize: 16, fontWeight: '700', marginBottom: 20 },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#EEE',
    ...boxShadow('rgba(0,0,0,0.05)', 5, 0, 3)
  },
  premiumItem: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBE6',
  },
  sponsorTier3: {
    borderColor: '#FF1493',
    backgroundColor: '#FFF0F5'
  },
  shopItemIcon: { fontSize: 36, marginRight: 15 },
  shopItemDetails: { flex: 1 },
  shopItemName: { color: '#333', fontSize: 18, fontWeight: '900' },
  shopItemDesc: { color: '#888', fontSize: 14, fontWeight: '700', marginTop: 4 },
  shopItemPriceBtn: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  shopItemPrice: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
