'use client';

import { useState } from 'react';
import { Box, Typography, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface ScriptVersion {
  version: number;
  content: string;
  createdAt: Date | string;
}

interface ScriptVersionDiffProps {
  versions: ScriptVersion[];
}

const SECTION_KEYS = ['hook', 'problem', 'solution', 'demo', 'cta', 'outro'] as const;

function contentToDisplayText(content: string): string {
  try {
    const parsed = JSON.parse(content) as Record<string, string>;
    let result = '';
    for (const key of SECTION_KEYS) {
      const value = parsed[key];
      if (value != null && value !== '') {
        result += `## ${key.charAt(0).toUpperCase() + key.slice(1)}\n${value}\n\n`;
      }
    }
    return result || content;
  } catch {
    return content;
  }
}

export function ScriptVersionDiff({ versions }: ScriptVersionDiffProps) {
  const [leftVersion, setLeftVersion] = useState<number | ''>('');
  const [rightVersion, setRightVersion] = useState<number | ''>('');

  const sortedVersions = [...versions].sort(
    (a, b) => (b.version || 0) - (a.version || 0)
  );

  if (!versions || versions.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary">
          No version history yet. Save the script to create versions.
        </Typography>
      </Box>
    );
  }

  if (versions.length === 1) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary" sx={{ mb: 2 }}>
          Only one version. Save again to compare.
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          {contentToDisplayText(versions[0].content)}
        </Box>
      </Box>
    );
  }

  const leftVer = sortedVersions.find((v) => v.version === leftVersion);
  const rightVer = sortedVersions.find((v) => v.version === rightVersion);

  const showDiff = leftVer && rightVer && leftVersion !== rightVersion;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Compare two versions
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Older version</InputLabel>
          <Select
            value={leftVersion}
            onChange={(e) => setLeftVersion(e.target.value as number | '')}
            label="Older version"
          >
            <MenuItem value="">Select</MenuItem>
            {sortedVersions.map((v) => (
              <MenuItem key={v.version} value={v.version}>
                v{v.version} — {new Date(v.createdAt).toLocaleDateString()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Newer version</InputLabel>
          <Select
            value={rightVersion}
            onChange={(e) => setRightVersion(e.target.value as number | '')}
            label="Newer version"
          >
            <MenuItem value="">Select</MenuItem>
            {sortedVersions.map((v) => (
              <MenuItem key={v.version} value={v.version}>
                v{v.version} — {new Date(v.createdAt).toLocaleDateString()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {showDiff && leftVer && rightVer && (
        <Box sx={{ '& .diff-viewer': { fontSize: '0.8rem' } }}>
          <ReactDiffViewer
            oldValue={contentToDisplayText(leftVer.content)}
            newValue={contentToDisplayText(rightVer.content)}
            splitView={true}
            showDiffOnly={false}
            leftTitle={`v${leftVer.version} (${new Date(leftVer.createdAt).toLocaleString()})`}
            rightTitle={`v${rightVer.version} (${new Date(rightVer.createdAt).toLocaleString()})`}
          />
        </Box>
      )}

      {!showDiff && (leftVersion !== '' || rightVersion !== '') && (
        <Typography color="textSecondary">
          Select two different versions to compare.
        </Typography>
      )}
    </Box>
  );
}
