const Expense = require('../models/Expense');

// GET /api/expenses
// Admin sees every user's expenses, a regular User sees only their own
const getExpenses = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : {user: req.user._id};
    const { from, to } = req.query;
    if (from || to) {
      filter.date = {};
      if (from) {
        const fromDate = new Date(`${from}T00:00:00.000Z`);
        if (isNaN(fromDate.getTime())) {
          res.status(400);
          throw new Error('Invalid "from" date');
        }
        filter.date.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(`${to}T23:59:59.999Z`);
        if (isNaN(toDate.getTime())) {
          res.status(400);
          throw new Error('Invalid "to" date');
        }
        filter.date.$lte = toDate;
      }
      if (from && to && filter.date.$gte > filter.date.$lte) {
        res.status(400);
        throw new Error('"From" date cannot be after "To" date');
      }
    }
    let query = Expense.find(filter);
    if (req.user.role === 'admin') {
      query = query.populate('user', 'name email');
    }
    res.json(await query);
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
