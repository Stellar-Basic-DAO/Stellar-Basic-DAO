use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("build_manifest.rs");

    // Git hash
    let git_hash = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                String::from_utf8(o.stdout).ok()
            } else {
                None
            }
        })
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| "0000000000000000000000000000000000000000".to_string());

    // Source hash (placeholder)
    let source_hash = "0000000000000000000000000000000000000000000000000000000000000000";

    // Build timestamp
    let build_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let content = format!(
        r#"pub const GIT_HASH: &str = "{}";
pub const SOURCE_HASH: &str = "{}";
pub const BUILD_TIMESTAMP: u64 = {};
"#,
        git_hash, source_hash, build_timestamp
    );

    fs::write(&dest_path, content).unwrap();
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=src/");
}
