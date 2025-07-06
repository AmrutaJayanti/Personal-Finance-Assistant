import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);


// This component displays a pie chart summarizing expenses by category
// It takes a list of transactions as props, where each transaction has a category and an amount

function ExpensesChart({ transactions }) {
  const rawSummary = transactions.reduce((acc, t) => {
    const label = `${t.category}`;
    acc[label] = (acc[label] || 0) + t.amount;
    return acc;
  }, {});

  const totalAmount = Object.values(rawSummary).reduce((sum, v) => sum + v, 0);

  const grouped = {};
  let othersTotal = 0;

  for (const [label, amount] of Object.entries(rawSummary)) {
    const percentage = (amount / totalAmount) * 100;
    if (percentage < 5) {
      othersTotal += amount;
    } else {
      grouped[label] = amount;
    }
  }

  if (othersTotal > 0) {
    grouped['Others'] = othersTotal;
  }

  const pieData = {
    labels: Object.keys(grouped),
    datasets: [
      {
        data: Object.values(grouped),
        backgroundColor: [
          '#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa',
          '#fb7185', '#818cf8', '#f472b6', '#facc15', '#4ade80',
          '#fca5a5', '#7dd3fc', '#c084fc', '#a3e635', '#fdba74',
        ],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ₹${value}`;
          },
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151',
          font: {
            size: 14,
            weight: '500',
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">📊 Transaction Distribution</h3>
      {transactions.length > 0 ? (
        <Pie data={pieData} options={pieOptions} />
      ) : (
        <p className="text-gray-500 text-center">No transactions to display.</p>
      )}
    </div>
  );
}

export default ExpensesChart;
