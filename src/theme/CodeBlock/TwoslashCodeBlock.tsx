import React, { useRef, useState, useCallback } from "react";
import clsx from "clsx";
import { useThemeConfig, usePrismTheme } from "@docusaurus/theme-common";
import { Highlight, type Language, type Token } from "prism-react-renderer";

// Type definitions for theme components that might not be available
interface LineProps {
  line: any[];
  classNames: string[];
  showLineNumbers: boolean;
  getLineProps: any;
  getTokenProps: any;
}

// Fallback implementations since we can't reliably import theme internals
const parseCodeBlockTitle = (metastring?: string): string | undefined => {
  if (!metastring) return undefined;
  const match = metastring.match(/title="([^"]+)"/);
  return match?.[1];
};

const parseLanguage = (className?: string): string | undefined => {
  if (!className) return undefined;
  const match = className.match(/language-(\w+)/);
  return match?.[1];
};

const parseLines = (code: string, options: any) => {
  const lines = code.split('\n');
  const lineClassNames = lines.map(() => []);
  return {
    lineClassNames,
    code,
  };
};

const containsLineNumbers = (metastring?: string): boolean => {
  return metastring?.includes('showLineNumbers') ?? false;
};

const useCodeWordWrap = () => ({
  codeBlockRef: React.useRef<HTMLPreElement>(null),
  isEnabled: false,
  isCodeScrollable: false,
  toggle: () => {},
});

// Fallback Line component
const Line: React.FC<LineProps> = ({ line, classNames, showLineNumbers, getLineProps, getTokenProps }) => {
  return (
    <span {...getLineProps({ line, className: clsx(classNames) })}>
      {showLineNumbers && <span className="token-line-number" />}
      {line.map((token, key) => (
        <span key={key} {...getTokenProps({ token, key })} />
      ))}
    </span>
  );
};

// Fallback CopyButton component
const CopyButton: React.FC<{ className: string; code: string }> = ({ className, code }) => {
  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
  };
  
  return (
    <button className={className} onClick={handleCopy} type="button" title="Copy code">
      Copy
    </button>
  );
};

// Fallback WordWrapButton component
const WordWrapButton: React.FC<{ className: string; onClick: () => void; isEnabled: boolean }> = ({ 
  className, 
  onClick, 
  isEnabled 
}) => {
  return (
    <button className={className} onClick={onClick} type="button" title="Toggle word wrap">
      {isEnabled ? 'Unwrap' : 'Wrap'}
    </button>
  );
};

// Fallback Container component
const Container: React.FC<{ as: any; className: string; children: React.ReactNode; [key: string]: any }> = ({ 
  as: As = 'div', 
  className, 
  children, 
  ...props 
}) => {
  return <As className={className} {...props}>{children}</As>;
};

// Twoslash types
interface TwoslashQuery {
  kind: "query";
  start: number;
  length: number;
  text: string;
  offset: number;
  line: number;
  docs?: string;
}

interface TwoslashData {
  queries: TwoslashQuery[];
  errors: any[];
}

interface Props {
  children: React.ReactNode;
  className?: string;
  metastring?: string;
  title?: string;
  showLineNumbers?: boolean;
  language?: string;
  [key: string]: any;
}

/**
 * Normalizes language identifiers
 */
function normalizeLanguage(language?: string): string {
  return language?.toLowerCase().replace(/^language-/, '') || 'text';
}

/**
 * Filters out Twoslash query lines (^?) from code content
 */
function filterTwoslashLines(code: string): { cleanCode: string; lineMapping: number[] } {
  const lines = code.split('\n');
  const cleanLines: string[] = [];
  const lineMapping: number[] = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('//    ^?') && trimmed !== '^?') {
      cleanLines.push(line);
      lineMapping.push(index);
    }
  });
  
  return {
    cleanCode: cleanLines.join('\n'),
    lineMapping
  };
}

/**
 * Twoslash tooltip component
 */
