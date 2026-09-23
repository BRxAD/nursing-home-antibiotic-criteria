var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var password = process.env.SITE_PASSWORD;
if (!password) {
  console.error("Set SITE_PASSWORD before running this.");
  process.exit(1);
}

var iterations = 150000;
var criteria = fs.readFileSync(path.join(__dirname, "criteria.js"));
var app = fs.readFileSync(path.join(__dirname, "app.js"));
var plain = Buffer.from(JSON.stringify({
  criteria: criteria.toString("utf8"),
  app: app.toString("utf8")
}), "utf8");

var salt = crypto.randomBytes(16);
var iv = crypto.randomBytes(12);
var key = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
var cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
var encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
var tag = cipher.getAuthTag();

var decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(tag);
var roundtrip = Buffer.concat([decipher.update(encrypted), decipher.final()]);
if (!roundtrip.equals(plain)) {
  console.error("Encryption check failed.");
  process.exit(1);
}

var docs = path.join(__dirname, "docs");
fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, "bundle.enc"), Buffer.concat([salt, iv, encrypted, tag]).toString("base64"));
fs.copyFileSync(path.join(__dirname, "styles.css"), path.join(docs, "styles.css"));
fs.copyFileSync(path.join(__dirname, "shea-logo.png"), path.join(docs, "shea-logo.png"));
console.log("Wrote docs/bundle.enc");
