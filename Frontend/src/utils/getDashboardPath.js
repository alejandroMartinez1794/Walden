const DASHBOARD_ROUTES = {
  doctor: '/doctors/profile/me',
  paciente: '/users/profile/me',
  admin: '/doctors/profile/me', // Admin tiene acceso completo como doctor
};

export const getDashboardPath = (role) => {
  const normalized = role?.toLowerCase?.() || '';
  return DASHBOARD_ROUTES[normalized] || '/home';
};
