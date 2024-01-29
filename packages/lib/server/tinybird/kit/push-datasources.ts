import fs from "fs";
import path from "path";
import dotenv from "dotenv";

import { raise } from "../../../utils/raise";

dotenv.config({ path: "../../.env" });

async function createDataSource(
  name: string,
  schema: string,
): Promise<unknown> {
  const url = `https://api.us-east.tinybird.co/v0/datasources?name=${name}&format=ndjson`;

  console.log("auth token => ", process.env.TINYBIRD_API_KEY);

  if (!process.env.TINYBIRD_API_KEY)
    return console.log("no tinybird api key found");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `schema=${schema}`,
  });

  if (!response.ok) {
    console.log(await response.json());
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

const directoryPath = path.join(__dirname, "../_datasources");

const readDirectory = (directoryPath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(`Unable to scan directory: ${err.message}`);
      } else {
        resolve(files || []);
      }
    });
  });
};

readDirectory(directoryPath)
  .then((files) => {
    const promises = files
      .filter((file) => file.endsWith(".datasource"))
      .map((file) => {
        const fileContent = fs.readFileSync(
          path.join(directoryPath, file),
          "utf8",
        );
        const schemaSection = fileContent
          .split("SCHEMA >")[1]
          ?.split(/\n{2,}/)[0];

        const schemaLines = schemaSection
          ?.split("\n")
          .filter((line) => line.trim() !== "");
        const schema =
          schemaLines
            ?.map((line) => {
              const [name, type, path] = line.trim().split(" ");
              return `${name?.replaceAll("`", "")} ${type} ${
                path?.split(",")[0]
              }`;
              // return `${name?.replaceAll('`', '')} ${type}`;
            })
            .join(",") ?? raise("schema not found");
        const name = file.split(".")[0] ?? raise("name not found");

        console.log("name => ", name);
        console.log("schema => ", schema);

        return createDataSource(name, schema);
      });

    return Promise.all(promises);
  })
  .catch(console.error);
