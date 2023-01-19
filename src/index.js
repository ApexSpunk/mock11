const express = require('express');
const connect = require('./config/connect');
const User = require('./models/user.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const PORT = process.env.PORT;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send({ 'Hello World!': 'Hello World!' });
}
);

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        bcrypt.hash(String(password), saltRounds, async (err, hash) => {
            const user = await User.create({ email, password: hash });
            res.status(201).send({ success: true, message: 'User created successfully', data: { id: user._id, email: user.email } });
        });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            bcrypt.compare(String(password), user.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET);
                    res.status(200).send({ success: true, message: 'User logged in successfully', token });
                } else {
                    res.status(401).send({ success: false, message: 'Invalid credentials' });
                }
            });
        } else {
            res.status(401).send({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.listen(PORT, () => {
    connect()
    console.log(`Server is running on port ${PORT}`);
});


