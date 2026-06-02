#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// QNBS-v3: Native Deep-Link-Weiterleitung folgt mit Tauri-2-Plugin; Web-Layer nutzt culinasync:// via deepLinking.ts
fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
