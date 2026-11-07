import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, CheckCircle2, Phone, MapPin, Droplet, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { fetchPatients, createPatient, updatePatient, deletePatient } from '../api';
import { Modal } from '../components/Modal';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface PatientRecord {
  ID?: number | string;
  PatientID: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DateOfBirth: string;
  ContactNo: string;
  Address: string;
  BloodGroup: string;
}

export function Patients() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'register'>('directory');
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Drawers state
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [generatedId, setGeneratedId] = useState(
    () => `PT-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetchPatients();
      setPatients(response.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Unable to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newPatient: PatientRecord = {
      PatientID: (formData.get('patientId') as string) || generatedId,
      FirstName: (formData.get('firstName') as string || '').trim() || 'Unknown',
      LastName: (formData.get('lastName') as string || '').trim() || 'Patient',
      Gender: (formData.get('gender') as string) || 'Other',
      DateOfBirth: (formData.get('dob') as string) || new Date().toISOString().split('T')[0],
      ContactNo: (formData.get('contact') as string || '').trim(),
      Address: (formData.get('address') as string || '').trim(),
      BloodGroup: (formData.get('bloodGroup') as string) || 'O+'
    };

    try {
      setIsLoading(true);
      const response = await createPatient(newPatient);
      const created = response.data || newPatient;
      setPatients((state) => [created, ...state]);
      toast.success(`Patient ${created.PatientID} registered successfully`, {
        icon: <CheckCircle2 className="w-5 h-5 text-teal-500" />
      });
      form.reset();
      setGeneratedId(`PT-${Math.floor(1000 + Math.random() * 9000)}`);
      setActiveTab('directory');
    } catch (error: any) {
      toast.error(error.message || 'Unable to register patient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const updatedPayload = {
      PatientID: selectedPatient.PatientID,
      FirstName: (formData.get('firstName') as string || '').trim() || selectedPatient.FirstName,
      LastName: (formData.get('lastName') as string || '').trim() || selectedPatient.LastName,
      Gender: (formData.get('gender') as string) || selectedPatient.Gender,
      DateOfBirth: (formData.get('dob') as string) || selectedPatient.DateOfBirth,
      ContactNo: (formData.get('contact') as string || '').trim(),
      Address: (formData.get('address') as string || '').trim(),
      BloodGroup: (formData.get('bloodGroup') as string) || selectedPatient.BloodGroup
    };

    try {
      setIsLoading(true);
      const targetId = selectedPatient.ID ?? selectedPatient.PatientID;
      const response = await updatePatient(targetId, updatedPayload);
      const updated = response.data || updatedPayload;
      setPatients((state) =>
        state.map((p) => (p.PatientID === selectedPatient.PatientID ? { ...p, ...updated } : p))
      );
      toast.success(`Patient ${selectedPatient.PatientID} updated successfully`);
      setIsEditModalOpen(false);
      setSelectedPatient(null);
    } catch (error: any) {
      toast.error(error.message || 'Unable to update patient record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPatient) return;
    try {
      setIsLoading(true);
      const targetId = selectedPatient.ID ?? selectedPatient.PatientID;
      await deletePatient(targetId);
      setPatients((state) => state.filter((p) => p.PatientID !== selectedPatient.PatientID));
      toast.success(`Patient ${selectedPatient.PatientID} removed successfully`);
      setIsConfirmDeleteOpen(false);
      setSelectedPatient(null);
    } catch (error: any) {
      toast.error(error.message || 'Unable to delete patient');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return patients;
    return patients.filter((p) => {
      const fullName = `${p.FirstName} ${p.LastName}`.toLowerCase();
      return (
        p.PatientID.toLowerCase().includes(q) ||
        fullName.includes(q) ||
        (p.ContactNo || '').toLowerCase().includes(q) ||
        (p.BloodGroup || '').toLowerCase().includes(q) ||
        (p.Address || '').toLowerCase().includes(q)
      );
    });
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Clinical registry, intake registration, and medical demographics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab(activeTab === 'directory' ? 'register' : 'directory')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            {activeTab === 'directory' ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Register New Patient</span>
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Directory</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'directory' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Patient Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredPatients.length} of {patients.length} patients registered
              </p>
            </div>
            <div className="w-full sm:w-80 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, contact, blood..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Patient ID</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Full Name</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Gender</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Date of Birth</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Contact</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Blood Group</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.ID ?? p.PatientID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono font-bold text-blue-700">
                      {p.PatientID}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">
                      {p.FirstName} {p.LastName}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {p.Gender}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {p.DateOfBirth}
                    </td>
                    <td className="py-4 px-6 text-sm font-mono text-slate-700">
                      {p.ContactNo || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {p.BloodGroup || 'O+'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(p);
                          setIsDrawerOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                        title="View Profile">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(p);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                        title="Edit Record">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(p);
                          setIsConfirmDeleteOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete Record">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {isLoading ? 'Loading patients...' : 'No patient records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-700">New Patient Intake</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Fill in demographics and clinical intake data.
                </p>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-right">
                <div className="text-[10px] font-bold text-teal-600 tracking-wider uppercase mb-1">
                  Assigned ID
                </div>
                <div className="font-mono font-bold text-teal-700 text-lg">
                  {generatedId}
                </div>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <input type="hidden" name="patientId" value={generatedId} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    placeholder="e.g. Eleanor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    placeholder="e.g. Vance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                    Date of Birth *
                  </label>
                  <input
                    name="dob"
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    defaultValue="O+"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    defaultValue="Male"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                    Contact Phone *
                  </label>
                  <input
                    name="contact"
                    type="tel"
                    required
                    placeholder="+1 (555) 012-3456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                    Residential Address
                  </label>
                  <input
                    name="address"
                    type="text"
                    placeholder="Suite 400, 120 Medical Center Dr, Boston MA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('directory')}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:bg-slate-300">
                  {isLoading ? 'Saving Patient...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Clinical Protocol</h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                Ensure patient government identification and emergency contact numbers are verified before issuing prescription orders or allocating clinical rooms.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Patient Demographics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Active Records:</span>
                  <span className="font-bold text-slate-900">{patients.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Latest Registered ID:</span>
                  <span className="font-mono font-bold text-blue-700">{patients[0]?.PatientID || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPatient(null);
        }}
        title="Patient Medical Profile">
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                {selectedPatient.FirstName[0]}{selectedPatient.LastName[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {selectedPatient.FirstName} {selectedPatient.LastName}
                </h4>
                <p className="text-xs font-mono font-bold text-blue-700">
                  {selectedPatient.PatientID}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm">
                <Droplet className="w-4 h-4 text-rose-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Blood Group</span>
                  <span className="font-bold text-slate-900">{selectedPatient.BloodGroup || 'O+'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <Calendar className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Date of Birth / Gender</span>
                  <span className="font-bold text-slate-900">{selectedPatient.DateOfBirth} ({selectedPatient.Gender})</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <Phone className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Phone Number</span>
                  <span className="font-bold text-slate-900">{selectedPatient.ContactNo || 'Not provided'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Address</span>
                  <span className="font-medium text-slate-700">{selectedPatient.Address || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex space-x-3">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg transition-colors">
                Edit Record
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPatient(null);
        }}
        title="Edit Patient Information">
        {selectedPatient && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                <input
                  name="firstName"
                  defaultValue={selectedPatient.FirstName}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                <input
                  name="lastName"
                  defaultValue={selectedPatient.LastName}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                <input
                  name="dob"
                  type="date"
                  defaultValue={selectedPatient.DateOfBirth}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  defaultValue={selectedPatient.BloodGroup || 'O+'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                <select
                  name="gender"
                  defaultValue={selectedPatient.Gender || 'Male'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact No</label>
                <input
                  name="contact"
                  defaultValue={selectedPatient.ContactNo}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <input
                  name="address"
                  defaultValue={selectedPatient.Address}
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
                disabled={isLoading}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg">
                Update Record
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setSelectedPatient(null);
        }}
        onConfirm={handleDelete}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete patient ${selectedPatient?.FirstName} ${selectedPatient?.LastName} (${selectedPatient?.PatientID})? This action cannot be undone.`}
        confirmText="Confirm Delete"
        confirmColor="red"
      />
    </div>
  );
}