const TwoslashTooltip: React.FC<{
  query: TwoslashQuery;
  isVisible: boolean;
  position: { x: number; y: number };
}> = ({ query, isVisible, position }) => {
  if (!isVisible) return null;

  return (
    <div
      className="twoslash-tooltip"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y - 40,
        backgroundColor: "var(--ifm-background-color)",
        border: "1px solid var(--ifm-color-emphasis-300)",
        borderRadius: "4px",
        padding: "8px 12px",
        fontSize: "13px",
        fontFamily: "var(--ifm-font-family-monospace)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
        maxWidth: "400px",
        whiteSpace: "pre-wrap",
        pointerEvents: "none",
      }}
    >
      <div style={{ color: "var(--ifm-color-success)" }}>{query.text}</div>
      {query.docs && (
        <div style={{ color: "var(--ifm-color-emphasis-700)", marginTop: "4px" }}>
          {query.docs}
        </div>
      )}
    </div>
  );
};

export default function TwoslashCodeBlock({
  children,
  className: blockClassName = "",
  metastring,
  title: titleProp,
  showLineNumbers: showLineNumbersProp,
  language: languageProp,
  ...props
}: Props): JSX.Element {
  const {
    prism: { defaultLanguage, magicComments },
  } = useThemeConfig();

  const language = normalizeLanguage(
    languageProp ?? parseLanguage(blockClassName) ?? defaultLanguage,
  );

  const prismTheme = usePrismTheme();
  const wordWrap = useCodeWordWrap();

  // Twoslash state
  const [hoveredQuery, setHoveredQuery] = useState<TwoslashQuery | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Check if this is a Twoslash block
  const isTwoslash = metastring?.includes("twoslash") && metastring?.includes("twoslash-processed");

  // Parse Twoslash data from props
  let twoslashData: TwoslashData | null = null;
  if (isTwoslash) {
    try {
      // Try multiple ways to get the data
      if (props.twoslashData && typeof props.twoslashData === "object") {
        twoslashData = props.twoslashData;
      } else if (props.twoslashData && typeof props.twoslashData === "string") {
        twoslashData = JSON.parse(props.twoslashData);
      } else if (props.twoslash_data && typeof props.twoslash_data === "object") {
        twoslashData = props.twoslash_data;
      } else if (props.twoslash_data && typeof props.twoslash_data === "string") {
        twoslashData = JSON.parse(props.twoslash_data);
      } else if (props["data-twoslash"]) {
        twoslashData = JSON.parse(props["data-twoslash"]);
      }
    } catch (error) {
      console.warn("Failed to parse Twoslash data:", error);
    }
  }

  // Get the raw code content
  let rawCode = "";
  if (typeof children === "string") {
    rawCode = children;
  } else if (children && typeof children === "object" && "props" in children) {
    rawCode = (children as any).props.children || "";
  }

  // Filter out ^? lines for Twoslash blocks
  const { cleanCode, lineMapping } = isTwoslash
    ? filterTwoslashLines(rawCode)
    : { cleanCode: rawCode, lineMapping: [] };

  // Use filtered code for parsing
  const codeToUse = isTwoslash ? cleanCode : rawCode;

  const {
    lineClassNames,
    code: processedCode,
  } = parseLines(codeToUse, {
    metastring,
    language,
    magicComments,
  });

  const title = parseCodeBlockTitle(metastring) || titleProp;

  const { language: preLanguage, ...preProps } = props;

  const showLineNumbers =
    showLineNumbersProp ?? containsLineNumbers(metastring);

  // Create character position mapping for hover detection
  const twoslashRanges: Array<{
    line: number;
    start: number;
    end: number;
    query: TwoslashQuery;
  }> = [];

  if (twoslashData?.queries) {
    for (const query of twoslashData.queries) {
      twoslashRanges.push({
        line: query.line,
        start: query.start,
        end: query.start + query.length,
        query,
      });
    }
  }

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLPreElement>) => {
      if (!twoslashData?.queries?.length) return;

      const target = event.target as HTMLElement;
      
      // Check if we're hovering over a token with twoslash data
      if (target.classList.contains('twoslash-hover')) {
        const queryIndex = target.getAttribute('data-twoslash-query-index');
        if (queryIndex !== null) {
          const query = twoslashData.queries[parseInt(queryIndex)];
          if (query) {
            setHoveredQuery(query);
            setTooltipPosition({ x: event.clientX, y: event.clientY });
            return;
          }
        }
      }

      setHoveredQuery(null);
    },
    [twoslashData]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredQuery(null);
  }, []);

  return (
    <Container
      as="div"
      className={clsx(
        blockClassName,
        language && `language-${language}`,
        isTwoslash && "twoslash-block",
      )}
      {...preProps}
    >
      {title && <div className="codeBlockTitle">{title}</div>}
      <div className="codeBlockContent">
        <Highlight theme={prismTheme} code={processedCode} language={(language ?? "text") as Language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => {
            return (
              <pre
                tabIndex={0}
                ref={wordWrap.codeBlockRef}
                className={clsx(className, "codeBlock")}
                style={{
                  ...style,
                  cursor: isTwoslash && twoslashData?.queries?.length ? "default" : "text",
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <code
                  className={clsx(
                    "codeBlockLines",
                    showLineNumbers && "codeBlockLinesWithNumbering",
                  )}
                >
                  {tokens.map((line, lineIndex) => {
                    // Get Twoslash ranges for this line
                    const lineRanges = twoslashRanges.filter((range) => range.line === lineIndex);

                    // Calculate character positions for this line and split tokens as needed
                    let charPosition = 0;
                    const enhancedLine: any[] = [];

                    line.forEach((token: Token, tokenIndex: number) => {
                      const tokenStart = charPosition;
                      const tokenEnd = charPosition + token.content.length;

                      // Check if this token overlaps with any Twoslash ranges
                      const overlappingRanges = lineRanges.filter(
                        (range) => tokenStart < range.end && tokenEnd > range.start
                      );

                      if (overlappingRanges.length > 0) {
                        // Split the token if necessary
                        let currentPos = tokenStart;
                        const tokenContent = token.content;

                        for (const range of overlappingRanges) {
                          const overlapStart = Math.max(range.start, tokenStart);
                          const overlapEnd = Math.min(range.end, tokenEnd);

                          // Add content before the overlap
                          if (currentPos < overlapStart) {
                            const beforeContent = tokenContent.substring(
                              currentPos - tokenStart,
                              overlapStart - tokenStart
                            );
                            enhancedLine.push({
                              ...token,
                              content: beforeContent,
                              key: `${lineIndex}-${tokenIndex}-before-${currentPos}`,
                            });
                          }

                          // Add the overlapping content with Twoslash styling
                          const overlapContent = tokenContent.substring(
                            overlapStart - tokenStart,
                            overlapEnd - tokenStart
                          );
                          enhancedLine.push({
                            ...token,
                            content: overlapContent,
                            types: [(token as any).types?.[0] || 'token', 'twoslash-hover'].join(' '),
                            key: `${lineIndex}-${tokenIndex}-overlap-${overlapStart}`,
                            'data-twoslash-query-index': twoslashData?.queries.indexOf(range.query),
                          });

                          currentPos = overlapEnd;
                        }

                        // Add content after all overlaps
                        if (currentPos < tokenEnd) {
                          const afterContent = tokenContent.substring(currentPos - tokenStart);
                          enhancedLine.push({
                            ...token,
                            content: afterContent,
                            key: `${lineIndex}-${tokenIndex}-after-${currentPos}`,
                          });
                        }
                      } else {
                        // No overlap, use the original token
                        enhancedLine.push({
                          ...token,
                          key: `${lineIndex}-${tokenIndex}`,
                        });
                      }

                      charPosition += token.content.length;
                    });

                    return (
                      <Line
                        key={lineIndex}
                        line={enhancedLine}
                        classNames={lineClassNames[lineIndex]}
                        showLineNumbers={showLineNumbers}
                        getLineProps={getLineProps}
                        getTokenProps={(tokenProps: any) => {
                          const { key, types, children, ...rest } = tokenProps;
                          return {
                            ...rest,
                            className: clsx(types, tokenProps.types),
                            key,
                            'data-twoslash-query-index': tokenProps['data-twoslash-query-index'],
                          };
                        }}
                      />
                    );
                  })}
                </code>
              </pre>
            );
          }}
        </Highlight>
        <div className="buttonGroup">
          {(wordWrap.isEnabled || wordWrap.isCodeScrollable) && (
            <WordWrapButton
              className="codeBlockWordWrapButton"
              onClick={() => wordWrap.toggle()}
              isEnabled={wordWrap.isEnabled}
            />
          )}
          <CopyButton className="codeBlockCopyButton" code={processedCode} />
        </div>
      </div>
      
      {/* Twoslash tooltip */}
      <TwoslashTooltip
        query={hoveredQuery!}
        isVisible={!!hoveredQuery}
        position={tooltipPosition}
      />
    </Container>
  );
}
