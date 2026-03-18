'use client';

import { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface InstructionProfile {
  _id: string;
  name: string;
  isDefault?: boolean;
}

interface InstructionProfileSelectorProps {
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  size?: 'small' | 'medium';
}

export function InstructionProfileSelector({
  value,
  onChange,
  label = 'Instruction Profile',
  size = 'medium',
}: InstructionProfileSelectorProps) {
  const [profiles, setProfiles] = useState<InstructionProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/instruction-profiles');
        if (res.ok) {
          const { data } = await res.json();
          setProfiles(data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const v = event.target.value;
    onChange(v === '' ? null : v);
  };

  return (
    <FormControl fullWidth size={size}>
      <InputLabel id="instruction-profile-select-label">{label}</InputLabel>
      <Select
        labelId="instruction-profile-select-label"
        value={value ?? ''}
        label={label}
        onChange={handleChange}
        disabled={loading}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {profiles.map((p) => (
          <MenuItem key={p._id} value={p._id}>
            {p.name}
            {p.isDefault && ' (default)'}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
