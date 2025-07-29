import React from 'react';
import TwoslashCodeBlock from './TwoslashCodeBlock';

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
 * Enhanced CodeBlock component that adds Twoslash support
 */
export default function CodeBlock(props: Props): JSX.Element {
  // Check if this is a twoslash block
  const isTwoslash = typeof props.metastring === 'string' && 
                     props.metastring.includes('twoslash') && 
                     props.metastring.includes('twoslash-processed');

  // For now, always use our TwoslashCodeBlock since it handles both cases
  return <TwoslashCodeBlock {...props} />;
}
