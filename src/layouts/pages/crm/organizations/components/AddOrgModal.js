import React, { useState } from "react";
import PropTypes from "prop-types";

// Material UI components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";

// Material Dashboard 2 PRO components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Context
import { useAuth } from "../../../../../context/AuthContext"; // ✅ Ensure `useAuth` is imported

const AddOrgModal = ({ open, onClose, onSave }) => {
  const { user } = useAuth(); // ✅ Get user from context
  const [orgData, setOrgData] = useState({
    name: "",
    domain: "",
    phone: "",
  });

  const handleChange = (e) => {
    setOrgData({ ...orgData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error("❌ Missing `creator_id`!");
      return;
    }

    // ✅ Ensure `creator_id` is included
    const orgPayload = { ...orgData, creator_id: user.id };

    console.log("📢 Submitting organization data:", orgPayload);
    onSave(orgPayload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Modal Header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2} pb={0}>
        <MDTypography variant="h5" fontWeight="medium">
          Add New Organization
        </MDTypography>
        <Tooltip title="Close">
          <IconButton onClick={onClose} color="inherit">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </MDBox>

      {/* Modal Content */}
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              fullWidth
              label="Organization Name"
              name="name"
              variant="outlined"
              value={orgData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Domain"
              name="domain"
              variant="outlined"
              value={orgData.domain}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              variant="outlined"
              value={orgData.phone}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <MDButton variant="outlined" color="secondary" onClick={onClose}>
          Cancel
        </MDButton>
        <MDButton variant="contained" color="primary" onClick={handleSubmit}>
          Save Organization
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

// ✅ Prop Types Validation
AddOrgModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddOrgModal;
