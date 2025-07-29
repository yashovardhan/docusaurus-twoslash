import type { Plugin } from '@docusaurus/types';

export interface TwoslashQuery {
  kind: 'query';
  start: number;
  length: number;
  text: string;
  offset: number;
  line: number;
  docs?: string;
}

export interface TwoslashError {
  kind: 'error';
  start: number;
  length: number;
  text: string;
  code: number;
  line: number;
}

export interface TwoslashData {
  code: string;
  queries: TwoslashQuery[];
  errors: TwoslashError[];
  staticQuickInfos: any[];
  highlights: any[];
  lang: string;
}

export interface TwoslashPluginOptions {
  /**
   * TypeScript configuration options
   */
  typescript?: {
    /**
     * Custom TypeScript compiler options
     */
    compilerOptions?: import('typescript').CompilerOptions;
  };
  
  /**
   * Supported languages/themes for Twoslash processing
   * @default ['typescript', 'javascript', 'jsx', 'tsx']
   */
  themes?: string[];
  
  /**
   * Whether to enable caching for performance
   * @default true
   */
  cache?: boolean;
  
  /**
   * Whether to include TypeScript default library
   * @default true
   */
  includeDefaultLib?: boolean;
}

/**
 * Docusaurus Twoslash Plugin
 * 
 * Adds TypeScript Twoslash integration for enhanced code blocks with type information
 */
declare function docusaurusTwoslashPlugin(
  context: import('@docusaurus/types').LoadContext,
  options?: TwoslashPluginOptions
): Plugin;

export default docusaurusTwoslashPlugin; 