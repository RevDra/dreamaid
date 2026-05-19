use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Diagram {
    pub id: String,
    pub owner_id: String,
    pub title: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct DiagramSummary {
    pub id: String,
    pub title: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateDiagram {
    pub title: Option<String>,
    pub content: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDiagram {
    pub title: Option<String>,
    pub content: Option<String>,
}
