import {
  encodeHeader,
  encodeSignalHeader,
  getPatientString,
  getVersionString,
} from "../src/utils";

describe("test edf writer utils", () => {
  test("get version string", () => {
    expect(getVersionString({ version: "0" } as any)).toBe("0");
    expect(getVersionString({ version: "\u00ffBIOSEMI" } as any)).toBe(
      "\u00ffBIOSEMI"
    );
  });

  test("get version string", () => {
    /* full case female */
    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "female",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
          additional: "additional",
        },
      } as any)
    ).toBe("MCH-0234567 F 16-SEP-1987 Haagse_Harry additional");

    /* full case male */
    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "male",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
          additional: "additional",
        },
      } as any)
    ).toBe("MCH-0234567 M 16-SEP-1987 Haagse_Harry additional");

    /* full case no gender */
    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "feale",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
        },
      } as any)
    ).toBe("MCH-0234567 X 16-SEP-1987 Haagse_Harry");

    /* partial case - no code */
    expect(
      getPatientString({
        patient: {
          code: "",
          gender: "female",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
          additional: "additional",
        },
      } as any)
    ).toBe("X F 16-SEP-1987 Haagse_Harry additional");
    expect(
      getPatientString({
        patient: {
          gender: "female",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
          additional: "additional",
        },
      } as any)
    ).toBe("X F 16-SEP-1987 Haagse_Harry additional");

    /* partial case - no gender */
    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
          additional: "additional",
        },
      } as any)
    ).toBe("MCH-0234567 X 16-SEP-1987 Haagse_Harry additional");

    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
          additional: "additional",
        },
      } as any)
    ).toBe("MCH-0234567 X 16-SEP-1987 Haagse_Harry additional");

    /* partial case - no birthday */
    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "female",
          name: "Haagse_Harry",
          additional: "additional",
        },
      } as any)
    ).toBe("MCH-0234567 F X Haagse_Harry additional");

    /* partial case - no name */
    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "female",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "",
          additional: "additional",
        },
      } as any)
    ).toBe("MCH-0234567 F 16-SEP-1987 X additional");

    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "female",
          birthDate: new Date("September 16, 1987 20:35:00"),
          additional: "additional",
        },
      } as any)
    ).toBe("MCH-0234567 F 16-SEP-1987 X additional");

    /* partial case - no additional */
    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "female",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
          additional: "",
        },
      } as any)
    ).toBe("MCH-0234567 F 16-SEP-1987 Haagse_Harry");

    expect(
      getPatientString({
        patient: {
          code: "MCH-0234567",
          gender: "female",
          birthDate: new Date("September 16, 1987 20:35:00"),
          name: "Haagse_Harry",
        },
      } as any)
    ).toBe("MCH-0234567 F 16-SEP-1987 Haagse_Harry");

    /* empty case */
    expect(getPatientString({} as any)).toBe("X X X X");
  });

  test("get recording string", () => {});

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
