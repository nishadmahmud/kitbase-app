// Mirror of web app's categories and tools (app/lib/toolsRegistry.js) with icon names for Lucide.

export const categories = [
  {
    slug: 'pdf',
    name: 'PDF Tools',
    description:
      'Edit, convert, and manage PDF files easily with our suite of powerful document tools.',
    iconName: 'FileText',
    color: '#4f8cff',
    tags: ['Merge', 'Split', 'Compress', 'Convert'],
  },
  {
    slug: 'image',
    name: 'Image Tools',
    description: 'Resize, compress, and convert images with browser-based processing.',
    iconName: 'Image',
    color: '#a78bfa',
    tags: ['Resize', 'Crop', 'Filters', 'Conversion'],
  },
  {
    slug: 'dev',
    name: 'Developer Tools',
    description: 'Utilities for formatting, encoding, and data manipulation.',
    iconName: 'Braces',
    color: '#34d399',
    tags: ['JSON', 'Markdown', 'Base64', 'SQL'],
  },
  {
    slug: 'calculator',
    name: 'Calculators',
    description: 'Quick calculation tools for everyday academic and professional needs.',
    iconName: 'GraduationCap',
    color: '#fbbf24',
    tags: ['Unit', 'Currency', 'Percentage', 'Math'],
  },
  {
    slug: 'text',
    name: 'Text Tools',
    description: 'Analyze, format, and manipulate text strings with powerful utilities.',
    iconName: 'FileText',
    color: '#f472b6',
    tags: ['Count', 'Format', 'Clean', 'Generate'],
  },
  {
    slug: 'design',
    name: 'Design Tools',
    description: 'Create and fine-tune your designs with color, gradient, and CSS utilities.',
    iconName: 'Palette',
    color: '#818cf8',
    tags: ['Color', 'CSS', 'Gradient', 'Contrast'],
  },
  {
    slug: 'security',
    name: 'Security Tools',
    description: 'Generate secure passwords, tokens, and hashes to protect your data.',
    iconName: 'Shield',
    color: '#ef4444',
    tags: ['Password', 'Hash', 'Token', 'UUID'],
  },
  {
    slug: 'productivity',
    name: 'Productivity',
    description: 'Boost your efficiency with timers, clocks, and focus tools.',
    iconName: 'Timer',
    color: '#f59e0b',
    tags: ['Timer', 'Clock', 'Focus', 'Pomodoro'],
  },
  {
    slug: 'file',
    name: 'File Tools',
    description: 'Analyze, hash, and extract metadata from your files.',
    iconName: 'FileSearch',
    color: '#6b7280',
    tags: ['Metadata', 'Checksum', 'Hash', 'Security'],
  },
  {
    slug: 'visualization',
    name: 'Visualization',
    description: 'Generate charts from CSV files or manual data entry.',
    iconName: 'BarChart',
    color: '#db2777',
    tags: ['Chart', 'Graph', 'Plot', 'CSV'],
  },
];

