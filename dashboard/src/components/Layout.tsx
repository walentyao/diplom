import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  BellAlertIcon, 
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Statistics', href: '/', icon: ChartBarIcon },
  { name: 'Logs', href: '/logs', icon: DocumentTextIcon },
  { name: 'Alerts', href: '/alerts', icon: BellAlertIcon },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* Mobile sidebar */}
      <div className={`${styles.mobileSidebar} ${sidebarOpen ? styles.block : styles.hidden}`} role="dialog" aria-modal="true">
        <div className={styles.overlay} aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        <div className={styles.sidebarContent}>
          <div className={styles.closeButtonContainer}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className={styles.closeIcon} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.sidebarNavContainer}>
            <div className={styles.sidebarHeader}>
              <h1 className={styles.sidebarTitle}>Monitoring Dashboard</h1>
            </div>
            <nav className={styles.navList}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${styles.navItem} ${isActive ? styles.activeNavItem : styles.inactiveNavItem}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${styles.navIcon} ${isActive ? styles.activeNavIcon : styles.inactiveNavIcon}`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className={styles.desktopSidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarNavContainer}>
            <div className={styles.sidebarHeader}>
              <h1 className={styles.sidebarTitle}>Monitoring Dashboard</h1>
            </div>
            <nav className={styles.navList}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${styles.navItem} ${isActive ? styles.activeNavItem : styles.inactiveNavItem}`}
                  >
                    <item.icon
                      className={`${styles.navIcon} ${isActive ? styles.activeNavIcon : styles.inactiveNavIcon}`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Top nav */}
        <div className={styles.topNav}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className={styles.menuIcon} aria-hidden="true" />
          </button>
        </div>

        {/* Main content */}
        <main className={styles.mainSection}>
          {/* Header */}
          <div className={styles.headerSection}>
            <div className={styles.headerContent}>
              <div className={styles.headerTitleContainer}>
                <h2 className={styles.headerTitle}>
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h2>
              </div>
            </div>
          </div>

          <div className={styles.contentContainer}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}