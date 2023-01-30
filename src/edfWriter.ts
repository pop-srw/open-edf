import format from "date-fns/format";

import {
  closeSync,
  createWriteStream,
  fstat,
  openSync,
  WriteStream,
  writeSync,
} from "fs";
import * as fs from "fs";
import { Writable } from "stream";
import {
  checkDataRecordDimensions,
  encodeDataRecord,
  encodeHeader,
  encodeSignalHeader,
  getDurationString,
  getHeaderBytesString,
  getPatientString,
  getRecordingString,
  getRecordsString,
  getReservedString,
  getSignalsString,
  getStartDateTimeString,
  PatientType,
  RecordingType,
  SignalType,
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
  version: string;
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
  reserved: string;
  nRecords: number;
  duration: number;
  signals: SignalType[];
};

export class EdfWriter extends Writable {
  filePath: string;

  fd!: number;
  headerBuffer!: Buffer;
  signalHeaderBuffer!: Buffer;

  header!: EdfHeaderType;
  hasAnnotation: boolean = false;

  constructor(options: {
    filePath: string;
    params: EdfWriterConstructorParams;
  }) {
    super({
      objectMode: true,
    });

    this.filePath = options.filePath;
    this.header = {
      ...options.params,
      patient: {
        ...options.params.patient,
      },
      recording: {
        ...options.params.recording,
      },
    };

    /* write header */
    this.headerBuffer = encodeHeader({
      version: this.header.version,
      patient: getPatientString(this.header),
      recording: getRecordingString(this.header),
      headerBytes: getStartDateTimeString(this.header),
      startDateTime: getHeaderBytesString(this.header),
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
      headerBytes: getStartDateTimeString(this.header),
      startDateTime: getHeaderBytesString(this.header),
      reserved: getReservedString(this.header),
      nRecords: getRecordsString(this.header),
      duration: getDurationString(this.header),
      signals: getSignalsString(this.header),
    });
    fs.writeSync(this.fd, this.headerBuffer, 0, this.headerBuffer.length, 0);
    callback();
  }
}
