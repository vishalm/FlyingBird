import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  Easing,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';

const { width } = Dimensions.get('window');
const height = Dimensions.get('window').height || 800;

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
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', // 0-9: Neon City
  'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2564&auto=format&fit=crop', // 10-19: Forest
  'https://images.unsplash.com/photo-1610427958532-628d052a5ec2?q=80&w=2564&auto=format&fit=crop', // 20-29: Volcano
  'https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=2564&auto=format&fit=crop', // 30-39: Deep Ocean
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2564&auto=format&fit=crop', // 40-49: Digital Grid
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2564&auto=format&fit=crop', // 50+: Void
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


const GlitchedText = ({ text, style }: any) => {
  return (
    <View style={styles.glitchContainer}>
      <Text style={[styles.glitchText, style, styles.glitchLayer1]}>
        {text}
      </Text>
      <Text style={[styles.glitchText, style, styles.glitchLayer2]}>
        {text}
      </Text>
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
  const [activeScreen, setActiveScreen] = useState('menu');

  // MENU ANIMATIONS
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    y: height / 2,
    velocity: 0,
    pipes: [{ x: width, gapY: height / 2, passed: false }],
    score: 0,
    isGameOver: false,
    isPlaying: false,
    isAutopilot: false, // UI Test Bot mode!
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
      if (activeScreen === 'game' && state.isPlaying && !state.isGameOver) {

        // Autopilot Bot Logic (UI Test Case) - Advanced Lookahead
        if (state.isAutopilot) {
          const birdLeft = width * 0.25;
          const nextPipe = state.pipes.find(p => p.x + 70 > birdLeft);
          if (nextPipe) {
            // Target slightly above the center of the gap to account for the arch of a jump 
            const targetY = nextPipe.gapY - 15;
            // Project the Bird's Y coordinate 3 frames into the future
            const lookAheadDrop = state.velocity * 3;

            if (state.y + lookAheadDrop > targetY && state.velocity > -4) {
              state.velocity = -10.5; // Precision micro-flap
            }
          } else if (state.y > height / 2 + 50 && state.velocity > 0) {
            // Hover safely before pipes arrive
            state.velocity = -10.5;
          }
        }

        // Physics
        state.velocity += 0.8 * dt; // gravity
        state.y += state.velocity * dt;

        // Ground & Ceiling hit detection
        if (state.y > height - 100 || state.y < -50) {
          state.isGameOver = true;
        }

        // Complexity increases every 10 points
        const speedMultiplier = 1 + (Math.floor(state.score / 10) * 0.15); // Pipes get faster
        const gapSize = Math.max(80, 100 - (Math.floor(state.score / 10) * 5)); // Gap decreases

        // Pipe updating & hit detection
        for (let p of state.pipes) {
          p.x -= (4 * speedMultiplier) * dt;

          const birdLeft = width * 0.25;
          const birdRight = birdLeft + 40;
          const birdTop = state.y;
          const birdBottom = state.y + 40;

          const pipeLeft = p.x;
          const pipeRight = p.x + 70; // pipe width

          // Collision logic
          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Use dynamically shrinking gap
            if (birdTop < p.gapY - gapSize || birdBottom > p.gapY + gapSize) {
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

        // Spawning new pipes
        if (state.pipes[state.pipes.length - 1].x < width - (280 / speedMultiplier)) {
          state.pipes.push({
            x: width,
            gapY: 200 + Math.random() * (height - 400),
            passed: false
          });
        }

        // Despawning old pipes
        if (state.pipes[0].x < -100) {
          state.pipes.shift();
        }
      }

      if (activeScreen === 'game') {
        // Force re-render to visually sync with JS game engine state
        setFrame(f => f + 1);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeScreen]);

  const handleFlap = () => {
    const state = gameState.current;
    if (state.isAutopilot) return; // Prevent manual flap stealing control from autopilot

    if (state.isGameOver) {
      // Reset Game
      state.y = height / 2;
      state.velocity = -10;
      state.pipes = [{ x: width, gapY: height / 2, passed: false }];
      state.score = 0;
      state.isGameOver = false;
      state.isPlaying = true;
    } else {
      state.isPlaying = true;
      state.velocity = -12;
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
        <GlitchedText text="FLYING" style={styles.titleTextTop} />
        <GlitchedText text="PRO" style={styles.titleTextBottom} />
      </Animated.View>

      <Text style={styles.seasonText}>COMPETITION ENDS IN: 38H 12M 04S</Text>

      <View style={styles.mainActions}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            gameState.current.y = height / 2;
            gameState.current.velocity = 0;
            gameState.current.score = 0;
            gameState.current.isGameOver = false;
            gameState.current.isPlaying = false;
            gameState.current.isAutopilot = false;
            gameState.current.pipes = [{ x: width, gapY: height / 2, passed: false }];
            setActiveScreen('game')
          }}
        >
          <Animated.View
            style={[styles.playButton, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={styles.playButtonInner}>
              <Text style={styles.playButtonText}>TAP TO FLY</Text>
              <Text style={styles.playButtonSubInfo}>Free To Play ✦ Improve Rank</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* UI TEST CASE / BOT MODE TOGGLE */}
        <TouchableOpacity
          style={styles.botModeBtn}
          onPress={() => {
            gameState.current.y = height / 2;
            gameState.current.velocity = 0;
            gameState.current.score = 0;
            gameState.current.isGameOver = false;
            gameState.current.isAutopilot = true;
            gameState.current.isPlaying = true;
            gameState.current.pipes = [{ x: width, gapY: height / 2, passed: false }];
            setActiveScreen('game');
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

    // Dynamically Shrinking Gap logic for UI rendering to match physics
    const gapSize = Math.max(80, 100 - (Math.floor(state.score / 10) * 5));

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.gameContainer}
        onPress={handleFlap}
      >
        {/* PIPES Rendering */}
        {state.pipes.map((pipe, i) => (
          <React.Fragment key={i}>
            {/* Top Pipe */}
            <View style={[styles.pipeOuter, styles.pipeTop, { left: pipe.x, height: Math.max(0, pipe.gapY - gapSize) }]}>
              <View style={styles.pipeInner} />
            </View>
            {/* Bottom Pipe */}
            <View style={[styles.pipeOuter, { left: pipe.x, top: pipe.gapY + gapSize, height: Math.max(0, height - (pipe.gapY + gapSize)) }]}>
              <View style={styles.pipeInner} />
            </View>
          </React.Fragment>
        ))}

        {/* HUD Overlay */}
        <View style={styles.gameHud}>
          <Text style={styles.stageText}>STAGE {Math.floor(state.score / 10) + 1}</Text>
          <Text style={styles.scoreText}>{state.score}</Text>
          {state.isGameOver && (
            <View style={styles.gameOverBox}>
              <Text style={styles.gameOverText}>CRASHED!</Text>
              <Text style={styles.tapToRestart}>Tap Anywhere to Restart</Text>
            </View>
          )}
          {!state.isPlaying && !state.isGameOver && !state.isAutopilot && (
            <Text style={styles.tapToRestart}>Tap Anywhere to Fly</Text>
          )}
          {state.isAutopilot && (
            <Text style={[styles.tapToRestart, styles.autopilotHighlight]}>Autopilot Engaged</Text>
          )}
        </View>

        {/* THE IMAGINARY BIRD */}
        {/* We use Native styles here to render a glowing cosmic orb bird */}
        <View style={[styles.birdWrapper, { top: state.y }]}>
          <View style={styles.imaginaryBirdBody}>
            {/* Pulsing Core */}
            <View style={styles.birdCore} />
            {/* Neon Cyber Wing */}
            <View style={styles.birdWing} />
            {/* Laser Eye */}
            <View style={styles.birdEye} />
          </View>
        </View>

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
  container: { flex: 1, backgroundColor: '#050510' },
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 20, 0.65)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingRight: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarImage: { borderRadius: 20 },
  playerName: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  playerTitle: { color: '#0FF', fontSize: 11, fontWeight: '800' },

  currencyContainer: { flexDirection: 'row', alignItems: 'center' },
  liveBadge: { marginRight: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF0055', marginRight: 6 },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gemPill: { borderColor: 'rgba(255, 215, 0, 0.5)', ...boxShadow('rgba(255, 215, 0, 0.2)', 10) },
  currencyIcon: { fontSize: 14, marginRight: 6 },
  currencyText: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  // Menu
  menuContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },

  // Glitch Effect Title
  glitchContainer: { alignItems: 'center', marginVertical: -5 },
  glitchText: {
    fontSize: 56,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFF',
    ...textShadow('rgba(0, 255, 255, 0.8)', 15)
  },
  glitchLayer1: {
    position: 'absolute',
    left: 2,
    top: -2,
    color: '#0FF',
    opacity: 0.7,
  },
  glitchLayer2: {
    position: 'absolute',
    left: -2,
    top: 2,
    color: '#F0F',
    opacity: 0.7,
  },
  titleTextTop: { fontSize: 64, letterSpacing: -2 },
  titleTextBottom: {
    fontSize: 72,
    color: '#0FF',
    ...textShadow('#F0F', 0)
  },
  seasonText: {
    color: '#0CC',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 15,
    marginBottom: 10,
    ...textShadow('rgba(0, 255, 255, 0.5)', 5)
  },

  // Play Button
  mainActions: { alignItems: 'center', marginVertical: 30 },
  playButton: {
    width: 240,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 0, 100, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF0055',
    ...boxShadow('#FF0055', 20),
    elevation: 10,
  },
  playButtonInner: {
    width: '95%',
    height: '90%',
    borderRadius: 36,
    backgroundColor: 'rgba(255, 0, 100, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  playButtonSubInfo: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.8,
  },
  botModeBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0FF',
  },
  botModeText: {
    color: '#0FF',
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
    width: (width - 80) / 2, // slightly adjusted width
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 24, marginRight: 10 },
  cardTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  cardSubtitle: { color: '#A0A0B0', fontSize: 11, fontWeight: '600' },

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
  stageText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0FF',
    letterSpacing: 4,
    ...textShadow('#F0F', 5)
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

  // Game Pipes (Neon Style)
  pipeOuter: {
    position: 'absolute',
    width: 70,
    backgroundColor: 'rgba(0, 255, 150, 0.1)',
    borderWidth: 2,
    borderColor: '#00FF96',
    borderRadius: 10,
    overflow: 'hidden',
  },
  pipeTop: { top: 0 },
  pipeInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 150, 0.3)',
    ...boxShadow('#00FF96', 20)
  },

  // "Imaginary Bird" Mechanics
  birdWrapper: {
    position: 'absolute',
    left: width * 0.25
  },
  imaginaryBirdBody: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.4)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0FF',
    ...boxShadow('#0FF', 15)
  },
  birdCore: {
    width: 16,
    height: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    ...boxShadow('#FFF', 10)
  },
  birdEye: {
    position: 'absolute',
    right: 8,
    top: 10,
    width: 6,
    height: 6,
    backgroundColor: '#FF0055',
    borderRadius: 3,
  },
  birdWing: {
    position: 'absolute',
    left: -10,
    width: 24,
    height: 12,
    backgroundColor: 'rgba(255, 0, 255, 0.6)',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    transform: [{ rotate: '-15deg' }],
  },

  gameOverlayBtn: { position: 'absolute', top: 50, left: 20, zIndex: 100 },
  backText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  // Leaderboard Modal
  leaderboardHeaders: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#333', marginBottom: 10 },
  lbHeadRank: { flex: 0.5, color: '#A0A0B0', fontSize: 12, fontWeight: '800' },
  lbHeadName: { flex: 2, color: '#A0A0B0', fontSize: 12, fontWeight: '800' },
  lbHeadScore: { flex: 1, color: '#A0A0B0', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  lbRow: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center' },
  lbUserRow: { backgroundColor: 'rgba(0, 255, 255, 0.15)', borderColor: '#0FF', borderRadius: 10 },
  lbRank: { flex: 0.5, color: '#0CC', fontWeight: '900', fontSize: 16 },
  lbName: { flex: 2, color: '#FFF', fontWeight: '700', fontSize: 16 },
  lbScore: { flex: 1, color: '#FF0055', fontWeight: '900', fontSize: 16, textAlign: 'right' },
  lbUserText: { color: '#FFF', ...textShadow('#0FF', 10) },

  // Shop
  shopContainer: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 20, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  closeBtn: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  shopSection: { marginBottom: 25 },
  sectionTitle: {
    color: '#0CC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 15,
    letterSpacing: 1,
  },
  sponsorBody: { color: '#FFF', fontSize: 16, marginBottom: 20 },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  premiumItem: {
    borderColor: 'rgba(255, 215, 0, 0.5)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  sponsorTier3: {
    borderColor: '#F0F',
    backgroundColor: 'rgba(255, 0, 255, 0.05)'
  },
  shopItemIcon: { fontSize: 30, marginRight: 15 },
  shopItemDetails: { flex: 1 },
  shopItemName: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  shopItemDesc: { color: '#A0A0B0', fontSize: 12, marginTop: 4 },
  shopItemPriceBtn: {
    backgroundColor: '#FF0055',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shopItemPrice: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
