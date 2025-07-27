module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['metro.config.js','.eslintrc.js','babel.config.js'],
      parserOptions: {
        requireConfigFile: false
      }
    }
  ]
}