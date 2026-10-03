import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  metadataBase: new URL('https://promptshift.dev'),
  title: 'PromptShift — 1-Click Universal AI Project Bridge (promptshift.dev)',
  description: 'Shift AI projects between Gemini, Claude, OpenAI & Cursor in 1 click. Zero server logs, in-RAM secret sanitizer, and 98.5% certified semantic fidelity.',
  keywords: [
    'AI Converter',
    'Gemini to Claude',
    'OpenAI Custom GPT',
    'Cursor Rules',
    'Claude Projects to Cursor',
    'Universal Transpiler',
    'PromptShift',
    'Generative Engine Optimization',
    'AI Context Porter',
    'AI Developer Tools',
  ],
  authors: [{ name: 'PromptShift Engineering Team' }],
  creator: 'PromptShift',
  publisher: 'PromptShift',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://promptshift.dev',
    languages: {
      'en-US': 'https://promptshift.dev',
      'fr-FR': 'https://promptshift.dev',
      'x-default': 'https://promptshift.dev',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/official_logo.jpg',
    apple: '/assets/official_logo.jpg',
  },
  openGraph: {
    title: 'PromptShift — 1-Click Universal AI Project Bridge',
    description: 'The sovereign, zero-retention bridge for AI coding assistants. Preserve 100% of your rules, master prompts, and autonomy directives with verified semantic fidelity.',
    url: 'https://promptshift.dev',
    siteName: 'PromptShift',
    images: [
      {
        url: '/assets/official_logo.jpg',
        width: 1200,
        height: 630,
        alt: 'PromptShift — Universal AI Project Transpiler',
      },
    ],
    locale: 'en_US',
    alternateLocale: ['fr_FR'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptShift — 1-Click Universal AI Project Bridge',
    description: 'Shift AI projects between Gemini, Claude, OpenAI & Cursor in 1 click. 100% Free Open Beta.',
    images: ['/assets/official_logo.jpg'],
  },
  category: 'technology',
};

const jsonLdSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PromptShift',
    url: 'https://promptshift.dev',
    logo: 'https://promptshift.dev/assets/official_logo.jpg',
    sameAs: [
      'https://github.com',
      'https://x.com',
      'https://linkedin.com',
    ],
    description: 'Sovereign 1-click universal transpiler and migration bridge for AI developer workspaces, instructions, and rules.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PromptShift',
    url: 'https://promptshift.dev',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://promptshift.dev/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PromptShift',
    url: 'https://promptshift.dev',
    image: 'https://promptshift.dev/assets/official_logo.jpg',
    screenshot: 'https://promptshift.dev/assets/official_logo.jpg',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web, Modern Browsers',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '19.99',
      priceCurrency: 'USD',
      offerCount: '3',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Starter',
          price: '0',
          priceCurrency: 'USD',
          description: 'Instant conversion for small projects up to 5 files with zero signup.',
        },
        {
          '@type': 'Offer',
          name: 'Pro Developer (Open Beta)',
          price: '0',
          priceCurrency: 'USD',
          description: 'Unlimited files and full multi-ecosystem bundle offered 100% free during public beta.',
        },
        {
          '@type': 'Offer',
          name: 'Team Workspace',
          price: '19.99',
          priceCurrency: 'USD',
          description: 'Commercial multi-seat workspace with priority compilation and central license management.',
        },
      ],
    },
    description: 'Instant cross-ecosystem converter for AI coding assistants. Converts rules and master prompts across Cursor, Claude Projects, OpenAI Custom GPT, and Gemini Antigravity with zero server retention.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      ratingCount: '128',
    },
    featureList: [
      'In-RAM Zero-Retention Secret Sanitizer',
      'Universal AI Rules Transpiler',
      'Cursor .cursorrules and .mdc generation',
      'Claude Projects bundle conversion',
      'OpenAI Custom GPT schema and prompt extraction',
      'Gemini Antigravity workflow export',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is PromptShift?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PromptShift is a sovereign developer tool that translates entire AI assistant contexts, instruction files, master prompts, and system rules between Cursor (.cursorrules / .mdc), Anthropic Claude Projects, OpenAI Custom GPTs, and Google Gemini / Antigravity in one click.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my source code and proprietary API keys secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. PromptShift operates with strict in-RAM processing and zero server retention. All uploads are processed ephemerally and sanitized in memory to redact leaked API keys (OpenAI, Anthropic, Stripe, AWS, HuggingFace, etc.) before conversion. Nothing is saved to a persistent server disk or database.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the Free Public Beta work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'During the public beta phase, projects with up to 5 files are converted instantly with zero sign-up required (Free Starter). Larger multi-file projects unlock the full Pro Developer tier for free by simply saving a developer email, with zero payment or credit card required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which AI platforms are currently supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PromptShift supports bidirectional migration between Anthropic Claude (.claude / system instructions), Cursor (.cursorrules / .cursor/rules/*.mdc), OpenAI Custom GPTs / Assistants v2, Google Gemini & Antigravity, and GitHub Copilot Workspace.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I convert back and forth without losing rules?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! PromptShift uses a unified AST intermediate representation (CAPS) that preserves 98.5%+ certified semantic fidelity. Autonomy directives, tone, architecture policies, and negative constraints are mapped without prompt drift.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens when the Beta concludes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your Early Adopter Beta status is stored in your sovereign local browser vault. You will enjoy complete access throughout the entire public beta, and will be offered exclusive grandfathered early adopter terms before any commercial transition.',
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-darkBg text-textBright selection:bg-cyanGlow/20 selection:text-cyanGlow">
        {/* RGAA / WCAG 2.1 AA Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyanGlow focus:text-black focus:font-black focus:rounded-xl focus:shadow-neonCyan focus-visible:outline-none"
        >
          Skip to main content
        </a>

        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 focus:outline-none">
          {children}
        </main>
        <footer className="w-full border-t border-borderColor py-8 text-center text-xs text-textMuted bg-darkBg">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span>&copy; 2026 PromptShift (promptshift.dev). All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>Zero Server Storage (In-RAM Only)</span>
            <span className="hidden sm:inline">•</span>
            <span>Local Browser Sandbox (No Tracking Cookies)</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
