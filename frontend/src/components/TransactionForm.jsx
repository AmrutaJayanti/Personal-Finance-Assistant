import React from 'react';


// This component provides a form for adding new transactions
// It includes fields for type, amount, category, and description
function TransactionForm({ form, setForm, handleAdd }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <input
        className="col-span-2 px-4 py-2 border rounded-xl"
        placeholder="Type (income / expense)"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      />
      <input
        className="px-4 py-2 border rounded-xl"
        placeholder="Amount"
        type="number"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || '' })}
      />
      <input
        className="px-4 py-2 border rounded-xl"
        placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <input
        className="col-span-2 px-4 py-2 border rounded-xl"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <button
        onClick={handleAdd}
        className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl mt-2"
      >
        ➕ Add Transaction
      </button>
    </div>
  );
}

export default TransactionForm;
