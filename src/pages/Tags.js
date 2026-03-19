import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  TextField,
  Breadcrumbs,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

export default function Tags() {
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagType, setTagType] = useState('general');
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/gauge-tags');
      setTags(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tags:', error);
      enqueueSnackbar('Failed to fetch tags', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleMenuClick = (event, tag) => {
    setAnchorEl(event.currentTarget);
    setSelectedTag(tag);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    setTagName('');
    setTagType('general');
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditClick = () => {
    setTagName(selectedTag.name);
    setTagType(selectedTag.tag_type || 'general');
    setIsEditing(true);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleSubmit = async () => {
    if (!tagName.trim()) {
      enqueueSnackbar('Tag name cannot be empty', { variant: 'error' });
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`/api/analytics/gauge-tags/${selectedTag.id}`, {
          name: tagName,
          tag_type: tagType
        });
        enqueueSnackbar('Tag updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/analytics/gauge-tags', {
          name: tagName,
          tag_type: tagType
        });
        enqueueSnackbar('Tag created successfully', { variant: 'success' });
      }
      fetchTags();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving tag:', error);
      enqueueSnackbar('Failed to save tag', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/analytics/gauge-tags/${selectedTag.id}`);
      enqueueSnackbar('Tag deleted successfully', { variant: 'success' });
      fetchTags();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting tag:', error);
      enqueueSnackbar('Failed to delete tag', { variant: 'error' });
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard/settings');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Tags
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Link color="inherit" href="/dashboard/settings">
              Settings
            </Link>
            <Typography color="text.primary">Tags</Typography>
          </Breadcrumbs>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackClick}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchTags}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Create Tag
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Create and manage tags that can be used for monitoring policies and other features.
      </Typography>

      {tags.length === 0 ? (
        <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Tags Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get started by creating your first tag.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Tag
            </Button>
          </CardActions>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tag Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircleIcon sx={{ mr: 1, fontSize: 12, color: 'primary.main' }} />
                      {tag.name}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedTag(tag);
                        setTagName(tag.name);
                        setIsEditing(true);
                        setOpenDialog(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedTag(tag);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      aria-label="tag menu" 
                      onClick={(e) => handleMenuClick(e, tag)}
                      size="small"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tag Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Tag
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Tag
        </MenuItem>
      </Menu>

      {/* Create/Edit Tag Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isEditing ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            type="text"
            fullWidth
            variant="outlined"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="tag-type-label">Tag Type</InputLabel>
            <Select
              labelId="tag-type-label"
              value={tagType}
              label="Tag Type"
              onChange={(e) => setTagType(e.target.value)}
            >
              <MuiMenuItem value="script">Script</MuiMenuItem>
              <MuiMenuItem value="monitoring">Monitoring Policy</MuiMenuItem>
              <MuiMenuItem value="gauge">Gauge</MuiMenuItem>
              <MuiMenuItem value="alert">Alerting</MuiMenuItem>
              <MuiMenuItem value="general">General</MuiMenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Tag</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the tag "{selectedTag?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}