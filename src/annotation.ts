import { SignalType } from "./type";

/* annotation characters */
const AC0 = "\0";
const AC20 = "\u0014";
const AC21 = "\u0015";

export type AnnotationType = {
  onset: number;
  duration?: number;
  message: string;
};

type StringifyAnnotationOpts = {
  annotations: AnnotationType[];
  dataRecordIdx: number;
  duration: number;
  annotationSignal: SignalType;
};

/*
start pattern
+[record onset][20][20][0]

payload pattern - concat after start pattern
pattern 1 - no payload
[empty]
pattern 2 - single payload
+[onset A][20][message X][20][0]
pattern 3 - multiple payload
+[onset A][20][message X][20][0]+[onset B][20][message Y][20][0]
pattern 4 - multiple payload with same onset
+[onset A][20][message X][20][0]+[onset A][20][message Y][20][0]
pattern 5 - shorthand for the same onset
onset A][20][message X][20][message Y][20][0]
pattern 6 - payload with duration
+[onset A][20][duration][21][message X][20][0]
*/
// support pattern 1 and 2
// does not support negative onset yet
// does not support duration yet
export const stringifyAnnotation = (opts: StringifyAnnotationOpts) => {
  const BYTES_PER_SAMPLE = 2;
  let str = `+${opts.dataRecordIdx * opts.duration}${AC20}${AC20}${AC0}`;
  const maxLength = opts.annotationSignal.samples * BYTES_PER_SAMPLE;

  while (opts.annotations.length > 0) {
    const annotation = opts.annotations[0];
    const tmp = `+${annotation.onset}${AC20}${annotation.message}${AC20}${AC0}`;

    /* if no in available reange of memory block, return concated string */
    if (str.length + tmp.length > maxLength) {
      return str;
    }

    str += tmp;
    opts.annotations.shift();
  }
  return str;
};
