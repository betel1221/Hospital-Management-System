import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, LogOut, Bell, Eye, Save } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: false,
    aiDigest: true,
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
    <div className="p-6 max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800 m-0">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile details and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-50 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-[5px_5px_15px_rgba(249,115,22,0.1)]">
              {getUserInitials()}
            </div>
            
            <h3 className="font-extrabold text-slate-850 m-0 text-lg">{user?.fullName || 'User Profile'}</h3>
            <span className="text-xs text-orange-500 font-bold uppercase tracking-wider mt-1">{user?.role || 'User'}</span>
            <p className="text-xs text-slate-400 mt-2">{user?.email}</p>

            <button 
              onClick={logout}
              className="mt-6 w-full py-3 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-2xl border border-red-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>

        {/* Right Column: Profile Form & Preferences */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Profile Form */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-50">
            <h3 className="text-base font-bold text-slate-800 m-0 mb-5 flex items-center gap-2">
              <User size={18} className="text-orange-500" /> Personal Details
            </h3>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                  <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl border border-slate-100">
                    <User className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                    <input 
                      type="text" 
                      className="border-none bg-transparent outline-none w-full text-sm font-semibold text-slate-700"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                  <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl border border-slate-100">
                    <Mail className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                    <input 
                      type="email" 
                      className="border-none bg-transparent outline-none w-full text-sm font-semibold text-slate-700"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Security Role</label>
                <div className="flex items-center bg-slate-100 px-4 py-3 rounded-2xl border border-slate-200/50 cursor-not-allowed">
                  <Shield className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                  <input 
                    type="text" 
                    className="border-none bg-transparent outline-none w-full text-sm font-semibold text-slate-500 cursor-not-allowed"
                    value={user?.role || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                {isSaved ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg animate-pulse">Changes Saved Successfully</span>
                ) : <span />}
                
                <button 
                  type="submit"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 border-none cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-50">
            <h3 className="text-base font-bold text-slate-800 m-0 mb-5 flex items-center gap-2">
              <Bell size={18} className="text-orange-500" /> Notifications & Preferences
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <div>
                  <div className="text-sm font-bold text-slate-700">Email Notifications</div>
                  <div className="text-xs text-slate-400 font-medium">Receive clinic summary reports and prescription updates.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <div>
                  <div className="text-sm font-bold text-slate-700">SMS Appointment Alerts</div>
                  <div className="text-xs text-slate-400 font-medium">Get urgent triage status and text reminders.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.smsAlerts}
                  onChange={(e) => setPreferences({ ...preferences, smsAlerts: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="text-sm font-bold text-slate-700">Ambient AI Scribe Digest</div>
                  <div className="text-xs text-slate-400 font-medium">Auto-archive SOAP summaries and transcripts.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.aiDigest}
                  onChange={(e) => setPreferences({ ...preferences, aiDigest: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
