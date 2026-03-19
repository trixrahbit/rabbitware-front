import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, TextField, IconButton, Paper, CircularProgress,
  Avatar, Card, CardContent, Alert, Button, Select, MenuItem,
  FormControl, InputLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

export default function ChatWithClaude() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [setupMode, setSetupMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const messagesEndRef = useRef(null);

  useEffect(() => { checkStatus(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const checkStatus = async () => {
    try {
      const res = await axios.get('/api/integrations/claude/status');
      setStatus(res.data);
      if (!res.data.configured) setSetupMode(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetup = async () => {
    try {
      setLoading(true);
      await axios.post('/api/integrations/claude/setup', { api_key: apiKey, model });
      setSetupMode(false);
      await checkStatus();
    } catch (err) {
      alert(err.response?.data?.detail || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post('/api/integrations/claude/chat', {
        message: userMsg.content,
        conversation_history: history,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response, model: res.data.model }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.response?.data?.detail || err.message}`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (setupMode) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Set Up Claude</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your Anthropic API key to get started.
            </Typography>
            <TextField fullWidth label="API Key" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model</InputLabel>
              <Select value={model} label="Model" onChange={e => setModel(e.target.value)}>
                <MenuItem value="claude-sonnet-4-20250514">Claude Sonnet 4</MenuItem>
                <MenuItem value="claude-haiku-4-5-20251001">Claude Haiku 4.5</MenuItem>
                <MenuItem value="claude-opus-4-20250514">Claude Opus 4</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" fullWidth onClick={handleSetup} disabled={!apiKey || loading}>
              {loading ? <CircularProgress size={20} /> : 'Connect'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Chat with Claude</Typography>
        <Box>
          <IconButton size="small" onClick={() => setMessages([])} title="Clear chat"><DeleteIcon /></IconButton>
          <IconButton size="small" onClick={() => setSetupMode(true)} title="Settings"><SettingsIcon /></IconButton>
        </Box>
      </Box>

      {status && <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>Model: {status.model}</Typography>}

      {/* Messages */}
      <Paper variant="outlined" sx={{ flexGrow: 1, overflow: 'auto', p: 2, mb: 1, bgcolor: '#fafafa' }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SmartToyIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Start a conversation with Claude
            </Typography>
          </Box>
        )}
        {messages.map((msg, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && <Avatar sx={{ bgcolor: '#7c3aed', width: 32, height: 32 }}><SmartToyIcon sx={{ fontSize: 18 }} /></Avatar>}
            <Paper sx={{
              p: 1.5, maxWidth: '70%',
              bgcolor: msg.role === 'user' ? '#1976d2' : msg.error ? '#fde8e8' : '#fff',
              color: msg.role === 'user' ? '#fff' : 'inherit',
            }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
            </Paper>
            {msg.role === 'user' && <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}><PersonIcon sx={{ fontSize: 18 }} /></Avatar>}
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: '#7c3aed', width: 32, height: 32 }}><SmartToyIcon sx={{ fontSize: 18 }} /></Avatar>
            <Paper sx={{ p: 1.5 }}><CircularProgress size={16} /></Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField fullWidth multiline maxRows={4} placeholder="Type a message..." value={input}
                   onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} />
        <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || loading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
