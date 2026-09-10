// Generates index.html, sites/index.html and annotations/annotations.xml
// from a single source of truth: sites.json
//
// Run as the Netlify build command: node scripts/build.js

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const sites = JSON.parse(fs.readFileSync(path.join(ROOT, "sites.json"), "utf8"));

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXmlAttr(str) {
  return escapeHtml(str);
}

// Turns a full URL into the bare "host/path*" pattern PSE annotations use,
// e.g. "https://spectrum.adobe.com/" -> "spectrum.adobe.com/*"
function toAnnotationPattern(url) {
  const noProtocol = url.replace(/^https?:\/\//, "");
  const withoutTrailingSlash = noProtocol.replace(/\/$/, "");
  return `${withoutTrailingSlash}/*`;
}

function renderSiteListHtml(sites) {
  return sites
    .map((site) => {
      const href = escapeHtml(`${site.url}?ref=designsystems.directory`);
      return `            <li>
              <a href="${href}" target="_blank"
                ><span class="org">${escapeHtml(site.org)}</span> -
                <span class="ds">${escapeHtml(site.ds)}</span></a
              >
            </li>`;
    })
    .join("\n");
}

function renderAnnotationsXml(sites) {
  const entries = sites
    .map((site) => {
      const about = toAnnotationPattern(site.url);
      return `    <Annotation about="${escapeXmlAttr(about)}">
        <Label name="_include_"></Label>
        <AdditionalData attribute="original_url" value="${escapeXmlAttr(site.url)}"></AdditionalData>
    </Annotation>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Annotations>\n${entries}\n</Annotations>\n`;
}

function writeFromTemplate(templatePath, outPath, replacements) {
  let content = fs.readFileSync(templatePath, "utf8");
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.split(placeholder).join(value);
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, "utf8");
}

const count = String(sites.length);

writeFromTemplate(
  path.join(ROOT, "templates", "index.template.html"),
  path.join(ROOT, "index.html"),
  { "{{COUNT}}": count }
);

writeFromTemplate(
  path.join(ROOT, "templates", "sites.template.html"),
  path.join(ROOT, "sites", "index.html"),
  { "{{COUNT}}": count, "{{SITE_LIST}}": renderSiteListHtml(sites) }
);

fs.mkdirSync(path.join(ROOT, "annotations"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "annotations", "annotations.xml"),
  renderAnnotationsXml(sites),
  "utf8"
);

console.log(`Built ${count} sites -> index.html, sites/index.html, annotations/annotations.xml`);
