export default {
  rootDir: ".",
  testEnvironment: "node",
  verbose: true,

  transform: {
    "^.+\\.m?js$": "babel-jest",
  },

  setupFilesAfterEnv: ["./tests/setup.mjs"],
};
