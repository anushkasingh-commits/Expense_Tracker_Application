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
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    if (fromDate && toDate && fromDate > toDate){
      setError('"From" date cannot be after "To" date');
      return;
    }
    loadExpenses();
  }, [fromDate, toDate]);

  async function loadExpenses() {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      const query = params.toString();

      const data = await apiRequest(`/expenses${query ? `?${query}` : ''}`);
      setExpenses(data);
      setError('');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const handleAdd = async (expenseData) => {
    try {
      await apiRequest('/expenses', 'POST', expenseData);
      await loadExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id, expenseData) => {
    try {
      await apiRequest(`/expenses/${id}`, 'PUT', expenseData);
      await loadExpenses();
      setEditingExpense(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) {
      return;
    }

    try {
      await apiRequest(`/expenses/${id}`, 'DELETE');
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const clearDates = () => {
    setFromDate('');
    setToDate('');
  };

  const visibleExpenses = expenses.filter((exp) => {
    const matchesCategory = category === 'all' || exp.category === category;
    const matchesSearch = (exp.title || '')
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const total = visibleExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const sortedExpenses = [...visibleExpenses].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    if (sortBy === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }

    if (sortBy === 'high-low') {
      return Number(b.amount) - Number(a.amount);
    }

    if (sortBy === 'low-high') {
      return Number(a.amount) - Number(b.amount);
    }

    return 0;
  });

  const expenseCount = visibleExpenses.length;

  if (loading) {
    return <h2 className="status-text">Loading...</h2>;
  }

  return (
    <div className="dashboard">
      <h1>{user.role === 'admin' ? 'All Expenses' : 'My Expenses'}</h1>

      {error && <p className="error-text">{error}</p>}

      <ExpenseForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingExpense={editingExpense}
        cancelEdit={() => setEditingExpense(null)}
      />

      <div className="dashboard-toolbar">
        <Filters category={category} setCategory={setCategory} />

        <input
          type="text"
          className="search-input"
          placeholder="Search by expense title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

          <div style={{display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'}}>
      <label>
        From: {' '}
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      </label>
      <label>
        To: {' '}
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </label>
        {(fromDate || toDate) && (
          <button type='button' onClick={clearDates}>
            Clear dates
          </button>
        )}
      </div>

        <div>
          <h3>Total: ${total.toFixed(2)}</h3>
          <p>Showing {expenseCount} expenses.</p>
        </div>
      </div>

      <div className="sort-toolbar">
        <label htmlFor="sortBy">Sort by: </label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="high-low">Amount high-low</option>
          <option value="low-high">Amount low-high</option>
        </select>
      </div>

      <ExpenseList
        expenses={sortedExpenses}
        onEdit={setEditingExpense}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Dashboard;
