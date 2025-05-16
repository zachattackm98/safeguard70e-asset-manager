
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type NavItemProps = {
  to: string;
  children: React.ReactNode;
  end?: boolean;
};

const NavItem: React.FC<NavItemProps> = ({ to, children, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
      }`
    }
  >
    {children}
  </NavLink>
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Modified to avoid automatic navigation
  const handleLogout = async () => {
    try {
      await logout();
      // Let the AuthProvider handle the navigation through its state changes
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Safeguard70E</h1>
        </div>

        <div className="flex flex-col gap-1 p-4">
          <NavItem to="/dashboard" end>Dashboard</NavItem>
          <NavItem to="/assets">Assets</NavItem>
          
          {user?.role === 'admin' && (
            <>
              <NavItem to="/users">Users</NavItem>
              <NavItem to="/reports">Reports</NavItem>
            </>
          )}
          
          <NavItem to="/profile">Profile</NavItem>
          
          <div className="mt-auto pt-4">
            <Button 
              variant="outline" 
              className="w-full text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="flex h-16 items-center border-b bg-background px-4">
          <button
            onClick={toggleSidebar}
            className="mr-4 rounded-md p-2 text-gray-600 focus:ring-2 focus:ring-primary lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm font-medium">
              {user?.name} ({user?.role})
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
