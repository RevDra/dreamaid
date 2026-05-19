pub mod render;

use axum::{
    body::Body,
    extract::{Path, State},
    http::header::{CONTENT_DISPOSITION, CONTENT_TYPE},
    response::Response,
};

use crate::{
    auth::middleware::AuthUser,
    error::{AppError, AppResult},
    AppState,
};

pub async fn export_diagram(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Response<Body>> {
    let row = sqlx::query_as::<_, (String, String)>(
        "SELECT owner_id, content FROM diagrams WHERE id = $1",
    )
    .bind(&id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.into()))?
    .ok_or(AppError::NotFound)?;

    let (owner_id, content) = row;
    if owner_id != auth.user_id {
        return Err(AppError::NotFound);
    }

    let svg = render::render_svg(&content);

    Response::builder()
        .header(CONTENT_TYPE, "image/svg+xml")
        .header(CONTENT_DISPOSITION, format!("attachment; filename=\"diagram-{id}.svg\""))
        .body(Body::from(svg))
        .map_err(|e| AppError::Internal(anyhow::anyhow!("{e}")))
}
