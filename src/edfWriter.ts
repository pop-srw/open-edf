import * as fs from "fs";
import { Writable } from "stream";
import { checkDataRecordDimensions, encodeDataRecord } from "./dataRecord";
import { encodeHeader, encodeSignalHeader } from "./header";
import { PatientType, RecordingType, SignalType } from "./type";
import {
  getDurationString,
  getHeaderBytesString,
  getPatientString,
  getRecordingString,
  getRecordsString,
  getReservedString,
  getSignalsString,
  getStartDateTimeString,
} from "./utils";

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

type EdfWriterConstructorParams = {
  fileType: "edf";
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
  reserved?: string;
  duration: number;
  signals: SignalType[];
};

type EdfPlusWriterConstructorParams = {
  fileType: "edf+";
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
  reserved?: "EDF+C" | "EDF+D";
  duration: number;
  signals: SignalType[];
};

type BdfWriterConstructorParams = {
  fileType: "bdf";
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
  duration: number;
  signals: SignalType[];
};

type BdfPlusWriterConstructorParams = {
  fileType: "bdf+";
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
  reserved?: "BDF+C" | "BDF+D";
  duration: number;
  signals: SignalType[];
};

type WriterConstructorParams =
  | EdfWriterConstructorParams
  | EdfPlusWriterConstructorParams
  | BdfWriterConstructorParams
  | BdfPlusWriterConstructorParams;

export class EdfWriter extends Writable {
  filePath: string;

  fd!: number;
  headerBuffer!: Buffer;
  signalHeaderBuffer!: Buffer;

  header!: EdfHeaderType;
  hasAnnotation: boolean = false;
  bytesPerSample: 2 | 3 = 2;

  constructor(options: { filePath: string; params: WriterConstructorParams }) {
    super({
      objectMode: true,
    });

    this.filePath = options.filePath;

    if (options.params.fileType === "edf") {
      this.header = {
        version: "0",
        nRecords: 0,
        reserved: options.params.reserved ?? "",
        ...options.params,
        patient: {
          ...options.params.patient,
        },
        recording: {
          ...options.params.recording,
        },
      };
      this.bytesPerSample = 2;
    } else if (options.params.fileType === "edf+") {
      this.header = {
        version: "0",
        nRecords: 0,
        reserved: options.params.reserved ?? "EDF+C",
        ...options.params,
        patient: {
          ...options.params.patient,
        },
        recording: {
          ...options.params.recording,
        },
      };
      this.bytesPerSample = 2;
    } else if (options.params.fileType === "bdf") {
      this.header = {
        version: ".BIOSEMI",
        nRecords: 0,
        reserved: "24BIT",
        ...options.params,
        patient: {
          ...options.params.patient,
        },
        recording: {
          ...options.params.recording,
        },
      };
      this.bytesPerSample = 3;
    } else if (options.params.fileType === "bdf+") {
      this.header = {
        version: ".BIOSEMI",
        nRecords: 0,
        reserved: options.params.reserved ?? "BDF+C",
        ...options.params,
        patient: {
          ...options.params.patient,
        },
        recording: {
          ...options.params.recording,
        },
      };
      this.bytesPerSample = 3;
    }

    /* write header */
    this.headerBuffer = encodeHeader({
      version: this.header.version,
      patient: getPatientString(this.header),
      recording: getRecordingString(this.header),
      headerBytes: getHeaderBytesString(this.header),
      startDateTime: getStartDateTimeString(this.header),
      reserved: getReservedString(this.header),
      nRecords: getRecordsString(this.header),
      duration: getDurationString(this.header),
      signals: getSignalsString(this.header),
    });

    /* write signal header */
    this.signalHeaderBuffer = encodeSignalHeader({
      signals: this.header.signals,
    });

    this.hasAnnotation = this.header.signals.reduce((hasAnnotaion, signal) => {
      return (
        hasAnnotaion ||
        signal.label === "EDF Annotations" ||
        signal.label === "BDF Annotations"
      );
    }, false);

    this.fd = fs.openSync(this.filePath, "w");
    fs.writeSync(
      this.fd,
      Buffer.concat([this.headerBuffer, this.signalHeaderBuffer])
    );
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    console.log("debug:", chunk);
    const dataRecord = chunk;

    if (
      checkDataRecordDimensions({
        signals: this.header.signals,
        dataRecord: dataRecord,
      }) == false
    ) {
      callback(new Error("mismatch data record dimension"));
    }

    const buf = encodeDataRecord({
      dataRecord: dataRecord,
      hasAnnotation: this.hasAnnotation,
      bytesPerSample: this.bytesPerSample,
    });
    fs.writeSync(this.fd, buf);

    /* add counter */
    this.header.nRecords += 1;
    callback();
  }

  _final(callback: (error?: Error | null) => void) {
    console.log("_final");
    /* update header in file */
    this.headerBuffer = encodeHeader({
      version: this.header.version,
      patient: getPatientString(this.header),
      recording: getRecordingString(this.header),
      headerBytes: getHeaderBytesString(this.header),
      startDateTime: getStartDateTimeString(this.header),
      reserved: getReservedString(this.header),
      nRecords: getRecordsString(this.header),
      duration: getDurationString(this.header),
      signals: getSignalsString(this.header),
    });
    fs.writeSync(this.fd, this.headerBuffer, 0, this.headerBuffer.length, 0);
    callback();
  }
}
