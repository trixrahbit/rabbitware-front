import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Description as FileIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ChatWithAI() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [message, setMessage] = useState('');
  const [threadId, setThreadId] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState('');
  const [integrationStatus, setIntegrationStatus] = useState('loading');
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [respawning, setRespawning] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Check if OpenAI integration is set up
  useEffect(() => {
    const checkIntegration = async () => {
      try {
        const response = await axios.get('/api/openai-integration');
        if (response.data.status === 'configured') {
          setIntegrationStatus('configured');

          // Store the thread ID
          const threadId = response.data.thread_id;
          setThreadId(threadId);

          // Load conversation from localStorage using thread ID
          try {
            const storageKey = `chatConversation_${threadId}`;
            const savedConversation = localStorage.getItem(storageKey);
            if (savedConversation) {
              setConversation(JSON.parse(savedConversation));
            }
          } catch (storageError) {
            console.error('Error loading conversation from localStorage:', storageError);
          }
        } else {
          setIntegrationStatus('not_configured');
        }
      } catch (error) {
        console.error('Error checking OpenAI integration:', error);
        setIntegrationStatus('error');
        setError('Failed to check OpenAI integration status. Please try again.');
      } finally {
        setInitializing(false);
      }
    };

    checkIntegration();
  }, []);

  // Scroll to bottom of messages and save conversation to localStorage
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Save conversation to localStorage if we have a thread ID
    if (threadId && conversation.length > 0) {
      try {
        const storageKey = `chatConversation_${threadId}`;
        localStorage.setItem(storageKey, JSON.stringify(conversation));
      } catch (error) {
        console.error('Error saving conversation to localStorage:', error);
      }
    }
  }, [conversation, threadId]);

  const handleSetupIntegration = () => {
    // Redirect to the Integrations page with the OpenAI tab selected
    navigate('/integrations');
    // Try to open the OpenAI dialog automatically
    // This is done by setting a flag in localStorage that the Integrations page can check
    try {
      localStorage.setItem('openOpenAIDialog', 'true');
    } catch (error) {
      console.error('Error setting localStorage flag:', error);
    }
  };

  const handleClearConversation = () => {
    // Clear the conversation state
    setConversation([]);

    // Clear the conversation from localStorage
    if (threadId) {
      try {
        const storageKey = `chatConversation_${threadId}`;
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Error clearing conversation from localStorage:', error);
      }
    }
  };

  const handleRespawnChat = async () => {
    try {
      setRespawning(true);
      setError('');

      // Call the respawn endpoint
      const response = await axios.post('/api/integrations/openai/respawn');

      // Clear the conversation
      setConversation([]);

      // Clear the old conversation from localStorage
      if (threadId) {
        try {
          const storageKey = `chatConversation_${threadId}`;
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.error('Error clearing conversation from localStorage:', error);
        }
      }

      // Update the thread ID with the new one
      const newThreadId = response.data.thread_id;
      setThreadId(newThreadId);

      // Show success message as first message in the conversation
      setConversation([
        { 
          role: 'assistant', 
          content: 'Chat has been respawned with a new assistant. How can I help you today?' 
        }
      ]);

    } catch (error) {
      console.error('Error respawning chat:', error);
      setError('Failed to respawn chat. Please try again.');
    } finally {
      setRespawning(false);
    }
  };

  const handleSendMessage = async () => {
    // Don't send if there's no message and no files
    if (!message.trim() && files.length === 0) return;

    try {
      setLoading(true);
      setError('');

      // Add user message to conversation with any attached files
      const userMessage = { 
        role: 'user', 
        content: message,
        files: files.length > 0 ? [...files] : undefined
      };
      setConversation(prev => [...prev, userMessage]);

      // Clear input field and files
      setMessage('');
      // Don't clear files here as they might be needed for the API call

      // Send message to API
      const response = await axios.post('/api/integrations/openai/chat', {
        text: userMessage.content,
        file_ids: files.map(file => file.id)
      });

      // Clear files after sending
      setFiles([]);

      // Add assistant response to conversation
      const assistantMessage = { role: 'assistant', content: response.data.message };
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGoToIntegrations = () => {
    navigate('/integrations');
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploadingFile(true);
    setError('');

    try {
      // Create a new FormData instance
      const formData = new FormData();

      // Append each file to the FormData
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Upload the files to the server
      const response = await axios.post('/api/integrations/openai/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Add the uploaded files to the state
      const uploadedFiles = response.data.files.map(file => ({
        id: file.id,
        name: file.filename,
        size: file.size,
        type: file.content_type
      }));

      setFiles(prev => [...prev, ...uploadedFiles]);

      // Add a message to the conversation about the uploaded files
      const fileMessage = {
        role: 'user',
        content: `I've uploaded ${uploadedFiles.length} file(s): ${uploadedFiles.map(f => f.name).join(', ')}`,
        files: uploadedFiles
      };

      setConversation(prev => [...prev, fileMessage]);

      // Clear the file input
      e.target.value = null;
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  if (initializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (integrationStatus === 'not_configured' || integrationStatus === 'error') {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Chat with AI
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            OpenAI Integration Not Configured
          </Typography>
          <Typography paragraph>
            You need to set up the OpenAI integration before you can chat with the AI assistant.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleSetupIntegration}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              Set Up OpenAI Integration
            </Button>
            <Button 
              variant="outlined"
              onClick={handleGoToIntegrations}
              startIcon={<SettingsIcon />}
            >
              Go to Integrations
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Chat with AI
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<ReplayIcon />} 
            onClick={handleRespawnChat}
            disabled={respawning}
            color="secondary"
          >
            {respawning ? 'Respawning...' : 'Respawn Chat'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleClearConversation}
            disabled={conversation.length === 0 || respawning}
          >
            Clear Chat
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
        {/* Conversation display */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
          {conversation.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary" align="center">
                Start a conversation with your AI assistant
              </Typography>
              <Typography color="text.secondary" align="center">
                Ask questions, get recommendations, or just chat
              </Typography>
            </Box>
          ) : (
            conversation.map((msg, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2 
                }}
              >
                <Card 
                  sx={{ 
                    maxWidth: '80%', 
                    backgroundColor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <CardContent>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                    {msg.files && msg.files.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Files:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {msg.files.map(file => (
                            <Chip
                              key={file.id}
                              size="small"
                              icon={<FileIcon fontSize="small" />}
                              label={file.name}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* File display */}
        {files.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Uploaded Files:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map(file => (
                <Chip
                  key={file.id}
                  icon={<FileIcon />}
                  label={file.name}
                  onDelete={() => handleRemoveFile(file.id)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Message input */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            multiline
            maxRows={4}
            sx={{ mr: 1 }}
          />
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <IconButton
            color="primary"
            onClick={handleFileClick}
            disabled={loading || uploadingFile}
            sx={{ mr: 1 }}
            title="Upload files"
          >
            {uploadingFile ? <CircularProgress size={24} /> : <AttachFileIcon />}
          </IconButton>
          <IconButton 
            color="primary" 
            onClick={handleSendMessage} 
            disabled={loading || (!message.trim() && files.length === 0)}
            sx={{ height: 56, width: 56 }}
          >
            {loading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
