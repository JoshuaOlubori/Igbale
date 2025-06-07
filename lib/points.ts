// lib/points.ts

/**
 * Calculates points awarded for a trash collection based on its estimated weight.
 * The formula is non-linear to encourage collecting larger quantities.
 * Using a simple power function: points = C * weight^exponent
 * where C is a scaling factor and exponent > 1.
 *
 * @param weightInKg The estimated weight of trash in kilograms.
 * @returns The calculated points.
 */
export function calculatePoints(weightInKg: number): number {
  if (weightInKg <= 0) {
    return 0;
  }

  const scalingFactor = 10; // Base points per kg for small amounts
  const exponent = 1.2;     // Exponent > 1 for non-linear increase

  // Example: 1kg -> 10 points
  //          5kg -> 10 * 5^1.2 = 10 * 6.89 = 68.9 -> ~69 points
  //          10kg -> 10 * 10^1.2 = 10 * 15.85 = 158.5 -> ~159 points
  //          50kg -> 10 * 50^1.2 = 10 * 108.5 = 1085 points
  const points = scalingFactor * Math.pow(weightInKg, exponent);

  return Math.round(points); // Round to nearest whole number
}
