import { encodeDataRecord } from "../src/dataRecord";
import {
  stringifyAnnotation,
  AnnotationType,
  encodeAnnotation,
} from "../src/annotation";
describe("test annotation", () => {
  test("encode edf+ annotation gives correct output when all messages fit in length", () => {
    const annotationSignal = {
      label: "EDF Annotations",
      samples: 60,
    };

    const annotations: AnnotationType[] = [];
    annotations.push({
      onset: 0,
      message: "Recording start",
    });
    annotations.push({
      onset: 300,
      message: "Recording end",
    });

    expect(annotations).toHaveLength(2);
    let buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 0,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 2,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 2,
    });
    expect(annotations).toHaveLength(0);
    expect(buf).toHaveLength(60 * 2);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from(
        "+0\u0014\u0014\0+0\u0014Recording start\u0014\0+300\u0014Recording end\u0014\0".padEnd(
          60 * 2,
          "\0"
        )
      )
    );

    buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 1,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 2,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 2,
    });
    expect(annotations).toHaveLength(0);
    expect(buf).toHaveLength(60 * 2);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from("+1\u0014\u0014\0".padEnd(60 * 2, "\0"))
    );
  });

  test("encode edf+ annotation gives correct output when single message fit in length", () => {
    const annotationSignal = {
      label: "EDF Annotations",
      samples: 15,
    };

    const annotations: AnnotationType[] = [];
    annotations.push({
      onset: 0,
      message: "Recording start",
    });
    annotations.push({
      onset: 300,
      message: "Recording end",
    });

    expect(annotations).toHaveLength(2);
    let buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 0,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 2,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 2,
    });
    expect(annotations).toHaveLength(1);
    expect(buf).toHaveLength(15 * 2);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from(
        "+0\u0014\u0014\0+0\u0014Recording start\u0014\0".padEnd(15 * 2, "\0")
      )
    );

    buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 1,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 2,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 2,
    });
    expect(annotations).toHaveLength(0);
    expect(buf).toHaveLength(15 * 2);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from(
        "+1\u0014\u0014\0+300\u0014Recording end\u0014\0".padEnd(15 * 2, "\0")
      )
    );

    buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 2,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 2,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 2,
    });
    expect(annotations).toHaveLength(0);
    expect(buf).toHaveLength(15 * 2);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from("+2\u0014\u0014\0".padEnd(15 * 2, "\0"))
    );
  });

  test("encode bdf+ annotation gives correct output when all messages fit in length", () => {
    const annotationSignal = {
      label: "BDF Annotations",
      samples: 40,
    };

    const annotations: AnnotationType[] = [];
    annotations.push({
      onset: 0,
      message: "Recording start",
    });
    annotations.push({
      onset: 300,
      message: "Recording end",
    });

    expect(annotations).toHaveLength(2);
    let buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 0,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 3,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 3,
    });
    expect(annotations).toHaveLength(0);
    expect(buf).toHaveLength(40 * 3);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from(
        "+0\u0014\u0014\0+0\u0014Recording start\u0014\0+300\u0014Recording end\u0014\0".padEnd(
          40 * 3,
          "\0"
        )
      )
    );

    buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 1,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 3,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 3,
    });
    expect(annotations).toHaveLength(0);
    expect(buf).toHaveLength(40 * 3);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from("+1\u0014\u0014\0".padEnd(40 * 3, "\0"))
    );
  });

  test("encode bdf+ annotation gives correct output when single message fit in length", () => {
    const annotationSignal = {
      label: "BDF Annotations",
      samples: 10,
    };

    const annotations: AnnotationType[] = [];
    annotations.push({
      onset: 0,
      message: "Recording start",
    });
    annotations.push({
      onset: 300,
      message: "Recording end",
    });

    expect(annotations).toHaveLength(2);
    let buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 0,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 3,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 3,
    });
    expect(annotations).toHaveLength(1);
    expect(buf).toHaveLength(10 * 3);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from(
        "+0\u0014\u0014\0+0\u0014Recording start\u0014\0".padEnd(10 * 3, "\0")
      )
    );

    buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 1,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 3,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 3,
    });
    expect(annotations).toHaveLength(0);
    expect(buf).toHaveLength(10 * 3);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from(
        "+1\u0014\u0014\0+300\u0014Recording end\u0014\0".padEnd(10 * 3, "\0")
      )
    );

    buf = encodeDataRecord({
      dataRecord: [
        Array.from(
          encodeAnnotation({
            annotations: annotations,
            dataRecordIdx: 2,
            annotationSignal: annotationSignal as any,
            duration: 1,
            bytesPerSample: 3,
          })
        ),
      ],
      hasAnnotation: true,
      bytesPerSample: 3,
    });
    expect(annotations).toHaveLength(0);
    expect(buf).toHaveLength(10 * 3);
    expect(buf).toStrictEqual<Buffer>(
      Buffer.from("+2\u0014\u0014\0".padEnd(10 * 3, "\0"))
    );
  });
});
