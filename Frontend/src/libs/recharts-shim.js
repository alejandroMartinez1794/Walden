// Lightweight shim that exposes `recharts` as ESM by proxying the global UMD
// This file assumes a UMD build of Recharts is loaded on `window.Recharts`.
const R = (typeof window !== 'undefined' && window.Recharts) ? window.Recharts : {};

export const LineChart = R.LineChart;
export const Line = R.Line;
export const AreaChart = R.AreaChart;
export const Area = R.Area;
export const XAxis = R.XAxis;
export const YAxis = R.YAxis;
export const CartesianGrid = R.CartesianGrid;
export const Tooltip = R.Tooltip;
export const Legend = R.Legend;
export const ResponsiveContainer = R.ResponsiveContainer;
export const ReferenceLine = R.ReferenceLine;
export const BarChart = R.BarChart;
export const Bar = R.Bar;
export const PieChart = R.PieChart;
export const Pie = R.Pie;
export const Cell = R.Cell;
export const RadarChart = R.RadarChart;
export const PolarGrid = R.PolarGrid;
export const PolarAngleAxis = R.PolarAngleAxis;
export const PolarRadiusAxis = R.PolarRadiusAxis;
export const Radar = R.Radar;

export default R;
