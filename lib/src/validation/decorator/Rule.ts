import 'reflect-metadata';

export const ruleMetadataKey = Symbol('ruleDecoratorKey');

export default function Rule(formatString: string) {
    return Reflect.metadata(ruleMetadataKey, formatString);
}