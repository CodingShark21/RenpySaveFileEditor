import { useState } from 'react'
import { open } from '@tauri-apps/api/dialog'
import { invoke } from '@tauri-apps/api/tauri'
import { Variable } from '../types'
import './FileLoader.css'

interface FileLoaderProps {
  onFileLoaded: (variables: Variable[], filePath: string) => void
  isLoading: boolean
}

export default function FileLoader({ onFileLoaded, isLoading }: FileLoaderProps) {
  const [error, setError] = useState<string>('')

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        filters: [
          {
            name: 'Renpy Save Files',
            extensions: ['save'],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      })

      if (selected && typeof selected === 'string') {
        setError('')
        const variables = await invoke<Variable[]>('load_save_file', {
          path: selected,
        })
        onFileLoaded(variables, selected)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setError(`Failed to load file: ${errorMsg}`)
    }
  }

  return (
    <div className="file-loader">
      <button
        onClick={handleSelectFile}
        disabled={isLoading}
        className="file-loader-btn"
      >
        {isLoading ? 'Loading...' : 'Load Save File'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}
