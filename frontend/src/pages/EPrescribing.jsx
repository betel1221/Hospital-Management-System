import React, { useState, useEffect, useContext } from 'react';
import { FileText, Search, Plus, User, Eye, CheckCircle, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NewPrescriptionModal from '../components/NewPrescriptionModal';

const EPrescribing = () => {
  const { token, user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPrescriptions(data);
      } else {
        setError(data.message || 'Failed to fetch prescriptions');
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPrescriptions();
    }
  }, [token]);

  const handleDispense = async (prescId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescId}/dispense`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchPrescriptions();
      }
    } catch (err) {
      console.error('Error dispensing prescription:', err);
    }
  };

  const filteredPrescriptions = prescriptions.filter(pr => {
    const query = searchQuery.toLowerCase();
    const nameToSearch = user?.role === 'PATIENT' ? pr.doctor_name : pr.patient_name;
    return (
      (nameToSearch || '').toLowerCase().includes(query) ||
      (pr.medication_name || '').toLowerCase().includes(query) ||
      (pr.dosage || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">E-Prescribing Portal</h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === 'PATIENT' 
              ? 'View and track your active medications.' 
              : 'Write and dispense digital patient prescriptions.'}
          </p>
        </div>
        
        {user?.role === 'DOCTOR' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transition-all cursor-pointer border-none"
          >
            <Plus size={16} /> New Prescription
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100 font-sans">
        
        <div className="mb-6 flex">
          <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] w-full max-w-md">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input 
              type="text" 
              placeholder={user?.role === 'PATIENT' ? 'Search by medication or doctor...' : 'Search by medication or patient...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent outline-none w-full text-slate-700 font-medium" 
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-semibold animate-pulse">
            Loading prescriptions history...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 font-medium">{error}</div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-[#f4f7fb] rounded-2xl border border-dashed border-slate-200">
            No active prescriptions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 px-4">{user?.role === 'PATIENT' ? 'Prescribed By' : 'Patient'}</th>
                  <th className="pb-3 px-4">Medication Name</th>
                  <th className="pb-3 px-4">Dosage</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((pr) => (
                  <tr key={pr.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        {user?.role === 'PATIENT' ? `Dr. ${pr.doctor_name || 'Sarah Jenkins'}` : pr.patient_name}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">{pr.medication_name}</td>
                    <td className="py-4 px-4 font-medium text-slate-600">{pr.dosage}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        pr.status === 'ACTIVE' 
                          ? 'bg-orange-50 text-orange-600 border-orange-100' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {pr.status === 'ACTIVE' ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {pr.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {pr.status === 'ACTIVE' && (user?.role === 'DOCTOR' || user?.role === 'STAFF') && (
                        <button 
                          onClick={() => handleDispense(pr.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer border-none shadow-sm transition-all"
                        >
                          Dispense
                        </button>
                      )}
                      {pr.status === 'DISPENSED' && (
                        <span className="text-xs text-slate-400 font-semibold italic">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewPrescriptionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchPrescriptions();
        }} 
      />
    </div>
  );
};

export default EPrescribing;
