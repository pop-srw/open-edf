import * as fs from "fs";
import { encodeAnnotation } from "../src/annotation";
import { EdfWriter, EdfWriterChunkType } from "../src/edfWriter";

describe("test edf writer", () => {
  const filePath = `${__dirname}/test.edf`;

  afterAll(() => {
    console.log("removing edf file");
    fs.rmSync(filePath);
  });

  test("write header", async () => {
    const edfWriter = new EdfWriter({
      filePath,
      params: {
        fileType: "edf",
        startDateTime: new Date("September 16, 1987 20:35:00"),
        reserved: "Reserved field of 44 characters",
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

    /* wait for file closed */
    await new Promise<void>((resolve) => {
      edfWriter.on("close", resolve);
    });

    /* read file and check header */
    const data = fs.readFileSync(filePath);
    expect(data.toString()).toBe(
      "0       MCH-0234567 F 16-SEP-1987 Haagse_Harry                                          Startdate 16-SEP-1987 PSG-1234/1987 NN Telemetry03                              16.09.8720.35.00768     Reserved field of 44 characters             0       30      2   EEG Fpz-Cz      Temp rectal     AgAgCl cup electrodes                                                           Rectal thermistor                                                               uV      degC    -440    34.4    510     40.2    -2048   -2048   2047    2047    HP:0.1Hz LP:75Hz N:50Hz                                                         LP:0.1Hz (first order)                                                          15000   3       Reserved for EEG signal         Reserved for Body temperature   "
    );
  });

  test("write data record", async () => {
    const edfWriter = new EdfWriter({
      filePath,
      params: {
        fileType: "edf+",
        startDateTime: new Date("September 16, 1987 20:35:00"),
        reserved: "EDF+C",
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
            label: "EDF Annotations",
            transducer: "",
            physicalDimension: "",
            physicalMinimum: -1,
            physicalMaximum: 1,
            digitalMinimum: -32768,
            digitalMaximum: 32767,
            prefiltering: "",
            samples: 60,
            reserved: "",
          },
        ],
      },
    });
    edfWriter.write({
      type: "separated",
      data: [Array(15000).fill(0)],
      annotations: [
        {
          onset: 0,
          message: "Recording start",
        },
        {
          onset: 300,
          message: "Recording end",
        },
      ],
    } as EdfWriterChunkType);
    edfWriter.end();

    /* wait for file closed */
    await new Promise<void>((resolve) => {
      edfWriter.on("close", resolve);
    });

    /* read file and check header */
    const data = fs.readFileSync(filePath);
    /* check header */
    expect(data.slice(0, 256 + 256 * 2).toString()).toBe(
      "0       MCH-0234567 F 16-SEP-1987 Haagse_Harry                                          Startdate 16-SEP-1987 PSG-1234/1987 NN Telemetry03                              16.09.8720.35.00768     EDF+C                                       1       30      2   EEG Fpz-Cz      EDF Annotations AgAgCl cup electrodes                                                                                                                                           uV              -440    -1      510     1       -2048   -32768  2047    32767   HP:0.1Hz LP:75Hz N:50Hz                                                                                                                                         15000   60      Reserved for EEG signal                                         "
    );
    /* check ordinary signal */
    expect(
      data.slice(256 + 256 * 2, 256 + 256 * 2 + 15000 * 2)
    ).toStrictEqual<Buffer>(
      Buffer.from(Int16Array.from(new Array(15000).fill(0)).buffer)
    );
    /* check annotation signal */
    expect(data.slice(256 + 256 * 2 + 15000 * 2)).toStrictEqual<Buffer>(
      Buffer.from(
        "+0\u0014\u0014\0+0\u0014Recording start\u0014\0+300\u0014Recording end\u0014\0".padEnd(
          60 * 2,
          "\0"
        )
      )
    );
  });

  test("write data record with separated ordinary and annotation", async () => {
    const edfWriter = new EdfWriter({
      filePath,
      params: {
        fileType: "edf+",
        startDateTime: new Date("September 16, 1987 20:35:00"),
        reserved: "EDF+C",
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
            label: "EDF Annotations",
            transducer: "",
            physicalDimension: "",
            physicalMinimum: -1,
            physicalMaximum: 1,
            digitalMinimum: -32768,
            digitalMaximum: 32767,
            prefiltering: "",
            samples: 60,
            reserved: "",
          },
        ],
      },
    });
    edfWriter.write({
      type: "combined",
      data: [
        Array(15000).fill(0),
        encodeAnnotation({
          annotations: [
            {
              onset: 0,
              message: "Recording start",
            },
            {
              onset: 300,
              message: "Recording end",
            },
          ],
          dataRecordIdx: 0,
          annotationSignal: edfWriter.header.signals[1],
          duration: 1,
          bytesPerSample: 2,
        }),
      ],
    } as EdfWriterChunkType);
    edfWriter.end();

    /* wait for file closed */
    await new Promise<void>((resolve) => {
      edfWriter.on("close", resolve);
    });

    /* read file and check header */
    const data = fs.readFileSync(filePath);
    /* check header */
    expect(data.slice(0, 256 + 256 * 2).toString()).toBe(
      "0       MCH-0234567 F 16-SEP-1987 Haagse_Harry                                          Startdate 16-SEP-1987 PSG-1234/1987 NN Telemetry03                              16.09.8720.35.00768     EDF+C                                       1       30      2   EEG Fpz-Cz      EDF Annotations AgAgCl cup electrodes                                                                                                                                           uV              -440    -1      510     1       -2048   -32768  2047    32767   HP:0.1Hz LP:75Hz N:50Hz                                                                                                                                         15000   60      Reserved for EEG signal                                         "
    );
    /* check ordinary signal */
    expect(
      data.slice(256 + 256 * 2, 256 + 256 * 2 + 15000 * 2)
    ).toStrictEqual<Buffer>(
      Buffer.from(Int16Array.from(new Array(15000).fill(0)).buffer)
    );
    /* check annotation signal */
    expect(data.slice(256 + 256 * 2 + 15000 * 2)).toStrictEqual<Buffer>(
      Buffer.from(
        "+0\u0014\u0014\0+0\u0014Recording start\u0014\0+300\u0014Recording end\u0014\0".padEnd(
          60 * 2,
          "\0"
        )
      )
    );
  });

  test("write data record with array of combined ordinary and annotation", async () => {
    const edfWriter = new EdfWriter({
      filePath,
      params: {
        fileType: "edf+",
        startDateTime: new Date("September 16, 1987 20:35:00"),
        reserved: "EDF+C",
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
            label: "EDF Annotations",
            transducer: "",
            physicalDimension: "",
            physicalMinimum: -1,
            physicalMaximum: 1,
            digitalMinimum: -32768,
            digitalMaximum: 32767,
            prefiltering: "",
            samples: 60,
            reserved: "",
          },
        ],
      },
    });
    edfWriter.write([
      Array(15000).fill(0),
      encodeAnnotation({
        annotations: [
          {
            onset: 0,
            message: "Recording start",
          },
          {
            onset: 300,
            message: "Recording end",
          },
        ],
        dataRecordIdx: 0,
        annotationSignal: edfWriter.header.signals[1],
        duration: 1,
        bytesPerSample: 2,
      }),
    ] as EdfWriterChunkType);
    edfWriter.end();

    /* wait for file closed */
    await new Promise<void>((resolve) => {
      edfWriter.on("close", resolve);
    });

    /* read file and check header */
    const data = fs.readFileSync(filePath);
    /* check header */
    expect(data.slice(0, 256 + 256 * 2).toString()).toBe(
      "0       MCH-0234567 F 16-SEP-1987 Haagse_Harry                                          Startdate 16-SEP-1987 PSG-1234/1987 NN Telemetry03                              16.09.8720.35.00768     EDF+C                                       1       30      2   EEG Fpz-Cz      EDF Annotations AgAgCl cup electrodes                                                                                                                                           uV              -440    -1      510     1       -2048   -32768  2047    32767   HP:0.1Hz LP:75Hz N:50Hz                                                                                                                                         15000   60      Reserved for EEG signal                                         "
    );
    /* check ordinary signal */
    expect(
      data.slice(256 + 256 * 2, 256 + 256 * 2 + 15000 * 2)
    ).toStrictEqual<Buffer>(
      Buffer.from(Int16Array.from(new Array(15000).fill(0)).buffer)
    );
    /* check annotation signal */
    expect(data.slice(256 + 256 * 2 + 15000 * 2)).toStrictEqual<Buffer>(
      Buffer.from(
        "+0\u0014\u0014\0+0\u0014Recording start\u0014\0+300\u0014Recording end\u0014\0".padEnd(
          60 * 2,
          "\0"
        )
      )
    );
  });
});
