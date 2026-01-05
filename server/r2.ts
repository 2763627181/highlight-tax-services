/**
 * @fileoverview Cloudflare R2 Storage Integration
 * 
 * Este módulo proporciona funciones para subir y descargar archivos
 * desde Cloudflare R2, un almacenamiento de objetos compatible con S3.
 * 
 * @module server/r2
 * @version 1.0.0
 * 
 * ## Variables de Entorno Requeridas
 * - R2_ACCOUNT_ID: ID de cuenta de Cloudflare
 * - R2_ACCESS_KEY_ID: Access Key ID de R2
 * - R2_SECRET_ACCESS_KEY: Secret Access Key de R2
 * - R2_BUCKET_NAME: Nombre del bucket de R2
 * - R2_PUBLIC_URL: URL pública del bucket (opcional, para signed URLs)
 * 
 * ## Características
 * - Upload de archivos a R2
 * - Download de archivos desde R2
 * - Generación de URLs firmadas para acceso temporal
 * - Fallback a almacenamiento local si R2 no está configurado
 */

import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";

// Cargar variables de entorno
// Solo cargar dotenv en desarrollo (Vercel inyecta variables automáticamente)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  import("dotenv").then(({ config }) => config());
}

/**
 * Configuración de R2
 */
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

/**
 * Verifica si R2 está configurado
 */
export const isR2Configured = !!(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET_NAME &&
  R2_ACCOUNT_ID.trim().length > 0 &&
  R2_ACCESS_KEY_ID.trim().length > 0 &&
  R2_SECRET_ACCESS_KEY.trim().length > 0 &&
  R2_BUCKET_NAME.trim().length > 0
);

/**
 * Cliente S3 configurado para R2
 * 
 * R2 es compatible con S3 API, pero usa un endpoint personalizado
 */
let s3Client: S3Client | null = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
  console.log("[R2] Cloudflare R2 configurado correctamente");
} else {
  console.warn("[R2] Cloudflare R2 no está configurado. Se usará almacenamiento local.");
  console.warn("[R2] Para usar R2, configura: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME");
}

/**
 * Genera una key única para un archivo en R2
 * 
 * Formato: documents/{timestamp}-{random}-{sanitized-filename}
 * 
 * @param originalName - Nombre original del archivo
 * @returns Key única para el archivo en R2
 */
function generateR2Key(originalName: string): string {
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 100);
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  return `documents/${timestamp}-${random}-${sanitizedName}`;
}

/**
 * Sube un archivo a Cloudflare R2
 * 
 * @param filePath - Ruta local del archivo
 * @param fileName - Nombre original del archivo
 * @param mimeType - Tipo MIME del archivo
 * @returns Key del archivo en R2
 * 
 * @throws Error si R2 no está configurado o si falla la subida
 */
export async function uploadToR2(
  filePath: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  if (!isR2Configured || !s3Client) {
    throw new Error("R2 no está configurado");
  }

  try {
    const fileContent = await fs.promises.readFile(filePath);
    const key = generateR2Key(fileName);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
      Body: fileContent,
      ContentType: mimeType,
      // Metadata opcional
      Metadata: {
        originalName: fileName,
      },
    });

    await s3Client.send(command);
    console.log(`[R2] Archivo subido a R2: ${key}`);

    return key;
  } catch (error) {
    console.error("[R2] Error subiendo archivo a R2:", error);
    throw new Error(`Error al subir archivo a R2: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Genera una URL firmada para descargar un archivo de R2
 * 
 * Las URLs firmadas expiran después de 1 hora
 * 
 * @param key - Key del archivo en R2
 * @param expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
 * @returns URL firmada para descargar el archivo
 * 
 * @throws Error si R2 no está configurado o si falla la generación
 */
export async function getR2SignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!isR2Configured || !s3Client) {
    throw new Error("R2 no está configurado");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("[R2] Error generando URL firmada:", error);
    throw new Error(`Error al generar URL firmada: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verifica si un archivo existe en R2
 * 
 * @param key - Key del archivo en R2
 * @returns true si el archivo existe, false si no
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
  if (!isR2Configured || !s3Client) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error("[R2] Error verificando existencia de archivo:", error);
    return false;
  }
}

/**
 * Descarga un archivo de R2 a un archivo temporal
 * 
 * @param key - Key del archivo en R2
 * @param outputPath - Ruta donde guardar el archivo temporal
 * @returns Ruta del archivo descargado
 * 
 * @throws Error si R2 no está configurado o si falla la descarga
 */
export async function downloadFromR2(key: string, outputPath: string): Promise<string> {
  if (!isR2Configured || !s3Client) {
    throw new Error("R2 no está configurado");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error("El archivo está vacío");
    }

    // Convertir el stream a buffer
    const chunks: Uint8Array[] = [];
    // @ts-ignore - response.Body puede ser un stream o un Blob
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Guardar el archivo
    await fs.promises.writeFile(outputPath, buffer);
    console.log(`[R2] Archivo descargado de R2: ${key} -> ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error("[R2] Error descargando archivo de R2:", error);
    throw new Error(`Error al descargar archivo de R2: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Determina si un filePath es una key de R2 o una ruta local
 * 
 * @param filePath - Ruta o key del archivo
 * @returns true si es una key de R2 (empieza con "documents/"), false si es local
 */
export function isR2Key(filePath: string): boolean {
  return filePath.startsWith("documents/") || filePath.startsWith("r2://");
}

