declare module "pdf-parse/lib/pdf-parse" {
  import type { Buffer } from "node:buffer";

  type PdfParseResult = {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown> | null;
    text: string;
    version: string;
  };

  export default function pdfParse(
    data: Buffer | ArrayBuffer | Uint8Array,
  ): Promise<PdfParseResult>;
}
