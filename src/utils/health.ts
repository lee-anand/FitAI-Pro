export function calculateBMI(
  height: number,
  weight: number
): number {
  const h = height / 100;
  return Number((weight / (h * h)).toFixed(1));
}

export function calculateBMR(
  gender: string,
  height: number,
  weight: number,
  age: number
): number {

  if (gender === "Male") {
    return Math.round(
      10 * weight +
      6.25 * height -
      5 * age +
      5
    );
  }

  return Math.round(
    10 * weight +
    6.25 * height -
    5 * age -
    161
  );
}

export function calculateTDEE(
  bmr: number,
  activity: string
) {

  const map: Record<string, number> = {

    Sedentary: 1.2,

    Light: 1.375,

    Moderate: 1.55,

    Active: 1.725,

    Athlete: 1.9,

  };

  return Math.round(
    bmr * (map[activity] || 1.2)
  );
}