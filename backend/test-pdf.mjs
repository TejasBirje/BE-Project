import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { PDFParse } = await import("pdf-parse");
const uploadsDir = path.join(__dirname, "uploads");
const files = fs.readdirSync(uploadsDir).filter((f) => f.endsWith(".pdf"));
console.log("PDF files found:", files);

for (const file of files) {
  const absoluteFilePath = path.join(uploadsDir, file);
  const buffer = fs.readFileSync(absoluteFilePath);
  const uint8 = new Uint8Array(buffer);
  const parser = new PDFParse({ data: uint8 });
  await parser.load();
  const result = await parser.getText();
  const fullText = result.pages.map((p) => p.text).join("\n");
  console.log("\n=== " + file + " ===");
  console.log("Length: " + fullText.length + " chars");
  console.log("Preview: " + fullText.slice(0, 200).replace(/\n/g, " "));
}

console.log("\n✅ PDF extraction test complete");
