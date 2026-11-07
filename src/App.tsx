import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate } from
'react-router-dom';
import { Toaster } from 'sonner';
import {
  LayoutGrid,
  UserPlus,
  CalendarDays,
  CreditCard,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Bell,
  LogOut,
  Plus } from 'lucide-react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Billing } from './pages/Billing';
import { MedicineStock } from './pages/MedicineStock';
import { Analytics } from './pages/Analytics';
import { MedicalRecords } from './pages/MedicalRecords';
import { Doctors } from './pages/Doctors';
import { Staff } from './pages/Staff';
import { RoomsBeds } from './pages/RoomsBeds';
import { Prescriptions } from './pages/Prescriptions';
import { Ambulance } from './pages/Ambulance';
import { BloodBank } from './pages/BloodBank';
import { Laboratory } from './pages/Laboratory';
import {
  ClipboardList,
  Stethoscope,
  Users,
  BedDouble,
  Pill,
  Ambulance as AmbulanceIcon,
  Droplet,
  FlaskConical } from
'lucide-react';
function AppShell({ children }: {children: React.ReactNode;}) {
  const location = useLocation();
  const navigate = useNavigate();
  const authUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('authUser') || '{}');
    } catch {
      return {};
    }
  })();
  const username = authUser.username || authUser.name || 'Admin';
  const userRole = authUser.role || 'Administrator';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login');
  };
  const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      placeholder: 'Search analytics data...'
    },
    {
      path: '/analytics',
      label: 'BI Analytics',
      icon: BarChart3,
      placeholder: 'Search global records...'
    }]

  },
  {
    label: 'PATIENT CARE',
    items: [
    {
      path: '/patients',
      label: 'Patient Registration',
      icon: UserPlus,
      placeholder: 'Quick find patient (Ctrl + K)'
    },
    {
      path: '/appointments',
      label: 'Appointment Booking',
      icon: CalendarDays,
      placeholder: 'Search patient ID, doctor, or record...'
    },
    {
      path: '/medical-records',
      label: 'Medical Records',
      icon: ClipboardList,
      placeholder: 'Search by patient name or record ID...'
    },
    {
      path: '/laboratory',
      label: 'Laboratory',
      icon: FlaskConical,
      placeholder: 'Search by patient or test ID...'
    }]

  },
  {
    label: 'CLINICAL STAFF',
    items: [
    {
      path: '/doctors',
      label: 'Doctor Management',
      icon: Stethoscope,
      placeholder: 'Search doctors by name or department...'
    },
    {
      path: '/staff',
      label: 'Staff Management',
      icon: Users,
      placeholder: 'Search staff by name, role, or department...'
    }]

  },
  {
    label: 'FACILITIES',
    items: [
    {
      path: '/rooms-beds',
      label: 'Room & Bed Management',
      icon: BedDouble,
      placeholder: 'Search rooms or beds...'
    },
    {
      path: '/ambulance',
      label: 'Ambulance Management',
      icon: AmbulanceIcon,
      placeholder: 'Search dispatch logs...'
    }]

  },
  {
    label: 'PHARMACY & FINANCE',
    items: [
    {
      path: '/medicine-stock',
      label: 'Medicine Stock',
      icon: Package,
      placeholder: 'Search pharmacy database...'
    },
    {
      path: '/prescriptions',
      label: 'Prescriptions',
      icon: Pill,
      placeholder: 'Search by patient or prescription ID...'
    },
    {
      path: '/billing',
      label: 'Billing',
      icon: CreditCard,
      placeholder: 'Search bills, patients, or transactions...'
    },
    {
      path: '/blood-bank',
      label: 'Blood Bank',
      icon: Droplet,
      placeholder: 'Search transfusion records...'
    }]

  }];

  const allNavItems = navGroups.flatMap((g) => g.items);
  const currentNav =
  allNavItems.find((item) => item.path === location.pathname) ||
  allNavItems[0];
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <Plus className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-[#1e3a8a] text-lg leading-tight">
              MediCore HMS
            </span>
          </div>
          <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
            High-Stakes Clinical System
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) =>
          <div key={group.label}>
              <h3 className="px-3 text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 relative' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    
                      {isActive &&
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-700 rounded-r-full" />
                    }
                      <Icon
                      className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                    
                      <span>{item.label}</span>
                    </button>);

              })}
              </div>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-1">
          <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span>Support</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={currentNav.placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent" />
              
            </div>
          </div>

          <div className="flex items-center space-x-6 ml-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
                <img
                  src="https://i.pravatar.cc/150?u=sarah"
                  alt="Dr. Sarah Vance"
                  className="w-full h-full object-cover" />
                
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 leading-none">
                  {username}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">
                  {userRole}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="ml-4 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-1.5">
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1280px] mx-auto">{children}</div>
        </main>
      </div>
    </div>);

}
export function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
          <AppShell>
              <Dashboard />
            </AppShell>
          } />
        
        <Route
          path="/patients"
          element={
          <AppShell>
              <Patients />
            </AppShell>
          } />
        
        <Route
          path="/appointments"
          element={
          <AppShell>
              <Appointments />
            </AppShell>
          } />
        
        <Route
          path="/billing"
          element={
          <AppShell>
              <Billing />
            </AppShell>
          } />
        
        <Route
          path="/medicine-stock"
          element={
          <AppShell>
              <MedicineStock />
            </AppShell>
          } />
        
        <Route
          path="/analytics"
          element={
          <AppShell>
              <Analytics />
            </AppShell>
          } />
        
        <Route
          path="/medical-records"
          element={
          <AppShell>
              <MedicalRecords />
            </AppShell>
          } />
        
        <Route
          path="/doctors"
          element={
          <AppShell>
              <Doctors />
            </AppShell>
          } />
        
        <Route
          path="/staff"
          element={
          <AppShell>
              <Staff />
            </AppShell>
          } />
        
        <Route
          path="/rooms-beds"
          element={
          <AppShell>
              <RoomsBeds />
            </AppShell>
          } />
        
        <Route
          path="/prescriptions"
          element={
          <AppShell>
              <Prescriptions />
            </AppShell>
          } />
        
        <Route
          path="/ambulance"
          element={
          <AppShell>
              <Ambulance />
            </AppShell>
          } />
        
        <Route
          path="/blood-bank"
          element={
          <AppShell>
              <BloodBank />
            </AppShell>
          } />
        
        <Route
          path="/laboratory"
          element={
          <AppShell>
              <Laboratory />
            </AppShell>
          } />
        
      </Routes>
    </BrowserRouter>);

}