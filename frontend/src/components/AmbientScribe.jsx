import React, { useState } from 'react';
import { Mic, StopCircle, CheckCircle2 } from 'lucide-react';

const AmbientScribe = () => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className={`bg-white rounded-3xl p-6 transition-all duration-300 border border-slate-100 ${
      isRecording 
        ? 'shadow-[inset_2px_2px_10px_rgba(239,68,68,0.1),inset_-2px_-2px_10px_rgba(255,255,255,1)] ring-2 ring-red-100' 
        : 'shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff]'
    }`}>
      <div className={`text-lg font-bold flex items-center gap-3 mb-5 ${
        isRecording ? 'text-red-600' : 'text-slate-800'
      }`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRecording ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500 shadow-[2px_2px_5px_#e6e9ed,-2px_-2px_5px_#ffffff]'}`}>
          <Mic className="w-5 h-5" /> 
        </div>
        AI Ambient Scribe
      </div>
      
      {isRecording ? (
        <div className="p-4 bg-red-50/50 rounded-2xl mb-5 border border-red-100 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Listening...</span>
          </div>
          <p className="text-sm text-slate-600 italic font-medium">
            "Patient reports a headache starting two days ago..."
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500 font-medium mb-5 leading-relaxed">
          Voice-to-text recording is inactive. Click start to begin documenting clinical notes securely.
        </p>
      )}

      <button 
        className={`w-full py-3 px-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all cursor-pointer border-none ${
          isRecording 
            ? 'bg-red-500 text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:bg-red-600 transform hover:-translate-y-0.5 active:translate-y-0' 
            : 'bg-[#f4f7fb] text-orange-500 shadow-[5px_5px_10px_#e6e9ed,-5px_-5px_10px_#ffffff] active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff] hover:text-orange-600'
        }`}
        onClick={() => setIsRecording(!isRecording)}
      >
        {isRecording ? <><StopCircle className="w-5 h-5" /> Stop Recording</> : <><Mic className="w-5 h-5" /> Start Recording</>}
      </button>

      {!isRecording && (
        <div className="mt-5 flex items-start gap-3 p-4 bg-[#f4f7fb] rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)]">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs font-medium text-slate-500 leading-relaxed">
            Gemini AI will automatically structure your dictated notes into SOAP format when stopped.
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbientScribe;
