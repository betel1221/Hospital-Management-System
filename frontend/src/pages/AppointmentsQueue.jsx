import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, User, Clock, Video, Calendar as CalendarIcon } from 'lucide-react';

const AppointmentsQueue = () => {
  const [filter, setFilter] = useState('All');
  
  const appointments = [
    { id: "PT-4921", name: "John Doe", time: "10:00 AM", duration: "30m", type: "In-Person", status: "Confirmed", isUrgent: true, triage: "Mild chest pain and shortness of breath." },
    { id: "PT-1982", name: "Alice Smith", time: "10:45 AM", duration: "15m", type: "Telemedicine", status: "Pending", isUrgent: false, triage: "Follow-up on hypertension." },
    { id: "PT-8832", name: "Michael Chen", time: "11:30 AM", duration: "30m", type: "In-Person", status: "Checked-In", isUrgent: false, triage: "Annual physical examination." },
    { id: "PT-1002", name: "Emma Watson", time: "01:00 PM", duration: "45m", type: "Telemedicine", status: "Confirmed", isUrgent: false, triage: "Review of recent blood work." },
    { id: "PT-3499", name: "James Bond", time: "02:00 PM", duration: "15m", type: "In-Person", status: "Cancelled", isUrgent: false, triage: "Prescription refill request." },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Appointments Queue</h1>
          <p className="text-slate-500 text-sm mt-1">Manage today's schedule and patient triage.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:bg-orange-600 transition-all cursor-pointer border-none">
            + Walk-in Appointment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100">
        
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex gap-2 p-1 bg-[#f4f7fb] rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)]">
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

          <div className="flex items-center bg-[#f4f7fb] px-4 py-2 rounded-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)] w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input type="text" placeholder="Search by name or ID..." className="border-none bg-transparent outline-none w-full text-sm text-slate-700 font-medium" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 px-4">Patient</th>
                <th className="pb-3 px-4">Time</th>
                <th className="pb-3 px-4">Type</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Triage Summary</th>
                <th className="pb-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter(apt => filter === 'All' || apt.type === filter || (filter === 'Urgent' && apt.isUrgent))
                .map((apt) => (
                <tr key={apt.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{apt.name}</div>
                        <div className="text-xs text-slate-500">{apt.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Clock size={14} className="text-orange-500" /> {apt.time}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 ml-5">{apt.duration}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      {apt.type === 'Telemedicine' ? <Video size={16} /> : <CalendarIcon size={16} />} {apt.type}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      apt.status === 'Confirmed' || apt.status === 'Checked-In' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      apt.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 max-w-[200px]">
                    <div className="flex items-start gap-2">
                      {apt.isUrgent && <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse"></div>}
                      <p className="text-sm text-slate-600 truncate m-0">{apt.triage}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default AppointmentsQueue;
