// heic2any ships no types of its own. Only the call shape ReviewForm.tsx
// actually uses is declared here — a single HEIC/HEIF blob in, a single
// converted blob out (the library also supports arrays and multi-output
// conversions, which we don't use).
declare module 'heic2any' {
  interface Heic2AnyOptions {
    blob: Blob;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }

  function heic2any(options: Heic2AnyOptions): Promise<Blob | Blob[]>;

  export default heic2any;
}
