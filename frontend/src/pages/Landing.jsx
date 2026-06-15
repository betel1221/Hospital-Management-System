import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Stethoscope, 
  Shield, 
  Calendar, 
  FileText, 
  Users, 
  Activity, 
  ArrowRight,
  ChevronRight,
  Brain
} from 'lucide-react';

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f4f7fb] via-white to-[#edf2f9] text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 font-bold text-slate-800 text-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-tight text-xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">HMS Suite</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(249,115,22,0.25)] flex items-center gap-2 transition-all cursor-pointer border-none"
            >
              <span>Go to Workspace</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2.5 text-slate-600 hover:text-slate-950 font-bold transition-all text-sm no-underline">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(249,115,22,0.25)] text-sm no-underline transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 flex flex-col lg:flex-row items-center gap-12 z-10">
        
        {/* Left Column: Text Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider mb-6 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.02)] border border-orange-100">
            <Brain size={14} />
            <span>AI-Driven Healthcare Workspace</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Clinical Workflow, <br/>
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Reimagined.</span>
          </h1>
          
          <p className="mt-6 text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
            An intelligent, unified workspace designed for doctors, clinic staff, and patients. 
            Streamline queues with AI triage urgency, automate clinic charting with ambient voice scribing, and manage digital prescriptions effortlessly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer border-none transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Launch Command Center</span>
              <ChevronRight size={18} />
            </button>
            
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Join as Patient</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 pt-8 border-t border-slate-200/60 flex flex-wrap gap-8 justify-center lg:justify-start">
            <div>
              <div className="text-2xl font-bold text-slate-900">99.8%</div>
              <div className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Scribe Accuracy</div>
            </div>
            <div className="w-px bg-slate-200 self-stretch"></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">&lt; 3 Min</div>
              <div className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Triage Processing</div>
            </div>
            <div className="w-px bg-slate-200 self-stretch"></div>
            <div>
              <div className="text-2xl font-bold text-slate-900">Zero-Paper</div>
              <div className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Digital Prescription</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Dashboard Mockup Card */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[30px_30px_60px_rgba(0,0,0,0.06),-10px_-10px_30px_rgba(255,255,255,0.8)] border border-slate-100/50 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-green-400"></span>
              </div>
              <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">HMS Dashboard</span>
            </div>

            {/* Simulated Live Queue Card */}
            <div className="mt-6 bg-[#f4f7fb] p-4 rounded-2xl border border-slate-50 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-500">Live Urgency Triage</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-md">Urgent Queue</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">JD</div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">John Doe</div>
                      <div className="text-[10px] text-slate-400">Chest pain & lightheadedness</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-lg">High (8.7)</span>
                </div>

                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">AS</div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Alice Smith</div>
                      <div className="text-[10px] text-slate-400">Routine follow-up lab review</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-lg">Low (2.4)</span>
                </div>
              </div>
            </div>

            {/* Scribe Widget Card */}
            <div className="mt-4 p-4 border border-slate-100 rounded-2xl flex gap-3 items-center bg-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-700">Ambient AI Scribe</div>
                <div className="text-[10px] text-slate-400 truncate">Patient states symptoms started 3 days ago...</div>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold bg-orange-50 text-orange-600 rounded-lg">Active</span>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between text-[11px] text-slate-400 font-bold">
              <span className="flex items-center gap-1"><Shield size={12}/> HIPAA Compliant</span>
              <span className="flex items-center gap-1"><Shield size={12}/> 256-bit Encryption</span>
              <span className="flex items-center gap-1"><Shield size={12}/> HL7 Compatible</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
              <Stethoscope size={16} />
            </div>
            <span className="font-bold text-white text-sm">HMS Suite v2.0</span>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-white transition-colors text-inherit no-underline">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors text-inherit no-underline">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors text-inherit no-underline">Contact Support</a>
          </div>
          <div className="text-xs">
            &copy; 2026 HMS Suite Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
