export const initialPatients = [
{
  id: 'MC-2024-8840',
  name: 'Johnathan Doe',
  dob: '1980-05-12',
  gender: 'Male',
  contact: '+1 (555) 123-4567',
  address: '123 Elm St, City, 12345',
  history: 'Hypertension'
},
{
  id: 'MC-2024-8841',
  name: 'Sarah Williams',
  dob: '1992-08-24',
  gender: 'Female',
  contact: '+1 (555) 987-6543',
  address: '456 Oak Ave, City, 12345',
  history: 'Penicillin allergy'
},
{
  id: 'MC-2024-8842',
  name: 'Michael Chang',
  dob: '1975-11-03',
  gender: 'Male',
  contact: '+1 (555) 456-7890',
  address: '789 Pine Rd, City, 12345',
  history: 'Type 2 Diabetes'
}];


export const initialAppointments = [
{
  id: 'APT-1001',
  patient: 'Johnathan Doe',
  doctor: 'Dr. Smith',
  date: '2024-10-24',
  time: '09:00 AM',
  type: 'General Consultation',
  status: 'Scheduled'
},
{
  id: 'APT-1002',
  patient: 'Sarah Williams',
  doctor: 'Dr. Chen',
  date: '2024-10-24',
  time: '10:30 AM',
  type: 'Follow-up Visit',
  status: 'Completed'
}];


export const initialBills = [
{
  id: 'INV-5001',
  patient: 'Johnathan Doe',
  date: '2023-10-12',
  amount: 125.0,
  status: 'PAID'
},
{
  id: 'INV-5002',
  patient: 'Sarah Williams',
  date: '2023-10-14',
  amount: 8900.0,
  status: 'UNPAID'
},
{
  id: 'INV-5003',
  patient: 'Michael Chang',
  date: '2023-10-15',
  amount: 450.0,
  status: 'PAID'
},
{
  id: 'INV-5004',
  patient: 'Emma Watson',
  date: '2023-10-16',
  amount: 1200.0,
  status: 'UNPAID'
},
{
  id: 'INV-5005',
  patient: 'David Brown',
  date: '2023-10-18',
  amount: 75.0,
  status: 'PAID'
},
{
  id: 'INV-5006',
  patient: 'Lisa Ray',
  date: '2023-10-20',
  amount: 340.0,
  status: 'PAID'
}];


export const initialMedicines = [
{
  id: 'MD-9821',
  name: 'Amoxicillin 500mg',
  form: 'Capsule',
  manufacturer: 'GSK Pharmaceuticals',
  category: 'ANTIBIOTIC',
  quantity: 1240,
  expiry: '14 Oct 2025',
  status: 'Stable'
},
{
  id: 'MD-7742',
  name: 'Insulin Glargine',
  form: 'Injection',
  manufacturer: 'Novo Nordisk',
  category: 'DIABETIC',
  quantity: 42,
  expiry: '08 Dec 2024',
  status: 'Low Stock'
},
{
  id: 'MD-1029',
  name: 'Paracetamol 650mg',
  form: 'Tablet',
  manufacturer: 'Pfizer',
  category: 'ANALGESIC',
  quantity: 4800,
  expiry: '22 Jan 2026',
  status: 'Stable'
},
{
  id: 'MD-5520',
  name: 'Lipitor (Atorvastatin)',
  form: 'Tablet',
  manufacturer: 'Pfizer',
  category: 'CARDIO',
  quantity: 12,
  expiry: '30 Mar 2025',
  status: 'Critical'
},
{
  id: 'MD-4411',
  name: 'Ventolin Inhaler',
  form: 'Inhaler',
  manufacturer: 'GSK Pharmaceuticals',
  category: 'RESPIRATORY',
  quantity: 215,
  expiry: '11 Aug 2025',
  status: 'Stable'
}];


