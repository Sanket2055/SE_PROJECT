const model = require('../model/schema');
const validator = require('../helper/validation');
const logger = require('../helper/logger');
const splitCalculator = require('../helper/split');

exports.createGroup = async (req, res) => {
    try {
        var newGroup = new model.Group(req.body);

        if (
            validator.notNull(newGroup.groupName) &&
            validator.currencyValidation(newGroup.groupCurrency)
        ) {
            var splitJson = {};

            for (var user of newGroup.groupMembers) {
                var memberCheck = await validator.userValidation(user);
                if (!memberCheck) {
                    var err = new Error('Invalid member id');
                    err.status = 400;
                    throw err;
                }

                splitJson[user] = 0;
            }

            newGroup.split = splitJson;

            var ownerCheck = await validator.userValidation(
                newGroup.groupOwner
            );
            if (!ownerCheck) {
                var err = new Error('Invalid owner id');
                err.status = 400;
                throw err;
            }

            var id = await model.Group.create(newGroup);
            res.status(200).json({
                status: 'Success',
                message: 'Group Creation Success',
                Id: id._id,
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

exports.viewGroup = async (req, res) => {
    try {
        const group = await model.Group.findOne({
            _id: req.body.id,
        });
        if (!group || req.body.id == null) {
            var err = new Error('Invalid Group Id');
            err.status = 400;
            throw err;
        }
        res.status(200).json({
            status: 'Success',
            group: group,
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

exports.findUserGroup = async (req, res) => {
    try {
        const user = await model.User.findOne({
            emailId: req.body.emailId,
        });
        if (!user) {
            var err = new Error('User Id not found !');
            err.status = 400;
            throw err;
        }
        const groups = await model.Group.find({
            groupMembers: req.body.emailId,
        }).sort({
            $natural: -1,
        });
        res.status(200).json({
            status: 'Success',
            groups: groups,
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
exports.editGroup = async (req, res) => {
    try {
        var group = await model.Group.findOne({
            _id: req.body.id,
        });
        if (!group || req.body.id == null) {
            var err = new Error('Invalid Group Id');
            err.status = 400;
            throw err;
        }

        var editGroup = new model.Group(req.body);

        editGroup.split = group.split;

        if (
            validator.notNull(editGroup.groupName) &&
            validator.currencyValidation(editGroup.groupCurrency)
        ) {
            for (var user of editGroup.groupMembers) {
                var memberCheck = await validator.userValidation(user);
                if (!memberCheck) {
                    var err = new Error('Invalid member id');
                    err.status = 400;
                    throw err;
                }

                if (!editGroup.split[0].hasOwnProperty(user)) {
                    editGroup.split[0][user] = 0;
                }
            }

            var ownerCheck = await validator.userValidation(
                editGroup.groupOwner
            );
            if (!ownerCheck) {
                var err = new Error('Invalid owner id');
                err.status = 400;
                throw err;
            }

            var update_response = await model.Group.updateOne(
                {
                    _id: req.body.id,
                },
                {
                    $set: {
                        groupName: editGroup.groupName,
                        groupDescription: editGroup.groupDescription,
                        groupCurrency: editGroup.groupCurrency,
                        groupMembers: editGroup.groupMembers,
                        groupCategory: editGroup.groupCategory,
                        split: editGroup.split,
                    },
                }
            );
            res.status(200).json({
                status: 'Success',
                message: 'Group updated successfully!',
                response: update_response,
            });
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

exports.deleteGroup = async (req, res) => {
    try {
        const group = await model.Group.findOne({
            _id: req.body.id,
        });
        if (!group) {
            var err = new Error('Invalid Group Id');
            err.status = 400;
            throw err;
        }
        var delete_group = await model.Group.deleteOne({
            _id: req.body.id,
        });
        res.status(200).json({
            message: 'Group deleted successfully!',
            status: 'Success',
            response: delete_group,
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
