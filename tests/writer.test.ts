import { EdfWriter } from "../src/index";
import { stringifyAnnotation, AnnotationType } from "../src/utils";

describe("test edf writer", () => {
  test("write", (done) => {
    const filePath = `${__dirname}/test.edf`;
    const edfWriter = new EdfWriter({
      filePath,
      params: {
        version: "0",
        startDateTime: new Date("September 16, 1987 20:35:00"),
        reserved: "Reserved field of 44 characters",
        nRecords: 2880,
        duration: 30,
        patient: {
          code: "MCH-0234567",
          gender: "female",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
        },
        recording: {
          startDate: new Date("September 16, 1987 20:35:00"),
          administrationCode: "PSG-1234/1987",
          technicianCode: "NN",
          equipmentCode: "Telemetry03",
        },
        signals: [
          {
            label: "EEG Fpz-Cz",
            transducer: "AgAgCl cup electrodes",
            physicalDimension: "uV",
            physicalMinimum: -440,
            physicalMaximum: 510,
            digitalMinimum: -2048,
            digitalMaximum: 2047,
            prefiltering: "HP:0.1Hz LP:75Hz N:50Hz",
            samples: 15000,
            reserved: "Reserved for EEG signal",
          },
          {
            label: "Temp rectal",
            transducer: "Rectal thermistor",
            physicalDimension: "degC",
            physicalMinimum: 34.4,
            physicalMaximum: 40.2,
            digitalMinimum: -2048,
            digitalMaximum: 2047,
            prefiltering: "LP:0.1Hz (first order)",
            samples: 3,
            reserved: "Reserved for Body temperature",
          },
        ],
      },
    });
    edfWriter.end();
    expect(
      Buffer.concat([
        edfWriter.headerBuffer,
        edfWriter.signalHeaderBuffer,
      ]).toString()
    ).toBe(
      "0       MCH-0234567 F 16-SEP-1987 Haagse_Harry                                          Startdate 16-SEP-1987 PSG-1234/1987 NN Telemetry03                              16.09.8720.35.00768     Reserved field of 44 characters             2880    30      2   EEG Fpz-Cz      Temp rectal     AgAgCl cup electrodes                                                           Rectal thermistor                                                               uV      degC    -440    34.4    510     40.2    -2048   -2048   2047    2047    HP:0.1Hz LP:75Hz N:50Hz                                                         LP:0.1Hz (first order)                                                          15000   3       Reserved for EEG signal         Reserved for Body temperature   "
    );
    edfWriter.on("close", () => {
      done();
    });
  });
});
