import tsEslint from "typescript-eslint";
import config from "eslint-config-kyle";

export default tsEslint.config(...config, {
  rules: {
    "dot-notation": "off",
    quotes: ["error", "double"],
  },
});
