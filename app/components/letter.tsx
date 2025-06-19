import React from "react";
import TextField from '@mui/material/TextField';

interface Props {
  rowIndex: number;
  colIndex: number;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[][]>;
  value: string;
  disabled: boolean;
  onInput: (row: number, col: number, value: string) => void;
  onKeyDown: (row: number, col: number, key: string) => void;
  letterColor: string;
  onClick: (row: number, col: number) => void;
  isMobile: boolean; // New prop to indicate mobile
}

export default function Letter({ rowIndex, colIndex, inputRefs, value, disabled, onInput, onKeyDown, letterColor, onClick, isMobile }: Props) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onInput(rowIndex, colIndex, newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 && !/[A-Za-z]/.test(e.key)) {
      e.preventDefault();
      return;
    }
    
    onKeyDown(rowIndex, colIndex, e.key);
  };

  const handleClick = () => {
    onClick(rowIndex, colIndex);
  };

  return (
    <TextField
      inputRef={(el) => {
        if (inputRefs.current[rowIndex]) {
          inputRefs.current[rowIndex][colIndex] = el;
        }
      }}
      inputProps={{
        style: { textAlign: 'center', backgroundColor: letterColor, transition: 'background-color 0.5s ease' },
        maxLength: 1,
        readOnly: isMobile // Prevent native keyboard on mobile
      }}
      hiddenLabel
      id={`r${rowIndex}c${colIndex}`}
      value={value}
      variant="filled"
      size="medium"
      disabled={disabled}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    />
  );
}