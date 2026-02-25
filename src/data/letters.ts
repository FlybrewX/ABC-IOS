export interface LetterData {
  char: string;
  word: string;
  isVowel: boolean;
  color?: string;
}

export const ALPHABET_DATA: LetterData[] = [
  { char: 'A', word: 'Apple', isVowel: true },
  { char: 'B', word: 'Ball', isVowel: false },
  { char: 'C', word: 'Cat', isVowel: false },
  { char: 'D', word: 'Dog', isVowel: false },
  { char: 'E', word: 'Elephant', isVowel: true },
  { char: 'F', word: 'Fish', isVowel: false },
  { char: 'G', word: 'Giraffe', isVowel: false },
  { char: 'H', word: 'Horse', isVowel: false },
  { char: 'I', word: 'Igloo', isVowel: true },
  { char: 'J', word: 'Jellyfish', isVowel: false },
  { char: 'K', word: 'Kangaroo', isVowel: false },
  { char: 'L', word: 'Lion', isVowel: false },
  { char: 'M', word: 'Monkey', isVowel: false },
  { char: 'N', word: 'Nest', isVowel: false },
  { char: 'O', word: 'Octopus', isVowel: true },
  { char: 'P', word: 'Penguin', isVowel: false },
  { char: 'Q', word: 'Queen', isVowel: false },
  { char: 'R', word: 'Rabbit', isVowel: false },
  { char: 'S', word: 'Sun', isVowel: false },
  { char: 'T', word: 'Tiger', isVowel: false },
  { char: 'U', word: 'Umbrella', isVowel: true },
  { char: 'V', word: 'Van', isVowel: false },
  { char: 'W', word: 'Whale', isVowel: false },
  { char: 'X', word: 'Xylophone', isVowel: false },
  { char: 'Y', word: 'Yak', isVowel: false },
  { char: 'Z', word: 'Zebra', isVowel: false },
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
