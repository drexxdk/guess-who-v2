# Claude Development Guidelines

## Git Workflow

- **Do NOT auto-commit changes**
  - Make all changes and build/test them
  - Let the user review changes before committing
  - Only run `git commit` commands when explicitly asked by the user
  - The user will handle their own git workflow
- **Before committing, always run:**
  - `npm run build` - Verify the project compiles
  - `npm test` - Run all tests
  - `npm run lint` - Check for linting errors
  - Only proceed with commit if all checks pass

## Development Server

- **Do NOT stop the currently running dev server**
  - If `npm run dev` is already running in a terminal, leave it running
  - The user may be actively viewing the app in their browser
- **Always run `npm run build` in a terminal where nothing else is running**
  - Don't run build commands in the same terminal where dev server is active
  - Check which terminals have active processes before running build
  - If all terminals are busy, the command will fail - that's expected behavior
- **Use `npm run build` for testing changes**
  - After making changes, run build to verify they compile correctly
  - Don't try to start the dev server if it's already running

## Package Management

- **Always ask before installing new packages**
  - Don't run `npm install` without explicit user approval
  - Present the package name, purpose, and size if known
  - Suggest alternatives when appropriate (e.g., built-in solutions, lighter packages)
  - Explain why the package is needed and what problem it solves
  - Let the user decide whether to proceed with installation

## Opinion vs Implementation

- **When the user asks for your opinion or ideas:**
  - Provide suggestions and recommendations
  - Explain your reasoning and options
  - **Do NOT automatically implement** what you suggest
  - **Always ask the user how they want to proceed** before making changes
  - Wait for explicit approval or direction before implementing
- **Example phrases that indicate opinion requests:**
  - "What do you think?"
  - "How would you improve...?"
  - "What are your ideas?"
  - "Any suggestions?"

## General Guidelines

- Follow the existing code style and patterns in the project
- Test changes with `npm run build` before presenting them
- Use the design system and color palette established in the project

## Code Quality

- **Always follow ESLint rules, especially `react/no-unescaped-entities`:**
  - Use HTML entities for special characters in JSX text content
  - Replace apostrophes with `&apos;` or `'` (e.g., `don&apos;t` or `don't`)
  - Replace quotes with `&quot;` or `"` (e.g., `&quot;hello&quot;` or `"hello"`)
  - Replace `>` with `&gt;` and `<` with `&lt;` when needed
  - Alternatively, wrap text containing special characters in curly braces: `{"don't"}`
  - **Examples:**
    - ❌ Bad: `<p>Don't forget</p>`
    - ✅ Good: `<p>Don&apos;t forget</p>` or `<p>{"Don't forget"}</p>`
    - ❌ Bad: `<p>She said "hello"</p>`
    - ✅ Good: `<p>She said &quot;hello&quot;</p>` or `<p>{'She said "hello"'}</p>`
