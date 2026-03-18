export interface Variable {
  name: string
  value: number | string
  type: 'int' | 'float' | 'str' | 'bool'
  scope?: string
}

export interface SaveFileData {
  variables: Variable[]
  metadata?: {
    version?: string
    timestamp?: string
  }
}
