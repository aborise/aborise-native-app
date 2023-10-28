import { parse } from "date-fns";
import { DateTime } from "luxon";

const translations = {
  loginFailed:
    "Wrong email or password. Please check your credentials and try again.",
  otpPrompt:
    "Your email address needs to be varified. You have received an email containing a 6-digit code which expires in 15 minutes. Please enter it.",
  otpFailed: "You've entered the wrong passcode. Please tray again!",
  twofaPrompt: "This is a test",
  twofaFailed: "You waited too long. Please try again.",
  connectSuccess: "Congratulations! Your membership is now connected.",
  connectFailed: "Something went wrong. Please try again.",
  cancelSuccess: "Your membership has been canceled",
  cancelFailed: "Your membership is already canceled",
  resumeSuccess: "Your membership has been resumed",
  resumeFailedActive: "Your membership is already active.",
  resumeFailedInactive:
    "Your membership is inactive. Currently we don't support resuming inactive memberships.",
  registerSuccess: "Account created successfully.",
  registerFailed:
    "An account related to this email already exists. Try to connect your existing account or enter a new email address.",
};

export const t = (key: string) => {
  return translations[key as keyof typeof translations];
};

const dateFormats = [
  /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/,
  /\b(\d{1,2})\s*([a-zA-Z]+)\s*(\d{4})\b/,
  /\b([a-zA-Z]+)\s*(\d{1,2}),\s*(\d{4})\b/,
];

// export const extractDate = (message: string | undefined) => {
//   if (!message) return null;
//   for (const format of dateFormats) {
//     const match = message.match(format);
//     if (match) {
//       const [, ...groups] = match;

//       if (groups[groups.length - 1].length === 2) {
//         groups[groups.length - 1] = "20" + groups[groups.length - 1];
//       }
//       console.log(groups.reverse().join(" "));
//       return new Date(groups.reverse().join(" ")).toISOString();
//     }
//   }
//   return null;
// };
// export const extractDate = (message: string | undefined) => {
//   if (!message) return null;
//   for (const format of dateFormats) {
//     const match = message.match(format);
//     if (match) {
//       const [, ...groups] = match;

//       if (groups[groups.length - 1].length === 2) {
//         groups[groups.length - 1] = "20" + groups[groups.length - 1];
//       }

//       const reversed = groups.reverse();
//       const dateStr = reversed.join(" ");
//       console.log("Before", new Date());
//       const ret = parse(dateStr, "yyyy MM dd", new Date()).toISOString();
//       console.log("After");
//       return ret;
//     }
//   }
//   return null;
// };

export const extractDate = (message: string | undefined) => {
  if (!message) return null;
  for (const format of dateFormats) {
    const match = message.match(format);
    if (match) {
      const [, ...groups] = match;

      if (groups[groups.length - 1].length === 2) {
        groups[groups.length - 1] = "20" + groups[groups.length - 1];
      }

      const dateStr = groups.reverse().join("-");
      const dt = DateTime.fromISO(dateStr);
      if (dt.isValid) return dt.toISO();
    }
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
      amount = amount.replace(",", ".");
      // split integer and decimal parts
      const [integer, decimal] = amount.split(".");
      return {
        integer: parseInt(integer),
        decimal: parseInt(decimal),
        unit: unit ?? null,
      };
    }
  }

  return null;
};
