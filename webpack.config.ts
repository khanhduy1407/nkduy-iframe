import * as path from "path"
import { Configuration } from "webpack"

/* ----------------------------------------------------------------------------
 * Configuration
 * ------------------------------------------------------------------------- */

/**
 * Webpack configuration
 *
 * @param env - Webpack environment arguments
 * @param args - Command-line arguments
 *
 * @return Webpack configuration
 */
export default (_env: never, args: Configuration) => {
  return {
    mode: args.mode,

    /* Entrypoint */
    entry: "src/polyfill",

    /* Loaders */
    module: {
      rules: [

        /* TypeScript */
        {
          test: /\.ts$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  declaration: false,
                  declarationMap: false,
                  module: "commonjs",
                  target: "es5"
                }
              }
            }
          ],
          exclude: /\/node_modules\//
        }
      ]
    },

    /* Export class constructor as entrypoint */
    output: {
      path: path.resolve(__dirname, "polyfill"),
      pathinfo: false,
      filename: "index.js",
      libraryTarget: "window"
    },

    /* Module resolver */
    resolve: {
      modules: [
        __dirname,
        path.resolve(__dirname, "node_modules")
      ],
      extensions: [".ts", ".js", ".json"]
    },

    /* Sourcemaps - none, as they can't be fetched via file:// */
    devtool: false
  }
}
