import { Primitive, z } from "zod";

/**
 * Checks if the provided array of ZodLiteral schemas has at least two elements, which is required for constructing a union schema.
 *
 * @param literals - Array of ZodLiteral schemas to check.
 * @returns True if the array has at least two elements, otherwise false.
 */
function isValidZodLiteralUnion<T extends z.ZodLiteral<unknown>>(
  literals: T[],
): literals is [T, T, ...T[]] {
  return literals.length >= 2;
}

/**
 * Constructs a Zod union schema from an array of primitive values.
 * Each primitive value is converted into a Zod literal schema.
 * The function requires at least two primitive values to create a valid union.
 *
 * @template T - The type of the primitive values in the input array.
 * @param constArray - An array of primitive values to be included in the union. Must contain at least two elements.
 * @returns A Zod union schema composed of literal schemas derived from the input array.
 * @throws {Error} If the `constArray` has fewer than two elements, as a Zod union requires at least two types.
 */
export function constructZodLiteralUnionType<T extends Primitive>(
  constArray: readonly T[],
) {
  const literalsArray = constArray.map((literal) => z.literal(literal));
  if (!isValidZodLiteralUnion(literalsArray)) {
    throw new Error(
      "Literals passed do not meet the criteria for constructing a union schema, the minimum length is 2",
    );
  }
  return z.union(literalsArray);
}
