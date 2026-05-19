use anyhow::Context;
use std::env;

#[derive(Clone)]
pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub jwt_secret: String,
    pub static_dir: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .context("PORT must be a valid port number")?,
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite://./data/ba-ide.db".to_string()),
            jwt_secret: env::var("JWT_SECRET")
                .context("JWT_SECRET must be set (generate with: openssl rand -hex 32)")?,
            static_dir: env::var("STATIC_DIR")
                .unwrap_or_else(|_| "../UBA_Unified-Business-Analytics/out".to_string()),
        })
    }
}
