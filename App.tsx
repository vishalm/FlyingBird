import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import SnakeGame from './src/snake/SnakeGame';
import FlyingBirdGame from './src/flying-bird/FlyingBirdGame';

export default function App() {
  const [selectedGame, setSelectedGame] = useState<'home' | 'snake' | 'flying-bird'>('home');

  if (selectedGame === 'snake') {
    return (
      <View style={{ flex: 1 }}>
        <SnakeGame />
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedGame('home')}>
          <Text style={styles.backText}>&lt; Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (selectedGame === 'flying-bird') {
    return (
      <View style={{ flex: 1 }}>
        <FlyingBirdGame />
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedGame('home')}>
          <Text style={styles.backText}>&lt; Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Game Center</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF6B6B' }]}
          onPress={() => setSelectedGame('flying-bird')}
        >
          <Text style={styles.buttonText}>Flying Bird 🐦</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4ECDC4' }]}
          onPress={() => setSelectedGame('snake')}
        >
          <Text style={styles.buttonText}>Snake Game 🐍</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 60,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 30,
    gap: 25,
  },
  button: {
    paddingVertical: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  backButton: {
    zIndex: 9999,
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  backText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  }
});
