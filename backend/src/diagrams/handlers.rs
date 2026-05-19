use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};

use crate::{
    auth::middleware::AuthUser,
    diagrams::model::{CreateDiagram, Diagram, DiagramSummary, UpdateDiagram},
    error::{AppError, AppResult},
    new_id, AppState,
};

pub async fn list(
    auth: AuthUser,
    State(state): State<AppState>,
) -> AppResult<Json<Vec<DiagramSummary>>> {
    let rows = sqlx::query_as::<_, DiagramSummary>(
        "SELECT id, title, updated_at FROM diagrams WHERE owner_id = $1 ORDER BY updated_at DESC",
    )
    .bind(&auth.user_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;
    Ok(Json(rows))
}

pub async fn create(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(body): Json<CreateDiagram>,
) -> AppResult<(StatusCode, Json<Diagram>)> {
    let id = new_id();
    let title = body.title.unwrap_or_else(|| "Untitled".into());
    let content = body.content.unwrap_or_default();

    sqlx::query(
        "INSERT INTO diagrams (id, owner_id, title, content) VALUES ($1, $2, $3, $4)",
    )
    .bind(&id)
    .bind(&auth.user_id)
    .bind(&title)
    .bind(&content)
    .execute(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    let row = sqlx::query_as::<_, Diagram>(
        "SELECT id, owner_id, title, content, created_at, updated_at FROM diagrams WHERE id = $1",
    )
    .bind(&id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    Ok((StatusCode::CREATED, Json(row)))
}

pub async fn get_one(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<Json<Diagram>> {
    let row = sqlx::query_as::<_, Diagram>(
        "SELECT id, owner_id, title, content, created_at, updated_at FROM diagrams WHERE id = $1",
    )
    .bind(&id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.into()))?
    .ok_or(AppError::NotFound)?;

    if row.owner_id != auth.user_id {
        return Err(AppError::NotFound);
    }
    Ok(Json(row))
}

pub async fn update(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<UpdateDiagram>,
) -> AppResult<Json<Diagram>> {
    let existing = sqlx::query_as::<_, Diagram>(
        "SELECT id, owner_id, title, content, created_at, updated_at FROM diagrams WHERE id = $1",
    )
    .bind(&id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.into()))?
    .ok_or(AppError::NotFound)?;

    if existing.owner_id != auth.user_id {
        return Err(AppError::NotFound);
    }

    let new_title = body.title.unwrap_or(existing.title);
    let new_content = body.content.unwrap_or(existing.content);

    sqlx::query("UPDATE diagrams SET title = $1, content = $2 WHERE id = $3")
        .bind(&new_title)
        .bind(&new_content)
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    let row = sqlx::query_as::<_, Diagram>(
        "SELECT id, owner_id, title, content, created_at, updated_at FROM diagrams WHERE id = $1",
    )
    .bind(&id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    Ok(Json(row))
}

pub async fn delete(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> AppResult<StatusCode> {
    let row = sqlx::query_as::<_, (String, String)>(
        "SELECT id, owner_id FROM diagrams WHERE id = $1",
    )
    .bind(&id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.into()))?
    .ok_or(AppError::NotFound)?;

    if row.1 != auth.user_id {
        return Err(AppError::NotFound);
    }

    sqlx::query("DELETE FROM diagrams WHERE id = $1")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    Ok(StatusCode::NO_CONTENT)
}
