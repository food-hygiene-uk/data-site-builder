/** @type {import('stylelint').Config} */

export default {
  extends: ["stylelint-config-standard"],
  rules: {
    /* __CLASS_SUFFIX__ is replaced in build process */
    "keyframes-name-pattern": [
      "^([a-z][a-z0-9]*)(-[a-z0-9]+)*(-__CLASS_SUFFIX__)?$",
      {
        message: (name) => `Expected keyframe name "${name}" to be kebab-case`,
      },
    ],
    /* __CLASS_SUFFIX__ is replaced in build process */
    "selector-class-pattern": [
      "^([a-z][a-z0-9]*)(-[a-z0-9]+)*(-__CLASS_SUFFIX__)?$",
      {
        message: (selector) =>
          `Expected class selector "${selector}" to be kebab-case`,
      },
    ],
  },
};
