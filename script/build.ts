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
  
  // Crear package.json en api/ para forzar CommonJS
  const apiPackageJson = { type: "commonjs" };
  await writeFile("api/package.json", JSON.stringify(apiPackageJson, null, 2));
  
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
  try {
    const handlerContent = await readFile("api/handler.js", "utf-8");
    
    // Asegurar que el export sea compatible con Vercel
    // Vercel espera module.exports o module.exports.default
    let fixedContent = handlerContent;
    
    // Si tiene __toCommonJS, asegurar que el default se exporte correctamente
    if (handlerContent.includes('__toCommonJS') || handlerContent.includes('module.exports')) {
      // Verificar si ya tiene el export correcto
      if (!handlerContent.includes('module.exports = handlerFn') && 
          !handlerContent.includes('module.exports.default') &&
          handlerContent.includes('handlerFn')) {
        // Agregar compatibilidad al final del archivo
        fixedContent = handlerContent + `
// Compatibilidad con Vercel: asegurar que el handler esté disponible
if (typeof module !== 'undefined' && module.exports) {
  const handler = module.exports.default || module.exports;
  if (handler && typeof handler === 'function') {
    module.exports = handler;
  }
}`;
      }
    }
    
    await writeFile("api/handler.js", fixedContent);
    console.log("Handler export fixed for Vercel compatibility");
  } catch (error) {
    console.warn("Could not fix handler export:", error);
    // Continuar aunque falle, el build puede funcionar de todas formas
  }

  console.log("build complete!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
