require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');


const app = express();
const PORT = process.env.PORT || 4000;


connectDB();


// middlewares
app.use(cors());
app.use(express.json()); 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/posts', postRoutes);


app.get('/', (req, res) => res.send('GNCIPl backend running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));