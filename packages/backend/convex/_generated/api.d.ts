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
import type * as achievements from "../achievements.js";
import type * as assignments from "../assignments.js";
import type * as calendar from "../calendar.js";
import type * as courses from "../courses.js";
import type * as dashboard from "../dashboard.js";
import type * as friends from "../friends.js";
import type * as healthCheck from "../healthCheck.js";
import type * as learning from "../learning.js";
import type * as pastPapers from "../pastPapers.js";
import type * as tests from "../tests.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  assignments: typeof assignments;
  calendar: typeof calendar;
  courses: typeof courses;
  dashboard: typeof dashboard;
  friends: typeof friends;
  healthCheck: typeof healthCheck;
  learning: typeof learning;
  pastPapers: typeof pastPapers;
  tests: typeof tests;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
