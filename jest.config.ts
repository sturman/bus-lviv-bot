import type { Config } from 'jest';
import { workspaces } from './package.json';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.spec\\.ts$',
  reporters: ['default', ['jest-junit', { addFileAttribute: 'true' }]],
  collectCoverageFrom: workspaces.map(p => `${p}/**/src/**/*.ts`),
  coveragePathIgnorePatterns: ['jest.config.ts', '.spec.ts$'],
  coverageDirectory: 'coverage',
  clearMocks: true,
  coverageReporters: ['cobertura', 'text', 'lcov', 'html'],
};

export default config;
