import { useState, useEffect } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import Filters from '../components/Filters';
import { apiRequest } from '../services/api';

function Dashboard({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      setError('');
      const data = await apiRequest('/expenses');
      setExpenses(data);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async (expenseData) => {
    try {
      setError('');
      const newExpense = await apiRequest(
        '/expenses',
        'POST',
        expenseData
      );

      setExpenses((prev) => [newExpense, ...prev]);
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    }
  };

  const handleUpdate = async (id, expenseData) => {
    try {
      setError('');
      const updated = await apiRequest(
        `/expenses/${id}`,
        'PUT',
        expenseData
      );

      setExpenses((prev) =>
        prev.map((exp) => (exp._id === id ? updated : exp))
      );

      setEditingExpense(null);
    } catch (err) {
      setError(err.message || 'Failed to update expense');
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      await apiRequest(`/expenses/${id}`, 'DELETE');

      setExpenses((prev) =>
        prev.filter((exp) => exp._id !== id)
      );

      if (editingExpense?._id === id) {
        setEditingExpense(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  // Apply the selected category filter
  const visibleExpenses = expenses.filter((exp) => {
    return category === 'all' || exp.category === category;
  });

  // Total for currently visible expenses
  const total = visibleExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  // Category-wise spending for currently visible expenses
  const categoryTotals = {};

  visibleExpenses.forEach((exp) => {
    const expenseCategory = exp.category || 'Uncategorized';

    categoryTotals[expenseCategory] =
      (categoryTotals[expenseCategory] || 0) +
      Number(exp.amount || 0);
  });

  // User-wise spending for admin
  const userTotals = {};

  if (user?.role === 'admin') {
    visibleExpenses.forEach((exp) => {
      const name = exp.user?.name;

      if (name) {
        userTotals[name] =
          (userTotals[name] || 0) + Number(exp.amount || 0);
      }
    });
  }

  if (loading) {
    return <h2 className="status-text">Loading...</h2>;
  }

  return (
    <div className="dashboard">
      <h1>
        {user?.role === 'admin' ? 'All Expenses' : 'My Expenses'}
      </h1>

      {error && <p className="error-text">{error}</p>}

      <ExpenseForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingExpense={editingExpense}
        cancelEdit={() => setEditingExpense(null)}
      />

      <div className="dashboard-toolbar">
        <Filters
          category={category}
          setCategory={setCategory}
        />

        <h3>Total: ₹{total.toFixed(2)}</h3>
      </div>

      <h2>Category-wise Spending</h2>

      {Object.keys(categoryTotals).length === 0 ? (
        <p>No expenses found for this category.</p>
      ) : (
        Object.entries(categoryTotals).map(([name, amount]) => (
          <p key={name}>
            {name}: ₹{amount.toFixed(2)}
          </p>
        ))
      )}

      {user?.role === 'admin' && (
        <>
          <h2>User-wise Spending</h2>

          {Object.keys(userTotals).length === 0 ? (
            <p>No user spending data available.</p>
          ) : (
            Object.entries(userTotals).map(([name, amount]) => (
              <p key={name}>
                {name}: ₹{amount.toFixed(2)}
              </p>
            ))
          )}
        </>
      )}

      <ExpenseList
        expenses={visibleExpenses}
        onEdit={setEditingExpense}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Dashboard;
