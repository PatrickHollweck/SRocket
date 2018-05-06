import { ModuleConfig } from "../modules/ModuleConfig";
import { InternalRoute } from "../router/InternalRoute";

export class ModuleModel {
	public routes: Array<InternalRoute>;
	public module: ModuleConfig;

	constructor(module: ModuleConfig) {
		this.routes = [];
		this.module = module;
	}
}

export class ModuleNode {
	public children: Array<ModuleNode>;
	public value: ModuleModel;

	constructor(value: ModuleConfig) {
		this.children = [];
		this.value = new ModuleModel(value);
	}

	public insertNode(child: ModuleNode) {
		this.children.push(child);
	}
}

export class ModuleTree {
	public root: ModuleNode;

	constructor(rootValue: ModuleConfig) {
		this.root = new ModuleNode(rootValue);
	}

	public findRoute(routePath: string): InternalRoute | undefined {
		const module = this.findModule(innerModule => innerModule.routes.findIndex(route => route.getRoutePath() === routePath) !== -1);
		if (!module) return undefined;

		return module.value.routes.find(route => route.getRoutePath() === routePath);
	}

	public findModule(predicate: (arg: ModuleModel) => boolean): ModuleNode | undefined {
		const findInNode = (node: ModuleNode) => {
			if (node.children) {
				node.children.forEach(findInNode);
			}

			for (const innerNode of node.children) {
				if (predicate(innerNode.value)) {
					return innerNode;
				}
			}

			return undefined;
		};

		return findInNode(this.root);
	}
}
