module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/mocks/styleMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: ["**/*.test.ts"],
  verbose: true,
};
