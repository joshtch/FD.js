declare module 'fdjs' {
	export const SUP: number;
	export const INF: number;

	type Domain = Array<[number, number]>;
	interface SpaceConstructor {
		new (s?: Space): Space;
	}

	interface Space {
		clone(): Space;
		propagate(): number;
		is_solved(): boolean;
		inject(proc: (S: Space) => any): Space;
		decl(varnames: Varnames, dom: Domain): Space;
		temp(dom: Domain): number;
		temps(N: number, dom: Domain): Varname[];
		konst(val: number): Varname;
		const(val: number): Varname;

		eq(v1name: Varname, v2name: Varname): Space;
		eq(v1name: Varname): Varname;
		lt(v1name: Varname, v2name: Varname): Space;
		gt(v1name: Varname, v2name: Varname): Space;
		lte(v1name: Varname, v2name: Varname): Space;
		gte(v1name: Varname, v2name: Varname): Space;
		neq(v1name: Varname, v2name: Varname): Space;
		distinct(vars: Varname[]): Space;
		plus(v1name: Varname, v2name: Varname, sumname: Varname): Space;
		plus(v1name: Varname, v2name: Varname): Varname;
		times(v1name: Varname, v2name: Varname, prodname: Varname): Space;
		times(v1name: Varname, v2name: Varname): Varname;
		scale(factor: number, vname: Varname, prodname: Varname): Space;
		scale(v1name: Varname, v2name: Varname): Varname;
		times_plus(k1: number, v1name: Varname, k2: number, v2name: Varname, resultname: Varname): Space;
		times_plus(k1: number, v1name: Varname, k2: number, v2name: Varname): Varname;
		sum(vars: Varname[], resultName: Varname): Space;
		sum(vars: Varname[]): Varname;
		product(vars: Varname[], resultName: Varname): Space;
		product(vars: Varname[]): Varname;
		wsum(kweights: number[], vars: Varname[], resultName: Varname): Space;
		wsum(kweights: number[], vars: Varname[]): Varname;
    
    // Note that [Varname, Varname] works as argv only because all ops happen to be 2-ary
		reified(opname: Opname, argv: [Varname, Varname], boolname: Varname): Space;
		reified(opname: Opname, argv: [Varname, Varname]): Varname;

		done(): void;
		solution(): Solution;
		toString(): string;
		initprop(p: Propagator): Propagator;
		newprop(p: Propagator): Space;
		num(varnames: Varnames, n: number): Space;
	}

	export const space: SpaceConstructor;

	type Opname = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte';

	interface Propagator {
		allvars: Varname[];
		depvars: Varname[];
		step: () => number;
	}

	type Varname = string;

	type Varnames = Varname | Varnames[] | Record<keyof any, Varnames>;

	interface Filters {
		orderings: {
			naive(S: Space, v1: Varname, v2: Varname): boolean,
			size(S: Space, v1: Varname, v2: Varname): boolean,
			min(S: Space, v1: Varname, v2: Varname): boolean,
			max(S: Space, v1: Varname, v2: Varname): boolean,
		};
		undet(S: Space, varnames: Varnames): Varname[],
	}

	interface ValuesFunctionReturn {
		(S: Space, n: 0 | 1): Space;
		numChoices: 2;
	};

	interface Values {
		min(v: Varname): ValuesFunctionReturn;
		max(v: Varname): ValuesFunctionReturn;
		mid(v: Varname): ValuesFunctionReturn;
		splitMin(v: Varname): ValuesFunctionReturn;
		splitMax(v: Varname): ValuesFunctionReturn;
	}

	interface Spec {
		filter?: 'undet' | 'orderings';
		ordering?: 'naive' | 'size' | 'min' | 'max';
		value?: 'min' | 'max' | 'mid' | 'splitMin' | 'splitMax';
	}

	interface Generic {
		filters: Filters;
		values: Values;
		(S: Space, varnames: Varnames, spec: Spec): Space;
	}

	interface Distribute {
		generic: Generic;

		naive(S: Space, varnames: Varnames): Space;
		fail_first(S: Space, varnames: Varnames): Space;
		split(S: Space, varnames: Varnames): Space;
	}

	export const distribute: Distribute;

	interface State {
		space: Space;
		stack?: Space[];
		status?: 'solved' | 'end';
		is_solved?: (S: Space) => boolean;
		next_choice?: unknown;
		more?: boolean;

		best?: Space;
		error?: unknown;
		needs_constraining?: boolean;
		single_step?: boolean;
	}

	type Solution = Record<Varname, number | false>;

	interface Search {
		depth_first(state: State): State;
		branch_and_bound(
			state: State,
			ordering: (nextSpace: Space, currentBest: Solution) => any,
		): State;

		solve_for_variables(varnames?: Varnames): (S: Space) => boolean;
		solve_for_propagators(S: Space): boolean;
	}
	export const search: Search;

	interface FDInterface {
		SUP: number;
		INF: number;
		space: Space;
		distribute: Distribute;
		search: Search;
	}
	const FD: FDInterface;

	export default FD;
}
