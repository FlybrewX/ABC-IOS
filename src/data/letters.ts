export interface LetterData {
  char: string;
  word: string;
  emoji: string;
  isVowel: boolean;
  color?: string;
}

export const ALPHABET_DATA: LetterData[] = [
  { char: 'A', word: 'Apple', emoji: '🍎', isVowel: true },
  { char: 'B', word: 'Ball', emoji: '⚽', isVowel: false },
  { char: 'C', word: 'Cat', emoji: '🐱', isVowel: false },
  { char: 'D', word: 'Doll', emoji: '🪆', isVowel: false },
  { char: 'E', word: 'Egg', emoji: '🥚', isVowel: true },
  { char: 'F', word: 'Fish', emoji: '🐟', isVowel: false },
  { char: 'G', word: 'Goat', emoji: '🐐', isVowel: false },
  { char: 'H', word: 'Hat', emoji: '🎩', isVowel: false },
  { char: 'I', word: 'Ice Cream', emoji: '🍦', isVowel: true },
  { char: 'J', word: 'Jump', emoji: '🏃', isVowel: false },
  { char: 'K', word: 'Kite', emoji: '🪁', isVowel: false },
  { char: 'L', word: 'Lamp', emoji: '💡', isVowel: false },
  { char: 'M', word: 'Moon', emoji: '🌙', isVowel: false },
  { char: 'N', word: 'Net', emoji: '🕸️', isVowel: false },
  { char: 'O', word: 'Owl', emoji: '🦉', isVowel: true },
  { char: 'P', word: 'Pet', emoji: '🐶', isVowel: false },
  { char: 'Q', word: 'Queen', emoji: '👸', isVowel: false },
  { char: 'R', word: 'Rain', emoji: '🌧️', isVowel: false },
  { char: 'S', word: 'Sun', emoji: '☀️', isVowel: false },
  { char: 'T', word: 'Train', emoji: '🚂', isVowel: false },
  { char: 'U', word: 'Umbrella', emoji: '☂️', isVowel: true },
  { char: 'V', word: 'Van', emoji: '🚐', isVowel: false },
  { char: 'W', word: 'Whale', emoji: '🐋', isVowel: false },
  { char: 'X', word: 'Xylophone', emoji: '🪗', isVowel: false },
  { char: 'Y', word: 'Yo-Yo', emoji: '🪀', isVowel: false },
  { char: 'Z', word: 'Zebra', emoji: '🦓', isVowel: false },
];

export const ALPHABET = ALPHABET_DATA.map(d => d.char);

export const getTotalLetters = () => ALPHABET_DATA.length;

export const isValidLetterIndex = (index: number) => {
  return index >= 0 && index < ALPHABET.length;
};

export const getLetterAtIndex = (index: number) => {
  if (isValidLetterIndex(index)) {
    return ALPHABET[index];
  }
  return 'A';
};

export const getLetterIndex = (letter: string) => {
  const index = ALPHABET.indexOf(letter.toUpperCase());
  return index >= 0 ? index : 0;
};
