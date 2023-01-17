import { z, ZodType } from 'zod';

type zEnvProps<Schema extends ZodType> = {
	env: NodeJS.ProcessEnv;
	schema: Schema;
};

export function zEnv<Schema extends ZodType>({
	env,
	schema,
}: zEnvProps<Schema>): z.infer<Schema> {
	const parsedEnv = schema.parse(env);
	return parsedEnv;
}
