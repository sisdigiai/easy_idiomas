import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_NAVIGATION, Role } from "@/config/navigation";
import { useEffect, useState } from "react";

export function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [isDark, setIsDark] = useState(false);
  
  const userName = profile?.full_name || "Convidado";
  const userRole = (profile?.role as Role) || "student"; // Default to student in mock mode if role is missing, or whatever is safe
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

  const filteredNavItems = ROLE_NAVIGATION[userRole] || ROLE_NAVIGATION['student'];

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-on-background">
      {/* Desktop Sidebar - Premium Clean SaaS Look */}
      <aside className="hidden md:flex flex-col w-[280px] bg-surface border-r border-outline-variant shrink-0 shadow-[4px_0_24px_-12px_rgba(15,23,42,0.08)] z-40 relative">
        {/* Brand Header */}
        <div className="px-6 py-8 border-b border-outline-variant/40 flex items-center justify-between bg-surface z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold tracking-tight shadow-sm shadow-primary/20">
              E+
            </div>
            <span className="font-headline-md font-bold text-on-surface tracking-tight">Easy Aula+</span>
          </div>
          <button onClick={toggleDarkMode} className="text-on-surface-variant hover:text-primary transition-colors p-1" title="Alternar tema">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
        
        {/* User Card */}
        <div className="px-6 py-5 mx-4 mt-6 mb-2 rounded-2xl flex items-center gap-4 bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant transition-colors relative group">
          <div className="w-10 h-10 rounded-full bg-surface overflow-hidden border border-outline-variant/50 shadow-sm shrink-0">
             <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-md text-on-surface truncate pr-6">{userName}</p>
            <p className="font-label-sm text-on-surface-variant capitalize truncate">{userRole}</p>
          </div>
          <button onClick={signOut} className="absolute right-4 text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1" title="Sair">
             <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 mt-2 mb-1">
             <p className="font-label-sm text-on-surface-variant/60 uppercase tracking-widest">Menu Principal</p>
          </div>
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-all group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_theme(colors.primary)]" />
                )}
                <span className={cn(
                    "material-symbols-outlined transition-transform duration-200", 
                    isActive ? "fill scale-110" : "group-hover:scale-110"
                )}>
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background">
        {/* Mobile Header - Glassmorphic */}
        <header className="md:hidden glass-card py-3 px-4 flex justify-between items-center z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold tracking-tight">
              E+
            </div>
            <span className="font-headline-md font-bold text-on-surface tracking-tight">Easy Aula+</span>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={toggleDarkMode} className="text-on-surface-variant hover:text-primary p-2 transition-colors relative" title="Alternar tema">
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
             <button onClick={signOut} className="text-on-surface-variant hover:text-primary p-2 transition-colors relative" title="Sair">
              <span className="material-symbols-outlined">logout</span>
            </button>
             <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/30 shadow-sm shrink-0">
               <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto pb-[90px] md:pb-0">
          <div className="max-w-container-max mx-auto h-full p-4 md:p-8 pt-6 md:pt-10">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl glass-card flex justify-around items-center px-2 py-2 pb-safe border-t border-outline-variant/30">
          {filteredNavItems.slice(0, 5).map((item) => {
             const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
             return (
               <Link
                 key={item.path}
                 to={item.path}
                 className={cn(
                   "flex flex-col items-center justify-center py-2 px-3 transition-all relative group rounded-xl",
                   isActive 
                     ? "text-primary" 
                     : "text-on-surface-variant hover:text-on-surface"
                 )}
               >
                 <span className={cn(
                     "material-symbols-outlined transition-all", 
                     isActive ? "fill -translate-y-1" : ""
                 )}>
                   {isActive && item.activeIcon ? item.activeIcon : item.icon}
                 </span>
                 <span className={cn(
                     "font-label-sm absolute bottom-1 transition-all opacity-0",
                     isActive ? "opacity-100 translate-y-0" : "translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                 )}>
                     {item.label}
                 </span>
               </Link>
             );
           })}
        </nav>
      </div>
    </div>
  );
}
