/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    require.resolve('./base.cjs'),
    'next/core-web-vitals',
  ],
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
