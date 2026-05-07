import { readFileSync } from "fs";

export interface SourceHandler {
  jsonlToBufferList(): Buffer[];
}

export class TextSourceHandler implements SourceHandler {
  constructor(private readonly filepath: string) {}

  jsonlToBufferList(): Buffer[] {
    const content = readFileSync(this.filepath, "utf-8");
    return content
      .split("\n")
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0)
      .map((line) => Buffer.from(line, "utf-8"));
  }
}
