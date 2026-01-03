import { z } from "zod";
import {
  authoritiesResponseSchema,
  businessTypesResponseSchema,
  countriesResponseSchema,
  dataSchema,
  establishmentSchema,
  ratingsResponseSchema,
  regionsResponseSchema,
  schemeTypesResponseSchema,
  scoreDescriptorsResponseSchema,
} from "./schema.mts";

export type AuthoritiesResponse = z.infer<typeof authoritiesResponseSchema>;
export type Authorities = AuthoritiesResponse["authorities"];
export type Authority = Authorities[number];

export type BusinessTypesResponse = z.infer<typeof businessTypesResponseSchema>;
export type CountriesResponse = z.infer<typeof countriesResponseSchema>;
export type RatingsResponse = z.infer<typeof ratingsResponseSchema>;
export type RegionsResponse = z.infer<typeof regionsResponseSchema>;
export type SchemeTypesResponse = z.infer<typeof schemeTypesResponseSchema>;
export type ScoreDescriptorsResponse = z.infer<
  typeof scoreDescriptorsResponseSchema
>;

export type LocalAuthorityData = z.infer<typeof dataSchema>;

export type Establishment = z.infer<typeof establishmentSchema>;
