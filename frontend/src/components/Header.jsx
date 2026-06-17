import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bell, Search, User, Settings, LogOut, FileText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token || !user) return;
      try {
        const list = [];
        if (user.role === 'DOCTOR' || user.role === 'STAFF') {
          const res = await fetch('http://localhost:5000/api/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const appointments = await res.json();
            
            // Urgent appointments
            const urgent = appointments.filter(a => (a.ai_urgency_score === 'HIGH' || a.ai_urgency_score === 'Urgent') && a.status === 'CONFIRMED');
            urgent.forEach(a => {
              list.push({
                id: `urgent-${a.id}`,
                title: 'Urgent Triage Alert',
                message: `${a.patient_name || 'Patient'} reports: "${a.triage_symptoms}"`,
                time: 'Live Alert'
              });
            });

            // Pending confirmations
            const pending = appointments.filter(a => a.status === 'PENDING');
            pending.forEach(a => {
              list.push({
                id: `pending-${a.id}`,
                title: 'Booking Request',
                message: `${a.patient_name || 'Patient'} is waiting for confirmation.`,
                time: 'Pending Action'
              });
            });
          }
        } else if (user.role === 'PATIENT') {
          // Patient prescriptions
          const prescRes = await fetch('http://localhost:5000/api/prescriptions', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (prescRes.ok) {
            const prescriptions = await prescRes.json();
            const active = prescriptions.filter(p => p.status === 'ACTIVE');
            active.forEach(p => {
              list.push({
                id: `presc-${p.id}`,
                title: 'Medication Reminder',
                message: `Active prescription: ${p.medication_name} (${p.dosage}).`,
                time: 'Active'
              });
            });
          }

          // Patient appointments
          const apptRes = await fetch('http://localhost:5000/api/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (apptRes.ok) {
            const appointments = await apptRes.json();
            const upcoming = appointments.filter(a => a.status === 'CONFIRMED');
            upcoming.forEach(a => {
              list.push({
                id: `appt-${a.id}`,
                title: 'Upcoming Visit',
                message: `Confirmed appointment with Dr. ${a.doctor_name || 'Sarah Jenkins'}.`,
                time: 'Scheduled'
              });
            });
          }
        }

        // Fallback default notifications if none
        if (list.length === 0) {
          list.push({
            id: 'default-1',
            title: 'System Active',
            message: 'HMS Suite is fully synchronized and secure.',
            time: 'System'
          });
        }

        setNotifications(list);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token, user]);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotificationsOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getWorkspaceTitle = () => {
    if (!user) return 'Workspace';
    switch (user.role) {
      case 'DOCTOR':
        return 'Doctor Workspace';
      case 'STAFF':
        return 'Clinic Operations Portal';
      case 'PATIENT':
        return 'Patient Health Portal';
      default:
        return 'HMS Workspace';
    }
  };

  const getUserInitials = () => {
    if (!user || !user.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="h-20 bg-[#f4f7fb] flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-8 flex-1">
        <h2 className="text-xl font-bold text-slate-800 m-0">{getWorkspaceTitle()}</h2>
        
        {/* Search Bar with Dropdown */}
        <div ref={searchRef} className="relative z-40">
          <div className={`flex items-center bg-white px-4 py-2.5 rounded-2xl transition-all w-96 border ${
            isSearchFocused ? 'border-orange-200 shadow-[inset_2px_2px_5px_rgba(249,115,22,0.1),inset_-2px_-2px_5px_rgba(255,255,255,1)] ring-2 ring-orange-50' : 'border-slate-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02),inset_-2px_-2px_5px_rgba(255,255,255,1)]'
          }`}>
            <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Search patients, ID, or records..." 
              className="border-none bg-transparent outline-none w-full text-sm text-slate-700 placeholder-slate-400 font-medium" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
          </div>
          
          {isSearchFocused && searchQuery && (
            <div className="absolute top-14 left-0 w-full bg-white rounded-2xl shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100 p-2 flex flex-col gap-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Patients</div>
              <div className="p-3 hover:bg-[#f4f7fb] rounded-xl cursor-pointer flex items-center gap-3 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={14}/></div>
                <div>
                  <div className="text-sm font-bold text-slate-700">John Doe</div>
                  <div className="text-xs text-slate-500">PT-4921</div>
                </div>
              </div>
              <div className="p-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Records</div>
              <div className="p-3 hover:bg-[#f4f7fb] rounded-xl cursor-pointer flex items-center gap-3 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><FileText size={14}/></div>
                <div>
                  <div className="text-sm font-bold text-slate-700">Lab Results - Complete Blood Count</div>
                  <div className="text-xs text-slate-500">Today, 9:00 AM</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative z-40">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-3 text-slate-500 hover:text-orange-500 bg-[#f4f7fb] shadow-[5px_5px_10px_#e6e9ed,-5px_-5px_10px_#ffffff] rounded-full transition-all cursor-pointer border-none active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff]"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && notifications[0].id !== 'default-1' && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#f4f7fb]"></span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute top-14 right-0 w-80 bg-white rounded-3xl shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
                Notifications
                <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full">{notifications.length} New</span>
              </div>
              <div className="flex flex-col max-h-[300px] overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 hover:bg-[#f4f7fb] cursor-pointer border-b border-slate-50 transition-colors flex gap-3 items-start">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.title.includes('Urgent') ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-700">{n.title}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-normal">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-2 font-medium">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center text-xs font-bold text-slate-400 hover:text-slate-650 cursor-pointer bg-slate-50/50">
                Mark All as Read
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative z-40">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-2 pr-4 bg-[#f4f7fb] shadow-[5px_5px_10px_#e6e9ed,-5px_-5px_10px_#ffffff] rounded-2xl transition-all cursor-pointer border-none active:shadow-[inset_2px_2px_5px_#e6e9ed,inset_-2px_-2px_5px_#ffffff] text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold shrink-0">
              {getUserInitials()}
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user?.fullName || 'Guest User'}</span>
          </button>

          {isProfileOpen && (
            <div className="absolute top-16 right-0 w-56 bg-white rounded-3xl shadow-[10px_10px_30px_#d9d9d9,-10px_-10px_30px_#ffffff] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right p-2 flex flex-col gap-1">
              <div className="px-4 py-3 border-b border-slate-100 mb-1">
                <div className="text-sm font-bold text-slate-800">{user?.fullName || 'Guest User'}</div>
                <div className="text-xs text-orange-500 font-semibold uppercase tracking-wider">{user?.role || 'Guest'}</div>
              </div>
              <div className="p-3 hover:bg-[#f4f7fb] rounded-xl cursor-pointer flex items-center gap-3 text-sm text-slate-600 font-medium transition-colors">
                <User size={16} /> My Profile
              </div>
              <div className="p-3 hover:bg-[#f4f7fb] rounded-xl cursor-pointer flex items-center gap-3 text-sm text-slate-600 font-medium transition-colors">
                <Settings size={16} /> Preferences
              </div>
              <div className="h-px bg-slate-100 my-1"></div>
              <div 
                onClick={logout}
                className="p-3 hover:bg-red-50 text-red-600 rounded-xl cursor-pointer flex items-center gap-3 text-sm font-medium transition-colors"
              >
                <LogOut size={16} /> Log Out
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
