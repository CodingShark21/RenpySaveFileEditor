import { useMemo, useState } from 'react'
import { Variable } from '../types'
import VariableRow from './VariableRow'

interface VariableEditorProps {
  variables: Variable[]
  onVariableChange: (variable: Variable) => void
  isLoading: boolean
}

export default function VariableEditor({
  variables,
  onVariableChange,
  isLoading,
}: VariableEditorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Fuzzy search implementation
  const filteredVariables = useMemo(() => {
    if (!searchTerm.trim()) return variables

    const term = searchTerm.toLowerCase()
    return variables.filter((variable) => {
      const name = variable.name.toLowerCase()
      const value = String(variable.value).toLowerCase()

      // Simple fuzzy search: check if all characters in searchTerm appear in order
      let nameIndex = 0
      for (let i = 0; i < term.length; i++) {
        nameIndex = name.indexOf(term[i], nameIndex)
        if (nameIndex === -1) {
          // Try matching against value
          let valueIndex = 0
          for (let j = i; j < term.length; j++) {
            valueIndex = value.indexOf(term[j], valueIndex)
            if (valueIndex === -1) return false
            valueIndex++
          }
          return true
        }
        nameIndex++
      }
      return true
    })
  }, [variables, searchTerm])

  return (
    <div className="variable-editor">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search variables (fuzzy search)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
          className="search-input"
        />
        <span className="search-info">
          {filteredVariables.length} / {variables.length} variables
        </span>
      </div>

      <div className="variables-table">
        <div className="table-header">
          <div className="col-name">Variable Name</div>
          <div className="col-type">Type</div>
          <div className="col-value">Value</div>
          <div className="col-actions">Actions</div>
        </div>

        <div className="table-body">
          {filteredVariables.length > 0 ? (
            filteredVariables.map((variable) => (
              <VariableRow
                key={variable.name}
                variable={variable}
                onchange={onVariableChange}
                disabled={isLoading}
              />
            ))
          ) : (
            <div className="no-results">
              {searchTerm ? 'No variables match your search' : 'No variables found'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
