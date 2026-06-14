import React, { useEffect, useState } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  FiUsers, 
  FiLayers,
  FiShoppingBag,
  FiInbox,
  FiActivity,
  FiFeather,
  FiCheckCircle,
  FiTrash,
  FiDollarSign, 
  FiTrendingUp, 
  FiClock,
  FiLoader
} from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await API.get('/api/orders/dashboard-stats');
        setStats(statsRes.data);

        const ordersRes = await API.get('/api/orders');
        setOrders(ordersRes.data);

        const customersRes = await API.get('/api/customers');
        setCustomers(customersRes.data);

        const reportRes = await API.get('/api/reports');
        setReport(reportRes.data);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <FiLoader className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      </SidebarLayout>
    );
  }

  // --- Chart.js Data Computations ---
  const dailyKeys = report?.dailyIncome ? Object.keys(report.dailyIncome) : [];
  const dailyValues = report?.dailyIncome ? Object.values(report.dailyIncome) : [];

  const lineChartData = {
    labels: dailyKeys.map(d => d.split('-')[2] + '/' + d.split('-')[1]),
    datasets: [
      {
        label: 'Pendapatan (IDR)',
        data: dailyValues,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#3b82f6',
      }
    ]
  };

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      {
        label: 'Omset Bulanan (IDR)',
        data: [
          1200000, 1800000, 1500000, 2200000, 2700000, 
          stats?.incomeThisMonth || 0, 0, 0, 0, 0, 0, 0
        ],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      }
    ]
  };

  const doughnutChartData = {
    labels: ['Diterima', 'Dicuci', 'Disetrika', 'Siap Diambil', 'Sudah Diambil'],
    datasets: [
      {
        data: [
          stats?.laundryDiterima || 0,
          stats?.laundryDicuci || 0,
          stats?.laundryDisetrika || 0,
          stats?.laundrySiapDiambil || 0,
          stats?.laundrySudahDiambil || 0
        ],
        backgroundColor: ['#94a3b8', '#38bdf8', '#fbbf24', '#3b82f6', '#10b981'],
        borderWidth: 0
      }
    ]
  };

  // --- Sub-tables Slices ---
  const latestTransactions = orders.slice(0, 5);
  const latestCustomers = customers.slice(0, 5);
  const uncollectedOrders = orders.filter(o => o.laundryStatus !== 'SUDAH_DIAMBIL').slice(0, 5);
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'BELUM_BAYAR').slice(0, 5);

  // Cards definitions
  const statCards = [
    { name: 'Total Pelanggan', value: stats?.totalCustomers, icon: <FiUsers className="w-5 h-5" />, color: 'bg-blue-500' },
    { name: 'Total Layanan', value: stats?.totalServices, icon: <FiLayers className="w-5 h-5" />, color: 'bg-indigo-500' },
    { name: 'Total Transaksi', value: stats?.totalTransactions, icon: <FiShoppingBag className="w-5 h-5" />, color: 'bg-primary-500' },
  ];

  const statusCards = [
    { name: 'Diterima', value: stats?.laundryDiterima, color: 'border-gray-200 dark:border-gray-700 text-gray-500' },
    { name: 'Dicuci', value: stats?.laundryDicuci, color: 'border-sky-200 dark:border-sky-900/40 text-sky-500' },
    { name: 'Disetrika', value: stats?.laundryDisetrika, color: 'border-amber-200 dark:border-amber-900/40 text-amber-500' },
    { name: 'Siap Diambil', value: stats?.laundrySiapDiambil, color: 'border-blue-200 dark:border-blue-900/40 text-blue-500' },
    { name: 'Sudah Diambil', value: stats?.laundrySudahDiambil, color: 'border-emerald-200 dark:border-emerald-900/40 text-emerald-500' },
  ];

  const incomeCards = [
    { name: 'Pendapatan Hari Ini', value: stats?.incomeToday, color: 'text-emerald-500' },
    { name: 'Pendapatan Minggu Ini', value: stats?.incomeThisWeek, color: 'text-indigo-500' },
    { name: 'Pendapatan Bulan Ini', value: stats?.incomeThisMonth, color: 'text-blue-500' },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-8">
        
        {/* Welcome */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Dashboard Admin</h1>
            <p className="text-gray-500 text-sm mt-0.5">Kelola data laundry Washify secara terkomputerisasi.</p>
          </div>
          <div className="text-xs text-gray-400 font-bold bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 px-4 py-2 rounded-xl">
            📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* 1. Stat Cards Grid (Total counters) */}
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {statCards.map((c, i) => (
            <div key={i} className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                {c.icon}
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{c.name}</p>
                <h3 className="text-2xl font-black text-gray-950 dark:text-white mt-0.5">{c.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Status Cards Grid */}
        <div className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest flex items-center">
            <FiActivity className="mr-2 text-primary-500" /> Status Laundry Aktif
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statusCards.map((c, i) => (
              <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-between h-20 ${c.color}`}>
                <span className="text-xs font-semibold text-gray-400">{c.name}</span>
                <span className="text-2xl font-black block mt-1">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Income Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {incomeCards.map((c, i) => (
            <div key={i} className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.name}</span>
              <p className={`text-2xl font-black ${c.color}`}>{formatPrice(c.value)}</p>
            </div>
          ))}
        </div>

        {/* 4. Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Daily Revenue Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-gray-950 dark:text-white text-base mb-4">Grafik Pendapatan Harian (30 Hari Terakhir)</h3>
            <div className="h-64">
              {dailyKeys.length > 0 ? (
                <Line 
                  data={lineChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { grid: { color: 'rgba(156, 163, 175, 0.08)' } },
                      x: { grid: { display: false } }
                    }
                  }} 
                />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">Belum ada data pendapatan lunas</div>
              )}
            </div>
          </div>

          {/* Status Distribution Chart */}
          <div className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-gray-950 dark:text-white text-base">Grafik Status Laundry</h3>
            <div className="h-60 flex items-center justify-center py-4">
              {stats?.totalTransactions > 0 ? (
                <Doughnut 
                  data={doughnutChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, fontSize: 10 } } }
                  }} 
                />
              ) : (
                <div className="text-sm text-gray-400">Belum ada transaksi laundry</div>
              )}
            </div>
          </div>

        </div>

        {/* 5. Sub-tables Dashboard Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* 5 Transaksi Terbaru */}
          <div className="bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-150 dark:border-gray-800">
              <h4 className="font-bold text-gray-950 dark:text-white text-sm">5 Transaksi Terbaru</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nota</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Layanan</th>
                    <th className="py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {latestTransactions.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                      <td className="py-3 px-4 font-bold text-primary-500">{o.invoiceNumber}</td>
                      <td className="py-3 px-4">{o.customerName}</td>
                      <td className="py-3 px-4 text-gray-400">{o.serviceName}</td>
                      <td className="py-3 px-4 font-bold">{formatPrice(o.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5 Pelanggan Terbaru */}
          <div className="bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-150 dark:border-gray-800">
              <h4 className="font-bold text-gray-950 dark:text-white text-sm">5 Pelanggan Baru</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Nomor HP</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {latestCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                      <td className="py-3 px-4 font-bold">{c.name}</td>
                      <td className="py-3 px-4 text-gray-500">{c.phone}</td>
                      <td className="py-3 px-4 text-gray-400">{c.email}</td>
                      <td className="py-3 px-4 text-gray-400">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Laundry Belum Diambil */}
          <div className="bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-150 dark:border-gray-800">
              <h4 className="font-bold text-gray-950 dark:text-white text-sm">Laundry Belum Diambil</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nota</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Status Cuci</th>
                    <th className="py-3 px-4">Tanggal Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {uncollectedOrders.length > 0 ? (
                    uncollectedOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="py-3 px-4 font-bold text-primary-500">{o.invoiceNumber}</td>
                        <td className="py-3 px-4">{o.customerName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 uppercase">
                            {o.laundryStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{formatDate(o.entryDate)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-400">Tidak ada laundry aktif</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaksi Belum Lunas */}
          <div className="bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-150 dark:border-gray-800">
              <h4 className="font-bold text-gray-950 dark:text-white text-sm">Transaksi Belum Lunas</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nota</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Total Biaya</th>
                    <th className="py-3 px-4">Tanggal Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {unpaidOrders.length > 0 ? (
                    unpaidOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="py-3 px-4 font-bold text-red-500">{o.invoiceNumber}</td>
                        <td className="py-3 px-4">{o.customerName}</td>
                        <td className="py-3 px-4 font-bold text-primary-500">{formatPrice(o.totalPrice)}</td>
                        <td className="py-3 px-4 text-gray-400">{formatDate(o.entryDate)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-400">Semua transaksi lunas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
