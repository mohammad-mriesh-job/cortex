import { visit } from 'unist-util-visit';

/**
 * Turns `:::tip ... :::` directive blocks into a custom `<callout type="tip">`
 * hast element that MarkdownRenderer maps to the MUI <Callout/> component.
 */
export function remarkCallout() {
  return (tree: unknown) => {
    visit(tree as never, (node: any) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {});
        data.hName = 'callout';
        data.hProperties = { type: node.name };
      }
    });
  };
}
