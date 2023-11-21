const dateFormats = [
  /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/,
  /\b(\d{1,2})\s*([a-zA-Z]+)\s*(\d{4})\b/,
  /\b([a-zA-Z]+)\s*(\d{1,2}),\s*(\d{4})\b/,
];

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];

// in german
const monthsGerman = ['jan', 'feb', 'mär', 'apr', 'mai', 'jun', 'jul', 'aug', 'sept', 'okt', 'nov', 'dez'];

export const extractDate = (message: string | undefined, extraDays = 0) => {
  if (!message) return null;
  for (const format of dateFormats) {
    const match = message.match(format);
    if (!match) continue;

    let days = match[1];
    let month = match[2];
    const years = match[3];

    if (format === dateFormats[2]) {
      days = match[2];
      month = match[1];
    }

    let monthsIndex = months.indexOf(month.toLowerCase().slice(0, 3));
    if (!monthsIndex) {
      monthsIndex = monthsGerman.indexOf(month.toLowerCase().slice(0, 3));
    }

    const date = new Date();
    date.setFullYear(parseInt(years), monthsIndex, parseInt(days) + extraDays);

    return date.toISOString();
  }
  return null;
};

const billingFormats = [/(\d+([,.]\d{1,2})?)(\/(month|year))?/];
export const extractAmount = (message: string | undefined) => {
  if (!message) return null;
  for (const format of billingFormats) {
    const match = message.match(format);
    if (match) {
      let [amount, unit] = [match[1], match[3]];
      // Replace any comma with a period for proper number conversion
      amount = amount.replace(',', '.');
      // split integer and decimal parts
      const [integer, decimal] = amount.split('.');

      const cents = parseInt(integer) * 100 + (decimal ? parseInt(decimal) : 0);

      return cents;
    }
  }

  return null;
};

export const timeZoneToUtc = (dateString: string, timeZone: string) => {
  const timeZoneTime = new Date(dateString + 'Z').toLocaleTimeString('de-DE', {
    timeZone,
  });
  const utcTime = new Date(dateString + 'Z').toLocaleTimeString('de-DE', {
    timeZone: 'UTC',
  });

  const hoursDiff = parseInt(utcTime.split(':')[0]) - parseInt(timeZoneTime.split(':')[0]);
  const padded = ((hoursDiff + 24) % 24).toString().padStart(2, '0');

  let minusDays = 0;
  if (hoursDiff < 0) {
    minusDays = 1;
  }

  const isoDate =
    new Date(new Date(dateString).toISOString().replace('Z', `-${padded}:00`)).getTime() -
    minusDays * 24 * 60 * 60 * 1000;

  return new Date(isoDate);
};

export const capitalize = (s: string | undefined | null) => {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
};
