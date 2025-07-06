import React, { useEffect, useState } from 'react';
import {
  getTransactions,
  addTransaction,
  uploadReceipt,
  uploadPDF,
} from '../api/financeAPI';
import FilterPanel from '../components/FilterPanel';
import TransactionForm from '../components/TransactionForm';
import FileUploader from '../components/FileUpload';
import ExpensesChart from '../components/ExpensesChart';
import TransactionTable from '../components/TransactionTable';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Toaster, toast } from 'react-hot-toast';
Chart.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [form, setForm] = useState({ type: '', amount: '', category: '', description: '' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [total, setTotal] = useState(0);
  const [limit] = useState(5);
  const [page, setPage] = useState(1);

  const fetchData = async () => {         // Fetch paginated transactions based on filters
    const params = {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      type: filterType || undefined,
      category: filterCategory || undefined,
      limit,
      offset: (page - 1) * limit,
    };
    const res = await getTransactions(params);
    setTransactions(res.data.transactions);
    setTotal(res.data.total);
  };

  const fetchAllTransactions = async () => {    // Fetch all transactions without pagination
    const params = {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      type: filterType || undefined,
      category: filterCategory || undefined,
    };
    const res = await getTransactions(params);
    setAllTransactions(res.data.transactions || res.data);
  };

  useEffect(() => {
    fetchData();
    fetchAllTransactions();
  }, [page]);

  const handleAdd = async () => {     // Handle adding a new transaction    
    try {
      await addTransaction(form);
      toast.success('Transaction added');
      setForm({ type: '', amount: '', category: '', description: '' });
      fetchData();
      fetchAllTransactions();
    } catch (err) {
      toast.error('Failed to add transaction');
    }
  };

  const handleFileUpload = async (e, isPDF = false) => {  // Handle file upload for receipts or PDFs
    if (!e.target.files || e.target.files.length === 0) {
      toast.error('No file selected');
      return;
    }
    try {
      const file = e.target.files[0];
      const res = isPDF ? await uploadPDF(file) : await uploadReceipt(file);
      toast.success(`${res.data.added} transactions added`);
      fetchData();
      fetchAllTransactions();
    } catch (err) {
      toast.error('Failed to upload file');
    }
  };

  const handleFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    setPage(1);
    fetchData();
    fetchAllTransactions();
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFilterType('');
    setFilterCategory('');
    setPage(1);
    fetchData();
    fetchAllTransactions();
    toast.success('Filters reset');
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          💸 Personal Finance Dashboard
        </h2>

        <FilterPanel
          startDate={startDate}
          endDate={endDate}
          filterType={filterType}
          filterCategory={filterCategory}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setFilterType={setFilterType}
          setFilterCategory={setFilterCategory}
          setPage={setPage}
          fetchData={handleFilter}
          resetData={handleReset}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-md col-span-2">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">➕ Add Transaction</h3>
            <TransactionForm form={form} setForm={setForm} handleAdd={handleAdd} />
            <FileUploader handleFileUpload={handleFileUpload} />
          </div>

          <ExpensesChart transactions={allTransactions} />
        </div>

        {total === 0 ? (
          <p className="text-center text-gray-400 mb-6">No transactions found.</p>
        ) : (
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded transition ${
                page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              ◀ Prev
            </button>
            <span className="px-4 py-2">Page {page} of {totalPages}</span>
            <button
              className={`px-4 py-2 rounded transition ${
                page === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Next ▶
            </button>
          </div>
        )}

        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}

export default Dashboard;
