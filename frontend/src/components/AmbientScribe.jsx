import React, { useState, useEffect, useContext } from 'react';
import { Mic, StopCircle, CheckCircle2, User, Save, RefreshCw, AlertCircle, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AmbientScribe = () => {
  const { token } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  
  // SOAP Note State
  const [soapNote, setSoapNote] = useState({
    subjective: "Patient reports chief complaint of throbbing headache for past 3 days, localized to forehead. Describes pain as 6/10. Associated with mild photophobia. Denies neck stiffness, fever, or vision changes. Relieved slightly by ibuprofen.",
    objective: "Well-appearing adult in no acute distress. Alert and oriented x3. Extraocular movements intact, pupils equal and reactive to light. Neurological examination is grossly normal. Lungs clear to auscultation.",
    assessment: "Acute tension headache vs. early migraine. Rule out secondary etiologies.",
    plan: "1. Acetaminophen 500mg PO q6h as needed for pain.\n2. Advised patient to maintain a headache diary.\n3. Return immediately if pain worsens or neurological symptoms develop."
  });

  // Vitals State
  const [vitalsInput, setVitalsInput] = useState({
    heartRate: '75',
    bloodPressure: '120/80',
    bloodSugar: '95',
    oxygenSaturation: '98'
  });

  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch patients on mount
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
        console.error('Error fetching patients in Scribe:', err);
      }
    };

    if (token) {
      fetchPatients();
    }
  }, [token]);

  // Audio Recording Simulation waves
  const [waveHeights, setWaveHeights] = useState([4, 10, 6, 12, 8, 4, 10, 6, 12, 8]);
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 20) + 4));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    if (!selectedPatientId) {
      alert("Please select a patient first.");
      return;
    }
    setIsRecording(true);
    setShowEditor(false);
    setSaveStatus('idle');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate AI extraction pipeline
    setTimeout(() => {
      setProcessingStep(1); // transcribing
      setTimeout(() => {
        setProcessingStep(2); // structuring
        setTimeout(() => {
          setIsProcessing(false);
          setShowEditor(true);
        }, 1500);
      }, 1500);
    }, 1200);
  };

  const handleSaveToChart = async () => {
    setSaveStatus('saving');
    setErrorMessage('');

    const formattedNotes = `
### SUBJECTIVE
${soapNote.subjective}

### OBJECTIVE
${soapNote.objective}

### ASSESSMENT
${soapNote.assessment}

### PLAN
${soapNote.plan}
`.trim();

    const vitalsData = {
      heartRate: parseInt(vitalsInput.heartRate) || null,
      bloodPressure: vitalsInput.bloodPressure || null,
      bloodSugar: parseInt(vitalsInput.bloodSugar) || null,
      oxygenSaturation: parseInt(vitalsInput.oxygenSaturation) || null
    };

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${selectedPatientId}/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clinicalNotes: formattedNotes,
          aiGeneratedSummary: JSON.stringify(soapNote),
          vitals: vitalsData
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => {
          setSaveStatus('idle');
          setShowEditor(false);
          setSelectedPatientId('');
        }, 3000);
      } else {
        setSaveStatus('error');
        setErrorMessage(data.message || 'Failed to save medical record.');
      }
    } catch (err) {
      console.error('Error saving medical record:', err);
      setSaveStatus('error');
      setErrorMessage('Connection error');
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-6 transition-all duration-300 border border-slate-100/80 shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] font-sans ${
      isRecording ? 'ring-2 ring-red-100' : ''
    }`}>
      <div className={`text-lg font-bold flex items-center justify-between mb-5 ${
        isRecording ? 'text-red-600' : 'text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRecording ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500 shadow-[2px_2px_5px_#e6e9ed,-2px_-2px_5px_#ffffff]'}`}>
            <Mic className="w-5 h-5" /> 
          </div>
          AI Ambient Scribe
        </div>
        {saveStatus === 'success' && (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold animate-pulse">Saved Successfully</span>
        )}
      </div>

      {!showEditor && !isProcessing && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-[#f4f7fb] p-3 rounded-2xl border border-transparent font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              disabled={isRecording}
            >
              <option value="">-- Choose Patient for Visit --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id.substring(0,8)})</option>
              ))}
            </select>
          </div>

          {isRecording ? (
            <div className="p-4 bg-red-50/40 rounded-2xl mb-2 border border-red-100/60 shadow-inner flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Scribing Active</span>
              </div>
              
              {/* Dynamic waveform visualization */}
              <div className="flex items-center gap-1.5 h-10">
                {waveHeights.map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-red-500 rounded-full transition-all duration-150" 
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              
              <button 
                onClick={handleStopRecording}
                className="w-full mt-2 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer border-none flex justify-center items-center gap-2"
              >
                <StopCircle className="w-5 h-5" /> Stop & Generate SOAP
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed ml-1">
                Voice-to-text scribe is idle. Select a patient and click start to record the consultation audio.
              </p>
              <button 
                onClick={handleStartRecording}
                className="w-full py-3 bg-[#f4f7fb] text-orange-500 hover:text-orange-600 font-bold rounded-2xl shadow-[5px_5px_10px_#e6e9ed,-5px_-5px_10px_#ffffff] active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff] transition-all cursor-pointer border-none flex justify-center items-center gap-2"
              >
                <Mic className="w-5 h-5" /> Start Scribing Session
              </button>
            </div>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          <div>
            <h4 className="text-sm font-bold text-slate-700 m-0">Gemini Scribe AI</h4>
            <p className="text-xs text-slate-400 mt-1 font-semibold">
              {processingStep === 0 && "Initializing scribe audio stream..."}
              {processingStep === 1 && "Transcribing clinical patient dialogue..."}
              {processingStep === 2 && "Formatting SOAP note with clinical impressions..."}
            </p>
          </div>
        </div>
      )}

      {showEditor && (
        <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 bg-orange-50/50 text-slate-700 text-xs font-semibold rounded-2xl border border-orange-100 flex items-start gap-2">
            <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
            <span>AI extracted clinical summary. Review and update before saving to the patient chart.</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Subjective (S)</label>
              <textarea
                value={soapNote.subjective}
                onChange={(e) => setSoapNote({ ...soapNote, subjective: e.target.value })}
                className="w-full text-xs font-medium text-slate-600 bg-[#f4f7fb] p-2.5 rounded-xl border border-slate-100 outline-none focus:ring-1 focus:ring-orange-400"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Objective (O)</label>
              <textarea
                value={soapNote.objective}
                onChange={(e) => setSoapNote({ ...soapNote, objective: e.target.value })}
                className="w-full text-xs font-medium text-slate-600 bg-[#f4f7fb] p-2.5 rounded-xl border border-slate-100 outline-none focus:ring-1 focus:ring-orange-400"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Assessment (A)</label>
              <textarea
                value={soapNote.assessment}
                onChange={(e) => setSoapNote({ ...soapNote, assessment: e.target.value })}
                className="w-full text-xs font-medium text-slate-600 bg-[#f4f7fb] p-2.5 rounded-xl border border-slate-100 outline-none focus:ring-1 focus:ring-orange-400"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Plan (P)</label>
              <textarea
                value={soapNote.plan}
                onChange={(e) => setSoapNote({ ...soapNote, plan: e.target.value })}
                className="w-full text-xs font-medium text-slate-600 bg-[#f4f7fb] p-2.5 rounded-xl border border-slate-100 outline-none focus:ring-1 focus:ring-orange-400"
                rows="3"
              />
            </div>

            {/* Vitals Input Section */}
            <div className="border-t border-slate-100 pt-3 mt-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <Activity size={12} className="text-orange-500" /> Patient Vitals Entry
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1">Heart Rate (bpm)</label>
                  <input
                    type="text"
                    value={vitalsInput.heartRate}
                    onChange={(e) => setVitalsInput({ ...vitalsInput, heartRate: e.target.value })}
                    className="w-full text-xs font-semibold text-slate-700 bg-[#f4f7fb] px-2.5 py-1.5 rounded-lg border border-slate-100 outline-none"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    value={vitalsInput.bloodPressure}
                    onChange={(e) => setVitalsInput({ ...vitalsInput, bloodPressure: e.target.value })}
                    className="w-full text-xs font-semibold text-slate-700 bg-[#f4f7fb] px-2.5 py-1.5 rounded-lg border border-slate-100 outline-none"
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="text"
                    value={vitalsInput.bloodSugar}
                    onChange={(e) => setVitalsInput({ ...vitalsInput, bloodSugar: e.target.value })}
                    className="w-full text-xs font-semibold text-slate-700 bg-[#f4f7fb] px-2.5 py-1.5 rounded-lg border border-slate-100 outline-none"
                    placeholder="95"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1">Oxygen Saturation (%)</label>
                  <input
                    type="text"
                    value={vitalsInput.oxygenSaturation}
                    onChange={(e) => setVitalsInput({ ...vitalsInput, oxygenSaturation: e.target.value })}
                    className="w-full text-xs font-semibold text-slate-700 bg-[#f4f7fb] px-2.5 py-1.5 rounded-lg border border-slate-100 outline-none"
                    placeholder="98"
                  />
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-xs font-bold bg-red-50 p-2.5 rounded-xl border border-red-100">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2.5 mt-2">
            <button 
              onClick={() => { setShowEditor(false); setSelectedPatientId(''); }}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs cursor-pointer border-none transition-all"
            >
              Discard
            </button>
            <button 
              onClick={handleSaveToChart}
              disabled={saveStatus === 'saving'}
              className="flex-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md cursor-pointer border-none transition-all flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> {saveStatus === 'saving' ? 'Saving Chart...' : 'Save to Chart'}
            </button>
          </div>
        </div>
      )}

      {!isRecording && !showEditor && !isProcessing && (
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
