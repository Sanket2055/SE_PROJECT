const model = require("../model/schema");
const validator = require("../helper/validation");
const logger = require("../helper/logger");
const groupSplitter = require("./group");

exports.addExpense = async (req, res) => {
  try {
    var expense = req.body;
    var group = await model.Group.findOne({
      _id: expense.groupId,
    });
    if (!group) {
      var err = new Error("Invalid Group Id");
      err.status = 400;
      throw err;
    }
    if (
      validator.notNull(expense.expenseName) &&
      validator.notNull(expense.expenseAmount) &&
      validator.notNull(expense.expenseOwner) &&
      validator.notNull(expense.expenseMembers) &&
      validator.notNull(expense.expenseDate)
    ) {
      var ownerValidation = await validator.groupUserValidation(
        expense.expenseOwner,
        expense.groupId
      );
      if (!ownerValidation) {
        var err = new Error("Please provide a valid group owner");
        err.status = 400;
        throw err;
      }
      for (var user of expense.expenseMembers) {
        var memberValidation = await validator.groupUserValidation(
          user,
          expense.groupId
        );
        if (!memberValidation) {
          var err = new Error("Please ensure the members exixt in the group");
          err.status = 400;
          throw err;
        }
      }
      expense.expensePerMember =
        expense.expenseAmount / expense.expenseMembers.length;
      expense.expenseCurrency = group.groupCurrency;
      var newExp = new model.Expense(expense);
      var newExpense = await model.Expense.create(newExp);

      var update_response = await groupSplitter.addSplit(
        expense.groupId,
        expense.expenseAmount,
        expense.expenseOwner,
        expense.expenseMembers
      );

      res.status(200).json({
        status: "Success",
        message: "New expenses added",
        Id: newExpense._id,
        splitUpdateResponse: update_response,
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

exports.editExpense = async (req, res) => {
  try {
    var expense = req.body;
    var oldExpense = await model.Expense.findOne({
      _id: expense.id,
    });
    if (
      !oldExpense ||
      expense.id == null ||
      oldExpense.groupId != expense.groupId
    ) {
      var err = new Error("Invalid Expense Id");
      err.status = 400;
      throw err;
    }

    if (
      validator.notNull(expense.expenseName) &&
      validator.notNull(expense.expenseAmount) &&
      validator.notNull(expense.expenseOwner) &&
      validator.notNull(expense.expenseMembers) &&
      validator.notNull(expense.expenseDate)
    ) {
      var ownerValidation = await validator.groupUserValidation(
        expense.expenseOwner,
        expense.groupId
      );
      if (!ownerValidation) {
        var err = new Error("Please provide a valid group owner");
        err.status = 400;
        throw err;
      }
      for (var user of expense.expenseMembers) {
        var memberValidation = await validator.groupUserValidation(
          user,
          expense.groupId
        );
        if (!memberValidation) {
          var err = new Error("Please ensure the members exixt in the group");
          err.status = 400;
          throw err;
        }
      }

      var expenseUpdate = await model.Expense.updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            groupId: expense.groupId,
            expenseName: expense.expenseName,
            expenseDescription: expense.expenseDescription,
            expenseAmount: expense.expenseAmount,
            expenseOwner: expense.expenseOwner,
            expenseMembers: expense.expenseMembers,
            expensePerMember:
              expense.expenseAmount / expense.expenseMembers.length,
            expenseType: expense.expenseType,
            expenseDate: expense.expenseDate,
          },
        }
      );

      await groupSplitter.clearSplit(
        oldExpense.groupId,
        oldExpense.expenseAmount,
        oldExpense.expenseOwner,
        oldExpense.expenseMembers
      );
      await groupSplitter.addSplit(
        expense.groupId,
        expense.expenseAmount,
        expense.expenseOwner,
        expense.expenseMembers
      );

      res.status(200).json({
        status: "Success",
        message: "Expense Edited",
        response: expenseUpdate,
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

exports.deleteExpense = async (req, res) => {
  try {
    var expense = await model.Expense.findOne({
      _id: req.body.id,
    });
    if (!expense) {
      var err = new Error("Invalid Expense Id");
      err.status = 400;
      throw err;
    }
    var deleteExp = await model.Expense.deleteOne({
      _id: req.body.id,
    });

    await groupSplitter.clearSplit(
      expense.groupId,
      expense.expenseAmount,
      expense.expenseOwner,
      expense.expenseMembers
    );

    res.status(200).json({
      status: "Success",
      message: "Expense is deleted",
      response: deleteExp,
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
