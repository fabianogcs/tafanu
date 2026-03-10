"use client";

import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// 🛡️ Isso aqui é o que o seu editor usa
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
