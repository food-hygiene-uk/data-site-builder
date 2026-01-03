import { z } from "zod";
import scoreDescriptors from "./score-descriptors.json" with { type: "json" };
import { constructZodLiteralUnionType } from "../lib/zod/zod.mts";

const apiRegions = [
  "East Counties",
  "East Midlands",
  "London",
  "North East",
  "North West",
  "South East",
  "South West",
  "West Midlands",
  "Yorkshire and Humberside",
  "Northern Ireland",
  "Scotland",
  "Wales",
] as const;

const metaSchema = z.strictObject({
  dataSource: z.string(),
  extractDate: z.string(),
  itemCount: z.number(),
  returncode: z.string().nullable(),
  totalCount: z.number(),
  totalPages: z.number(),
  pageSize: z.number(),
  pageNumber: z.number(),
});

const linksSchema = z.array(
  z.strictObject({
    rel: z.string(),
    href: z.string(),
  }),
);

export const authoritiesResponseSchema = z.strictObject({
  authorities: z.array(
    z.strictObject({
      LocalAuthorityId: z.number(),
      LocalAuthorityIdCode: z.string(),
      Name: z.string(),
      FriendlyName: z.string(),
      Url: z.string(),
      SchemeUrl: z.string(),
      Email: z.string(),
      RegionName: z.enum(apiRegions),
      FileName: z.string(),
      FileNameWelsh: z.string().nullable(),
      EstablishmentCount: z.number(),
      CreationDate: z.string().datetime({ local: true }),
      LastPublishedDate: z.string().datetime({ local: true }),
      SchemeType: z.number(),
      links: linksSchema,
    }),
  ),
  meta: metaSchema,
  links: linksSchema,
});

export const businessTypesResponseSchema = z.strictObject({
  businessTypes: z.array(
    z.strictObject({
      BusinessTypeId: z.number(),
      BusinessTypeName: z.string(),
      links: linksSchema,
    }),
  ),
  meta: metaSchema,
  links: linksSchema,
});

export const countriesResponseSchema = z.strictObject({
  countries: z.array(
    z.strictObject({
      id: z.number(),
      name: z.string(),
      nameKey: z.string(),
      code: z.string(),
      links: linksSchema,
    }),
  ),
  meta: metaSchema,
  links: linksSchema,
});

export const ratingsResponseSchema = z.strictObject({
  ratings: z.array(
    z.strictObject({
      ratingId: z.number(),
      ratingName: z.string(),
      ratingKey: z.string(),
      ratingKeyName: z.string(),
      schemeTypeId: z.number(),
      links: linksSchema,
    }),
  ),
  meta: metaSchema,
  links: linksSchema,
});

export const regionsResponseSchema = z.strictObject({
  regions: z.array(
    z.strictObject({
      id: z.number(),
      name: z.string(),
      nameKey: z.string(),
      code: z.string(),
      links: linksSchema,
    }),
  ),
  meta: metaSchema,
  links: linksSchema,
});

export const schemeTypesResponseSchema = z.strictObject({
  schemeTypes: z.array(
    z.strictObject({
      schemeTypeid: z.number(),
      schemeTypeName: z.string(),
      schemeTypeKey: z.string(),
      links: linksSchema.optional(),
    }),
  ),
  meta: metaSchema,
  links: linksSchema.optional(),
});

export const scoreDescriptorsResponseSchema = z.strictObject({
  scoreDescriptors: z.array(
    z.strictObject({
      Id: z.number(),
      ScoreCategory: z.string(),
      Score: z.number(),
      Description: z.string(),
      links: linksSchema,
    }),
  ),
  meta: metaSchema,
  links: linksSchema,
});

// Extract valid scores
const validHygieneScores = Object.freeze(
  Object.freeze(Object.keys(scoreDescriptors.scoreDescriptors.Hygiene)).map(
    Number,
  ),
);
const validStructuralScores = Object.freeze(
  Object.keys(scoreDescriptors.scoreDescriptors.Structural),
).map(Number);
const validConfidenceScores = Object.freeze(
  Object.keys(scoreDescriptors.scoreDescriptors.Confidence),
).map(Number);

