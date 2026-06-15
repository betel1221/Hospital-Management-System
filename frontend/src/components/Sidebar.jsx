import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Stethoscope, Calendar, Users, FileText, Activity, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 mx-4 rounded-xl cursor-pointer transition-all duration-300 ${
      isActive
        ? 'bg-orange-50 text-orange-600 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,1)] font-semibold'
        : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 font-medium'
    }`;

  return (
    <aside className="w-72 bg-[#f4f7fb] flex flex-col h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="p-6 flex items-center gap-3 font-bold text-slate-800 text-lg">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <span>HMS Suite</span>
      </div>
      
      <nav className="flex-1 py-4 flex flex-col gap-2">
        <NavLink to="/dashboard" className={navLinkClass}>
          <Activity className="w-5 h-5" /> <span className="text-sm">Dashboard</span>
        </NavLink>

        {/* Doctor & Staff View Appointments Queue */}
        {(user?.role === 'DOCTOR' || user?.role === 'STAFF') && (
          <NavLink to="/appointments" className={navLinkClass}>
            <Calendar className="w-5 h-5" /> <span className="text-sm">Appointments Queue</span>
          </NavLink>
        )}

        {/* Patient View My Appointments */}
        {user?.role === 'PATIENT' && (
          <NavLink to="/appointments" className={navLinkClass}>
            <Calendar className="w-5 h-5" /> <span className="text-sm">My Appointments</span>
          </NavLink>
        )}

        {/* Doctor & Staff View Patient Records */}
        {(user?.role === 'DOCTOR' || user?.role === 'STAFF') && (
          <NavLink to="/patients" className={navLinkClass}>
            <Users className="w-5 h-5" /> <span className="text-sm">Patient Records</span>
          </NavLink>
        )}

        {/* Doctor View E-Prescribing */}
        {user?.role === 'DOCTOR' && (
          <NavLink to="/eprescribing" className={navLinkClass}>
            <FileText className="w-5 h-5" /> <span className="text-sm">E-Prescribing</span>
          </NavLink>
        )}

        {/* Patient View My Prescriptions */}
        {user?.role === 'PATIENT' && (
          <NavLink to="/eprescribing" className={navLinkClass}>
            <FileText className="w-5 h-5" /> <span className="text-sm">My Prescriptions</span>
          </NavLink>
        )}
      </nav>
      
      <div className="p-6 mt-auto">
        <NavLink to="/settings" className={navLinkClass}>
          <Settings className="w-5 h-5" /> <span className="text-sm">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
