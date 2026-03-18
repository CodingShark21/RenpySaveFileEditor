export interface Variable {
  name: string;
  value: string;
  type: string;
}

export interface AppContextType {
  variables: Variable[];
  filePath: string;
  isLoading: boolean;
  error: string;
  loadFile: (path: string) => Promise<void>;
  updateVariable: (name: string, value: string) => Promise<void>;
  exportVariables: () => void;
}
