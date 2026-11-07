const API_BASE = import.meta.env.VITE_API_BASE?.trim() || 'http://localhost:3000';
// Log the resolved API base at runtime to help diagnose mis-configured requests
try {
  console.debug('API_BASE=', API_BASE);
} catch {
  /* ignore */
}

function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

async function handleResponse(response: Response) {
  const text = await response.text();
  // If response is empty, return null
  if (!text) {
    if (!response.ok) throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    return null;
  }

  // If server returned HTML (starts with '<'), surface a clearer error
  const trimmed = text.trimStart();
  if (trimmed.startsWith('<')) {
    const snippet = trimmed.substring(0, 200);
    throw new Error(`Non-JSON response received (status ${response.status}). Response begins with: ${snippet}`);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON response (status ${response.status}): ${String(err)} -- response: ${text.substring(0,200)}`);
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.message || response.statusText || 'Request failed';
    // Include validation/details when available to aid UI feedback
    const details = data?.error?.details;
    if (Array.isArray(details) && details.length) {
      throw new Error(`${message}: ${details.join('; ')}`);
    }
    throw new Error(message);
  }

  return data;
}

export async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch {
    throw new Error('Unable to connect to the backend.');
  }

  return handleResponse(response);
}

export async function fetchPatients() {
  return request('/api/patients');
}

export async function createPatient(patient: Record<string, any>) {
  return request('/api/patients', {
    method: 'POST',
    body: JSON.stringify(patient)
  });
}

export async function updatePatient(id: string | number, patient: Record<string, any>) {
  return request(`/api/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patient)
  });
}

export async function deletePatient(id: string | number) {
  return request(`/api/patients/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchDoctors() {
  return request('/api/doctors');
}

export async function fetchPrescriptions() {
  return request('/api/prescriptions');
}

export async function createDoctor(doctor: Record<string, any>) {
  return request('/api/doctors', {
    method: 'POST',
    body: JSON.stringify(doctor)
  });
}

export async function updateDoctor(id: string | number, doctor: Record<string, any>) {
  return request(`/api/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(doctor)
  });
}

export async function deleteDoctor(id: string | number) {
  return request(`/api/doctors/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchBills() {
  return request('/api/bills');
}

export async function createBill(bill: Record<string, any>) {
  return request('/api/bills', {
    method: 'POST',
    body: JSON.stringify(bill)
  });
}

export async function updateBillStatus(id: string | number, status: string) {
  return request(`/api/bills/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ PaymentStatus: status })
  });
}

export async function fetchStaff() {
  return request('/api/staff');
}

export async function createStaff(staff: Record<string, any>) {
  return request('/api/staff', {
    method: 'POST',
    body: JSON.stringify(staff)
  });
}

export async function updateStaff(id: string | number, staff: Record<string, any>) {
  return request(`/api/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(staff)
  });
}

export async function deleteStaff(id: string | number) {
  return request(`/api/staff/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchAppointments() {
  return request('/api/appointments');
}

export async function createAppointment(appointment: Record<string, any>) {
  return request('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment)
  });
}

export async function updateAppointment(id: string | number, appointment: Record<string, any>) {
  return request(`/api/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointment)
  });
}

export async function deleteAppointment(id: string | number) {
  return request(`/api/appointments/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchDepartments() {
  return request('/api/departments');
}

export async function fetchMedicalRecords() {
  return request('/api/medical-records');
}

export async function createMedicalRecord(record: Record<string, any>) {
  return request('/api/medical-records', {
    method: 'POST',
    body: JSON.stringify(record)
  });
}

export async function updateMedicalRecord(id: string | number, record: Record<string, any>) {
  return request(`/api/medical-records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(record)
  });
}

export async function deleteMedicalRecord(id: string | number) {
  return request(`/api/medical-records/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchLabTests() {
  return request('/api/lab-tests');
}

export async function createLabTest(test: Record<string, any>) {
  return request('/api/lab-tests', {
    method: 'POST',
    body: JSON.stringify(test)
  });
}

export async function updateLabTest(id: string | number, test: Record<string, any>) {
  return request(`/api/lab-tests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(test)
  });
}

export async function deleteLabTest(id: string | number) {
  return request(`/api/lab-tests/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchRooms() {
  return request('/api/rooms');
}

export async function createRoom(room: Record<string, any>) {
  return request('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(room)
  });
}

export async function updateRoom(id: string | number, room: Record<string, any>) {
  return request(`/api/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(room)
  });
}

export async function deleteRoom(id: string | number) {
  return request(`/api/rooms/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchAmbulances() {
  return request('/api/ambulance');
}

export async function createAmbulanceEntry(ambulance: Record<string, any>) {
  return request('/api/ambulance', {
    method: 'POST',
    body: JSON.stringify(ambulance)
  });
}

export async function fetchAmbulanceLogs() {
  return request('/api/ambulance/logs');
}

export async function createAmbulanceLog(log: Record<string, any>) {
  return request('/api/ambulance/logs', {
    method: 'POST',
    body: JSON.stringify(log)
  });
}

export async function updateAmbulanceStatus(id: string | number, status: string) {
  return request(`/api/ambulance/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export async function fetchMedicines() {
  return request('/api/medicines');
}

export async function createPrescription(payload: Record<string, any>) {
  return request('/api/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchBloodBankEntries() {
  return request('/api/blood-bank');
}

export async function createBloodBankEntry(entry: Record<string, any>) {
  return request('/api/blood-bank', {
    method: 'POST',
    body: JSON.stringify(entry)
  });
}

export async function fetchBloodTransfusions() {
  return request('/api/blood-transfusions');
}

export async function createBloodTransfusion(transfusion: Record<string, any>) {
  return request('/api/blood-transfusions', {
    method: 'POST',
    body: JSON.stringify(transfusion)
  });
}

export async function createMedicine(medicine: Record<string, any>) {
  return request('/api/medicines', {
    method: 'POST',
    body: JSON.stringify(medicine)
  });
}

export async function updateMedicine(id: string | number, medicine: Record<string, any>) {
  return request(`/api/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(medicine)
  });
}

export async function deleteMedicine(id: string | number) {
  return request(`/api/medicines/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchPharmacies() {
  return request('/api/pharmacies');
}
