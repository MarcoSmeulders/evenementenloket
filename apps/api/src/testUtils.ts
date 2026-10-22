import { Writable } from "node:stream";

/** Collects log output in memory so tests can inspect what was logged. */
export function captureLogs() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  return { stream, text: () => lines.join("") };
}
