import React, { useEffect, useState } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import API from '../../services/api';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiX, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
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

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/customers', { params: { search } });
      setCustomers(response.data);
    } catch (error) {
      showToast('Gagal memuat data pelanggan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleOpenAdd = () => {
    setFormData({ name: '', phone: '', address: '', email: '' });
    setSelectedCustomer(null);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email,
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenDetail = async (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
    setOrdersLoading(true);
    try {
      const response = await API.get('/api/orders');
      const filtered = response.data.filter(o => o.customer_id === customer.id);
      setCustomerOrders(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      if (selectedCustomer) {
        await API.put(`/api/customers/${selectedCustomer.id}`, formData);
        showToast('Data pelanggan berhasil diperbarui');
      } else {
        await API.post('/api/customers', formData);
        showToast('Pelanggan baru berhasil ditambahkan');
      }
      setShowFormModal(false);
      fetchCustomers();
    } catch (error) {
      if (error.response && error.response.data && typeof error.response.data.detail === 'string') {
        showToast(error.response.data.detail, 'error');
      } else if (error.response && error.response.data) {
        showToast('Terjadi kesalahan saat menyimpan data', 'error');
        setFormErrors(error.response.data);
      } else {
        showToast('Terjadi kesalahan koneksi', 'error');
      }
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await API.delete(`/api/customers/${selectedCustomer.id}`);
      showToast('Pelanggan berhasil dihapus');
      setShowDeleteModal(false);
      fetchCustomers();
    } catch (error) {
      showToast('Gagal menghapus pelanggan', 'error');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Manajemen Pelanggan</h1>
            <p className="text-gray-500 text-sm">Kelola profil pelanggan dan data alamat pengiriman laundry.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/20 glow-button transition-all"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tambah Pelanggan</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 px-4 py-3 rounded-2xl max-w-md shadow-sm">
          <FiSearch className="text-gray-400 w-5 h-5 mr-3" />
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama/email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6">Nomor HP</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Alamat</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-44" /></td>
                      <td className="py-4 px-6 flex justify-center space-x-2"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" /></td>
                    </tr>
                  ))
                ) : currentItems.length > 0 ? (
                  currentItems.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-955 dark:text-white">{c.name}</td>
                      <td className="py-4 px-6 text-gray-500">{c.phone || '-'}</td>
                      <td className="py-4 px-6 text-gray-500">{c.email}</td>
                      <td className="py-4 px-6 text-gray-500 max-w-xs truncate">{c.address || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleOpenDetail(c)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-colors"
                            title="Detail"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(c)}
                            className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(c)}
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
                    <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">Tidak ada data pelanggan found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, customers.length)} dari {customers.length} pelanggan
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-darkbg-dark rounded-3xl shadow-2xl p-6 border border-gray-150 dark:border-gray-850 space-y-6"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">
                    {selectedCustomer ? 'Edit Profil Pelanggan' : 'Tambah Pelanggan Baru'}
                  </h3>
                  <button onClick={() => setShowFormModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nomor HP / Whatsapp</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Pelanggan</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
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
                      Simpan Data
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Detail Customer */}
        <AnimatePresence>
          {showDetailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-darkbg-dark rounded-3xl shadow-2xl p-6 border border-gray-150 dark:border-gray-850 space-y-6"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">Detail Profil Pelanggan</h3>
                  <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Nama Lengkap</p>
                      <p className="font-bold text-gray-800 dark:text-white mt-0.5">{selectedCustomer?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Nomor HP</p>
                      <p className="font-semibold text-gray-800 dark:text-white mt-0.5">{selectedCustomer?.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Email</p>
                      <p className="font-semibold text-gray-800 dark:text-white mt-0.5">{selectedCustomer?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Alamat Lengkap</p>
                      <p className="text-gray-600 dark:text-gray-300 mt-0.5">{selectedCustomer?.address || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Orders History */}
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-extrabold text-base text-gray-950 dark:text-white">Riwayat Transaksi Laundry</h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-150 dark:border-gray-800 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 text-gray-400 uppercase font-semibold">
                        <tr>
                          <th className="py-3 px-4">Nomor Nota</th>
                          <th className="py-3 px-4">Layanan</th>
                          <th className="py-3 px-4">Berat</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-gray-650 dark:text-gray-300">
                        {ordersLoading ? (
                          <tr>
                            <td colSpan="5" className="py-4 text-center"><FiLoader className="w-5 h-5 animate-spin mx-auto text-primary-500" /></td>
                          </tr>
                        ) : customerOrders.length > 0 ? (
                          customerOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                              <td className="py-3 px-4 font-bold text-gray-950 dark:text-white">{o.invoice_number}</td>
                              <td className="py-3 px-4">{o.service_name}</td>
                              <td className="py-3 px-4">{o.weight} Kg</td>
                              <td className="py-3 px-4 font-semibold text-primary-500">{formatPrice(o.total_price)}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  o.laundry_status === 'SUDAH_DIAMBIL' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                }`}>
                                  {o.laundry_status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-4 text-center text-gray-400">Belum ada riwayat transaksi</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Confirm Delete */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white dark:bg-darkbg-dark rounded-3xl shadow-2xl p-6 border border-gray-150 dark:border-gray-800 space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hapus Pelanggan</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus pelanggan <strong>{selectedCustomer?.name}</strong>? Tindakan ini akan menghapus data permanen.
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
                    Hapus
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center space-x-2 text-sm font-semibold ${
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

export default Customers;
