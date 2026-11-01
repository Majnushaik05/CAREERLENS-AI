/// <reference types="vite/client" />

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module 'mammoth/mammoth.browser' {
  const mammoth: any;
  export default mammoth;
}

declare module 'mammoth' {
  const mammoth: any;
  export default mammoth;
}
