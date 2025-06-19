import React from 'react';
import Letter from './letter';
import Stack from '@mui/material/Stack';

interface props {
  letters: number;
  rowIndex: number;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[][]>;
  inputValues: string[];
  isCurrentRow: boolean;
  onInput: (row: number, col: number, value: string) => void;
  onKeyDown: (row: number, col: number, key: string) => void;
  disabled: boolean;
  letterColors: string[];
  onLetterClick: (row: number, col: number) => void;
  isMobile: boolean; // New prop
}

export default function Row({ letters, rowIndex, inputRefs, inputValues, isCurrentRow, onInput, onKeyDown, disabled, letterColors, onLetterClick, isMobile }: props) {
  function DynamicLetters() {
    return (
      <>
        {Array.from({ length: letters }, (_, i) => (
          <Letter
            key={i}
            rowIndex={rowIndex}
            colIndex={i}
            inputRefs={inputRefs}
            value={inputValues[i] || ''}
            disabled={disabled || !isCurrentRow}
            onInput={onInput}
            onKeyDown={onKeyDown}
            letterColor={letterColors[i] || 'transparent'}
            onClick={onLetterClick}
            isMobile={isMobile} // Pass to Letter
          />
        ))}
      </>
    );
  }

  return (
    <Stack
      direction="row"
      component="form"
      sx={{
        width: 'auto', // Removed fixed width from here too
        justifyContent: 'center', // Center the letters within the row
        flexGrow: 1, // Allow rows to grow and fill space if needed
      }}
      spacing={1}
      noValidate
      autoComplete="off"
    >
      <DynamicLetters />
    </Stack>
  );
}