export const tools = [
  { name: 'Merge PDF', slug: 'merge', category: 'pdf', description: 'Combine multiple PDF files into a single document with ease and speed.', iconName: 'FileText', href: '/tools/pdf/merge', popular: true },
  { name: 'Split PDF', slug: 'split', category: 'pdf', description: 'Separate one page or a whole set for easy conversion and organization.', iconName: 'Scissors', href: '/tools/pdf/split' },
  { name: 'Reorder PDF', slug: 'reorder', category: 'pdf', description: 'Rearrange pages in your PDF document by dragging them into the right order.', iconName: 'ArrowUpDown', href: '/tools/pdf/reorder' },
  { name: 'Compress PDF', slug: 'compress', category: 'pdf', description: 'Reduce the file size of your PDF without losing original document quality.', iconName: 'Archive', href: '/tools/pdf/compress' },
  { name: 'Resize Image', slug: 'resize', category: 'image', description: 'Change image dimensions while maintaining quality and aspect ratio.', iconName: 'Image', href: '/tools/image/resize', popular: true },
  { name: 'Compress Image', slug: 'compress', category: 'image', description: 'Reduce file size of JPG, PNG, and WebP without losing quality.', iconName: 'Shrink', href: '/tools/image/compress', popular: true },
  { name: 'Convert Image', slug: 'convert', category: 'image', description: 'Convert images between JPG, PNG, WebP, and other formats instantly.', iconName: 'RefreshCw', href: '/tools/image/convert' },
  { name: 'Markdown Viewer', slug: 'viewer', category: 'dev', description: 'Live preview and edit your markdown files with real-time rendering.', iconName: 'Eye', href: '/tools/markdown/viewer', popular: true },
  { name: 'Markdown to PDF', slug: 'to-pdf', category: 'dev', description: 'Export your markdown documents to beautifully formatted PDF files.', iconName: 'FileDown', href: '/tools/markdown/to-pdf' },
  { name: 'JSON Formatter', slug: 'json-formatter', category: 'dev', description: 'Prettify and validate complex JSON data for better readability.', iconName: 'Braces', href: '/tools/dev/json-formatter', popular: true },
  { name: 'Base64 Encoder', slug: 'base64', category: 'dev', description: 'Encode and decode Base64 strings quickly in your browser.', iconName: 'Binary', href: '/tools/dev/base64' },
  { name: 'GPA Calculator', slug: 'gpa', category: 'calculator', description: 'Calculate your GPA instantly with our easy-to-use grade calculator.', iconName: 'GraduationCap', href: '/tools/calculator/gpa' },
  { name: 'Percentage Calculator', slug: 'percentage', category: 'calculator', description: 'Quick percentage calculations for discounts, tips, grades, and more.', iconName: 'Percent', href: '/tools/calculator/percentage' },
  { name: 'QR Code Generator', slug: 'qr-code', category: 'dev', description: 'Create customizable QR codes for URLs, Wi-Fi access, and more.', iconName: 'Binary', href: '/tools/dev/qr-code' },
  { name: 'Text Diff', slug: 'diff', category: 'dev', description: 'Compare two text blocks and highlight the differences.', iconName: 'Braces', href: '/tools/dev/diff' },
  { name: 'URL Encoder/Decoder', slug: 'url-encoder', category: 'dev', description: 'Encode or decode URLs to ensure they are safe for transmission.', iconName: 'Link', href: '/tools/dev/url-encoder' },
  { name: 'HTML Entity Encoder', slug: 'html-entities', category: 'dev', description: 'Convert characters to their corresponding HTML entities and vice versa.', iconName: 'Code', href: '/tools/dev/html-entities' },
  { name: 'SQL Formatter', slug: 'sql-formatter', category: 'dev', description: 'Format and beautify your SQL queries for better readability.', iconName: 'Database', href: '/tools/dev/sql-formatter' },
  { name: 'JSON <> CSV', slug: 'json-csv', category: 'dev', description: 'Convert data between JSON and CSV formats instantly.', iconName: 'FileSpreadsheet', href: '/tools/dev/json-csv' },
  { name: 'Regex Tester', slug: 'regex-tester', category: 'dev', description: 'Test and debug JavaScript regular expressions with real-time highlighting.', iconName: 'Regex', href: '/tools/dev/regex-tester' },
  { name: 'XML Formatter', slug: 'xml-formatter', category: 'dev', description: 'Beautify and validate XML data with proper indentation.', iconName: 'FileCode', href: '/tools/dev/xml-formatter' },
  { name: 'PDF to Image', slug: 'to-image', category: 'pdf', description: 'Convert PDF pages into high-quality JPG or PNG images.', iconName: 'FileDown', href: '/tools/pdf/to-image' },
  { name: 'Image to PDF', slug: 'from-image', category: 'pdf', description: 'Convert JPG and PNG images into a single PDF document.', iconName: 'FileText', href: '/tools/pdf/from-image' },
  { name: 'Image Filters', slug: 'filters', category: 'image', description: 'Enhance photos with brightness, contrast, and artistic filters.', iconName: 'RefreshCw', href: '/tools/image/filters' },
  { name: 'Image Cropper', slug: 'crop', category: 'image', description: 'Crop images freely or with fixed aspect ratios.', iconName: 'Scissors', href: '/tools/image/crop' },
  { name: 'Unit Converter', slug: 'unit', category: 'calculator', description: 'Convert values between different units of measurement.', iconName: 'ArrowUpDown', href: '/tools/calculator/unit' },
  { name: 'Word Counter', slug: 'word-counter', category: 'text', description: 'Count words, characters, sentences, and paragraphs in real-time.', iconName: 'FileText', href: '/tools/text/word-counter', popular: true },
  { name: 'Case Converter', slug: 'case-converter', category: 'text', description: 'Convert text to Uppercase, Lowercase, Title Case, CamelCase, and more.', iconName: 'Type', href: '/tools/text/case-converter' },
  { name: 'Text Cleaner', slug: 'cleaner', category: 'text', description: 'Remove extra spaces, duplicate lines, and empty lines from your text.', iconName: 'Eraser', href: '/tools/text/cleaner' },
  { name: 'String Transform', slug: 'transform', category: 'text', description: 'Reverse text, shuffle characters, or repeat strings instantly.', iconName: 'RefreshCw', href: '/tools/text/transform' },
  { name: 'Lorem Ipsum', slug: 'lorem', category: 'text', description: 'Generate placeholder text for your design and development projects.', iconName: 'FileText', href: '/tools/text/lorem' },
  { name: 'Color Converter', slug: 'color-converter', category: 'design', description: 'Convert colors between HEX, RGB, HSL, and CMYK formats.', iconName: 'Palette', href: '/tools/design/color-converter' },
  { name: 'Gradient Generator', slug: 'gradient-generator', category: 'design', description: 'Create beautiful CSS gradients and copy the code instantly.', iconName: 'Palette', href: '/tools/design/gradient-generator' },
  { name: 'Password Generator', slug: 'password-generator', category: 'security', description: 'Generate strong, secure passwords with custom requirements.', iconName: 'Shield', href: '/tools/security/password-generator', popular: true },
  { name: 'Hash Generator', slug: 'hash-generator', category: 'security', description: 'Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes for any text.', iconName: 'Shield', href: '/tools/security/hash-generator' },
  { name: 'Token Generator', slug: 'token-generator', category: 'security', description: 'Generate random UUIDs and secure authentication tokens.', iconName: 'Shield', href: '/tools/security/token-generator' },
  { name: 'Pomodoro Timer', slug: 'pomodoro', category: 'productivity', description: 'Boost focus with customizable work and break intervals.', iconName: 'Timer', href: '/tools/productivity/pomodoro', popular: true },
  { name: 'Stopwatch', slug: 'stopwatch', category: 'productivity', description: 'Precise digital stopwatch with lap tracking.', iconName: 'Clock', href: '/tools/productivity/stopwatch' },
  { name: 'World Clock', slug: 'world-clock', category: 'productivity', description: 'Track time across multiple timezones instantly.', iconName: 'Globe', href: '/tools/productivity/world-clock' },
  { name: 'Loan Calculator', slug: 'loan', category: 'calculator', description: 'Calculate monthly payments and total interest for loans.', iconName: 'DollarSign', href: '/tools/calculator/loan' },
  { name: 'Interest Calculator', slug: 'interest', category: 'calculator', description: 'Compute simple and compound interest over time.', iconName: 'Calculator', href: '/tools/calculator/interest' },
  { name: 'Protect PDF', slug: 'protect', category: 'pdf', description: 'Encrypt your PDF with a password to restrict access.', iconName: 'Lock', href: '/tools/pdf/protect' },
  { name: 'Unlock PDF', slug: 'unlock', category: 'pdf', description: 'Remove passwords from PDF files instantly.', iconName: 'Unlock', href: '/tools/pdf/unlock' },
  { name: 'Watermark PDF', slug: 'watermark', category: 'pdf', description: 'Stamp text or images over your PDF pages.', iconName: 'Stamp', href: '/tools/pdf/watermark' },
  { name: 'Sign PDF', slug: 'sign', category: 'pdf', description: 'Add your signature to PDF documents visually.', iconName: 'PenTool', href: '/tools/pdf/sign' },
  { name: 'Checksum Verifier', slug: 'checksum', category: 'file', description: 'Generate and compare MD5, SHA-1, and SHA-256 file hashes.', iconName: 'Binary', href: '/tools/file/checksum' },
  { name: 'Metadata Viewer', slug: 'metadata', category: 'file', description: 'View hidden file details, EXIF data, and PDF properties.', iconName: 'Info', href: '/tools/file/metadata' },
  { name: 'Chart Generator', slug: 'chart-generator', category: 'visualization', description: 'Create Bar, Line, Area, and Pie charts from CSV or manual data.', iconName: 'BarChart', href: '/tools/visualization/chart-generator', popular: true },
  { name: 'EDA Workspace', slug: 'eda', category: 'visualization', description: 'Perform exploratory data analysis with descriptive statistics and advanced plots.', iconName: 'LineChart', href: '/tools/visualization/eda', popular: true },
];

export function getToolsByCategory(categorySlug) {
  return tools.filter((t) => t.category === categorySlug);
}

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug);
}

export function getPopularTools() {
  return tools.filter((t) => t.popular);
}

export const popularTools = getPopularTools();
