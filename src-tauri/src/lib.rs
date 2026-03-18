use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::Path;
use tauri::State;
use tokio::sync::Mutex;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Variable {
    name: String,
    value: VariableValue,
    #[serde(rename = "type")]
    var_type: String,
    scope: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum VariableValue {
    Int(i64),
    Float(f64),
    String(String),
    Bool(bool),
}

#[derive(Default)]
pub struct AppState {
    variables: Arc<Mutex<Vec<Variable>>>,
}

#[tauri::command]
async fn load_save_file(
    path: String,
    state: State<'_, AppState>,
) -> Result<Vec<Variable>, String> {
    let file_path = Path::new(&path);
    
    // Validate file exists
    if !file_path.exists() {
        return Err("File not found".to_string());
    }

    // Read file content
    let content = fs::read(&file_path).map_err(|e| e.to_string())?;

    // Parse pickle file
    let variables = parse_save_file(&content)?;
    
    // Store in state
    *state.variables.lock().await = variables.clone();
    
    Ok(variables)
}

#[tauri::command]
async fn save_file(
    path: String,
    variables: Vec<Variable>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let file_path = Path::new(&path);

    // Create backup
    let backup_path = format!("{}.backup", path);
    if file_path.exists() {
        fs::copy(&file_path, &backup_path).map_err(|e| e.to_string())?;
    }

    // Serialize and write
    let serialized = serialize_save_file(&variables)?;
    fs::write(&file_path, serialized).map_err(|e| e.to_string())?;

    // Update state
    *state.variables.lock().await = variables;
    
    Ok(())
}

#[tauri::command]
async fn export_variables(data: String) -> Result<(), String> {
    let home_dir = dirs::home_dir().ok_or("Could not determine home directory")?;
    let export_path = home_dir.join("Downloads").join("variables_export.json");
    
    fs::write(&export_path, data).map_err(|e| e.to_string())?;
    
    Ok(())
}

fn parse_save_file(content: &[u8]) -> Result<Vec<Variable>, String> {
    // Try to parse as pickle format
    match parse_pickle_variables(content) {
        Ok(vars) => Ok(vars),
        Err(_) => {
            // Fallback: try to detect variables from binary content
            parse_variables_from_binary(content)
        }
    }
}

fn parse_pickle_variables(content: &[u8]) -> Result<Vec<Variable>, String> {
    // Renpy save files are pickle files containing a dictionary
    // We need to deserialize and extract numeric variables
    
    match serde_pickle::from_slice::<serde_json::Value>(content) {
        Ok(value) => {
            let mut variables = Vec::new();
            extract_variables(&value, &mut variables, None);
            Ok(variables)
        }
        Err(_) => Err("Failed to parse pickle file".to_string()),
    }
}

fn extract_variables(
    value: &serde_json::Value,
    variables: &mut Vec<Variable>,
    scope: Option<String>,
) {
    match value {
        serde_json::Value::Object(map) => {
            for (key, val) in map {
                if is_variable_name(key) {
                    if let Some(var) = create_variable(key.clone(), val, scope.clone()) {
                        variables.push(var);
                    }
                    // Recursively search nested structures
                    extract_variables(val, variables, Some(key.clone()));
                }
            }
        }
        serde_json::Value::Array(arr) => {
            for (idx, val) in arr.iter().enumerate() {
                if let Some(var) = create_variable(
                    format!("[{}]", idx),
                    val,
                    scope.clone(),
                ) {
                    variables.push(var);
                }
                extract_variables(val, variables, scope.clone());
            }
        }
        _ => {}
    }
}

fn create_variable(
    name: String,
    value: &serde_json::Value,
    scope: Option<String>,
) -> Option<Variable> {
    match value {
        serde_json::Value::Number(n) => {
            let (val, var_type) = if let Some(i) = n.as_i64() {
                (VariableValue::Int(i), "int")
            } else if let Some(f) = n.as_f64() {
                (VariableValue::Float(f), "float")
            } else {
                return None;
            };

            Some(Variable {
                name,
                value: val,
                var_type: var_type.to_string(),
                scope,
            })
        }
        serde_json::Value::Bool(b) => Some(Variable {
            name,
            value: VariableValue::Bool(*b),
            var_type: "bool".to_string(),
            scope,
        }),
        serde_json::Value::String(s) => Some(Variable {
            name,
            value: VariableValue::String(s.clone()),
            var_type: "str".to_string(),
            scope,
        }),
        _ => None,
    }
}

fn is_variable_name(name: &str) -> bool {
    // Filter out internal Python variables and common non-game variables
    !name.starts_with('_') && !name.starts_with("__") && name.len() > 0
}

fn parse_variables_from_binary(content: &[u8]) -> Result<Vec<Variable>, String> {
    // Fallback parser for when pickle parsing fails
    // This is a basic implementation that tries to extract patterns
    let mut variables = Vec::new();

    // Try to find UTF-8 strings that could be variable names
    let s = String::from_utf8_lossy(content);
    
    // Look for patterns like variable_name: value
    for line in s.lines() {
        if let Some(var) = parse_variable_line(line) {
            variables.push(var);
        }
    }

    if variables.is_empty() {
        return Err("Could not extract variables from save file".to_string());
    }

    Ok(variables)
}

fn parse_variable_line(line: &str) -> Option<Variable> {
    // Simple pattern matching for variable lines
    // Adjust based on actual Renpy save format
    let parts: Vec<&str> = line.split(':').collect();
    if parts.len() >= 2 {
        let name = parts[0].trim().to_string();
        if !name.is_empty() && is_variable_name(&name) {
            if let Ok(val) = parts[1].trim().parse::<i64>() {
                return Some(Variable {
                    name,
                    value: VariableValue::Int(val),
                    var_type: "int".to_string(),
                    scope: None,
                });
            } else if let Ok(val) = parts[1].trim().parse::<f64>() {
                return Some(Variable {
                    name,
                    value: VariableValue::Float(val),
                    var_type: "float".to_string(),
                    scope: None,
                });
            }
        }
    }
    None
}

fn serialize_save_file(variables: &[Variable]) -> Result<Vec<u8>, String> {
    // Convert variables back to a format suitable for Renpy
    let mut map = BTreeMap::new();
    
    for var in variables {
        let serialized_value = match &var.value {
            VariableValue::Int(i) => serde_json::json!(i),
            VariableValue::Float(f) => serde_json::json!(f),
            VariableValue::String(s) => serde_json::json!(s),
            VariableValue::Bool(b) => serde_json::json!(b),
        };
        map.insert(var.name.clone(), serialized_value);
    }

    // Serialize as pickle
    match serde_pickle::to_vec(&map, Default::default()) {
        Ok(bytes) => Ok(bytes),
        Err(_) => Err("Failed to serialize save file".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_save_file,
            save_file,
            export_variables
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

