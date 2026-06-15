import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-800">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0">Admin Control Center</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage the Hospital Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/50 text-red-400 text-sm font-semibold rounded-xl border border-red-900/50 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2 ml-1">Admin Email</label>
            <div className="flex items-center bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all">
              <Mail className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
              <input 
                type="email" 
                placeholder="admin@hms.com" 
                className="border-none bg-transparent outline-none w-full text-slate-200 placeholder-slate-600 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2 ml-1">Password</label>
            <div className="flex items-center bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all">
              <Lock className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="border-none bg-transparent outline-none w-full text-slate-200 placeholder-slate-600 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_4px_20px_0_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 font-medium border-t border-slate-800/60 pt-6">
          Authorized personnel only. All access is logged and monitored.
        </div>

      </div>
    </div>
  );
};

export default Login;
