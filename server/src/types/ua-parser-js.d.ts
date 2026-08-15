/**
 * `ua-parser-js` ships no bundled types and there is no `@types/ua-parser-js`
 * package. This is a minimal ambient declaration covering only what
 * `server/src/lib/ua-parse.ts` actually uses.
 */
declare module "ua-parser-js" {
  export interface UAParserBrowser {
    name?: string;
    version?: string;
  }

  export interface UAParserOS {
    name?: string;
    version?: string;
  }

  export interface UAParserDevice {
    type?: string;
    model?: string;
    vendor?: string;
  }

  export interface UAParserEngine {
    name?: string;
    version?: string;
  }

  export interface UAParserCPU {
    architecture?: string;
  }

  export interface UAParserResult {
    ua: string;
    browser: UAParserBrowser;
    os: UAParserOS;
    device: UAParserDevice;
    engine: UAParserEngine;
    cpu: UAParserCPU;
  }

  export class UAParser {
    constructor(uaString?: string);
    getResult(): UAParserResult;
  }

  export default UAParser;
}
