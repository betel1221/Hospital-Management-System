import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      return 'Email address is required';
    } else if (!emailRegex.test(val)) {
      return 'Please enter a valid email address (e.g. name@domain.com)';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required';
    } else if (val.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailTouched) {
      setEmailError(validateEmail(val));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordTouched) {
      setPasswordError(validatePassword(val));
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Final validation checks
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    
    setEmailTouched(true);
    setPasswordTouched(true);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      triggerShake();
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setIsLoading(true);
    const result = await login(demoEmail, demoPassword);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      triggerShake();
      setIsLoading(false);
    }
  };

  // Border coloring according to validation state
  const getEmailBorderClass = () => {
    if (!emailTouched) return 'border-transparent focus-within:ring-orange-500/20 focus-within:border-orange-500';
    return emailError 
      ? 'border-red-500 ring-2 ring-red-500/10' 
      : 'border-emerald-500 ring-2 ring-emerald-500/10';
  };

  const getPasswordBorderClass = () => {
    if (!passwordTouched) return 'border-transparent focus-within:ring-orange-500/20 focus-within:border-orange-500';
    return passwordError 
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
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(255,255,255,1),inset_-2px_-2px_5px_rgba(0,0,0,0.05)] mb-4">
            <Stethoscope size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to the Hospital Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-650 text-sm font-semibold rounded-xl border border-red-150 text-center flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-200">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-sm font-semibold text-slate-600">Email Address</label>
              {emailTouched && (
                emailError 
                  ? <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10}/> Invalid Format</span>
                  : <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Checked</span>
              )}
            </div>
            
            <div className={`flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl border transition-all ${getEmailBorderClass()}`}>
              <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="email" 
                placeholder="doctor@hospital.com" 
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                required
              />
            </div>
            {emailTouched && emailError && (
              <p className="text-[10px] text-red-500 font-semibold mt-1.5 ml-2 m-0 animate-in fade-in slide-in-from-top-1">{emailError}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-sm font-semibold text-slate-600">Password</label>
              {passwordTouched && (
                passwordError 
                  ? <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle size={10}/> Too Short</span>
                  : <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Secure</span>
              )}
            </div>

            <div className={`flex items-center bg-[#f4f7fb] px-4 py-3 rounded-2xl border transition-all ${getPasswordBorderClass()}`}>
              <Lock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="border-none bg-transparent outline-none w-full text-slate-700 font-medium"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                required
              />
            </div>
            {passwordTouched && passwordError && (
              <p className="text-[10px] text-red-500 font-semibold mt-1.5 ml-2 m-0 animate-in fade-in slide-in-from-top-1">{passwordError}</p>
            )}
          </div>

          <div className="flex justify-end mt-[-10px]">
            <a href="#" className="text-xs font-bold text-orange-500 hover:text-orange-650 transition-colors">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full py-3.5 bg-orange-500 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:bg-orange-600 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Don't have an account? <Link to="/register" className="text-orange-500 font-bold hover:underline">Register here</Link>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center mb-3">Instant Demo Access</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('doctor@hms.com', 'Password123!')}
              disabled={isLoading}
              className="py-2.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-[10px] cursor-pointer border-none text-center transition-all disabled:opacity-60"
            >
              Doctor
            </button>
            <button
              onClick={() => handleQuickLogin('patient@hms.com', 'Password123!')}
              disabled={isLoading}
              className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-[10px] cursor-pointer border-none text-center transition-all disabled:opacity-60"
            >
              Patient
            </button>
            <button
              onClick={() => handleQuickLogin('staff@hms.com', 'Password123!')}
              disabled={isLoading}
              className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] cursor-pointer border-none text-center transition-all disabled:opacity-60"
            >
              Staff
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
