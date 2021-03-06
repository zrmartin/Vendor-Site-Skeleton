module.exports = {
  moduleDirectories: [
    'node_modules',
    // add the directory with the test-utils.js file, for example:
    'util', // a utility folder
  ],
  setupFiles: ["dotenv/config"],
  "setupFilesAfterEnv": ["jest-extended"],
  testTimeout: 30000
}