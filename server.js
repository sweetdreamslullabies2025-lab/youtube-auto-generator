const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.get('*', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('Server started on port', PORT);
});
