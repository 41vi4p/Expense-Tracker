# Bolt's Journal - Critical Learnings Only

## 2026-11-10 - Intl Formatter and Category Lookup Instantiation in Render Loops
**Learning:** Instantiating `Intl.NumberFormat` and `Intl.DateTimeFormat` or recreating arrays and doing `allCategories.find()` inside render loops or component bodies is computationally expensive (~100x slower for lists) in V8/JavaScript. Hoisting formatters and building a static `Map` lookup table reduces list formatting overhead dramatically.
**Action:** Always reuse static `Intl` formatters and use Map lookups for category lookups instead of allocating formatters and doing linear array searches on every item.
