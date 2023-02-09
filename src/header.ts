import { SignalType } from "./type";

type EncodeHeaderOpts = {
  version: string;
  patient: string;
  recording: string;
  headerBytes: string;
  startDateTime: string;
  reserved: string;
  nRecords: string;
  duration: string;
  signals: string;
};

type EncodeSignalHeaderOpts = {
  signals: SignalType[];
};

export const encodeHeader = (opts: EncodeHeaderOpts) => {
  /* write header */
  const buf = Buffer.allocUnsafe(256).fill(" ");
  buf.subarray(0, 8).set(Buffer.from(opts.version).subarray(0, 8));
  buf.subarray(8, 88).set(Buffer.from(opts.patient).subarray(0, 80));
  buf.subarray(88, 168).set(Buffer.from(opts.recording).subarray(0, 80));
  buf.subarray(168, 184).set(Buffer.from(opts.startDateTime).subarray(0, 16));
  buf.subarray(184, 192).set(Buffer.from(opts.headerBytes).subarray(0, 8));
  buf.subarray(192, 236).set(Buffer.from(opts.reserved).subarray(0, 44));
  buf.subarray(236, 244).set(Buffer.from(opts.nRecords).subarray(0, 8));
  buf.subarray(244, 252).set(Buffer.from(opts.duration).subarray(0, 8));
  buf.subarray(252, 256).set(Buffer.from(opts.signals).subarray(0, 4));
  return buf;
};

export const encodeSignalHeader = (opts: EncodeSignalHeaderOpts) => {
  /* write signal header */
  const buf = Buffer.allocUnsafe(opts.signals.length * 256).fill(" ");
  opts.signals.map((signal, ch, signals) => {
    const s = ch * 16;
    buf.subarray(s, s + 16).set(Buffer.from(signal.label).subarray(0, 16));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 16 * signals.length + 80 * ch;
    buf.subarray(s, s + 80).set(Buffer.from(signal.transducer).subarray(0, 80));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 96 * signals.length + 8 * ch;
    buf
      .subarray(s, s + 8)
      .set(Buffer.from(signal.physicalDimension).subarray(0, 8));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 104 * signals.length + 8 * ch;
    buf
      .subarray(s, s + 8)
      .set(Buffer.from(signal.physicalMinimum.toString()).subarray(0, 8));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 112 * signals.length + 8 * ch;
    buf
      .subarray(s, s + 8)
      .set(Buffer.from(signal.physicalMaximum.toString()).subarray(0, 8));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 120 * signals.length + 8 * ch;
    buf
      .subarray(s, s + 8)
      .set(Buffer.from(signal.digitalMinimum.toString()).subarray(0, 8));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 128 * signals.length + 8 * ch;
    buf
      .subarray(s, s + 8)
      .set(Buffer.from(signal.digitalMaximum.toString()).subarray(0, 8));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 136 * signals.length + 80 * ch;
    buf
      .subarray(s, s + 80)
      .set(Buffer.from(signal.prefiltering).subarray(0, 80));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 216 * signals.length + 8 * ch;
    buf
      .subarray(s, s + 8)
      .set(Buffer.from(signal.samples.toString()).subarray(0, 8));
  });
  opts.signals.map((signal, ch, signals) => {
    const s = 224 * signals.length + 32 * ch;
    buf.subarray(s, s + 32).set(Buffer.from(signal.reserved).subarray(0, 32));
  });
  return buf;
};
