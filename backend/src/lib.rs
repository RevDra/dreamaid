pub mod auth;
pub mod config;
pub mod db;
pub mod diagrams;
pub mod error;
pub mod export;
pub mod sharing;

use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use rand::{distributions::Alphanumeric, Rng};
use serde_json::json;
use std::sync::Arc;

use error::AppResult;

#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::SqlitePool,
    pub config: Arc<config::Config>,
}

pub fn new_id() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(24)
        .map(char::from)
        .collect()
}

/// Build the API router without ServeDir fallback or TraceLayer (added in main).
pub fn build_router(state: AppState) -> Router {
    let api = Router::new()
        .route("/health", get(health))
        .route("/auth/register", post(auth::handlers::register))
        .route("/auth/login", post(auth::handlers::login))
        .route("/auth/me", get(auth::handlers::me))
        .route(
            "/diagrams",
            get(diagrams::handlers::list).post(diagrams::handlers::create),
        )
        .route(
            "/diagrams/:id",
            get(diagrams::handlers::get_one)
                .put(diagrams::handlers::update)
                .delete(diagrams::handlers::delete),
        )
        .route(
            "/diagrams/:id/share",
            post(sharing::handlers::create_share_link),
        )
        .route("/diagrams/:id/export", get(export::export_diagram))
        .route(
            "/shared/:token",
            get(sharing::handlers::get_shared).put(sharing::handlers::update_shared),
        );

    Router::new().nest("/api", api).with_state(state)
}

async fn health(State(state): State<AppState>) -> AppResult<Json<serde_json::Value>> {
    sqlx::query("SELECT 1")
        .execute(&state.db)
        .await
        .map_err(|e| error::AppError::Internal(e.into()))?;
    Ok(Json(json!({ "ok": true, "version": env!("CARGO_PKG_VERSION") })))
}
