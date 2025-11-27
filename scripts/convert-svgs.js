import fs from "fs";
import path from "path";
import sharp from "sharp";
import log from "../src/utils/logger";

var KNOWN_IMAGES = {
  favicon: {
    sizes: [16, 32, 48, 64, 128, 256],
    suffix: function suffix(size) {
      return "-" + size + "x" + size;
    },
  },
  "favicon-16x16": {
    sizes: [16],
    suffix: function suffix() {
      return "";
    },
  },
  "favicon-32x32": {
    sizes: [32],
    suffix: function suffix() {
      return "";
    },
  },
  "apple-touch-icon": {
    sizes: [180],
    suffix: function suffix() {
      return "";
    },
  },
  "og-image": {
    sizes: [{ width: 1200, height: 630 }],
    suffix: function suffix() {
      return "";
    },
  },
  "twitter-image": {
    sizes: [{ width: 1200, height: 600 }],
    suffix: function suffix() {
      return "";
    },
  },
  "android-chrome-192x192": {
    sizes: [192],
    suffix: function suffix() {
      return "";
    },
  },
  "android-chrome-512x512": {
    sizes: [512],
    suffix: function suffix() {
      return "";
    },
  },
};

function parseArgs() {
  var args = process.argv.slice(2);
  var directory = "./public";
  var depth = -1;

  for (var i = 0; i < args.length; i++) {
    if (args[i].startsWith("--depth=")) {
      depth = parseInt(args[i].split("=")[1], 10);
    } else if (!args[i].startsWith("--")) {
      directory = args[i];
    }
  }

  return { directory: directory, depth: depth };
}

function findSvgFiles(dir, currentDepth, maxDepth) {
  var results = [];

  if (maxDepth !== -1 && currentDepth > maxDepth) {
    return results;
  }

  var entries = fs.readdirSync(dir, { withFileTypes: true });

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      var subResults = findSvgFiles(fullPath, currentDepth + 1, maxDepth);
      results = results.concat(subResults);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
      results.push(fullPath);
    }
  }

  return results;
}

function getBaseName(filePath) {
  var fileName = path.basename(filePath);
  return fileName.replace(/\.svg$/i, "");
}

function getKnownImageConfig(baseName) {
  var lowerName = baseName.toLowerCase();
  for (var key in KNOWN_IMAGES) {
    if (lowerName === key.toLowerCase()) {
      return KNOWN_IMAGES[key];
    }
  }
  return null;
}

async function convertWithSize(svgPath, outputPath, sizeConfig) {
  var sharpInstance = sharp(svgPath, { density: 300 });

  if (typeof sizeConfig === "number") {
    sharpInstance = sharpInstance.resize(sizeConfig, sizeConfig, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  } else if (typeof sizeConfig === "object") {
    sharpInstance = sharpInstance.resize(sizeConfig.width, sizeConfig.height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  await sharpInstance
    .png({
      quality: 100,
      compressionLevel: 9,
    })
    .toFile(outputPath);
}

async function convertSvgToPng(svgPath) {
  var baseName = getBaseName(svgPath);
  var dirName = path.dirname(svgPath);
  var config = getKnownImageConfig(baseName);

  try {
    if (config) {
      for (var i = 0; i < config.sizes.length; i++) {
        var sizeConfig = config.sizes[i];
        var suffix = config.suffix(sizeConfig);
        var outputName = baseName + suffix + ".png";
        var outputPath = path.join(dirName, outputName);

        await convertWithSize(svgPath, outputPath, sizeConfig);

        // eslint-disable-next-line no-unused-vars
        var sizeLabel =
          typeof sizeConfig === "number"
            ? sizeConfig + "x" + sizeConfig
            : sizeConfig.width + "x" + sizeConfig.height;
      }
    } else {
      var pngPath = svgPath.replace(/\.svg$/i, ".png");
      await sharp(svgPath, { density: 300 })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(pngPath);
    }
  } catch (err) {
    log.error(`Error processing file ${svgPath}: ${err.message}`);
  }
}

async function main() {
  var config = parseArgs();
  var resolvedDir = path.resolve(config.directory);

  if (!fs.existsSync(resolvedDir)) {
    process.exit(1);
  }

  var svgFiles = findSvgFiles(resolvedDir, 0, config.depth);

  if (svgFiles.length === 0) {
    return;
  }

  for (var i = 0; i < svgFiles.length; i++) {
    await convertSvgToPng(svgFiles[i]);
  }
}

main();
