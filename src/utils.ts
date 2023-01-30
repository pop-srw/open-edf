import format from "date-fns/format";

export type PatientType = {
  code?: string;
  gender?: "male" | "female" | "";
  birthDate?: Date;
  name?: string;
  additional?: string;
};

export type RecordingType = {
  startDate?: Date;
  administrationCode?: string;
  technicianCode?: string;
  equipmentCode?: string;
  additional?: string;
};

export type SignalType = {
  label: string;
  transducer: string;
  physicalDimension: string;
  physicalMinimum: number;
  physicalMaximum: number;
  digitalMinimum: number;
  digitalMaximum: number;
  prefiltering: string;
  samples: number;
  reserved: string;
};

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

type EncodeDataRecordOpts = {
  dataRecord: number[][];
  hasAnnotation: boolean;
};

type CheckDataRecordDimensionsOpts = {
  signals: SignalType[];
  dataRecord: number[][];
};

export const getVersionString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  return header.version;
};

export const getPatientString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  const code = header.patient?.code ?? "X";
  const birthDate = header.patient?.birthDate
    ? format(header.patient?.birthDate, "dd-MMM-yyyy").toUpperCase()
    : "X";
  const gender =
    header.patient?.gender === "male"
      ? "M"
      : header.patient?.gender === "female"
      ? "F"
      : "X";
  const name = header.patient?.name ?? "X";
  const additional = header.patient?.additional ?? "";

  return [code, gender, birthDate, name, additional].join(" ");
};

export const getRecordingString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  const startDate = header.recording?.startDate
    ? format(header.recording?.startDate, "dd-MMM-yyyy").toUpperCase()
    : "X";
  const administrationCode = header.recording?.administrationCode ?? "X";
  const technicianCode = header.recording?.technicianCode ?? "X";
  const equipmentCode = header.recording?.equipmentCode ?? "X";
  const additional = header.recording?.additional ?? "";

  return [
    "Startdate",
    startDate,
    administrationCode,
    technicianCode,
    equipmentCode,
    additional,
  ].join(" ");
};

/* start date, start time */
export const getStartDateTimeString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  return format(header.startDateTime, "dd.MM.yyHH.mm.ss");
};

/* number of bytes in header record */
export const getHeaderBytesString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  return (256 + header.signals.length * 256).toString();
};

export const getReservedString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  return header.reserved;
};

export const getRecordsString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  return header.nRecords.toString();
};

export const getDurationString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  return header.duration.toString();
};

export const getSignalsString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  return header.signals.length.toString();
};

const HEADER_ATTRIBUTES = [];

type EdfHeaderType = {
  version: string;
  patient: PatientType;
  recording: RecordingType;
  startDateTime: Date;
  reserved: string;
  nRecords: number;
  duration: number;
  signals: SignalType[];
};

type ParseEdfPlusHeaderOpts = {
  patient?: {
    code?: string;
    gender?: "male" | "female";
    birthDate?: Date;
    name?: string;
    additional?: string;
  };
  recording?: {
    startDate?: Date;
    administrationCode?: string;
    technicianCode?: string;
    equipmentCode?: string;
    additional?: string;
  };
  startDateTime: Date;
  reserved: "EDF+C" | "EDF+D";
  duration: number;
  signals: SignalType[];
};

