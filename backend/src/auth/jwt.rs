use anyhow::Context;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

const EXPIRY_SECS: u64 = 7 * 24 * 3600;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: u64,
}

pub fn issue(user_id: &str, secret: &str) -> anyhow::Result<String> {
    let exp = jsonwebtoken::get_current_timestamp() + EXPIRY_SECS;
    let claims = Claims { sub: user_id.to_string(), exp };
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .context("failed to sign JWT")
}

pub fn verify(token: &str, secret: &str) -> anyhow::Result<Claims> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .context("invalid or expired token")?;
    Ok(data.claims)
}
