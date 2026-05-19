// Shim for @fullcalendar/react when using the CDN UMD build.
const root = typeof window !== 'undefined' ? window : {};
const exported = root.FullCalendarReact || root.FullCalendar || {};
export default exported;
