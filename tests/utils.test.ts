import {
  getPatientString,
  getStartDateTimeString,
  getVersionString,
} from "../src/utils";

describe("test edf writer utils", () => {
  test("get version string", () => {
    expect(getVersionString({ version: "0" } as any)).toBe("0");
    expect(getVersionString({ version: ".BIOSEMI" } as any)).toBe(".BIOSEMI");
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

  test("get recording string", () => {
    expect(
      getStartDateTimeString({
        startDateTime: new Date(2023, 1, 5, 16, 15, 10),
      } as any)
    ).toBe("05.02.2316.15.10");
  });
});
