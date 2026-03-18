import { useState, useCallback } from 'react'
import FileLoader from './components/FileLoader'
import VariableEditor from './components/VariableEditor'
import { Variable } from './types'
import './App.css'

function App() {
  const [variables, setVariables] = useState<Variable[]>([])
  const [filePath, setFilePath] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileLoaded = useCallback(
    (loadedVariables: Variable[], path: string) => {
      setVariables(loadedVariables)
      setFilePath(path)
      setError('')
    },
    []
  )

  const handleVariableChange = useCallback((updatedVariable: Variable) => {
    setVariables((prev) =>
      prev.map((v) => (v.name === updatedVariable.name ? updatedVariable : v))
    )
  }, [])

  const handleLoadNewFile = () => {
    setFilePath('')
    setVariables([])
    setError('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Renpy Save File Editor</h1>
        <p className="subtitle">Edit game variables in your save files</p>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {!filePath ? (
          <div className="loader-container">
            <FileLoader onFileLoaded={handleFileLoaded} isLoading={isLoading} />
          </div>
        ) : (
          <div className="editor-container">
            <div className="top-bar">
              <div className="file-info">
                <p className="file-path">{filePath}</p>
              </div>
              <button
                onClick={handleLoadNewFile}
                className="btn btn-secondary"
              >
                Load Different File
              </button>
            </div>

            {variables.length > 0 ? (
              <VariableEditor
                variables={variables}
                filePath={filePath}
                onVariableChange={handleVariableChange}
              />
            ) : (
              <div className="empty-state">
                <p>No variables found in this file</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Renpy Save File Editor v1.0</p>
      </footer>
    </div>
  )
}

export default App
