import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import { ArrowLeft, ArrowRight, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  add,
  differenceInMilliseconds,
} from 'date-fns';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

export default function EventCalendar({ events, onAdd, onUpdate, onDelete, onAddEventClick, isAllView }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState(new Date());
  const [addTitle, setAddTitle] = useState('');
  const [dragged, setDragged] = useState(null);
  const [context, setContext] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const handleAdd = () => {
    if (!addTitle) return;
    onAdd({
      title: addTitle,
      start_datetime: addDate,
      end_datetime: add(addDate, { hours: 1 }),
    });
    setAddTitle('');
    setAddOpen(false);
  };

  const handleEdit = () => {
    if (!editTitle || !editEvent) return;
    const duration = differenceInMilliseconds(
      new Date(editEvent.end_datetime),
      new Date(editEvent.start_datetime)
    );
    const start = new Date(editDate);
    const end = add(start, { milliseconds: duration });
    onUpdate(editEvent.id, {
      title: editTitle,
      start_datetime: start,
      end_datetime: end,
    });
    setEditOpen(false);
    setEditEvent(null);
  };

  const openEditDialog = (event) => {
    setEditEvent(event);
    setEditTitle(event.title);
    setEditDate(new Date(event.start_datetime));
    setEditOpen(true);
  };

  const handleContextMenuDate = (e, date) => {
    e.preventDefault();
    setContext({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      type: 'date',
      date,
    });
  };

  const handleContextMenuEvent = (e, event) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from propagating to parent day cell
    setContext({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      type: 'event',
      event,
    });
  };

  const handleCloseContext = () => {
    setContext(null);
  };

  const onDragStart = (evt, event) => {
    evt.dataTransfer.setData('text/plain', event.id);
    setDragged(event);
  };

  const onDropDate = (date) => {
    if (!dragged) return;
    const duration = differenceInMilliseconds(
      new Date(dragged.end_datetime),
      new Date(dragged.start_datetime)
    );
    const start = new Date(date);
    const end = add(start, { milliseconds: duration });
    onUpdate(dragged.id, {
      title: dragged.title,
      start_datetime: start,
      end_datetime: end,
    });
    setDragged(null);
  };

  const renderCells = () => {
    const rows = [];
    let day = startDate;

    while (day <= endDate) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        days.push(
          <Box
            key={cloneDay}
            onContextMenu={(e) => handleContextMenuDate(e, cloneDay)}
            onDoubleClick={() => {
              setAddDate(cloneDay);
              setAddOpen(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropDate(cloneDay)}
            sx={{
              border: '1px solid #e0e0e0',
              height: 100,
              p: 0.5,
              bgcolor: isSameMonth(cloneDay, monthStart) ? 'background.paper' : '#f5f5f5',
            }}
          >
            <Typography variant="caption">{format(cloneDay, 'd')}</Typography>
            {events
              .filter((e) => isSameDay(new Date(e.start_datetime), cloneDay))
              .map((e) => (
                <Box
                  key={e.id}
                  draggable
                  onDragStart={(evt) => onDragStart(evt, e)}
                  onContextMenu={(evt) => handleContextMenuEvent(evt, e)}
                  sx={{
                    bgcolor: isAllView 
                      ? (e.calendarColor || 'primary.main') // In All view, use calendar color
                      : (e.color || 'primary.main'), // In specific calendar view, use event color if set
                    color: 'white',
                    p: 0.5,
                    mt: 0.5,
                    borderRadius: 1,
                    cursor: 'move',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {e.title}
                    </Typography>
                    {isAllView && e.calendarName && (
                      <Typography
                        variant="caption"
                        sx={{ 
                          display: 'block', 
                          fontSize: '0.65rem',
                          opacity: 0.9,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {e.calendarName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
          </Box>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <Box
          key={day}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))',
          }}
        >
          {days}
        </Box>
      );
    }

    return <Box>{rows}</Box>;
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h6">{format(currentMonth, 'MMMM yyyy')}</Typography>
        <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ArrowRight />
        </IconButton>
      </Box>

      {renderCells()}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Flatpickr
            options={{ enableTime: true }}
            value={addDate}
            onChange={(dates) => setAddDate(dates[0])}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" sx={{ mb: 1 }}>
            Start Date & Time
          </Typography>
          <Flatpickr
            options={{ enableTime: true }}
            value={editDate}
            onChange={(dates) => setEditDate(dates[0])}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} disabled={!editTitle}>Save</Button>
        </DialogActions>
      </Dialog>

      <Menu
        open={Boolean(context)}
        onClose={handleCloseContext}
        anchorReference="anchorPosition"
        anchorPosition={context ? { top: context.mouseY, left: context.mouseX } : undefined}
      >
        {context?.type === 'date' && (
          <MenuItem
            onClick={() => {
              if (onAddEventClick) {
                // Use the parent component's handler
                onAddEventClick(context.date);
              } else {
                // Fall back to the original behavior
                setAddDate(context.date);
                setAddOpen(true);
              }
              handleCloseContext();
            }}
          >
            Add Event
          </MenuItem>
        )}
        {context?.type === 'event' && (
          <>
            <MenuItem
              onClick={() => {
                openEditDialog(context.event);
                handleCloseContext();
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit Event
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(context.event.id);
                handleCloseContext();
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Event
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}
