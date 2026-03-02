import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

let currentSound: AudioPlayer | null = null;
let homeBgPlayer: AudioPlayer | null = null;
let playBgPlayer: AudioPlayer | null = null;
let alphabetSongPlayer: AudioPlayer | null = null;
let sparklePlayer: AudioPlayer | null = null;
let soundCache: { [key: string]: AudioPlayer } = {};

let isAudioInitialized = false;

export const initAudio = async () => {
  if (isAudioInitialized) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    });
    isAudioInitialized = true;
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

export const playBackgroundMusic = async (enabled: boolean, type: 'home' | 'play' = 'home', restart: boolean = false) => {
  console.log(`[Audio] playBackgroundMusic: enabled=${enabled}, type=${type}, restart=${restart}`);
  
  if (!isAudioInitialized) {
    console.log('[Audio] Initializing audio session...');
    await initAudio();
  }

  if (!enabled) {
    console.log(`[Audio] Pausing ${type} bg music`);
    if (type === 'home') {
      homeBgPlayer?.pause();
    } else {
      playBgPlayer?.pause();
    }
    return;
  }

  try {
    if (type === 'home') {
      console.log('[Audio] Starting home background music');
      if (playBgPlayer) {
        try { playBgPlayer.pause(); } catch(e) {}
      }
      if (!homeBgPlayer) {
        console.log('[Audio] Creating homeBgPlayer');
        const musicSource = require('../../assets/sounds/home_bg_music.mp3');
        homeBgPlayer = createAudioPlayer(musicSource);
        if (homeBgPlayer) homeBgPlayer.loop = true;
      }
      if (homeBgPlayer) {
        homeBgPlayer.volume = 0.4;
        if (restart) {
          console.log('[Audio] Restarting homeBgPlayer');
          try {
            if (homeBgPlayer.isLoaded) homeBgPlayer.seekTo(0);
          } catch (e) {
            console.warn('[Audio] Failed to seek homeBgPlayer:', e);
          }
        }
        try { 
          // Always check if it's already playing to avoid redundant calls
          if (!homeBgPlayer.playing) homeBgPlayer.play(); 
        } catch(e) { console.error("Play error (home):", e); }
      }
    } else {
      console.log('[Audio] Starting play background music');
      if (homeBgPlayer) {
        try { homeBgPlayer.pause(); } catch(e) {}
      }
      if (!playBgPlayer) {
        console.log('[Audio] Creating playBgPlayer');
        const musicSource = require('../../assets/sounds/bg_music.mp3');
        playBgPlayer = createAudioPlayer(musicSource);
        if (playBgPlayer) playBgPlayer.loop = true;
      }
      if (playBgPlayer) {
        playBgPlayer.volume = 0.4;
        if (restart) {
          console.log('[Audio] Restarting playBgPlayer');
          try {
            if (playBgPlayer.isLoaded) playBgPlayer.seekTo(0);
          } catch (e) {
            console.warn('[Audio] Failed to seek playBgPlayer:', e);
          }
        }
        try { 
          if (!playBgPlayer.playing) playBgPlayer.play(); 
        } catch(e) { console.error("Play error (play):", e); }
      }
    }
  } catch (error) {
    console.warn(`[Audio] Error playing background music for ${type}:`, error);
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
    case 'alphabet-song': return require('../../assets/sounds/alphabet-song.mp3');
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
    const l = letter.toLowerCase();
    
    // Stop current letter sound if any
    if (currentSound) {
      try {
        currentSound.pause();
        if (currentSound.isLoaded) currentSound.seekTo(0);
      } catch (e) {
        // Silently ignore if pause/seek fails
      }
    }

    // Reuse cached player if exists
    if (soundCache[l]) {
      currentSound = soundCache[l];
      try {
        if (currentSound.isLoaded) currentSound.seekTo(0);
        if (!currentSound.playing) currentSound.play();
      } catch (e) {
        console.warn(`[Audio] Failed to play cached sound for ${l}:`, e);
      }
      return;
    }

    const soundSource = getSoundFile(letter);
    if (!soundSource) {
      console.warn(`No sound file found for letter: ${letter}`);
      return;
    }

    const sound = createAudioPlayer(soundSource);
    soundCache[l] = sound;
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
      try {
        currentSound.seekTo(0);
      } catch (e) {
        // Silently ignore if seek fails
      }
      currentSound = null;
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }
};

export const unloadAllSounds = async (keepBackground: boolean = false) => {
  console.log(`[Audio] unloadAllSounds: keepBackground=${keepBackground}`);
  if (currentSound) {
    try {
      currentSound.remove();
      currentSound = null;
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  }

  if (!keepBackground && homeBgPlayer) {
    try {
      homeBgPlayer.remove();
      homeBgPlayer = null;
    } catch (error) {
      console.error('Error unloading home bg player:', error);
    }
  }

  if (!keepBackground && playBgPlayer) {
    try {
      playBgPlayer.remove();
      playBgPlayer = null;
    } catch (error) {
      console.error('Error unloading play bg player:', error);
    }
  }

  if (alphabetSongPlayer) {
    try {
      alphabetSongPlayer.remove();
      alphabetSongPlayer = null;
    } catch (error) {
      console.error('Error unloading alphabet song:', error);
    }
  }

  if (sparklePlayer) {
    try {
      sparklePlayer.remove();
      sparklePlayer = null;
    } catch (error) {
      console.error('Error unloading sparkle player:', error);
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

export const playAlphabetSong = async (enabled: boolean = true, onFinish?: () => void) => {
  if (!enabled) {
    onFinish?.();
    return;
  }
  try {
    if (alphabetSongPlayer) {
      alphabetSongPlayer.pause();
      alphabetSongPlayer.remove();
      alphabetSongPlayer = null;
    }
    const musicSource = require('../../assets/sounds/alphabet-song.mp3');
    alphabetSongPlayer = createAudioPlayer(musicSource);
    
    if (onFinish) {
      try {
        const subscription = alphabetSongPlayer.addListener('playbackStatusUpdate', (status) => {
          if (status.didJustFinish) {
            onFinish();
            subscription.remove();
          }
        });
      } catch (subError) {
        console.warn('[Audio] Failed to add playback listener:', subError);
      }
    }

    try {
      if (alphabetSongPlayer && !alphabetSongPlayer.playing) {
        alphabetSongPlayer.play();
      }
    } catch (playError) {
      console.error('Error calling play on alphabet song:', playError);
      onFinish?.();
    }
  } catch (error) {
    console.error('Error playing alphabet song:', error);
    onFinish?.();
  }
};
