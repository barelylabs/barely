type Clx = string | Array<string | boolean>;
export const clx = (input: Clx) => {
	if (Array.isArray(input)) {
		return input.filter(Boolean).join(' ');
	} else if (typeof input === 'string') {
		return input.trim();
	}
	return '';
};

interface StyleOptions {
	before?: string | Array<string | boolean>;
	after?: string | Array<string | boolean>;
	additional?: Record<string | number, Clx>;
}

export type StyleProps<T> = {
	[K in keyof Partial<
		Omit<
			Omit<Omit<Omit<Omit<Omit<T, 'base'>, 'classes'>, 'compounds'>, 'default'>, '__before'>,
			'__after'
		>
	>]: boolean;
};

export class Style {
	protected base: Clx = [];
	protected compounds: Array<{
		states: Array<string>;
		classes: Clx;
	}> = [];
	protected default: Clx = [];
	protected __before: Clx = [];
	protected __after: Clx = [];

	constructor(options?: StyleOptions) {
		if (options?.before) {
			this.__before = options.before;
		}
		if (options?.after) {
			this.__after = options.after;
		}
	}

	classes(input?: StyleProps<this>): string {
		const acc = new Map();

		acc.set('base', clx(this.base));
		acc.set('before', clx(this.__before));

		if (input) {
			for (const [key, value] of Object.entries(input)) {
				if (
					key !== 'base' &&
					key !== 'default' &&
					key !== 'compounds' &&
					key !== 'classes' &&
					key !== '__before' &&
					key !== '__after' &&
					value === true
				) {
					//@ts-ignore
					acc.set(key, clx(this[key]));
				}
			}
		}
		// If nothing provided, use default values
		if (!input || Object.entries(input).length === 0) {
			acc.set('default', clx(this.default));
		}

		// handle compounds
		for (const [i, compound] of this.compounds.entries()) {
			if (
				compound.states.every(state => {
					// console.log('keey => ', key);

					if (this.hasOwnProperty(state) && input?.hasOwnProperty(state)) return true;
				})
			) {
				acc.set('compound' + i, clx(compound.classes));
			}
		}

		

		acc.set('after', clx(this.__after));
		const allValues = Array.from(acc.values()).join(' ').split(' ').reverse();

		const indexesToKeep = [
			allValues.findIndex(cls => cls.startsWith('bg-')),
			allValues.findIndex(cls => cls.startsWith('px-')),
		];

		const allValuesFiltered = allValues.filter(
			(value, i) =>
				indexesToKeep.includes(i) || !value.startsWith('bg-') || !value.startsWith('px-')
		);

		return allValuesFiltered
			.reverse()
			.join(' ')
			.replace(/\B\s+|\s+\B/, '');
		// const lastBg = allValues.find.lastIndexOf(value => value.includes('bg'));
		// return Array.from(acc.values())
		// 	.join(' ')
		// 	.replace(/\B\s+|\s+\B/, '');
	}
}
