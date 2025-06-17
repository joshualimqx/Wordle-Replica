import React from 'react';
import Row from './row';
import Stack from '@mui/material/Stack';

interface props {
  letters: number;
  rows: number;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[][]>;
  inputValues: string[][];
  currentRow: number;
  onInput: (row: number, col: number, value: string) => void;
  onKeyDown: (row: number, col: number, key: string) => void;
  disabled: boolean;
  allLetterColors: string[][]; // New prop for 2D array of colors for the entire grid
  onLetterClick: (row: number, col: number) => void; // New prop for handling letter clicks
}

export default function Rows({ letters, rows, inputRefs, inputValues, currentRow, onInput, onKeyDown, disabled, allLetterColors, onLetterClick }: props) {
  function DynamicRows() {
    return (
      <>
        {Array.from({ length: rows }, (_, i) => (
          <Row
            letters={letters}
            key={i}
            rowIndex={i}
            inputRefs={inputRefs}
            inputValues={inputValues[i] || []}
            isCurrentRow={i === currentRow}
            onInput={onInput}
            onKeyDown={onKeyDown}
            disabled={disabled}
            letterColors={allLetterColors[i] || []} // Pass the array of colors for this specific row
            onLetterClick={onLetterClick} // Pass the click handler to Row
          />
        ))}
      </>
    );
  }

  return (
    <Stack
      direction="column"
      component="form"
      sx={{ width: '40ch' }}
      spacing={1}
      noValidate
      autoComplete="off"
    >
      <DynamicRows />
    </Stack>
  );
}