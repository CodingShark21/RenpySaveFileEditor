import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { Variable } from '../types'
import SearchBar from './SearchBar'
import VariableRow from './VariableRow'
import { fuzzySearch } from '../utils/search'
import './VariableEditor.css'

interface VariableEditorProps {
  variables: Variable[]
  filePath: string
  onVariableChange: (variable: Variable) => void
}

export default function VariableEditor({
  variables,
  filePath,
  onVariableChange,
}: VariableEditorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredVariables = searchQuery
    ? fuzzySearch(variables, searchQuery)
    : variables

  const handleEditClick = (variable: Variable) => {
    setEditingName(variable.name)
    setEditingValue(variable.value)
    setError('')
  }

  const handleSave = async () => {
    if (!editingName) return

    setSaving(true)
    setError('')

    try {
      await invoke('update_variable', {
        varName: editingName,
        newValue: editingValue,
      })

      const updatedVar = variables.find((v) => v.name === editingName)
      if (updatedVar) {
        onVariableChange({
          ...updatedVar,
          value: editingValue,
        })
      }

      setEditingName(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      setError(`Failed to save: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingName(null)
    setEditingValue('')
    setError('')
  }

  return (
    <div className="variable-editor">
      <div className="editor-header">
        <h2>Variables ({filteredVariables.length})</h2>
        {filePath && <p className="file-path">Loaded: {filePath}</p>}
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {error && <div className="error-message">{error}</div>}

      {filteredVariables.length === 0 ? (
        <div className="no-results">
          {searchQuery
            ? 'No variables match your search'
            : 'No variables loaded'}
        </div>
      ) : (
        <div className="variables-list">
          {filteredVariables.map((variable) => (
            <VariableRow
              key={variable.name}
              variable={variable}
              isEditing={editingName === variable.name}
              editingValue={editingValue}
              onEditChange={setEditingValue}
              onEditClick={() => handleEditClick(variable)}
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={saving}
            />
          ))}
        </div>
      )}
    </div>
  )
}
