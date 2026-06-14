import React, { useEffect, useState } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import API from '../../services/api';
import { 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiInfo, 
  FiCheckCircle, 
  FiTrendingDown,
  FiCalendar
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Predictions = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await API.get('/api/predictions');
        setData(response.data);
      } catch (error) {
        console.error('Gagal mengambil data prediksi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </SidebarLayout>
    );
  }

  const isInsufficient = data?.status && data.status.includes('belum cukup');

  // Process data for Actual vs Projected Line Chart
  const historical = data?.historicalPoints || {};
  const predictions = data?.predictionPoints || {};

  const sortedHistDates = Object.keys(historical).sort();
  const sortedPredDates = Object.keys(predictions).sort();
  
  // Combine all dates for labels
  const allLabels = [...sortedHistDates, ...sortedPredDates].map(date => {
    const [yy, mm, dd] = date.split('-');
    return `${dd}/${mm}`;
  });

  // Data sets:
  // 1. Historical Data (null for future projection dates to keep line ending)
  const historicalDataset = [];
  sortedHistDates.forEach(date => {
    historicalDataset.push(parseFloat(historical[date]));
  });
  // Connect the historical line to the first prediction point
  if (sortedPredDates.length > 0) {
    historicalDataset.push(parseFloat(predictions[sortedPredDates[0]]));
  }

  // 2. Projection Data (null for historical dates except the last one so the lines connect)
  const projectionDataset = [];
  // Fill historical part with null
  for (let i = 0; i < sortedHistDates.length - 1; i++) {
    projectionDataset.push(null);
  }
  // Connect the last historical point to the predictions
  if (sortedHistDates.length > 0) {
    projectionDataset.push(parseFloat(historical[sortedHistDates[sortedHistDates.length - 1]]));
  }
  sortedPredDates.forEach(date => {
    projectionDataset.push(parseFloat(predictions[date]));
  });

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Pendapatan Riil (Lunas)',
        data: historicalDataset,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 3,
        tension: 0.2,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 3,
        fill: true,
      },
      {
        label: 'Proyeksi Pendapatan (Linear Regression)',
        data: projectionDataset,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        borderWidth: 3,
        borderDash: [6, 6],
        tension: 0.2,
        pointBackgroundColor: '#f59e0b',
        pointRadius: 3,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 11,
            weight: 'bold'
          },
          boxWidth: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw;
            if (val === null || val === undefined) return '';
            return `${context.dataset.label}: ${formatPrice(val)}`;
          }
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
            size: 9
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
            size: 9
          }
        }
      }
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Prediksi & Analisis Pendapatan</h1>
          <p className="text-gray-500 text-sm">Proyeksikan pertumbuhan omset laundry menggunakan kecerdasan model Linear Regression.</p>
        </div>

        {/* Insufficient Data Warning Banner */}
        {isInsufficient && (
          <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl flex items-start space-x-4">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-400 shrink-0">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-amber-800 dark:text-amber-300 text-sm">Data Transaksi Belum Cukup</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed">
                {data.status} Minimal dibutuhkan catatan transaksi berstatus <strong>LUNAS</strong> yang tersebar di minimal <strong>3 hari berbeda</strong> untuk memproyeksikan slope regresi secara akurat.
              </p>
              <div className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold flex items-center pt-1">
                <FiInfo className="mr-1" /> Silakan tambahkan transaksi baru dengan status LUNAS pada tanggal yang berbeda untuk membuka fitur ini.
              </div>
            </div>
          </div>
        )}

        {/* Projection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 7 Days Prediction Card */}
          <div className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Proyeksi Pendapatan 7 Hari</span>
                <p className="text-xs text-gray-400">Estimasi total omset lunas seminggu kedepan</p>
              </div>
              <div className="p-3 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 rounded-2xl text-primary-500">
                <FiTrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-3xl font-black text-primary-500">
                {isInsufficient ? 'N/A' : formatPrice(data?.prediction7Days)}
              </h3>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-500 mt-2">
                {isInsufficient ? 'Butuh lebih banyak data' : '✓ Model Terkalibrasi'}
              </span>
            </div>
            {/* Design Watermarks */}
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.03] dark:opacity-[0.02]">
              <FiTrendingUp className="w-40 h-40" />
            </div>
          </div>

          {/* 30 Days Prediction Card */}
          <div className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Proyeksi Pendapatan 30 Hari</span>
                <p className="text-xs text-gray-400">Estimasi total omset lunas sebulan kedepan</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl text-amber-500">
                <FiTrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-3xl font-black text-amber-500">
                {isInsufficient ? 'N/A' : formatPrice(data?.prediction30Days)}
              </h3>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-500 mt-2">
                {isInsufficient ? 'Butuh lebih banyak data' : '✓ Model Terkalibrasi'}
              </span>
            </div>
            {/* Design Watermarks */}
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.03] dark:opacity-[0.02]">
              <FiCalendar className="w-40 h-40" />
            </div>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-955 dark:text-white text-base mb-4 flex items-center">
            <FiTrendingUp className="mr-2 text-primary-500" />
            Tren Pendapatan & Proyeksi Linear
          </h3>
          <div className="h-80">
            {allLabels.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Belum ada data pendapatan historis untuk diplot
              </div>
            )}
          </div>
        </div>

        {/* Explanation Card */}
        <div className="bg-white dark:bg-darkbg-dark p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center">
            <FiInfo className="mr-2 text-primary-500" /> Bagaimana Prediksi Dihitung?
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Sistem menggunakan metode statistika **Linear Regression** (Regresi Linear Sederhana) yang memetakan waktu transaksi (hari ke-1 sampai ke-30) sebagai variabel independen (*X*), dan total pendapatan harian dari order laundry berstatus **LUNAS** sebagai variabel dependen (*Y*). Model akan menghitung kemiringan garis tren (*slope*) dan titik potong (*intercept*) guna memproyeksikan omset harian untuk periode 7 dan 30 hari ke depan.
          </p>
        </div>

      </div>
    </SidebarLayout>
  );
};

export default Predictions;
