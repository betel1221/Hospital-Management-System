import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AppointmentsList = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/appointments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const formatTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-bold text-slate-800">
          {user?.role === 'PATIENT' ? 'My Upcoming Consultations' : 'Upcoming Appointments'}
        </span>
        <button 
          onClick={() => navigate('/appointments')}
          className="text-xs font-semibold px-4 py-2 bg-[#f4f7fb] shadow-[3px_3px_6px_#e6e9ed,-3px_-3px_6px_#ffffff] hover:text-orange-600 text-slate-600 rounded-xl transition-all border-none cursor-pointer active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff]"
        >
          View Calendar
        </button>
      </div>

      {loading && (
        <div className="text-center py-6 text-slate-500 font-semibold animate-pulse">
          Loading appointments...
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="text-center py-8 text-slate-400 font-medium bg-[#f4f7fb] rounded-2xl border border-dashed border-slate-200">
          No appointments scheduled at the moment.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {!loading && !error && appointments.map((apt) => (
          <div key={apt.id} className="p-5 bg-[#f4f7fb] rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] flex flex-col gap-4 border border-slate-50">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-[3px_3px_6px_#e6e9ed,-3px_-3px_6px_#ffffff] flex items-center justify-center text-slate-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold text-base m-0 flex items-center gap-2">
                    {user?.role === 'PATIENT' ? `Dr. ${apt.doctor_name}` : apt.patient_name}
                    <span className="text-slate-400 font-medium text-xs">({apt.id.substring(0, 8)})</span>
                  </h4>
                  <div className="text-slate-500 font-medium text-xs mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {formatTime(apt.scheduled_for)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                      {apt.triage_symptoms && apt.triage_symptoms.toLowerCase().includes('tele') ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5" />
                      )}
                      {apt.triage_symptoms && apt.triage_symptoms.toLowerCase().includes('tele') ? 'Telemedicine' : 'In-Person'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${
                  apt.status === 'CONFIRMED' || apt.status === 'Checked-In' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : apt.status === 'CANCELLED'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {apt.status}
                </span>
              </div>
            </div>

            {apt.triage_symptoms && (
              <div className={`p-4 rounded-xl text-sm font-medium border-l-4 ${
                apt.ai_urgency_score === 'HIGH' || apt.ai_urgency_score === 'Urgent'
                  ? 'bg-red-50/50 border-red-400 text-red-800 shadow-inner' 
                  : 'bg-white border-orange-300 text-slate-600 shadow-sm'
              }`}>
                <strong className={apt.ai_urgency_score === 'HIGH' || apt.ai_urgency_score === 'Urgent' ? 'text-red-600' : 'text-slate-700'}>
                  Triage Note {apt.ai_urgency_score ? `(AI Urgency: ${apt.ai_urgency_score})` : ''}:
                </strong>{' '}
                {apt.triage_symptoms}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsList;
