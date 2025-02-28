import React from 'react';
import { Routes, Route } from 'react-router-dom';
import XRPBurnMonitor from './components/XRPBurnMonitor';
import Login from './components/Login';
import { CssBaseline, Container, Typography } from '@mui/material';

function App() {
  return (
    <div>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 4 }}>
          XRP Sniper Bot V1
        </Typography>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<XRPBurnMonitor />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;