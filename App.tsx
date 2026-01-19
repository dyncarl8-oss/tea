import React, { useState } from 'react';
import {
  Leaf,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from './types';
import { SymptomTool } from './components/SymptomTool';
import { Community } from './components/Community';
import { AffiliateDashboard } from './components/AffiliateDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AuthProvider, useAuth } from './services/AuthContext';

const AppContent: React.FC = () => {
  const { user, isLoading, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'symptom' | 'community' | 'affiliate' | 'admin'>('symptom');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] text-brand-dark">Loading Herbal Roots...</div>;
  }

  // If no user, show simple login or guest view?
  // For now, we allow guest access to Symptom Tool.
  // But navigation logic depends on user.

  const NavItem = ({
    view,
    label,
    icon: Icon
  }: {
    view: 'symptom' | 'community' | 'affiliate' | 'admin',
    label: string,
    icon: React.ElementType
  }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${currentView === view
          ? 'bg-brand-primary text-white shadow-md'
          : 'text-stone-600 hover:bg-stone-100'
        }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col md:flex-row">

      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 text-brand-dark">
          <Leaf className="h-6 w-6" />
          <span className="font-serif font-bold text-lg tracking-wide">Herbal Roots</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-64 bg-white border-r border-stone-200 z-40 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col
      `}>
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 text-brand-dark mb-10">
            <div className="bg-brand-dark text-white p-2 rounded-lg">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="font-serif font-bold text-xl tracking-wide hidden md:block">Herbal Roots</span>
          </div>

          <nav className="space-y-2">
            <NavItem view="symptom" label="Symptom Tool" icon={Leaf} />

            {(user && user.role !== 'guest') && (
              <NavItem view="community" label="The Steep Circle" icon={Users} />
            )}

            {(user && (user.role === 'affiliate' || user.role === 'admin')) && (
              <NavItem view="affiliate" label="Affiliate Hub" icon={LayoutDashboard} />
            )}

            {user && user.role === 'admin' && (
              <NavItem view="admin" label="Admin Panel" icon={Settings} />
            )}

            {!user && (
              <button onClick={() => login()} className="w-full text-left px-4 py-3 text-brand-primary font-medium hover:underline">
                Login / Sync
              </button>
            )}
          </nav>
        </div>

        {user && (
          <div className="mt-auto p-6 border-t border-stone-100">
            <div className="flex items-center gap-3 mb-4">
              <img src={user.avatar || 'https://via.placeholder.com/100'} className="h-10 w-10 rounded-full border border-stone-200" alt="User" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-800 truncate">{user.name}</p>
                <div className="text-xs text-brand-primary font-medium uppercase tracking-wide">
                  Role: {user.role}
                </div>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm w-full">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
        {currentView === 'symptom' && (
          <SymptomTool userAffiliateId={user?.role === 'affiliate' ? user.affiliateId : undefined} />
        )}

        {currentView === 'community' && user && user.role !== 'guest' && (
          <Community />
        )}

        {currentView === 'affiliate' && user && (user.role === 'affiliate' || user.role === 'admin') && (
          <AffiliateDashboard user={user} />
        )}

        {currentView === 'admin' && user && user.role === 'admin' && (
          <AdminPanel />
        )}

        {/* Fallback for unauthorized access */}
        {((currentView === 'community' && (!user || user.role === 'guest')) ||
          (currentView === 'affiliate' && (!user || user.role === 'member')) ||
          (currentView === 'admin' && (!user || user.role !== 'admin'))) && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="bg-stone-100 p-6 rounded-full">
                <LockIcon />
              </div>
              <h2 className="text-2xl font-serif text-stone-700">Access Restricted</h2>
              <p className="text-stone-500 max-w-md">
                You need to upgrade your membership to access this area.
              </p>
              {!user && <button onClick={() => login()} className="px-6 py-2 bg-brand-primary text-white rounded-lg">Login</button>}
            </div>
          )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

export default App;
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

export default App;