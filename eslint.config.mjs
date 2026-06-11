<<<<<<< HEAD
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Mewarisi aturan terbaik Next.js (termasuk Core Web Vitals)
  ...compat.extends("next/core-web-vitals"),
  
  // Opsional: Abaikan folder build Next.js
  {
    ignores: [".next/*"]
  }
];

export default eslintConfig;
=======
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
