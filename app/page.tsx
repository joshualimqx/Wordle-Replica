// app/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Rows from './components/rows';
import Typography from '@mui/material/Typography';
import Card from '@mui/joy/Card'; // Keep joy Card for controls
import MuiCard from '@mui/material/Card'; // Use MuiCard for logo/definition
import Cardcontent from '@mui/joy/CardContent'; // Keep joy CardContent for controls
import MuiCardContent from '@mui/material/CardContent'; // Use MuiCardContent for logo/definition
import Keyboard from './components/keyboard'; // Import the Keyboard component

export default function Home() {
  const [Letters, setLettersLength] = useState(5);
  const [loadedWordLists, setLoadedWordLists] = useState<{ [key: number]: string[] }>({});
  const [isWordsLoaded, setIsWordsLoaded] = useState(false);

  const [Word, setWord] = useState<string>("");
  const [wordDefinition, setWordDefinition] = useState<string | null>(null);
  const [isDefinitionLoading, setIsDefinitionLoading] = useState(false);

  const [NumofRows, setNumofRows] = useState(6);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [screenColor, setScreenColor] = useState('');

  const [inputValues, setInputValues] = useState<string[][]>([]);
  const [allLetterColors, setAllLetterColors] = useState<string[][]>([]);
  const [keyboardKeyColors, setKeyboardKeyColors] = useState<{ [key: string]: string }>({});

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const [showWord, setShowWord] = useState(false);
  const [showDefinitionCard, setShowDefinitionCard] = useState(false); // New state for definition card visibility

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobile = Boolean(
      userAgent.match(
        /Android|BlackBerry|iPhone|iPad|IPhone|Opera Mini|Windows Phone/i
      )
    );
    setIsMobile(mobile);
  }, []);

  const fetchWords = async (length: number) => {
    try {
      const response = await fetch(`/words/${length}.txt`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${length}.txt: ${response.statusText}`);
      }
      const text = await response.text();
      return text.split('\n').map(word => word.trim().toUpperCase()).filter(word => word.length === length);
    } catch (error) {
      console.error(`Error fetching words for length ${length}:`, error);
      return [];
    }
  };

  useEffect(() => {
    const loadAllWords = async () => {
      const allWords: { [key: number]: string[] } = {};
      for (let i = 2; i <= 6; i++) {
        allWords[i] = await fetchWords(i);
      }
      setLoadedWordLists(allWords);
      setIsWordsLoaded(true);
    };
    loadAllWords();
  }, []);

  const getNewRandomWord = useCallback((length: number): string => {
    const wordsForLength = loadedWordLists[length];
    if (wordsForLength && wordsForLength.length > 0) {
      return wordsForLength[Math.floor(Math.random() * wordsForLength.length)];
    }
    console.warn(`No words loaded for length ${length}. Using default fallback.`);
    if (length === 2) return "HI";
    if (length === 3) return "TEE";
    if (length === 4) return "FOUR";
    if (length === 5) return "HELLO";
    if (length === 6) return "SIXERS";
    return "WORD";
  }, [loadedWordLists]);

  const fetchWordDefinition = useCallback(async (word: string): Promise<string | null> => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
        for (const meaning of data[0].meanings) {
          if (meaning.definitions && meaning.definitions.length > 0 && meaning.definitions[0].definition) {
            return meaning.definitions[0].definition;
          }
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching definition for "${word}":`, error);
      return null;
    }
  }, []);

  const findWordWithDefinition = useCallback(async (length: number) => {
    setIsDefinitionLoading(true);
    let foundDefinition = null;
    let selectedWord = "";
    const maxRetries = 20;
    let retries = 0;

    while (foundDefinition === null && retries < maxRetries) {
      const newWord = getNewRandomWord(length);
      selectedWord = newWord;
      foundDefinition = await fetchWordDefinition(newWord);
      retries++;
    }

    if (foundDefinition) {
      setWord(selectedWord);
      setWordDefinition(foundDefinition);
    } else {
      console.error(`Could not find a word with a definition after ${maxRetries} retries. Using "${selectedWord || getNewRandomWord(length)}" without definition.`);
      setWord(selectedWord || getNewRandomWord(length));
      setWordDefinition(null);
    }
    setIsDefinitionLoading(false);
  }, [getNewRandomWord, fetchWordDefinition]);

  useEffect(() => {
    if (!isWordsLoaded) return;

    inputRefs.current = Array(NumofRows).fill(null).map(() => Array(Letters).fill(null));
    setInputValues(Array(NumofRows).fill(null).map(() => Array(Letters).fill('')));
    setAllLetterColors(Array(NumofRows).fill(null).map(() => Array(Letters).fill('transparent')));
    setKeyboardKeyColors({});
    setCurrentRow(0);
    setCurrentCol(0);
    setGameWon(false);
    setGameLost(false);
    setScreenColor('');
    setWordDefinition(null);
    setShowDefinitionCard(false); // Reset definition card visibility
    findWordWithDefinition(Letters);
  }, [NumofRows, Letters, isWordsLoaded, findWordWithDefinition]);

  const decreaseLetters = () => {
    if (gameWon || gameLost) return;
    if (Letters - 1 < 2) {
      setScreenColor('red');
      setTimeout(() => setScreenColor(''), 500);
    } else {
      setLettersLength(Letters - 1);
    }
  };

  const increaseLetters = () => {
    if (gameWon || gameLost) return;
    if (Letters + 1 > 6) {
      setScreenColor('red');
      setTimeout(() => setScreenColor(''), 500);
    } else {
      setLettersLength(Letters + 1);
    }
  };

  const decreaseRows = () => {
    if (gameWon || gameLost) return;
    if (NumofRows - 1 < 2) {
      setScreenColor('red');
      setTimeout(() => setScreenColor(''), 500);
    } else {
      setNumofRows(NumofRows - 1);
    }
  };

  const increaseRows = () => {
    if (gameWon || gameLost) return;
    if (NumofRows + 1 > 8) {
      setScreenColor('red');
      setTimeout(() => setScreenColor(''), 500);
    } else {
      setNumofRows(NumofRows + 1);
    }
  };

  const focusInput = useCallback((row: number, col: number) => {
    if (inputRefs.current[row] && inputRefs.current[row][col]) {
      inputRefs.current[row][col]?.focus();
    }
  }, []);

  const updateInputValue = (row: number, col: number, value: string) => {
    setInputValues(prev => {
      const newValues = prev.map(rowArray => [...rowArray]);
      if (newValues[row]) {
        newValues[row][col] = value;
      }
      return newValues;
    });
  };

  const handleLetterClick = useCallback((row: number, col: number) => {
    if (row === currentRow && !gameWon && !gameLost) {
      setCurrentCol(col);
      focusInput(row, col);
    }
  }, [currentRow, gameWon, gameLost, focusInput]);

  const checkWord = useCallback(() => {
    const currentRowWord = inputValues[currentRow].join('');
    const targetWord = Word.toUpperCase();
    const newRowColors = Array(Letters).fill('grey');
    const newKeyboardKeyColors = { ...keyboardKeyColors };

    if (currentRowWord.length !== Letters) {
      setScreenColor('red');
      setTimeout(() => setScreenColor(''), 500);
      return;
    }

    const targetWordLetters = targetWord.split('');
    const currentRowLetters = currentRowWord.split('');

    for (let i = 0; i < Letters; i++) {
      if (currentRowLetters[i] === targetWordLetters[i]) {
        newRowColors[i] = 'green';
        newKeyboardKeyColors[currentRowLetters[i]] = 'green';
        targetWordLetters[i] = '';
        currentRowLetters[i] = '';
      }
    }

    for (let i = 0; i < Letters; i++) {
      if (currentRowLetters[i] !== '') {
        const targetIndex = targetWordLetters.indexOf(currentRowLetters[i]);
        if (targetIndex !== -1) {
          newRowColors[i] = 'orange';
          if (newKeyboardKeyColors[currentRowLetters[i]] !== 'green') {
            newKeyboardKeyColors[currentRowLetters[i]] = 'orange';
          }
          targetWordLetters[targetIndex] = '';
        } else {
          if (newKeyboardKeyColors[currentRowLetters[i]] !== 'green' && newKeyboardKeyColors[currentRowLetters[i]] !== 'orange') {
            newKeyboardKeyColors[currentRowLetters[i]] = 'grey';
          }
        }
      }
    }

    for (let i = 0; i < Letters; i++) {
        const letter = currentRowWord[i];
        if (newKeyboardKeyColors[letter] === undefined) {
             newKeyboardKeyColors[letter] = 'grey';
        }
    }

    setAllLetterColors(prev => {
      const newColors = prev.map(rowArray => [...rowArray]);
      newColors[currentRow] = newRowColors;
      return newColors;
    });
    setKeyboardKeyColors(newKeyboardKeyColors);

    if (currentRowWord === targetWord) {
      setScreenColor('green');
      setGameWon(true);
      setShowDefinitionCard(true); // Show definition card on win
      setTimeout(() => setScreenColor(''), 500);
    } else {
      if (currentRow < NumofRows - 1) {
        setCurrentRow(currentRow + 1);
        setCurrentCol(0);
        setTimeout(() => focusInput(currentRow + 1, 0), 100);
      }
      else {
        setGameLost(true);
        setScreenColor('red');
        setShowDefinitionCard(true); // Show definition card on lose
        setTimeout(() => setScreenColor(''), 500);
      }
    }
  }, [Letters, NumofRows, Word, currentRow, inputValues, keyboardKeyColors, focusInput]);

  const handleInputLogic = useCallback((key: string) => {
    if (gameWon || gameLost || isDefinitionLoading) return;
    let activeRow = currentRow;
    let activeCol = currentCol;

    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.tagName === 'INPUT') {
      const id = focusedElement.id;
      const match = id.match(/r(\d+)c(\d+)/);
      if (match) {
        activeRow = parseInt(match[1]);
        activeCol = parseInt(match[2]);
      }
    }

    if (activeRow !== currentRow) {
      focusInput(currentRow, currentCol);
      return;
    }

    if (key.length === 1 && /[A-Za-z]/.test(key)) {
      if (activeCol < Letters) {
        updateInputValue(activeRow, activeCol, key.toUpperCase());
        const nextCol = activeCol + 1;
        if (nextCol < Letters) {
          setCurrentCol(nextCol);
          focusInput(activeRow, nextCol);
        } else {
          setCurrentCol(activeCol);
          focusInput(activeRow, activeCol);
        }
      }
    } else if (key === 'BACKSPACE' || key === 'DEL') {
      let targetColToClear = activeCol;

      if (inputValues[activeRow][activeCol] === '' && activeCol > 0) {
        targetColToClear = activeCol - 1;
      }
      else if (activeCol === 0 && inputValues[activeRow][activeCol] === '') {
        return;
      }

      if (inputValues[activeRow][targetColToClear] !== '') {
        updateInputValue(activeRow, targetColToClear, '');
        setCurrentCol(targetColToClear);
        focusInput(activeRow, targetColToClear);
      } else if (targetColToClear > 0) {
          const prevCol = targetColToClear - 1;
          updateInputValue(activeRow, prevCol, '');
          setCurrentCol(prevCol);
          focusInput(activeRow, prevCol);
      }

    } else if (key === 'ENTER') {
      const enteredWord = inputValues[currentRow].join('');
      const wordsForCurrentLength = loadedWordLists[Letters];
      if (wordsForCurrentLength && wordsForCurrentLength.includes(enteredWord)) {
        checkWord();
      } else {
        setScreenColor('red');
        setTimeout(() => setScreenColor(''), 500);
      }
    }
  }, [currentRow, currentCol, Letters, inputValues, gameWon, gameLost, isDefinitionLoading, loadedWordLists, focusInput, checkWord]);

  const handlePhysicalKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameWon || gameLost || isDefinitionLoading) return;
    if (isMobile) return;

    if (event.key === 'Backspace' || event.key === 'Enter' || (event.key.length === 1 && /[A-Za-z]/.test(event.key))) {
      event.preventDefault();
      handleInputLogic(event.key.toUpperCase());
    }
  }, [gameWon, gameLost, isDefinitionLoading, isMobile, handleInputLogic]);


  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKeyDown);
    return () => {
      window.removeEventListener('keydown', handlePhysicalKeyDown);
    };
  }, [handlePhysicalKeyDown]);

  const resetGame = useCallback(() => {
    inputRefs.current = Array(NumofRows).fill(null).map(() => Array(Letters).fill(null));
    setInputValues(Array(NumofRows).fill(null).map(() => Array(Letters).fill('')));
    setAllLetterColors(Array(NumofRows).fill(null).map(() => Array(Letters).fill('transparent')));
    setKeyboardKeyColors({});
    setCurrentRow(0);
    setCurrentCol(0);
    setGameWon(false);
    setGameLost(false);
    setScreenColor('');
    setWordDefinition(null);
    setShowDefinitionCard(false); // Reset definition card visibility
    findWordWithDefinition(Letters);
    setTimeout(() => focusInput(0, 0), 0);
  }, [NumofRows, Letters, focusInput, findWordWithDefinition]);

  useEffect(() => {
    if (isWordsLoaded && !gameWon && !gameLost) {
      focusInput(currentRow, currentCol);
    }
  }, [Letters, NumofRows, currentRow, currentCol, isWordsLoaded, gameWon, gameLost, focusInput]);

  const handleLogoClick = () => {
    setShowWord(prev => !prev);
  };

  const logoSection = (
    <Box
      onClick={handleLogoClick}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: isMobile ? '80px' : '120px',
        mb: isMobile ? 1 : 2,
        mt: isMobile ? 1 : 0,
      }}
    >
      {showWord ? (
        <Typography variant={isMobile ? "h4" : "h1"} component="h2" align="center">
          {Word}
        </Typography>
      ) : (
        <img
          src="/WORDLE Logo.png"
          alt="WORDLE Logo"
          style={{
            maxHeight: isMobile ? '175px' : '350px',
            width: 'auto'
          }}
        />
      )}
    </Box>
  );

  const textFieldsSection = (
    <Stack
      direction="column"
      sx={{
        width: 'auto',
        maxWidth: '100%',
        flexShrink: 0,
        alignItems: 'center',
      }}
      spacing={1}
    >
      <Rows
        letters={Letters}
        rows={NumofRows}
        inputRefs={inputRefs}
        inputValues={inputValues}
        currentRow={currentRow}
        onInput={() => {}}
        onKeyDown={() => {}}
        disabled={gameWon || gameLost || !isWordsLoaded || isDefinitionLoading}
        allLetterColors={allLetterColors}
        onLetterClick={handleLetterClick}
        isMobile={isMobile}
      />

      {(gameWon || gameLost) && (
        <MuiCard sx={{ mt: 2, p: 2, width: '40ch', textAlign: 'center' }}> {/* Changed width to '40ch' */}
          <MuiCardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            {gameWon && (
              <Typography variant="h5" component="h3" align="center" sx={{ mb: 1, color: 'green' }}>
                You won! Congratulations!
              </Typography>
            )}
            {gameLost && (
                <Typography variant="h5" component="h3" align="center" sx={{ mb: 1, color: 'red' }}>
                    You lost!
                </Typography>
            )}
            <Typography variant="h6" component="h4" sx={{ mb: 1 }}>
              The word was: {Word}
            </Typography>
            {isDefinitionLoading && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loading definition...
              </Typography>
            )}
            {wordDefinition && !isDefinitionLoading && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {wordDefinition}
              </Typography>
            )}
            {!wordDefinition && !isDefinitionLoading && Word && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No definition found.
              </Typography>
            )}
          </MuiCardContent>
        </MuiCard>
      )}
    </Stack>
  );

  const keyboardSection = (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mt: isMobile ? 2 : 4,
        mb: isMobile ? 2 : 0,
        px: isMobile ? 0 : 2,
      }}
    >
      <Keyboard
        onKeyPress={handleInputLogic}
        keyColors={keyboardKeyColors}
        disabled={gameWon || gameLost || !isWordsLoaded || isDefinitionLoading}
      />
    </Box>
  );

  const controlsSection = (
    <Card size="sm" sx={{
      width: isMobile ? '90%' : '100%',
      maxWidth: 500,
      margin: 'auto',
      padding: isMobile ? '5px' : '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Cardcontent orientation="horizontal" sx={{ flexDirection: 'row', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button variant="contained" onClick={decreaseLetters} disabled={gameWon || gameLost || isDefinitionLoading}>Decrease Letters</Button>
        <h6 style={{ textAlign: 'center'}}>{Letters}</h6>
        <Button variant="contained" onClick={increaseLetters} disabled={gameWon || gameLost || isDefinitionLoading}>Increase Letters</Button>
      </Cardcontent>
      <Cardcontent orientation="horizontal" sx={{ flexDirection: 'row', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button variant="contained" onClick={decreaseRows} disabled={gameWon || gameLost || isDefinitionLoading}>Decrease Rows</Button>
        <h6 style={{ textAlign: 'center' }}>{NumofRows}</h6>
        <Button variant="contained" onClick={increaseRows} disabled={gameWon || gameLost || isDefinitionLoading}>Increase Rows</Button>
      </Cardcontent>
    </Card>
  );

  const resetButton = (
    <Button
      variant="contained"
      color="primary"
      onClick={resetGame}
      sx={{ mt: isMobile ? 1 : 2, width: isMobile ? 'auto' : 'auto' }}
      disabled={!isWordsLoaded || isDefinitionLoading}
    >
      Reset Game
    </Button>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        overflowY: 'auto',
        backgroundColor: screenColor,
        transition: 'background-color 0.5s ease',
        paddingY: isMobile ? '0px' : '20px',
        gap: isMobile ? 0 : 4,
      }}
    >
      {isMobile ? (
        <>
          {logoSection}
          {textFieldsSection}
          {keyboardSection}
          {controlsSection}
          {resetButton}
        </>
      ) : (
        <>
          <Stack
            direction="column"
            sx={{ width: 'auto', maxWidth: '43ch', flexShrink: 0, alignItems: 'center' }}
            spacing={1}
          >
            {textFieldsSection}
          </Stack>

          <Stack
            direction="column"
            sx={{ flexShrink: 0, alignItems: 'center', width: 'auto', maxWidth: '100%' }}
            spacing={2}
          >
            {logoSection}
            {controlsSection}
            {resetButton}
            {keyboardSection}
          </Stack>
        </>
      )}
    </Box>
  );
}