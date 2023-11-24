module.exports = {
  env: {
    node: true,
    es6: true,
  },

  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-unused-vars': [
      'error',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false },
    ],
    'no-console': 'off', // You might want to keep console statements during development
    'max-len': ['error', { code: 100, ignoreUrls: true }],
    'consistent-return': 'error',
    'func-names': 'off', // Allow unnamed functions if necessary
    'no-shadow': 'error',
    'no-undef': 'off', // Allow describe, it, etc. in test files
  },
};
