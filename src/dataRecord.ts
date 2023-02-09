import { SignalType } from "./type";

type EncodeDataRecordOpts = {
  dataRecord: number[][];
  hasAnnotation: boolean;
  bytesPerSample?: 2 | 3;
};

type CheckDataRecordDimensionsOpts = {
  signals: SignalType[];
  dataRecord: number[][];
};

export const encodeDataRecord = (opts: EncodeDataRecordOpts) => {
  const BYTES_PER_SAMPLE = opts.bytesPerSample ?? 2;
  const SHIFT_BYTES = 4 - BYTES_PER_SAMPLE;
  const MULTIPLIER = 256 ** SHIFT_BYTES;
  const bufs: Buffer[] = [];
  for (let ch = 0; ch < opts.dataRecord.length; ch++) {
    /* check has annotation and last channel */
    if (opts.hasAnnotation && ch == opts.dataRecord.length - 1) {
      const tmp = Buffer.from(Uint8Array.from(opts.dataRecord[ch]).buffer);
      bufs.push(tmp);
      continue;
    }

    for (let i = 0; i < opts.dataRecord[ch].length; i++) {
      opts.dataRecord[ch][i] *= MULTIPLIER;
    }
    const chIntArray = Int32Array.from(opts.dataRecord[ch]);
    for (let s = 0; s < opts.dataRecord[ch].length; s++) {
      const tmp = Buffer.from(
        chIntArray.buffer.slice(s * 4 + SHIFT_BYTES, s * 4 + 4)
      );
      bufs.push(tmp);
    }

    // const tmp = Buffer.from(Int16Array.from(opts.dataRecord[ch]).buffer);
    // bufs.push(tmp);
  }
  return Buffer.concat(bufs);
};

export const checkAnnotation = (signals: SignalType[]) =>
  signals.reduce((hasAnnotaion, signal) => {
    return (
      hasAnnotaion ||
      signal.label === "EDF Annotations" ||
      signal.label === "BDF Annotations"
    );
  }, false);

export const checkDataRecordDimensions = (
  opts: CheckDataRecordDimensionsOpts
) => {
  const BYTES_PER_SAMPLE = 2;
  const hasAnnotation = checkAnnotation(opts.signals);
  if (opts.dataRecord.length !== opts.signals.length) {
    console.debug(
      `number of signal mismatch ${opts.dataRecord.length}, ${opts.signals.length}`
    );
    return false;
  }

  /* count ordinary signals */
  const totalChannels = hasAnnotation
    ? opts.dataRecord.length - 1
    : opts.dataRecord.length;

  /* check ordinary signals */
  for (let ch = 0; ch < totalChannels; ch++) {
    if (opts.dataRecord[ch].length !== opts.signals[ch].samples) {
      console.debug(
        `number of samples in channel ${ch} mismatch, ${opts.dataRecord[ch].length}, ${opts.signals[ch].samples}`
      );
      return false;
    }
  }

  /* check annotation signal */
  if (hasAnnotation) {
    if (
      opts.dataRecord[totalChannels].length !==
      opts.signals[totalChannels].samples * BYTES_PER_SAMPLE
    ) {
      console.debug(
        `number of samples in annotation mismatch, ${
          opts.dataRecord[totalChannels].length
        }, ${opts.signals[totalChannels].samples * BYTES_PER_SAMPLE}`
      );
      return false;
    }
  }

  return true;
};
