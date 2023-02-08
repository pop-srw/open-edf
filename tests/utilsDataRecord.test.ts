import { encodeDataRecord } from "../src/utils";

describe("test edf writer utils", () => {
  test("encode edf data record gives correct bytes", () => {
    let buf = encodeDataRecord({
      dataRecord: [[0, 1, 2, 3]],
      hasAnnotation: false,
    });
    expect(buf).toHaveLength(8);

    buf = encodeDataRecord({
      dataRecord: [[0, 1, 2, 3], [4, 5], [6]],
      hasAnnotation: false,
    });
    expect(buf).toHaveLength(14);
  });

  test("encode edf data record gives correct buf value in little endian", () => {
    let buf = encodeDataRecord({
      dataRecord: [[0]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0x00);
    expect(buf[1]).toBe(0x00);

    buf = encodeDataRecord({
      dataRecord: [[1]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0x01);
    expect(buf[1]).toBe(0x00);

    buf = encodeDataRecord({
      dataRecord: [[-1]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0xff);
    expect(buf[1]).toBe(0xff);

    buf = encodeDataRecord({
      dataRecord: [[255]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0xff);
    expect(buf[1]).toBe(0x00);

    buf = encodeDataRecord({
      dataRecord: [[-255]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0x01);
    expect(buf[1]).toBe(0xff);

    buf = encodeDataRecord({
      dataRecord: [[32767]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0xff);
    expect(buf[1]).toBe(0x7f);

    buf = encodeDataRecord({
      dataRecord: [[-32768]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0x00);
    expect(buf[1]).toBe(0x80);

    /* overflow case */
    buf = encodeDataRecord({
      dataRecord: [[32768]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0x00);
    expect(buf[1]).toBe(0x80);
  });

  test("encode edf data record gives correct order of value", () => {
    let buf = encodeDataRecord({
      dataRecord: [[0, 1, 2, 3], [4, 5], [6]],
      hasAnnotation: false,
    });
    expect(buf[0]).toBe(0x00);
    expect(buf[1]).toBe(0x00);
    expect(buf[2]).toBe(0x01);
    expect(buf[3]).toBe(0x00);
    expect(buf[4]).toBe(0x02);
    expect(buf[5]).toBe(0x00);
    expect(buf[6]).toBe(0x03);
    expect(buf[7]).toBe(0x00);
    expect(buf[8]).toBe(0x04);
    expect(buf[9]).toBe(0x00);
    expect(buf[10]).toBe(0x05);
    expect(buf[11]).toBe(0x00);
    expect(buf[12]).toBe(0x06);
    expect(buf[13]).toBe(0x00);
  });
});
