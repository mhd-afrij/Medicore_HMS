import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  User,
  Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAppointments,
  fetchDoctors,
  fetchPatients,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';

const timeSlots = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM'
];

interface DoctorRecord {
  DoctorID: string;
  ID?: string | number;
  DoctorName?: string;
  FirstName?: string;
  LastName?: string;
  Specialty?: string;
  Specialization?: string;
}

interface PatientRecord {
  PatientID: string;
  ID?: string | number;
  FirstName: string;
  LastName: string;
  ContactNo?: string;
}

export function Appointments() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'list'>('schedule');

  // consultation type
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[1]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [specializationFilter, setSpecializationFilter] = useState('All Specializations');
  const [patientSearch, setPatientSearch] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isLoading, setIsLoading] = useState(false);

  // Deletion state
  const [selectedApptToDelete, setSelectedApptToDelete] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [patientResponse, doctorResponse, appointmentResponse] = await Promise.all([
        fetchPatients().catch(() => ({ data: [] })),
        fetchDoctors().catch(() => ({ data: [] })),
        fetchAppointments().catch(() => ({ data: [] }))
      ]);

      setPatients(patientResponse.data || []);
      setDoctors(doctorResponse.data || []);
      setAppointments(appointmentResponse.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Unable to load appointment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedPatientId && patients.length) {
      setSelectedPatientId(patients[0].PatientID);
    }
  }, [patients, selectedPatientId]);

  useEffect(() => {
    if (!selectedDoctorId && doctors.length) {
      setSelectedDoctorId(doctors[0].DoctorID || String(doctors[0].ID));
    }
  }, [doctors, selectedDoctorId]);

  const filteredPatients = useMemo(() => {
    const query = patientSearch.toLowerCase().trim();
    return patients.filter((patient) => {
      const fullName = `${patient.FirstName} ${patient.LastName}`.toLowerCase();
      return (
        !query ||
        patient.PatientID.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        (patient.ContactNo || '').toLowerCase().includes(query)
      );
    });
  }, [patients, patientSearch]);

  const specializations = useMemo(() => {
    const unique = new Set<string>();
    doctors.forEach((doctor) => {
      const spec = doctor.Specialty || doctor.Specialization || 'General Medicine';
      unique.add(spec.trim());
    });
    return ['All Specializations', ...Array.from(unique).sort()];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!specializationFilter || specializationFilter === 'All Specializations') {
      return doctors;
    }
    return doctors.filter((doctor) => {
      const spec = doctor.Specialty || doctor.Specialization || '';
      return spec.toLowerCase().includes(specializationFilter.toLowerCase());
    });
  }, [doctors, specializationFilter]);

  const bookedSlots = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const docId = appointment.DoctorID || appointment.doctor?.id;
        const appDate = appointment.AppointmentDate || appointment.appointmentDate;
        const dateMatch = appDate ? String(appDate).startsWith(selectedDate) : false;
        return docId === selectedDoctorId && dateMatch && appointment.Status !== 'Cancelled';
      })
      .map((appointment) => appointment.AppointmentTime || appointment.appointmentTime);
  }, [appointments, selectedDate, selectedDoctorId]);

  const availableSlots = useMemo(() => timeSlots.filter((slot) => !bookedSlots.includes(slot)), [bookedSlots]);

  useEffect(() => {
    if (bookedSlots.includes(selectedSlot)) {
      setSelectedSlot(availableSlots[0] || timeSlots[0]);
    }
  }, [bookedSlots, selectedSlot, availableSlots]);

  const firstWeekDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
  const blankDays = (firstWeekDay + 6) % 7;
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();

  const calendarDays = Array.from({ length: blankDays + daysInMonth }).map((_, index) => {
    const dayIndex = index - blankDays + 1;
    return {
      label: index < blankDays ? '' : String(dayIndex),
      date: index < blankDays ? null : new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), dayIndex)
    };
  });

  const selectDate = (date: Date | null) => {
    if (!date) return;
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    setSelectedDate(localDate.toISOString().split('T')[0]);
  };

  const changeMonth = (delta: number) => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + delta, 1));
  };

  const handleCreateAppointment = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }

    if (!selectedDoctorId) {
      toast.error('Please select a doctor');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please choose an available slot');
      return;
    }

    const appointmentPayload = {
      AppointmentID: `APT-${Date.now().toString().slice(-6)}`,
      PatientID: selectedPatientId,
      DoctorID: selectedDoctorId,
      AppointmentDate: selectedDate,
      AppointmentTime: selectedSlot,
      Status: 'Scheduled'
    };

    try {
      setIsLoading(true);
      const response = await createAppointment(appointmentPayload);
      const created = response.data || appointmentPayload;
      setAppointments((current) => [created, ...current]);
      toast.success(`Appointment ${created.AppointmentID} confirmed successfully!`, {
        icon: <CheckCircle2 className="w-5 h-5 text-teal-500" />
      });
      
      setActiveTab('list');
    } catch (error: any) {
      toast.error(error.message || 'Unable to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (appt: any, newStatus: string) => {
    const id = appt.AppointmentID || appt.appointmentId || appt.ID;
    const payload = {
      ...appt,
      PatientID: appt.PatientID || appt.patient?.id,
      DoctorID: appt.DoctorID || appt.doctor?.id,
      AppointmentDate: appt.AppointmentDate || appt.appointmentDate,
      AppointmentTime: appt.AppointmentTime || appt.appointmentTime,
      Status: newStatus
    };

    try {
      setIsLoading(true);
      await updateAppointment(id, payload);
      setAppointments((prev) =>
        prev.map((item) => {
          const itemId = item.AppointmentID || item.appointmentId || item.ID;
          return itemId === id ? { ...item, Status: newStatus } : item;
        })
      );
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Unable to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedApptToDelete) return;
    const id = selectedApptToDelete.AppointmentID || selectedApptToDelete.appointmentId || selectedApptToDelete.ID;
    try {
      setIsLoading(true);
      await deleteAppointment(id);
      setAppointments((prev) =>
        prev.filter((item) => {
          const itemId = item.AppointmentID || item.appointmentId || item.ID;
          return itemId !== id;
        })
      );
      toast.success('Appointment removed');
      setIsDeleteOpen(false);
      setSelectedApptToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Unable to delete appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointmentsList = useMemo(() => {
    const q = listSearch.toLowerCase().trim();
    return appointments.filter((a) => {
      const apptId = (a.AppointmentID || a.appointmentId || '').toLowerCase();
      const patId = (a.PatientID || a.patient?.id || '').toLowerCase();
      const docId = (a.DoctorID || a.doctor?.id || '').toLowerCase();
      const status = (a.Status || 'Scheduled');

      const matchesSearch = !q || apptId.includes(q) || patId.includes(q) || docId.includes(q);
      const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [appointments, listSearch, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointments Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Book consultations, manage doctor time slots, and track clinical queues.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab(activeTab === 'schedule' ? 'list' : 'schedule')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            {activeTab === 'schedule' ? (
              <>
                <CalendarDays className="w-4 h-4" />
                <span>View Scheduled Roster ({appointments.length})</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Book New Appointment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'schedule' ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Patient & Doctor Selection */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Step 1: Patient Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-700" />
                <span>1. Select Patient</span>
              </h2>
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Filter by name, patient ID, or phone..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredPatients.map((p) => {
                  const isSelected = p.PatientID === selectedPatientId;
                  return (
                    <div
                      key={p.PatientID}
                      onClick={() => setSelectedPatientId(p.PatientID)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors flex justify-between items-center ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}>
                      <div>
                        <span className="font-bold text-sm block">
                          {p.FirstName} {p.LastName}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {p.PatientID} &bull; {p.ContactNo || 'No phone'}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-700" />}
                    </div>
                  );
                })}
                {filteredPatients.length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">No matching patients found.</p>
                )}
              </div>
            </div>

            {/* Step 2: Doctor Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-blue-700" />
                  <span>2. Select Attending Specialist</span>
                </h2>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium">
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => {
                  const docId = doc.DoctorID || String(doc.ID);
                  const isSelected = docId === selectedDoctorId;
                  const docName = doc.DoctorName || `Dr. ${doc.FirstName || ''} ${doc.LastName || ''}`;
                  const specialty = doc.Specialty || doc.Specialization || 'Clinical Specialist';
                  return (
                    <div
                      key={docId}
                      onClick={() => setSelectedDoctorId(docId)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center space-x-3 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}>
                      <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        <img
                          src={`https://i.pravatar.cc/150?u=${encodeURIComponent(docName)}`}
                          alt={docName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-sm block truncate text-slate-900">{docName}</span>
                        <span className="text-xs text-slate-500 block truncate">{specialty}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Date & Slot Picker */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 text-base">3. Date & Time Slot</h3>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-2 py-1">
                    {selectedMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="p-1 hover:bg-slate-100 rounded-lg">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((d) => (
                  <div key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</div>
                ))}
                {calendarDays.map((cell, idx) => {
                  const dateStr = cell.date ? cell.date.toISOString().split('T')[0] : '';
                  const isSelected = dateStr === selectedDate;
                  return (
                    <div key={idx} className="aspect-square p-0.5">
                      {cell.date ? (
                        <button
                          type="button"
                          onClick={() => selectDate(cell.date)}
                          className={`w-full h-full rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-blue-700 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}>
                          {cell.label}
                        </button>
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                  );
                })}
              </div>

              <hr className="border-slate-100 mb-4" />

              <div className="mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Available Slots ({selectedDate})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => {
                    const isBooked = bookedSlots.includes(time);
                    const isSelected = time === selectedSlot;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(time)}
                        className={`py-1.5 px-1 text-xs font-semibold rounded-lg border transition-colors ${
                          isBooked
                            ? 'bg-slate-50 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50 border-blue-700 text-blue-700 ring-1 ring-blue-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
                        }`}>
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs font-medium text-slate-500">
                    Est. Duration: <strong className="text-slate-800">30 Min</strong>
                  </div>
                  <div className="text-xs font-bold text-blue-700">Standard Intake</div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateAppointment}
                  disabled={isLoading || !selectedPatientId || !selectedDoctorId || !selectedSlot}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-xl transition-colors shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300">
                  {isLoading ? 'Confirming...' : 'Confirm & Book Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List Tab: Appointments Roster */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Scheduled Appointments Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredAppointmentsList.length} of {appointments.length} appointments
              </p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700">
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Filter appointments..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Appt ID</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Patient ID</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Doctor ID</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Date & Time</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Status</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointmentsList.map((appt) => {
                  const id = appt.AppointmentID || appt.appointmentId || appt.ID;
                  const patId = appt.PatientID || appt.patient?.id || '—';
                  const docId = appt.DoctorID || appt.doctor?.id || '—';
                  const dateVal = appt.AppointmentDate || appt.appointmentDate || '—';
                  const timeVal = appt.AppointmentTime || appt.appointmentTime || '';
                  const status = appt.Status || 'Scheduled';

                  const badgeClass =
                    status === 'Completed'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : status === 'Cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  return (
                    <tr key={id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-mono font-bold text-slate-900">{id}</td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-800">{patId}</td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-800">{docId}</td>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        {dateVal} {timeVal && `@ ${timeVal}`}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(appt, 'Completed')}
                            className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                            title="Mark as Completed">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(appt, 'Cancelled')}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                            title="Cancel Appointment">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedApptToDelete(appt);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Record">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredAppointmentsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No appointments matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedApptToDelete(null);
        }}
        onConfirm={handleDeleteAppointment}
        title="Delete Appointment Record"
        message={`Are you sure you want to permanently delete appointment ${selectedApptToDelete?.AppointmentID || selectedApptToDelete?.appointmentId}? This cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  );
}
