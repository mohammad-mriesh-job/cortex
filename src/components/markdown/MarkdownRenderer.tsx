import { lazy, memo, Suspense, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import 'highlight.js/styles/github-dark.css';

import { remarkCallout } from './remarkCallout';
import { Callout } from './Callout';
import { renderInteractive } from '../interactive';

// Mermaid pulls in a large dependency; load it only when a diagram is rendered.
const Mermaid = lazy(() => import('./Mermaid').then((m) => ({ default: m.Mermaid })));

const remarkPlugins = [remarkGfm, remarkDirective, remarkCallout];
const rehypePlugins: [typeof rehypeSlug, ...unknown[]][] | unknown[] = [
  rehypeSlug,
  [rehypeHighlight, { ignoreMissing: true, detect: false }],
];

const inlineCodeSx = {
  fontFamily: 'monospace',
  fontSize: '0.85em',
  px: 0.75,
  py: 0.25,
  borderRadius: 1,
  bgcolor: 'action.hover',
  border: '1px solid',
  borderColor: 'divider',
} as const;

const components: Components = {
  a({ href, children }) {
    const url = href || '#';
    const external = /^(https?:)?\/\//.test(url) || url.startsWith('mailto:');
    if (external) {
      return (
        <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 500 }}>
          {children}
        </Link>
      );
    }
    return (
      <Link component={RouterLink} to={url} sx={{ fontWeight: 500 }}>
        {children}
      </Link>
    );
  },

  pre(props) {
    const child: any = Array.isArray(props.children) ? props.children[0] : props.children;
    const className: string = child?.props?.className || '';
    const codeText = String(child?.props?.children ?? '');
    const lang = /language-([\w-]+)/.exec(className)?.[1];

    // Interactive widgets: ```quiz / ```flashcards / ```walkthrough / ```tabs
    const interactive = renderInteractive(lang, codeText.replace(/\n$/, ''));
    if (interactive) return interactive;

    if (lang === 'mermaid') {
      return (
        <Suspense fallback={<Box sx={{ my: 3, height: 60 }} />}>
          <Mermaid chart={codeText.replace(/\n+$/, '')} />
        </Suspense>
      );
    }

    return (
      <Box
        component="pre"
        sx={{
          my: 2.5,
          p: 2,
          borderRadius: 2,
          overflow: 'auto',
          bgcolor: '#0d1117',
          border: '1px solid',
          borderColor: 'divider',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          '& code': {
            fontFamily: 'monospace',
            bgcolor: 'transparent',
            border: 'none',
            p: 0,
          },
        }}
      >
        {props.children}
      </Box>
    );
  },

  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || '');
    const text = String(children ?? '');
    const isBlock = !!match || text.includes('\n');
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return (
      <Box component="code" sx={inlineCodeSx}>
        {children}
      </Box>
    );
  },

  table({ children }) {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ my: 2.5 }}>
        <Table size="small">{children}</Table>
      </TableContainer>
    );
  },
  thead: ({ children }) => <TableHead>{children}</TableHead>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => <TableCell sx={{ fontWeight: 700 }}>{children}</TableCell>,
  td: ({ children }) => <TableCell>{children}</TableCell>,
};

// `callout` is a custom element emitted by remarkCallout (`:::tip`, `:::warning`, …).
// It isn't a standard HTML tag, so register it outside the typed literal.
(components as Record<string, unknown>).callout = ({ type, children }: { type?: string; children?: ReactNode }) => (
  <Callout type={type}>{children}</Callout>
);

function MarkdownRendererBase({ content }: { content: string }) {
  return (
    <Box
      sx={{
        '& h1, & h2, & h3, & h4, & h5, & h6': { scrollMarginTop: '80px', fontWeight: 700 },
        '& h1': { fontSize: '2rem', mt: 0, mb: 2 },
        '& h2': {
          fontSize: '1.55rem',
          mt: 5,
          mb: 1.5,
          pb: 0.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        '& h3': { fontSize: '1.25rem', mt: 3.5, mb: 1 },
        '& h4': { fontSize: '1.05rem', mt: 2.5, mb: 1 },
        '& p': { lineHeight: 1.75, my: 1.5 },
        '& ul, & ol': { pl: 3, my: 1.5, lineHeight: 1.7 },
        '& li': { my: 0.5 },
        '& li > ul, & li > ol': { my: 0.25 },
        '& strong': { fontWeight: 700 },
        '& img': { maxWidth: '100%', borderRadius: 1 },
        '& hr': { border: 'none', borderTop: '1px solid', borderColor: 'divider', my: 4 },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'divider',
          pl: 2,
          ml: 0,
          my: 2,
          color: 'text.secondary',
          fontStyle: 'italic',
        },
        '& kbd': {
          fontFamily: 'monospace',
          fontSize: '0.8em',
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins as never}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}

export const MarkdownRenderer = memo(MarkdownRendererBase);
