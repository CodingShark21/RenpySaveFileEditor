import { useState, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import FileLoader from './components/FileLoader'
import VariableEditor from './components/VariableEditor'
import { Variable } from './types'
import './App.css'

function App() {
  const [variables, setVariables] = useState<Variable[]>([])
  const [filePath, setFilePath] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileLoad = useCallback(async (path: string) => {
    setIsLoading(true)
    setError('')
    try {
      const vars = await invoke<Variable[]>('load_save_file', { path })
      setVariables(vars)
      setFilePath(path)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleVariableChange = useCallback((updatedVariable: Variable) => {
    setVariables((prev) =>
      prev.map((v) => (v.name === updatedVariable.name ? updatedVariable : v))
    )
  }, [])

  const handleSave = useCallback(async () => {
    if (!filePath) return
    setIsLoading(true)
    setError('')
    try {
      await invoke('save_file', { path: filePath, variables })
      alert('File saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }, [filePath, variables])

  const handleExport = useCallback(async () => {
    if (variables.length === 0) return
    try {
      const json = JSON.stringify(variables, null, 2)
      await invoke('export_variables', { data: json })
      alert('Variables exported successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [variables])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Renpy Save File Editor</h1>
      </header>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        {!filePath ? (
          <FileLoader onFileLoad={handleFileLoad} isLoading={isLoading} />
        ) : (
          <div className="editor-container">
            <div className="editor-header">
              <p className="file-path">File: {filePath}</p>
              <button onClick={() => setFilePath('')} className="btn btn-secondary">
                Load Different File
              </button>
            </div>

            {variables.length > 0 ? (
              <>
                <VariableEditor
                  variables={variables}
                  onVariableChange={handleVariableChange}
                  isLoading={isLoading}
                />
                <div className="action-buttons">
                  <button onClick={handleSave} className="btn btn-primary" disabled={isLoading}>
                    Save Changes
                  </button>
                  <button onClick={handleExport} className="btn btn-secondary" disabled={isLoading}>
                    Export as JSON
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">No variables found in this file</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
