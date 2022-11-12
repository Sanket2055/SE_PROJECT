const model = require('../model/schema');
const bcrypt = require('bcryptjs');
const validator = require('../helper/validation');
const logger = require('../helper/logger');
const apiAuth = require('../helper/apiAuthentication');

exports.userReg = async (req, res) => {
    try {
        const user = await model.User.findOne({
            emailId: req.body.emailId,
        });

        if (user) {
            const err = new Error('Email Id already present please login!');
            err.status = 400;
            throw err;
        } else {
            var newUser = new model.User(req.body);

            if (
                validator.emailValidation(newUser.emailId) &&
                validator.passwordValidation(newUser.password) &&
                validator.notNull(newUser.firstName)
            ) {
                const salt = await bcrypt.genSalt(10);
                newUser.password = await bcrypt.hash(newUser.password, salt);

                var id = await model.User.create(newUser);
                res.status(200).json({
                    status: 'Success',
                    message: 'User Registeration Success',
                    userId: id.id,
                });
            }
        }
    } catch (err) {
        logger.error(
            `URL : ${req.originalUrl} | staus : ${err.status} | message: ${err.message}`
        );
        res.status(err.status || 500).json({
            message: err.message,
        });
    }
};
exports.userLogin = async (req, res) => {
    try {
        const user = await model.User.findOne({
            emailId: req.body.emailId,
        });
        if (!user) {
            var err = new Error('Invalid email Id or Password !');
            err.status = 401;
            throw err;
        }

        const validCred = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validCred) {
            var err = new Error('Invalid email Id or Password* !');
            err.status = 401;
            throw err;
        } else {
            const accessToken = apiAuth.generateAccessToken(req.body.emailId);
            res.status(200).json({
                status: 'Success',
                message: 'User Login Success',
                userId: user.id,
                emailId: user.emailId,
                firstName: user.firstName,
                lastName: user.lastName,
                accessToken,
            });
        }
    } catch (err) {
        logger.error(
            `URL : ${req.originalUrl} | staus : ${err.status} | message: ${err.message} ${err.stack}`
        );
        res.status(err.status || 500).json({
            message: err.message,
        });
    }
};

exports.viewUser = async (req, res) => {
    try {
        apiAuth.validateUser(req.user, req.body.emailId);
        const user = await model.User.findOne(
            {
                emailId: req.body.emailId,
            },
            {
                password: 0,
            }
        );
        if (!user) {
            var err = new Error('User does not exist!');
            err.status = 400;
            throw err;
        }
        res.status(200).json({
            status: 'Success',
            user: user,
        });
    } catch (err) {
        logger.error(
            `URL : ${req.originalUrl} | staus : ${err.status} | message: ${err.message}`
        );
        res.status(err.status || 500).json({
            message: err.message,
        });
    }
};
// to get all users in the database
exports.emailList = async (req, res) => {
    try {
        const userEmails = await model.User.find(
            {},
            {
                emailId: 1,
                _id: 0,
            }
        );
        if (!userEmails) {
            var err = new Error('User does not exist!');
            err.status = 400;
            throw err;
        }
        var emailList = [];
        for (var email of userEmails) {
            emailList.push(email.emailId);
        }
        res.status(200).json({
            status: 'Success',
            user: emailList,
        });
    } catch (err) {
        logger.error(
            `URL : ${req.originalUrl} | staus : ${err.status} | message: ${err.message}`
        );
        res.status(err.status || 500).json({
            message: err.message,
        });
    }
};