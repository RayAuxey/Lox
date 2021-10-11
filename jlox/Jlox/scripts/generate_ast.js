const fs = require("fs");
const ps = require("process");
const path = require("path");

const {
  argv: [_, __, ...args],
} = ps;

if (args.length != 1) {
  console.log("Usage: generate_ast <output_dir>");
  ps.exit(64);
}
const outputDir = args[0];

const generateFieldDeclarations = (fields) => {
  let result = "";
  const fieldList = fields.split(",");
  for (const field of fieldList) {
    result += `final ${field.trim()};
    `;
  }
  return result;
};

const generateConstructor = (fields) => {
  let result = "";
  const fieldList = fields.split(",");
  for (const field of fieldList) {
    const [_, name] = field.trim().split(" ");
    result += `this.${name} = ${name};
      `;
  }
  return result;
};

const defineType = (baseName, className, fields) => {
  return `static class ${className} extends ${baseName} {
    ${generateFieldDeclarations(fields)}
    ${className} (${fields}) {
      ${generateConstructor(fields)}
    }
  }
  `;
};

const defineTypes = (baseName, types) => {
  let result = "";
  for (let type of types) {
    let [className, fields] = type.split(":").map((a) => a.trim());
    result += defineType(baseName, className, fields);
  }
  return result;
};

const defineAst = (outputDir, baseName, types) => {
  const pathToFIle = path.join(outputDir, `${baseName}.java`);

  fs.writeFileSync(
    pathToFIle,
    `package com.rayauxey.lox;

import java.util.List;

abstract class ${baseName} {
  ${defineTypes(baseName, types)}
}
`
  );
};

defineAst(outputDir, "Expr", [
  "Binary   : Expr left, Token operator, Expr right",
  "Grouping : Expr expression",
  "Literal  : Object value",
  "Unary    : Token operator, Expr right",
]);
