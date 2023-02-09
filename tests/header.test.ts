import { encodeHeader, encodeSignalHeader } from "../src/header";

describe("test header encoding", () => {
  test("encode header", () => {
    expect(
      encodeHeader({
        version: "0",
        patient: "MCH-0234567 F 16-SEP-1987 Haagse_Harry",
        recording: "Startdate 16-SEP-1987 PSG-1234/1987 NN Telemetry03",
        headerBytes: "768",
        startDateTime: "16.09.8720.35.00",
        reserved: "Reserved field of 44 characters",
        nRecords: "0",
        duration: "30",
        signals: "2",
      }).toString()
    ).toBe(
      "0       MCH-0234567 F 16-SEP-1987 Haagse_Harry                                          Startdate 16-SEP-1987 PSG-1234/1987 NN Telemetry03                              16.09.8720.35.00768     Reserved field of 44 characters             0       30      2   "
    );
  });

  test("encode signal header", () => {
    expect(
      encodeSignalHeader({
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
      }).toString()
    ).toBe(
      "EEG Fpz-Cz      Temp rectal     AgAgCl cup electrodes                                                           Rectal thermistor                                                               uV      degC    -440    34.4    510     40.2    -2048   -2048   2047    2047    HP:0.1Hz LP:75Hz N:50Hz                                                         LP:0.1Hz (first order)                                                          15000   3       Reserved for EEG signal         Reserved for Body temperature   "
    );
  });
});
