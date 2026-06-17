import React, { useState, useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const NewPrescriptionModal = ({ isOpen, onClose }) => {
  const { token } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    medicationName: '',
    dosage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/patients', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setPatients(data);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };

    if (isOpen && token) {
      fetchPatients();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.patientId || !formData.medicationName || !formData.dosage) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setFormData({ patientId: '', medicationName: '', dosage: '' });
        onClose();
      } else {
        setError(data.message || 'Failed to submit prescription');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f4f7fb] rounded-3xl w-full max-w-lg shadow-[20px_20px_60px_rgba(0,0,0,0.1),-20px_-20px_60px_rgba(255,255,255,0.8)] overflow-hidden flex flex-col border border-white font-sans">
        
        <div className="px-6 py-5 border-b border-slate-200/50 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-800 m-0">Write Prescription</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-white shadow-[3px_3px_6px_#e6e9ed,-3px_-3px_6px_#ffffff] rounded-full transition-all cursor-pointer border-none active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff]">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Patient</label>
              <select 
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full bg-[#f4f7fb] p-3 rounded-xl border border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium"
                required
              >
                <option value="">Select a patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id.substring(0,8)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Medication</label>
              <input 
                type="text" 
                placeholder="e.g., Amoxicillin 500mg" 
                value={formData.medicationName}
                onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                className="w-full bg-[#f4f7fb] p-3 rounded-xl border border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Instructions (SIG) / Dosage</label>
              <textarea 
                rows="3" 
                placeholder="e.g., Take 1 tablet by mouth twice daily for 7 days." 
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full bg-[#f4f7fb] p-3 rounded-xl border border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium resize-none"
                required
              ></textarea>
            </div>
          </div>

          <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-200/50 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 font-semibold text-slate-600 bg-[#f4f7fb] shadow-[3px_3px_6px_#e6e9ed,-3px_-3px_6px_#ffffff] rounded-xl hover:text-slate-800 transition-all cursor-pointer border-none active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 font-bold text-white bg-orange-500 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] rounded-xl hover:bg-orange-600 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none flex items-center gap-2 disabled:opacity-75"
            >
              {loading ? 'Submitting...' : 'Sign & Send'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default NewPrescriptionModal;
