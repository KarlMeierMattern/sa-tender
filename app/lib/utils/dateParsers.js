// Parse DD/MM/YYYY format (used for advertised and awarded dates)
export function parseAdvertisedDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return null;

  const date = new Date(year, month - 1, day);
  return !isNaN(date.getTime()) ? date : null;
}

// Parse long format with day name (used for datePublished)
export function parseDatePublished(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;

  const [, day, monthStr, year] = match;
  const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const month = monthMap[monthStr];
  if (month === undefined) return null;

  const date = new Date(year, month, day);
  return !isNaN(date.getTime()) ? date : null;
}

// Parse long format with day name and time (used for closingDate)
export function parseClosingDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  // Extract the date part before the time
  const datePart = dateStr.split(" - ")[0];
  if (!datePart) return null;

  const match = datePart.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;

  const [, day, monthStr, year] = match;
  const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const month = monthMap[monthStr];
  if (month === undefined) return null;

  const date = new Date(year, month, day);
  return !isNaN(date.getTime()) ? date : null;
}
