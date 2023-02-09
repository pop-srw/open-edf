import format from "date-fns/format";
import { EdfHeaderType } from "./type";

export const getVersionString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  return header.version;
};

export const getPatientString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  const code = header.patient?.code || "X";
  const birthDate = header.patient?.birthDate
    ? format(header.patient?.birthDate, "dd-MMM-yyyy").toUpperCase()
    : "X";
  const gender =
    header.patient?.gender === "male"
      ? "M"
      : header.patient?.gender === "female"
      ? "F"
      : "X";
  const name = header.patient?.name || "X";
  const additional = header.patient?.additional || "";

  const l = [code, gender, birthDate, name];
  if (additional) l.push(additional);

  return l.join(" ");
};

export const getRecordingString: (header: EdfHeaderType) => string = (
  header: EdfHeaderType
) => {
  const startDate = header.recording?.startDate
    ? format(header.recording?.startDate, "dd-MMM-yyyy").toUpperCase()
    : "X";
  const administrationCode = header.recording?.administrationCode || "X";
  const technicianCode = header.recording?.technicianCode || "X";
  const equipmentCode = header.recording?.equipmentCode || "X";
  const additional = header.recording?.additional || "";

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
