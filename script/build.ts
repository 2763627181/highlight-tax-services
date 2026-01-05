import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, copyFile, writeFile } from "fs/promises";
import { existsSync, readdirSync, statSync } from "fs";
import path from "path";

const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "helmet",
  "hpp",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "resend",
  "serverless-http",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
  "bcryptjs",
  "cookie-parser",
  "openid-client",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("building Vercel API handler...");
  await esbuild({
    entryPoints: ["api/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "api/handler.js",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: false,
    external: [],
    logLevel: "info",
  });

  // Copiar archivos estáticos a api/public para que el handler pueda acceder a ellos
  console.log("copying static files to api/public for Vercel...");
  const publicDir = "dist/public";
  const apiPublicDir = "api/public";
  
  try {
    // Crear directorio si no existe
    await mkdir(apiPublicDir, { recursive: true });
    
    // Copiar index.html
    const indexPath = path.join(publicDir, "index.html");
    const apiIndexPath = path.join(apiPublicDir, "index.html");
    if (existsSync(indexPath)) {
      await copyFile(indexPath, apiIndexPath);
      console.log("Copied index.html to api/public");
    }
    
    // Copiar carpeta assets si existe
    const assetsDir = path.join(publicDir, "assets");
    const apiAssetsDir = path.join(apiPublicDir, "assets");
    if (existsSync(assetsDir)) {
      await mkdir(apiAssetsDir, { recursive: true });
      const files = readdirSync(assetsDir);
      for (const file of files) {
        const srcPath = path.join(assetsDir, file);
        const destPath = path.join(apiAssetsDir, file);
        const stat = statSync(srcPath);
        if (stat.isFile()) {
          await copyFile(srcPath, destPath);
        }
      }
      console.log("Copied assets directory to api/public");
    }
    
    // Copiar favicon si existe
    const faviconPath = path.join(publicDir, "favicon.png");
    const apiFaviconPath = path.join(apiPublicDir, "favicon.png");
    if (existsSync(faviconPath)) {
      await copyFile(faviconPath, apiFaviconPath);
      console.log("Copied favicon.png to api/public");
    }
  } catch (error) {
    console.warn("Warning: Could not copy static files to api/public:", error);
    console.warn("This is not critical - Vercel should serve files from dist/public automatically");
  }

  console.log("build complete!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
