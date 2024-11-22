import { useMemo } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import EventCalendar from "examples/Calendar";
import Header from "layouts/applications/calendar/components/Header";
import calendarEventsData from "layouts/applications/calendar/data/calendarEventsData";

function Calendar() {
  return (
    <MDBox pt={3}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2} mx={2}>
        <Header />
      </MDBox>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ height: "max-content" }}>
          {useMemo(
            () => (
              <EventCalendar
                initialView="dayGridMonth"
                initialDate="2024-08-10"
                events={calendarEventsData}
                selectable
                editable
              />
            ),
            [calendarEventsData]
          )}
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default Calendar;
