import React, { useEffect, useMemo, useState } from 'react';
import { Download, Eye, FileText, CheckCircle2, Plus } from 'lucide-react';

import { toast } from 'sonner';
import { fetchBills, fetchPatients, fetchAppointments, createBill, updateBillStatus } from '../api';
import { Modal } from '../components/Modal';
import { Drawer } from '../components/Drawer';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

interface BillRecord {
  BillID: string;
  PatientID: string;
  AppointmentID: string;
  TotalAmount: number;
  PaymentStatus: string;
  BillDate: string;
}

interface PatientRecord {
  PatientID: string;
  FirstName?: string;
  LastName?: string;
}

interface AppointmentRecord {
  appointmentId: string;
  appointmentDate: string;
  patient?: {
    id: string;
  };
  DoctorID?: string;
}

export function Billing() {
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);

  const [newBillID, setNewBillID] = useState(`B${Date.now().toString().slice(-6)}`);
  const [newBillDate, setNewBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [billResponse, patientResponse, appointmentResponse] = await Promise.all([
        fetchBills().catch(() => ({ data: [] })),
        fetchPatients().catch(() => ({ data: [] })),
        fetchAppointments().catch(() => ({ data: [] }))
      ]);

      setBills(billResponse.data || []);
      setPatients(patientResponse.data || []);
      setAppointments(appointmentResponse.data || []);
      if (patientResponse.data?.length) {
        setSelectedPatientId(patientResponse.data[0].PatientID);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unable to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const openAddModal = () => {
    setNewBillID(`B${Math.floor(100000 + Math.random() * 900000)}`);
    setNewBillDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedAppointmentId('');
      return;
    }

    const matchingAppointments = appointments
      .filter((appointment) => appointment.patient?.id === selectedPatientId)
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

    if (matchingAppointments.length > 0) {
      setSelectedAppointmentId(matchingAppointments[0].appointmentId);
    } else {
      setSelectedAppointmentId('');
    }
  }, [selectedPatientId, appointments]);

  const handleMarkPaid = async (billID: string) => {
    try {
      const response = await updateBillStatus(billID, 'PAID');
      const updated = response.data || { PaymentStatus: 'PAID' };
      setBills((prev) => prev.map((bill) => (bill.BillID === billID ? { ...bill, ...updated, PaymentStatus: 'PAID' } : bill)));
      toast.success(`Bill ${billID} marked as PAID.`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unable to update bill status');
    }
  };

  const handleCreateBill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      BillID: newBillID,
      PatientID: selectedPatientId,
      AppointmentID: selectedAppointmentId || 'N/A',
      TotalAmount: parseFloat((formData.get('TotalAmount') as string) || '0'),
      PaymentStatus: (formData.get('PaymentStatus') as string || 'UNPAID').trim(),
      BillDate: (formData.get('BillDate') as string || newBillDate).trim()
    };

    if (!payload.PatientID || !payload.BillDate || payload.TotalAmount <= 0) {
      toast.error('Please specify a valid patient, date, and invoice amount.');
      return;
    }

    try {
      const response = await createBill(payload);
      const created = response.data || payload;
      setBills((prev) => [created, ...prev]);
      setIsModalOpen(false);
      toast.success(`Invoice ${created.BillID} issued successfully.`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unable to create bill');
    }
  };

  // Real KPI calculations
  const totalPaidRevenue = useMemo(() => {
    return bills
      .filter((b) => String(b.PaymentStatus).toUpperCase() === 'PAID')
      .reduce((sum, b) => sum + (Number(b.TotalAmount) || 0), 0);
  }, [bills]);

  const totalUnpaidOverdue = useMemo(() => {
    return bills
      .filter((b) => String(b.PaymentStatus).toUpperCase() !== 'PAID')
      .reduce((sum, b) => sum + (Number(b.TotalAmount) || 0), 0);
  }, [bills]);

  const filteredBills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bills.filter((bill) => {
      const billId = String(bill.BillID || '').toLowerCase();
      const patId = String(bill.PatientID || '').toLowerCase();
      const apptId = String(bill.AppointmentID || '').toLowerCase();
      const dateVal = String(bill.BillDate || '').toLowerCase();
      const status = String(bill.PaymentStatus || '').toUpperCase();

      const matchesSearch =
        !query ||
        billId.includes(query) ||
        patId.includes(query) ||
        apptId.includes(query) ||
        dateVal.includes(query);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PAID' && status === 'PAID') ||
        (statusFilter === 'UNPAID' && status !== 'PAID');

      return matchesSearch && matchesStatus;
    });
  }, [bills, searchQuery, statusFilter]);

  const handleDownloadInvoice = (bill: BillRecord) => {
    const headers = ['Field', 'Details'];
    const rows: (string | number)[][] = [
      ['Invoice / Bill ID', bill.BillID],
      ['Patient ID', bill.PatientID],
      ['Associated Appointment', bill.AppointmentID || 'N/A'],
      ['Date Issued', bill.BillDate],
      ['Total Amount Due', `$${Number(bill.TotalAmount).toFixed(2)}`],
      ['Payment Status', bill.PaymentStatus],
      ['Facility', 'MediCore Central Hospital & Clinical Center']
    ];
    exportToPDF(`Invoice - ${bill.BillID}`, headers, rows, `Invoice_${bill.BillID}.pdf`);
    toast.success(`Invoice ${bill.BillID} downloaded as PDF`);
  };

  const handleExportCSV = () => {
    const headers = ['Bill ID', 'Patient ID', 'Appointment ID', 'Date', 'Amount', 'Status'];
    const rows: (string | number)[][] = filteredBills.map((b) => [
      b.BillID,
      b.PatientID,
      b.AppointmentID,
      b.BillDate,
      b.TotalAmount,
      b.PaymentStatus
    ]);
    exportToExcel('Billing_Transactions', headers, rows, 'MediCore_Billing_History.xlsx');
    toast.success('Billing report exported to Excel');
  };

  return (
    <div className="space-y-6 relative">
      {/* KPI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Total Collected Revenue</h2>
              <p className="text-xs text-slate-500">Live verified billing totals from clinical records</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Bill</span>
            </button>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-slate-900">
              ${totalPaidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {bills.filter((b) => b.PaymentStatus === 'PAID').length} paid patient invoices on record
          </p>
        </div>

        <div className="lg:col-span-1 bg-rose-700 p-6 rounded-2xl shadow-sm border border-rose-800 flex flex-col justify-center items-center text-center text-white">
          <h2 className="text-xs font-bold text-rose-200 tracking-wider uppercase mb-1">Unpaid Balance</h2>
          <p className="text-3xl font-bold mb-4">
            ${totalUnpaidOverdue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <button
            onClick={() => setStatusFilter(statusFilter === 'UNPAID' ? 'ALL' : 'UNPAID')}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors border border-white/20">
            {statusFilter === 'UNPAID' ? 'Show All' : 'Filter Unpaid'}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Billing History & Invoices</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredBills.length} of {bills.length} invoices
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bill ID, patient, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700">
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="UNPAID">Unpaid Only</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Bill ID</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Patient ID</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Appointment ID</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Date</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Amount</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => {
                const isPaid = String(bill.PaymentStatus).toUpperCase() === 'PAID';
                return (
                  <tr key={bill.BillID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono font-bold text-blue-700">{bill.BillID}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">{bill.PatientID}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-mono">{bill.AppointmentID || '—'}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{bill.BillDate}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">
                      ${Number(bill.TotalAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPaid ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                        {bill.PaymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setIsDrawerOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                        title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(bill)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100"
                        title="Download Invoice PDF">
                        <FileText className="w-4 h-4" />
                      </button>
                      {!isPaid && (
                        <button
                          onClick={() => handleMarkPaid(bill.BillID)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
                          title="Mark as Paid">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    {isLoading ? 'Loading bills...' : 'No invoices matching filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedBill(null);
        }}
        title="Invoice Details">
        {selectedBill && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                Total Amount
              </span>
              <div className="text-3xl font-bold text-slate-900">
                ${Number(selectedBill.TotalAmount || 0).toFixed(2)}
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  String(selectedBill.PaymentStatus).toUpperCase() === 'PAID'
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                {selectedBill.PaymentStatus}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Bill ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedBill.BillID}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Patient ID:</span>
                <span className="font-bold text-blue-700">{selectedBill.PatientID}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Appointment Ref:</span>
                <span className="font-medium text-slate-900">{selectedBill.AppointmentID || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Issue Date:</span>
                <span className="font-medium text-slate-900">{selectedBill.BillDate}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleDownloadInvoice(selectedBill)}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Export Invoice PDF</span>
              </button>
              {String(selectedBill.PaymentStatus).toUpperCase() !== 'PAID' && (
                <button
                  onClick={() => {
                    handleMarkPaid(selectedBill.BillID);
                    setSelectedBill({ ...selectedBill, PaymentStatus: 'PAID' });
                  }}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Paid</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Bill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue New Patient Invoice">
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bill ID</label>
            <input
              type="text"
              name="BillID"
              value={newBillID}
              readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Patient *</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
              {patients.map((p) => (
                <option key={p.PatientID} value={p.PatientID}>
                  {p.PatientID} — {p.FirstName} {p.LastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Appointment Ref</label>
            <input
              type="text"
              name="AppointmentID"
              value={selectedAppointmentId}
              onChange={(e) => setSelectedAppointmentId(e.target.value)}
              placeholder="e.g. APT-001 or General"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="TotalAmount"
                required
                placeholder="150.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Status</label>
              <select
                name="PaymentStatus"
                defaultValue="UNPAID"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bill Date</label>
            <input
              type="date"
              name="BillDate"
              defaultValue={newBillDate}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
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
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm">
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
