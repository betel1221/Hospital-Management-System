import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter, UserPlus, MoreHorizontal, Activity, FileText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const PatientRecords = () => {
  const { token } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/patients', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setPatients(data);
        } else {
          setError(data.message || 'Failed to fetch patient records');
        }
      } catch (err) {
        console.error('Error fetching patient records:', err);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPatients();
    }
  }, [token]);

  const filteredPatients = patients.filter(patient => {
    const term = searchQuery.toLowerCase();
    return (
      (patient.name || '').toLowerCase().includes(term) ||
      (patient.id || '').toLowerCase().includes(term) ||
      (patient.condition || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Patient Database</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and access full medical histories.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100">
        
        <div className="mb-6 flex">
          <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] w-full max-w-md">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search patients by name, ID, or condition..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent outline-none w-full text-slate-700 font-medium" 
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-semibold animate-pulse">
            Loading Patient Database...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 font-medium">{error}</div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-[#f4f7fb] rounded-2xl border border-dashed border-slate-200">
            No matching patient records found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                      {patient.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg m-0 group-hover:text-orange-500 transition-colors">{patient.name || 'Anonymous'}</h3>
                      <div className="text-xs font-semibold text-slate-400">{patient.id.substring(0, 8)}</div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm font-semibold">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Age / Gender</div>
                    <div className="text-slate-700 mt-1">{patient.age} y/o, {patient.gender || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last Visit</div>
                    <div className="text-slate-700 mt-1">{patient.lastVisit}</div>
                  </div>
                </div>

                <div className="bg-[#f4f7fb] p-3 rounded-xl mb-4 border border-slate-100">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Primary Condition</div>
                  <div className="font-bold text-slate-800">{patient.condition}</div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <FileText size={14} /> Records
                  </button>
                  <button className="flex-1 py-2 bg-orange-50 border border-orange-100 rounded-lg text-sm font-semibold text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <Activity size={14} /> Vitals
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default PatientRecords;
