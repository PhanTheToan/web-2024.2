const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Welcome to Web 2024.2');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});