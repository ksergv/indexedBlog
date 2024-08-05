const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const path = require('path');

const app = express();
const port = 3000;

// Чтение SSL сертификатов
const options = {
    key: fs.readFileSync('/Users/serg/ssl/10.0.1.12.key'), // путь к вашему SSL ключу
    cert: fs.readFileSync('/Users/serg/ssl/10.0.1.12.pem')  // путь к вашему SSL сертификату
};

// Настройка CORS
// Список разрешенных источников
const allowedOrigins = ['https://ksergv.github.io', 'https://0d51-95-158-48-15.ngrok-free.app'];

app.use(cors({
    origin: function (origin, callback) {
        console.log('CORS request from origin:', origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Разрешить запрос
        } else {
            console.log('CORS request denied from origin:', origin);
            callback(new Error('Not allowed by CORS')); // Отклонить запрос
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Использование body-parser для обработки JSON
app.use(bodyParser.json());

app.get('/api/posts/restore', (req, res) => {
    console.log('Restore data request received');
    const filePath = path.join(__dirname, 'data', 'posts.json');
    
    console.log('Attempting to read file:', filePath);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading posts.json:', err);
            return res.status(500).send('Error reading posts.json');
        }
        
        try {
            const posts = JSON.parse(data);
            res.json(posts);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Error parsing JSON');
        }
    });
});

app.post('/api/posts/import', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'posts.json');
    const posts = req.body;
    
    fs.writeFile(filePath, JSON.stringify(posts, null, 2), (err) => {
        if (err) {
            console.error('Error writing posts.json:', err);
            return res.status(500).send('Error writing posts.json');
        }
        
        res.json({ message: 'Posts imported successfully' });
    });
});

https.createServer(options, app).listen(3000, () => {
    console.log('HTTPS Server running on port 3000');
});
