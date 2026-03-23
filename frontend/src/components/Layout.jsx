import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import NotificationBell from './NotificationBell.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    ...(user?.role === 'ADMIN'
      ? [
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/banner', label: 'Banner' },
          { to: '/admin/notices', label: 'Notices' },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            {/* Logo + desktop nav links */}
            <div className="flex items-center gap-5">
              <Link
                to="/dashboard"
                className="font-display font-semibold text-base sm:text-xl text-slate-800 flex-shrink-0"
              >
                Kookie Move On
              </Link>
              <div className="hidden sm:flex items-center gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-slate-600 hover:text-[#116176] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />
              <span className="hidden sm:block text-sm text-slate-500 truncate max-w-[160px]">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="hidden sm:block text-sm text-slate-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
              {/* Hamburger — mobile only */}
              <button
                className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center py-2.5 px-3 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-[#116176] transition-colors text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 mt-1 border-t border-slate-100">
                <p className="px-3 py-1 text-xs text-slate-400 truncate">{user?.email}</p>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center w-full py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
