import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  BellAlertIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Logs', href: '/', icon: DocumentTextIcon },
  { name: 'Alerts', href: '/alerts', icon: BellAlertIcon },
  { name: 'Statistics', href: '/stats', icon: ChartBarIcon },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Monitoring Dashboard
          </h1>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow">
          <nav className="mt-5 px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 flex-shrink-0 ${
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 