
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  History, 
  Settings, 
  Menu, 
  X, 
  RefreshCw,
  User
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import Button from "@/components/ui/Button";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userPreferences, resetOnboarding } = useAppStore();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/history", label: "History", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const handleResetPreferences = () => {
    if (window.confirm('This will reset all your preferences. Are you sure?')) {
      resetOnboarding();
      router.push('/settings');
      setIsOpen(false);
    }
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-[var(--surface-container)] border border-[var(--surface-variant)] text-[var(--text-primary)] rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[var(--surface-container)] border-r border-[var(--surface-variant)] transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-64 z-10 shadow-lg`}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--surface-variant)]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img 
                src="/logo-32x32.png" 
                alt="What's In It Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              What's In It?
            </h1>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-[var(--surface-variant)] bg-[var(--surface)]">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Your Preferences</span>
          </div>
          <div className="text-xs text-[var(--text-secondary)] space-y-1">
            <div>Diet: {userPreferences.dietType.join(', ') || 'Standard'}</div>
            {userPreferences.allergies.length > 0 && (
              <div>Allergies: {userPreferences.allergies.slice(0, 2).join(', ')}{userPreferences.allergies.length > 2 && '...'}</div>
            )}
            <div className="flex items-center space-x-2 mt-2">
              {userPreferences.sugarConcern && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Sugar</span>}
              {userPreferences.saltConcern && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Salt</span>}
              {userPreferences.fatConcern && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Fat</span>}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2">
          <ul>
            {navItems.map((item) => (
              <li key={item.label} className="mb-1">
                <Link 
                  href={item.href} 
                  onClick={handleItemClick}
                  className={`flex items-center p-4 mx-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--text-primary)] hover:bg-[var(--surface-variant)]'
                  }`}
                >
                  <item.icon size={18} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Reset Onboarding Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetPreferences}
            className="w-full flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Preferences</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
