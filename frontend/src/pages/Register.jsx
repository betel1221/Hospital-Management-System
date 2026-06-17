import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Shield, ArrowLeft, AlertCircle, CheckCircle, Check, X } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'DOCTOR'
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Real-time password strength checks
  const passwordCriteria = {
    length: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasUpperLower: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password)
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'Email address is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/\d/.test(value)) return 'Password must contain at least one number';
        if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) return 'Password must contain both uppercase and lowercase letters';
        if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Touch and validate all fields
    const newTouched = { fullName: true, email: true, password: true };
    const newErrors = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };

    setTouched(newTouched);
    setErrors(newErrors);

    if (newErrors.fullName || newErrors.email || newErrors.password) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message || 'Registration failed');
      triggerShake();
    }
    
    setIsLoading(false);
  };

  // Border highlighting styles
  const getBorderClass = (name) => {
    if (!touched[name]) return 'border-transparent focus-within:ring-orange-500/20 focus-within:border-orange-500';
    return errors[name] 
      ? 'border-red-500 ring-2 ring-red-500/10' 
      : 'border-emerald-500 ring-2 ring-emerald-500/10';
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4 font-sans text-slate-800 relative">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .shake-active {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
      
      <Link to="/" className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 shadow-sm border border-slate-200/40 flex items-center justify-center transition-all">
        <ArrowLeft size={18} />
      </Link>

      <div className={`w-full max-w-md bg-white rounded-3xl p-8 shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff] border border-slate-50 transition-all ${
        isShaking ? 'shake-active' : ''
      }`}>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(255,255,255,1),inset_-2px_-2px_5px_rgba(0,0,0,0.05)] mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join the Hospital Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-650 text-sm font-semibold rounded-xl border border-red-150 text-center flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-200">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              {touched.fullName && (
                errors.fullName 
                  ? <span className="text-[9px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={9}/> Required</span>
                  : <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={9}/> OK</span>
              )}
            </div>
            <div className={`flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl border transition-all ${getBorderClass('fullName')}`}>
              <User className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="text" 
                name="fullName"
                placeholder="Dr. Sarah Jenkins" 
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium text-sm"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {touched.fullName && errors.fullName && (
              <p className="text-[10px] text-red-500 font-semibold mt-1 ml-2 m-0 animate-in fade-in slide-in-from-top-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              {touched.email && (
                errors.email 
                  ? <span className="text-[9px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={9}/> Invalid</span>
                  : <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={9}/> OK</span>
              )}
            </div>
            <div className={`flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl border transition-all ${getBorderClass('email')}`}>
              <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="email" 
                name="email"
                placeholder="doctor@hospital.com" 
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium text-sm"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-[10px] text-red-500 font-semibold mt-1 ml-2 m-0 animate-in fade-in slide-in-from-top-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              {touched.password && (
                errors.password 
                  ? <span className="text-[9px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={9}/> Weak</span>
                  : <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={9}/> Strong</span>
              )}
            </div>
            <div className={`flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl border transition-all ${getBorderClass('password')}`}>
              <Lock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium text-sm"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>
            {touched.password && errors.password && (
              <p className="text-[10px] text-red-500 font-semibold mt-1 ml-2 m-0 animate-in fade-in slide-in-from-top-1">{errors.password}</p>
            )}

            {/* Password Criteria checklist */}
            <div className="mt-2.5 p-3.5 bg-[#f8fafc] rounded-2xl border border-slate-100 flex flex-col gap-1.5">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Password Requirements:</div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                {passwordCriteria.length ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-slate-300" />}
                <span className={passwordCriteria.length ? 'text-emerald-600' : 'text-slate-400'}>Minimum 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                {passwordCriteria.hasNumber ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-slate-300" />}
                <span className={passwordCriteria.hasNumber ? 'text-emerald-600' : 'text-slate-400'}>At least one number</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                {passwordCriteria.hasUpperLower ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-slate-300" />}
                <span className={passwordCriteria.hasUpperLower ? 'text-emerald-600' : 'text-slate-400'}>Uppercase & lowercase letters</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                {passwordCriteria.hasSpecial ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-slate-300" />}
                <span className={passwordCriteria.hasSpecial ? 'text-emerald-600' : 'text-slate-400'}>At least one special symbol</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Account Role</label>
            <div className="flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl border border-transparent focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <Shield className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <select 
                name="role"
                className="border-none bg-transparent outline-none w-full text-slate-700 font-semibold text-sm cursor-pointer"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="DOCTOR">Doctor / Clinician</option>
                <option value="STAFF">Clinic Operations Staff</option>
                <option value="PATIENT">Patient Profile</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-3 w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-slate-500">
          Already have an account? <Link to="/login" className="text-orange-500 font-bold hover:underline">Sign In</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
