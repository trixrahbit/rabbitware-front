import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
  Fab,
  Zoom,
  Slide,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [message, setMessage] = useState('');
  const [threadId, setThreadId] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState('');
  const [integrationStatus, setIntegrationStatus] = useState('loading');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { selectedTenantId } = useTenant();

  // Check if OpenAI integration is set up for the current tenant
  useEffect(() => {
    const checkIntegration = async () => {
      console.log('Checking OpenAI integration status for tenant in FloatingChat...');
      try {
        // Reset state when tenant changes
        setConversation([]);
        setThreadId('');
        setInitializing(true);

        const response = await axios.get('/api/openai-integration');
        console.log('OpenAI integration response in FloatingChat:', response.data);

        if (response.data.status === 'configured') {
          console.log('OpenAI integration is configured for the current tenant');
          setIntegrationStatus('configured');

          // Store the thread ID
          const threadId = response.data.thread_id;
          setThreadId(threadId);

          // Load conversation from localStorage using thread ID
          try {
            // Include tenant ID in the storage key to separate conversations by tenant
            const storageKey = `chatConversation_${threadId}_tenant_${selectedTenantId || 'default'}`;
            const savedConversation = localStorage.getItem(storageKey);
            if (savedConversation) {
              setConversation(JSON.parse(savedConversation));
            }
          } catch (storageError) {
            console.error('Error loading conversation from localStorage:', storageError);
          }
        } else {
          console.log('OpenAI integration not configured for the current tenant');
          setIntegrationStatus('not_configured');
        }
      } catch (error) {
        console.error('Error checking OpenAI integration:', error);
        setIntegrationStatus('error');
      } finally {
        setInitializing(false);
      }
    };

    checkIntegration();
  }, [selectedTenantId]);

  // Scroll to bottom of messages and save conversation to localStorage
  useEffect(() => {
    if (messagesEndRef.current && open) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Save conversation to localStorage if we have a thread ID
    if (threadId && conversation.length > 0) {
      try {
        // Include tenant ID in the storage key to separate conversations by tenant
        const storageKey = `chatConversation_${threadId}_tenant_${selectedTenantId || 'default'}`;
        localStorage.setItem(storageKey, JSON.stringify(conversation));
      } catch (error) {
        console.error('Error saving conversation to localStorage:', error);
      }
    }
  }, [conversation, threadId, open, selectedTenantId]);

  // Track and manage unread messages
  useEffect(() => {
    if (open) {
      // Reset unread count when chat is open
      setUnreadCount(0);
    } else if (conversation.length > 0) {
      // When chat is closed, count all unread assistant messages
      // We'll use localStorage to track which messages have been read
      try {
        // Include tenant ID in the storage key to separate read tracking by tenant
        const storageKey = `lastReadIndex_${threadId}_tenant_${selectedTenantId || 'default'}`;
        const lastReadIndex = parseInt(localStorage.getItem(storageKey) || '0');

        // Count assistant messages that appeared after the last read index
        const newUnreadCount = conversation
          .slice(lastReadIndex)
          .filter(msg => msg.role === 'assistant')
          .length;

        setUnreadCount(newUnreadCount);
      } catch (error) {
        console.error('Error tracking read messages:', error);
      }
    }
  }, [conversation, open, threadId, selectedTenantId]);

  // Save the last read index when closing the chat
  useEffect(() => {
    if (!open && threadId && conversation.length > 0) {
      try {
        // Include tenant ID in the storage key to separate read tracking by tenant
        const storageKey = `lastReadIndex_${threadId}_tenant_${selectedTenantId || 'default'}`;
        localStorage.setItem(storageKey, conversation.length.toString());
      } catch (error) {
        console.error('Error saving last read index:', error);
      }
    }
  }, [open, threadId, conversation.length, selectedTenantId]);

  const handleToggleChat = () => {
    setOpen(!open);
    // The unreadCount is managed by the useEffect
  };

  const handleOpenFullChat = () => {
    navigate('/dashboard/chat-with-ai');
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError('');

      // Add user message to conversation
      const userMessage = { role: 'user', content: message };
      setConversation(prev => [...prev, userMessage]);

      // Clear input field
      setMessage('');

      // Send message to API
      const response = await axios.post('/api/integrations/openai/chat', {
        text: userMessage.content
      });

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

  // Don't render anything if OpenAI is not configured
  if (initializing || integrationStatus !== 'configured') {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Chat Window */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            width: 320,
            height: 450,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', ml: 1 }}>
              Chat with AI
            </Typography>
            <Box>
              <Tooltip title="Open full chat">
                <IconButton size="small" color="inherit" onClick={handleOpenFullChat}>
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Minimize">
                <IconButton size="small" color="inherit" onClick={handleToggleChat}>
                  <MinimizeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Chat Messages */}
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              bgcolor: 'background.default'
            }}
          >
            {conversation.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Start a conversation with your AI assistant
                </Typography>
              </Box>
            ) : (
              conversation.map((msg, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1.5
                  }}
                >
                  <Card 
                    sx={{ 
                      maxWidth: '80%', 
                      backgroundColor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                      color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                      boxShadow: 1
                    }}
                  >
                    <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                size="small"
                sx={{ mr: 1 }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage} 
                disabled={loading || !message.trim()}
              >
                {loading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Floating Chat Button */}
      <Zoom in={!initializing}>
        <Badge 
          badgeContent={unreadCount} 
          color="error" 
          overlap="circular"
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiBadge-badge': {
              right: 5,
              top: 5,
            }
          }}
        >
          <Fab
            color="primary"
            aria-label="chat"
            onClick={handleToggleChat}
            sx={{ boxShadow: 3 }}
          >
            {open ? <CloseIcon /> : <ChatIcon />}
          </Fab>
        </Badge>
      </Zoom>
    </Box>
  );
};

export default FloatingChat;
