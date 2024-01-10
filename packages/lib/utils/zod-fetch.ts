/* eslint-disable @typescript-eslint/no-unsafe-assignment */

//* GET *//
import type { Schema, z, ZodType } from "zod";
import { XMLParser } from "fast-xml-parser";

type ZFetchProps<ErrorSchema extends Schema> = {
  headers?: Record<string, string>;
  auth?: string;
  returnType?: "json" | "text" | "xml";
  errorSchema?: ErrorSchema;
  logResponse?: boolean;
} & (
  | { contentType?: "application/json"; body?: object }
  | {
      contentType: "application/x-www-form-urlencoded";
      body: Record<string, string>;
    }
);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
});

interface FormattedResponse {
  res: Response;
  status: number;
  data: unknown;
}

async function formatResponse(
  res: Response,
  options?: Omit<ZFetchProps<ZodType<unknown>>, "errorSchema">,
) {
  if (options?.returnType === "text") {
    const text = await res.text();

    options.logResponse && console.log("zGet res.text => ", text);

    return {
      res,
      status: res.status,
      data: text,
    } satisfies FormattedResponse;
  } else if (options?.returnType === "xml") {
    const text = await res.text();

    options.logResponse && console.log("zGet res.text => ", text);

    const parsed: unknown = xmlParser.parse(text);

    return {
      res,
      status: res.status,
      data: parsed,
    } satisfies FormattedResponse;
  } else {
    const json = await res.json();

    options?.logResponse && console.log("zGet res.json => ", json);

    return {
      res,
      status: res.status,
      data: json,
    } satisfies FormattedResponse;
  }
}

type ZFetchResponse<Schema extends ZodType, ErrorSchema extends ZodType> = {
  status: number;
  res: Response;
  // json: unknown;
} & (
  | {
      success: true;
      parsed: true;
      data: z.infer<Schema>;
    }
  | {
      success: true;
      parsed: false;
      data: unknown;
    }
  | {
      success: false;
      parsed: true;
      data: z.infer<ErrorSchema>;
    }
  | {
      success: false;
      parsed: false;
      data: unknown;
    }
);

function parseResponse<
  SuccessSchema extends Schema,
  ErrorSchema extends Schema,
>(
  formattedResponse: FormattedResponse,
  schema: SuccessSchema,
  errorSchema?: ErrorSchema,
  options?: ZFetchProps<ErrorSchema>,
) {
  if (formattedResponse.status >= 400 && options?.errorSchema) {
    const error = options.errorSchema.safeParse(formattedResponse.data);
    if (!error.success) {
      return {
        status: formattedResponse.status,
        res: formattedResponse.res,
        // json: await formattedResponse.res.json(),
        success: false,
        parsed: false,
        data: formattedResponse.data,
      } satisfies ZFetchResponse<SuccessSchema, ErrorSchema>;
    } else {
      return {
        status: formattedResponse.status,
        res: formattedResponse.res,
        // json: await formattedResponse.res.json(),
        success: false,
        parsed: true,
        data: error.data,
      } satisfies ZFetchResponse<SuccessSchema, ErrorSchema>;
    }
  }

  if (formattedResponse.status >= 400 && !options?.errorSchema) {
    return {
      status: formattedResponse.status,
      res: formattedResponse.res,
      // json: await formattedResponse.res.json(),
      success: false,
      parsed: false,
      data: formattedResponse.data,
    } satisfies ZFetchResponse<SuccessSchema, ErrorSchema>;
  }

  const parsed = schema.safeParse(formattedResponse.data);

  if (!parsed.success) {
    return {
      status: formattedResponse.status,
      res: formattedResponse.res,
      // json: await formattedResponse.res.json(),
      success: false,
      parsed: false,
      data: parsed.error,
    } satisfies ZFetchResponse<SuccessSchema, ErrorSchema>;
  } else {
    return {
      status: formattedResponse.status,
      res: formattedResponse.res,
      // json: await formattedResponse.res.json(),
      success: true,
      parsed: true,
      data: parsed.data,
    } satisfies ZFetchResponse<SuccessSchema, ErrorSchema>;
  }
}

async function zGet<Schema extends ZodType, ErrorSchema extends ZodType>(
  endpoint: string,
  schema: Schema,
  options?: ZFetchProps<ErrorSchema>,
): Promise<ZFetchResponse<Schema, ErrorSchema>> {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      authorization: options?.auth ?? "",
      "Content-Type": options?.contentType ?? "application/json",
      ...options?.headers,
    },
  })
    .then(async (res) => formatResponse(res, options))
    .then((formattedRes) =>
      parseResponse(formattedRes, schema, options?.errorSchema, options),
    )
    .catch((err) => {
      console.error("zGet err => ", err);
      throw new Error("zGet err");
    });

  return response;
}

// post

async function zPost<Schema extends ZodType, ErrorSchema extends ZodType>(
  endpoint: string,
  schema: Schema,
  options: ZFetchProps<ErrorSchema>,
): Promise<ZFetchResponse<Schema, ErrorSchema>> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: options.auth ?? "",
      "Content-Type": options.contentType ?? "application/json",
      ...options?.headers,
    },
    body:
      options.contentType === "application/x-www-form-urlencoded"
        ? new URLSearchParams(options.body)
        : JSON.stringify(options.body),
  })
    .then((res) => formatResponse(res, options))
    .then((formattedRes) =>
      parseResponse(formattedRes, schema, options?.errorSchema, options),
    )

    .catch((err) => {
      console.error("zPost err => ", err);
      throw new Error("zPost err");
    });

  return response;
}

// delete

async function zDelete<Schema extends ZodType, ErrorSchema extends ZodType>(
  endpoint: string,
  schema: Schema,
  options: ZFetchProps<ErrorSchema>,
): Promise<ZFetchResponse<Schema, ErrorSchema>> {
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      authorization: options.auth ?? "",
      "Content-Type": options.contentType ?? "application/json",
      ...options?.headers,
    },
    body:
      options.contentType === "application/x-www-form-urlencoded"
        ? new URLSearchParams(options.body)
        : JSON.stringify(options.body),
  })
    .then((res) => formatResponse(res, options))
    .then((formattedRes) =>
      parseResponse(formattedRes, schema, options?.errorSchema, options),
    )

    .catch((err) => {
      console.error("zDelete err => ", err);
      throw new Error("zDelete err");
    });

  return response;
}

export { zGet, zPost, zDelete };
