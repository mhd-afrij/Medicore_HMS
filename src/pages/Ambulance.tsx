import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../components/Modal';
import { Drawer } from '../components/Drawer';
import {
  fetchAmbulances,
  fetchAmbulanceLogs,
  createAmbulanceLog,
  updateAmbulanceStatus,
  fetchPatients,
  createAmbulanceEntry
} from '../api';

export function Ambulance() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleWarning, setVehicleWarning] = useState<string | null>(null);
  const [vehicleConfirmed, setVehicleConfirmed] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const vehicleSearchInputRef = useRef<HTMLInputElement>(null);

  // Close vehicle dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node)) {
        setIsVehicleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'On Call': return 'bg-amber-500';
      case 'Maintenance': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const getStatusOptionColor = (status: string) => {
    switch (status) {
      case 'Available': return 'text-green-700';
      case 'On Call': return 'text-amber-600';
      case 'Maintenance': return 'text-slate-500';
      default: return 'text-slate-600';
    }
  };

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearchQuery.trim().toLowerCase();
    if (!q) return ambulances;
    return ambulances.filter((a) =>
      String(a.AmbulanceID || '').toLowerCase().includes(q) ||
      String(a.VehicleNumber || '').toLowerCase().includes(q) ||
      String(a.DriverName || '').toLowerCase().includes(q)
    );
  }, [ambulances, vehicleSearchQuery]);

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setIsVehicleDropdownOpen(false);
    setVehicleSearchQuery('');
    setVehicleConfirmed(false);
    const selected = ambulances.find((a) => a.AmbulanceID === vehicleId);
    if (!selected) {
      setVehicleWarning(null);
    } else if (selected.Status === 'On Call') {
      setVehicleWarning(`${selected.AmbulanceID} is currently On Call and may not be available. Proceed with caution.`);
    } else if (selected.Status === 'Maintenance') {
      setVehicleWarning(`${selected.AmbulanceID} is under maintenance and may not be fit for dispatch. Proceed with caution.`);
    } else {
      setVehicleWarning(null);
    }
  };

  const selectedAmbulance = ambulances.find((a) => a.AmbulanceID === selectedVehicleId) || null;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const ambulancePromise = fetchAmbulances().then((resp) => resp?.data || []).catch((err) => {
          const message = err instanceof Error ? err.message : 'Unable to load ambulances';
          if (!message.includes('401') && !message.includes('token')) {
            toast.error(message);
          }
          return [];
        });

        const logsPromise = fetchAmbulanceLogs().then((resp) => resp?.data || []).catch((err) => {
          const message = err instanceof Error ? err.message : 'Unable to load ambulance logs';
          if (!message.includes('401') && !message.includes('token')) {
            toast.error(message);
          }
          return [];
        });

        const patientsPromise = fetchPatients().then((resp) => resp?.data || []).catch((err) => {
          const message = err instanceof Error ? err.message : 'Unable to load patients';
          if (!message.includes('401') && !message.includes('token')) {
            toast.error(message);
          }
          return [];
        });

        const [ambulancesData, logsData, patientsData] = await Promise.all([
          ambulancePromise,
          logsPromise,
          patientsPromise
        ]);

        setAmbulances(ambulancesData);
        setLogs(logsData);
        setPatients(patientsData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = async () => {
    const ambulancePromise = fetchAmbulances().then((resp) => resp?.data || []).catch((err) => {
      const message = err instanceof Error ? err.message : 'Unable to refresh ambulances';
      if (!message.includes('401') && !message.includes('token')) {
        toast.error(message);
      }
      return [];
    });

    const logsPromise = fetchAmbulanceLogs().then((resp) => resp?.data || []).catch((err) => {
      const message = err instanceof Error ? err.message : 'Unable to refresh ambulance logs';
      if (!message.includes('401') && !message.includes('token')) {
        toast.error(message);
      }
      return [];
    });

    const [ambulancesData, logsData] = await Promise.all([ambulancePromise, logsPromise]);
    setAmbulances(ambulancesData);
    setLogs(logsData);
  };

  const getPatientName = (id: string | null) => {
    if (!id) return 'Unregistered';
    const patient = patients.find((p) => p.PatientID === id || p.id === id);
    if (!patient) return id;
    return `${patient.FirstName || patient.firstName || ''} ${patient.LastName || patient.lastName || ''}`.trim();
  };

  const handleDispatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const vehicleId = selectedVehicleId;
    const type = (formData.get('type') as string) || '';
    const patientId = (formData.get('patient') || '') as string;
    const pickup = (formData.get('pickup') || '') as string;
    const dropoff = (formData.get('dropoff') || '') as string;

    if (!vehicleId || !type || !pickup) {
      toast.error('Vehicle, dispatch type, and pickup location are required.');
      return;
    }

    try {
      await createAmbulanceLog({
        vehicle: vehicleId,
        type,
        patient: patientId || null,
        pickup,
        dropoff
      });
      toast.success('Ambulance dispatch logged successfully.');
      setIsModalOpen(false);
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to log dispatch');
    }
  };

  const handleComplete = async (_logId: string, ambulanceId: string) => {
    try {
      await updateAmbulanceStatus(ambulanceId, 'Available');
      toast.success(`${ambulanceId} marked as available.`);
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update ambulance status');
    }
  };

  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const vehicleNumber = String(formData.get('vehicleNumber') || '').trim();
    const driverName = String(formData.get('driverName') || '').trim();
    const status = String(formData.get('status') || 'Available').trim();

    if (!vehicleNumber || !driverName) {
      toast.error('Vehicle number and driver name are required.');
      return;
    }

    try {
      await createAmbulanceEntry({ vehicleNumber, driverName, status });
      toast.success(`Vehicle ${vehicleNumber} added to fleet.`);
      form.reset();
      setIsAddVehicleModalOpen(false);
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add vehicle');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700';
      case 'On Call':
        return 'bg-amber-100 text-amber-700';
      case 'Maintenance':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) => {
      return (
        String(log.LogID || '').toLowerCase().includes(q) ||
        String(log.AmbulanceID || '').toLowerCase().includes(q) ||
        String(log.DispatchType || '').toLowerCase().includes(q) ||
        String(log.PickupLocation || '').toLowerCase().includes(q) ||
        String(log.DropoffLocation || '').toLowerCase().includes(q) ||
        String(log.Destination || '').toLowerCase().includes(q) ||
        String(log.Remarks || '').toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ambulance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage ambulance dispatches using the database-backed ambulance_log table.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsAddVehicleModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
          <button
            onClick={() => {
              setVehicleWarning(null);
              setVehicleConfirmed(false);
              setSelectedVehicleId('');
              setIsVehicleDropdownOpen(false);
              setVehicleSearchQuery('');
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Dispatch</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Fleet Size</h3>
          <p className="text-3xl font-bold text-slate-900">{ambulances.length}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-100">
          <h3 className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-1">Currently Dispatched</h3>
          <p className="text-3xl font-bold text-amber-700">{ambulances.filter((a) => a.Status === 'On Call').length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
          <h3 className="text-xs font-bold text-green-600 tracking-wider uppercase mb-1">Available Now</h3>
          <p className="text-3xl font-bold text-green-700">{ambulances.filter((a) => a.Status === 'Available').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Fleet Status</h2>
              <p className="text-sm text-slate-500">Vehicles loaded from the AMBULANCE database table.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search logs or vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
              <button
                type="button"
                onClick={refreshData}
                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-sm text-slate-500">Loading ambulance fleet...</div>
            ) : ambulances.length === 0 ? (
              <div className="text-sm text-slate-500">No ambulances found.</div>
            ) : (
              ambulances.map((amb) => (
                <div
                  key={amb.AmbulanceID}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">{amb.AmbulanceID}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{amb.DriverName}</div>
                      <div className="text-xs text-slate-500">{amb.VehicleNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(amb.Status)}`}>{amb.Status}</span>
                    <button
                      onClick={() => {
                        setSelectedVehicle(amb);
                        setIsDrawerOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                      title="View dispatch logs"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Dispatch Logs</h2>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-sm text-slate-500">No dispatch logs available.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.LogID} className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{new Date(log.LogDateTime).toLocaleString()}</div>
                      <div className="font-medium text-slate-900">{getPatientName(log.PatientID)}</div>
                    </div>
                    <span className="text-[11px] font-semibold uppercase text-slate-600">{log.AmbulanceID}</span>
                  </div>
                  {log.DispatchType && (
                    <div className="text-xs font-semibold text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded-full mb-2">{log.DispatchType}</div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                    {log.PickupLocation && (
                      <div><span className="font-bold text-slate-500">From:</span> {log.PickupLocation}</div>
                    )}
                    {log.DropoffLocation && (
                      <div><span className="font-bold text-slate-500">To:</span> {log.DropoffLocation}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleComplete(log.LogID, log.AmbulanceID)}
                      className="text-blue-700 hover:underline"
                    >
                      Mark Available
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setVehicleWarning(null); setVehicleConfirmed(false); setSelectedVehicleId(''); setIsVehicleDropdownOpen(false); setVehicleSearchQuery(''); setIsModalOpen(false); }} title="Log New Dispatch">
        <form onSubmit={handleDispatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Vehicle <span className="text-red-500">*</span></label>
              <div className="relative" ref={vehicleDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsVehicleDropdownOpen((prev) => !prev);
                    if (!isVehicleDropdownOpen) {
                      setTimeout(() => vehicleSearchInputRef.current?.focus(), 0);
                    }
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={isVehicleDropdownOpen}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsVehicleDropdownOpen(false);
                  }}
                  className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-700 flex items-center justify-between gap-2 ${
                    !selectedVehicleId ? 'text-slate-400 border-slate-200' : 'text-slate-900 border-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {selectedAmbulance && (
                      <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(selectedAmbulance.Status)}`} />
                    )}
                    {selectedAmbulance
                      ? `${selectedAmbulance.AmbulanceID} (${selectedAmbulance.VehicleNumber}) — ${selectedAmbulance.DriverName}`
                      : 'Select vehicle'}
                  </span>
                  <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isVehicleDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isVehicleDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg focus:outline-none">
                    <div className="sticky top-0 p-2 bg-white border-b border-slate-100">
                      <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                          ref={vehicleSearchInputRef}
                          type="text"
                          placeholder="Search by ID, plate, or driver..."
                          value={vehicleSearchQuery}
                          onChange={(e) => setVehicleSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setIsVehicleDropdownOpen(false);
                              setVehicleSearchQuery('');
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-700"
                        />
                      </div>
                    </div>
                    <ul role="listbox" className="max-h-60 overflow-auto focus:outline-none">
                      {filteredVehicles.length === 0 && (
                        <li className="px-4 py-3 text-sm text-slate-400 text-center">No vehicles match your search.</li>
                      )}
                      {filteredVehicles.map((a) => (
                      <li
                        key={a.AmbulanceID}
                        role="option"
                        aria-selected={selectedVehicleId === a.AmbulanceID}
                        onClick={() => handleVehicleSelect(a.AmbulanceID)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleVehicleSelect(a.AmbulanceID);
                          }
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                          selectedVehicleId === a.AmbulanceID ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${getStatusDotColor(a.Status)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{a.AmbulanceID}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-500">{a.VehicleNumber}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{a.DriverName}</div>
                        </div>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${getStatusOptionColor(a.Status)}`}>
                          {a.Status}
                        </span>
                      </li>
                    ))}                    </ul>
                  </div>
                )}
              </div>
              {vehicleWarning && (
                <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    <p className="text-xs font-medium text-amber-700">{vehicleWarning}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vehicleConfirmed}
                      onChange={(e) => setVehicleConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs text-amber-700 font-medium">I understand this vehicle may not be available. Confirm selection.</span>
                  </label>
                </div>
              )}
              {ambulances.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No ambulances found. Add ambulances to the fleet first.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="ambulanceType" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Dispatch Type <span className="text-red-500">*</span></label>
              <select
                id="ambulanceType"
                name="type"
                required
                defaultValue="Emergency Pickup"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                <option value="Emergency Pickup">Emergency Pickup</option>
                <option value="Patient Transfer">Patient Transfer</option>
                <option value="Routine Transport">Routine Transport</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ambulancePatient" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Patient</label>
            <select
              id="ambulancePatient"
              name="patient"
              defaultValue=""
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="">Select patient (optional)</option>
              {patients.map((p) => (
                <option key={p.PatientID || p.id} value={p.PatientID || p.id}>
                  {`${p.FirstName || p.firstName || ''} ${p.LastName || p.lastName || ''}`.trim() || p.PatientID || p.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Pickup Location <span className="text-red-500">*</span></label>
              <input
                name="pickup"
                type="text"
                required
                placeholder="e.g. Colombo 05"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Drop-off Location</label>
              <input
                name="dropoff"
                type="text"
                placeholder="e.g. ICU Wing A"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={!!vehicleWarning && !vehicleConfirmed}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                vehicleWarning && !vehicleConfirmed
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              Log Dispatch
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddVehicleModalOpen} onClose={() => setIsAddVehicleModalOpen(false)} title="Add Vehicle">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Vehicle Number <span className="text-red-500">*</span></label>
            <input
              name="vehicleNumber"
              type="text"
              required
              placeholder="e.g. LK-2024-004"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Driver Name <span className="text-red-500">*</span></label>
            <input
              name="driverName"
              type="text"
              required
              placeholder="Enter driver name"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Status</label>
            <select
              name="status"
              defaultValue="Available"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddVehicleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800">Add Vehicle</button>
          </div>
        </form>
      </Modal>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={`Vehicle Log: ${selectedVehicle?.AmbulanceID}`}>
        {selectedVehicle ? (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Driver</div>
              <div className="font-bold text-slate-900">{selectedVehicle.DriverName}</div>
              <div className="text-xs text-slate-500">{selectedVehicle.VehicleNumber}</div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Dispatches</h3>
              <div className="space-y-3">
                {logs.filter((log) => log.AmbulanceID === selectedVehicle.AmbulanceID).map((log) => (
                  <div key={log.LogID} className="p-3 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-900">{new Date(log.LogDateTime).toLocaleString()}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-600">{getPatientName(log.PatientID)}</span>
                    </div>
                    <div className="text-xs text-slate-600">{log.Remarks}</div>
                  </div>
                ))}
                {logs.filter((log) => log.AmbulanceID === selectedVehicle.AmbulanceID).length === 0 && (
                  <div className="text-sm text-slate-500">No recent logs found.</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
