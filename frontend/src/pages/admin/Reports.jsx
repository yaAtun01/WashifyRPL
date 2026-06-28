import React, { useEffect, useState } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import API from '../../services/api';
import { 
  FiTrendingUp, 
  FiShoppingBag, 
  FiCheckCircle, 
  FiClock, 
  FiCalendar, 
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFileText
} from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  
  // Date filters - defaults to last 30 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Table filters / search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/reports', {
        params: {
          startDate,
          endDate
        }
      });
      setReportData(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Gagal mengambil data laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Process data for Chart
  const dailyIncomeObj = reportData?.dailyIncome || {};
  const sortedDates = Object.keys(dailyIncomeObj).sort();
  const chartLabels = sortedDates.map(date => {
    const [yy, mm, dd] = date.split('-');
    return `${dd}/${mm}`;
  });
  const chartValues = sortedDates.map(date => parseFloat(dailyIncomeObj[date]));

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Pendapatan (IDR)',
        data: chartValues,
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        hoverBackgroundColor: '#60a5fa',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Pendapatan: ${formatPrice(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.08)'
        },
        ticks: {
          callback: (value) => formatPrice(value).replace(',00', ''),
          font: {
            size: 10
          }
        }
      }
    }
  };

  // Filter orders by search term
  const orders = reportData?.orders || [];
  const filteredOrders = orders.filter(o => 
    o.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const stats = [
    { 
      name: 'Total Pendapatan', 
      value: formatPrice(reportData?.totalIncome || 0), 
      sub: `Dari transaksi berstatus LUNAS`, 
      icon: <FiTrendingUp className="w-5 h-5 text-emerald-500" />, 
      color: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' 
    },
    { 
      name: 'Total Transaksi', 
      value: reportData?.totalTransactions || 0, 
      sub: `${reportData?.totalLunas || 0} Lunas, ${reportData?.totalBelumLunas || 0} Belum Bayar`, 
      icon: <FiShoppingBag className="w-5 h-5 text-blue-500" />, 
      color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-400' 
    },
    { 
      name: 'Cucian Selesai', 
      value: reportData?.laundrySelesai || 0, 
      sub: 'Status: SUDAH DIAMBIL', 
      icon: <FiCheckCircle className="w-5 h-5 text-teal-500" />, 
      color: 'bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/40 text-teal-700 dark:text-teal-400' 
    },
    { 
      name: 'Sedang Diproses / Belum Diambil', 
      value: reportData?.laundryBelumDiambil || 0, 
      sub: 'Status: DITERIMA / DICUCI / DISETRIKA / SIAP', 
      icon: <FiClock className="w-5 h-5 text-amber-500" />, 
      color: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-400' 
    },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Laporan Keuangan</h1>
            <p className="text-gray-500 text-sm">Visualisasikan profit harian dan rekap semua omset laundry Anda.</p>
          </div>

          {/* Date Filter Form */}
          <form onSubmit={handleApplyFilter} className="flex flex-wrap items-end gap-3 bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Dari Tanggal</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none text-gray-900 dark:text-white font-semibold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Sampai Tanggal</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none text-gray-900 dark:text-white font-semibold"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/25 transition-all"
            >
              Terapkan Filter
            </button>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.name}</span>
                <div className={`p-2 rounded-xl border ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4">
                <h3 className={`text-2xl font-black ${stat.color.split(' ').slice(-2).join(' ')}`}>
                  {stat.value}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-955 dark:text-white text-base mb-4 flex items-center">
            <FiTrendingUp className="mr-2 text-primary-500" />
            Grafik Pendapatan Harian
          </h3>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sortedDates.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Tidak ada data pendapatan dalam rentang tanggal yang dipilih
              </div>
            )}
          </div>
        </div>

        {/* Detailed Table Section */}
        <div className="bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-150 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="font-bold text-gray-955 dark:text-white text-sm flex items-center">
              <FiFileText className="mr-2 text-primary-500" />
              Rincian Transaksi
            </h3>
            {/* Search Input */}
            <div className="flex items-center bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl max-w-xs w-full shadow-inner">
              <FiSearch className="text-gray-400 w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="Cari nota atau pelanggan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent border-none focus:outline-none text-xs text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">No. Nota</th>
                  <th className="py-4 px-6">Pelanggan</th>
                  <th className="py-4 px-6">Tanggal Masuk</th>
                  <th className="py-4 px-6">Layanan</th>
                  <th className="py-4 px-6">Berat</th>
                  <th className="py-4 px-6">Total Biaya</th>
                  <th className="py-4 px-6">Status Cucian</th>
                  <th className="py-4 px-6">Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14" /></td>
                    </tr>
                  ))
                ) : currentItems.length > 0 ? (
                  currentItems.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{o.invoice_number}</td>
                      <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">{o.customer_name}</td>
                      <td className="py-4 px-6 text-gray-500">{formatDate(o.entry_date)}</td>
                      <td className="py-4 px-6 text-gray-500">{o.service_name}</td>
                      <td className="py-4 px-6 text-gray-500 font-semibold">{o.weight} Kg</td>
                      <td className="py-4 px-6 font-bold text-primary-500">{formatPrice(o.total_price)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          o.laundry_status === 'SUDAH_DIAMBIL' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                          o.laundry_status === 'SIAP_DIAMBIL' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' :
                          'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        }`}>
                          {o.laundry_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          o.payment_status === 'LUNAS' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-400">Tidak ada transaksi ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} dari {filteredOrders.length} records
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-3 text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </SidebarLayout>
  );
};

export default Reports;
