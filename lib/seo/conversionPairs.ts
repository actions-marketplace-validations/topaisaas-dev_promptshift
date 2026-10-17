export interface ConversionPairData {
  slug: string;
  sourceKey: 'cursor' | 'claude' | 'openai' | 'gemini' | 'antigravity';
  targetKey: 'cursor' | 'claude' | 'openai' | 'gemini';
  sourceName: string;
  targetName: string;
  title: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  sourceFiles: string[];
  targetFiles: string[];
  astParity: string;
  heroHighlight: string;
  keyBenefits: string[];
  mappingHighlights: { sourceFeature: string; targetFeature: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const CONVERSION_PAIRS: Record<string, ConversionPairData> = {
  'cursor-to-claude': {
    slug: 'cursor-to-claude',
    sourceKey: 'cursor',
    targetKey: 'claude',
    sourceName: 'Cursor',
    targetName: 'Anthropic Claude',
    title: 'Convert Cursor Rules to Claude Projects (.cursorrules to CLAUDE.md) | PromptShift',
    metaDescription: 'Instantly migrate Cursor .cursorrules and .mdc guidelines to Anthropic Claude Projects (CLAUDE.md). 98.5% AST semantic fidelity, zero server retention.',
    h1: 'Convert Cursor Rules to Anthropic Claude Projects',
    tagline: 'Port your .cursorrules, .cursor/rules/*.mdc, and workspace instructions into Claude-compatible CLAUDE.md and project XML in seconds.',
    sourceFiles: ['.cursorrules', '.cursor/rules/*.mdc', '.cursor/settings.json'],
    targetFiles: ['CLAUDE.md', 'claude_project_instructions.xml', '.claude/mcp.json', '.claude/rules/*.md'],
    astParity: '98.5%',
    heroHighlight: 'Zero Prompt Drift across Cursor & Claude Projects',
    keyBenefits: [
      'Preserves multi-rule globs and maps them to modular Claude instructions',
      'Translates autonomous directives into Claude-native XML execution blocks',
      'Configures local filesystem MCP server in .claude/mcp.json automatically',
      'In-RAM secret sanitizer redacts leaked OpenAI, Anthropic, and Stripe keys',
    ],
    mappingHighlights: [
      { sourceFeature: 'Root .cursorrules', targetFeature: 'CLAUDE.md', description: 'Transpiles single-file instructions with high-priority markdown hierarchy' },
      { sourceFeature: 'Modular .cursor/rules/*.mdc', targetFeature: '.claude/rules/*.md', description: 'Maintains scoped rules with automated frontmatter adaptation' },
      { sourceFeature: 'Cursor Agent Mode directives', targetFeature: '<autonomy_policy> XML block', description: 'Ensures Claude Code runs in autonomous execution mode' },
    ],
    faqs: [
      {
        question: 'How do I migrate my Cursor project to Anthropic Claude?',
        answer: 'Upload your project folder or .cursorrules file to PromptShift, select Anthropic Claude as your destination platform, and download your ready-to-use CLAUDE.md and XML instructions package in one click.',
      },
      {
        question: 'Will my custom Cursor rules and globs be preserved in Claude?',
        answer: 'Yes. PromptShift maps Cursor MDC globs into structured Claude markdown rules and project XML contexts, retaining 98.5% certified semantic fidelity.',
      },
      {
        question: 'Does Claude support Cursor MCP servers?',
        answer: 'Yes! PromptShift generates a pre-configured .claude/mcp.json file compatible with Claude Desktop and Claude Code CLI.',
      },
      {
        question: 'Is my proprietary code stored on PromptShift servers?',
        answer: 'Never. PromptShift executes 100% in-RAM with zero server retention, zero persistent storage, and automatic secret redaction.',
      },
    ],
  },

  'claude-to-cursor': {
    slug: 'claude-to-cursor',
    sourceKey: 'claude',
    targetKey: 'cursor',
    sourceName: 'Anthropic Claude',
    targetName: 'Cursor',
    title: 'Convert Claude Projects to Cursor Rules (CLAUDE.md to .cursorrules) | PromptShift',
    metaDescription: 'Shift Claude Projects and CLAUDE.md instructions into Cursor .cursorrules and modern .cursor/rules/*.mdc format with 98.5% AST parity.',
    h1: 'Convert Claude Projects to Cursor Rules',
    tagline: 'Transform Claude Project instructions and XML guidelines into high-performance Cursor rules and .mdc multi-rule architecture.',
    sourceFiles: ['CLAUDE.md', 'claude_project_instructions.xml', '.claude/rules/*.md'],
    targetFiles: ['.cursorrules', '.cursor/rules/*.mdc', '.windsurfrules', '.cursor/settings.json'],
    astParity: '98.5%',
    heroHighlight: 'Instant .mdc Multi-Rule Generation from Claude XML',
    keyBenefits: [
      'Extracts XML directives into clean, token-optimized Cursor markdown rules',
      'Generates modern .cursor/rules/*.mdc files with glob auto-detection',
      'Provides full Windsurf compatibility (.windsurfrules) at no extra cost',
      'Zero server storage with client-side SHA-256 verification',
    ],
    mappingHighlights: [
      { sourceFeature: 'CLAUDE.md & XML tags', targetFeature: '.cursorrules', description: 'Strips XML overhead and reformats instructions for Cursor fast reasoning' },
      { sourceFeature: 'Claude Project Knowledge Base', targetFeature: 'Cursor Context Index', description: 'Structures documentation for sub-second retrieval' },
      { sourceFeature: 'Claude Code CLI rules', targetFeature: '.cursor/rules/*.mdc', description: 'Creates modular scoped rules for specific file patterns' },
    ],
    faqs: [
      {
        question: 'Can I use my existing Claude Project instructions in Cursor?',
        answer: 'Yes. PromptShift parses your Claude Project XML instructions and CLAUDE.md files, converting them into optimized .cursorrules and modern .mdc modular rules.',
      },
      {
        question: 'What happens to Claude XML tags in Cursor?',
        answer: 'PromptShift transpiles XML structure into clean, dense markdown headings and directive bullets that Cursor LLM engines interpret with maximum priority.',
      },
      {
        question: 'Is .cursor/rules/*.mdc generated automatically?',
        answer: 'Yes, PromptShift splits modular Claude instructions into individual .mdc files with appropriate frontmatter and glob rules.',
      },
      {
        question: 'How fast is the conversion?',
        answer: 'Conversions take less than 1 second in your browser via our lightweight in-RAM WASM transpilation engine.',
      },
    ],
  },

  'gemini-to-cursor': {
    slug: 'gemini-to-cursor',
    sourceKey: 'gemini',
    targetKey: 'cursor',
    sourceName: 'Google Gemini & Antigravity',
    targetName: 'Cursor',
    title: 'Migrate Google Gemini & Antigravity to Cursor (.cursorrules) | PromptShift',
    metaDescription: 'Convert Google Gemini and Antigravity GEMINI.md / AGENTS.md workspaces to Cursor .cursorrules and .mdc multi-rules in 1 click.',
    h1: 'Migrate Google Gemini & Antigravity to Cursor',
    tagline: 'Port your GEMINI.md, AGENTS.md, and Antigravity subagent skills into native Cursor rules with zero prompt drift.',
    sourceFiles: ['GEMINI.md', 'AGENTS.md', '.agents/rules/*.md'],
    targetFiles: ['.cursorrules', '.cursor/rules/*.mdc', '.cursor/settings.json'],
    astParity: '98.5%',
    heroHighlight: 'Preserve DeepMind Autonomy Directives in Cursor',
    keyBenefits: [
      'Full preservation of unconditional autonomy and task execution directives',
      'Translates .agents/rules/ into modern Cursor .cursor/rules/*.mdc files',
      'Enables Cursor agent mode settings in .cursor/settings.json',
      'Sanitizes any embedded Google Cloud or Gemini API keys in RAM',
    ],
    mappingHighlights: [
      { sourceFeature: 'GEMINI.md / AGENTS.md', targetFeature: '.cursorrules', description: 'Maps master system prompts to Cursor core identity and operating principles' },
      { sourceFeature: 'Antigravity Skills & Rules', targetFeature: '.cursor/rules/*.mdc', description: 'Converts specialized skill instructions into Cursor context rules' },
      { sourceFeature: 'Autonomy & Permission Grants', targetFeature: 'Cursor Agent Mode Directives', description: 'Ensures Cursor executes autonomously without repetitive confirmation' },
    ],
    faqs: [
      {
        question: 'How do I port an Antigravity project to Cursor?',
        answer: 'Drag and drop your Antigravity repository folder (including GEMINI.md and AGENTS.md) into PromptShift, select Cursor, and download the resulting .cursorrules bundle.',
      },
      {
        question: 'Does Cursor support Antigravity unconditional autonomy?',
        answer: 'PromptShift synthesizes your Antigravity autonomy clauses into explicit Cursor Agent directives that minimize user prompts.',
      },
      {
        question: 'Are my Gemini API keys safe during migration?',
        answer: 'Yes. PromptShift includes an active in-RAM secret sanitizer that redacts all AI keys before transpilation.',
      },
      {
        question: 'What is the cost to migrate?',
        answer: 'Projects up to 2 files are free. Full single project passes are $1.99, or $5.99/mo for unlimited Pro conversions.',
      },
    ],
  },

  'cursor-to-gemini': {
    slug: 'cursor-to-gemini',
    sourceKey: 'cursor',
    targetKey: 'gemini',
    sourceName: 'Cursor',
    targetName: 'Google Gemini & Antigravity',
    title: 'Export Cursor Rules to Google Gemini & Antigravity (GEMINI.md) | PromptShift',
    metaDescription: 'Transpile Cursor .cursorrules into Google Gemini and Antigravity GEMINI.md & AGENTS.md files with verified AST parity.',
    h1: 'Export Cursor Rules to Google Gemini & Antigravity',
    tagline: 'Take your Cursor workflow to Google Antigravity with full AGENTS.md and GEMINI.md generation.',
    sourceFiles: ['.cursorrules', '.cursor/rules/*.mdc'],
    targetFiles: ['GEMINI.md', 'AGENTS.md', '.agents/rules/*.md'],
    astParity: '98.5%',
    heroHighlight: 'Native Google Antigravity 2.0 Compatibility',
    keyBenefits: [
      'Generates official GEMINI.md and AGENTS.md files adhering to Antigravity standards',
      'Converts Cursor rules into modular .agents/rules/ hierarchy',
      'In-RAM zero retention ensuring proprietary code never hits third-party servers',
      'Instant ZIP download ready to drop into Antigravity workspaces',
    ],
    mappingHighlights: [
      { sourceFeature: '.cursorrules', targetFeature: 'GEMINI.md & AGENTS.md', description: 'Establishes primary persona, role directives, and agent execution policies' },
      { sourceFeature: '.cursor/rules/*.mdc', targetFeature: '.agents/rules/*.md', description: 'Translates scoped MDC files into modular Antigravity rule sets' },
      { sourceFeature: 'Cursor settings', targetFeature: 'Antigravity workspace config', description: 'Configures tool auto-approval and agent behavior' },
    ],
    faqs: [
      {
        question: 'How do I convert Cursor rules to Google Antigravity?',
        answer: 'Upload your .cursorrules file or project root to PromptShift, choose Google Gemini / Antigravity as the target, and download the ready-to-run GEMINI.md bundle.',
      },
      {
        question: 'Does Antigravity use both GEMINI.md and AGENTS.md?',
        answer: 'Yes. PromptShift generates both files to guarantee forward and backward compatibility across Google AI studio and Antigravity IDE environments.',
      },
      {
        question: 'Can I convert large enterprise Cursor setups?',
        answer: 'Yes. PromptShift Pro and Team tiers handle multi-file setups, extensive rule libraries, and custom scripts.',
      },
      {
        question: 'Is my code sent to Google or third parties?',
        answer: 'No. PromptShift operates 100% in-RAM with zero server logging or persistent storage.',
      },
    ],
  },

  'openai-to-cursor': {
    slug: 'openai-to-cursor',
    sourceKey: 'openai',
    targetKey: 'cursor',
    sourceName: 'OpenAI Custom GPT',
    targetName: 'Cursor',
    title: 'Convert OpenAI Custom GPT to Cursor (.cursorrules) | PromptShift',
    metaDescription: 'Migrate OpenAI Custom GPT instructions and Assistant v2 schemas into Cursor .cursorrules and .mdc guidelines in 1 click.',
    h1: 'Convert OpenAI Custom GPT to Cursor',
    tagline: 'Bring your Custom GPT persona, system prompts, and function calling tools into Cursor IDE.',
    sourceFiles: ['custom_gpt_instructions.txt', 'custom_gpt_manifest.json', 'openai_assistant_v2.json'],
    targetFiles: ['.cursorrules', '.cursor/rules/*.mdc', '.cursor/settings.json'],
    astParity: '98.5%',
    heroHighlight: 'Extract Custom GPT Knowledge & Prompts to Cursor',
    keyBenefits: [
      'Extracts dense system prompts and formats them for Cursor fast code generation',
      'Preserves negative constraints and style guidelines without drift',
      'Zero server storage with client-side SHA-256 validation',
      'Generates .windsurfrules simultaneously for dual IDE support',
    ],
    mappingHighlights: [
      { sourceFeature: 'Custom GPT Instructions', targetFeature: '.cursorrules', description: 'Formats conversational prompts into concise developer-oriented rules' },
      { sourceFeature: 'OpenAI Actions / Functions', targetFeature: 'Cursor MCP / Tools', description: 'Converts function calling definitions into tool specifications' },
      { sourceFeature: 'GPT Knowledge Base files', targetFeature: 'Cursor Project Docs', description: 'Preserves all uploaded markdown and text documentation' },
    ],
    faqs: [
      {
        question: 'Can I export my Custom GPT instructions directly into Cursor?',
        answer: 'Yes. Paste your Custom GPT system prompt or manifest into PromptShift, and get an optimized .cursorrules configuration in seconds.',
      },
      {
        question: 'How does PromptShift handle OpenAI function calling tools?',
        answer: 'Function calling schemas are mapped to tool configurations and markdown references that Cursor agents understand.',
      },
      {
        question: 'Is my OpenAI API key protected?',
        answer: 'PromptShift actively scans for and redacts sk-proj-* and related keys in RAM before file creation.',
      },
      {
        question: 'What is the pricing?',
        answer: 'Free Starter for up to 2 files. $1.99 for a single full pass, or $5.99/mo for unlimited Pro migrations.',
      },
    ],
  },

  'cursor-to-openai': {
    slug: 'cursor-to-openai',
    sourceKey: 'cursor',
    targetKey: 'openai',
    sourceName: 'Cursor',
    targetName: 'OpenAI Custom GPT',
    title: 'Port Cursor Rules to OpenAI Custom GPT & Assistants v2 | PromptShift',
    metaDescription: 'Transform Cursor .cursorrules into OpenAI Custom GPT instructions, assistant manifests, and function calling schemas.',
    h1: 'Port Cursor Rules to OpenAI Custom GPT & Assistants',
    tagline: 'Deploy your battle-tested Cursor coding rules as an OpenAI Custom GPT or Assistants API v2 agent.',
    sourceFiles: ['.cursorrules', '.cursor/rules/*.mdc'],
    targetFiles: ['OPENAI_SYSTEM_PROMPT.md', 'custom_gpt_instructions.txt', 'custom_gpt_manifest.json', 'openai_assistant_v2.json'],
    astParity: '98.5%',
    heroHighlight: '1-Click OpenAI Assistant v2 API Manifest Ready',
    keyBenefits: [
      'Generates custom_gpt_manifest.json with conversation starters ready to paste',
      'Creates openai_assistant_v2.json with code_interpreter and file_search enabled',
      'Optimizes prompt token length for GPT-4o, o1, and o3 reasoning models',
      'Redacts private environment variables and API tokens automatically',
    ],
    mappingHighlights: [
      { sourceFeature: '.cursorrules', targetFeature: 'custom_gpt_instructions.txt', description: 'Condenses coding rules into conversational instructions' },
      { sourceFeature: 'Cursor context rules', targetFeature: 'OpenAI Assistant v2 Spec', description: 'Enables assistant tools and file search integration' },
      { sourceFeature: 'Cursor autonomy directives', targetFeature: 'Autonomous Policy section', description: 'Instructs GPT to execute proactively without boilerplate confirmations' },
    ],
    faqs: [
      {
        question: 'How do I turn my .cursorrules into an OpenAI Custom GPT?',
        answer: 'Upload your .cursorrules to PromptShift, choose OpenAI as the target, and download custom_gpt_instructions.txt and manifest.json ready for the GPT builder.',
      },
      {
        question: 'Does this work with the OpenAI Assistants API v2?',
        answer: 'Yes! PromptShift produces an official openai_assistant_v2.json schema ready to be used with the OpenAI SDK.',
      },
      {
        question: 'Does it support GPT-4o and o1 reasoning models?',
        answer: 'Yes, instructions are optimized for both reasoning and standard generation models.',
      },
      {
        question: 'Where is my data processed?',
        answer: '100% in-RAM on your browser and edge server, with zero database storage.',
      },
    ],
  },

  'claude-to-openai': {
    slug: 'claude-to-openai',
    sourceKey: 'claude',
    targetKey: 'openai',
    sourceName: 'Anthropic Claude',
    targetName: 'OpenAI Custom GPT',
    title: 'Convert Claude Projects to OpenAI Custom GPT | PromptShift',
    metaDescription: 'Shift Claude Projects and CLAUDE.md guidelines into OpenAI Custom GPT instructions and Assistant v2 schemas in 1 click.',
    h1: 'Convert Claude Projects to OpenAI Custom GPT',
    tagline: 'Migrate your Claude Project instructions, XML prompts, and knowledge base into OpenAI Custom GPTs effortlessly.',
    sourceFiles: ['CLAUDE.md', 'claude_project_instructions.xml'],
    targetFiles: ['OPENAI_SYSTEM_PROMPT.md', 'custom_gpt_instructions.txt', 'custom_gpt_manifest.json', 'openai_assistant_v2.json'],
    astParity: '98.5%',
    heroHighlight: 'Seamless XML-to-OpenAI Prompt Decompilation',
    keyBenefits: [
      'Decompiles Claude XML prompt tags into OpenAI system message standards',
      'Formats conversation starters and capability toggles automatically',
      'Prepares clean assistant manifests for team deployment',
      'Strict in-RAM processing with zero server retention',
    ],
    mappingHighlights: [
      { sourceFeature: '<instructions> XML block', targetFeature: 'OPENAI_SYSTEM_PROMPT.md', description: 'Transforms structured XML into GPT-4o optimized markdown' },
      { sourceFeature: 'Claude Project Knowledge', targetFeature: 'OpenAI Vector Store Files', description: 'Packages documentation files for assistant file search' },
      { sourceFeature: 'CLAUDE.md workspace rules', targetFeature: 'Active Constraints list', description: 'Maintains critical coding guidelines without prompt drift' },
    ],
    faqs: [
      {
        question: 'Can I convert Claude Project instructions to OpenAI Custom GPT?',
        answer: 'Yes, PromptShift removes Claude XML wrappers and tailors the prompt hierarchy for OpenAI GPT models.',
      },
      {
        question: 'Will my project documentation files be preserved?',
        answer: 'Yes, all knowledge files in your upload are cleaned and bundled into the export ZIP.',
      },
      {
        question: 'Does it support Assistants v2?',
        answer: 'Yes, an openai_assistant_v2.json configuration is automatically created.',
      },
      {
        question: 'Is my data secure?',
        answer: 'PromptShift uses in-RAM execution with zero server retention and automatic secret redaction.',
      },
    ],
  },

  'openai-to-claude': {
    slug: 'openai-to-claude',
    sourceKey: 'openai',
    targetKey: 'claude',
    sourceName: 'OpenAI Custom GPT',
    targetName: 'Anthropic Claude',
    title: 'Port OpenAI Custom GPT to Claude Projects (CLAUDE.md) | PromptShift',
    metaDescription: 'Convert OpenAI Custom GPT prompts into Anthropic Claude Projects and CLAUDE.md instructions with verified 98.5% fidelity.',
    h1: 'Port OpenAI Custom GPT to Claude Projects',
    tagline: 'Upgrade your OpenAI Custom GPT into an Anthropic Claude Project with full XML structure and CLAUDE.md support.',
    sourceFiles: ['custom_gpt_instructions.txt', 'openai_assistant_v2.json'],
    targetFiles: ['CLAUDE.md', 'claude_project_instructions.xml', '.claude/mcp.json'],
    astParity: '98.5%',
    heroHighlight: 'Automatic Claude XML Tagging & MCP Integration',
    keyBenefits: [
      'Wraps instructions into Claude-recommended <project_context> XML format',
      'Generates CLAUDE.md with clear markdown sections for Claude Code CLI',
      'Includes .claude/mcp.json for Model Context Protocol filesystem integration',
      'In-RAM secret redaction prevents accidental credential leaks',
    ],
    mappingHighlights: [
      { sourceFeature: 'Custom GPT System Prompt', targetFeature: '<instructions> XML tag', description: 'Structures instructions into Anthropic prompt engineering standards' },
      { sourceFeature: 'GPT Knowledge Base', targetFeature: 'Claude Project Knowledge Base', description: 'Optimizes documentation for Claude large context windows' },
      { sourceFeature: 'OpenAI Function Calling', targetFeature: '.claude/mcp.json', description: 'Converts functions to modern Model Context Protocol format' },
    ],
    faqs: [
      {
        question: 'How do I migrate an OpenAI Custom GPT to Claude Projects?',
        answer: 'Upload your OpenAI instructions or assistant JSON to PromptShift, choose Claude, and download your CLAUDE.md and XML instruction bundle.',
      },
      {
        question: 'Why does PromptShift generate XML for Claude?',
        answer: 'Anthropic recommends XML tags (<project_context>, <instructions>, <rules>) to maximize prompt comprehension and minimize hallucination.',
      },
      {
        question: 'Is .claude/mcp.json included?',
        answer: 'Yes, an MCP filesystem configuration is generated automatically.',
      },
      {
        question: 'How much does it cost?',
        answer: 'Free for projects up to 2 files. $1.99 for a single project pass or $5.99/mo for unlimited Pro migrations.',
      },
    ],
  },

  'antigravity-to-claude': {
    slug: 'antigravity-to-claude',
    sourceKey: 'antigravity',
    targetKey: 'claude',
    sourceName: 'Google Antigravity',
    targetName: 'Anthropic Claude',
    title: 'Migrate Google Antigravity to Claude Projects (CLAUDE.md) | PromptShift',
    metaDescription: 'Transpile Google Antigravity GEMINI.md & AGENTS.md workspaces to Anthropic Claude Projects and CLAUDE.md in 1 click.',
    h1: 'Migrate Google Antigravity to Claude Projects',
    tagline: 'Bring your Google Antigravity autonomous agent rules and skills into Anthropic Claude Projects and Claude Code.',
    sourceFiles: ['GEMINI.md', 'AGENTS.md', '.agents/rules/*.md'],
    targetFiles: ['CLAUDE.md', 'claude_project_instructions.xml', '.claude/mcp.json', '.claude/rules/*.md'],
    astParity: '98.5%',
    heroHighlight: 'Preserve Full Autonomy Clauses in Claude XML',
    keyBenefits: [
      'Maps unconditional autonomy directives into Claude <autonomy_policy> blocks',
      'Transpiles .agents/rules/ into modular .claude/rules/*.md files',
      'Generates CLAUDE.md for Claude Code CLI and web project instructions',
      'Zero server logs with ephemeral in-RAM execution',
    ],
    mappingHighlights: [
      { sourceFeature: 'AGENTS.md / GEMINI.md', targetFeature: 'CLAUDE.md', description: 'Transpiles agent master prompt and execution guidelines' },
      { sourceFeature: 'Unconditional Autonomy rule', targetFeature: '<autonomy_policy> XML tag', description: 'Instructs Claude Code to execute proactively without confirmation prompts' },
      { sourceFeature: 'Specialized Agent Skills', targetFeature: '.claude/mcp.json & rules', description: 'Maps skill triggers to Claude MCP servers and modular rules' },
    ],
    faqs: [
      {
        question: 'How do I move my Antigravity workspace to Claude Projects?',
        answer: 'Upload your Antigravity project folder to PromptShift, choose Claude, and download your ready-to-run CLAUDE.md and XML bundle.',
      },
      {
        question: 'Does Claude Code respect Antigravity autonomy rules?',
        answer: 'Yes, PromptShift translates your autonomy clause into an explicit execution directive in CLAUDE.md and XML.',
      },
      {
        question: 'Are leaked Google API keys redacted?',
        answer: 'Yes, our in-RAM sanitizer strips API keys and secrets before any file generation.',
      },
      {
        question: 'Is my proprietary code stored?',
        answer: 'Never. PromptShift runs 100% in-RAM with zero server retention.',
      },
    ],
  },

  'claude-to-antigravity': {
    slug: 'claude-to-antigravity',
    sourceKey: 'claude',
    targetKey: 'gemini',
    sourceName: 'Anthropic Claude',
    targetName: 'Google Antigravity',
    title: 'Export Claude Projects to Google Antigravity (GEMINI.md & AGENTS.md) | PromptShift',
    metaDescription: 'Convert Claude Projects, CLAUDE.md, and .claude rules to Google Antigravity GEMINI.md and AGENTS.md in 1 click.',
    h1: 'Export Claude Projects to Google Antigravity',
    tagline: 'Port your Claude Project instructions and modular rules into Google Antigravity 2.0 with full fidelity.',
    sourceFiles: ['CLAUDE.md', 'claude_project_instructions.xml', '.claude/rules/*.md'],
    targetFiles: ['GEMINI.md', 'AGENTS.md', '.agents/rules/*.md'],
    astParity: '98.5%',
    heroHighlight: 'Native Antigravity 2.0 Structure Generation',
    keyBenefits: [
      'Creates official GEMINI.md and AGENTS.md with verified syntax',
      'Transforms modular Claude rules into .agents/rules/ hierarchy',
      'Preserves tone, coding guidelines, and project architecture notes',
      '100% in-RAM ephemeral conversion with zero data retention',
    ],
    mappingHighlights: [
      { sourceFeature: 'CLAUDE.md', targetFeature: 'GEMINI.md & AGENTS.md', description: 'Converts Claude instructions into Antigravity master directives' },
      { sourceFeature: '.claude/rules/*.md', targetFeature: '.agents/rules/*.md', description: 'Maintains scoped rules in Antigravity directory structure' },
      { sourceFeature: 'Claude autonomy guidelines', targetFeature: 'Antigravity Autonomous Directive', description: 'Sets agent execution permissions for proactive development' },
    ],
    faqs: [
      {
        question: 'How do I convert a Claude Project to Google Antigravity?',
        answer: 'Upload your CLAUDE.md or project folder to PromptShift, select Google Gemini / Antigravity, and download your GEMINI.md and AGENTS.md package.',
      },
      {
        question: 'Does Antigravity support multi-rule structures?',
        answer: 'Yes, PromptShift maps your modular rules into the .agents/rules/ directory recognized by Antigravity.',
      },
      {
        question: 'Is this compatible with Antigravity 2.0?',
        answer: 'Yes, the generated files adhere strictly to the latest Antigravity 2.0 specifications.',
      },
      {
        question: 'What is the pricing model?',
        answer: 'Free for small projects up to 2 files. $1.99 Single Migration Pass, or $5.99/mo for unlimited Pro access.',
      },
    ],
  },

  'antigravity-to-cursor': {
    slug: 'antigravity-to-cursor',
    sourceKey: 'antigravity',
    targetKey: 'cursor',
    sourceName: 'Google Antigravity',
    targetName: 'Cursor',
    title: 'Convert Google Antigravity to Cursor Rules (.cursorrules & .mdc) | PromptShift',
    metaDescription: 'Transpile Google Antigravity GEMINI.md and AGENTS.md to Cursor .cursorrules and modern .cursor/rules/*.mdc in 1 click.',
    h1: 'Convert Google Antigravity to Cursor Rules',
    tagline: 'Port your Google Antigravity agent configuration and skill rules into high-performance Cursor rules.',
    sourceFiles: ['GEMINI.md', 'AGENTS.md', '.agents/rules/*.md'],
    targetFiles: ['.cursorrules', '.cursor/rules/*.mdc', '.windsurfrules', '.cursor/settings.json'],
    astParity: '98.5%',
    heroHighlight: 'Full MDC Multi-Rule Mapping from Antigravity Rules',
    keyBenefits: [
      'Translates .agents/rules/ directly to .cursor/rules/*.mdc with glob detection',
      'Configures Cursor Agent Mode in .cursor/settings.json',
      'Includes .windsurfrules for full Windsurf IDE compatibility',
      'Zero server storage with client-side SHA-256 verification',
    ],
    mappingHighlights: [
      { sourceFeature: 'AGENTS.md & GEMINI.md', targetFeature: '.cursorrules', description: 'Synthesizes master directives into high-priority Cursor rules' },
      { sourceFeature: '.agents/rules/*.md', targetFeature: '.cursor/rules/*.mdc', description: 'Creates modular Cursor MDC rules with frontmatter' },
      { sourceFeature: 'Autonomy Directive', targetFeature: 'Cursor Agent Policy', description: 'Ensures proactive execution without constant permission prompts' },
    ],
    faqs: [
      {
        question: 'How do I migrate from Antigravity to Cursor?',
        answer: 'Upload your Antigravity project folder to PromptShift, choose Cursor, and download the resulting .cursorrules and .mdc bundle.',
      },
      {
        question: 'Will my custom agent rules be separated into .mdc files?',
        answer: 'Yes, PromptShift creates individual .cursor/rules/*.mdc files for each rule in your .agents/rules directory.',
      },
      {
        question: 'Does it work with Windsurf as well?',
        answer: 'Yes, a .windsurfrules file is generated simultaneously for Windsurf compatibility.',
      },
      {
        question: 'Is my source code secure?',
        answer: 'Yes, all processing occurs in-RAM with zero server retention or third-party storage.',
      },
    ],
  },

  'gemini-to-claude': {
    slug: 'gemini-to-claude',
    sourceKey: 'gemini',
    targetKey: 'claude',
    sourceName: 'Google Gemini & Antigravity',
    targetName: 'Anthropic Claude',
    title: 'Convert Google Gemini & Antigravity to Claude Projects (CLAUDE.md) | PromptShift',
    metaDescription: 'Convert Google Gemini instructions and Antigravity GEMINI.md to Anthropic Claude Projects and CLAUDE.md with 98.5% fidelity.',
    h1: 'Convert Google Gemini & Antigravity to Claude Projects',
    tagline: 'Translate Google Gemini prompts, GEMINI.md, and Antigravity agents into Claude-ready CLAUDE.md and XML instructions.',
    sourceFiles: ['GEMINI.md', 'AGENTS.md', '.agents/rules/*.md'],
    targetFiles: ['CLAUDE.md', 'claude_project_instructions.xml', '.claude/mcp.json', '.claude/rules/*.md'],
    astParity: '98.5%',
    heroHighlight: 'Seamless Claude XML Architecture from Gemini Prompts',
    keyBenefits: [
      'Generates strict XML formatted instructions for Claude Projects web UI',
      'Produces CLAUDE.md optimized for Claude Code terminal assistant',
      'Automatic .claude/mcp.json filesystem configuration',
      'In-RAM secret redaction protecting all sensitive tokens',
    ],
    mappingHighlights: [
      { sourceFeature: 'GEMINI.md / AGENTS.md', targetFeature: 'CLAUDE.md', description: 'Structures instructions into Claude standard markdown format' },
      { sourceFeature: 'Antigravity Execution Directives', targetFeature: '<autonomy_policy> XML block', description: 'Maintains autonomous task execution in Claude' },
      { sourceFeature: '.agents/rules/ hierarchy', targetFeature: '.claude/rules/*.md', description: 'Transpiles modular rules into Claude-compatible scoped files' },
    ],
    faqs: [
      {
        question: 'Can I convert my Gemini instructions to Claude Projects?',
        answer: 'Yes, PromptShift converts Gemini prompts and Antigravity configs into Claude XML instructions and CLAUDE.md files.',
      },
      {
        question: 'Does it support Claude Code CLI?',
        answer: 'Yes, the generated CLAUDE.md file is explicitly tailored for the Claude Code CLI tool.',
      },
      {
        question: 'Are my Gemini credentials safe?',
        answer: 'PromptShift strips all Gemini and GCP API keys in RAM before file creation.',
      },
      {
        question: 'What are the subscription plans?',
        answer: 'Free Starter for up to 2 files. $1.99 Single Migration Pass, or $5.99/mo Pro Developer with unlimited conversions.',
      },
    ],
  },
};
