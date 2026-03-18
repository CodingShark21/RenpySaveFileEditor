# Renpy Save File Editor

A lightweight desktop application for editing variables in Renpy save files (.save format). Change money, stats, inventory values, and other game variables with an intuitive fuzzy-searchable interface.

## Features

✨ **Core Functionality**
- 📂 Load `.save` files from any Renpy game
- 🔍 **Fuzzy search** for quick variable lookup
- ✏️ **In-place editing** of numeric variables (int, float)
- 💾 Save changes with automatic backup
- 📤 Export edited variables as JSON
- 🔄 Type validation (prevents invalid values)

✨ **User Experience**
- 🎨 Modern, dark-themed UI
- ⚡ Lightweight desktop app (~15MB)
- 📱 Responsive design
- 🛡️ Safe file handling with automatic backups
- ❌ Clear error messages

## System Requirements

- **Windows 7 or later** (x64)
- No installation of Python or other runtimes required
- ~50 MB disk space

## Installation

### Option 1: Pre-built Executable (Recommended)
_Coming soon_ - Download the `.exe` installer from the releases page.

### Option 2: Build from Source

**Prerequisites:**
- [Node.js](https://nodejs.org/) v18 or later
- [Rust](https://www.rust-lang.org/tools/install) 1.77.2 or later

**Steps:**

```bash
# Clone the repository
git clone <repo-url>
cd RenpySaveFileEditor

# Install dependencies
npm install

# Build the app  
npm run build:all

# The executable will be in: src-tauri/target/release/
```

## Usage

### Quick Start

1. **Open the app** - Launch `Renpy Save File Editor`
2. **Load a save file** - Enter the path to your `.save` file (usually in `game_folder/saves/`)
3. **Search and edit** - Use the search box to find variables by name or value
4. **Click "Edit"** - Modify the value
5. **Click "Save"** - Changes are saved with automatic backup

### Finding Your Save Files

Renpy save files are typically located in:
```
C:\Users\[YourUsername]\AppData\Roaming\[GameName]\saves\
```

Or directly in the game folder:
```
[GameInstallPath]\game\saves\
```

Look for files named:
- `slot_1.save`, `slot_2.save`, etc.
- `quicksave.save`
- `autosave.save`

### Variable Types

- **int** - Whole numbers (e.g., money: `1000`)
- **float** - Decimal numbers (e.g., health: `75.5`)
- **bool** - True/False values
- **str** - Text values (read-only in this version)

### Backup

Before any save operation, the app automatically creates a backup:
```
C:\Games\MyGame\saves\slot_1.save.backup
```

## Development

### Project Structure

```
.
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main component
│   └── styles.css         # Global styles
├── src-tauri/             # Rust backend
│   ├── src/lib.rs         # Tauri commands
│   └── tauri.conf.json    # Config
├── package.json           # Dependencies & scripts
└── vite.config.ts         # Frontend build config
```

### Available Scripts

```bash
# Development mode (hot reload)
npm run dev

# Build frontend only
npm run build

# Build complete application (frontend + Rust)
npm run build:all

# Type checking
npm run type-check

# Preview production build
npm run preview
```

### Debug Build

For development with console logging:
```bash
npm run dev
```

This starts:
- Vite dev server (http://localhost:5173)
- Tauri backend in debug mode
- Hot module replacement enabled

### Release Build

```bash
npm run build:all
```

This creates:
- Production bundle in `dist/`
- Windows installer in `src-tauri/target/release/`

## Architecture

### Frontend (React + TypeScript)
- **FileLoader**: File path input UI
- **VariableEditor**: Searchable table view with fuzzy filtering
- **VariableRow**: Individual variable editor
- **Vite**: Ultra-fast build tool
- **Type-safe**: Full TypeScript support

### Backend (Tauri + Rust)
- **File I/O**: Safe file reading/writing
- **Pickle Parsing**: Deserializes Renpy save format
- **Type Detection**: Identifies int/float/bool/string types
- **Fallback Parser**: Handles edge cases and format variations
- **Backup System**: Automatic backup before modifications

### Communication
- **Tauri Commands**: Async Rust-to-JavaScript bridge
- **Serialization**: JSON for data transfer

## Supported Renpy Versions

- ✅ Renpy 6.x to 8.x
- ✅ Most indie games using Renpy
- ⚠️ Some games with custom save formats may require manual parsing tweaks

## Known Limitations

- Read-only support for string variables (for safety)
- No support for complex objects (lists, dicts) in variable editing
- Requires full file path entry (drag-and-drop coming soon)
- Works on Windows only (Mac/Linux builds available upon request)

## Troubleshooting

### "File not found" error
- Verify the file path is correct
- Use absolute paths (e.g., `C:\Users\...\saves\slot_1.save`)
- Ensure the `.save` file extension is included

### "Could not parse file" error
- The save file may use a custom format
- Try opening it with a Renpy decompiler first
- Create an issue with the game name for investigation

### Changes not saving
- Check file permissions
- Ensure you have write access to the saves folder
- Look for `.backup` file (backup was created successfully)

### Application crashes on startup
- Update/reinstall the app
- Check that Windows is up to date
- Try running as Administrator

## Reporting Issues

Found a bug? Please create an issue on [GitHub Issues](#) with:
- Game name and Renpy version
- Save file format (if known)
- Steps to reproduce
- Screenshots/error messages

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Feel free to submit pull requests for:
- Pickle format improvements
- UI enhancements
- Additional variable type support
- Performance optimizations
- Platform support (Mac/Linux)

## Disclaimer

⚠️ **Use at your own risk** - Always keep backups of your original save files!
- This tool modifies game save files
- Corrupted saves may result in unrecoverable progress loss
- The automatic backup feature should protect against accidents
- Not affiliated with Renpy or any game developers

## FAQ

**Q: Is my save file safe?**
A: Yes! The app creates automatic backups before any modification. Your original file is preserved as `filename.save.backup`.

**Q: Can I edit save files from any Renpy game?**
A: Most Renpy games should work. Some games with custom save formats may need special handling. Feel free to report any compatibility issues.

**Q: Will this get me banned from online games?**
A: This tool only works with local save files. Use responsibly on single-player games!

**Q: How do I find the variable name I want to edit?**
A: Use the fuzzy search feature. Most common variables are named intuitively (money, health, inventory, etc.). If stuck, check the game's documentation or community forums.

**Q: Can I use this on Mac or Linux?**
A: The app currently targets Windows. Mac/Linux builds are technically possible - submit an issue if you need them!

---

**Happy save file editing!** 🎮
