/**
 * CSV generation helpers.
 */
const escapeCSV = (val) => {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};
const toCSVRow = (arr) => arr.map(escapeCSV).join(',');
const toCSV = (headers, rows) => {
  const lines = [toCSVRow(headers)];
  rows.forEach(r => lines.push(toCSVRow(r)));
  return lines.join('\n');
};
module.exports = { escapeCSV, toCSVRow, toCSV };
