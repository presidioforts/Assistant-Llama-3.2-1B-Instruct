# Additional NPM Packages Needed for Full Markdown Support

## Currently Missing Features & Required Packages:

### 1. **Mermaid Diagrams** ❌
```bash
npm install mermaid
```
**What it adds:** Flowcharts, sequence diagrams, ER diagrams
**Usage:** ```mermaid graph TD; A-->B; ```

### 2. **Math Expressions (LaTeX)** ❌  
```bash
npm install remark-math rehype-katex katex
```
**What it adds:** $E=mc^2$ and $$\sum_{i=1}^{n} x_i$$
**Usage:** Inline `$math$` and block `$$math$$`

### 3. **Enhanced Tables** ❌
```bash
npm install remark-gfm-table-align
```
**What it adds:** Better table alignment and styling

### 4. **Footnotes** ❌
```bash
npm install remark-footnotes
```
**What it adds:** Reference[^1] style footnotes

### 5. **Task Lists Enhancement** ❌
```bash
npm install remark-task-list-item
```
**What it adds:** Better checkbox styling for - [x] items

### 6. **Emoji Support** ❌
```bash
npm install remark-emoji
```
**What it adds:** :smile: :rocket: emoji shortcodes

### 7. **Definition Lists** ❌
```bash
npm install remark-definition-list
```
**What it adds:** Term: Definition syntax

### 8. **Admonitions/Callouts** ❌
```bash
npm install remark-admonitions
```
**What it adds:** > [!NOTE] callout boxes

## Priority Installation Command:

```bash
# High Priority (Essential for DevOps content)
npm install mermaid remark-math rehype-katex katex remark-footnotes remark-emoji

# Medium Priority (Nice to have)
npm install remark-definition-list remark-admonitions remark-task-list-item

# Low Priority (Polish)
npm install remark-gfm-table-align
```

## Backend Python Packages (for OpenAI test backend)

```bash
pip install openai python-dotenv
```

These are **in addition** to the existing Flask / flask-cors etc. already in `backend/requirements.txt`.

## Essential Front-End Install Command (one-liner)

```bash
npm install remark-math rehype-katex katex mermaid
```

## Current Coverage Assessment:

✅ **Working Well:**
- Basic markdown (headers, lists, links)
- Code blocks with syntax highlighting  
- Tables (basic)
- GitHub Flavored Markdown
- HTML support
- Strikethrough, bold, italic

❌ **Not Working (Need Packages):**
- Mermaid diagrams 
- Math expressions
- Footnotes
- Enhanced callouts
- Emoji shortcodes
- Definition lists

🟡 **Partially Working:**
- Task lists (basic checkboxes work)
- Tables (alignment could be better)

## Recommendation:

Install the **High Priority** packages first to get Mermaid diagrams and math working, which are essential for DevOps documentation. 