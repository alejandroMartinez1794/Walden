const DASHBOARD_ROUTES = {
  doctor: '/psychology/dashboard',
  paciente: '/users/profile/me',
  admin: '/home',
};

export const getDashboardPath = (role) => {
  const normalized = role?.toLowerCase?.() || '';
  return DASHBOARD_ROUTES[normalized] || '/home';
};
