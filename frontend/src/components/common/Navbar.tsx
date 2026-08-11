import { Link, useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, User, ScanLine } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-dark-800/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Welcome back,</span>
        <span className="text-white font-semibold text-sm">{user?.name || 'Doctor'}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Scan CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/scan')}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          <ScanLine className="w-4 h-4" />
          New Scan
        </motion.button>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <Link to="/dashboard">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center cursor-pointer">
            <User className="w-4 h-4 text-white" />
          </div>
        </Link>
      </div>
    </header>
  );
}
