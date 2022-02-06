import "karma"

import { Configuration as WebpackConfig } from "webpack"

declare module "karma" {
  interface ConfigOptions {
    beforeMiddleware?: string[]
    webpack?: Partial<WebpackConfig>   /* karma-webpack */
    webpackMiddleware?: WebpackConfig
    specReporter?: {                   /* karma-spec-reporter */
      suppressErrorSummary?: boolean
      suppressPassed?: boolean
      suppressSkipped?: boolean
    }
    coverageIstanbulReporter?: {       /* karma-coverage */
      reports: string[]
    }
    sauceLabs?: {
      build?: string,
      testName: string,
      recordVideo: boolean,
      recordScreenshots: boolean
    }
  }
  interface ClientOptions {            /* karma-jasmine */
    jasmine?: {
      random: boolean
    }
  }
}
