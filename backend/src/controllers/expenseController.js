const Expense = require('../models/Expense');

// GET /api/expenses
// Admin sees every user's expenses, a regular User sees only their own
const getExpenses = async (req, res, next) => {
  try {
    let expenses;

    if (req.user.role === 'admin') {
      expenses = await Expense.find().populate('user', 'name email');
    } else {
      expenses = await Expense.find({ user: req.user._id });
    }

    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/:id
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const isOwner = expense.user.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Not allowed to view this expense' });
    }

    if (req.user.role === 'admin') {
      await expense.populate('user', 'name email');
    }

    res.json(expense);
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      description,
      user: req.user._id,
    });

    await expense.populate('user', 'name email');

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const isOwner = expense.user.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Not allowed to edit this expense' });
    }

    expense.title = req.body.title ?? expense.title;
    expense.amount = req.body.amount ?? expense.amount;
    expense.category = req.body.category ?? expense.category;
    expense.date = req.body.date ?? expense.date;
    expense.description = req.body.description ?? expense.description;

    const updatedExpense = await expense.save();
    await updatedExpense.populate('user', 'name email');
    res.json(updatedExpense);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const isOwner = expense.user.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Not allowed to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
