module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended'
    ],
    rules: {
      // Custom rules can be added here
    },
    env: {
      node: true,
      jest: true
    }
};