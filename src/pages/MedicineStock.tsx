import { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
} from '../api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface MedicineRecord {
  ID?: string | number;
  MedicineID: string;
  MedicineName: string;
  Category: string;
  StockQuantity: number;
  UnitPrice?: number;
  ExpiryDate?: string;
}

export function MedicineStock() {
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicineRecord | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState({
    MedicineID: '',
    MedicineName: '',
    StockQuantity: 0,
    UnitPrice: 0.0,
    ExpiryDate: '',
    Category: 'Antibiotic'
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const medResponse = await fetchMedicines();
      setMedicines(medResponse?.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load medicine inventory';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formState.MedicineName.trim()) {
      toast.error('Medicine name is required.');
      return;
    }

    const payload = {
      MedicineID: formState.MedicineID || `MED-${Math.floor(1000 + Math.random() * 9000)}`,
      MedicineName: formState.MedicineName.trim(),
      StockQuantity: Number(formState.StockQuantity) || 0,
      UnitPrice: Number(formState.UnitPrice) || 0,
      ExpiryDate: formState.ExpiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Category: formState.Category || 'General'
    };

    try {
      setIsSaving(true);
      const res = await createMedicine(payload);
      const created = res?.data || payload;
      setMedicines((prev) => [created, ...prev]);
      toast.success(`Medicine ${created.MedicineName} added to inventory.`);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Unable to add medicine');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMed) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const targetId = selectedMed.ID ?? selectedMed.MedicineID;
    const payload = {
      MedicineID: selectedMed.MedicineID,
      MedicineName: (formData.get('MedicineName') as string || selectedMed.MedicineName).trim(),
      Category: (formData.get('Category') as string || selectedMed.Category).trim(),
      StockQuantity: parseInt(formData.get('StockQuantity') as string, 10) || 0,
      UnitPrice: parseFloat(formData.get('UnitPrice') as string) || 0,
      ExpiryDate: (formData.get('ExpiryDate') as string) || selectedMed.ExpiryDate
    };

    try {
      setIsSaving(true);
      const res = await updateMedicine(targetId, payload);
      const updated = res?.data || payload;
      setMedicines((prev) =>
        prev.map((m) => (m.MedicineID === selectedMed.MedicineID ? { ...m, ...updated } : m))
      );
      toast.success(`Updated stock for ${payload.MedicineName}`);
      setIsEditModalOpen(false);
      setSelectedMed(null);
    } catch (err: any) {
      toast.error(err.message || 'Unable to update medicine');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMed) return;
    const targetId = selectedMed.ID ?? selectedMed.MedicineID;
    try {
      setIsLoading(true);
      await deleteMedicine(targetId);
      setMedicines((prev) => prev.filter((m) => m.MedicineID !== selectedMed.MedicineID));
      toast.success(`Removed ${selectedMed.MedicineName} from inventory`);
      setIsConfirmDeleteOpen(false);
      setSelectedMed(null);
    } catch (err: any) {
      toast.error(err.message || 'Unable to delete medicine');
    } finally {
      setIsLoading(false);
    }
  };

  // Real inventory metrics
  const totalValuation = useMemo(() => {
    return medicines.reduce((sum, m) => sum + (Number(m.StockQuantity || 0) * Number(m.UnitPrice || 12.5)), 0);
  }, [medicines]);

  const lowStockItems = useMemo(() => {
    return medicines.filter((m) => Number(m.StockQuantity || 0) <= 15);
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return medicines;
    return medicines.filter((m) => {
      return (
        String(m.MedicineName || '').toLowerCase().includes(query) ||
        String(m.MedicineID || '').toLowerCase().includes(query) ||
        String(m.Category || '').toLowerCase().includes(query)
      );
    });
  }, [medicines, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Medicine Stock Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Central formulary database, stock levels, and procurement control.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              loadData();
              toast.success('Inventory re-synchronized with database.');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh Stock</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFormState({
                MedicineID: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
                MedicineName: '',
                StockQuantity: 50,
                UnitPrice: 10.0,
                ExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                Category: 'Antibiotic'
              });
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Table */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Stock Catalog</h2>
              <p className="text-xs text-slate-500">
                {filteredMedicines.length} of {medicines.length} SKUs available
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Medicine ID</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Name</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Category</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Qty</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Expiry</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Status</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => {
                  const qty = Number(med.StockQuantity) || 0;
                  const isLow = qty <= 15;
                  const isCritical = qty <= 5;
                  const status = isCritical ? 'Critical' : isLow ? 'Low Stock' : 'Stable';

                  return (
                    <tr key={med.MedicineID} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-mono font-bold text-blue-700">
                        {med.MedicineID}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold text-slate-900">
                          {med.MedicineName}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                          {med.Category || 'General'}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-sm font-bold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                        {qty}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">
                        {med.ExpiryDate ? String(med.ExpiryDate).split('T')[0] : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCritical
                              ? 'bg-red-100 text-red-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedMed(med);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit Stock / Details">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMed(med);
                            setIsConfirmDeleteOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete SKU">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {isLoading ? 'Loading pharmacy catalog...' : 'No medicines found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Inventory Health & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Inventory Health */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Inventory Health
            </h2>
            <div className="mb-2 flex justify-between items-end">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                Estimated Valuation
              </span>
              <span className="text-2xl font-bold text-slate-900">
                ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="bg-blue-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, (medicines.length / 50) * 100))}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                  Total SKUs
                </div>
                <div className="text-2xl font-bold text-slate-900">{medicines.length}</div>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <div className="text-[10px] font-bold text-rose-500 tracking-wider uppercase mb-1">
                  Low Stock
                </div>
                <div className="text-2xl font-bold text-rose-600">{lowStockItems.length}</div>
              </div>
            </div>
          </div>

          {/* Real Critical Low Stock Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Low Stock Alerts
              </h2>
              {lowStockItems.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                  Urgent ({lowStockItems.length})
                </span>
              )}
            </div>

            <div className="space-y-3">
              {lowStockItems.slice(0, 4).map((item) => (
                <div key={item.MedicineID} className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 flex items-start space-x-3">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {item.MedicineName}
                    </div>
                    <div className="text-xs text-rose-600 font-semibold mt-0.5">
                      Only {item.StockQuantity} units remaining
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMed(item);
                        setIsEditModalOpen(true);
                      }}
                      className="text-xs font-bold text-blue-700 hover:underline mt-1.5 inline-block">
                      Restock Units &rarr;
                    </button>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  All inventory stock levels are currently sufficient.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Medicine SKU to Formulary">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine ID</label>
            <input
              type="text"
              value={formState.MedicineID}
              onChange={(e) => setFormState({ ...formState, MedicineID: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine Name *</label>
            <input
              type="text"
              value={formState.MedicineName}
              onChange={(e) => setFormState({ ...formState, MedicineName: e.target.value })}
              placeholder="e.g. Amoxicillin 500mg"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
              <select
                value={formState.Category}
                onChange={(e) => setFormState({ ...formState, Category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="Antibiotic">Antibiotic</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Analgesic">Analgesic</option>
                <option value="Antiviral">Antiviral</option>
                <option value="Respiratory">Respiratory</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Stock Qty</label>
              <input
                type="number"
                min="0"
                value={formState.StockQuantity}
                onChange={(e) => setFormState({ ...formState, StockQuantity: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formState.UnitPrice}
                onChange={(e) => setFormState({ ...formState, UnitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
              <input
                type="date"
                value={formState.ExpiryDate}
                onChange={(e) => setFormState({ ...formState, ExpiryDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm">
              Save Medicine
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Medicine Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMed(null);
        }}
        title="Update Medicine & Stock Level">
        {selectedMed && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine Name</label>
              <input
                name="MedicineName"
                defaultValue={selectedMed.MedicineName}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <input
                  name="Category"
                  defaultValue={selectedMed.Category || 'General'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Quantity</label>
                <input
                  name="StockQuantity"
                  type="number"
                  min="0"
                  defaultValue={selectedMed.StockQuantity}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit Price ($)</label>
                <input
                  name="UnitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedMed.UnitPrice ?? 10}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                <input
                  name="ExpiryDate"
                  type="date"
                  defaultValue={selectedMed.ExpiryDate ? String(selectedMed.ExpiryDate).split('T')[0] : ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm">
                Update Stock
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setSelectedMed(null);
        }}
        onConfirm={handleDelete}
        title="Remove Medicine from Inventory"
        message={`Are you sure you want to delete ${selectedMed?.MedicineName} (${selectedMed?.MedicineID})? This action cannot be undone.`}
        confirmText="Delete SKU"
        confirmColor="red"
      />
    </div>
  );
}
