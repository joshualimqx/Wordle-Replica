// app/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Rows from './components/rows';
import Typography from '@mui/material/Typography';
import Card from '@mui/joy/Card';
import Cardcontent from '@mui/joy/CardContent';
import Keyboard from './components/keyboard'; // Import the Keyboard component

export default function Home() {
  const [Letters, setLettersLength] = useState(5);
  const [loadedWordLists, setLoadedWordLists] = useState<{ [key: number]: string[] }>({});
  const [isWordsLoaded, setIsWordsLoaded] = useState(false);

  const [Word, setWord] = useState<string>(""); 

  const [NumofRows, setNumofRows] = useState(6);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0); // This now tracks the focused column
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [screenColor, setScreenColor] = useState('');
  
  const [inputValues, setInputValues] = useState<string[][]>([]);
  const [allLetterColors, setAllLetterColors] = useState<string[][]>([]);
  const [keyboardKeyColors, setKeyboardKeyColors] = useState<{ [key: string]: string }>({});

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // NEW STATE FOR LOGO/WORD TOGGLE
  const [showWord, setShowWord] = useState(false);

  // Function to fetch words from a file
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

  // Effect to load words when component mounts
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

  // Helper function to get a new random word based on letters length from loaded words
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

  // Initialize game state when grid size changes or words are loaded
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
    setWord(getNewRandomWord(Letters));
  }, [NumofRows, Letters, isWordsLoaded, getNewRandomWord]);

  const decreaseLetters = () => {
    if (gameWon || gameLost) return;
    if (Letters - 1 < 2) {
      alert("You cannot have less than 2 letters.");
    } else {
      setLettersLength(Letters - 1);
    }
  };

  const increaseLetters = () => {
    if (gameWon || gameLost) return;
    if (Letters + 1 > 6) {
      alert("You cannot have more than 6 letters.");
    } else {
      setLettersLength(Letters + 1);
    }
  };

  const decreaseRows = () => {
    if (gameWon || gameLost) return;
    if (NumofRows - 1 < 2) {
      alert("You cannot have less than 2 rows.");
    } else {
      setNumofRows(NumofRows - 1);
    }
  };

  const increaseRows = () => {
    if (gameWon || gameLost) return;
    if (NumofRows + 1 > 8) {
      alert("You cannot have more than 8 rows.");
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
    
    // First pass: Mark green letters (correct position)
    for (let i = 0; i < Letters; i++) {
      if (currentRowLetters[i] === targetWordLetters[i]) {
        newRowColors[i] = 'green';
        newKeyboardKeyColors[currentRowLetters[i]] = 'green';
        targetWordLetters[i] = ''; // Mark as used
        currentRowLetters[i] = ''; // Mark as used
      }
    }

    // Second pass: Mark orange letters (correct letter, wrong position)
    for (let i = 0; i < Letters; i++) {
      if (currentRowLetters[i] !== '') { // If not already green
        const targetIndex = targetWordLetters.indexOf(currentRowLetters[i]);
        if (targetIndex !== -1) {
          newRowColors[i] = 'orange';
          // Only update to orange if not already green on keyboard
          if (newKeyboardKeyColors[currentRowLetters[i]] !== 'green') {
            newKeyboardKeyColors[currentRowLetters[i]] = 'orange';
          }
          targetWordLetters[targetIndex] = ''; // Mark as used
        } else {
          // If letter is not in word at all, mark grey on keyboard
          if (newKeyboardKeyColors[currentRowLetters[i]] !== 'green' && newKeyboardKeyColors[currentRowLetters[i]] !== 'orange') {
            newKeyboardKeyColors[currentRowLetters[i]] = 'grey';
          }
        }
      }
    }
    
    // Update keyboard colors for any remaining grey letters
    for (let i = 0; i < Letters; i++) {
        const letter = currentRowWord[i];
        if (newKeyboardKeyColors[letter] === undefined) { // If not already set by green or orange
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
      setGameWon(true); // Player won
      setTimeout(() => setScreenColor(''), 500);
    } else {
      if (currentRow < NumofRows - 1) {
        setCurrentRow(currentRow + 1);
        setCurrentCol(0); // Reset currentCol for the new row
        setTimeout(() => focusInput(currentRow + 1, 0), 100); // Autofocus on the first input of the new row
      } else {
        // Player did not win and reached the last row, so they lost.
        setGameLost(true);
        setScreenColor('red'); // Optionally flash red for loss
        setTimeout(() => setScreenColor(''), 500);
      }
    }
  }, [Letters, NumofRows, Word, currentRow, inputValues, keyboardKeyColors, focusInput]);

  // Unified handler for both physical and virtual keyboard inputs
  const handleInputLogic = useCallback((key: string) => {
    if (gameWon || gameLost) return; // Prevent input if game is over

    let activeRow = currentRow;
    let activeCol = currentCol;

    // Use the actual focused element to determine current position, if available
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.tagName === 'INPUT') {
      const id = focusedElement.id;
      const match = id.match(/r(\d+)c(\d+)/);
      if (match) {
        activeRow = parseInt(match[1]);
        activeCol = parseInt(match[2]);
      }
    }

    // Ensure operations are only on the current playable row
    if (activeRow !== currentRow) {
      focusInput(currentRow, currentCol); // Re-focus on the intended current input
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
          setCurrentCol(activeCol); // Stay on the last column if at end
          focusInput(activeRow, activeCol); // Re-focus the last column
        }
      }
    } else if (key === 'BACKSPACE' || key === 'DEL') {
      let targetColToClear = activeCol;

      // If the current field is empty, and we can move back, target the previous field
      if (inputValues[activeRow][activeCol] === '' && activeCol > 0) {
        targetColToClear = activeCol - 1;
      }
      // If at column 0 and it's empty, do nothing
      else if (activeCol === 0 && inputValues[activeRow][activeCol] === '') {
        return;
      }

      // Perform the deletion
      if (inputValues[activeRow][targetColToClear] !== '') {
        updateInputValue(activeRow, targetColToClear, '');
        setCurrentCol(targetColToClear); // Update currentCol to reflect the deletion position
        focusInput(activeRow, targetColToClear);
      } else if (targetColToClear > 0) { // If the target was also empty, but we can move back further
          const prevCol = targetColToClear - 1;
          updateInputValue(activeRow, prevCol, '');
          setCurrentCol(prevCol);
          focusInput(activeRow, prevCol);
      }

    } else if (key === 'ENTER') {
      const enteredWord = inputValues[currentRow].join('');
      // Check if the entered word exists in the loaded word list for the current letter length
      const wordsForCurrentLength = loadedWordLists[Letters];
      if (wordsForCurrentLength && wordsForCurrentLength.includes(enteredWord)) {
        checkWord();
      } else {
        // Provide feedback to the user if the word is not found
        setScreenColor('red'); // Flash red for invalid word
        setTimeout(() => setScreenColor(''), 500);
      }
    }
  }, [currentRow, currentCol, Letters, inputValues, gameWon, gameLost, loadedWordLists, focusInput, checkWord]);

  // Handler for physical keyboard events - now wrapped in useCallback
  const handlePhysicalKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameWon || gameLost) return; // Prevent input if game is over

    // Prevent default behavior for physical backspace/enter only if we are handling it
    if (event.key === 'Backspace' || event.key === 'Enter' || (event.key.length === 1 && /[A-Za-z]/.test(event.key))) {
      event.preventDefault(); // Prevent browser's default backspace behavior (e.g., navigating back)
      handleInputLogic(event.key.toUpperCase()); // Ensure key is uppercase for consistency
    }
  }, [gameWon, gameLost, handleInputLogic]);


  // Add event listener for physical keyboard
  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKeyDown);
    return () => {
      window.removeEventListener('keydown', handlePhysicalKeyDown);
    };
  }, [handlePhysicalKeyDown]);


  // Reset logic
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
    setWord(getNewRandomWord(Letters));
    setTimeout(() => focusInput(0, 0), 0); // Autofocus on the first input
  }, [NumofRows, Letters, focusInput, getNewRandomWord]);


  // Initial focus on mount and when grid changes
  useEffect(() => {
    if (isWordsLoaded && !gameWon && !gameLost) {
      focusInput(currentRow, currentCol); // Autofocus based on current state
    }
  }, [Letters, NumofRows, currentRow, currentCol, isWordsLoaded, gameWon, gameLost, focusInput]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        overflowY: 'auto',
        backgroundColor: screenColor,
        transition: 'background-color 0.5s ease',
        paddingY: '20px',
        gap: 4,
      }}
    >
      {/* Left Column - Textfields and Game Status */}
      <Stack
        direction="column"
        component="form"
        sx={{ width: '43ch', flexShrink: 0 }}
        spacing={1}
        noValidate
        autoComplete="off"
      >
        <Rows
          letters={Letters}
          rows={NumofRows}
          inputRefs={inputRefs}
          inputValues={inputValues}
          currentRow={currentRow}
          onInput={() => {}}
          onKeyDown={() => {}}
          disabled={gameWon || gameLost || !isWordsLoaded}
          allLetterColors={allLetterColors}
          onLetterClick={handleLetterClick}
        />

        {gameWon && (
          <Typography variant="h4" component="h3" align="center" sx={{ mt: 2, color: 'green' }}>
            You won! Congratulations!
          </Typography>
        )}
        {gameLost && (
            <Typography variant="h4" component="h3" align="center" sx={{ mt: 2, color: 'red' }}>
                You lost! The word was "{Word}".
            </Typography>
        )}
      </Stack>

      {/* Right Column - Controls and Keyboard */}
      <Stack
        direction="column"
        sx={{ flexShrink: 0, alignItems: 'center' }}
        spacing={2}
      >
        {/* CONDITIONAL RENDERING FOR LOGO/WORD */}
        <Box
          onMouseDown={() => setShowWord(true)}
          onMouseUp={() => setShowWord(false)}
          onMouseLeave={() => setShowWord(false)} // Added to handle mouse leaving while pressed
          sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px'}} // Added height to prevent layout shift
        >
          {showWord ? (
            <Typography variant="h1" component="h2" align="center">
              {Word}
            </Typography>
          ) : (
            <img 
              src="/WORDLE Logo.png" 
              alt="WORDLE Logo" 
              style={{ maxHeight: '350px', width: 'auto' }} // Adjusted size for better fit
            />
          )}
        </Box>

        <Card size="sm" sx={{ width: '100%', maxWidth: 500, margin: 'auto', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Cardcontent orientation="horizontal">
            <Button variant="contained" sx={{ marginBottom: '10px' }} onClick={decreaseLetters} disabled={gameWon || gameLost}>Decrease Letters</Button>
            <h6 style={{ textAlign: 'center'}}>{Letters}</h6>
            <Button variant="contained" sx={{ marginBottom: '10px' }} onClick={increaseLetters} disabled={gameWon || gameLost}>Increase Letters</Button>
          </Cardcontent>
          <Cardcontent orientation="horizontal">
            <Button variant="contained" sx={{ marginBottom: '0px' }} onClick={decreaseRows} disabled={gameWon || gameLost}>Decrease Rows</Button>
            <h6 style={{ textAlign: 'center' }}>{NumofRows}</h6>
            <Button variant="contained" sx={{ marginBottom: '0px' }} onClick={increaseRows} disabled={gameWon || gameLost}>Increase Rows</Button>
          </Cardcontent>
        </Card>

        <Button
          variant="contained"
          color="primary"
          onClick={resetGame}
          sx={{ mt: 2 }}
          disabled={!isWordsLoaded}
        >
          Reset Game
        </Button>
        
        <Keyboard
          onKeyPress={handleInputLogic}
          keyColors={keyboardKeyColors}
          disabled={gameWon || gameLost || !isWordsLoaded}
        />
      </Stack>
    </Box>
  );
}