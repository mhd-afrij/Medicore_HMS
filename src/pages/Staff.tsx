import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { fetchStaff, createStaff, updateStaff, deleteStaff } from '../api';

interface StaffRecord {
  StaffID: string;
  Staffname?: string;
  FirstName?: string;
  LastName?: string;
  Role: string;
  Email?: string;
  ContactNo: string;
  Address?: string;
}

export function Staff() {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newStaffID, setNewStaffID] = useState('');

  const getErrorMessage = (error: unknown, defaultMessage: string) => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return defaultMessage;
  };

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await fetchStaff();
        setStaff(response.data || []);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Unable to load staff records'));
      } finally {
        /* no-op */
      }
    };

    loadStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return staff;
    return staff.filter((member) => {
      const fullName = (member.Staffname || `${member.FirstName || ''} ${member.LastName || ''}`).toLowerCase();
      return (
        fullName.includes(query) ||
        member.StaffID.toLowerCase().includes(query) ||
        member.Role.toLowerCase().includes(query) ||
        (member.Email || '').toLowerCase().includes(query) ||
        member.ContactNo.toLowerCase().includes(query) ||
        (member.Address || '').toLowerCase().includes(query)
      );
    });
  }, [staff, searchQuery]);

  const openAddModal = () => {
    setSelectedStaff(null);
    setIsEditing(false);
    setNewStaffID(`ST-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsModalOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      StaffID: (formData.get('StaffID') as string || '').trim(),
      Staffname: (formData.get('StaffName') as string || '').trim(),
      Role: (formData.get('Role') as string || '').trim(),
      Email: (formData.get('Email') as string || '').trim() || null,
      ContactNo: (formData.get('ContactNo') as string || '').trim(),
      Address: (formData.get('Address') as string || '').trim() || null,
    };

    if (!payload.StaffID || !payload.Staffname || !payload.Role || !payload.ContactNo) {
      toast.error('Please complete required staff fields.');
      return;
    }

    try {
      if (isEditing && selectedStaff) {
        const response = await updateStaff(selectedStaff.StaffID, payload);
        setStaff((prev) => prev.map((member) => (member.StaffID === selectedStaff.StaffID ? response.data : member)));
        toast.success('Staff member updated successfully.');
      } else {
        const response = await createStaff(payload);
        setStaff((prev) => [response.data, ...prev]);
        toast.success('Staff member created successfully.');
      }
      setIsModalOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Unable to save staff member'));
    } finally {
      /* no-op */
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await deleteStaff(selectedStaff.StaffID);
      setStaff((prev) => prev.filter((member) => member.StaffID !== selectedStaff.StaffID));
      toast.success('Staff member removed.');
      setIsConfirmOpen(false);
      setSelectedStaff(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Unable to delete staff member'));
    } finally {
      /* no-op */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage nurses, administrative staff, and support personnel.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search staff by name, role, email or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-9 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Staff Code</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Name</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Role</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Email</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Contact</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Address</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => (
                  <tr key={member.StaffID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono font-bold text-slate-600">{member.StaffID}</td>
                    <td className="py-4 px-6 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                          <img
                            src={`https://i.pravatar.cc/150?u=${member.StaffID}`}
                            alt={member.Staffname || `${member.FirstName || ''} ${member.LastName || ''}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{member.Staffname || `${member.FirstName || ''} ${member.LastName || ''}`}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{member.Role}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-700 font-medium">{member.Email || '-'}</td>
                    <td className="py-4 px-6 text-sm text-slate-700 font-medium">{member.ContactNo}</td>
                    <td className="py-4 px-6 text-sm text-slate-700 font-medium truncate max-w-[200px]">{member.Address || '-'}</td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStaff(member);
                          setIsDrawerOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStaff(member);
                          setIsEditing(true);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStaff(member);
                          setIsConfirmOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-6">Staff Overview</h2>
            <div className="space-y-4 mb-8">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total staff</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{staff.length}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Unique roles</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{new Set(staff.map((member) => member.Role)).size}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Staff Member' : 'Add Staff Member'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="StaffID" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Staff Code</label>
              <input
                id="StaffID"
                name="StaffID"
                type="text"
                maxLength={20}
                defaultValue={selectedStaff?.StaffID || newStaffID}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
            <div>
              <label htmlFor="Role" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
              <input
                id="Role"
                name="Role"
                type="text"
                maxLength={50}
                defaultValue={selectedStaff?.Role}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <div>
              <label htmlFor="StaffName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Staff Name</label>
              <input
                id="StaffName"
                name="StaffName"
                type="text"
                maxLength={100}
                defaultValue={selectedStaff?.Staffname || `${selectedStaff?.FirstName || ''} ${selectedStaff?.LastName || ''}`.trim()}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="Email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
              <input
                id="Email"
                name="Email"
                type="email"
                maxLength={100}
                defaultValue={selectedStaff?.Email}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
            <div>
              <label htmlFor="ContactNo" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
              <input
                id="ContactNo"
                name="ContactNo"
                type="text"
                maxLength={20}
                defaultValue={selectedStaff?.ContactNo}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="Address" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
            <textarea
              id="Address"
              name="Address"
              rows={3}
              defaultValue={selectedStaff?.Address || ''}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800"
            >
              {isEditing ? 'Update Staff Member' : 'Save Staff Member'}
            </button>
          </div>
        </form>
      </Modal>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Staff Profile">
        {selectedStaff && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                <img
                  src={`https://i.pravatar.cc/150?u=${selectedStaff.StaffID}`}
                  alt={selectedStaff.Staffname || `${selectedStaff.FirstName || ''} ${selectedStaff.LastName || ''}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedStaff.Staffname || `${selectedStaff.FirstName || ''} ${selectedStaff.LastName || ''}`}</h2>
                <div className="text-sm font-medium text-slate-600">{selectedStaff.StaffID}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Role</div>
                <div className="font-medium text-slate-900">{selectedStaff.Role}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Contact</div>
                <div className="font-medium text-slate-900">{selectedStaff.ContactNo}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Email</div>
                <div className="font-medium text-slate-900">{selectedStaff.Email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Address</div>
                <div className="font-medium text-slate-900">{selectedStaff.Address || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${selectedStaff?.FirstName} ${selectedStaff?.LastName}? This action cannot be undone.`}
      />
    </div>
  );
}
