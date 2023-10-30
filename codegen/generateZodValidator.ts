import { z } from 'zod';

type SimpleObject = Record<string, any>;

export function generateZodValidator(obj: SimpleObject): string {
  function getZodType(value: any): string {
    const typeOfValue = typeof value;

    switch (typeOfValue) {
      case 'string':
        return 'z.string()';
      case 'number':
        return 'z.number()';
      case 'boolean':
        return 'z.boolean()';
      case 'object':
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Assuming all elements of the array are of the same type.
            return `z.array(${getZodType(value[0])})`;
          } else {
            return 'z.array(z.unknown())'; // Empty array
          }
        } else {
          return generateNestedZodValidator(value);
        }
      default:
        return 'z.any()';
    }
  }

  function generateNestedZodValidator(nestedObj: SimpleObject): string {
    const lines: string[] = ['z.object({'];

    for (const key in nestedObj) {
      lines.push(`  ${key}: ${getZodType(nestedObj[key])},`);
    }

    lines.push('})');
    return lines.join('\n');
  }

  return generateNestedZodValidator(obj);
}

function identifyDiscriminatorKey(objects: SimpleObject[]): string | null {
  for (const key in objects[0]) {
    const uniqueValues = new Set(objects.map((obj) => obj[key]));
    if (uniqueValues.size === objects.length) {
      return key;
    }
  }
  return null;
}

function generateZodValidatorForDiscriminatedUnion(objects: SimpleObject[]): string {
  const discriminator = identifyDiscriminatorKey(objects);
  if (!discriminator) {
    throw new Error('No discriminating key found.');
  }

  function generateZodValidator(obj: SimpleObject): string {
    const lines: string[] = ['z.object({'];

    for (const key in obj) {
      lines.push(`  ${key}: ${getZodType(obj[key])},`);
    }

    lines.push('})');
    return lines.join('\n');
  }

  function getZodType(value: any): string {
    switch (typeof value) {
      case 'string':
        return 'z.string()';
      case 'number':
        return 'z.number()';
      case 'boolean':
        return 'z.boolean()';
      case 'object':
        if (Array.isArray(value)) {
          if (value.length > 0) {
            return `z.array(${getZodType(value[0])})`;
          } else {
            return 'z.array(z.unknown())';
          }
        } else {
          return generateZodValidator(value);
        }
      default:
        return 'z.any()';
    }
  }

  const cases = objects.map((obj) => generateZodValidator(obj)).join(',\n  ');

  return `z.discriminatedUnion('${discriminator}', {\n  ${cases}\n})`;
}

// Example:
const objects = [
  {
    type: 'developer',
    name: 'Ulima',
    age: 25,
  },
  {
    type: 'tool',
    toolName: 'vue',
    version: 3,
  },
];
console.log(generateZodValidatorForDiscriminatedUnion([objects[0]]));
