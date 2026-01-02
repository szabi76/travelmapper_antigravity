# AI Agent Rules

## Code Quality
- **Unused Variables**: Always remove unused variables and imports. TypeScript is configured to be strict.
- **Linting**: Run `npm run lint` before committing if unsure.
- **Comments**: Keep comments concise.

## Architecture
- **State**: Use `zustand` for global state.
- **Styling**: Use Tailwind CSS.
- **Icons**: Use `lucide-react`.

## Security
- **Tokens**: Never hardcode secrets. Use `process.env`.
- **CORS**: Keep strict rules (CloudFront only).

## Documentation
- **Changelog**: Maintain a `CHANGELOG.md` in the root following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standards. Update it with every significant change.
