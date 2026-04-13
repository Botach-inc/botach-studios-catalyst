'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useMemo } from 'react';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'span',
  'div',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'blockquote',
  'pre',
  'code',
  'img',
  'hr',
  'sup',
  'sub',
  'small',
];

const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'class',
  'id',
  'src',
  'alt',
  'width',
  'height',
  'aria-label',
  'aria-level',
  'role',
];

export const SafeHtml = ({ html, className }: SafeHtmlProps) => {
  const sanitized = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: ['target'],
        FORBID_TAGS: [
          'script',
          'style',
          'iframe',
          'object',
          'embed',
          'form',
          'input',
          'textarea',
          'select',
          'button',
        ],
        FORBID_ATTR: [
          'onerror',
          'onload',
          'onclick',
          'onmouseover',
          'onfocus',
          'onblur',
          'onsubmit',
          'onchange',
          'onkeydown',
          'onkeyup',
          'onkeypress',
        ],
      }),
    [html],
  );

  // Force all links to open in new tab with safe rel
  const safeHtml = useMemo(
    () => sanitized.replace(/<a /g, '<a rel="noopener noreferrer" target="_blank" '),
    [sanitized],
  );

  return <div className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
};
