// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app_lib::{extract_variables_from_save, update_variable_in_save, Variable};
use std::sync::Mutex;

#[derive(Default)]
struct AppState {
    current_file: Mutex<String>,
}

#[tauri::command]
fn load_save_file(path: String, state: tauri::State<AppState>) -> Result<Vec<Variable>, String> {
    *state.current_file.lock().unwrap() = path.clone();
    extract_variables_from_save(&path)
}

#[tauri::command]
fn update_variable(
    var_name: String,
    new_value: String,
    state: tauri::State<AppState>,
) -> Result<(), String> {
    let file_path = state.current_file.lock().unwrap();
    
    if file_path.is_empty() {
        return Err("No file loaded.".to_string());
    }

    update_variable_in_save(&file_path, &var_name, &new_value)
}

#[tauri::command]
fn get_current_file(state: tauri::State<AppState>) -> String {
    state.current_file.lock().unwrap().clone()
}

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            load_save_file,
            update_variable,
            get_current_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
