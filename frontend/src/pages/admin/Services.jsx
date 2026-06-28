import React, { useEffect, useState } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import API from '../../services/api';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiX, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Services = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [formData, setFormData] = useState({
    serviceName: '',
    pricePerKg: '',
    estimationDay: '',
    isActive: true
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

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/services', { params: { search } });
      setServices(response.data);
    } catch (error) {
      showToast('Gagal memuat data layanan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search]);

  const handleOpenAdd = () => {
    setFormData({ serviceName: '', pricePerKg: '', estimationDay: '', isActive: true });
    setSelectedService(null);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenEdit = (service) => {
    setSelectedService(service);
    setFormData({
      serviceName: service.service_name,
      pricePerKg: service.price_per_kg.toString(),
      estimationDay: service.estimation_day.toString(),
      isActive: service.is_active
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenDelete = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      service_name: formData.serviceName,
      price_per_kg: parseFloat(formData.pricePerKg),
      estimation_day: parseInt(formData.estimationDay, 10),
      is_active: formData.isActive
    };

    try {
      if (selectedService) {
        await API.put(`/api/services/${selectedService.id}`, payload);
        showToast('Layanan berhasil diperbarui');
      } else {
        await API.post('/api/services', payload);
        showToast('Layanan baru berhasil dibuat');
      }
      setShowFormModal(false);
      fetchServices();
    } catch (error) {
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        showToast('Terjadi kesalahan sistem', 'error');
      }
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await API.delete(`/api/services/${selectedService.id}`);
      showToast('Layanan berhasil dihapus');
      setShowDeleteModal(false);
      fetchServices();
    } catch (error) {
      showToast('Gagal menghapus layanan', 'error');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(services.length / itemsPerPage);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Manajemen Layanan</h1>
            <p className="text-gray-500 text-sm">Kelola paket layanan laundry, harga per Kg, dan estimasi selesai.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/20 glow-button transition-all"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tambah Layanan</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 px-4 py-3 rounded-2xl max-w-md shadow-sm">
          <FiSearch className="text-gray-400 w-5 h-5 mr-3" />
          <input
            type="text"
            placeholder="Cari paket layanan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-darkbg-dark border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Paket Layanan</th>
                  <th className="py-4 px-6">Harga Per Kg</th>
                  <th className="py-4 px-6">Estimasi Pengerjaan</th>
                  <th className="py-4 px-6">Status Keaktifan</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                      <td className="py-4 px-6 flex justify-center space-x-2"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" /></td>
                    </tr>
                  ))
                ) : currentItems.length > 0 ? (
                  currentItems.map((svc) => (
                    <tr key={svc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-955 dark:text-white">{svc.service_name}</td>
                      <td className="py-4 px-6 font-bold text-primary-500">{formatPrice(svc.price_per_kg)}</td>
                      <td className="py-4 px-6 text-gray-500">{svc.estimation_day} Hari</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          svc.is_active ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                        }`}>
                          {svc.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleOpenEdit(svc)}
                            className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(svc)}
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
                    <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">Tidak ada data paket layanan found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, services.length)} dari {services.length} layanan
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
                className="w-full max-w-md bg-white dark:bg-darkbg-dark rounded-3xl shadow-2xl p-6 border border-gray-150 dark:border-gray-850 space-y-6"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-extrabold text-gray-955 dark:text-white">
                    {selectedService ? 'Edit Layanan Laundry' : 'Tambah Layanan Baru'}
                  </h3>
                  <button onClick={() => setShowFormModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama Layanan / Paket</label>
                    <input
                      type="text"
                      required
                      value={formData.serviceName}
                      onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                      placeholder="Contoh: Cuci Setrika Express"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.service_name && <p className="text-xs text-red-500">{formErrors.service_name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Harga per Kg (IDR)</label>
                    <input
                      type="number"
                      required
                      value={formData.pricePerKg}
                      onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                      placeholder="Contoh: 8000"
                      min="0"
                      step="500"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.price_per_kg && <p className="text-xs text-red-500">{formErrors.price_per_kg}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimasi Waktu Selesai (Hari)</label>
                    <input
                      type="number"
                      required
                      value={formData.estimationDay}
                      onChange={(e) => setFormData({ ...formData, estimationDay: e.target.value })}
                      placeholder="Contoh: 2"
                      min="1"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.estimation_day && <p className="text-xs text-red-500">{formErrors.estimation_day}</p>}
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary-500 focus:ring-primary-400 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none">
                      Layanan Ini Aktif
                    </label>
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
                      Simpan Layanan
                    </button>
                  </div>
                </form>
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hapus Layanan</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus paket layanan <strong>{selectedService?.service_name}</strong>? Tindakan ini tidak dapat dibatalkan.
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

export default Services;
