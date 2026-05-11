/**
 * BABEL CONFIG FOR JEST
 * 
 * Babel configuration that lets Jest process ES modules.
 */

export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'commonjs', // Transform ES Modules to CommonJS for Node execution
      },
    ],
  ],
};
