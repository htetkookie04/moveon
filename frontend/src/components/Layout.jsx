import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import NotificationBell from './NotificationBell.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="font-display font-semibold text-xl text-slate-800">
                Move on Calendar
              </Link>
              <Link
                to="/dashboard"
                className="text-slate-600 hover:text-streak-600 transition-colors"
              >
                Dashboard
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/users"
                    className="text-slate-600 hover:text-streak-600 transition-colors"
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/banner"
                    className="text-slate-600 hover:text-streak-600 transition-colors"
                  >
                    Banner
                  </Link>
                  <Link
                    to="/admin/notices"
                    className="text-slate-600 hover:text-streak-600 transition-colors"
                  >
                    Notices
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <span className="text-sm text-slate-500">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
