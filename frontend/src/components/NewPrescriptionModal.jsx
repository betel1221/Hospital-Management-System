import React from 'react';
import { X } from 'lucide-react';

const NewPrescriptionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f4f7fb] rounded-3xl w-full max-w-lg shadow-[20px_20px_60px_rgba(0,0,0,0.1),-20px_-20px_60px_rgba(255,255,255,0.8)] overflow-hidden flex flex-col border border-white">
        
        <div className="px-6 py-5 border-b border-slate-200/50 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-800 m-0">Write Prescription</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-white shadow-[3px_3px_6px_#e6e9ed,-3px_-3px_6px_#ffffff] rounded-full transition-all cursor-pointer border-none active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff]">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Patient</label>
            <select className="w-full bg-[#f4f7fb] p-3 rounded-xl border border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium">
              <option value="">Select a patient...</option>
              <option value="PT-4921">John Doe (PT-4921)</option>
              <option value="PT-1982">Alice Smith (PT-1982)</option>
              <option value="PT-8832">Michael Chen (PT-8832)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Medication</label>
            <input type="text" placeholder="e.g., Amoxicillin 500mg" className="w-full bg-[#f4f7fb] p-3 rounded-xl border border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Instructions (SIG)</label>
            <textarea rows="3" placeholder="e.g., Take 1 tablet by mouth twice daily for 7 days." className="w-full bg-[#f4f7fb] p-3 rounded-xl border border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium resize-none"></textarea>
          </div>
        </div>

        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-200/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 font-semibold text-slate-600 bg-[#f4f7fb] shadow-[3px_3px_6px_#e6e9ed,-3px_-3px_6px_#ffffff] rounded-xl hover:text-slate-800 transition-all cursor-pointer border-none active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff]">
            Cancel
          </button>
          <button className="px-6 py-2.5 font-bold text-white bg-orange-500 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] rounded-xl hover:bg-orange-600 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none flex items-center gap-2">
            Sign & Send
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default NewPrescriptionModal;
