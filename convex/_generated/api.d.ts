/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as files from "../files.js";
import type * as monitoring from "../monitoring.js";
import type * as privacy from "../privacy.js";
import type * as security from "../security.js";
import type * as utils from "../utils.js";
import type * as validation from "../validation.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  audit: typeof audit;
  auth: typeof auth;
  files: typeof files;
  monitoring: typeof monitoring;
  privacy: typeof privacy;
  security: typeof security;
  utils: typeof utils;
  validation: typeof validation;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
