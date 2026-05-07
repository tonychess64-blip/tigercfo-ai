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

#[derive(Debug, Serialize, Deserialize)]
struct TaxSetting {
    id: String,
    company_id: String,
    tax_year: i64,
    social_security_wage_base_cents: i64,
    medicare_rate_bps: i64,
    federal_withholding_method: String,
    state_withholding_mode: String,
}

fn db_path() -> PathBuf { PathBuf::from("data/payrollpro.sqlite") }

fn conn() -> Result<Connection, String> {
    let path = db_path();
    if let Some(dir) = path.parent() { std::fs::create_dir_all(dir).map_err(|e| e.to_string())?; }
    Connection::open(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_companies() -> Result<Vec<Company>, String> {
    let conn = conn()?;
    let mut stmt = conn.prepare("SELECT id, name, state, pay_frequency FROM companies ORDER BY name").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| {
        Ok(Company { id: row.get(0)?, name: row.get(1)?, state: row.get(2)?, pay_frequency: row.get(3)? })
    }).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_company(name: String, state: String, pay_frequency: String) -> Result<String, String> {
    let conn = conn()?;
    let id = uuid::Uuid::new_v4().to_string();
    conn.execute("INSERT INTO companies (id, name, state, pay_frequency) VALUES (?1, ?2, ?3, ?4)", params![id, name, state, pay_frequency]).map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
fn list_employees(company_id: String) -> Result<Vec<Employee>, String> {
    let conn = conn()?;
    let mut stmt = conn.prepare("SELECT id, first_name, last_name, state, pay_type FROM employees WHERE company_id = ?1 ORDER BY last_name").map_err(|e| e.to_string())?;
    let rows = stmt.query_map(params![company_id], |row| {
        Ok(Employee { id: row.get(0)?, first_name: row.get(1)?, last_name: row.get(2)?, state: row.get(3)?, pay_type: row.get(4)? })
    }).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
fn list_tax_settings(company_id: String) -> Result<Vec<TaxSetting>, String> {
    let conn = conn()?;
    let mut stmt = conn.prepare("SELECT id, company_id, tax_year, social_security_wage_base_cents, medicare_rate_bps, federal_withholding_method, state_withholding_mode FROM tax_settings WHERE company_id = ?1 ORDER BY tax_year DESC").map_err(|e| e.to_string())?;
    let rows = stmt.query_map(params![company_id], |row| {
        Ok(TaxSetting {
            id: row.get(0)?, company_id: row.get(1)?, tax_year: row.get(2)?, social_security_wage_base_cents: row.get(3)?, medicare_rate_bps: row.get(4)?, federal_withholding_method: row.get(5)?, state_withholding_mode: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
fn upsert_tax_setting(company_id: String, tax_year: i64, social_security_wage_base_cents: i64, medicare_rate_bps: i64, federal_withholding_method: String, state_withholding_mode: String) -> Result<String, String> {
    let conn = conn()?;
    let id = uuid::Uuid::new_v4().to_string();
    conn.execute("INSERT INTO tax_settings (id, company_id, tax_year, social_security_wage_base_cents, medicare_rate_bps, federal_withholding_method, state_withholding_mode) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) ON CONFLICT(company_id, tax_year) DO UPDATE SET social_security_wage_base_cents=excluded.social_security_wage_base_cents, medicare_rate_bps=excluded.medicare_rate_bps, federal_withholding_method=excluded.federal_withholding_method, state_withholding_mode=excluded.state_withholding_mode", params![id, company_id, tax_year, social_security_wage_base_cents, medicare_rate_bps, federal_withholding_method, state_withholding_mode]).map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
fn create_payroll_run(company_id: String, pay_period_start: String, pay_period_end: String, pay_date: String) -> Result<String, String> {
    let conn = conn()?;
    let id = uuid::Uuid::new_v4().to_string();
    conn.execute("INSERT INTO payroll_runs (id, company_id, pay_period_start, pay_period_end, pay_date, status) VALUES (?1, ?2, ?3, ?4, ?5, 'draft')", params![id, company_id, pay_period_start, pay_period_end, pay_date]).map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO payroll_run_audit_events (id, payroll_run_id, event_type, actor, details_json) VALUES (?1, ?2, 'RUN_CREATED', 'desktop-user', '{}')", params![uuid::Uuid::new_v4().to_string(), id]).map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
fn finalize_payroll_run(run_id: String) -> Result<(), String> {
    let conn = conn()?;
    conn.execute("UPDATE payroll_runs SET status='finalized', updated_at=CURRENT_TIMESTAMP WHERE id=?1", params![run_id]).map_err(|e| e.to_string())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_companies,
            create_company,
            list_employees,
            list_tax_settings,
            upsert_tax_setting,
            create_payroll_run,
            finalize_payroll_run
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
