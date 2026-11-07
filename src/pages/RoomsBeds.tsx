import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../api';

export function RoomsBeds() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchRooms();
        setRooms(resp?.data || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unable to load rooms');
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => {
      return (
        String(r.RoomID || '').toLowerCase().includes(q) ||
        String(r.RoomNumber || r.Name || '').toLowerCase().includes(q) ||
        String(r.RoomType || r.Type || '').toLowerCase().includes(q) ||
        String(r.DailyCharge || r.Description || '').toLowerCase().includes(q)
      );
    });
  }, [rooms, searchQuery]);

  const openAdd = () => {
    setSelectedRoom(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEdit = (room: any) => {
    setSelectedRoom(room);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openView = (room: any) => {
    setSelectedRoom(room);
    setIsDrawerOpen(true);
  };

  const confirmDelete = (room: any) => {
    setSelectedRoom(room);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom(selectedRoom.RoomID);
      setRooms((prev) => prev.filter((r) => r.RoomID !== selectedRoom.RoomID));
      toast.success('Room deleted');
      setIsConfirmOpen(false);
      setSelectedRoom(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete room');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Map UI fields and include legacy ROOM field names for compatibility with older backend validation
    const roomNumberValue = (fd.get('roomNumber') as string) || (selectedRoom?.RoomNumber || selectedRoom?.Name || '');
    const roomTypeValue = (fd.get('roomType') as string) || (selectedRoom?.RoomType || selectedRoom?.Type || '');
    const dailyChargeValue = (fd.get('dailyCharge') as string) || (selectedRoom?.DailyCharge || selectedRoom?.Description || '');

    const payload = {
      RoomID: (fd.get('RoomID') as string) || (isEditing && selectedRoom ? selectedRoom.RoomID : `RM-${Math.floor(1000 + Math.random() * 9000)}`),
      RoomNumber: roomNumberValue,
      RoomType: roomTypeValue,
      DailyCharge: dailyChargeValue,
      Name: roomNumberValue,
      Type: roomTypeValue,
      Description: dailyChargeValue
    };

    if (!payload.RoomID || !payload.RoomNumber || !payload.RoomType) {
      toast.error('RoomID, RoomNumber and RoomType are required');
      return;
    }

    try {
      if (isEditing && selectedRoom) {
        const resp = await updateRoom(selectedRoom.RoomID, payload);
        setRooms((prev) => prev.map((r) => (r.RoomID === resp.data.RoomID ? resp.data : r)));
        toast.success('Room updated');
      } else {
        const resp = await createRoom(payload);
        setRooms((prev) => [resp.data, ...prev]);
        toast.success('Room created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save room');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Room & Bed Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage rooms, room numbers, types and daily charges.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by room ID, number, or type..."
              aria-label="Search rooms"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm"
            />
          </div>
          <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Room</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Room ID</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Room Number</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Room Type</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Daily Charge</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((room) => (
                <tr key={room.RoomID} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono font-bold text-blue-700">{room.RoomID}</td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-900">{room.RoomNumber || room.Name}</td>
                  <td className="py-4 px-6 text-sm text-slate-700">{room.RoomType || room.Type}</td>
                  <td className="py-4 px-6 text-sm text-slate-700">{room.DailyCharge || room.Description}</td>
                  <td className="py-4 px-6 text-right space-x-1">
                    <button onClick={() => openView(room)} className="p-1.5 text-slate-400 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50" title="View"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(room)} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(room)} className="p-1.5 text-slate-400 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Room' : 'New Room'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="RoomID" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Room ID <span className="text-red-500">*</span></label>
            <input id="RoomID" name="RoomID" title="Room ID" type="text" required defaultValue={selectedRoom?.RoomID || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div>
            <label htmlFor="roomNumber" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Room Number <span className="text-red-500">*</span></label>
            <input id="roomNumber" name="roomNumber" title="Room Number" type="text" required defaultValue={selectedRoom?.RoomNumber || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div>
            <label htmlFor="roomType" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Room Type <span className="text-red-500">*</span></label>
            <input id="roomType" name="roomType" title="Room Type" type="text" required defaultValue={selectedRoom?.RoomType || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div>
            <label htmlFor="dailyCharge" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Daily Charge</label>
            <input id="dailyCharge" name="dailyCharge" title="Daily Charge" type="text" defaultValue={selectedRoom?.DailyCharge || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800">{isEditing ? 'Update Room' : 'Save Room'}</button>
          </div>
        </form>
      </Modal>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Room Details">
        {selectedRoom && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Room ID</div>
              <div className="font-mono font-bold text-blue-700">{selectedRoom.RoomID}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Room Number</div>
              <div className="font-bold text-slate-900">{selectedRoom.RoomNumber || selectedRoom.Name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Room Type</div>
              <div className="font-bold text-slate-900">{selectedRoom.RoomType || selectedRoom.Type}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Daily Charge</div>
              <div className="text-slate-700">{selectedRoom.DailyCharge || selectedRoom.Description || 'N/A'}</div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} title="Delete room" message={`Are you sure you want to delete room ${selectedRoom?.RoomID}? This action cannot be undone.`} />
    </div>
  );
}