# Development Setup Guide

## Prerequisites

### macOS/Linux/Windows Prerequisites

1. **Node.js & npm** (v18 or later)
   ```bash
   node --version  # Should be v18.0.0 or higher
   npm --version   # Should be v9.0.0 or higher
   ```

2. **Rust** (1.77.2 or later)
   ```bash
   rustup --version
   cargo --version
   ```

   Install Rust from: https://rustup.rs/

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# This will:
# - Build TypeScript
# - Start Vite dev server (http://localhost:5173)
# - Launch Tauri debug build
# - Enable hot-reload for frontend changes
```

## Building for Release

```bash
# Build production bundle and create Windows installer
npm run build:all

# Or separately:
npm run build          # Build frontend only
npm run build:all      # Build frontend + Rust + create installer
```

## Project Structure Explanation

```
├── src/                          # React & TypeScript frontend
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component
│   ├── components/
│   │   ├── FileLoader.tsx       # Load .save file UI
│   │   ├── VariableEditor.tsx   # Main editor table
│   │   └── VariableRow.tsx      # Individual row editor
│   ├── types/index.ts           # TypeScript interfaces
│   └── styles.css               # Global styles
│
├── src-tauri/                   # Rust & Tauri backend
│   ├── src/
│   │   ├── lib.rs               # Commands & file parsing logic
│   │   └── main.rs              # Entry point
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
│
├── package.json                 # npm dependencies & scripts
├── vite.config.ts              # Frontend build configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # User documentation
```

## Making Changes

### Frontend Changes

1. Edit files in `src/` directory
2. Save and Vite will hot-reload automatically
3. TypeScript errors appear in VS Code and terminal

### Backend (Rust) Changes

1. Edit files in `src-tauri/src/`
2. Tauri dev will rebuild Rust code
3. Application will restart automatically

### Adding New Commands

1. **Add handler in `src-tauri/src/lib.rs`:**
   ```rust
   #[tauri::command]
   async fn my_command(param: String) -> Result<String, String> {
       // Your logic here
       Ok("result".to_string())
   }
   ```

2. **Register in `invoke_handler`:**
   ```rust
   .invoke_handler(tauri::generate_handler![
       load_save_file,
       save_file,
       export_variables,
       my_command,  // Add new command here
   ])
   ```

3. **Call from React:**
   ```typescript
   import { invoke } from '@tauri-apps/api/tauri'
   
   const result = await invoke<string>('my_command', { param: 'value' })
   ```

## Testing

### Manual Testing

1. Start dev server: `npm run dev`
2. Use dummy .save file or create test data
3. Test each feature:
   - Load file
   - Search variables
   - Edit values
   - Save changes
   - Verify backup created

### Testing with Real Save Files

1. Find a Renpy game save file
2. Make a backup of the original
3. Load it in the app
4. Test modifications on a copy first
5. Verify changes persisted correctly

## Debugging

### View Logs

In development, logs appear in:
- VS Code terminal (frontend logs)
- Rust terminal output (backend logs)

### Debug Console

Press `Ctrl+Shift+I` in the running app to open dev tools:
- See console errors
- Inspect React component tree
- View Network requests

### Common Issues

#### Port 5173 already in use
```bash
# Kill the process using port 5173 or change the port in vite.config.ts
```

#### Rust compilation errors
```bash
# Update Rust toolchain
rustup update
```

#### Dependencies not installed
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

- **Frontend**: Minimize re-renders, use React.memo for expensive components
- **Backend**: Use async/await for I/O operations
- **Build**: Production builds are ~10x faster with minification

## Code Style

- **TypeScript**: Follow eslint config (run `npm run type-check`)
- **Rust**: Run `cargo fmt` before committing
- **Components**: Use functional components only

## Deployment

### Creating Release Builds

```bash
# Build for production
npm run build:all

# This creates:
# - /dist/ - Bundled frontend
# - /src-tauri/target/release/bundle/msi/ - Windows MSI installer
# - /src-tauri/target/release/bundle/nsis/ - Windows NSIS installer
```

### Code Signing (Optional)

For production releases, you may want to sign the executable:
1. Obtain a code signing certificate
2. Configure in `tauri.conf.json`
3. Set environment variables as needed

## Further Resources

- [Tauri Docs](https://tauri.app/v1/guides/getting-started/prerequisites/)
- [React Docs](https://react.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Vite Docs](https://vitejs.dev/)

## Getting Help

- Check existing [GitHub Issues](#)
- Submit new issue with detailed steps to reproduce
- Include logs and environment info (`npm run type-check` output)
