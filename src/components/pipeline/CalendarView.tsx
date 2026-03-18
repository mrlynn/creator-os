'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import { Box, CircularProgress } from '@mui/material';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  extendedProps: { episodeId: string; platform: string };
}

export default function CalendarView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(
    async (info: { startStr: string; endStr: string }) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/calendar?start=${encodeURIComponent(info.startStr)}&end=${encodeURIComponent(info.endStr)}`
        );
        if (!res.ok) throw new Error('Failed to fetch calendar');
        const { data } = await res.json();
        return (data || []) as CalendarEvent[];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleEventClick = useCallback(
    (info: { event: { extendedProps?: { episodeId?: string } } }) => {
      const episodeId = info?.event?.extendedProps?.episodeId;
      if (episodeId) {
        router.push(`/app/library/${episodeId}`);
      } else {
        router.push('/app/pipeline');
      }
    },
    [router]
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        events={fetchEvents}
        eventClick={handleEventClick}
        height="auto"
      />
    </Box>
  );
}
