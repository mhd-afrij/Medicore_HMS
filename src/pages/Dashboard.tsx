import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Download,
  Users,
  Wallet,
  AlertTriangle,
  Asterisk,
  BedDouble } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar } from 'recharts';
import { triageCases, revenueData as mockRevenueData } from '../data/mockData';
import { exportToPDF } from '../utils/exportUtils';
import {
  fetchPatients,
  fetchBills,
  fetchAppointments,
  fetchMedicines,
  fetchRooms,
  fetchDoctors
} from '../api';

const COLORS = ['#1d4ed8', '#0d9488', '#f43f5e', '#94a3b8'];

export function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadDashboardData() {
      try {
        const [pResp, bResp, aResp, mResp, rResp, dResp] = await Promise.all([
          fetchPatients().catch(() => ({ data: [] })),
          fetchBills().catch(() => ({ data: [] })),
          fetchAppointments().catch(() => ({ data: [] })),
          fetchMedicines().catch(() => ({ data: [] })),
          fetchRooms().catch(() => ({ data: [] })),
          fetchDoctors().catch(() => ({ data: [] }))
        ]);

        if (!mounted) return;
        setPatients(pResp?.data || []);
        setBills(bResp?.data || []);
        setAppointments(aResp?.data || []);
        setMedicines(mResp?.data || []);
        setRooms(rResp?.data || []);
        setDoctorsList(dResp?.data || []);
      } catch (e) {
        console.error('Failed to load dashboard metrics', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadDashboardData();
    return () => { mounted = false; };
  }, []);

  const totalPatients = patients.length;
  const totalRevenue = bills
    .filter((b) => String(b.PaymentStatus).toUpperCase() === 'PAID')
    .reduce((sum, b) => sum + (Number(b.TotalAmount) || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointments.filter((a) => {
    const d = a.AppointmentDate || a.appointmentDate;
    return d ? String(d).startsWith(todayStr) : false;
  }).length || appointments.length;

  const lowStockCount = medicines.filter((m) => (Number(m.StockQuantity) || 0) <= 15).length;
  const totalRoomsCount = rooms.length || 24;

  // Real or enhanced doctor workload
  const doctorWorkloadData = doctorsList.length > 0
    ? doctorsList.slice(0, 5).map((doc) => {
        const docId = doc.DoctorID || doc.ID;
        const assignedCount = appointments.filter((a) => (a.DoctorID || a.doctor?.id) === docId).length;
        return {
          name: doc.DoctorName ? doc.DoctorName.replace(/^Dr.s*/i, '') : doc.FirstName || 'Doctor',
          completed: assignedCount,
          remaining: Math.max(1, 8 - assignedCount)
        };
      })
    : [
        { name: 'Chen', completed: 8, remaining: 2 },
        { name: 'Vance', completed: 6, remaining: 4 },
        { name: 'Marcus', completed: 5, remaining: 5 },
        { name: 'Reyes', completed: 9, remaining: 1 },
        { name: 'Gupta', completed: 7, remaining: 3 }
      ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownloadReport = () => {
    const headers = ['Metric', 'Current Value'];
    const rows: (string | number)[][] = [
      ['Total Registered Patients', totalPatients],
      ['Total Collected Revenue', `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Active Appointments', appointments.length],
      ['Medicine Stock Critical Alerts', `${lowStockCount} items requiring restock`],
      ['Total Monitored Rooms / Suites', totalRoomsCount],
      ['Active Clinical Staff', doctorsList.length]
    ];
    exportToPDF('MediCore Hospital - Clinical Executive Report', headers, rows, 'MediCore_Clinical_Summary.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Clinical Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {currentDate} &bull; Live Hospital Performance & Operations
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/appointments')}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span>Manage Schedule</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-700" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
              Active
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
            Total Patients
          </h3>
          <p className="text-3xl font-bold text-slate-900">{totalPatients}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-700" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
              Verified
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
            Paid Revenue
          </h3>
          <p className="text-3xl font-bold text-slate-900">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-700" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              Queue
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
            Appointments
          </h3>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
            <span className="text-xs text-slate-500 font-medium">({appointmentsToday} today)</span>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
              {lowStockCount > 0 ? 'CRITICAL' : 'OK'}
            </span>
          </div>
          <h3 className="text-xs font-bold text-red-500 tracking-wider uppercase mb-1">
            Low Stock Alerts
          </h3>
          <p className="text-3xl font-bold text-red-600">{lowStockCount} items</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <BedDouble className="w-5 h-5 text-blue-700" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
              Facilities
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
            Hospital Rooms
          </h3>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-slate-900">{totalRoomsCount}</p>
            <span className="text-sm text-slate-500 font-medium">Suites</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue Trends</h2>
              <p className="text-xs text-slate-500">Inpatient vs Outpatient billing flow</p>
            </div>
            <div className="flex items-center space-x-4 text-sm font-medium text-slate-600">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-700 mr-2"></span>
                Inpatient
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-teal-600 mr-2"></span>
                Outpatient
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockRevenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInpatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutpatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${Number(value || 0).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="inpatient" stroke="#1d4ed8" strokeWidth={3} fillOpacity={1} fill="url(#colorInpatient)" />
                <Area type="monotone" dataKey="outpatient" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorOutpatient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Top Prescribed Categories
          </h2>
          <p className="text-xs text-slate-500 mb-4">Formulary distribution in pharmacy</p>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[190px]">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Antibiotics', value: 38 },
                    { name: 'Cardiovascular', value: 26 },
                    { name: 'Analgesics', value: 20 },
                    { name: 'Others', value: 16 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none">
                  {[0, 1, 2, 3].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-bold text-slate-900">
                  {medicines.length}
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total SKUs
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700 mr-2"></span>
                <span className="text-slate-600 font-medium">Antibiotics</span>
              </div>
              <span className="font-bold text-slate-900">38%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 mr-2"></span>
                <span className="text-slate-600 font-medium">Cardiovascular</span>
              </div>
              <span className="font-bold text-slate-900">26%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Workload */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Doctor Workload & Capacity
            </h2>
            <p className="text-sm text-slate-500">
              Active consultations and remaining slot capacity
            </p>
          </div>
          <button
            onClick={() => navigate('/doctors')}
            className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors">
            View All Doctors →
          </button>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={doctorWorkloadData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="completed" stackId="a" fill="#1d4ed8" radius={[0, 0, 4, 4]} name="Active Bookings" />
              <Bar dataKey="remaining" stackId="a" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="Available Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Emergency Triage */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center pl-8">
          <div className="flex items-center space-x-2">
            <Asterisk className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Live Emergency Triage
            </h2>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
            {triageCases.length + 1} Active Cases
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-8 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Patient
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Condition
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Arrival
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Assigned MD
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {triageCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-8 text-sm font-bold text-slate-900">
                    {caseItem.patient}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                    {caseItem.condition}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">
                    {caseItem.arrival}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-900 font-medium flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      <img
                        src={`https://i.pravatar.cc/150?u=${encodeURIComponent(caseItem.doctor)}`}
                        alt={caseItem.doctor}
                        className="w-full h-full object-cover" />
                    </div>
                    <span>{caseItem.doctor}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        caseItem.status === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : caseItem.status === 'STABILIZING'
                          ? 'bg-amber-500 text-white'
                          : 'bg-teal-600 text-white'
                      }`}>
                      {caseItem.status}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-8 text-sm font-bold text-slate-900">
                  Ambulance Dispatch #AMB-02
                </td>
                <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                  Severe Trauma / Emergency
                </td>
                <td className="py-4 px-6 text-sm text-slate-500">In Transit</td>
                <td className="py-4 px-6 text-sm text-slate-900 font-medium flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <img
                      src="https://i.pravatar.cc/150?u=Dr.Blanco"
                      alt="Dr. Blanco"
                      className="w-full h-full object-cover" />
                  </div>
                  <span>Dr. Blanco</span>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white animate-pulse">
                    INCOMING
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
