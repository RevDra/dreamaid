use std::collections::HashMap;

struct Node {
    label: String,
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

struct Edge {
    from: String,
    to: String,
    label: Option<String>,
}

fn meta_val(meta: &str, key: &str) -> Option<f64> {
    let prefix = format!("{key}:");
    meta.split_whitespace()
        .find(|s| s.starts_with(&prefix))
        .and_then(|s| s[prefix.len()..].parse().ok())
}

fn node_id_label(def: &str) -> Option<(String, String)> {
    let def = def.trim();
    if let Some(b) = def.find('[') {
        let id = def[..b].trim().to_string();
        if let Some(e) = def[b + 1..].rfind(']') {
            let label = def[b + 1..b + 1 + e].trim().trim_matches('"').to_string();
            if !id.is_empty() {
                return Some((id, label));
            }
        }
    }
    if !def.is_empty() && !def.contains(' ') {
        return Some((def.to_string(), def.to_string()));
    }
    None
}

fn parse(content: &str) -> (HashMap<String, Node>, Vec<Edge>) {
    let mut nodes: HashMap<String, Node> = HashMap::new();
    let mut edges: Vec<Edge> = Vec::new();

    for line in content.lines() {
        let t = line.trim();
        if t.is_empty() || t.starts_with("flowchart") || t.starts_with("graph") {
            continue;
        }
        if let Some(mp) = t.find(" %%") {
            let node_part = t[..mp].trim();
            let meta = t[mp + 3..].trim();
            if let Some((id, label)) = node_id_label(node_part) {
                nodes.insert(id, Node {
                    label,
                    x: meta_val(meta, "x").unwrap_or(0.0),
                    y: meta_val(meta, "y").unwrap_or(0.0),
                    w: meta_val(meta, "w").unwrap_or(120.0),
                    h: meta_val(meta, "h").unwrap_or(40.0),
                });
            }
        } else if t.contains("-->") || t.contains("---") {
            let sep = if t.contains("-->") { "-->" } else { "---" };
            if let Some(ap) = t.find(sep) {
                let from_s = t[..ap].trim();
                let rest = t[ap + sep.len()..].trim();
                let (lbl, to_s) = if rest.starts_with('|') {
                    if let Some(end) = rest[1..].find('|') {
                        (Some(rest[1..end + 1].to_string()), rest[end + 2..].trim())
                    } else {
                        (None, rest)
                    }
                } else {
                    (None, rest)
                };
                let from = node_id_label(from_s).map(|(id, _)| id).unwrap_or_else(|| from_s.to_string());
                let to = node_id_label(to_s).map(|(id, _)| id).unwrap_or_else(|| to_s.to_string());
                edges.push(Edge { from, to, label: lbl });
            }
        }
    }
    (nodes, edges)
}

fn esc(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

pub fn render_svg(content: &str) -> String {
    let (nodes, edges) = parse(content);

    if nodes.is_empty() {
        return r##"<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="white"/><text x="200" y="100" text-anchor="middle" font-family="sans-serif" fill="#888">No diagram content</text></svg>"##.to_string();
    }

    let pad = 40.0_f64;
    let min_x = nodes.values().map(|n| n.x).fold(f64::INFINITY, f64::min);
    let min_y = nodes.values().map(|n| n.y).fold(f64::INFINITY, f64::min);
    let max_x = nodes.values().map(|n| n.x + n.w).fold(f64::NEG_INFINITY, f64::max);
    let max_y = nodes.values().map(|n| n.y + n.h).fold(f64::NEG_INFINITY, f64::max);
    let total_w = (max_x - min_x + pad * 2.0).max(400.0);
    let total_h = (max_y - min_y + pad * 2.0).max(300.0);
    let ox = pad - min_x;
    let oy = pad - min_y;

    let mut svg = format!(
        r##"<svg xmlns="http://www.w3.org/2000/svg" width="{total_w:.0}" height="{total_h:.0}"><defs><marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#555"/></marker></defs><rect width="100%" height="100%" fill="white"/>"##
    );

    for e in &edges {
        if let (Some(from), Some(to)) = (nodes.get(&e.from), nodes.get(&e.to)) {
            let x1 = from.x + from.w / 2.0 + ox;
            let y1 = from.y + from.h / 2.0 + oy;
            let x2 = to.x + to.w / 2.0 + ox;
            let y2 = to.y + to.h / 2.0 + oy;
            svg.push_str(&format!(
                r##"<line x1="{x1:.1}" y1="{y1:.1}" x2="{x2:.1}" y2="{y2:.1}" stroke="#555" stroke-width="1.5" marker-end="url(#arr)"/>"##
            ));
            if let Some(lbl) = &e.label {
                let mx = (x1 + x2) / 2.0;
                let my = (y1 + y2) / 2.0 - 4.0;
                let escaped = esc(lbl);
                svg.push_str(&format!(
                    r##"<text x="{mx:.1}" y="{my:.1}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#555">{escaped}</text>"##
                ));
            }
        }
    }

    for node in nodes.values() {
        let rx = node.x + ox;
        let ry = node.y + oy;
        let rw = node.w;
        let rh = node.h;
        let cx = rx + rw / 2.0;
        let cy = ry + rh / 2.0;
        let label = esc(&node.label);
        svg.push_str(&format!(
            r##"<rect x="{rx:.1}" y="{ry:.1}" width="{rw:.1}" height="{rh:.1}" rx="6" fill="white" stroke="#4a6fa5" stroke-width="1.5"/><text x="{cx:.1}" y="{cy:.1}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="13" fill="#1a1a2e">{label}</text>"##
        ));
    }

    svg.push_str("</svg>");
    svg
}
