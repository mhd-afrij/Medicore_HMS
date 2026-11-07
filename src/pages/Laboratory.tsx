import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  fetchLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  fetchPatients,
  fetchDoctors
} from '../api';

export function Laboratory() {
  const [tests, setTests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tResp, pResp, dResp] = await Promise.all([fetchLabTests(), fetchPatients(), fetchDoctors()]);
        setTests(tResp?.data || []);
        setPatients(pResp?.data || []);
        setDoctors(dResp?.data || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load laboratory data');
      }
    };

    load();
  }, []);

  const filteredTests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter((t) => {
      return (
        String(t.TestID || '').toLowerCase().includes(q) ||
        String(t.TestType || '').toLowerCase().includes(q) ||
        String(t.PatientID || '').toLowerCase().includes(q) ||
        String(t.DoctorID || '').toLowerCase().includes(q) ||
        String(t.TechnicianName || '').toLowerCase().includes(q)
      );
    });
  }, [tests, searchQuery]);

  const openAdd = async () => {
    setSelectedTest(null);
    setIsEditing(false);
    if (!patients || patients.length === 0) {
      try {
        const pResp = await fetchPatients();
        setPatients(pResp?.data || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load patients');
      }
    }
    if (!doctors || doctors.length === 0) {
      try {
        const dResp = await fetchDoctors();
        setDoctors(dResp?.data || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load doctors');
      }
    }
    setIsModalOpen(true);
  };

  const openEdit = async (test: any) => {
    if (!patients || patients.length === 0) {
      try {
        const pResp = await fetchPatients();
        setPatients(pResp?.data || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load patients');
      }
    }
    if (!doctors || doctors.length === 0) {
      try {
        const dResp = await fetchDoctors();
        setDoctors(dResp?.data || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load doctors');
      }
    }
    setSelectedTest(test);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openView = (test: any) => {
    setSelectedTest(test);
    setIsDrawerOpen(true);
  };

  const confirmDelete = (test: any) => {
    setSelectedTest(test);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTest) return;
    try {
      await deleteLabTest(selectedTest.TestID);
      setTests((prev) => prev.filter((t) => t.TestID !== selectedTest.TestID));
      toast.success('Lab test deleted');
      setIsConfirmOpen(false);
      setSelectedTest(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete test');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      TestID: isEditing && selectedTest ? selectedTest.TestID : `LT-${Math.floor(1000 + Math.random() * 9000)}`,
      PatientID: (fd.get('patientId') as string) || '',
      DoctorID: (fd.get('doctorId') as string) || '',
      TestType: (fd.get('testType') as string) || '',
      RequestDate: (fd.get('requestDate') as string) || new Date().toISOString().split('T')[0],
      ResultDate: (fd.get('resultDate') as string) || null,
      ResultValue: (fd.get('resultValue') as string) || null,
      ReferenceRange: (fd.get('referenceRange') as string) || null,
      ResultFlag: (fd.get('resultFlag') as string) || null,
      Priority: (fd.get('priority') as string) || 'Routine',
      Status: (fd.get('status') as string) || 'Pending',
      TechnicianName: (fd.get('technicianName') as string) || null,
      Notes: (fd.get('notes') as string) || null
    };

    if (!payload.PatientID || !payload.DoctorID || !payload.TestType || !payload.RequestDate) {
      toast.error('PatientID, DoctorID, TestType, and RequestDate are required');
      return;
    }

    try {
      if (isEditing && selectedTest) {
        const resp = await updateLabTest(selectedTest.TestID, payload);
        setTests((prev) => prev.map((t) => (t.TestID === selectedTest.TestID ? resp.data : t)));
        toast.success('Lab test updated');
      } else {
        const resp = await createLabTest(payload);
        setTests((prev) => [resp.data, ...prev]);
        toast.success('Lab test created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save test');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Laboratory Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage lab test requests, results, and technicians.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by test, patient, doctor, or technician..."
              aria-label="Search lab tests"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm"
            />
          </div>
          <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Lab Test</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Test ID</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Test Type</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Patient</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Doctor</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTests.map((test) => (
                <tr key={test.TestID} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono font-bold text-blue-700">{test.TestID}</td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-900">{test.TestType}</td>
                  <td className="py-4 px-6 text-sm text-slate-700">{test.PatientID}</td>
                  <td className="py-4 px-6 text-sm text-slate-700">{test.DoctorID}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(test.Status)}`}>
                      {test.Status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-1">
                    <button onClick={() => openView(test)} className="p-1.5 text-slate-400 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50" title="View"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(test)} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(test)} className="p-1.5 text-slate-400 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Lab Test' : 'New Lab Test'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientId" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Patient ID <span className="text-red-500">*</span></label>
              <select id="patientId" name="patientId" title="Patient ID" required defaultValue={selectedTest?.PatientID || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="">Select Patient...</option>
                {patients.map((p) => (
                  <option key={p.PatientID} value={p.PatientID}>{p.PatientID}{p.FirstName ? ` - ${p.FirstName} ${p.LastName || ''}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doctorId" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Doctor ID <span className="text-red-500">*</span></label>
              <select id="doctorId" name="doctorId" title="Doctor ID" required defaultValue={selectedTest?.DoctorID || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="">Select Doctor...</option>
                {doctors.map((d) => (
                  <option key={d.DoctorID} value={d.DoctorID}>{d.DoctorID} - {d.FirstName} {d.LastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="testType" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Test Type <span className="text-red-500">*</span></label>
            <input id="testType" name="testType" title="Test Type" type="text" required defaultValue={selectedTest?.TestType || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="requestDate" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Request Date <span className="text-red-500">*</span></label>
              <input id="requestDate" name="requestDate" title="Request Date" type="date" required defaultValue={selectedTest?.RequestDate ? String(selectedTest.RequestDate).slice(0, 10) : new Date().toISOString().slice(0, 10)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
            <div>
              <label htmlFor="resultDate" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Result Date</label>
              <input id="resultDate" name="resultDate" title="Result Date" type="date" defaultValue={selectedTest?.ResultDate ? String(selectedTest.ResultDate).slice(0, 10) : ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
            <div>
              <label htmlFor="priority" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Priority</label>
              <select id="priority" name="priority" title="Priority" defaultValue={selectedTest?.Priority || 'Routine'} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Stat">Stat</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="resultValue" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Result Value</label>
            <input id="resultValue" name="resultValue" title="Result Value" type="text" defaultValue={selectedTest?.ResultValue || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
            <label htmlFor="referenceRange" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Reference Range</label>
            <input id="referenceRange" name="referenceRange" title="Reference Range" type="text" defaultValue={selectedTest?.ReferenceRange || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
            <div>
            <label htmlFor="resultFlag" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Result Flag</label>
            <select id="resultFlag" name="resultFlag" title="Result Flag" defaultValue={selectedTest?.ResultFlag || 'Normal'} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="technicianName" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Technician Name</label>
            <input id="technicianName" name="technicianName" title="Technician Name" type="text" defaultValue={selectedTest?.TechnicianName || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Status</label>
            <select id="status" name="status" title="Status" defaultValue={selectedTest?.Status || 'Pending'} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Notes</label>
            <textarea id="notes" name="notes" title="Notes" rows={3} defaultValue={selectedTest?.Notes || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none" />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800">{isEditing ? 'Update Lab Test' : 'Save Lab Test'}</button>
          </div>
        </form>
      </Modal>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Lab Test Details">
        {selectedTest && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Test ID</div>
              <div className="font-mono font-bold text-blue-700">{selectedTest.TestID}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Patient</div>
                <div className="font-bold text-slate-900">{selectedTest.PatientID}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Doctor</div>
                <div className="font-bold text-slate-900">{selectedTest.DoctorID}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Test Type</div>
              <div className="font-bold text-slate-900">{selectedTest.TestType}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Request Date</div>
                <div className="text-slate-700">{selectedTest.RequestDate ? String(selectedTest.RequestDate).slice(0, 10) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Result Date</div>
                <div className="text-slate-700">{selectedTest.ResultDate ? String(selectedTest.ResultDate).slice(0, 10) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Priority</div>
                <div className="text-slate-700">{selectedTest.Priority || 'Routine'}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Result Value</div>
              <div className="text-slate-700">{selectedTest.ResultValue || 'N/A'}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Reference Range</div>
                <div className="text-slate-700">{selectedTest.ReferenceRange || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Result Flag</div>
                <div className="text-slate-700">{selectedTest.ResultFlag || 'N/A'}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Technician</div>
              <div className="text-slate-700">{selectedTest.TechnicianName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Notes</div>
              <div className="text-slate-700">{selectedTest.Notes || 'None'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Status</div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(selectedTest.Status)}`}>
                {selectedTest.Status}
              </span>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} title="Delete lab test" message={`Are you sure you want to delete test ${selectedTest?.TestID}? This action cannot be undone.`} />
    </div>
  );
}
