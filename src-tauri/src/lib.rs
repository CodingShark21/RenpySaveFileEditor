use serde::{Deserialize, Serialize};
use serde_pickle::DeOptions;
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Variable {
    pub name: String,
    pub value: String,
    #[serde(rename = "type")]
    pub var_type: String,
}

/// Extract all variables from a Renpy .save file
pub fn extract_variables_from_save(file_path: &str) -> Result<Vec<Variable>, String> {
    let path = Path::new(file_path);
    
    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let bytes = fs::read(file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    // Try to deserialize the pickle file
    match serde_pickle::from_slice::<serde_json::Value>(&bytes, DeOptions::default()) {
        Ok(data) => extract_variables_from_json(&data),
        Err(_) => extract_from_raw_bytes(&bytes),
    }
}

fn extract_variables_from_json(data: &serde_json::Value) -> Result<Vec<Variable>, String> {
    let mut variables = Vec::new();

    match data {
        serde_json::Value::Object(map) => {
            for (key, value) in map.iter() {
                // Skip private/internal variables
                if key.starts_with('_') || key.starts_with("__") {
                    continue;
                }
                if let Some(var) = json_value_to_variable(key, value) {
                    variables.push(var);
                }
            }
        }
        _ => {
            return Err("Save file format not recognized.".to_string());
        }
    }

    variables.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(variables)
}

fn json_value_to_variable(name: &str, value: &serde_json::Value) -> Option<Variable> {
    let (var_type, value_str) = match value {
        serde_json::Value::Number(n) => {
            let type_str = if n.is_i64() || n.is_u64() { "int" } else { "float" };
            (type_str.to_string(), n.to_string())
        }
        serde_json::Value::String(s) => ("string".to_string(), s.clone()),
        serde_json::Value::Bool(b) => ("bool".to_string(), b.to_string()),
        serde_json::Value::Null => ("null".to_string(), "null".to_string()),
        serde_json::Value::Array(_) => ("list".to_string(), "[complex object]".to_string()),
        serde_json::Value::Object(_) => ("dict".to_string(), "{complex object}".to_string()),
    };

    Some(Variable {
        name: name.to_string(),
        value: value_str,
        var_type,
    })
}

fn extract_from_raw_bytes(bytes: &[u8]) -> Result<Vec<Variable>, String> {
    let mut variables = Vec::new();
    let text = String::from_utf8_lossy(bytes);

    for line in text.lines() {
        if let Some(eq_pos) = line.find('=') {
            let name = line[..eq_pos].trim();
            let value = line[eq_pos + 1..].trim();

            if !name.is_empty() && !value.is_empty() && is_valid_var_name(name) {
                let var_type = guess_type(value);
                variables.push(Variable {
                    name: name.to_string(),
                    value: value.to_string(),
                    var_type,
                });
            }
        }
    }

    if variables.is_empty() {
        return Err("Could not extract variables from save file.".to_string());
    }

    Ok(variables)
}

fn is_valid_var_name(name: &str) -> bool {
    !name.is_empty()
        && (name.chars().next().unwrap().is_alphabetic() || name.starts_with('_'))
        && name.chars().all(|c| c.is_alphanumeric() || c == '_')
        && name.len() < 100
}

fn guess_type(value: &str) -> String {
    if value.parse::<i64>().is_ok() {
        "int".to_string()
    } else if value.parse::<f64>().is_ok() {
        "float".to_string()
    } else if value == "true" || value == "false" {
        "bool".to_string()
    } else {
        "string".to_string()
    }
}

/// Update a variable in the save file
pub fn update_variable_in_save(
    file_path: &str,
    var_name: &str,
    new_value: &str,
) -> Result<(), String> {
    let path = Path::new(file_path);

    if !path.exists() {
        return Err(format!("File not found: {}", file_path));
    }

    let bytes = fs::read(file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let mut data: serde_json::Value = match serde_pickle::from_slice::<serde_json::Value>(&bytes, DeOptions::default()) {
        Ok(val) => match serde_json::to_value(val) {
            Ok(json_val) => json_val,
            Err(_) => return Err("Failed to convert to JSON".to_string()),
        },
        Err(_) => return Err("Failed to parse pickle data".to_string()),
    };

    if let Some(obj) = data.as_object_mut() {
        if obj.contains_key(var_name) {
            let parsed_value = if let Ok(n) = new_value.parse::<i64>() {
                serde_json::json!(n)
            } else if let Ok(n) = new_value.parse::<f64>() {
                serde_json::json!(n)
            } else if new_value == "true" || new_value == "false" {
                serde_json::json!(new_value.parse::<bool>().unwrap())
            } else {
                serde_json::json!(new_value)
            };

            obj.insert(var_name.to_string(), parsed_value);
        } else {
            return Err(format!("Variable '{}' not found in save file", var_name));
        }
    }

    // Create backup
    let backup_path = format!("{}.backup", file_path);
    fs::copy(file_path, &backup_path)
        .map_err(|e| format!("Failed to create backup: {}", e))?;

    let updated_bytes = serde_pickle::to_vec(&data, Default::default())
        .map_err(|e| format!("Failed to serialize: {}", e))?;

    fs::write(file_path, updated_bytes)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

/// Export variables as JSON
pub fn export_variables_as_json(
    variables: &[Variable],
    export_path: &str,
) -> Result<(), String> {
    let json = serde_json::to_string_pretty(variables)
        .map_err(|e| format!("Failed to serialize to JSON: {}", e))?;

    fs::write(export_path, json)
        .map_err(|e| format!("Failed to write export file: {}", e))?;

    Ok(())
}

