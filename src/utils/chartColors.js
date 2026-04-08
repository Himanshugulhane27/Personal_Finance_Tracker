/**
 * Predefined color palette for charts.
 * Ensures consistent, accessible colors across all visualizations.
 */
const CHART_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#a855f7', // Purple
];

const getChartColor = (index) => CHART_COLORS[index % CHART_COLORS.length];

module.exports = { CHART_COLORS, getChartColor };
