const root = typeof window !== 'undefined' ? window : {};
const plugin = root.FullCalendarDayGrid || root.FullCalendar?.dayGridPlugin || null;
export default plugin;
