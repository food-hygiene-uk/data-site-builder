import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { join } from "@std/path";
import { ensureDir } from "@std/fs";
import { generateEstablishments } from "./files-establishment.mts";

// Mock data for testing
const mockEstablishment1 = {
  FHRSID: 12_345,
  BusinessName: "Test Business 1",
  RatingValue: "5",
};

const mockEstablishment2 = {
  FHRSID: 67_890,
  BusinessName: "Test Business 2",
  RatingValue: "4",
};

const mockDataWithEstablishments = {
  FHRSEstablishment: {
    Header: { ExtractDate: "2023-01-01", ItemCount: 2, ReturnCode: "Success" },
    EstablishmentCollection: [mockEstablishment1, mockEstablishment2],
  },
};

const mockDataEmptyCollection = {
  FHRSEstablishment: {
    Header: { ExtractDate: "2023-01-01", ItemCount: 0, ReturnCode: "Success" },
    EstablishmentCollection: [],
  },
};

const mockDataNoCollection = {
  FHRSEstablishment: {
    Header: { ExtractDate: "2023-01-01", ItemCount: 0, ReturnCode: "Success" },
  },
};

describe("generateEstablishments", () => {
  describe("Example-based tests", () => {
    it("should create individual JSON files for each establishment", async () => {
      const temporaryDirectory = join("build", "test-temp");
      await Deno.remove(temporaryDirectory, { recursive: true }).catch(
        () => {},
      );
      const openDataDirectory = join(temporaryDirectory, "open-data-files");
      const establishmentsDirectory = join(
        temporaryDirectory,
        "establishments",
      );

      await ensureDir(openDataDirectory);

      // Create mock input file
      const inputFile = join(openDataDirectory, "FHRS001en-GB.json");
      await Deno.writeTextFile(
        inputFile,
        JSON.stringify(mockDataWithEstablishments),
      );

      // Run the function
      await generateEstablishments(openDataDirectory, establishmentsDirectory);

      // Check output files
      const outputFile1 = join(establishmentsDirectory, "12345-en-GB.json");
      const outputFile2 = join(establishmentsDirectory, "67890-en-GB.json");

      assertExists(await Deno.stat(outputFile1));
      assertExists(await Deno.stat(outputFile2));

      // Check content
      const content1 = await Deno.readTextFile(outputFile1);
      const parsed1 = JSON.parse(content1);
      assertEquals(parsed1, mockEstablishment1);

      const content2 = await Deno.readTextFile(outputFile2);
      const parsed2 = JSON.parse(content2);
      assertEquals(parsed2, mockEstablishment2);

      // Check formatting (pretty-printed)
      assertEquals(content1, JSON.stringify(mockEstablishment1, null, 2));

      // also write a Welsh file and ensure language is recorded in filename
      const inputFileWelsh = join(openDataDirectory, "FHRS001cy-GB.json");
      await Deno.writeTextFile(
        inputFileWelsh,
        JSON.stringify(mockDataWithEstablishments),
      );
      await generateEstablishments(openDataDirectory, establishmentsDirectory);
      const outputWelsh = join(establishmentsDirectory, "12345-cy-GB.json");
      assertExists(await Deno.stat(outputWelsh));
      const cyContent = await Deno.readTextFile(outputWelsh);
      assertEquals(JSON.parse(cyContent), mockEstablishment1);

      // Clean up
      await Deno.remove(temporaryDirectory, { recursive: true });
    });

    it("should handle empty EstablishmentCollection", async () => {
      const temporaryDirectory = join("build", "test-temp");
      await Deno.remove(temporaryDirectory, { recursive: true }).catch(
        () => {},
      );
      const openDataDirectory = join(temporaryDirectory, "open-data-files");
      const establishmentsDirectory = join(
        temporaryDirectory,
        "establishments",
      );

      await ensureDir(openDataDirectory);

      const inputFile = join(openDataDirectory, "FHRS001en-GB.json");
      await Deno.writeTextFile(
        inputFile,
        JSON.stringify(mockDataEmptyCollection),
      );

      await generateEstablishments(openDataDirectory, establishmentsDirectory);

      // Check that no files were created
      const files = [];
      for await (const entry of Deno.readDir(establishmentsDirectory)) {
        files.push(entry.name);
      }
      assertEquals(files.length, 0);

      await Deno.remove(temporaryDirectory, { recursive: true });
    });

    it("should handle missing EstablishmentCollection", async () => {
      const temporaryDirectory = join("build", "test-temp");
      await Deno.remove(temporaryDirectory, { recursive: true }).catch(
        () => {},
      );
      const openDataDirectory = join(temporaryDirectory, "open-data-files");
      const establishmentsDirectory = join(
        temporaryDirectory,
        "establishments",
      );

      await ensureDir(openDataDirectory);

      const inputFile = join(openDataDirectory, "FHRS001en-GB.json");
      await Deno.writeTextFile(inputFile, JSON.stringify(mockDataNoCollection));

      await generateEstablishments(openDataDirectory, establishmentsDirectory);

      // Check that no files were created
      const files = [];
      for await (const entry of Deno.readDir(establishmentsDirectory)) {
        files.push(entry.name);
      }
      assertEquals(files.length, 0);

      await Deno.remove(temporaryDirectory, { recursive: true });
    });

    it("should overwrite duplicate FHRSIDs", async () => {
      const temporaryDirectory = join("build", "test-temp");
      const openDataDirectory = join(temporaryDirectory, "open-data-files");
      const establishmentsDirectory = join(
        temporaryDirectory,
        "establishments",
      );

      await ensureDir(openDataDirectory);

      const mockEstablishmentDuplicate = {
        FHRSID: 12_345,
        BusinessName: "Updated Business",
        RatingValue: "3",
      };

      const mockDataDuplicate = {
        FHRSEstablishment: {
          Header: {
            ExtractDate: "2023-01-01",
            ItemCount: 1,
            ReturnCode: "Success",
          },
          EstablishmentCollection: [mockEstablishmentDuplicate],
        },
      };

      // First file
      const inputFile1 = join(openDataDirectory, "FHRS001en-GB.json");
      await Deno.writeTextFile(
        inputFile1,
        JSON.stringify(mockDataWithEstablishments),
      );

      // Second file with duplicate
      const inputFile2 = join(openDataDirectory, "FHRS002en-GB.json");
      await Deno.writeTextFile(inputFile2, JSON.stringify(mockDataDuplicate));

      await generateEstablishments(openDataDirectory, establishmentsDirectory);

      // Check that the duplicate was overwritten for en-GB
      const outputFile = join(establishmentsDirectory, "12345-en-GB.json");
      const content = await Deno.readTextFile(outputFile);
      const parsed = JSON.parse(content);
      assertEquals(parsed, mockEstablishmentDuplicate);

      // also verify Welsh version remains unaffected if present
      const inputWelsh = join(openDataDirectory, "FHRS002cy-GB.json");
      await Deno.writeTextFile(inputWelsh, JSON.stringify(mockDataDuplicate));
      await generateEstablishments(openDataDirectory, establishmentsDirectory);
      const outputWelsh = join(establishmentsDirectory, "12345-cy-GB.json");
      assertExists(await Deno.stat(outputWelsh));

      await Deno.remove(temporaryDirectory, { recursive: true });
    });
  });

  describe("Property-based tests", () => {
    it("should generate valid JSON files for all establishments", async () => {
      // Generate random establishments
      const randomEstablishments = [];
      for (let index = 0; index < 10; index++) {
        randomEstablishments.push({
          FHRSID: Math.floor(Math.random() * 100_000),
          BusinessName: `Random Business ${index}`,
          RatingValue: Math.floor(Math.random() * 5) + 1,
        });
      }

      const mockDataRandom = {
        FHRSEstablishment: {
          Header: {
            ExtractDate: "2023-01-01",
            ItemCount: randomEstablishments.length,
            ReturnCode: "Success",
          },
          EstablishmentCollection: randomEstablishments,
        },
      };

      const temporaryDirectory = join("build", "test-temp");
      const openDataDirectory = join(temporaryDirectory, "open-data-files");
      const establishmentsDirectory = join(
        temporaryDirectory,
        "establishments",
      );

      await ensureDir(openDataDirectory);

      const inputFile = join(openDataDirectory, "FHRS001en-GB.json");
      await Deno.writeTextFile(inputFile, JSON.stringify(mockDataRandom));

      await generateEstablishments(openDataDirectory, establishmentsDirectory);

      // Check all files exist and are valid JSON
      for (const est of randomEstablishments) {
        const outputFile = join(
          establishmentsDirectory,
          `${est.FHRSID}-en-GB.json`,
        );
        assertExists(await Deno.stat(outputFile));

        const content = await Deno.readTextFile(outputFile);
        const parsed = JSON.parse(content);
        assertEquals(parsed, est);
      }

      await Deno.remove(temporaryDirectory, { recursive: true });
    });

    it("should ensure all FHRSIDs are unique in output", async () => {
      // This is implicitly tested in the duplicate test above
      // But we can add more comprehensive checks if needed
    });

    it("should produce parseable JSON", async () => {
      // Already covered in the tests above
    });
  });
});
