# Claude Development Guidelines

## Git Workflow

- **Do NOT auto-commit changes**
  - Make all changes and build/test them
  - Let the user review changes before committing
  - Only run `git commit` commands when explicitly asked by the user
  - The user will handle their own git workflow

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

## General Guidelines

- Follow the existing code style and patterns in the project
- Test changes with `npm run build` before presenting them
- Use the design system and color palette established in the project
