'use client';

import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'small' | 'medium';
  sx?: object;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search...',
  size = 'medium',
  sx = {},
}: SearchFieldProps) {
  return (
    <TextField
      size={size}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
      }}
      sx={{ minWidth: 200, ...sx }}
    />
  );
}