export const encodeHeader = (opts: EncodeHeaderOpts) => {
  /* write header */
  const buf = Buffer.allocUnsafe(256).fill(" ");
  buf.subarray(0, 8).set(Buffer.from(opts.version).subarray(0, 8));
  buf.subarray(8, 88).set(Buffer.from(opts.patient).subarray(0, 80));
  buf.subarray(88, 168).set(Buffer.from(opts.recording).subarray(0, 80));
  buf.subarray(168, 184).set(Buffer.from(opts.headerBytes).subarray(0, 16));
  buf.subarray(184, 192).set(Buffer.from(opts.startDateTime).subarray(0, 8));
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

export const encodeDataRecord = (opts: EncodeDataRecordOpts) => {
  const bufs: Buffer[] = [];
  for (let ch = 0; ch < opts.dataRecord.length; ch++) {
    /* check has annotation and last channel */
    if (opts.hasAnnotation && ch == opts.dataRecord.length - 1) {
      const tmp = Buffer.from(Uint8Array.from(opts.dataRecord[ch]).buffer);
      bufs.push(tmp);
      continue;
    }
    const tmp = Buffer.from(Int16Array.from(opts.dataRecord[ch]).buffer);
    bufs.push(tmp);
  }
  return Buffer.concat(bufs);
};

export type AnnotationType = {
  onset: number;
  duration?: number;
  message: string;
};

type StringifyAnnotationOpts = {
  annotations: AnnotationType[];
  dataRecordIdx: number;
  duration: number;
  annotationSignal: SignalType;
};

/* annotation characters */
const AC0 = "\0";
const AC20 = "\u0014";
const AC21 = "\u0015";

/*
start pattern
+[record onset][20][20][0]

payload pattern - concat after start pattern
pattern 1 - no payload
[empty]
pattern 2 - single payload
+[onset A][20][message X][20][0]
pattern 3 - multiple payload
+[onset A][20][message X][20][0]+[onset B][20][message Y][20][0]
pattern 4 - multiple payload with same onset
+[onset A][20][message X][20][0]+[onset A][20][message Y][20][0]
pattern 5 - shorthand for the same onset
onset A][20][message X][20][message Y][20][0]
pattern 6 - payload with duration
+[onset A][20][duration][21][message X][20][0]
*/
// support pattern 1 and 2
// does not support negative onset yet
// does not support duration yet
export const stringifyAnnotation = (opts: StringifyAnnotationOpts) => {
  let str = `+${opts.dataRecordIdx * opts.duration}${AC20}${AC20}${AC0}`;
  const maxLength = opts.annotationSignal.samples * 2;

  while (opts.annotations.length > 0) {
    const annotation = opts.annotations[0];
    const tmp = `+${annotation.onset}${AC20}${annotation.message}${AC20}${AC0}`;

    /* if no in available reange of memory block, return concated string */
    if (str.length + tmp.length > maxLength) {
      return str;
    }

    str += tmp;
    opts.annotations.shift();
  }
  return str;
};

export const checkAnnotation = (signals: SignalType[]) =>
  signals.reduce((hasAnnotaion, signal) => {
    return (
      hasAnnotaion ||
      signal.label === "EDF Annotations" ||
      signal.label === "BDF Annotations"
    );
  }, false);

export const checkDataRecordDimensions = (
  opts: CheckDataRecordDimensionsOpts
) => {
  const hasAnnotation = checkAnnotation(opts.signals);
  if (opts.dataRecord.length !== opts.signals.length) {
    console.debug(
      `number of signal mismatch ${opts.dataRecord.length}, ${opts.signals.length}`
    );
    return false;
  }

  /* count ordinary signals */
  const totalChannels = hasAnnotation
    ? opts.dataRecord.length - 1
    : opts.dataRecord.length;

  /* check ordinary signals */
  for (let ch = 0; ch < totalChannels; ch++) {
    if (opts.dataRecord[ch].length !== opts.signals[ch].samples) {
      console.debug(
        `number of samples in channel ${ch} mismatch, ${opts.dataRecord[ch].length}, ${opts.signals[ch].samples}`
      );
      return false;
    }
  }

  /* check annotation signal */
  if (hasAnnotation) {
    if (
      opts.dataRecord[totalChannels].length !==
      opts.signals[totalChannels].samples * 2
    ) {
      console.debug(
        `number of samples in annotation mismatch, ${
          opts.dataRecord[totalChannels].length
        }, ${opts.signals[totalChannels].samples * 2}`
      );
      return false;
    }
  }

  return true;
};
