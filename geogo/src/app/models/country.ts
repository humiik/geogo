interface CountryName {
  common: string;
  official: string;
}

export interface Country {
  cca3: string;
  name: CountryName & { nativeName?: Record<string, CountryName> };
  flags: { png: string; svg: string; alt?: string };
  region: string;
  subregion?: string;
  capital?: string[];
  population: number;
  area: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
}
