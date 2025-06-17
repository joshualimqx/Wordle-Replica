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
  letterColor: string; // New prop for background color
  onClick: (row: number, col: number) => void; // New prop for click handler
}

export default function Letter({ rowIndex, colIndex, inputRefs, value, disabled, onInput, onKeyDown, letterColor, onClick }: Props) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onInput(rowIndex, colIndex, newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow default behavior for navigation keys
    // Prevent non-alphabetic characters except backspace, enter, and delete
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
        style: { textAlign: 'center', backgroundColor: letterColor, transition: 'background-color 0.5s ease' }, // Apply background color
        maxLength: 1
      }}
      hiddenLabel
      id={`r${rowIndex}c${colIndex}`}
      value={value}
      variant="filled"
      size="medium"
      disabled={disabled}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick} // Add onClick handler here
    />
  );
}