export const doctors = [
{
  id: 'DOC-1',
  name: 'Dr. Smith',
  spec: 'Cardiology',
  completed: 8,
  remaining: 4
},
{
  id: 'DOC-2',
  name: 'Dr. Chen',
  spec: 'Neurology',
  completed: 6,
  remaining: 6
},
{
  id: 'DOC-3',
  name: 'Dr. Vance',
  spec: 'General Medicine',
  completed: 10,
  remaining: 2
},
{
  id: 'DOC-4',
  name: 'Dr. Kaur',
  spec: 'Pediatrics',
  completed: 5,
  remaining: 7
},
{
  id: 'DOC-5',
  name: 'Dr. Rossi',
  spec: 'Orthopedics',
  completed: 7,
  remaining: 3
},
{
  id: 'DOC-6',
  name: 'Dr. Blanco',
  spec: 'Cardiology',
  completed: 4,
  remaining: 8
},
{
  id: 'DOC-7',
  name: 'Dr. Okafor',
  spec: 'Neurology',
  completed: 9,
  remaining: 1
},
{
  id: 'DOC-8',
  name: 'Dr. Silva',
  spec: 'General Medicine',
  completed: 3,
  remaining: 9
},
{
  id: 'DOC-9',
  name: 'Dr. Patel',
  spec: 'Pediatrics',
  completed: 8,
  remaining: 4
},
{
  id: 'DOC-10',
  name: 'Dr. Müller',
  spec: 'Orthopedics',
  completed: 6,
  remaining: 6
}];


export const triageCases = [
{
  id: 'TRG-1',
  patient: 'Johnathan Doe',
  condition: 'Acute Chest Pain',
  arrival: '10:14 AM',
  doctor: 'Dr. Smith',
  status: 'CRITICAL'
},
{
  id: 'TRG-2',
  patient: 'Sarah Williams',
  condition: 'Multiple Trauma',
  arrival: '10:28 AM',
  doctor: 'Dr. Chen',
  status: 'STABILIZING'
},
{
  id: 'TRG-3',
  patient: 'Michael Chang',
  condition: 'Mild Concussion',
  arrival: '11:05 AM',
  doctor: 'Dr. Vance',
  status: 'STABLE'
}];


export const revenueData = [
{ name: 'May', inpatient: 40000, outpatient: 24000 },
{ name: 'Jun', inpatient: 45000, outpatient: 22000 },
{ name: 'Jul', inpatient: 55000, outpatient: 28000 },
{ name: 'Aug', inpatient: 65000, outpatient: 25000 },
{ name: 'Sep', inpatient: 48000, outpatient: 20000 },
{ name: 'Oct', inpatient: 60000, outpatient: 24200 }];


export const biRevenueData = [
{ name: 'Jan', projected: 180000, actual: 175000 },
{ name: 'Feb', projected: 190000, actual: 185000 },
{ name: 'Mar', projected: 210000, actual: 200000 },
{ name: 'Apr', projected: 230000, actual: 220000 },
{ name: 'May', projected: 260000, actual: 255000 },
{ name: 'Jun', projected: 280000, actual: 270000 }];


export const initialMedicalRecords = [
{
  id: 'MR-3301',
  patientId: 'MC-2024-8840',
  patientName: 'Johnathan Doe',
  doctor: 'Dr. Smith',
  spec: 'Cardiology',
  diagnosis: 'Hypertension Follow-up',
  date: '2024-10-20',
  status: 'Active Treatment',
  plan: 'Continue Lisinopril. Monitor BP daily.',
  meds: ['Lisinopril'],
  notes: 'Patient reports occasional dizziness.'
},
{
  id: 'MR-3302',
  patientId: 'MC-2024-8842',
  patientName: 'Michael Chang',
  doctor: 'Dr. Vance',
  spec: 'General Medicine',
  diagnosis: 'Type 2 Diabetes Mellitus',
  date: '2024-10-18',
  status: 'Under Observation',
  plan: 'Dietary changes, start Metformin.',
  meds: ['Metformin'],
  notes: 'HbA1c is 7.8%.'
},
{
  id: 'MR-3303',
  patientId: 'MC-2024-8841',
  patientName: 'Sarah Williams',
  doctor: 'Dr. Chen',
  spec: 'Neurology',
  diagnosis: 'Migraine Management',
  date: '2024-10-15',
  status: 'Resolved',
  plan: 'Rest, avoid triggers.',
  meds: ['Paracetamol 650mg'],
  notes: 'Frequency of attacks decreased.'
},
{
  id: 'MR-3304',
  patientId: 'MC-2024-8843',
  patientName: 'Emma Watson',
  doctor: 'Dr. Rossi',
  spec: 'Orthopedics',
  diagnosis: 'Post-Surgical Recovery — Appendectomy',
  date: '2024-10-10',
  status: 'Resolved',
  plan: 'Wound care, light activity.',
  meds: ['Amoxicillin 500mg'],
  notes: 'Healing well, no signs of infection.'
},
{
  id: 'MR-3305',
  patientId: 'MC-2024-8844',
  patientName: 'David Brown',
  doctor: 'Dr. Kaur',
  spec: 'Pediatrics',
  diagnosis: 'Acute Bronchitis',
  date: '2024-10-22',
  status: 'Active Treatment',
  plan: 'Inhaler use as needed.',
  meds: ['Ventolin Inhaler'],
  notes: 'Cough persists at night.'
},
{
  id: 'MR-3306',
  patientId: 'MC-2024-8845',
  patientName: 'Lisa Ray',
  doctor: 'Dr. Silva',
  spec: 'General Medicine',
  diagnosis: 'Routine Prenatal Checkup',
  date: '2024-10-23',
  status: 'Under Observation',
  plan: 'Vitamins, regular scans.',
  meds: [],
  notes: 'All vitals normal.'
}];


