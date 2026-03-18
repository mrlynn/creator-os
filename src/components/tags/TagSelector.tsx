'use client';

import { useEffect, useState } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';

interface TagOption {
  id: string;
  label: string;
  category: string;
}

interface TagSelectorProps {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export function TagSelector({ value, onChange, label = 'Tags' }: TagSelectorProps) {
  const [options, setOptions] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const { data } = await response.json();
          setOptions(
            (data || []).map((t: { _id: string; name: string; category: string }) => ({
              id: t._id,
              label: t.name,
              category: t.category,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const selectedOptions = options.filter((opt) => value.includes(opt.id));

  return (
    <Autocomplete
      multiple
      options={options}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
      value={selectedOptions}
      onChange={(_, newValue) => {
        onChange(newValue.map((opt) => opt.id));
      }}
      loading={loading}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Select tags" />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={option.label}
            size="small"
          />
        ))
      }
    />
  );
}
