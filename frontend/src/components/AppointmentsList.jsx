import React from 'react';
import { Calendar, Clock, Video, User } from 'lucide-react';

const AppointmentsList = () => {
  const appointments = [
    {
      id: "PT-4921",
      name: "John Doe",
      time: "10:00 AM - 10:30 AM",
      type: "In-Person",
      status: "Confirmed",
      isUrgent: true,
      triage: "Patient reports mild chest pain and shortness of breath over the last 24h. Urgency: Moderate."
    },
    {
      id: "PT-1982",
      name: "Alice Smith",
      time: "10:45 AM - 11:00 AM",
      type: "Telemedicine",
      status: "Pending",
      isUrgent: false,
      triage: "Follow-up on hypertension medication adjustment. Routine check."
    },
    {
      id: "PT-8832",
      name: "Michael Chen",
      time: "11:30 AM - 12:00 PM",
      type: "In-Person",
      status: "Checked-In",
      isUrgent: false,
      triage: "Annual physical examination. No acute complaints."
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-bold text-slate-800">Upcoming Appointments</span>
        <button className="text-xs font-semibold px-4 py-2 bg-[#f4f7fb] shadow-[3px_3px_6px_#e6e9ed,-3px_-3px_6px_#ffffff] hover:text-orange-600 text-slate-600 rounded-xl transition-all border-none cursor-pointer active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff]">
          View Calendar
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {appointments.map((apt, index) => (
          <div key={apt.id} className="p-5 bg-[#f4f7fb] rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] flex flex-col gap-4 border border-slate-50">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-[3px_3px_6px_#e6e9ed,-3px_-3px_6px_#ffffff] flex items-center justify-center text-slate-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold text-base m-0 flex items-center gap-2">
                    {apt.name} <span className="text-slate-400 font-medium text-xs">({apt.id})</span>
                  </h4>
                  <div className="text-slate-500 font-medium text-xs mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-md"><Clock className="w-3.5 h-3.5" /> {apt.time}</span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                      {apt.type === 'Telemedicine' ? <Video className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />} {apt.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold shadow-sm ${
                  apt.status === 'Confirmed' || apt.status === 'Checked-In' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {apt.status}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-xl text-sm font-medium border-l-4 ${
              apt.isUrgent 
                ? 'bg-red-50/50 border-red-400 text-red-800 shadow-inner' 
                : 'bg-white border-orange-300 text-slate-600 shadow-sm'
            }`}>
              <strong className={apt.isUrgent ? 'text-red-600' : 'text-slate-700'}>Triage Note (AI):</strong> {apt.triage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsList;