export const ratingValue = {
  FHRS: {
    "5": {
      text: "Very Good",
      image_cy: "/images/fhrs/fhrs_5_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_5_en-gb.svg",
      ratingKey_en: "fhrs_5_en-GB",
      ratingKey_cy: "fhrs_5_cy-gb",
    },
    "4": {
      text: "Good",
      image_cy: "/images/fhrs/fhrs_4_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_4_en-gb.svg",
      ratingKey_en: "fhrs_4_en-GB",
      ratingKey_cy: "fhrs_4_cy-gb",
    },
    "3": {
      text: "Generally Satisfactory",
      image_cy: "/images/fhrs/fhrs_3_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_3_en-gb.svg",
      ratingKey_en: "fhrs_3_en-GB",
      ratingKey_cy: "fhrs_3_cy-gb",
    },
    "2": {
      text: "Improvement Necessary",
      image_cy: "/images/fhrs/fhrs_2_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_2_en-gb.svg",
      ratingKey_en: "fhrs_2_en-GB",
      ratingKey_cy: "fhrs_2_cy-gb",
    },
    "1": {
      text: "Major Improvement Necessary",
      image_cy: "/images/fhrs/fhrs_1_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_1_en-gb.svg",
      ratingKey_en: "fhrs_1_en-GB",
      ratingKey_cy: "fhrs_1_cy-gb",
    },
    "0": {
      text: "Urgent Improvement Necessary",
      image_cy: "/images/fhrs/fhrs_0_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_0_en-gb.svg",
      ratingKey_en: "fhrs_0_en-GB",
      ratingKey_cy: "fhrs_0_cy-gb",
    },
    AwaitingInspection: {
      text: "Awaiting Inspection",
      image_cy: "/images/fhrs/fhrs_awaitinginspection_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_awaitinginspection_en-gb.svg",
      ratingKey_en: "fhrs_awaitinginspection_en-GB",
      ratingKey_cy: "fhrs_ratingawaited_cy-gb",
    },
    AwaitingPublication: {
      text: "Awaiting Publication",
      image_cy: "/images/fhrs/fhrs_awaitingpublication_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_awaitingpublication_en-gb.svg",
      ratingKey_en: "fhrs_awaitingpublication_en-GB",
      ratingKey_cy: "fhrs_awaitingpublication_cy-gb",
    },
    Exempt: {
      text: "Exempt",
      image_cy: "/images/fhrs/fhrs_exempt_cy-gb.svg",
      image_en: "/images/fhrs/fhrs_exempt_en-gb.svg",
      ratingKey_en: "fhrs_exempt_en-GB",
      ratingKey_cy: "fhrs_exempt_cy-gb",
    },
  },
  FHIS: {
    "Awaiting Inspection": {
      text: "Awaiting Inspection",
      image_en: "/images/fhis/fhis_awaiting_inspection.jpg",
      ratingKey: "fhis_awaiting_inspection_en-GB",
    },
    "Awaiting Publication": {
      text: "Awaiting Publication",
      image_en: "/images/fhis/fhis_awaiting_publication.jpg",
      ratingKey: "fhis_awaiting_publication_en-GB",
    },
    Exempt: {
      text: "Exempt",
      image_en: "/images/fhis/fhis_exempt.jpg",
      ratingKey: "fhis_exempt_en-GB",
    },
    "Improvement Required": {
      text: "Improvement Required",
      image_en: "/images/fhis/fhis_improvement_required.jpg",
      ratingKey: "fhis_improvement_required_en-GB",
    },
    Pass: {
      text: "Pass",
      image_en: "/images/fhis/fhis_pass.jpg",
      ratingKey: "fhis_pass_en-GB",
    },
    "Pass and Eat Safe": {
      text: "Pass and Eat Safe",
      image_en: "/images/fhis/fhis_pass_and_eat_safe.jpg",
      ratingKey: "fhis_pass_and_eat_safe_en-GB",
    },
  },
};

export const schemeNoRatingScoreFHRS: (keyof typeof ratingValue.FHRS)[] = [
  "AwaitingInspection",
  "AwaitingPublication",
  "Exempt",
];

// Shared address fields used across establishment address variants
const addressFields = z.strictObject({
  // FHRSID 1714030 is missing AddressLine1, but has AddressLine2. So AddressLine1 needs to be optional. (last checked 2024-11-23)
  AddressLine1: z.string().optional(),
  // FHRSID 1385728 is missing the real first line of the address, so the second line is in AddressLine1.
  // So AddressLine2, AddressLine3, and AddressLine4 need to be optional. (last checked 2024-11-20)
  AddressLine2: z.string().optional(),
  AddressLine3: z.string().optional(),
  AddressLine4: z.string().optional(),
  // FHRSID 1496369 is a mobile caterer, it has an address, but no postcode.
  // So PostCode needs to be optional. (last checked 2024-11-20)
  PostCode: z.string().optional(),
});

// addressFields is used internally to compose strict address variants; no exported type needed.

const fhrsValidRatingKeys = (key: keyof typeof ratingValue.FHRS) => {
  return z
    .literal(ratingValue.FHRS[key].ratingKey_en)
    .or(z.literal(ratingValue.FHRS[key].ratingKey_cy));
};

