const xrpl = require('xrpl');
const redis = require('redis');
const jwt = require('jsonwebtoken');

// XRP Wallet Management
async function connectToXRPL() {
  const client = new xrpl.Client('wss://s1.ripple.com');
  await client.connect();
  return client;
}

// Token Sniping Logic (Ultra-Fast: 0.55–3.8s)
async function snipeToken(wallet, token) {
  const client = await connectToXRPL();
  try {
    const tx = await client.submit({
      TransactionType: 'Payment',
      Account: wallet.address,
      Destination: token.address,
      Amount: xrpl.xrpToDrops('1'),
    }, { wallet });
    return { result: tx.result, status: 'sniped' };
  } finally {
    await client.disconnect();
  }
}

// Redis Client for Lambda (Use environment variable)
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});
redisClient.on('error', (err) => console.error('Redis Error:', err));

// API Handlers for AWS Lambda
exports.handler = async (event) => {
  try {
    const { httpMethod, path, body, headers } = event;
    const token = headers.authorization?.split(' ')[1];

    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'No token provided' }) };

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };

    switch (path) {
      case '/wallet':
        if (httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
        const { address, secret } = JSON.parse(body || '{}');
        const wallet = xrpl.Wallet.fromSeed(secret);
        await redisClient.set(`wallet:${address}`, JSON.stringify(wallet));
        return { statusCode: 200, body: JSON.stringify({ address, status: 'created' }) };

      case '/snipe':
        if (httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
        const { walletAddress, token } = JSON.parse(body || '{}');
        const walletData = await redisClient.get(`wallet:${walletAddress}`);
        if (!walletData) return { statusCode: 404, body: JSON.stringify({ error: 'Wallet not found' }) };
        const wallet = JSON.parse(walletData);
        const result = await snipeToken(wallet, token);
        return { statusCode: 200, body: JSON.stringify(result) };

      case '/login':
        if (httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
        const { username, password } = JSON.parse(body || '{}');
        if (username === 'nenefebi' && password === 'nenefebi') {
          const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
          return { statusCode: 200, body: JSON.stringify({ token }) };
        }
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };

      default:
        return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
    }
  } catch (err) {
    console.error('Lambda Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};