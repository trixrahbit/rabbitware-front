import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import enUS from 'date-fns/locale/en-US';
import axios from 'axios';
import MDBox from '../../../components/MDBox';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Button from '@mui/material/Button';
import { useParams } from "react-router-dom";
import AppointmentFormModal from "../calendarbooking/confirmations/AppointmentForm";
import { useAuth } from 'context/AuthContext'; // Assuming you have an auth context

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarBooking = () => {
  const [allTimes, setAllTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableBookingDays, setAvailableBookingDays] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingName, setBookingName] = useState("Meeting");
  const { authToken } = useAuth(); // Use the auth context for the token

  const timesPerPage = 3;
  const { uuid } = useParams();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Validate UUID before making a request
        if (!uuid || typeof uuid !== 'string' || uuid.length !== 36) {
          throw new Error('Invalid booking link.');
        }

        const response = await axios.get(`http://localhost:8000/booking/${uuid}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'X-CSRF-Token': 'your-csrf-token', // Ensure your backend is handling CSRF tokens
          },
          https: true, // Ensure HTTPS is used
        });

        const { available_times } = response.data;

        // Validate the response data
        if (!Array.isArray(available_times) || available_times.length === 0) {
          throw new Error('No available times returned.');
        }

        const uniqueDates = Array.from(
          new Set(available_times.map(time => new Date(time.start).toDateString()))
        ).map(dateStr => new Date(dateStr));

        setAllTimes(available_times);
        setAvailableBookingDays(uniqueDates);
        setSelectedDate(uniqueDates[0]); // Automatically select the first available date
        setCalendarDate(uniqueDates[0]); // Set the calendar date to the first available date
      } catch (err) {
        console.error('Error fetching booking details:', err.message);
        alert('Failed to load booking details. Please try again later.');
        setAllTimes([]);
      }
    };

    fetchBookingDetails();
  }, [uuid, authToken]);

  const handleDateClick = (date) => {
    if (!date || !(date instanceof Date)) return;

    setSelectedDate(date);

    // Reset pagination to the start when a new date is selected
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (currentPage < Math.floor(availableBookingDays.length / timesPerPage)) {
      const nextDate = availableBookingDays[(currentPage + 1) * timesPerPage];
      setCurrentPage(prev => prev + 1);
      setCalendarDate(nextDate);
      setSelectedDate(nextDate);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const prevDate = availableBookingDays[(currentPage - 1) * timesPerPage];
      setCurrentPage(prev => prev - 1);
      setCalendarDate(prevDate);
      setSelectedDate(prevDate);
    }
  };

  const handleTimeClick = (time) => {
    if (!time || typeof time !== 'string' || isNaN(new Date(time).getTime())) {
      console.error('Invalid time selected.');
      return;
    }

    setSelectedTime(time);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleModalSave = (formData) => {
    // Validate form data
    const { name, email } = formData;
    if (!name || !email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      alert('Please provide valid name and email.');
      return;
    }

    // Save the appointment details
    console.log('Form Data:', formData);
    setOpenModal(false);
  };

  const startIdx = currentPage * timesPerPage;
  const endIdx = startIdx + timesPerPage;

  const currentTimes = availableBookingDays.slice(startIdx, endIdx).map(date => {
    return {
      date,
      times: allTimes.filter(time => new Date(time.start).toDateString() === date.toDateString())
    };
  });

  return (
    <MDBox py={3} textAlign="center">
      <Card style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', borderRadius: '12px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox
              py={2}
              display="flex"
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: '#2c3e50', color: 'white', borderRadius: '12px 12px 0 0' }}
            >
              <Typography variant="h4" style={{ color: 'white' }}>
                Select Available Dates
              </Typography>
            </MDBox>
          </Grid>

          {/* Calendar */}
          <Grid item xs={12} md={6}>
            <Calendar
              localizer={localizer}
              selectable
              events={availableBookingDays.map(date => ({
                start: date,
                end: date,
                title: '', // No title to prevent any text from showing
                allDay: true, // Ensure the event spans the entire day
              }))}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              onSelectSlot={({ start }) => handleDateClick(start)}
              views={['month']}
              defaultView="month"
              date={calendarDate}
              onNavigate={(date) => setCalendarDate(date)}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: '#f0f0f0', // Grey background for available days
                  border: 'none', // Remove the border (which might be causing the blue bar)
                  color: 'transparent', // Hide any text
                  height: '100%', // Fill the day cell
                  cursor: 'pointer', // Make the cell clickable
                },
              })}
              dayPropGetter={date => {
                const isAvailable = availableBookingDays.some(d => d.toDateString() === date.toDateString());
                const isSelected = currentTimes[0]?.date.toDateString() === date.toDateString();
                return {
                  style: {
                    backgroundColor: isAvailable ? '#f0f0f0' : undefined, // Grey background for available days
                    border: isSelected ? '2px solid blue' : undefined, // Blue border for the first day in the current times
                    cursor: isAvailable ? 'pointer' : undefined,
                  },
                };
              }}
            />
          </Grid>

          {/* Available Times */}
          <Grid item xs={12} md={6}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <IconButton onClick={handlePreviousPage} disabled={currentPage === 0}>
                <ArrowBackIosIcon />
              </IconButton>

              <Grid container spacing={2}>
                {currentTimes.length > 0 ? (
                  currentTimes.map((day, colIndex) => (
                    <Grid item xs={12} sm={4} key={colIndex}>
                      <Card style={{ padding: '10px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
                        <Typography variant="h6" style={{ fontSize: '1rem' }}>
                          {day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Typography>
                        {day.times.map((time, index) => (
                          <MDBox mt={2} key={index}>
                            <Button
                              variant="contained"
                              color="info"
                              style={{ fontSize: '0.875rem' }}
                              onClick={() => handleTimeClick(time.start)}  // Pass the time slot to the modal
                            >
                              {new Date(time.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Button>
                          </MDBox>
                        ))}
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography>No available times</Typography>
                )}
              </Grid>

              <IconButton onClick={handleNextPage} disabled={endIdx >= availableBookingDays.length}>
                <ArrowForwardIosIcon />
              </IconButton>
            </MDBox>
          </Grid>
        </Grid>
      </Card>

      {/* Appointment Form Modal */}
      <AppointmentFormModal
        open={openModal}
        handleClose={handleModalClose}
        handleSave={handleModalSave}
        selectedTime={selectedTime}
        bookingName={bookingName}  // Pass the name of the booking
      />
    </MDBox>
  );
};

export default CalendarBooking;
