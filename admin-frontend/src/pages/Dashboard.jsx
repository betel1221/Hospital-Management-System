import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, 
  Activity, 
  Calendar, 
  LogOut, 
  Trash2, 
  ShieldAlert, 
  Search, 
  Briefcase,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ ADMIN: 0, DOCTOR: 0, PATIENT: 0, STAFF: 0, appointments: 0 });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Dashboard Stats and Users
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showNotification('error', 'Failed to retrieve database records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Role Change
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update role');
      }

      showNotification('success', 'User role updated successfully');
      fetchData(); // Refresh data to update stats and table
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  // Handle User Deletion
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      showNotification('success', `Deleted user ${name}`);
      fetchData(); // Refresh data
    } catch (error) {
      showNotification('error', error.message);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch(role) {
      case 'ADMIN':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">Admin</span>;
      case 'DOCTOR':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Doctor</span>;
      case 'STAFF':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">Staff</span>;
      case 'PATIENT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">Patient</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20">{role}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
            : 'bg-red-950/80 text-red-300 border-red-800'
        }`}>
          <ShieldAlert className="w-5 h-5" />
          <span className="font-semibold text-sm">{notification.text}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">HMS Command Center</h1>
              <p className="text-xs text-slate-400">Enterprise Database Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-200">{user?.fullName}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-900 shadow-lg relative overflow-hidden group hover:border-slate-800/80 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-4">
              <UserCheck size={22} />
            </div>
            <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">Active Doctors</div>
            <div className="text-3xl font-extrabold text-white">{stats.DOCTOR}</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-900 shadow-lg relative overflow-hidden group hover:border-slate-800/80 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 mb-4">
              <Users size={22} />
            </div>
            <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">Total Patients</div>
            <div className="text-3xl font-extrabold text-white">{stats.PATIENT}</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-900 shadow-lg relative overflow-hidden group hover:border-slate-800/80 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all"></div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 mb-4">
              <Briefcase size={22} />
            </div>
            <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">Support Staff</div>
            <div className="text-3xl font-extrabold text-white">{stats.STAFF}</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-900 shadow-lg relative overflow-hidden group hover:border-slate-800/80 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 mb-4">
              <Calendar size={22} />
            </div>
            <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">Appointments</div>
            <div className="text-3xl font-extrabold text-white">{stats.appointments}</div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-900 shadow-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Database Users</h2>
              <p className="text-sm text-slate-400">View, update roles, and manage credentials in `hms_2026`</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 focus-within:border-slate-800 transition-all">
                <Search size={16} className="text-slate-500 mr-2 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search by name/email..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select 
                className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none cursor-pointer focus:border-slate-800"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="STAFF">Staff</option>
                <option value="PATIENT">Patient</option>
              </select>

              <button 
                onClick={fetchData}
                className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Refresh Records"
              >
                <Activity size={18} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-900">
            {loading ? (
              <div className="py-20 text-center text-slate-500">
                <Activity className="w-8 h-8 mx-auto animate-spin mb-4 text-blue-500" />
                <span>Syncing registry records...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <span>No user records found matching current query.</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-900 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                    <th className="py-4 px-5">Name</th>
                    <th className="py-4 px-5">Email Address</th>
                    <th className="py-4 px-5">Current Role</th>
                    <th className="py-4 px-5">Registration Date</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-sm font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-5 text-white">{u.full_name}</td>
                      <td className="py-4 px-5 text-slate-300">{u.email}</td>
                      <td className="py-4 px-5">{getRoleBadge(u.role)}</td>
                      <td className="py-4 px-5 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Role Updater Select */}
                          <select 
                            className="bg-slate-950 border border-slate-900 text-xs rounded-lg px-2 py-1 text-slate-300 outline-none cursor-pointer focus:border-slate-800"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user?.id} // Cannot change own role
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="STAFF">Staff</option>
                            <option value="PATIENT">Patient</option>
                          </select>

                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.full_name)}
                            disabled={u.id === user?.id}
                            className={`p-1.5 rounded-lg border border-slate-900 transition-colors ${
                              u.id === user?.id 
                                ? 'opacity-30 cursor-not-allowed text-slate-600' 
                                : 'text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 cursor-pointer'
                            }`}
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
