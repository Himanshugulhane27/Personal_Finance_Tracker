/**
 * Number formatting utilities.
 */
const compact = (n) => {
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return n.toString();
};
const percentage = (val, total) => total===0 ? 0 : Math.round((val/total)*100);
const currency = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
module.exports = { compact, percentage, currency };
