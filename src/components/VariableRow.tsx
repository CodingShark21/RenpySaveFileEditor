import { Variable } from '../types'
import './VariableRow.css'

interface VariableRowProps {
  variable: Variable
  isEditing: boolean
  editingValue: string
  onEditChange: (value: string) => void
  onEditClick: () => void
  onSave: () => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

export default function VariableRow({
  variable,
  isEditing,
  editingValue,
  onEditChange,
  onEditClick,
  onSave,
  onCancel,
  isSaving,
}: VariableRowProps) {
  return (
    <div className={`variable-row ${isEditing ? 'editing' : ''}`}>
      <div className="variable-info">
        <div className="variable-name">{variable.name}</div>
        <div className="variable-type">{variable.type}</div>
      </div>

      {isEditing ? (
        <div className="variable-edit">
          <input
            type="text"
            value={editingValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="edit-input"
            autoFocus
          />
          <div className="edit-actions">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="save-btn"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="variable-display">
          <div className="variable-value">{variable.value}</div>
          <button onClick={onEditClick} className="edit-btn" title="Edit variable">
            Edit
          </button>
        </div>
      )}
    </div>
  )
}
