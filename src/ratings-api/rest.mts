const fetchInit = {
  headers: {
    accept: "application/json",
    "accept-language": "",
    "sec-ch-ua":
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "sec-gpc": "1",
    "x-api-version": "2",
  },
  referrer: "https://ratings.food.gov.uk/",
  referrerPolicy: "strict-origin-when-cross-origin",
  body: null,
  method: "GET",
  mode: "cors",
  credentials: "omit",
} satisfies RequestInit;

type FetchInitOptions =
  | {
    language?: "cy-GB" | "en-GB";
    type?: "json" | "xml";
  }
  | undefined;

const createFetchInit = (options: FetchInitOptions): RequestInit => {
  const language = options?.language === "cy-GB" ? "cy-GB" : "";
  const type = `applicaion/${options?.type ?? "json"}`;

  return {
    ...fetchInit,
    headers: {
      ...fetchInit.headers,
      accept: type,
      "accept-language": language,
    },
  };
};

export const authorities = async (
  options?: FetchInitOptions,
): Promise<string> => {
  const init = createFetchInit(options);

  const response = await fetch(
    "https://api.ratings.food.gov.uk/authorities",
    init,
  );
  return await response.text();
};

export const businessTypes = async (
  options?: FetchInitOptions,
): Promise<string> => {
  const init = createFetchInit(options);

  const response = await fetch(
    "https://api.ratings.food.gov.uk/businesstypes",
    init,
  );
  return await response.text();
};

export const countries = async (
  options?: FetchInitOptions,
): Promise<string> => {
  const init = createFetchInit(options);

  const response = await fetch(
    "https://api.ratings.food.gov.uk/countries",
    init,
  );
  return await response.text();
};

export const ratings = async (options?: FetchInitOptions): Promise<string> => {
  const init = createFetchInit(options);

  const response = await fetch("https://api.ratings.food.gov.uk/ratings", init);
  return await response.text();
};

export const regions = async (options?: FetchInitOptions): Promise<string> => {
  const init = createFetchInit(options);

  const response = await fetch("https://api.ratings.food.gov.uk/regions", init);
  return await response.text();
};

export const schemeTypes = async (
  options?: FetchInitOptions,
): Promise<string> => {
  const init = createFetchInit(options);

  const response = await fetch(
    "https://api.ratings.food.gov.uk/schemetypes",
    init,
  );
  return await response.text();
};

export const scoreDescriptors = async (
  options?: FetchInitOptions,
): Promise<string> => {
  const init = createFetchInit(options);

  const response = await fetch(
    "https://api.ratings.food.gov.uk/scoredescriptors",
    init,
  );
  return await response.text();
};

export const localAuthorityData = async (url: string): Promise<string> => {
  // It appears the redirect handler is rate limited, but the data files are not.
  // This skips the redirect handler and fetches the data directly.
  // This may break if the redirect handler is repointed elsewhere.
  const redirectedURL = url.replace(
    /^https:\/\/ratings\.food\.gov\.uk\/OpenDataFiles\//,
    "https://ratings.food.gov.uk/api/open-data-files/",
  );

  const response = await fetch(redirectedURL, fetchInit);
  const content = await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to fetch local authority data from ${redirectedURL}: ${response.status} ${response.statusText} - ${content}`,
    );
  }

  // This may be redundant, the response status is currently unknown.
  if (content.includes("504 Gateway Time-out")) {
    throw new Error(
      `504 Gateway Time-out error fetching local authority data from ${redirectedURL}. This may be a temporary issue. Please try again later. - ${response.status} ${response.statusText}`,
    );
  }

  return content;
};
