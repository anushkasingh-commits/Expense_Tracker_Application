function ExpenseItem({ expense, onEdit, onDelete }) {
  return (
    <div className="expense-card">
      <div className="expense-info">
        <div className="expense-top-row">
          <h3>{expense.title}</h3>
          <span className="category-tag">{expense.category}</span>
        </div>

        <p className="amount">₹{Number(expense.amount).toFixed(2)}</p>
        <p className="date">{new Date(expense.date).toLocaleDateString()}</p>

        {expense.description && <p className="description">{expense.description}</p>}
        {expense.user?.name && <p className="owner">Added by {expense.user.name}</p>}
      </div>

      <div className="expense-actions">
        <button onClick={() => onEdit(expense)}>Edit</button>
        <button className="danger-btn" onClick={() => onDelete(expense._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default ExpenseItem;
