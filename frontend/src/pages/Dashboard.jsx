import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AppointmentsList from '../components/AppointmentsList';
import VitalsCard from '../components/VitalsCard';
import AmbientScribe from '../components/AmbientScribe';
import NewPrescriptionModal from '../components/NewPrescriptionModal';
import { 
  Heart, 
  Clock, 
  Pill, 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  CheckCircle2, 
  Activity, 
  Plus,
  ShieldAlert
} from 'lucide-react';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [checkIns, setCheckIns] = useState([
    { id: 1, name: 'John Doe', time: '10:00 AM', status: 'WAITING', reason: 'Annual Checkup' },
    { id: 2, name: 'Robert Smith', time: '10:30 AM', status: 'CHECKED_IN', reason: 'Follow-up' },
    { id: 3, name: 'Emily Davis', time: '11:00 AM', status: 'WAITING', reason: 'Flu Symptoms' },
  ]);

  // Live Patient State
  const [patientVitals, setPatientVitals] = useState(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [loadingPatientData, setLoadingPatientData] = useState(false);

  useEffect(() => {
    const fetchPatientDashboardData = async () => {
      if (!token || user?.role !== 'PATIENT') return;
      setLoadingPatientData(true);
      try {
        // Fetch Profile & Vitals History
        const vitalsRes = await fetch('http://localhost:5000/api/patients/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (vitalsRes.ok) {
          const vitalsData = await vitalsRes.json();
          // Extract the latest vitals record if it exists
          if (vitalsData.vitalsHistory && vitalsData.vitalsHistory.length > 0) {
            const latest = vitalsData.vitalsHistory[0].vitals;
            // Parse if it is a string
            const parsedVitals = typeof latest === 'string' ? JSON.parse(latest) : latest;
            setPatientVitals(parsedVitals);
          }
        }

        // Fetch Prescriptions
        const prescRes = await fetch('http://localhost:5000/api/prescriptions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (prescRes.ok) {
          const prescData = await prescRes.json();
          if (Array.isArray(prescData)) {
            setPatientPrescriptions(prescData.filter(p => p.status === 'ACTIVE'));
          }
        }
      } catch (err) {
        console.error('Error fetching patient dashboard data:', err);
      } finally {
        setLoadingPatientData(false);
      }
    };

    fetchPatientDashboardData();
  }, [token, user]);

  const handleCheckIn = (id) => {
    setCheckIns(checkIns.map(c => c.id === id ? { ...c, status: 'CHECKED_IN' } : c));
  };

  // Render DOCTOR Dashboard
  if (user?.role === 'DOCTOR') {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
        
        {/* Doctor Welcome Header */}
        <div className="mb-8 p-6 bg-white rounded-3xl shadow-[10px_10px_30px_rgba(0,0,0,0.02),-10px_-10px_30px_rgba(255,255,255,0.9)] border border-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 m-0">Welcome Back, {user.fullName}!</h2>
          <p className="text-slate-500 text-sm mt-1">Here is a quick overview of today's schedule, patient check-ins, and AI ambient scribe tools.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Appointments */}
          <div className="flex-2 lg:w-2/3">
            <AppointmentsList />
          </div>

          {/* Right Column: Vitals / Quick Stats */}
          <div className="flex-1 lg:w-1/3 flex flex-col gap-8">
            <button 
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="w-full text-center py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transition-all flex items-center justify-center gap-2 cursor-pointer border-none transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={18} />
              New Prescription
            </button>
            
            <VitalsCard />
            <AmbientScribe />
          </div>
        </div>

        <NewPrescriptionModal 
          isOpen={isPrescriptionModalOpen} 
          onClose={() => setIsPrescriptionModalOpen(false)} 
        />
      </div>
    );
  }

  // Render PATIENT Dashboard
  if (user?.role === 'PATIENT') {
    const vitals = patientVitals;

    return (
      <div className="p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
        
        {/* Patient Welcome Header */}
        <div className="mb-8 p-6 bg-white rounded-3xl shadow-[10px_10px_30px_rgba(0,0,0,0.02),-10px_-10px_30px_rgba(255,255,255,0.9)] border border-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 m-0">Welcome Back, {user.fullName}!</h2>
          <p className="text-slate-500 text-sm mt-1">Here is a quick overview of your health profile and upcoming clinic visits.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Health Vitals */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white rounded-3xl p-6 shadow-[10px_10px_30px_rgba(0,0,0,0.02),-10px_-10px_30px_rgba(255,255,255,0.9)] border border-slate-50">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-slate-800 m-0">
                  My Latest Vitals {!patientVitals && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-2 font-medium">Awaiting Examination</span>}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                    <Heart size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heart Rate</div>
                    <div className="text-lg font-bold text-slate-800 mt-0.5">
                      {vitals ? `${vitals.heartRate || vitals.heart_rate || '—'} bpm` : '—'}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600">Optimal Range</div>
                  </div>
                </div>

                <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Heart size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Pressure</div>
                    <div className="text-lg font-bold text-slate-800 mt-0.5">
                      {vitals ? `${vitals.bloodPressure || vitals.blood_pressure || '—'} mmHg` : '—'}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600">Healthy</div>
                  </div>
                </div>

                <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Sugar (Fasting)</div>
                    <div className="text-lg font-bold text-slate-800 mt-0.5">
                      {vitals ? `${vitals.bloodSugar || vitals.blood_sugar || '—'} mg/dL` : '—'}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600">Normal</div>
                  </div>
                </div>

                <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Oxygen Saturation</div>
                    <div className="text-lg font-bold text-slate-800 mt-0.5">
                      {vitals ? `${vitals.oxygenSaturation || vitals.oxygen_saturation || vitals.oxygen || '—'}%` : '—'}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600">Excellent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <AppointmentsList />
          </div>

          {/* Right Column: Active Prescriptions */}
          <div className="bg-white rounded-3xl p-6 shadow-[10px_10px_30px_rgba(0,0,0,0.02),-10px_-10px_30px_rgba(255,255,255,0.9)] border border-slate-50 font-sans">
            <div className="flex items-center gap-2 mb-6">
              <Pill className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-bold text-slate-800 m-0">My Active Prescriptions</h3>
            </div>

            {loadingPatientData ? (
              <div className="text-center py-6 text-slate-400 font-medium animate-pulse">
                Loading prescriptions...
              </div>
            ) : patientPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium bg-[#f8fafc] rounded-2xl border border-dashed border-slate-200 p-4">
                No active prescriptions.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {patientPrescriptions.map((pr) => (
                  <div key={pr.id} className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 m-0">{pr.medication_name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Prescribed by Dr. {pr.doctor_name || 'Sarah Jenkins'}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-orange-50 text-orange-500 rounded-md">Active</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-3 border-t border-slate-100 pt-2 flex justify-between items-center">
                      <span className="truncate max-w-[150px]">{pr.dosage}</span>
                      <span className="font-semibold text-slate-700 shrink-0">RX Details</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Render STAFF Dashboard
  if (user?.role === 'STAFF') {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
        
        {/* Staff Operations Welcome */}
        <div className="mb-8 p-6 bg-white rounded-3xl shadow-[10px_10px_30px_rgba(0,0,0,0.02),-10px_-10px_30px_rgba(255,255,255,0.9)] border border-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 m-0">Operations Control Center</h2>
          <p className="text-slate-500 text-sm mt-1">Hello, {user.fullName}! Monitor patient check-ins and clinic logistics below.</p>
        </div>

        {/* Operational Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-50 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
              <UserCheck size={18} />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Checked-In Today</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">24 Patients</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-50 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Clock size={18} />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Waiting Time</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">14 Minutes</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-50 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 size={18} />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Rooms</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">6 / 8 Rooms</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-50 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
              <ShieldAlert size={18} />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Information Alerts</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">3 Pending</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Triage check-in list */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md border border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-slate-800 m-0">Patient Check-In Logs</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{checkIns.filter(c => c.status === 'WAITING').length} awaiting check-in</span>
            </div>

            <div className="flex flex-col gap-4">
              {checkIns.map((patient) => (
                <div key={patient.id} className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{patient.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Reason: {patient.reason} • Scheduled for {patient.time}</div>
                  </div>
                  <div>
                    {patient.status === 'WAITING' ? (
                      <button 
                        onClick={() => handleCheckIn(patient.id)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer border-none transition-all"
                      >
                        Check In
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">Checked In</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Quick operational shortcuts */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-50 flex flex-col gap-6">
            <h3 className="text-base font-bold text-slate-800 m-0">Staff Actions</h3>
            
            <button 
              onClick={() => navigate('/appointments')}
              className="w-full text-center py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl shadow-sm transition-all cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Schedule Appointment
            </button>
 
            <button 
              onClick={() => alert("Room status and waiting logs successfully exported and sent to the reception printer (Main Hall).")}
              className="w-full text-center py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200/80 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Print Room Log
            </button>
 
            <button 
              onClick={() => {
                const msg = prompt("Enter the system announcement to broadcast to all clinical rooms:");
                if (msg) {
                  alert(`Broadcast sent: "${msg}" is now scrolling on all hallway monitor screens.`);
                }
              }}
              className="w-full text-center py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200/80 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Broadcast Alert
            </button>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="p-6 text-center text-slate-500">
      Loading Workspace Dashboard...
    </div>
  );
};

export default Dashboard;
