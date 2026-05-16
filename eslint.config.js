const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
    {
        ignores: ["out/**", "dist/**", "**/*.d.ts"]
    },
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module"
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: "import",
                    format: ["camelCase", "PascalCase"]
                }
            ],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-non-null-assertion": "error",
            "curly": "off",
            "eqeqeq": "warn",
            "no-throw-literal": "warn",
            "prefer-const": "error",
            "semi": "off"
        }
    }
];
