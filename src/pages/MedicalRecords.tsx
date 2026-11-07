import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Eye, Edit, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import {
  fetchMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  fetchPatients
} from '../api';

export function MedicalRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pResp, rResp] = await Promise.all([fetchPatients(), fetchMedicalRecords()]);
        setPatients(pResp?.data || []);
        setRecords(rResp?.data || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load medical records');
      }
    };
    load();
  }, []);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      return (
        String(r.RecordID).toLowerCase().includes(q) ||
        String(r.PatientID).toLowerCase().includes(q) ||
        String(r.Diagnosis || '').toLowerCase().includes(q)
      );
    });
  }, [records, searchQuery]);

  const openAdd = () => {
    (async () => {
      // ensure patient list is loaded when adding a new record
      if (!patients || patients.length === 0) {
        try {
          const pResp = await fetchPatients();
          setPatients(pResp?.data || []);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Unable to load patients');
        }
      }
      setSelectedRecord(null);
      setIsEditing(false);
      setIsModalOpen(true);
    })();
  };

  const openEdit = (record: any) => {
    setSelectedRecord(record);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openView = (record: any) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  const confirmDelete = (record: any) => {
    setSelectedRecord(record);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      await deleteMedicalRecord(selectedRecord.RecordID);
      setRecords((prev) => prev.filter((r) => r.RecordID !== selectedRecord.RecordID));
      toast.success('Medical record deleted');
      setIsConfirmOpen(false);
      setSelectedRecord(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete record');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      RecordID: isEditing && selectedRecord ? selectedRecord.RecordID : `MR-${Math.floor(1000 + Math.random() * 9000)}`,
      PatientID: (fd.get('patientId') as string) || '',
      Diagnosis: (fd.get('diagnosis') as string) || '',
      TreatmentDetails: (fd.get('plan') as string) || null,
      RecordDate: (fd.get('recordDate') as string) || null
    };

    if (!payload.PatientID || !payload.Diagnosis) {
      toast.error('Patient and Diagnosis are required');
      return;
    }

    try {
      if (isEditing && selectedRecord) {
        const resp = await updateMedicalRecord(selectedRecord.RecordID, payload);
        setRecords((prev) => prev.map((r) => (r.RecordID === selectedRecord.RecordID ? resp.data : r)));
        toast.success('Medical record updated');
      } else {
        const resp = await createMedicalRecord(payload);
        setRecords((prev) => [resp.data, ...prev]);
        toast.success('Medical record created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-sm text-slate-500 mt-1">Centralized diagnosis, treatment, and consultation history.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by patient ID, record ID, diagnosis..."
              aria-label="Search medical records"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm"
            />
          </div>
          <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Medical Record</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-9 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Record ID</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Patient</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Diagnosis</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Treatment</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.RecordID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono font-bold text-blue-700">{record.RecordID}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-slate-900">{record.PatientID}</div>
                      <div className="text-xs text-slate-500">Patient</div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-700">{record.Diagnosis}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{(record.TreatmentDetails || '').slice(0, 60)}</td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button onClick={() => openView(record)} className="p-1.5 text-slate-400 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(record)} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => confirmDelete(record)} className="p-1.5 text-slate-400 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-slate-400" />
              Recent Lab Links
            </h2>
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-900">CBC Panel — Normal</div>
                <div className="text-xs text-slate-500 mt-1">Johnathan Doe • Today</div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="text-sm font-bold text-red-700">HbA1c — 7.8% (High)</div>
                <div className="text-xs text-red-500 mt-1">Michael Chang • Yesterday</div>
              </div>
            </div>
            <button onClick={() => navigate('/laboratory')} className="w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center">
              <span>View in Laboratory</span>
              <ExternalLink className="w-3.5 h-3.5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Medical Record' : 'New Medical Record'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Patient <span className="text-red-500">*</span></label>
            <select name="patientId" title="Patient" required defaultValue={selectedRecord?.PatientID || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
              <option value="">Select Patient...</option>
              {patients.map((p) => (
                <option key={p.PatientID} value={p.PatientID}>{(p.FirstName && p.LastName) ? `${p.FirstName} ${p.LastName}` : p.name} ({p.PatientID})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Record Date</label>
            <input name="recordDate" title="Record Date" type="date" defaultValue={selectedRecord?.RecordDate ? String(selectedRecord.RecordDate).slice(0, 10) : new Date().toISOString().slice(0, 10)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Diagnosis <span className="text-red-500">*</span></label>
            <input name="diagnosis" title="Diagnosis" placeholder="Diagnosis" type="text" required defaultValue={selectedRecord?.Diagnosis || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Treatment Plan</label>
            <textarea name="plan" title="Treatment Plan" placeholder="Treatment plan or details" rows={3} defaultValue={selectedRecord?.TreatmentDetails || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Prescribed Medicines</label>
            <div className="text-sm text-slate-500">This view is simplified to match the current MEDICAL_RECORD schema.</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Consultation Notes</label>
            <div className="text-sm text-slate-500">Notes are not persisted until the database schema includes a dedicated field.</div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800">{isEditing ? 'Update Medical Record' : 'Save Medical Record'}</button>
          </div>
        </form>
      </Modal>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Record Details">
        {selectedRecord && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Record ID</div>
              <div className="font-mono font-bold text-blue-700">{selectedRecord.RecordID}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Patient ID</div>
              <div className="font-bold text-slate-900">{selectedRecord.PatientID}</div>
              <button onClick={() => navigate('/patients')} className="text-xs font-medium text-blue-700 hover:underline mt-1">View Patient Profile →</button>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Diagnosis</div>
              <div className="font-medium text-slate-900">{selectedRecord.Diagnosis}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Record Date</div>
              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedRecord.RecordDate || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Treatment Details</div>
              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedRecord.TreatmentDetails || 'None specified'}</div>
            </div>
            <div className="pt-6">
              <button onClick={() => { setIsDrawerOpen(false); openEdit(selectedRecord); }} className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Edit Record</button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} title="Delete medical record" message={`Are you sure you want to delete record ${selectedRecord?.RecordID}? This action cannot be undone.`} />
    </div>
  );
}
