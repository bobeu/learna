/**
 * MarkdownRenderer Component
 * 
 * This component renders markdown content with proper formatting, syntax highlighting,
 * and styling that matches the project theme. It handles:
 * - Headings (H1-H6) with primary color styling
 * - Bold and italic text with color differentiation
 * - Code blocks with syntax highlighting (Solidity, JavaScript, etc.)
 * - Inline code snippets
 * - Lists (ordered and unordered)
 * - Links
 * - Blockquotes
 * - Responsive design for mobile and web
 * 
 * Uses only 3 colors from the project theme:
 * - Primary (lime/green) for headings and accents
 * - Secondary (gray) for body text
 * - Primary variants for emphasis (bold/italic)
 */

"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import type { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Type assertion for SyntaxHighlighter to work with JSX
const SyntaxHighlighter = Prism as unknown as React.ComponentType<{
  language: string;
  style: Record<string, React.CSSProperties>;
  customStyle: React.CSSProperties;
  children: string;
  [key: string]: unknown;
}>;

/**
 * Custom components for markdown elements
 * Styled to match project theme with 3 colors only
 */
const MarkdownComponents: Partial<Components> = {
  // Headings - Use primary color
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-6 mb-4 text-primary-500 dark:text-primary-400 border-b-2 border-primary-500/20 dark:border-primary-400/20 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-5 mb-3 text-primary-600 dark:text-primary-300">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 mb-2 text-primary-700 dark:text-primary-400">
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: ReactNode }) => (
    <h4 className="text-base sm:text-lg md:text-xl font-semibold mt-3 mb-2 text-primary-700 dark:text-primary-300">
      {children}
    </h4>
  ),
  h5: ({ children }: { children?: ReactNode }) => (
    <h5 className="text-sm sm:text-base md:text-lg font-semibold mt-3 mb-2 text-primary-800 dark:text-primary-300">
      {children}
    </h5>
  ),
  h6: ({ children }: { children?: ReactNode }) => (
    <h6 className="text-xs sm:text-sm md:text-base font-semibold mt-2 mb-2 text-primary-800 dark:text-primary-300">
      {children}
    </h6>
  ),

  // Paragraphs - Use secondary color
  p: ({ children }: { children?: ReactNode }) => (
    <p className="text-sm sm:text-base text-secondary-700 dark:text-secondary-300 leading-relaxed mb-4">
      {children}
    </p>
  ),

  // Bold text - Use primary color for emphasis
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-bold text-primary-700 dark:text-primary-400">
      {children}
    </strong>
  ),

  // Italic text - Use primary color with opacity
  em: ({ children }: { children?: ReactNode }) => (
    <em className="italic text-primary-600 dark:text-primary-300">
      {children}
    </em>
  ),

  // Lists
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-secondary-700 dark:text-secondary-300 ml-4">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-secondary-700 dark:text-secondary-300 ml-4">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="text-sm sm:text-base leading-relaxed">
      {children}
    </li>
  ),

  // Links - Use primary color
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),

  // Blockquotes - Use primary color with subtle background
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-l-4 border-primary-500 dark:border-primary-400 pl-4 py-2 my-4 bg-primary-50 dark:bg-primary-900/20 italic text-secondary-700 dark:text-secondary-300">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => (
    <hr className="my-6 border-0 border-t-2 border-primary-300 dark:border-primary-700" />
  ),

  // Tables
  table: ({ children }: { children?: ReactNode }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-primary-200 dark:border-primary-800">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead className="bg-primary-100 dark:bg-primary-900/30">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children?: ReactNode }) => (
    <tbody className="divide-y divide-primary-200 dark:divide-primary-800">
      {children}
    </tbody>
  ),
  tr: ({ children }: { children?: ReactNode }) => (
    <tr className="hover:bg-primary-50 dark:hover:bg-primary-900/20">
      {children}
    </tr>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="px-4 py-2 text-left font-semibold text-primary-800 dark:text-primary-200 border border-primary-200 dark:border-primary-800">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="px-4 py-2 text-secondary-700 dark:text-secondary-300 border border-primary-200 dark:border-primary-800">
      {children}
    </td>
  ),
};

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const { theme } = useTheme();

  // Create code component with theme access
  // Type as a function component that matches react-markdown's code component
  const CodeComponent: React.FC<{
    inline?: boolean;
    className?: string;
    children?: ReactNode;
    [key: string]: unknown;
  }> = (props) => {
    const { 
      inline, 
      className: codeClassName, 
      children,
      ...restProps 
    } = props;
    
    const match = /language-(\w+)/.exec(codeClassName || '');
    const language = match ? match[1] : '';
    
    // Inline code
    if (inline) {
      return (
        <code 
          className="px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-xs sm:text-sm font-mono"
          {...(restProps as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </code>
      );
    }

    // Code blocks with syntax highlighting
    return (
      <div className="my-4 rounded-lg overflow-hidden border border-primary-200 dark:border-primary-800">
        <SyntaxHighlighter
          language={language || 'text'}
          style={theme === 'dark' ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            borderRadius: '0.5rem',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Update components with code component
  // Type assertion needed because react-markdown's Components type is strict
  // but our component handles the props correctly at runtime
  const componentsWithCode: Partial<Components> = {
    ...MarkdownComponents,
    code: CodeComponent as unknown as NonNullable<Components['code']>,
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={componentsWithCode}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
