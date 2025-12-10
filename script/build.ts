import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, copyFile, writeFile } from "fs/promises";

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
  
  // Asegurar que el handler se exporte correctamente para Vercel
  // Leer el archivo generado y ajustar el export si es necesario
  const handlerContent = await readFile("api/handler.js", "utf-8");
  // Si el export está como module.exports.default, cambiarlo a module.exports
  const fixedContent = handlerContent.replace(
    /module\.exports\s*=\s*__toCommonJS\(index_exports\);/,
    `module.exports = __toCommonJS(index_exports);
// Asegurar compatibilidad con Vercel
if (module.exports.default) {
  module.exports = module.exports.default;
}`
  );
  await writeFile("api/handler.js", fixedContent);

  console.log("build complete!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
