import React from "react";
import OriginalCodeBlock from "@theme-original/CodeBlock";
import TwoslashCodeBlock from "./TwoslashCodeBlock";
import type { Props } from "@theme/CodeBlock";

/**
 * Enhanced CodeBlock component that adds Twoslash support
 */
export default function CodeBlock(props: Props): JSX.Element {
  // Check if this is a twoslash block
  const isTwoslash =
    typeof props.metastring === "string" &&
    props.metastring.includes("twoslash") &&
    props.metastring.includes("twoslash-processed");

  // If it's a twoslash block, use our enhanced component
  if (isTwoslash) {
    return <TwoslashCodeBlock {...props} />;
  }

  // Otherwise, use the original CodeBlock
  return <OriginalCodeBlock {...props} />;
}
