import React from 'react';


// This component displays a table of transactions
// It shows the type, amount, category, and description of each transaction

function TransactionTable({ transactions }) {
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">📋 Transaction History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-gray-500 uppercase tracking-wider border-b">
            <tr>
              <th className="py-2">Type</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {transactions.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2 font-medium">{t.type.toUpperCase()}</td>
                <td>₹{t.amount}</td>
                <td>{capitalize(t.category)}</td>
                <td>{t.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="text-center text-gray-400 mt-4">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}

export default TransactionTable;
