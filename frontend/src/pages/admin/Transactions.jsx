import React, { useEffect, useState } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import API from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiPrinter, 
  FiX, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Transactions = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    weight: '',
    paymentStatus: 'BELUM_BAYAR',
    paymentMethod: 'CASH',
    laundryStatus: 'DITERIMA',
    notes: ''
  });

  const [statusData, setStatusData] = useState({
    laundryStatus: '',
    paymentStatus: '',
    paymentMethod: 'CASH'
  });

  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/orders', { params: { search } });
      setOrders(response.data);
    } catch (error) {
      showToast('Gagal memuat transaksi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const custRes = await API.get('/api/customers');
      setCustomers(custRes.data);
      
      const svcRes = await API.get('/api/services');
      // Only show active services for creating new transactions
      setServices(svcRes.data.filter(s => s.is_active));
    } catch (error) {
      console.error('Failed to load metadata', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMetadata();
  }, [search]);

  const handleOpenAdd = () => {
    setFormData({
      customerId: '',
      serviceId: '',
      weight: '',
      paymentStatus: 'BELUM_BAYAR',
      paymentMethod: 'CASH',
      laundryStatus: 'DITERIMA',
      notes: ''
    });
    setSelectedOrder(null);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenEdit = (order) => {
    setSelectedOrder(order);
    setFormData({
      customerId: order.customer_id.toString(),
      serviceId: order.service_id.toString(),
      weight: order.weight.toString(),
      paymentStatus: order.paymentStatus,
      paymentMethod: 'CASH', // default
      laundryStatus: order.laundry_status,
      notes: order.notes || ''
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenStatus = (order) => {
    setSelectedOrder(order);
    setStatusData({
      laundryStatus: order.laundryStatus || order.laundry_status,
      paymentStatus: order.paymentStatus || order.payment_status,
      paymentMethod: 'CASH'
    });
    setShowStatusModal(true);
  };

  const handleOpenPrint = (order) => {
    setSelectedOrder(order);
    setShowPrintModal(true);
  };

  const handleOpenDelete = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      customer_id: parseInt(formData.customerId, 10),
      service_id: parseInt(formData.serviceId, 10),
      weight: parseFloat(formData.weight),
      payment_status: formData.paymentStatus,
      payment_method: formData.paymentMethod,
      laundry_status: formData.laundryStatus,
      notes: formData.notes
    };

    try {
      if (selectedOrder) {
        await API.put(`/api/orders/${selectedOrder.id}`, payload);
        showToast('Transaksi berhasil diperbarui');
      } else {
        await API.post('/api/orders', payload);
        showToast('Transaksi laundry berhasil dibuat');
      }
      setShowFormModal(false);
      fetchOrders();
    } catch (error) {
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        showToast('Terjadi kesalahan sistem', 'error');
      }
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/api/orders/${selectedOrder.id}/status`, null, {
        params: { status_str: statusData.laundryStatus }
      });
      await API.put(`/api/orders/${selectedOrder.id}/payment`, null, {
        params: { 
          status_str: statusData.paymentStatus,
          method: statusData.paymentMethod 
        }
      });
      showToast('Status transaksi berhasil diperbarui');
      setShowStatusModal(false);
      fetchOrders();
    } catch (error) {
      showToast('Gagal merubah status', 'error');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await API.delete(`/api/orders/${selectedOrder.id}`);
      showToast('Transaksi berhasil dihapus');
      setShowDeleteModal(false);
      fetchOrders();
    } catch (error) {
      showToast('Gagal menghapus transaksi', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Preview Price inside form
  const getPreviewPrice = () => {
    if (!formData.serviceId || !formData.weight) return 0;
    const selectedSvc = services.find(s => s.id === parseInt(formData.serviceId, 10));
    if (!selectedSvc) return 0;
    const weight = parseFloat(formData.weight);
    if (isNaN(weight)) return 0;
    return weight * parseFloat(selectedSvc.price_per_kg);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const trackingLink = selectedOrder 
    ? `${window.location.origin}/track/${selectedOrder.invoiceNumber}` 
    : '';

  return (
    <SidebarLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Manajemen Transaksi</h1>
            <p className="text-gray-500 text-sm">Kelola order laundry, notes, dan print invoice ber-QR Code.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/20 glow-button transition-all"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tambah Transaksi</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 px-4 py-3 rounded-2xl max-w-md shadow-sm no-print">
          <FiSearch className="text-gray-400 w-5 h-5 mr-3" />
          <input
            type="text"
            placeholder="Cari nomor nota atau nama pelanggan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Nota</th>
                  <th className="py-4 px-6">Pelanggan</th>
                  <th className="py-4 px-6">Layanan</th>
                  <th className="py-4 px-6">Berat</th>
                  <th className="py-4 px-6">Total Harga</th>
                  <th className="py-4 px-6">Status Cucian</th>
                  <th className="py-4 px-6">Pembayaran</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                      <td className="py-4 px-6 flex justify-center space-x-2"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" /></td>
                    </tr>
                  ))
                ) : currentItems.length > 0 ? (
                  currentItems.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-955 dark:text-white">{o.invoice_number}</td>
                      <td className="py-4 px-6 text-gray-800 dark:text-gray-200">{o.customer_name}</td>
                      <td className="py-4 px-6 text-gray-500">{o.service_name}</td>
                      <td className="py-4 px-6 text-gray-500 font-medium">{o.weight} Kg</td>
                      <td className="py-4 px-6 font-bold text-primary-500">{formatPrice(o.total_price)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          o.laundry_status === 'SUDAH_DIAMBIL' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                          o.laundry_status === 'SIAP_DIAMBIL' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' :
                          'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        }`}>
                          {o.laundry_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          o.payment_status === 'LUNAS' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-1">
                          <button 
                            onClick={() => handleOpenStatus(o)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-colors"
                            title="Update Status"
                          >
                            <FiRefreshCw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenPrint(o)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-colors"
                            title="Cetak Nota"
                          >
                            <FiPrinter className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(o)}
                            className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(o)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-400 text-sm">Tidak ada data transaksi found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, orders.length)} dari {orders.length} transaksi
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold px-3 text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Form (Add / Edit) */}
        <AnimatePresence>
          {showFormModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-darkbg-dark rounded-3xl shadow-2xl p-6 border border-gray-150 dark:border-gray-850 space-y-6"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-extrabold text-gray-955 dark:text-white">
                    {selectedOrder ? 'Edit Transaksi Laundry' : 'Buat Transaksi Baru'}
                  </h3>
                  <button onClick={() => setShowFormModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Select Customer */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pilih Pelanggan</label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white"
                    >
                      <option value="">-- Pilih Pelanggan --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Service */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pilih Paket Layanan</label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white"
                    >
                      <option value="">-- Pilih Layanan --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.service_name} - {formatPrice(s.price_per_kg)} / Kg</option>
                      ))}
                    </select>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Berat Cucian (Kg)</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="Contoh: 3.5"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Pricing Preview */}
                  <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 flex justify-between items-center">
                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">Estimasi Total Biaya:</span>
                    <span className="text-2xl font-extrabold text-primary-500">{formatPrice(getPreviewPrice())}</span>
                  </div>

                  {/* Payment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Pembayaran</label>
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white"
                      >
                        <option value="BELUM_BAYAR">BELUM BAYAR</option>
                        <option value="LUNAS">LUNAS</option>
                      </select>
                    </div>

                    {formData.paymentStatus === 'LUNAS' && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Metode Bayar</label>
                        <select
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white"
                        >
                          <option value="CASH">CASH (TUNAI)</option>
                          <option value="TRANSFER">BANK TRANSFER</option>
                          <option value="E-WALLET">E-WALLET</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Catatan Transaksi</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Masukkan catatan cucian (opsional)..."
                      rows="2"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      type="button" 
                      onClick={() => setShowFormModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm glow-button"
                    >
                      Simpan Order
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Update Status */}
        <AnimatePresence>
          {showStatusModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-darkbg-dark rounded-3xl shadow-2xl p-6 border border-gray-150 dark:border-gray-850 space-y-6"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-extrabold text-gray-955 dark:text-white">Update Status Transaksi</h3>
                  <button onClick={() => setShowStatusModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleStatusSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Laundry</label>
                    <select
                      value={statusData.laundryStatus}
                      onChange={(e) => setStatusData({ ...statusData, laundryStatus: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white font-semibold"
                    >
                      <option value="DITERIMA">DITERIMA (ANTREAN)</option>
                      <option value="DICUCI">DICUCI</option>
                      <option value="DISETRIKA">DISETRIKA</option>
                      <option value="SIAP_DIAMBIL">SIAP DIAMBIL</option>
                      <option value="SUDAH_DIAMBIL">SUDAH DIAMBIL / SELESAI</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Pembayaran</label>
                    <select
                      value={statusData.paymentStatus}
                      disabled={selectedOrder?.payment_status === 'LUNAS'}
                      onChange={(e) => setStatusData({ ...statusData, paymentStatus: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white font-semibold"
                    >
                      <option value="BELUM_BAYAR">BELUM BAYAR</option>
                      <option value="LUNAS">LUNAS</option>
                    </select>
                  </div>

                  {statusData.paymentStatus === 'LUNAS' && selectedOrder?.payment_status === 'BELUM_BAYAR' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Metode Pembayaran</label>
                      <select
                        value={statusData.paymentMethod}
                        onChange={(e) => setStatusData({ ...statusData, paymentMethod: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none text-gray-900 dark:text-white font-semibold"
                      >
                        <option value="CASH">CASH (TUNAI)</option>
                        <option value="TRANSFER">BANK TRANSFER</option>
                        <option value="E-WALLET">E-WALLET</option>
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      type="button" 
                      onClick={() => setShowStatusModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm glow-button"
                    >
                      Perbarui Status
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Cetak Nota (Invoice Layout) */}
        <AnimatePresence>
          {showPrintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl bg-white text-gray-900 rounded-3xl shadow-2xl p-6 space-y-6 max-h-[95vh] overflow-y-auto animate-float-slow"
              >
                {/* Print area container */}
                <div id="print-area" className="p-6 bg-white border border-gray-200 rounded-2xl shadow-inner space-y-6 text-gray-900 text-sm leading-relaxed">
                  
                  {/* Header Nota */}
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center space-x-2 text-2xl font-black">
                      <span>🧼</span>
                      <span className="text-primary-600">WASHIFY</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Laundry Management System</p>
                    <p className="text-[10px] text-gray-400">Jl. Cihampelas No. 123, Bandung | Telp: +62 812-3456-7890</p>
                  </div>

                  <hr className="border-t-2 border-dashed border-gray-200" />

                  {/* Transaction Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p><span className="text-gray-400 font-semibold">No. Nota:</span> <strong className="text-gray-900 font-black">{selectedOrder?.invoice_number}</strong></p>
                      <p><span className="text-gray-400 font-semibold">Pelanggan:</span> <strong className="text-gray-900 font-bold">{selectedOrder?.customer_name}</strong></p>
                      <p><span className="text-gray-400 font-semibold">No. HP:</span> <span className="text-gray-700 font-medium">{selectedOrder?.customer_phone || '-'}</span></p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p><span className="text-gray-400 font-semibold">Tanggal Masuk:</span> <strong className="text-gray-900 font-bold">{formatDate(selectedOrder?.entry_date)}</strong></p>
                      <p><span className="text-gray-400 font-semibold">Status Cuci:</span> <span className="font-bold text-amber-500 uppercase">{selectedOrder?.laundry_status.replace('_', ' ')}</span></p>
                      <p><span className="text-gray-400 font-semibold">Pembayaran:</span> <span className="font-bold text-emerald-500 uppercase">{selectedOrder?.payment_status}</span></p>
                    </div>
                  </div>

                  <hr className="border-t border-gray-150" />

                  {/* Order Details Table */}
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase font-semibold">
                        <th className="py-2">Paket Layanan</th>
                        <th className="py-2 text-center">Harga / Kg</th>
                        <th className="py-2 text-center">Berat</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-semibold text-gray-800">
                        <td className="py-3">{selectedOrder?.service_name}</td>
                        <td className="py-3 text-center">{formatPrice(selectedOrder?.price_per_kg)}</td>
                        <td className="py-3 text-center">{selectedOrder?.weight} Kg</td>
                        <td className="py-3 text-right text-primary-600 font-extrabold">{formatPrice(selectedOrder?.total_price)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {selectedOrder?.notes && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500">
                      <strong>Catatan:</strong> {selectedOrder.notes}
                    </div>
                  )}

                  <hr className="border-t border-gray-150" />

                  {/* Summary Totals & QR Code */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">QR Code Pelacakan</p>
                      <div className="p-2 border border-gray-100 rounded-xl bg-white inline-block shadow-sm">
                        <QRCodeSVG value={trackingLink} size={70} />
                      </div>
                    </div>
                    <div className="text-center sm:text-right space-y-1">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Total Pembayaran</p>
                      <p className="text-3xl font-black text-primary-500">{formatPrice(selectedOrder?.total_price)}</p>
                    </div>
                  </div>

                  <hr className="border-t-2 border-dashed border-gray-200" />

                  <div className="text-center space-y-1 text-[10px] text-gray-400 font-medium">
                    <p>Terima kasih telah menggunakan jasa kami!</p>
                    <p>Pakaian bersih, wangi, rapi, dan higienis.</p>
                  </div>
                </div>

                {/* Print Modal Footer Controls (no-print) */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-gray-800 no-print">
                  <button 
                    onClick={() => setShowPrintModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-md glow-button flex items-center space-x-2"
                  >
                    <FiPrinter />
                    <span>Cetak Nota / Save PDF</span>
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Confirm Delete no-print */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-darkbg-dark rounded-3xl shadow-2xl p-6 border border-gray-150 dark:border-gray-800 space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Batalkan / Hapus Transaksi</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus nota transaksi <strong>{selectedOrder?.invoice_number}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end space-x-3 pt-3">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleDeleteSubmit}
                    className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm"
                  >
                    Hapus Transaksi
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast no-print */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center space-x-2 text-sm font-semibold no-print ${
                toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/10' : 'bg-red-500 border-red-400 text-white shadow-red-500/10'
              }`}
            >
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </SidebarLayout>
  );
};

export default Transactions;
