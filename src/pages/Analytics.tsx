import { Fragment } from 'react';
import {
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp } from
'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from
'recharts';
import { biRevenueData } from '../data/mockData';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
const COLORS = ['#1d4ed8', '#0d9488', '#dc2626', '#94a3b8'];
export function Analytics() {
  // Generate heatmap data
  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getHeatmapColor = (val: number) => {
    if (val < 20) return 'bg-blue-50';
    if (val < 40) return 'bg-blue-200';
    if (val < 60) return 'bg-blue-400';
    if (val < 80) return 'bg-blue-600';
    return 'bg-blue-800';
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            System Performance & BI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time clinical and operational intelligence overview.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            All Departments
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button
            onClick={() => {
              const headers = ['Month', 'Projected Revenue', 'Actual Revenue'];
              const rows: (string | number)[][] = biRevenueData.map((d) => [d.name, `$${d.projected.toLocaleString()}`, `$${d.actual.toLocaleString()}`]);
              exportToPDF('MediCore BI Analytics Report', headers, rows, 'MediCore_Analytics_Report.pdf');
            }}
            className="flex items-center space-x-1 text-sm font-medium text-teal-600 hover:text-teal-700">
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => {
              const headers = ['Month', 'Projected Revenue', 'Actual Revenue'];
              const rows: (string | number)[][] = biRevenueData.map((d) => [d.name, d.projected, d.actual]);
              exportToExcel('BI Analytics', headers, rows, 'MediCore_Analytics_Report.xlsx');
            }}
            className="flex items-center space-x-1 text-sm font-medium text-teal-600 hover:text-teal-700">
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Revenue Trend</h2>
            <div className="flex items-center space-x-4 text-sm font-medium text-slate-600">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-700 mr-2"></span>
                Projected
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-teal-600 mr-2"></span>
                Actual
              </div>
            </div>
          </div>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={biRevenueData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12
                  }}
                  dy={10} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 12
                  }}
                  tickFormatter={(val) => `$${val / 1000}k`} />
                
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  dot={false} />
                
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#0d9488"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                Total Revenue
              </div>
              <div className="text-2xl font-bold text-slate-900">
                $1,248,000
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                Growth Rate
              </div>
              <div className="text-2xl font-bold text-teal-600">+12.4%</div>
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Top Medicines
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                    {
                      name: 'Amoxicillin',
                      value: 34
                    },
                    {
                      name: 'Paracetamol',
                      value: 28
                    },
                    {
                      name: 'Insulin',
                      value: 18
                    },
                    {
                      name: 'Other',
                      value: 20
                    }]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none">
                    
                    {[
                    {
                      name: 'Amoxicillin',
                      value: 34
                    },
                    {
                      name: 'Paracetamol',
                      value: 28
                    },
                    {
                      name: 'Insulin',
                      value: 18
                    },
                    {
                      name: 'Other',
                      value: 20
                    }].
                    map((_, index) =>
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]} />

                    )}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-xl font-bold text-slate-900">
                  5,204
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Units
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700 mr-2"></span>
                <span className="text-slate-600 font-medium">Amoxicillin</span>
              </div>
              <span className="font-bold text-slate-900">34%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 mr-2"></span>
                <span className="text-slate-600 font-medium">Paracetamol</span>
              </div>
              <span className="font-bold text-slate-900">28%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 mr-2"></span>
                <span className="text-slate-600 font-medium">Insulin</span>
              </div>
              <span className="font-bold text-slate-900">18%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span>
                <span className="text-slate-600 font-medium">Other</span>
              </div>
              <span className="font-bold text-slate-900">20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Doctor Workload (Daily Avg)
          </h2>
          <div className="space-y-5">
            {[
            {
              name: 'Dr. Elizabeth Smith',
              count: 18,
              pct: 90
            },
            {
              name: 'Dr. Marcus Thorne',
              count: 14,
              pct: 70
            },
            {
              name: 'Dr. Sarah Vance',
              count: 12,
              pct: 60
            },
            {
              name: 'Dr. Alan Rickman',
              count: 8,
              pct: 40
            }].
            map((doc) =>
            <div key={doc.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700">
                    {doc.name}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {doc.count} Patients
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                  className="bg-blue-700 h-2 rounded-full"
                  style={{
                    width: `${doc.pct}%`
                  }}>
                </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Admission Density
            </h2>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <span>Low</span>
              <div className="w-16 h-2 rounded bg-gradient-to-r from-blue-50 to-blue-800"></div>
              <span>High</span>
            </div>
          </div>
          <div className="flex flex-col h-48 justify-between">
            <div className="flex-1 grid grid-cols-7 gap-2">
              {days.map((day, rIdx) =>
              <Fragment key={day}>
                  {hours.map((_, cIdx) => {
                  const val = Math.floor(Math.random() * 100);
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`rounded-md ${getHeatmapColor(val)}`}
                      title={`${day} ${hours[cIdx]}: ${val}%`}>
                    </div>);

                })}
                </Fragment>
              )}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 tracking-wider">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex items-center p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-4 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Critical Capacity
            </h3>
            <p className="text-xs text-slate-500">
              ICU Wing A reaching 95% occupancy.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex items-center p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600"></div>
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mr-4 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Inventory Synced
            </h3>
            <p className="text-xs text-slate-500">
              Pharmacy stock levels verified 12m ago.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex items-center p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-700"></div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Efficiency Gain
            </h3>
            <p className="text-xs text-slate-500">
              Patient processing speed up by 4% this week.
            </p>
          </div>
        </div>
      </div>
    </div>);

}