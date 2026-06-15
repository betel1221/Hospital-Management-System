import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Shield } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'DOCTOR'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      // For MVP, just redirect to login after successful registration
      navigate('/login');
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff] border border-slate-50">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(255,255,255,1),inset_-2px_-2px_5px_rgba(0,0,0,0.05)] mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join the Hospital Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 text-center animate-in fade-in zoom-in duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Full Name</label>
            <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 border border-transparent transition-all">
              <User className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="text" 
                name="fullName"
                placeholder="Dr. Sarah Jenkins" 
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Email Address</label>
            <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 border border-transparent transition-all">
              <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="email" 
                name="email"
                placeholder="doctor@hospital.com" 
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Password</label>
            <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 border border-transparent transition-all">
              <Lock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Role</label>
            <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,1)] focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 border border-transparent transition-all">
              <Shield className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <select 
                name="role"
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="DOCTOR">Doctor</option>
                <option value="STAFF">Staff</option>
                <option value="PATIENT">Patient</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Already have an account? <Link to="/login" className="text-orange-500 font-bold hover:underline">Sign In</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
