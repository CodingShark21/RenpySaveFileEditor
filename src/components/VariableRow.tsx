import { ChangeEvent, useState } from 'react'
import { Variable } from '../types'

interface VariableRowProps {
  variable: Variable
  onchange: (variable: Variable) => void
  disabled: boolean
}

export default function VariableRow({ variable, onchange, disabled }: VariableRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(variable.value))
  const [error, setError] = useState('')

  const handleEditClick = () => {
    setIsEditing(true)
    setEditValue(String(variable.value))
    setError('')
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
    setError('')
  }

  const validateAndSave = () => {
    let parsedValue: number | string = editValue

    // Type validation
    if (variable.type === 'int') {
      const parsed = parseInt(editValue, 10)
      if (isNaN(parsed)) {
        setError('Invalid integer')
        return
      }
      parsedValue = parsed
    } else if (variable.type === 'float') {
      const parsed = parseFloat(editValue)
      if (isNaN(parsed)) {
        setError('Invalid float')
        return
      }
      parsedValue = parsed
    }

    onchange({
      ...variable,
      value: parsedValue,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateAndSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="variable-row">
      <div className="col-name">
        <span className="var-name">{variable.name}</span>
        {variable.scope && <span className="var-scope">({variable.scope})</span>}
      </div>

      <div className="col-type">
        <span className={`type-badge type-${variable.type}`}>{variable.type}</span>
      </div>

      <div className="col-value">
        {isEditing ? (
          <div className="edit-input-group">
            <input
              type="text"
              value={editValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              autoFocus
              disabled={disabled}
              className={`edit-input ${error ? 'error' : ''}`}
            />
            {error && <span className="error-text">{error}</span>}
          </div>
        ) : (
          <span className="var-value">{variable.value}</span>
        )}
      </div>

      <div className="col-actions">
        {isEditing ? (
          <>
            <button
              onClick={validateAndSave}
              className="btn btn-small btn-primary"
              disabled={disabled}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-small btn-secondary"
              disabled={disabled}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleEditClick}
            className="btn btn-small btn-primary"
            disabled={disabled}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}