export const initialStaff = [
{
  id: 'ST-1042',
  name: 'Alice Johnson',
  role: 'Nurse',
  dept: 'ICU',
  shift: 'Morning',
  status: 'On Duty'
},
{
  id: 'ST-1043',
  name: 'Bob Smith',
  role: 'Lab Technician',
  dept: 'Laboratory',
  shift: 'Evening',
  status: 'Off Duty'
},
{
  id: 'ST-1044',
  name: 'Carol White',
  role: 'Receptionist',
  dept: 'Front Desk',
  shift: 'Morning',
  status: 'On Duty'
},
{
  id: 'ST-1045',
  name: 'Dave Brown',
  role: 'Ward Assistant',
  dept: 'General Ward',
  shift: 'Night',
  status: 'On Duty'
},
{
  id: 'ST-1046',
  name: 'Eve Davis',
  role: 'Pharmacy Assistant',
  dept: 'Pharmacy',
  shift: 'Morning',
  status: 'On Leave'
},
{
  id: 'ST-1047',
  name: 'Frank Miller',
  role: 'Security Officer',
  dept: 'Front Desk',
  shift: 'Night',
  status: 'On Duty'
},
{
  id: 'ST-1048',
  name: 'Grace Wilson',
  role: 'Nurse',
  dept: 'Pediatrics',
  shift: 'Evening',
  status: 'On Duty'
}];


export const initialPrescriptions = [
{
  id: 'PR-2201',
  patient: 'Johnathan Doe',
  doctor: 'Dr. Smith',
  meds: ['Lisinopril ×1'],
  date: '2024-10-20',
  status: 'Dispensed'
},
{
  id: 'PR-2202',
  patient: 'Michael Chang',
  doctor: 'Dr. Vance',
  meds: ['Metformin ×2'],
  date: '2024-10-18',
  status: 'Pending'
},
{
  id: 'PR-2203',
  patient: 'Sarah Williams',
  doctor: 'Dr. Chen',
  meds: ['Paracetamol 650mg ×1'],
  date: '2024-10-15',
  status: 'Dispensed'
},
{
  id: 'PR-2204',
  patient: 'Emma Watson',
  doctor: 'Dr. Rossi',
  meds: ['Amoxicillin 500mg ×2'],
  date: '2024-10-10',
  status: 'Dispensed'
},
{
  id: 'PR-2205',
  patient: 'David Brown',
  doctor: 'Dr. Kaur',
  meds: ['Ventolin Inhaler ×1'],
  date: '2024-10-22',
  status: 'Pending'
},
{
  id: 'PR-2206',
  patient: 'Lisa Ray',
  doctor: 'Dr. Silva',
  meds: ['Prenatal Vitamins ×1'],
  date: '2024-10-23',
  status: 'Cancelled'
}];


export const initialAmbulances = [
{
  id: 'AMB-01',
  status: 'Available',
  driver: 'Tom Harris',
  location: 'Hospital Bay 1'
},
{
  id: 'AMB-02',
  status: 'On Call',
  driver: 'Jerry Lee',
  location: 'En route to Colombo 07'
},
{
  id: 'AMB-03',
  status: 'Available',
  driver: 'Mike Clark',
  location: 'Hospital Bay 2'
},
{
  id: 'AMB-04',
  status: 'Maintenance',
  driver: 'Unassigned',
  location: 'Garage'
},
{
  id: 'AMB-05',
  status: 'Available',
  driver: 'Steve Young',
  location: 'Hospital Bay 3'
},
{
  id: 'AMB-06',
  status: 'On Call',
  driver: 'Paul Walker',
  location: 'En route to Colombo 05'
}];


