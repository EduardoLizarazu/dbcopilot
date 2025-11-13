export function convertFbDateToISO(fb_date?: {
  _seconds: number;
  _nanoseconds: number;
}): string | null {
  if (!fb_date) {
    return null;
  }

  try {
    const date = new Date(fb_date._seconds * 1000 + fb_date._nanoseconds / 1e6);
    return date.toISOString();
  } catch (error) {
    console.error("Error converting Firestore date to ISO string:", error);
    return null;
  }
}
