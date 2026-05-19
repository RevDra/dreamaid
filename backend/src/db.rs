use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions},
    SqlitePool,
};
use std::str::FromStr;

pub async fn connect(database_url: &str) -> anyhow::Result<SqlitePool> {
    // Ensure data/ directory exists before SQLite tries to create the file.
    if let Some(path) = database_url.strip_prefix("sqlite://") {
        if let Some(parent) = std::path::Path::new(path).parent() {
            if !parent.as_os_str().is_empty() {
                tokio::fs::create_dir_all(parent).await?;
            }
        }
    }

    let opts = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true)
        // WAL allows concurrent reads while a write is in progress.
        .journal_mode(SqliteJournalMode::Wal)
        // Foreign keys are OFF by default in SQLite; must enable per connection.
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(opts)
        .await?;

    // Migrations are embedded at compile time from ./migrations/.
    sqlx::migrate!("./migrations").run(&pool).await?;
    tracing::info!("migrations applied");

    Ok(pool)
}
