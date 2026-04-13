/* eslint-disable @typescript-eslint/consistent-type-definitions */
'use client';

import {
  type FontFamilyTokens,
  fontTokensToCssVars,
  type ThemeProps,
  themeToCssVars,
} from './to-css';

type TokensProps = {
  fontTokens: FontFamilyTokens;
};

export const SiteTheme = ({ fontTokens, ...theme }: TokensProps & ThemeProps) => (
  <style data-makeswift="theme">{`:root {
      ${fontTokensToCssVars(fontTokens).join('\n')}
      ${themeToCssVars(theme).join('\n')}
      /* Variable aliases for backward compatibility */
      --font-family-mono: var(--font-family-accent);
      --button-primary-text: var(--button-primary-foreground);
      --button-secondary-text: var(--button-secondary-foreground);
      --button-tertiary-text: var(--button-tertiary-foreground);
      --button-ghost-text: var(--button-ghost-foreground);
      --button-danger-text: var(--button-danger-foreground);
      /* Minimal theme: override all fonts to IBM Plex Mono */
      --font-family-body: var(--font-family-ibm-plex-mono), 'IBM Plex Mono', monospace;
      --font-family-heading: var(--font-family-ibm-plex-mono), 'IBM Plex Mono', monospace;
      --font-family-mono: var(--font-family-ibm-plex-mono), 'IBM Plex Mono', monospace;
      --font-family-accent: var(--font-family-ibm-plex-mono), 'IBM Plex Mono', monospace;
      /* Minimal theme: black buttons globally */
      --button-primary-background: hsl(var(--foreground));
      --button-primary-foreground: hsl(var(--background));
      --button-primary-border: hsl(var(--foreground));
      --button-primary-background-hover: hsl(var(--contrast-500));
      --button-secondary-background: hsl(var(--background));
      --button-secondary-foreground: hsl(var(--foreground));
      --button-secondary-border: hsl(var(--foreground));
    }
  `}</style>
);

type Props = TokensProps & {
  components: ThemeProps & { header: ThemeProps };
};

export const MakeswiftSiteTheme = ({
  fontTokens,
  components: { header, ...components },
}: Props) => {
  return <SiteTheme {...{ fontTokens, ...header, ...components }} />;
};
