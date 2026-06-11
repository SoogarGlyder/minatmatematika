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