import fs from "fs";
import path from "path";
import { ZodDefault, ZodNullable, ZodOptional } from "zod";

import { writes } from "..";

// fixme - there are some forced types here that would ideally be inferred properly

Object.values(writes).forEach(({ name, description, schema }) => {
  const dirPath = path.join(__dirname, "../_datasources");
  const filePath = path.join(dirPath, `${name}.datasource`);

  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  let descriptionText = "";

  if (description) {
    console.log("description => ", description);
    descriptionText += `DESCRIPTION >\n\t"${description}"\n\n`;
  }

  // Generate the tinybird schema for each item in the zod schema
  let schemaText = "SCHEMA >\n";

  Object.entries(schema._def.shape()).forEach(([key, s]) => {
    let shape = s;

    if (shape instanceof ZodDefault) {
      // @ts-expect-error - typescript isn't aware that we've already checked for ZodDefault
      shape = shape.removeDefault();
    }

    while (shape instanceof ZodOptional) {
      // console.log(`${key} (before unwrapping) => `, shape._def.typeName);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      shape = shape.unwrap();
      // console.log(`${key} (after unwrapping) => `, shape._def.typeName);
    }

    if (shape instanceof ZodNullable) {
      // console.log(`${key} is a nullable`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      shape = shape.unwrap();
    }

    const zodType = shape._def.typeName.toString();

    // @ts-expect-error - _def can have property checks -- ideally do proper type checking here
    // eslint-disable-next-line
    const type = s._def.checks?.some((c) => c.kind === "datetime")
      ? "DateTime"
      : zodType === "ZodString" || zodType === "ZodEnum"
        ? "String"
        : zodType === "ZodBoolean"
          ? "UInt8"
          : "";

    console.log(`${key} inner type => `, type);

    schemaText += `\t\`${key}\` ${type} \`json:$.${key}\`,\n`;
  });

  const datasourceText = descriptionText + schemaText;

  fs.writeFileSync(filePath, datasourceText, "utf8");
});