export const initialDispatchLogs = [
{
  id: 'DL-1',
  type: 'Emergency',
  time: '10:45 AM',
  desc: 'Emergency pickup — Cardiac arrest, Colombo 05 → ICU Wing A',
  vehicle: 'AMB-06',
  status: 'In Progress'
},
{
  id: 'DL-2',
  type: 'Transfer',
  time: '09:30 AM',
  desc: 'Patient Transfer — General Ward → Rehab Center',
  vehicle: 'AMB-02',
  status: 'In Progress'
},
{
  id: 'DL-3',
  type: 'Emergency',
  time: '08:15 AM',
  desc: 'Emergency pickup — Trauma, Colombo 03',
  vehicle: 'AMB-01',
  status: 'Completed'
}];


export const initialBloodStock = [
{ group: 'A+', units: 24, status: 'Sufficient' },
{ group: 'A-', units: 12, status: 'Low' },
{ group: 'B+', units: 18, status: 'Sufficient' },
{ group: 'B-', units: 9, status: 'Low' },
{ group: 'AB+', units: 15, status: 'Sufficient' },
{ group: 'AB-', units: 3, status: 'Critical' },
{ group: 'O+', units: 32, status: 'Sufficient' },
{ group: 'O-', units: 20, status: 'Sufficient' }];


export const initialTransfusions = [
{
  id: 'TR-501',
  patient: 'Johnathan Doe',
  group: 'O+',
  units: 2,
  date: '2024-10-24',
  adminBy: 'Alice Johnson',
  status: 'Completed'
},
{
  id: 'TR-502',
  patient: 'Sarah Williams',
  group: 'A-',
  units: 1,
  date: '2024-10-23',
  adminBy: 'Grace Wilson',
  status: 'Completed'
},
{
  id: 'TR-503',
  patient: 'Emma Watson',
  group: 'B+',
  units: 3,
  date: '2024-10-22',
  adminBy: 'Alice Johnson',
  status: 'Completed'
},
{
  id: 'TR-504',
  patient: 'David Brown',
  group: 'O-',
  units: 1,
  date: '2024-10-21',
  adminBy: 'Grace Wilson',
  status: 'Completed'
},
{
  id: 'TR-505',
  patient: 'Michael Chang',
  group: 'AB+',
  units: 2,
  date: '2024-10-20',
  adminBy: 'Alice Johnson',
  status: 'Completed'
}];


export const initialLabTests = [
{
  id: 'LB-7701',
  patient: 'Johnathan Doe',
  type: 'Complete Blood Count (CBC)',
  reqBy: 'Dr. Smith',
  date: '2024-10-24',
  status: 'Completed',
  result: 'Normal',
  range: 'N/A',
  flag: 'Normal',
  tech: 'Bob Smith',
  notes: ''
},
{
  id: 'LB-7702',
  patient: 'Michael Chang',
  type: 'HbA1c',
  reqBy: 'Dr. Vance',
  date: '2024-10-24',
  status: 'Result: Abnormal',
  result: '7.8%',
  range: 'Normal: < 5.7%',
  flag: 'Abnormal — High',
  tech: 'Bob Smith',
  notes: 'Patient advised to consult doctor.'
},
{
  id: 'LB-7703',
  patient: 'Sarah Williams',
  type: 'Lipid Profile',
  reqBy: 'Dr. Chen',
  date: '2024-10-24',
  status: 'Pending',
  result: '',
  range: '',
  flag: '',
  tech: '',
  notes: ''
},
{
  id: 'LB-7704',
  patient: 'Emma Watson',
  type: 'Urinalysis',
  reqBy: 'Dr. Rossi',
  date: '2024-10-23',
  status: 'In Progress',
  result: '',
  range: '',
  flag: '',
  tech: '',
  notes: ''
},
{
  id: 'LB-7705',
  patient: 'David Brown',
  type: 'Liver Function Test',
  reqBy: 'Dr. Kaur',
  date: '2024-10-23',
  status: 'Completed',
  result: 'Normal',
  range: 'N/A',
  flag: 'Normal',
  tech: 'Bob Smith',
  notes: ''
},
{
  id: 'LB-7706',
  patient: 'Lisa Ray',
  type: 'COVID-19 PCR',
  reqBy: 'Dr. Silva',
  date: '2024-10-22',
  status: 'Completed',
  result: 'Negative',
  range: 'Negative',
  flag: 'Normal',
  tech: 'Bob Smith',
  notes: ''
}];