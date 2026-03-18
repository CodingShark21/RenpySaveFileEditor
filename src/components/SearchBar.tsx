import { ChangeEvent } from 'react'
import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search variables...',
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button onClick={handleClear} className="clear-btn" title="Clear search">
          ✕
        </button>
      )}
    </div>
  )
}
