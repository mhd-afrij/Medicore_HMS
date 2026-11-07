import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { fetchDoctors, createDoctor, updateDoctor, deleteDoctor } from '../api';

interface DoctorRecord {
  ID: string;
  DoctorID: string;
  DoctorName: string;
  Specialization: string;
  Email: string;
  Description?: string;
}

export function Doctors() {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const doctorResponse = await fetchDoctors();
        setDoctors(doctorResponse.data || []);
      } catch (error: any) {
        toast.error(error.message || 'Unable to load doctors');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return doctors;
    return doctors.filter((doctor) => {
      const fullName = (doctor.DoctorName || '').toLowerCase();
      const specialization = (doctor.Specialization || '').toLowerCase();
      return (
        fullName.includes(query) ||
        doctor.DoctorID.toLowerCase().includes(query) ||
        specialization.includes(query)
      );
    });
  }, [doctors, searchQuery]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const doctorIdValue = (formData.get('DoctorID') as string || '').trim();
    const doctorName = (formData.get('doctorName') as string || '').trim();
    const specialization = (formData.get('specialization') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();

    if (!doctorIdValue || !doctorName || !specialization || !email) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const payload = {
      DoctorID: doctorIdValue,
      DoctorName: doctorName,
      Specialization: specialization,
      Email: email,
      Description: description || null
    };

    try {
      setIsLoading(true);
      if (isEditing && selectedDoctor) {
        const response = await updateDoctor(selectedDoctor.ID, payload);
        setDoctors((prev) => prev.map((doc) => (doc.ID === selectedDoctor.ID ? response.data : doc)));
        toast.success('Doctor profile updated successfully.');
      } else {
        const response = await createDoctor(payload);
        setDoctors((prev) => [response.data, ...prev]);
        toast.success('Doctor profile created successfully.');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Unable to save doctor profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoctor) return;
    try {
      setIsLoading(true);
      await deleteDoctor(selectedDoctor.ID);
      setDoctors((prev) => prev.filter((doctor) => doctor.ID !== selectedDoctor.ID));
      toast.success('Doctor profile removed.');
    } catch (error: any) {
      toast.error(error.message || 'Unable to delete doctor');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedDoctor(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (doctor: DoctorRecord) => {
    setSelectedDoctor(doctor);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Doctor Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage physician profiles, specializations, and department assignments.
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
          Total Doctors: {doctors.length}
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-slate-500">Loading doctor data...</div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.ID} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{doctor.DoctorID}</div>
                <h3 className="text-xl font-bold text-slate-900">{doctor.DoctorName}</h3>
                <p className="text-sm text-slate-500">{doctor.Specialization}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                <img
                  src={`https://i.pravatar.cc/150?u=doctor-${doctor.ID}`}
                  alt={doctor.DoctorName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">Email</div>
                <div>{doctor.Email}</div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setIsDrawerOpen(true);
                }}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Eye className="inline-block w-4 h-4 mr-2" /> View
              </button>
              <button
                type="button"
                onClick={() => openEditModal(doctor)}
                className="flex-1 rounded-2xl border border-blue-700 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                <Edit className="inline-block w-4 h-4 mr-2" /> Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setIsConfirmOpen(true);
                }}
                className="flex-1 rounded-2xl border border-red-600 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                <Trash2 className="inline-block w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Doctor Profile' : 'Add Doctor'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="DoctorID" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Doctor Code
              </label>
              <input
                id="DoctorID"
                name="DoctorID"
                type="text"
                maxLength={10}
                defaultValue={selectedDoctor?.DoctorID || `DR-${Math.floor(1000 + Math.random() * 9000)}`}
                placeholder="Max 10 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
            <div>
              <label htmlFor="specialization" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                type="text"
                maxLength={100}
                defaultValue={selectedDoctor?.Specialization}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="doctorName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Doctor Name
            </label>
            <input
              id="doctorName"
              name="doctorName"
              type="text"
              defaultValue={selectedDoctor?.DoctorName}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={100}
                defaultValue={selectedDoctor?.Email}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
            
          </div>

          

          <div>
            <label htmlFor="description" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Profile Notes
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={selectedDoctor?.Description || ''}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800"
            >
              {isEditing ? 'Update Doctor' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Doctor Profile"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                <img
                  src={`https://i.pravatar.cc/150?u=doctor-${selectedDoctor.ID}`}
                  alt={selectedDoctor.DoctorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedDoctor.DoctorName}</h2>
                <p className="text-sm text-slate-500">{selectedDoctor.Specialization}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedDoctor.DoctorID}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Email</div>
                <div className="text-sm font-medium text-slate-900">{selectedDoctor.Email}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Profile Notes</div>
              <p className="text-sm text-slate-600">{selectedDoctor.Description || 'No additional notes.'}</p>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Doctor Profile"
        message={`Are you sure you want to delete ${selectedDoctor?.DoctorName}? This action cannot be undone.`}
      />
    </div>
  );
}
