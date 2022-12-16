import { z, ZodType } from "zod";

export async function get<Schema extends ZodType>(
  endpoint: string,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const res = await fetch(endpoint);
  const json = await res.json();
  return schema.parse(json);
}

export async function post<Schema extends ZodType>({
  endpoint,
  contentType,
  body,
  schemaReq,
  schemaRes,
}: {
  endpoint: string;
  contentType?: "application/json" | "application/x-www-form-urlencoded";
  body: object;
  schemaReq?: Schema;
  schemaRes?: Schema;
}): Promise<z.infer<Schema>> {
  // console.log("post request to endpoint", endpoint);
  // console.log("body", body);
  // console.log("stringified body => ", JSON.stringify(body));
  // console.log(
  //   "stringified parsed body => ",
  //   JSON.stringify(schemaReq === undefined ? body : schemaReq.parse(body)),
  // );
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": contentType ?? "application/json",
      },
      body: JSON.stringify(
        schemaReq === undefined ? body : schemaReq.parse(body),
      ),
    });
    const json = await res.json();
    // console.log("json =>", json);
    return schemaRes === undefined ? json : schemaRes.parse(json);
  } catch (err: any) {
    return { error: err.message };
  }
}
