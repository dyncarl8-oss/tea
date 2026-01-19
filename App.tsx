
import React, { useState } from 'react';
import {
  Leaf,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Lock
} from 'lucide-react';
import { SymptomTool } from './components/SymptomTool';
import { Community } from './components/Community';
import { AffiliateDashboard } from './components/AffiliateDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AuthProvider, useAuth } from './services/AuthContext';

const AppContent: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'symptom' | 'community' | 'affiliate' | 'admin'>('symptom');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-dark font-serif text-lg">Brewing your experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-stone-100">
          <div className="mb-6 flex justify-center text-brand-primary">
            <Lock className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-serif text-brand-dark mb-4">Identity Required</h1>
          <p className="text-stone-600 mb-8">
            This workspace is exclusive to the Herbal Roots tribe. Please access via your Whop Dashboard to authenticate.
          </p>
          <a
            href="https://whop.com/hub"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-brand-primary text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-brand-primary/20 transition-all hover:-translate-y-1"
          >
            Open Whop Hub
          </a>
        </div>
      </div>
    );
  }

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

            {user.role !== 'guest' && (
              <NavItem view="community" label="The Steep Circle" icon={Users} />
            )}

            {(user.role === 'affiliate' || user.role === 'admin') && (
              <NavItem view="affiliate" label="Affiliate Hub" icon={LayoutDashboard} />
            )}

            {user.role === 'admin' && (
              <NavItem view="admin" label="Admin Panel" icon={Settings} />
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=1d5b52&color=fff`}
              className="h-10 w-10 rounded-full border border-stone-200"
              alt="User"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-800 truncate">{user.username}</p>
              <div className="text-xs text-brand-primary font-medium uppercase tracking-wide">
                {user.role}
              </div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm w-full">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
        {currentView === 'symptom' && (
          <SymptomTool userAffiliateId={user.role === 'affiliate' ? user.affiliateId : undefined} />
        )}

        {currentView === 'community' && user.role !== 'guest' && (
          <Community />
        )}

        {currentView === 'affiliate' && (user.role === 'affiliate' || user.role === 'admin') && (
          <AffiliateDashboard user={user} />
        )}

        {currentView === 'admin' && user.role === 'admin' && (
          <AdminPanel />
        )}

        {/* Access Denied Fallbacks */}
        {((currentView === 'community' && user.role === 'guest') ||
          (currentView === 'affiliate' && user.role === 'member') ||
          (currentView === 'admin' && user.role !== 'admin')) && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
              <div className="bg-stone-100 p-6 rounded-full text-stone-400">
                <Lock className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-serif text-brand-dark">Access Restricted</h2>
              <p className="text-stone-500 max-w-md">
                This sacred ritual is reserved for higher membership tiers. Please upgrade your status in Whop.
              </p>
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

export default App;