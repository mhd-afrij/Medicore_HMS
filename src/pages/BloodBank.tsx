import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { initialStaff } from '../data/mockData';
import { fetchBloodBankEntries, createBloodBankEntry, fetchPatients, fetchBloodTransfusions, createBloodTransfusion } from '../api';
import { Modal } from '../components/Modal';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function BloodBank() {
  const [bloodEntries, setBloodEntries] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [transfusions, setTransfusions] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [bloodResp, patientsResp, transfusionsResp] = await Promise.all([
          fetchBloodBankEntries(),
          fetchPatients(),
          fetchBloodTransfusions()
        ]);
        setBloodEntries(bloodResp?.data || []);
        setPatients(patientsResp?.data || []);
        setTransfusions(transfusionsResp?.data || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load blood bank data');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const stock = useMemo(() => {
    const totals: Record<string, number> = {};
    bloodGroups.forEach((group) => {
      totals[group] = 0;
    });

    bloodEntries.forEach((entry) => {
      const group = String(entry.BloodGroup || '').trim();
      const units = Number(entry.AvailableUnits || 0);
      if (group && !Number.isNaN(units)) {
        totals[group] = (totals[group] || 0) + units;
      }
    });

    return bloodGroups.map((group) => {
      const units = totals[group] || 0;
      return {
        group,
        units,
        status: units > 15 ? 'Sufficient' : units > 5 ? 'Low' : 'Critical'
      };
    });
  }, [bloodEntries]);

  const handleAddStock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const group = String(formData.get('group') || '').trim();
    const units = parseInt(String(formData.get('availableUnits') || '0'), 10) || 0;
    const donorName = String(formData.get('donorName') || '').trim();
    const collectionDate = String(formData.get('collectionDate') || '').trim();
    const expiryDate = String(formData.get('expiryDate') || '').trim();

    if (!group || units <= 0 || !donorName || !collectionDate || !expiryDate) {
      toast.error('Please provide valid blood group, available units, donor name and dates.');
      return;
    }

    const payload = {
      BloodGroup: group,
      AvailableUnits: units,
      DonorName: donorName,
      CollectionDate: collectionDate,
      ExpiryDate: expiryDate
    };

    try {
      const response = await createBloodBankEntry(payload);
      setBloodEntries((prev) => [response.data, ...prev]);
      toast.success(`${units} unit(s) of ${group} registered to donor ${donorName}`);
      form.reset();
      setIsAddModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to add blood stock entry');
    }
  };

  const handleLogTransfusion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const patientId = String(formData.get('patientId') || '').trim();
    const patient = patients.find((p) => String(p.PatientID) === patientId);
    const group = String(formData.get('group') || '').trim();
    const units = parseInt(String(formData.get('units') || '0'), 10) || 0;
    const currentStock = stock.find((s) => s.group === group)?.units || 0;

    if (!patientId || !group || units <= 0) {
      toast.error('Please provide patient, blood group and units for the transfusion.');
      return;
    }

    if (units > currentStock) {
      toast.error('Insufficient stock for this blood group');
      return;
    }

    const payload = {
      patientId,
      bloodGroup: group,
      unitsGiven: units,
      doctorName: String(formData.get('adminBy') || 'Unknown'),
      transfusionDate: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await createBloodTransfusion(payload);
      const dbTransfusion = response?.data;
      setTransfusions([dbTransfusion, ...transfusions]);

      setBloodEntries((prev) => {
        let remaining = units;
        return prev.map((entry) => {
          if (remaining <= 0 || String(entry.BloodGroup || '').trim() !== group) {
            return entry;
          }
          const available = Number(entry.AvailableUnits || 0);
          if (available <= 0) {
            return entry;
          }
          const used = Math.min(available, remaining);
          remaining -= used;
          return {
            ...entry,
            AvailableUnits: available - used
          };
        });
      });

      toast.success(`Transfusion logged — ${units} unit(s) of ${group} used for ${patient?.FirstName || 'Unknown'}`);
      setIsLogModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to log transfusion');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sufficient':
        return 'bg-green-100 text-green-700';
      case 'Low':
        return 'bg-amber-100 text-amber-700';
      case 'Critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const criticalLowStock = stock.filter((s) => s.status === 'Critical' || s.status === 'Low');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blood Bank Management</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor blood stock levels and transfusion records.</p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            + Log Transfusion
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add Blood Unit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {stock.map((s) => (
          <div
            key={s.group}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col items-center justify-center text-center">
            <div className={`text-2xl font-bold mb-1 ${s.status === 'Critical' ? 'text-red-600' : 'text-slate-900'}`}>
              {s.group}
            </div>
            <div className="text-sm font-medium text-slate-600 mb-2">{s.units} units</div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(s.status)}`}>
              {s.status}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Blood Bank Inventory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Blood ID</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Group</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Units</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Donor</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Collected</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bloodEntries.map((entry) => (
                  <tr key={entry.BloodID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono font-bold text-slate-600">{entry.BloodID}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">{entry.BloodGroup}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-700">{entry.AvailableUnits}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{entry.DonorName || entry.DonorID}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{entry.CollectionDate}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{entry.ExpiryDate}</td>
                  </tr>
                ))}
                {bloodEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-sm text-slate-500">
                      {isLoading ? 'Loading blood bank inventory...' : 'No blood bank entries available.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Stock Alerts</h2>
            {criticalLowStock.length > 0 ? (
              <div className="space-y-3 mb-6">
                {criticalLowStock.map((s) => (
                  <div
                    key={s.group}
                    className={`p-4 rounded-xl border flex justify-between items-center ${s.status === 'Critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div>
                      <div className={`text-lg font-bold ${s.status === 'Critical' ? 'text-red-700' : 'text-amber-700'}`}>{s.group} Blood</div>
                      <div className={`text-xs font-medium ${s.status === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>Only {s.units} units remaining</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.status === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 mb-6">All blood groups have sufficient stock.</div>
            )}
            <button className="w-full py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors">Request Donation Drive</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Transfusion History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Transfusion ID</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Patient</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Blood Group</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Units</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Date</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Doctor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfusions.map((t: any) => (
                <tr key={t.TransfusionID || t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono font-bold text-slate-600">{t.TransfusionID}</td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-900">{t.PatientFirstName ? `${t.PatientFirstName} ${t.PatientLastName || ''}`.trim() : 'Unknown'}</td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-900">{t.BloodGroup}</td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-700">{t.UnitsGiven}</td>
                  <td className="py-4 px-6 text-sm text-slate-500">{t.TransfusionDate}</td>
                  <td className="py-4 px-6 text-sm text-slate-500">{t.DoctorName}</td>
                </tr>
              ))}
              {transfusions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-sm text-slate-500">
                    {isLoading ? 'Loading transfusion records...' : 'No transfusion records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Blood Unit">
        <form onSubmit={handleAddStock} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="group-add" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Blood Group <span className="text-red-500">*</span></label>
              <select
                id="group-add"
                name="group"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="available-units-add" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Available Units <span className="text-red-500">*</span></label>
              <input
                id="available-units-add"
                name="availableUnits"
                type="number"
                min="1"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
          </div>

          <div>
            <label htmlFor="donor-name-add" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Donor Name <span className="text-red-500">*</span></label>
            <input
              id="donor-name-add"
              name="donorName"
              type="text"
              required
              placeholder="Enter donor name"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="collection-date-add" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Collection Date <span className="text-red-500">*</span></label>
              <input
                id="collection-date-add"
                name="collectionDate"
                type="date"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
            <div>
              <label htmlFor="expiry-date-add" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Expiry Date <span className="text-red-500">*</span></label>
              <input
                id="expiry-date-add"
                name="expiryDate"
                type="date"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800">Add to Stock</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Transfusion">
        <form onSubmit={handleLogTransfusion} className="space-y-4">
          <div>
            <label htmlFor="patient-id-log" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Patient <span className="text-red-500">*</span></label>
            <select
              id="patient-id-log"
              name="patientId"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
              <option value="">Select Patient...</option>
              {patients.map((patient) => (
                <option key={patient.PatientID} value={patient.PatientID}>
                  {patient.PatientID} — {patient.FirstName} {patient.LastName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="group-log" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Blood Group <span className="text-red-500">*</span></label>
              <select
                id="group-log"
                name="group"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                {stock.map((s) => (
                  <option key={s.group} value={s.group}>
                    {s.group} — {s.units} units available
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="units-log" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Units Required <span className="text-red-500">*</span></label>
              <input
                id="units-log"
                name="units"
                type="number"
                min="1"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
          </div>
          <div>
            <label htmlFor="admin-by-log" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Administered By <span className="text-red-500">*</span></label>
            <select
              id="admin-by-log"
              name="adminBy"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
              {initialStaff
                .filter((s) => s.role === 'Nurse')
                .map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="notes-log" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Notes</label>
            <textarea
              id="notes-log"
              name="notes"
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none" />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800">Log Transfusion</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
