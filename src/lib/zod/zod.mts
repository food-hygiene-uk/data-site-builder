import { z } from "zod";

/**
 * Literal primitive types supported by z.literal in Zod 4.
 * Note: Symbols are not supported in Zod 4 literals.
 */
type LiteralPrimitive = string | number | boolean | bigint | null | undefined;

/**
 * Checks if the given array of Zod literals meets the criteria for a valid union type.
 *
 * @param literals - An array of Zod literal schemas.
 * @returns True if the array has at least two literals.
 */
function isValidZodLiteralUnion<
  T extends z.ZodLiteral<string | number | boolean | bigint | null | undefined>,
>(literals: T[]): literals is [T, T, ...T[]] {
  return literals.length >= 2;
}

/**
 * Constructs a Zod union schema from an array of literal primitives.
 *
 * @param constArray - A readonly array of literal primitives to create the union schema.
 * @returns A Zod union schema representing the provided literals.
 * @throws {Error} If the array has fewer than two literals.
 */
export function constructZodLiteralUnionType<T extends LiteralPrimitive>(
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
