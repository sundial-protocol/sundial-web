# Sundial Web

A Next.js website for the Sundial Protocol, featuring dynamic content, interactive components, and a comprehensive news system.

## Building the Site Locally

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher)
- **pnpm** package manager
- **Git** for version control

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/sundial-protocol/sundial-web
   cd sundial-web
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.example .env.local
   ```

   Add your environment variables:

   ```
   CMC_API_KEY=your_coinmarketcap_api_key_here
   ```

   Set an auth token for GitHub Packages in your terminal:

   **Linux/MacOS:**

   ```bash
   export NODE_AUTH_TOKEN=your_github_token_here
   ```

   **Windows:**

   ```bash
   $env:NODE_AUTH_TOKEN="your_github_token_here"
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Run the development server**

   ```bash
   pnpm run dev
   ```

5. **View the site**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

### Build Commands

- **Development**: `npm run dev` - Starts the development server with hot reloading
- **Build**: `npm run build` - Creates an optimized production build
- **Start**: `npm run start` - Starts the production server (run after build)
- **Lint**: `npm run lint` - Runs ESLint to check for code issues

## Adding New Articles

The news system automatically reads markdown files from the `content/news/` directory.

### 1. Create Markdown Content File

Create a new markdown file in `content/news/` with a short slug describing the article. This determines the url you will see the article at.

**Example: `content/news/your-article-slug.md`:**

```markdown
---
title: "Your Article Title"
date: "2025-01-15"
image: "/news/your-article-image.jpg"
---

# Your Article Title

Your article content goes here. You can use standard Markdown syntax:

## Subheadings

- Bullet points
- More bullet points

**Bold text** and _italic text_.

[Links to other pages](/docs)

![Images](/news/your-article-image.jpg)
```

### 2. Add Images

Place images in the `public/news/` directory:

```bash
public/news/your-article-image.jpg
```

**No need to edit any code files - articles are automatically loaded from the markdown files!**
