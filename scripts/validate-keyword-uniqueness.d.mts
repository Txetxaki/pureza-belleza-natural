// Hand-written declaration file for validate-keyword-uniqueness.mjs — lets
// src/app/seo/validate-keyword-uniqueness.spec.ts import the plain-ESM script
// directly (one source of truth, see the comment in that spec) with real
// types, instead of duplicating its logic into a parallel .ts module.
export type Planta = 'romero' | 'espliego' | 'esparto' | 'vid' | 'olivo';

export interface RegistryRouteLike {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly primaryKeyword: string | null;
  readonly planta: Planta | null;
  readonly priority: number;
  readonly [key: string]: unknown;
}

export interface KeywordDuplicate {
  readonly keyword: string;
  readonly paths: readonly [string, string];
}

export interface PathDuplicate {
  readonly path: string;
}

export interface PlantaDuplicate {
  readonly planta: Planta;
  readonly paths: readonly [string, string];
}

export interface FieldViolation {
  readonly path: string;
  readonly field: 'title' | 'description' | 'priority';
  readonly reason: string;
}

/** `posts.manifest.json` entry shape `findBlogTitleLocalityViolations` reads. */
export interface PostManifestLike {
  readonly slug: string;
  readonly title: string;
  readonly [key: string]: unknown;
}

export interface BlogTitleLocalityViolation {
  readonly slug: string;
  readonly field: 'title';
  readonly reason: string;
}

export interface ValidationResult {
  readonly duplicateKeywords: readonly KeywordDuplicate[];
  readonly duplicatePaths: readonly PathDuplicate[];
  readonly duplicatePlantas: readonly PlantaDuplicate[];
  readonly fieldViolations: readonly FieldViolation[];
  readonly blogTitleLocality: readonly BlogTitleLocalityViolation[];
  readonly blogTitleLength: readonly BlogTitleLocalityViolation[];
}

export declare const TITLE_MAX: number;
export declare const DESCRIPTION_MAX: number;

export declare function normalizeKeyword(keyword: string | null | undefined): string | null;
export declare function findDuplicateKeywords(routes: readonly RegistryRouteLike[]): KeywordDuplicate[];
export declare function findDuplicatePaths(routes: readonly RegistryRouteLike[]): PathDuplicate[];
export declare function findDuplicatePlantas(routes: readonly RegistryRouteLike[]): PlantaDuplicate[];
export declare function findFieldViolations(routes: readonly RegistryRouteLike[]): FieldViolation[];
export declare const BLOG_TITLE_SUFFIX: string;

/** Rendered `<title>` length budget for blog posts (manifest title + suffix). */
export declare function findBlogTitleLengthViolations(
  posts: readonly PostManifestLike[],
): readonly BlogTitleLocalityViolation[];

export declare function findBlogTitleLocalityViolations(
  posts: readonly PostManifestLike[],
): BlogTitleLocalityViolation[];
export declare function validateRegistry(
  routes: readonly RegistryRouteLike[],
  posts?: readonly PostManifestLike[],
): ValidationResult;
export declare function hasViolations(result: ValidationResult): boolean;
