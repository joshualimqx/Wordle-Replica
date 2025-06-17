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
  letterColors: string[]; // New prop for array of colors for each letter in this row
  onLetterClick: (row: number, col: number) => void; // New prop for handling letter clicks
}

export default function Row({ letters, rowIndex, inputRefs, inputValues, isCurrentRow, onInput, onKeyDown, disabled, letterColors, onLetterClick }: props) {
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
            letterColor={letterColors[i] || 'transparent'} // Pass individual letter color
            onClick={onLetterClick} // Pass the onClick handler
          />
        ))}
      </>
    );
  }

  return (
    <Stack
      direction="row"
      component="form"
      sx={{ width: '40ch' }}
      spacing={1}
      noValidate
      autoComplete="off"
    >
      <DynamicLetters />
    </Stack>
  );
}