use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
struct Company {
    id: String,
    name: String,
    state: String,
    pay_frequency: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Employee {
    id: String,
    first_name: String,
    last_name: String,
    state: String,
    pay_type: String,
}

fn db_path() -> PathBuf {
    PathBuf::from("data/payrollpro.sqlite")
}

fn conn() -> Result<Connection, String> {
    let path = db_path();
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    Connection::open(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_companies() -> Result<Vec<Company>, String> {
    let conn = conn()?;
    let mut stmt = conn
        .prepare("SELECT id, name, state, pay_frequency FROM companies ORDER BY name")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Company {
                id: row.get(0)?,
                name: row.get(1)?,
                state: row.get(2)?,
                pay_frequency: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
fn list_employees(company_id: String) -> Result<Vec<Employee>, String> {
    let conn = conn()?;
    let mut stmt = conn
        .prepare("SELECT id, first_name, last_name, state, pay_type FROM employees WHERE company_id = ?1 ORDER BY last_name")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![company_id], |row| {
            Ok(Employee {
                id: row.get(0)?,
                first_name: row.get(1)?,
                last_name: row.get(2)?,
                state: row.get(3)?,
                pay_type: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_payroll_run(company_id: String, pay_period_start: String, pay_period_end: String, pay_date: String) -> Result<String, String> {
    let conn = conn()?;
    let id = uuid::Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO payroll_runs (id, company_id, pay_period_start, pay_period_end, pay_date, status) VALUES (?1, ?2, ?3, ?4, ?5, 'draft')",
        params![id, company_id, pay_period_start, pay_period_end, pay_date],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_companies, list_employees, create_payroll_run])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
