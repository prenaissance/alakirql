export const getZodiacSign = (date: Date) => {
  const month: number = date.getMonth() + 1; // Get month as a number (January is 0)
  const day: number = date.getDate();

  // Determine zodiac sign based on month and day
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return "Aries";
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return "Taurus";
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return "Gemini";
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return "Cancer";
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return "Leo";
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return "Virgo";
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return "Libra";
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return "Scorpio";
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return "Sagittarius";
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return "Capricorn";
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return "Aquarius";
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return "Pisces";
  } else {
    return "Invalid date";
  }
};

const zodiacSignEmojis = {
  Aries: "♈️",
  Taurus: "♉️",
  Gemini: "♊️",
  Cancer: "♋️",
  Leo: "♌️",
  Virgo: "♍️",
  Libra: "♎️",
  Scorpio: "♏️",
  Sagittarius: "♐️",
  Capricorn: "♑️",
  Aquarius: "♒️",
  Pisces: "♓️",
} as const;

type ZodiacSign = keyof typeof zodiacSignEmojis;

export const getZodiacEmoji = (zodiacSign: string) => {
  return zodiacSignEmojis[zodiacSign as ZodiacSign];
};

export const getMoonPhase = (date: Date) => {
  // Convert date to Julian date
  const julianDate: number =
    date.getTime() / 86400000 - date.getTimezoneOffset() / 1440 + 2440587.5;

  // Calculate the number of days since the last known new moon (January 6, 2000 at 18:14:20 UT)
  const daysSinceNewMoon: number = julianDate - 2451549.09236111;

  // Calculate the moon phase as a percentage of the lunar cycle (where 0% = new moon and 100% = full moon)
  const moonPhase: number =
    ((daysSinceNewMoon % 29.530588853) / 29.530588853) * 100;

  // Determine the moon phase based on the percentage
  if (moonPhase < 1.5625 || moonPhase >= 98.4375) {
    return "New Moon";
  } else if (moonPhase < 5.46875) {
    return "Waxing Crescent";
  } else if (moonPhase < 9.375) {
    return "First Quarter";
  } else if (moonPhase < 12.5) {
    return "Waxing Gibbous";
  } else if (moonPhase < 89.0625) {
    return "Full Moon";
  } else if (moonPhase < 93.75) {
    return "Waning Gibbous";
  } else if (moonPhase < 97.65625) {
    return "Third Quarter";
  } else {
    return "Waning Crescent";
  }
};

const compatibilityTable = {
  Aries: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
  Taurus: ["Virgo", "Capricorn", "Pisces", "Cancer"],
  Gemini: ["Libra", "Aquarius", "Aries", "Leo"],
  Cancer: ["Scorpio", "Pisces", "Taurus", "Virgo"],
  Leo: ["Sagittarius", "Aries", "Gemini", "Libra"],
  Virgo: ["Capricorn", "Taurus", "Cancer", "Scorpio"],
  Libra: ["Aquarius", "Gemini", "Leo", "Sagittarius"],
  Scorpio: ["Pisces", "Cancer", "Virgo", "Capricorn"],
  Sagittarius: ["Aries", "Leo", "Libra", "Aquarius"],
  Capricorn: ["Taurus", "Virgo", "Scorpio", "Pisces"],
  Aquarius: ["Gemini", "Libra", "Sagittarius", "Aries"],
  Pisces: ["Cancer", "Scorpio", "Capricorn", "Taurus"],
};

export const areZodiacSignsCompatible = (sign1: string, sign2: string) =>
  compatibilityTable[sign1 as ZodiacSign].includes(sign2) ||
  compatibilityTable[sign2 as ZodiacSign].includes(sign1);
