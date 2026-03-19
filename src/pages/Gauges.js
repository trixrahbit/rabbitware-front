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
  TextField,
  FormControl,
  InputLabel,
  Select,
  Breadcrumbs,
  Link,
  Tooltip,
  Chip,
  Paper,
  Tabs,
  Tab,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Storage as StorageIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  Folder as FolderIcon,
  FilterList as FilterIcon,
  Speed as SpeedIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  BarChart as BarChartIcon,
  Numbers as NumbersIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Gauges() {
  const [loading, setLoading] = useState(true);
  const [gauges, setGauges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGauge, setSelectedGauge] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openTagDialog, setOpenTagDialog] = useState(false);
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [accessError, setAccessError] = useState('');
  const [filters, setFilters] = useState({
    categoryId: null,
    tagId: null,
    folderId: null
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });
  const [tagFormData, setTagFormData] = useState({
    name: '',
    tag_type: 'gauge'
  });
  const [folderFormData, setFolderFormData] = useState({
    name: '',
    description: '',
    parent_folder_id: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchGauges();
    fetchCategories();
    fetchTags();
    fetchFolders();
  }, []);

  const fetchGauges = async (categoryId = null, tagId = null, folderId = null) => {
    try {
      setLoading(true);
      let url = '/api/analytics/gauges';
      const params = {};

      if (categoryId) params.category_id = categoryId;
      if (tagId) params.tag_id = tagId;
      if (folderId) params.folder_id = folderId;

      const response = await axios.get(url, { params });
      setGauges(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gauges:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/analytics/gauge-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/analytics/gauge-tags', {
        params: { tag_type: 'gauge' }
      });
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await axios.get('/api/analytics/gauge-folders');
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
    }
  };

  const handleMenuClick = (event, gauge) => {
    setAnchorEl(event.currentTarget);
    setSelectedGauge(gauge);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    navigate('/dashboard/analytics/gauges/create');
  };

  const handleEditClick = () => {
    navigate(`/dashboard/analytics/gauges/${selectedGauge.id}`);
    handleMenuClose();
  };

  const handleViewClick = () => {
    navigate(`/dashboard/analytics/gauges/${selectedGauge.id}`);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/analytics/gauges/${selectedGauge.id}`);
      fetchGauges(filters.categoryId, filters.tagId, filters.folderId);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting gauge:', error);
    }
  };

  const handleFilterClick = () => {
    setOpenFilterDialog(true);
  };

  const handleFilterDialogClose = () => {
    setOpenFilterDialog(false);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value === '' ? null : value
    });
  };

  const handleApplyFilters = () => {
    fetchGauges(filters.categoryId, filters.tagId, filters.folderId);
    setOpenFilterDialog(false);
  };

  const handleClearFilters = () => {
    setFilters({
      categoryId: null,
      tagId: null,
      folderId: null
    });
    fetchGauges();
    setOpenFilterDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Category dialog handlers
  const handleOpenCategoryDialog = () => {
    setCategoryFormData({
      name: '',
      description: ''
    });
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData({
      ...categoryFormData,
      [name]: value
    });
  };

  const handleCreateCategory = async () => {
    try {
      await axios.post('/api/analytics/gauge-categories', categoryFormData);
      fetchCategories();
      setOpenCategoryDialog(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Tag dialog handlers
  const handleOpenTagDialog = () => {
    setTagFormData({
      name: ''
    });
    setOpenTagDialog(true);
  };

  const handleCloseTagDialog = () => {
    setOpenTagDialog(false);
  };

  const handleTagInputChange = (e) => {
    const { name, value } = e.target;
    setTagFormData({
      ...tagFormData,
      [name]: value
    });
  };

  const handleCreateTag = async () => {
    try {
      await axios.post('/api/analytics/gauge-tags', tagFormData);
      fetchTags();
      setOpenTagDialog(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  // Folder dialog handlers
  const handleOpenFolderDialog = () => {
    setFolderFormData({
      name: '',
      description: '',
      parent_folder_id: ''
    });
    setOpenFolderDialog(true);
  };

  const handleCloseFolderDialog = () => {
    setOpenFolderDialog(false);
  };

  const handleFolderInputChange = (e) => {
    const { name, value } = e.target;
    setFolderFormData({
      ...folderFormData,
      [name]: value
    });
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post('/api/analytics/gauge-folders', folderFormData);
      fetchFolders();
      setOpenFolderDialog(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const getGaugeTypeIcon = (gaugeType) => {
    switch (gaugeType) {
      case 'number':
        return <NumbersIcon color="primary" />;
      case 'percentage':
        return <SpeedIcon color="primary" />;
      case 'pie':
        return <PieChartIcon color="primary" />;
      case 'bar':
        return <BarChartIcon color="primary" />;
      case 'line':
        return <LineChartIcon color="primary" />;
      default:
        return <SpeedIcon color="primary" />;
    }
  };

  const getGaugeTypeName = (gaugeType) => {
    switch (gaugeType) {
      case 'number':
        return 'Number';
      case 'percentage':
        return 'Percentage';
      case 'pie':
        return 'Pie Chart';
      case 'bar':
        return 'Bar Chart';
      case 'line':
        return 'Line Chart';
      default:
        return gaugeType.charAt(0).toUpperCase() + gaugeType.slice(1);
    }
  };

  const renderGaugesList = () => {
    if (gauges.length === 0) {
      return (
        <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Gauges Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get started by creating your first gauge.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Gauge
            </Button>
          </CardActions>
        </Card>
      );
    }

    return (
      <Grid container spacing={3}>
        {gauges.map((gauge) => (
          <Grid item xs={12} sm={6} md={4} key={gauge.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getGaugeTypeIcon(gauge.gauge_type)}
                    <Typography variant="h6" component="div" sx={{ ml: 1 }} noWrap>
                      {gauge.name}
                    </Typography>
                  </Box>
                  <IconButton 
                    aria-label="gauge menu" 
                    onClick={(e) => handleMenuClick(e, gauge)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {gauge.description || 'No description provided.'}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Type: {getGaugeTypeName(gauge.gauge_type)}
                  </Typography>
                  {gauge.category_name && (
                    <Chip 
                      label={gauge.category_name} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      icon={<CategoryIcon />}
                    />
                  )}
                </Box>
              </CardContent>
              <Divider />
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<ViewIcon />}
                  onClick={() => {
                    setSelectedGauge(gauge);
                    handleViewClick();
                  }}
                >
                  View
                </Button>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setSelectedGauge(gauge);
                    handleEditClick();
                  }}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (accessError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', bgcolor: 'grey.100' }}>
        <Typography variant="h6">{accessError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gauges
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Link color="inherit" href="/dashboard/analytics">
              Analytics
            </Link>
            <Typography color="text.primary">Gauges</Typography>
          </Breadcrumbs>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{ mr: 1 }}
          >
            Filter
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Create Gauge
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Create and manage gauges to visualize your data. Organize them with categories, tags, and folders.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="gauge tabs">
          <Tab label="All Gauges" />
          <Tab label="By Category" />
          <Tab label="By Tag" />
          <Tab label="By Folder" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderGaugesList()}

      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Categories</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenCategoryDialog}
              size="small"
            >
              Create Category
            </Button>
          </Box>

          {categories.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No categories found. Create categories to organize your gauges.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenCategoryDialog}
                sx={{ mt: 2 }}
              >
                Create Category
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CategoryIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          {category.name}
                        </Typography>
                      </Box>
                      {category.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {category.description}
                        </Typography>
                      )}
                      <Chip 
                        label={`${category.gauge_count} gauges`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => {
                          setFilters({ ...filters, categoryId: category.id });
                          fetchGauges(category.id, filters.tagId, filters.folderId);
                        }}
                        color={filters.categoryId === category.id ? "primary" : "inherit"}
                        variant={filters.categoryId === category.id ? "contained" : "text"}
                      >
                        View Gauges
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {filters.categoryId && (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Gauges in Selected Category
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setFilters({ ...filters, categoryId: null });
                    fetchGauges(null, filters.tagId, filters.folderId);
                  }}
                  size="small"
                >
                  Clear Selection
                </Button>
              </Box>
              {renderGaugesList()}
            </Box>
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Tags</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenTagDialog}
              size="small"
            >
              Create Tag
            </Button>
          </Box>

          {tags.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No tags found. Create tags to organize your gauges.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenTagDialog}
                sx={{ mt: 2 }}
              >
                Create Tag
              </Button>
            </Paper>
          ) : (
            <Box>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Select a tag to view gauges with that tag:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag) => (
                    <Chip 
                      key={tag.id}
                      label={`${tag.name} (${tag.gauge_count})`}
                      icon={<TagIcon />}
                      onClick={() => {
                        setFilters({ ...filters, tagId: tag.id });
                        fetchGauges(filters.categoryId, tag.id, filters.folderId);
                      }}
                      color={filters.tagId === tag.id ? "primary" : "default"}
                      variant={filters.tagId === tag.id ? "filled" : "outlined"}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Paper>

              <Grid container spacing={2}>
                {tags.map((tag) => (
                  <Grid item xs={12} sm={6} md={3} key={tag.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TagIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" component="div">
                            {tag.name}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${tag.gauge_count} gauges`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => {
                            setFilters({ ...filters, tagId: tag.id });
                            fetchGauges(filters.categoryId, tag.id, filters.folderId);
                          }}
                          color={filters.tagId === tag.id ? "primary" : "inherit"}
                          variant={filters.tagId === tag.id ? "contained" : "text"}
                        >
                          View Gauges
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {filters.tagId && (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Gauges with Selected Tag
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setFilters({ ...filters, tagId: null });
                    fetchGauges(filters.categoryId, null, filters.folderId);
                  }}
                  size="small"
                >
                  Clear Selection
                </Button>
              </Box>
              {renderGaugesList()}
            </Box>
          )}
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Folders</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenFolderDialog}
              size="small"
            >
              Create Folder
            </Button>
          </Box>

          {folders.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No folders found. Create folders to organize your gauges.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenFolderDialog}
                sx={{ mt: 2 }}
              >
                Create Folder
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {/* Folder List Column */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Folder List
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {folders.map((folder) => (
                      <ListItem 
                        key={folder.id}
                        button
                        selected={filters.folderId === folder.id}
                        onClick={() => {
                          setFilters({ ...filters, folderId: folder.id });
                          fetchGauges(filters.categoryId, filters.tagId, folder.id);
                        }}
                      >
                        <ListItemIcon>
                          <FolderIcon color={filters.folderId === folder.id ? "primary" : "inherit"} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={folder.name} 
                          secondary={`${folder.gauge_count} gauges`} 
                        />
                        {folder.subfolder_count > 0 && (
                          <Chip 
                            label={`${folder.subfolder_count} subfolders`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Gauges in Folder Column */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {filters.folderId ? 
                        `Gauges in ${folders.find(f => f.id === filters.folderId)?.name || 'Selected Folder'}` : 
                        'All Gauges'
                      }
                    </Typography>
                    {filters.folderId && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                          setFilters({ ...filters, folderId: null });
                          fetchGauges(filters.categoryId, filters.tagId, null);
                        }}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {renderGaugesList()}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* Gauge Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewClick}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Gauge
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Gauge
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Gauge
        </MenuItem>
      </Menu>

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={handleFilterDialogClose}>
        <DialogTitle>Filter Gauges</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="categoryId"
              value={filters.categoryId || ''}
              label="Category"
              onChange={handleFilterChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="tag-label">Tag</InputLabel>
            <Select
              labelId="tag-label"
              id="tag"
              name="tagId"
              value={filters.tagId || ''}
              label="Tag"
              onChange={handleFilterChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="folder-label">Folder</InputLabel>
            <Select
              labelId="folder-label"
              id="folder"
              name="folderId"
              value={filters.folderId || ''}
              label="Folder"
              onChange={handleFilterChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>{folder.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters}>Clear Filters</Button>
          <Button onClick={handleFilterDialogClose}>Cancel</Button>
          <Button onClick={handleApplyFilters} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Gauge</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the gauge "{selectedGauge?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog}>
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={categoryFormData.name}
            onChange={handleCategoryInputChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={categoryFormData.description}
            onChange={handleCategoryInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateCategory} 
            variant="contained"
            disabled={!categoryFormData.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Tag Dialog */}
      <Dialog open={openTagDialog} onClose={handleCloseTagDialog}>
        <DialogTitle>Create Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Tag Name"
            type="text"
            fullWidth
            variant="outlined"
            value={tagFormData.name}
            onChange={handleTagInputChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTagDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateTag} 
            variant="contained"
            disabled={!tagFormData.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={openFolderDialog} onClose={handleCloseFolderDialog}>
        <DialogTitle>Create Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={folderFormData.name}
            onChange={handleFolderInputChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={folderFormData.description}
            onChange={handleFolderInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="parent-folder-label">Parent Folder</InputLabel>
            <Select
              labelId="parent-folder-label"
              id="parent-folder"
              name="parent_folder_id"
              value={folderFormData.parent_folder_id}
              label="Parent Folder"
              onChange={handleFolderInputChange}
            >
              <MenuItem value="">
                <em>None (Root Folder)</em>
              </MenuItem>
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>{folder.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFolderDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateFolder} 
            variant="contained"
            disabled={!folderFormData.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
