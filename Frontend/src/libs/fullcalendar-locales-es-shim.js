const root = typeof window !== 'undefined' ? window : {};
const locales = root.FullCalendarLocales || root.FullCalendar?.locales || {};
const es = (locales && locales.es) || root.FullCalendarLocaleES || null;
export default es;
