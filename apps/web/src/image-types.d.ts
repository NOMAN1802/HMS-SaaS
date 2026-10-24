// Types for static image imports (the brand mark in brand.tsx is imported so the /staff base path
// applies to it, P-043). Next.js declares them in next-env.d.ts, which is generated on the first
// build or dev run and is git-ignored, so a fresh checkout (CI typecheck) would not see them.
// Implements: T-WEB-18.
/// <reference types="next/image-types/global" />
