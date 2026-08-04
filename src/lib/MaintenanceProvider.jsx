import MaintenancePage from '@/components/MaintenancePage';

const isMaintenanceMode = () => {
  const value = String(import.meta.env.VITE_MAINTENANCE_MODE || '').trim().toLowerCase();
  return ['true', '1', 'yes'].includes(value);
};

const maintenanceEnabled = isMaintenanceMode();

const MaintenanceProvider = ({ children }) => {
  const path = window.location.pathname;
  const adminBypass = path.startsWith('/admin') || path.startsWith('/login');
  if (maintenanceEnabled && !adminBypass) return <MaintenancePage />;
  return children;
};

export default MaintenanceProvider;
