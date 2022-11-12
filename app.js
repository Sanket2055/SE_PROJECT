var dotenv = require('dotenv');
var express = require('express');
var logger = require('./helper/logger');
var requestLogger = require('./helper/requestLogger');
var apiAuth = require('./helper/apiAuthentication');
var cors = require('cors');

const path = require('path');
dotenv.config();

// catching the uncought exception
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION 🤯', err.name, err.message);
    console.log('Shutting down the server because of uncaught exception');
    process.exit(1);
});

// importing the routes
var usersRouter = require('./routes/userRouter');
var gorupRouter = require('./routes/groupRouter');
var expenseRouter = require('./routes/expenseRouter');

var app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// the routes used in the application
app.use('/api/users', usersRouter);
app.use('/api/group', apiAuth.validateToken, gorupRouter);
app.use('/api/expense', apiAuth.validateToken, expenseRouter);

// checking the production environment
if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
) {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// to log all invalid and not defined routes

app.all('*', (req, res) => {
    logger.error(`[Invalid Route] ${req.originalUrl}`);
    res.status(404).json({
        status: 'fail',
        message: 'Invalid path',
    });
});

const port = process.env.PORT || 3001;
// starting the server port
app.listen(port, (err) => {
    console.log(`Server started in PORT | ${port}`);
    logger.info(`Server started in PORT | ${port}`);
});

// on unhandled rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error : ${err.message}`);
    console.log('Shutting down...due to unhandled rejection');
    server.close(() => {
        process.exit(1);
    });
});