// Build strict rating variants for FHRS
const ratingValueFHRSObjects = [
  z.strictObject({
    SchemeType: z.literal("FHRS"),
    RatingValue: z.literal("never"),
    RatingKey: z.string(),
    RatingDate: z.literal("never"),
    Scores: z.literal(null),
  }),
  ...schemeNoRatingScoreFHRS.map((key) =>
    z.strictObject({
      SchemeType: z.literal("FHRS"),
      RatingValue: z.literal(key),
      RatingKey: fhrsValidRatingKeys(key),
      RatingDate: z.literal(null),
      Scores: z.literal(null),
    })
  ),
  ...Object.keys(ratingValue.FHRS)
    .filter(
      (key) =>
        schemeNoRatingScoreFHRS.includes(
          key as keyof typeof ratingValue.FHRS,
        ) === false,
    )
    .map((key) =>
      z.strictObject({
        SchemeType: z.literal("FHRS"),
        RatingValue: z.literal(key),
        RatingKey: fhrsValidRatingKeys(key as keyof typeof ratingValue.FHRS),
        // FHRSID 1709868 has a rating, but no rating date. So RatingDate needs to be nullable. (last checked 2024-12-18)
        RatingDate: z.string().nullable(),
        // FHRSID 351094 has a rating, but no scores. So Scores needs to be nullable. (last checked 2024-11-23)
        Scores: z
          .strictObject({
            Hygiene: constructZodLiteralUnionType(validHygieneScores),
            Structural: constructZodLiteralUnionType(validStructuralScores),
            ConfidenceInManagement: constructZodLiteralUnionType(
              validConfidenceScores,
            ),
          })
          .nullable(),
      })
    ),
];

// Build strict rating variants for FHIS
const ratingValueFHISObjects = [
  z.strictObject({
    SchemeType: z.literal("FHIS"),
    RatingValue: z.literal("never"),
    RatingKey: z.string(),
    RatingDate: z.literal("never"),
    Scores: z.literal(null),
  }),
  ...Object.keys(ratingValue.FHIS).map((key) =>
    z.strictObject({
      SchemeType: z.literal("FHIS"),
      RatingValue: z.literal(key),
      RatingKey: z.literal(
        ratingValue.FHIS[key as keyof typeof ratingValue.FHIS].ratingKey,
      ),
      // FHRSID 1436677 is Exempt, but has a rating date. So it can be null or a string. (last checked 2024-11-20)
      RatingDate: z.string().nullable(),
      Scores: z.literal(null),
    })
  ),
];

// Strict address variants
const establishmentAddressVariants = [
  z
    .strictObject({
      Geocode: z.strictObject({
        Latitude: z.string(),
        Longitude: z.string(),
      }),
    })
    .merge(addressFields),
  z
    .strictObject({
      Geocode: z.literal(null),
    })
    .merge(addressFields),
];

// Base fields for an Establishment
// Some authorities include additional metadata fields per establishment; keep them optional but explicit
const establishmentOptionalAuthorityFields = z.strictObject({
  LocalAuthorityEmailAddress: z.string().optional(),
  RightToReply: z.string().optional(),
});

const establishmentBase = z
  .strictObject({
    FHRSID: z.number(),
    BusinessName: z.string(),
    BusinessType: z.string(),
    LocalAuthorityBusinessID: z.union([z.string(), z.number()]),
    BusinessTypeID: z.number().int().nonnegative(),
    LocalAuthorityCode: z.string(),
    LocalAuthorityName: z.string(),
    LocalAuthorityWebSite: z.string(),
    NewRatingPending: z.boolean(),
  })
  .merge(establishmentOptionalAuthorityFields);

// Reusable Establishment schema as a union of fully strict merged variants
export const establishmentSchema = z.union([
  ...establishmentAddressVariants.flatMap((addr) =>
    ratingValueFHRSObjects.map((rating) =>
      establishmentBase.merge(addr).merge(rating)
    )
  ),
  ...establishmentAddressVariants.flatMap((addr) =>
    ratingValueFHISObjects.map((rating) =>
      establishmentBase.merge(addr).merge(rating)
    )
  ),
]);

// Header schema (required in all responses)
const headerSchema = z.strictObject({
  ExtractDate: z.string(),
  ItemCount: z.number().int().nonnegative(),
  ReturnCode: z.string(),
});

export const dataSchema = z.strictObject({
  FHRSEstablishment: z
    .strictObject({
      Header: headerSchema,
      // EstablishmentCollection can be null only when Header.ItemCount === 0
      EstablishmentCollection: z.array(establishmentSchema).nullable(),
    })
    .superRefine((object, context) => {
      const { ItemCount } = object.Header;
      // If ItemCount > 0, EstablishmentCollection must NOT be null
      if (ItemCount > 0 && object.EstablishmentCollection === null) {
        context.addIssue({
          code: "custom",
          path: ["EstablishmentCollection"],
          message:
            "EstablishmentCollection cannot be null when Header.ItemCount is greater than 0.",
        });
      }
      // If EstablishmentCollection is null, Header.ItemCount must be 0
      if (object.EstablishmentCollection === null && ItemCount !== 0) {
        context.addIssue({
          code: "custom",
          path: ["EstablishmentCollection"],
          message:
            "EstablishmentCollection may be null only when Header.ItemCount is 0.",
        });
      }
    }),
});
