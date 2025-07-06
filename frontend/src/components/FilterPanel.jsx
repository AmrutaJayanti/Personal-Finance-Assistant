import React from 'react';


// This component provides a filter panel for transactions
// It allows users to filter transactions by date range, type, and category
// It also provides buttons to apply filters and reset the filter state

function FilterPanel({
  startDate,
  endDate,
  filterType,
  filterCategory,
  setStartDate,
  setEndDate,
  setFilterType,
  setFilterCategory,
  setPage,
  fetchData,
  resetData,
}) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-8">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
        <input
          type="date"
          className="px-3 py-2 border rounded-xl"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
        <input
          type="date"
          className="px-3 py-2 border rounded-xl"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
        <select
          className="px-3 py-2 border rounded-xl"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
        <input
          type="text"
          className="px-3 py-2 border rounded-xl"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          placeholder="e.g., Travel"
        />
      </div>
      <div className="flex items-end gap-2">
        <button
          onClick={() => {
            setPage(1);
            fetchData(); // This calls both fetchData & fetchAllTransactions via Dashboard
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl"
        >
          🔍 Filter
        </button>
        <button
          onClick={resetData}
          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-xl"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;
