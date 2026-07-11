/**
 * App-level feature flags.
 *
 * INTRO_GATES_ENABLED — master switch for all first-run / intro UX: the onboarding
 * flow (incl. the tour + demo entry choice), the "What's New" welcome modal, and the
 * demo-mode banner. Disabled until ~v1.0 because the current intro gate is disruptive
 * and can't be dismissed (only tour/demo selectable). The code is kept intact; flip
 * this to `true` and fine-tune the flows when re-enabling.
 */
export const INTRO_GATES_ENABLED = false;
