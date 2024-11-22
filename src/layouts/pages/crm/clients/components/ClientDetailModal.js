import React, {useState} from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Assuming ProfileInfoCard, and other components are adapted for client details
import ProfileInfoCard from "../../../../../examples/Cards/InfoCards/ProfileInfoCard";
import DefaultProjectCard from "../../../../../examples/Cards/ProjectCards/DefaultProjectCard";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import MDButton from "../../../../../components/MDButton";

// Sample data and images imports
// import clientProjects from './data/clientProjects'; // Create appropriate data structure
// import teamImages from '../../../../assets/images'; // Adapt to your actual images import

function TabPanel(props) {
  const { children, value, index, ...other } = props;


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  maxHeight: '90%',
};


const ClientDetailsModal = ({ open, onClose, client }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="client-details-modal"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={onClose} // Use the passed onClose function directly
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="modal-modal-title" variant="h6" component="h2" mb={2}>
          Client Details
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="client details tabs">
            <Tab label="Profile" />
            <Tab label="Projects" />
            {/* Add more tabs as needed */}
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ProfileInfoCard
                title="Client Information"
                description={client?.description || 'No description available'}
                info={{
                  companyName: client?.name || 'N/A',
                  companyDomain: client?.domain || 'N/A',
                  location: client?.location || 'N/A',
                }}
                shadow={false}
                action={{ route: "#", tooltip: "Edit Client" }}
              />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={1}>
          {/* Projects content here. Use the commented-out structure as a guide to display projects */}
        </TabPanel>
        {/* Additional TabPanels for other sections */}
      </Box>
    </Modal>
  );
};

export default ClientDetailsModal;


