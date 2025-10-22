module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: ["**/__tests__/**/*.test.ts"],
};
