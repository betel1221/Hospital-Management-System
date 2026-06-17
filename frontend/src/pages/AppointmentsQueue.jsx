import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter, MoreHorizontal, User, Clock, Video, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AppointmentsQueue = () => {
  const { token } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patientId: '',
    scheduledFor: '',
    triageSymptoms: '',
    aiUrgencyScore: 'LOW'
  });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAppointments(data);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Connection error');
    }
  };

  const fetchPatientsList = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPatients(data);
      }
    } catch (err) {
      console.error('Error fetching patients list:', err);
    }
  };

  useEffect(() => {
    if (token) {
      Promise.all([fetchQueue(), fetchPatientsList()]).then(() => setLoading(false));
    }
  }, [token]);

  const handleStatusChange = async (apptId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${apptId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchQueue();
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    if (!newAppt.patientId || !newAppt.scheduledFor) {
      setModalError('Patient and date/time are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAppt)
      });
      const data = await response.json();
      if (response.ok) {
        setIsModalOpen(false);
        setNewAppt({ patientId: '', scheduledFor: '', triageSymptoms: '', aiUrgencyScore: 'LOW' });
        fetchQueue();
      } else {
        setModalError(data.message || 'Failed to schedule appointment');
      }
    } catch (err) {
      setModalError('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    } catch (e) {
      return timeStr;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      (apt.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.triage_symptoms || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'All' ||
      (filter === 'In-Person' && (!apt.triage_symptoms || !apt.triage_symptoms.toLowerCase().includes('tele'))) ||
      (filter === 'Telemedicine' && apt.triage_symptoms && apt.triage_symptoms.toLowerCase().includes('tele')) ||
      (filter === 'Urgent' && (apt.ai_urgency_score === 'HIGH' || apt.ai_urgency_score === 'Urgent'));

    const matchesStatus =
      statusFilter === 'ALL' ||
      apt.status === statusFilter;

    return matchesSearch && matchesFilter && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Appointments Queue</h1>
          <p className="text-slate-500 text-sm mt-1">Manage today's schedule and patient triage.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 transition-all select-none">
            <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-none bg-transparent outline-none text-slate-600 font-semibold text-sm cursor-pointer pr-1"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:bg-orange-600 transition-all cursor-pointer border-none"
          >
            + Walk-in Appointment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 border-b border-slate-100 pb-4 gap-4">
          <div className="flex gap-2 p-1 bg-[#f4f7fb] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] w-full md:w-auto overflow-x-auto">
            {['All', 'In-Person', 'Telemedicine', 'Urgent'].map(tab => (
              <button 
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer border-none ${
                  filter === tab 
                    ? 'bg-white text-orange-500 shadow-[2px_2px_5px_rgba(0,0,0,0.05)]' 
                    : 'bg-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#f4f7fb] px-4 py-2 rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent outline-none w-full text-sm text-slate-700 font-medium" 
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-semibold animate-pulse">
            Loading Appointments Queue...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 font-medium">{error}</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-[#f4f7fb] rounded-2xl border border-dashed border-slate-200">
            No matching appointments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 px-4">Patient</th>
                  <th className="pb-3 px-4">Time</th>
                  <th className="pb-3 px-4">Type</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Triage Summary</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                          {apt.patient_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{apt.patient_name || 'Anonymous'}</div>
                          <div className="text-xs text-slate-400 font-semibold">{apt.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Clock size={14} className="text-orange-500" /> {formatTime(apt.scheduled_for)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        {apt.triage_symptoms && apt.triage_symptoms.toLowerCase().includes('tele') ? (
                          <><Video size={16} /> Telemedicine</>
                        ) : (
                          <><CalendarIcon size={16} /> In-Person</>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        apt.status === 'CONFIRMED' || apt.status === 'Checked-In' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        apt.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-[200px]">
                      <div className="flex items-start gap-2">
                        {apt.ai_urgency_score === 'HIGH' && <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse"></div>}
                        <p className="text-sm text-slate-600 truncate m-0">{apt.triage_symptoms || 'No symptoms noted.'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {apt.status === 'PENDING' && (
                          <button 
                            onClick={() => handleStatusChange(apt.id, 'CONFIRMED')}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer border-none bg-transparent"
                            title="Confirm Appointment"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                          <button 
                            onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer border-none bg-transparent"
                            title="Cancel Appointment"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 m-0">Schedule Appointment</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border-none">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 text-center">
                {modalError}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-1">Select Patient</label>
                <select 
                  className="w-full bg-[#f4f7fb] px-4 py-3 rounded-2xl border border-transparent font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={newAppt.patientId}
                  onChange={(e) => setNewAppt({ ...newAppt, patientId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id.substring(0,8)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-1">Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-[#f4f7fb] px-4 py-3 rounded-2xl border border-transparent font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={newAppt.scheduledFor}
                  onChange={(e) => setNewAppt({ ...newAppt, scheduledFor: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-1">Triage Symptoms / Reason</label>
                <textarea 
                  rows="3"
                  placeholder="Mild fever, telemedicine follow-up..."
                  className="w-full bg-[#f4f7fb] px-4 py-3 rounded-2xl border border-transparent font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                  value={newAppt.triageSymptoms}
                  onChange={(e) => setNewAppt({ ...newAppt, triageSymptoms: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-1">AI Urgency Score</label>
                <select 
                  className="w-full bg-[#f4f7fb] px-4 py-3 rounded-2xl border border-transparent font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={newAppt.aiUrgencyScore}
                  onChange={(e) => setNewAppt({ ...newAppt, aiUrgencyScore: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md cursor-pointer border-none transition-all disabled:opacity-75"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentsQueue;
