const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const setupRoutes = require('./routes/setupRoutes');
const adminRoutes = require('./routes/adminRoutes');
const amountRoutes = require('./routes/amountRoutes');
const loanRoutes = require('./routes/loanRoutes');
const groupMemberRoutes = require('./routes/groupMemberRoutes');

const app = express();

(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to initialize database.');
  }
})();

app.use(express.json());

app.use(cors());

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  useTempFiles: false,
  abortOnLimit: true
}));

app.get('/', (req, res) => {
  res.json({ 
    message: 'NatiApp API',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/amounts', amountRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/group-members', groupMemberRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
