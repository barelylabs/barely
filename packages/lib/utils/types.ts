export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireSome<T, K extends keyof T> = Omit<T, K> & Record<K, T[K]>;

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & Record<string, never>;

export type CommonKeys<T, U> = {
	[K in keyof T & keyof U]: K;
};
