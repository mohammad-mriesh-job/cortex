import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Box } from '@mui/material';
import 'highlight.js/styles/github-dark.css';

const rehypePlugins = [[rehypeHighlight, { ignoreMissing: true, detect: false }]];

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
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || '');
    const text = String(children ?? '');
    if (match || text.includes('\n')) {
      return <code className={className}>{children}</code>;
    }
    return (
      <Box component="code" sx={inlineCodeSx}>
        {children}
      </Box>
    );
  },
  pre({ children }) {
    return (
      <Box
        component="pre"
        sx={{
          my: 1.5,
          p: 1.5,
          borderRadius: 1.5,
          overflow: 'auto',
          bgcolor: '#0d1117',
          border: '1px solid',
          borderColor: 'divider',
          fontSize: '0.82rem',
          lineHeight: 1.55,
          '& code': { fontFamily: 'monospace', bgcolor: 'transparent', border: 'none', p: 0 },
        }}
      >
        {children}
      </Box>
    );
  },
};

/** Lightweight markdown renderer for short rich text inside interactive widgets. */
export function MiniMarkdown({ content }: { content: string }) {
  return (
    <Box
      sx={{
        '& > :first-of-type': { mt: 0 },
        '& > :last-child': { mb: 0 },
        '& p': { my: 0.75, lineHeight: 1.6 },
        '& ul, & ol': { pl: 2.5, my: 0.75 },
        '& strong': { fontWeight: 700 },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins as never} components={components}>
        {content}
      </ReactMarkdown>
    </Box>
  );
}
