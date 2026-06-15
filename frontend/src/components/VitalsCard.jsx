import React from 'react';
import { Activity } from 'lucide-react';

const VitalsCard = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100">
      <div className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
          <Activity className="w-5 h-5" />
        </div>
        My Schedule Today
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center p-3 bg-[#f4f7fb] rounded-xl shadow-[inset_1px_1px_3px_rgba(0,0,0,0.03),inset_-1px_-1px_3px_rgba(255,255,255,1)]">
          <span className="text-slate-500 font-semibold text-sm">Total Appointments</span>
          <strong className="text-lg text-slate-800">12</strong>
        </div>
        <div className="flex justify-between items-center p-3 bg-[#f4f7fb] rounded-xl shadow-[inset_1px_1px_3px_rgba(0,0,0,0.03),inset_-1px_-1px_3px_rgba(255,255,255,1)]">
          <span className="text-slate-500 font-semibold text-sm">Completed</span>
          <strong className="text-lg text-emerald-500">3</strong>
        </div>
        <div className="flex justify-between items-center p-3 bg-[#f4f7fb] rounded-xl shadow-[inset_1px_1px_3px_rgba(0,0,0,0.03),inset_-1px_-1px_3px_rgba(255,255,255,1)]">
          <span className="text-slate-500 font-semibold text-sm">Urgent / Flagged</span>
          <strong className="text-lg text-red-500">2</strong>
        </div>
      </div>
    </div>
  );
};

export default VitalsCard;
