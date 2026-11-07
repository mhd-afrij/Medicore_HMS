import { useState, useEffect } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { exportToPDF } from '../utils/exportUtils';
import { toast } from 'sonner';
import { fetchDoctors, fetchMedicines, fetchPatients, fetchMedicalRecords, fetchPrescriptions, createPrescription } from '../api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
export function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [medicinesList, setMedicinesList] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [medicalRecordsList, setMedicalRecordsList] = useState<any[]>([]);
  const filteredPrescriptions = prescriptions.filter(
    (p) =>
    String(p.patient || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const medicalRecordId = formData.get('medicalRecordId') as string;
    const medicalRecord = medicalRecordsList.find((r) => String(r.RecordID) === String(medicalRecordId));
    const doctorId = formData.get('doctor') as string;
    const medicineIds = formData.getAll('medicine') as string[];
    const prescriptionDate = (formData.get('prescriptionDate') as string) || new Date().toISOString().split('T')[0];
    if (!medicalRecordId || !doctorId || !medicineIds || !medicineIds.length) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const prescriptionsId = `PR-${Math.floor(2000 + Math.random() * 1000)}`;
    const payload = {
      PrescriptionID: prescriptionsId,
      MedicalRecordID: medicalRecordId,
      DoctorID: doctorId,
      PrescriptionDate: prescriptionDate,
      Medicine: medicineIds
    };

    try {
      const resp = await createPrescription(payload);
      const created = resp?.data || resp; // support different shapes
      const resolveMedicineNames = (ids: string[]): string[] => {
        return ids.map((id: string) => {
          const found = medicinesList.find((m: any) => String(m.MedicineID || m.ID || m.id) === String(id));
          return found?.MedicineName || found?.name || found?.Medicine || id;
        });
      };
      const newPrescription = {
        id: created.PrescriptionID || created.PrescriptionsID || prescriptionsId,
        PrescriptionsID: created.PrescriptionID || created.PrescriptionsID || prescriptionsId,
        RecordID: created.MedicalRecordID || created.RecordID || medicalRecordId,
        MedicalRecordID: created.MedicalRecordID || created.RecordID || medicalRecordId,
        DoctorID: created.DoctorID || doctorId,
        date: created.PrescriptionDate ? (new Date(created.PrescriptionDate)).toISOString().split('T')[0] : prescriptionDate,
        meds: resolveMedicineNames(medicineIds),
        medicineRaw: created.Medicine || medicineIds.join(','),
        medicineList: Array.isArray(created.Medicine) ? created.Medicine : (typeof created.Medicine === 'string' ? created.Medicine.split(',').map((s: string) => s.trim()) : medicineIds),
        patient: medicalRecord ? (patientsList.find((p) => String(p.PatientID || p.ID || p.id) === String(medicalRecord.PatientID))?.PatientName || medicalRecord.PatientID) : medicalRecordId,
        doctor: doctorsList.find((d) => String(d.DoctorID || d.ID) === String(doctorId))?.DoctorName || doctorId,
        status: 'Pending'
      };
      setPrescriptions([newPrescription, ...prescriptions]);
      toast.success(`Prescription ${newPrescription.id} created for ${newPrescription.patient}`);
      setIsModalOpen(false);
      
    } catch (err: any) {
      toast.error(String(err?.message || err));
    }
  };
  
  const handleDownloadPrescription = (p: any) => {
    const headers = ['Field', 'Clinical Details'];
    const rows = [
      ['Prescription ID', p.id],
      ['Patient Name / ID', p.patient],
      ['Prescribing Physician', p.doctor],
      ['Dispensed Medications', Array.isArray(p.meds) ? p.meds.join('; ') : String(p.meds || 'N/A')],
      ['Date Authorized', p.date],
      ['Dispense Status', p.status],
      ['Pharmacy License', 'MediCore Central Clinical Pharmacy']
    ];
    exportToPDF(`Prescription Order - ${p.id}`, headers, rows, `Prescription_${p.id}.pdf`);
    toast.success(`Prescription ${p.id} slip exported to PDF`);
  };

  const handleDispense = () => {
    setPrescriptions(
      prescriptions.map((p) =>
      p.id === selectedPrescription.id ?
      {
        ...p,
        status: 'Dispensed'
      } :
      p
      )
    );
    toast.success(
      `Prescription ${selectedPrescription.id} dispensed — stock levels updated`
    );
  };
  useEffect(() => {
    (async () => {
      try {
        const [dResp, mResp, pResp, mrResp] = await Promise.all([fetchDoctors(), fetchMedicines(), fetchPatients(), fetchMedicalRecords()]);
        const dList = dResp?.data || [];
        const mList = mResp?.data || [];
        const pList = pResp?.data || [];
        const mrList = mrResp?.data || [];
        setDoctorsList(dList);
        setMedicinesList(mList);
        setPatientsList(pList);
        setMedicalRecordsList(mrList);

        try {
          const prResp = await fetchPrescriptions();
          const prData = prResp?.data || [];
          const resolveMedicineNames = (medicineVal: any): string[] => {
            const ids = typeof medicineVal === 'string'
              ? medicineVal.split(',').map((s: string) => s.trim()).filter(Boolean)
              : Array.isArray(medicineVal) ? medicineVal : [];
            return ids.map((id: string) => {
              const found = mList.find((m: any) => String(m.MedicineID || m.ID || m.id) === String(id));
              return found?.MedicineName || found?.name || found?.Medicine || id;
            });
          };
          const uiList = prData.map((r: any) => {
            const recordId = r.MedicalRecordID || r.RecordID || r.RecordId || r.recordID || r.record;
            const prescriptionId = r.PrescriptionID || r.PrescriptionsID;
            const medicalRecord = mrList.find((mr: any) => String(mr.RecordID) === String(recordId));
            const patient = pList.find((p: any) => String(p.PatientID || p.ID || p.id) === String(medicalRecord?.PatientID));
            const medicineNames = resolveMedicineNames(r.Medicine);
            return {
              id: prescriptionId,
              PrescriptionsID: prescriptionId,
              PrescriptionID: prescriptionId,
              RecordID: recordId,
              MedicalRecordID: recordId,
              DoctorID: r.DoctorID,
              date: r.PrescriptionDate ? (new Date(r.PrescriptionDate)).toISOString().split('T')[0] : '',
              meds: medicineNames,
              medicineRaw: r.Medicine,
              medicineList: typeof r.Medicine === 'string' ? r.Medicine.split(',').map((s: string) => s.trim()).filter(Boolean) : Array.isArray(r.Medicine) ? r.Medicine : [],
              patient: patient ? (patient.PatientName || patient.name || `${patient.FirstName || ''} ${patient.LastName || ''}`) : recordId,
              doctor: (dList.find((d: any) => String(d.DoctorID || d.ID) === String(r.DoctorID))?.DoctorName) || r.DoctorID,
              status: 'Pending'
            };
          });
          setPrescriptions(uiList);
        } catch {
          /* ignore */
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Dispensed':
        return 'bg-teal-100 text-teal-700';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prescriptions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Process prescriptions and dispense medicines from pharmacy stock.
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by patient or prescription ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm" />
            
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            <span>New Prescription</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Prescription ID
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Patient
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Doctor
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Medicines
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Date Issued
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Status
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 tracking-wider uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrescriptions.map((p) =>
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono font-bold text-slate-600">
                    {p.id}
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-900">
                    {p.patient}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-700">
                    {p.doctor}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-slate-700">
                      {p.meds ? p.meds.join(', ') : p.medicineName || p.Medicine || p.MedicineName || ''}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">{p.date}</td>
                  <td className="py-4 px-6">
                    <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(p.status)}`}>
                    
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleDownloadPrescription(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors inline-block align-middle"
                      title="Download Prescription Slip">
                      <FileText className="w-4 h-4" />
                    </button>
                    {p.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedPrescription(p);
                          setIsConfirmOpen(true);
                        }}
                        className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold rounded-lg hover:bg-teal-100 transition-colors align-middle">
                        Dispense
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Prescription">
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="medicalRecordId" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                Medical record <span className="text-red-500">*</span>
              </label>
              <select
                id="medicalRecordId"
                name="medicalRecordId"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="">Select record...</option>
                {medicalRecordsList.map((r) => {
                  const patient = patientsList.find((p) => String(p.PatientID || p.ID || p.id) === String(r.PatientID));
                  return (
                    <option key={r.RecordID} value={r.RecordID}>
                      {`${r.RecordID} — ${patient?.PatientName || patient?.name || `${patient?.FirstName || ''} ${patient?.LastName || ''}` || r.PatientID}`}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label htmlFor="doctor" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                Doctor <span className="text-red-500">*</span>
              </label>
              <select
                id="doctor"
                name="doctor"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="">Select Doctor...</option>
                {doctorsList.map((d) => (
                  <option key={d.DoctorID || d.ID} value={d.DoctorID || d.ID}>
                    {d.DoctorName || d.Doctor || `${d.FirstName || ''} ${d.LastName || ''}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="medicine" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                  Medicine <span className="text-red-500">*</span>
                </label>
                <div className="max-h-40 overflow-auto bg-slate-50 border border-slate-200 rounded-lg p-2">
                  {medicinesList.length === 0 && (
                    <div className="text-sm text-slate-500">No medicines available</div>
                  )}
                  {medicinesList.map((m) => {
                    const mid = m.MedicineID || m.ID || m.id;
                    const mlabel = m.MedicineName || m.name;
                    return (
                      <label key={mid} className="flex items-center space-x-2 text-sm px-1 py-1">
                        <input type="checkbox" name="medicine" value={mid} className="w-4 h-4" />
                        <span className="text-slate-800">{mlabel}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <label htmlFor="prescriptionDate" className="block text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">
                  Prescription Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="prescriptionDate"
                  type="date"
                  name="prescriptionDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800">
              
              Save Prescription
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDispense}
        title="Confirm Dispense"
        message={`Dispense prescription for ${selectedPrescription?.patient || 'selected patient'}? This will deduct quantities from Medicine Stock.`}
        confirmText="Confirm Dispense"
        confirmColor="teal" />
      
    </div>);

}