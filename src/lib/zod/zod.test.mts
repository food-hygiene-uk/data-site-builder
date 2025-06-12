import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { z } from "zod";
import { constructZodLiteralUnionType } from "./zod.mts";

// Helper function to generate random strings
const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let index = 0; index < length; index++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Helper function to generate random numbers
const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

describe("constructZodLiteralUnionType", () => {
  describe("Example-based tests", () => {
    it("should create a union of string literals", () => {
      const stringLiterals = ["a", "b", "c"] as const;
      const schema = constructZodLiteralUnionType(stringLiterals);
      assertEquals(schema.parse("a"), "a");
      assertEquals(schema.parse("b"), "b");
      assertEquals(schema.parse("c"), "c");
      assertThrows(() => schema.parse("d"));
    });

    it("should create a union of number literals", () => {
      const numberLiterals = [1, 2, 3] as const;
      const schema = constructZodLiteralUnionType(numberLiterals);
      assertEquals(schema.parse(1), 1);
      assertEquals(schema.parse(2), 2);
      assertEquals(schema.parse(3), 3);
      assertThrows(() => schema.parse(4));
    });

    it("should create a union of boolean literals", () => {
      const booleanLiterals = [true, false] as const;
      const schema = constructZodLiteralUnionType(booleanLiterals);
      assertEquals(schema.parse(true), true);
      assertEquals(schema.parse(false), false);
      assertThrows(() => schema.parse("true"));
    });

    it("should throw an error if less than two literals are provided", () => {
      assertThrows(
        () => constructZodLiteralUnionType(["a"] as const),
        Error,
        "Literals passed do not meet the criteria for constructing a union schema, the minimum length is 2",
      );
      assertThrows(
        () => constructZodLiteralUnionType([] as const),
        Error,
        "Literals passed do not meet the criteria for constructing a union schema, the minimum length is 2",
      );
    });

    it("should create a union of symbol literals", () => {
      const sym1 = Symbol("a");
      const sym2 = Symbol("b");
      const symbolLiterals = [sym1, sym2] as const;
      const schema = constructZodLiteralUnionType(symbolLiterals);
      assertEquals(schema.parse(sym1), sym1);
      assertEquals(schema.parse(sym2), sym2);
      assertThrows(() => schema.parse(Symbol("c")));
    });
  });

  describe("Property-based tests", () => {
    it("should correctly validate and invalidate random string arrays", () => {
      for (let index = 0; index < 10; index++) {
        // Run 10 iterations
        const arrayLength = generateRandomNumber(2, 5);
        const stringArray: string[] = [];
        for (let innerIndex = 0; innerIndex < arrayLength; innerIndex++) {
          stringArray.push(generateRandomString(5));
        }
        const schema = constructZodLiteralUnionType(
          stringArray as [string, string, ...string[]],
        );

        // Test valid inputs
        for (const validString of stringArray) {
          assertEquals(schema.parse(validString), validString);
        }

        // Test invalid input
        let invalidString: string;
        do {
          invalidString = generateRandomString(5);
        } while (stringArray.includes(invalidString)); // Ensure it's truly not in the array
        assertThrows(
          () => schema.parse(invalidString),
          z.ZodError, // Zod throws ZodError on parse failure
        );
      }
    });

    it("should correctly validate and invalidate random number arrays", () => {
      for (let index = 0; index < 10; index++) {
        // Run 10 iterations
        const arrayLength = generateRandomNumber(2, 5);
        const numberArray: number[] = [];
        for (let innerIndex = 0; innerIndex < arrayLength; innerIndex++) {
          numberArray.push(generateRandomNumber(1, 100));
        }
        // Ensure uniqueness for the test to be meaningful
        const uniqueNumberArray = [...new Set(numberArray)];
        if (uniqueNumberArray.length < 2) {
          // Skip if not enough unique numbers
          index--; // Redo this iteration
          continue;
        }

        const schema = constructZodLiteralUnionType(
          uniqueNumberArray as [number, number, ...number[]],
        );

        // Test valid inputs
        for (const validNumber of uniqueNumberArray) {
          assertEquals(schema.parse(validNumber), validNumber);
        }

        // Test invalid input
        let invalidNumber: number;
        do {
          invalidNumber = generateRandomNumber(101, 200); // Generate a number likely outside the array
        } while (uniqueNumberArray.includes(invalidNumber));
        assertThrows(() => schema.parse(invalidNumber), z.ZodError);
      }
    });

    it("should correctly validate boolean arrays (true, false)", () => {
      const booleanArray = [true, false] as const;
      const schema = constructZodLiteralUnionType(booleanArray);
      assertEquals(schema.parse(true), true);
      assertEquals(schema.parse(false), false);
      assertThrows(() => schema.parse("not a boolean"), z.ZodError);
    });
  });
});
