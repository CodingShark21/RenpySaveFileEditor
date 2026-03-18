import { ChangeEvent, useState } from 'react'

interface FileLoaderProps {
  onFileLoad: (path: string) => void
  isLoading: boolean
}

export default function FileLoader({ onFileLoad, isLoading }: FileLoaderProps) {
  const [filePath, setFilePath] = useState('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilePath(e.target.value)
  }

  const handleLoadClick = () => {
    if (filePath.trim()) {
      onFileLoad(filePath)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoadClick()
    }
  }

  return (
    <div className="file-loader">
      <div className="file-loader-content">
        <h2>Load Renpy Save File</h2>
        <p>Enter the path to your .save file</p>
        
        <div className="input-group">
          <input
            type="text"
            value={filePath}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="e.g., C:\Games\MyGame\saves\slot_1.save"
            disabled={isLoading}
            className="file-input"
          />
          <button
            onClick={handleLoadClick}
            disabled={isLoading || !filePath.trim()}
            className="btn btn-primary"
          >
            {isLoading ? 'Loading...' : 'Load File'}
          </button>
        </div>

        <div className="file-loader-info">
          <h3>ℹ️ How to find your save file:</h3>
          <ul>
            <li>Usually located in: <code>game_folder\game\saves\</code></li>
            <li>Look for files named <code>slot_1.save</code>, <code>slot_2.save</code>, etc.</li>
            <li>Paste the full path above to load it</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
