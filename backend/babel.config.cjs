/**
 * BABEL CONFIG FOR JEST
 *
 * Babel configuration that lets Jest process ES modules.
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'commonjs',
      },
    ],
  ],
};
