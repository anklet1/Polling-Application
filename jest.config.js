/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",

  // Tell Jest how to handle different files
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest", // Use babel-jest for both JS and TS
  },

  // File extensions Jest will scan
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],

  // Clear mocks between tests
  clearMocks: true,

  // Optional: setup for ES modules in Node
  extensionsToTreatAsEsm: [".ts", ".tsx", ".js"],
};
