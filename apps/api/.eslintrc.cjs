module.exports = {
  root: true,
  extends: ['../../packages/config/eslint/node.cjs'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist', 'coverage', 'prisma/migrations'],
};
