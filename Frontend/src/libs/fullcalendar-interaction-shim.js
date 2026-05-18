const root = typeof window !== 'undefined' ? window : {};
const plugin = root.FullCalendarInteraction || root.FullCalendar?.interactionPlugin || null;
export default plugin;
