// components/Keyboard.tsx
import React from 'react';
import { Button, Stack, Box } from '@mui/material';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyColors: { [key: string]: string }; // Map of letter to its color (e.g., {'A': 'green', 'B': 'grey'})
  disabled?: boolean;
}

const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, keyColors, disabled }) => {
  const handleButtonClick = (key: string) => {
    if (disabled) return;
    onKeyPress(key);
  };

  const getButtonColor = (key: string) => {
    // Return the color from keyColors if available, otherwise default to a light grey/white
    return keyColors[key] || '#d3d6da'; // Default color for unused keys
  };

  const getTextColor = (key: string) => {
    // Text color should be white for colored keys, black for default grey/white keys
    const color = getButtonColor(key);
    if (color === 'green' || color === 'orange' || color === 'grey') {
      return 'white';
    }
    return 'black';
  };

  return (
    <Box sx={{ userSelect: 'none', padding: '10px' }}>
      <Stack spacing={0.5}>
        {keyboardLayout.map((row, rowIndex) => (
          <Stack key={rowIndex} direction="row" spacing={0.5} justifyContent="center">
            {row.map((key) => (
              <Button
                key={key}
                variant="contained"
                onClick={() => handleButtonClick(key)}
                disabled={disabled}
                sx={{
                  minWidth: key.length > 1 ? '60px' : '38px', // Wider for ENTER/BACKSPACE
                  height: '50px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  textTransform: 'uppercase',
                  backgroundColor: getButtonColor(key),
                  color: getTextColor(key),
                  '&:hover': {
                    backgroundColor: getButtonColor(key), // Keep same color on hover
                    opacity: disabled ? 0.6 : 0.8, // Dim more if disabled on hover
                  },
                  '&:active': {
                    backgroundColor: getButtonColor(key),
                    opacity: disabled ? 0.6 : 1, // Full opacity on active for non-disabled
                  },
                  // Ensure disabled state looks correct
                  '&.Mui-disabled': {
                    backgroundColor: getButtonColor(key),
                    color: getTextColor(key),
                    opacity: 0.6,
                  },
                }}
              >
                {key === 'BACKSPACE' ? 'DEL' : key} {/* Display 'DEL' for Backspace */}
              </Button>
            ))}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default Keyboard;