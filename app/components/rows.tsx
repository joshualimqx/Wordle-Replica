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
  allLetterColors: string[][];
  onLetterClick: (row: number, col: number) => void;
  isMobile: boolean; // New prop
}

export default function Rows({ letters, rows, inputRefs, inputValues, currentRow, onInput, onKeyDown, disabled, allLetterColors, onLetterClick, isMobile }: props) {
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
            letterColors={allLetterColors[i] || []}
            onLetterClick={onLetterClick}
            isMobile={isMobile} // Pass to Row
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