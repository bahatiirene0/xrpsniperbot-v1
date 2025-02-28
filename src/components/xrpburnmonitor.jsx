import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Container, Typography, Button } from '@mui/material';

function XRPBurnMonitor() {
  const [burnData, setBurnData] = useState([]);
  const [isSniping, setIsSniping] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(process.env.VITE_WS_ENDPOINT || 'wss://your-api-lambda-endpoint.execute-api.us-east-1.amazonaws.com/prod');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBurnData((prev) => [...prev, { time: new Date().toISOString(), value: data.value }].slice(-20));
    };
    return () => ws.close();
  }, []);

  const handleSnipe = async () => {
    setIsSniping(true);
    try {
      const response = await fetch(process.env.VITE_API_ENDPOINT || 'https://your-api-lambda-endpoint.execute-api.us-east-1.amazonaws.com/prod/snipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ walletAddress: 'r...', token: 'r...' }),
      });
      const result = await response.json();
      console.log('Snipe result:', result);
    } catch (err) {
      console.error('Snipe error:', err);
    } finally {
      setIsSniping(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        XRP Burn Monitor
      </Typography>
      <LineChart width={600} height={300} data={burnData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" type="category" />
        <YAxis dataKey="value" type="number" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSnipe}
        disabled={isSniping}
        sx={{ mt: 2 }}
      >
        {isSniping ? 'Sniping...' : 'Snipe Token'}
      </Button>
    </Container>
  );
}

export default XRPBurnMonitor;