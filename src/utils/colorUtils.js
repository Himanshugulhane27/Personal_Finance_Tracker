/**
 * Color utilities for category/chart rendering.
 */
const randomColor = () => '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
const hexToRgba = (hex, alpha=1) => {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
};
module.exports = { randomColor, hexToRgba };
