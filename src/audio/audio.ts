import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

let currentSound: AudioPlayer | null = null;
let bgMusicPlayer: AudioPlayer | null = null;
let sparklePlayer: AudioPlayer | null = null;
let soundCache: { [key: string]: AudioPlayer } = {};

export const initAudio = async () => {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

export const playBackgroundMusic = async (enabled: boolean) => {
  if (!enabled) {
    if (bgMusicPlayer) {
      bgMusicPlayer.pause();
    }
    return;
  }

  try {
    if (!bgMusicPlayer) {
      const musicSource = require('../../assets/sounds/bg_music.mp3');
      if (musicSource) {
        bgMusicPlayer = createAudioPlayer(musicSource);
        bgMusicPlayer.loop = true;
        bgMusicPlayer.volume = 0.3;
      }
    }
    
    if (bgMusicPlayer) {
      bgMusicPlayer.play();
    }
  } catch (error) {
    console.warn('Background music file not found. Add bg_music.mp3 to assets/sounds/');
  }
};

const getSoundFile = (letter: string) => {
  const l = letter.toLowerCase();
  switch (l) {
    case 'a': return require('../../assets/sounds/a.wav');
    case 'b': return require('../../assets/sounds/b.wav');
    case 'c': return require('../../assets/sounds/c.wav');
    case 'd': return require('../../assets/sounds/d.wav');
    case 'e': return require('../../assets/sounds/e.wav');
    case 'f': return require('../../assets/sounds/f.wav');
    case 'g': return require('../../assets/sounds/g.wav');
    case 'h': return require('../../assets/sounds/h.wav');
    case 'i': return require('../../assets/sounds/i.mp3');
    case 'j': return require('../../assets/sounds/j.wav');
    case 'k': return require('../../assets/sounds/k.wav');
    case 'l': return require('../../assets/sounds/l.wav');
    case 'm': return require('../../assets/sounds/m.wav');
    case 'n': return require('../../assets/sounds/n.wav');
    case 'o': return require('../../assets/sounds/o.wav');
    case 'p': return require('../../assets/sounds/p.wav');
    case 'q': return require('../../assets/sounds/q.mp3');
    case 'r': return require('../../assets/sounds/r.wav');
    case 's': return require('../../assets/sounds/s.wav');
    case 't': return require('../../assets/sounds/t.wav');
    case 'u': return require('../../assets/sounds/u.wav');
    case 'v': return require('../../assets/sounds/v.wav');
    case 'w': return require('../../assets/sounds/w.wav');
    case 'x': return require('../../assets/sounds/x.wav');
    case 'y': return require('../../assets/sounds/y.wav');
    case 'z': return require('../../assets/sounds/z.wav');
    case 'correct':
    case 'success': return require('../../assets/sounds/correct.mp3');
    case 'wrong': return require('../../assets/sounds/wrong.mp3');
    case 'sparkle': return require('../../assets/sounds/sparkle.mp3');
    default: return null;
  }
};

export const playLetterSound = async (letter: string, enabled: boolean = true) => {
  if (!enabled) return;

  try {
    if (currentSound) {
      currentSound.pause();
      currentSound.remove();
      currentSound = null;
    }

    const soundSource = getSoundFile(letter);

    if (!soundSource) {
      console.warn(`No sound file found for letter: ${letter}. Add assets/sounds/${letter.toLowerCase()}.mp3`);
      return;
    }

    const sound = createAudioPlayer(soundSource);
    currentSound = sound;
    sound.play();
  } catch (error) {
    console.error(`Error playing sound for letter ${letter}:`, error);
  }
};

export const stopSound = async () => {
  if (currentSound) {
    try {
      currentSound.pause();
      currentSound.remove();
      currentSound = null;
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }
};

export const unloadAllSounds = async () => {
  if (currentSound) {
    try {
      currentSound.remove();
      currentSound = null;
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  }

  for (const sound of Object.values(soundCache)) {
    try {
      sound.remove();
    } catch (error) {
      console.error('Error unloading cached sound:', error);
    }
  }
  soundCache = {};
};

export const playSparkleSound = async (enabled: boolean = true) => {
  if (!enabled) return;
  try {
    if (!sparklePlayer) {
      sparklePlayer = createAudioPlayer(require('../../assets/sounds/sparkle.mp3'));
    }
    sparklePlayer.play();
  } catch (error) {
    console.error('Error playing sparkle sound:', error);
  }
};
