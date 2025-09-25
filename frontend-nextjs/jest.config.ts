/** @type {import('jest').Config} */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Busca tests dentro de src (y/o tests si luego la creas)
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
  // Usa el tsconfig especial para Jest
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.jest.json",
    },
  },
  // Soporte para tus paths del tsconfig
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@domain/(.*)$": "<rootDir>/src/core/domain/$1",
    "^@infra/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@useCases/(.*)$": "<rootDir>/src/core/application/usecases/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
  },
};
