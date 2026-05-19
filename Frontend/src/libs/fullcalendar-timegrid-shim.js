const root = typeof window !== 'undefined' ? window : {};
const plugin = root.FullCalendarTimeGrid || root.FullCalendar?.timeGridPlugin || null;
export default plugin;
