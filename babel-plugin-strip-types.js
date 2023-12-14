/**
 * @type {import('@babel/core').Visitor}
 */
const traversers = {
  Identifier(path) {
    if (path.node.typeAnnotation) {
      path.node.typeAnnotation = null;
    }
  },

  VariableDeclarator(variablePath) {
    if (variablePath.node.id.typeAnnotation) {
      variablePath.node.id.typeAnnotation = null;
    }
  },

  // Handle function parameters and return types
  Function(functionPath) {
    functionPath.node.params.forEach((param) => {
      if (param.typeAnnotation) {
        param.typeAnnotation = null;
        param.optional = false;
      }
    });
    if (functionPath.node.returnType) {
      functionPath.node.returnType = null;
    }
  },

  FunctionExpression(functionExpressionPath) {
    functionExpressionPath.node.params.forEach((param) => {
      if (param.typeAnnotation) {
        param.typeAnnotation = null;
        param.optional = false;
      }
    });
    if (functionExpressionPath.node.returnType) {
      functionExpressionPath.node.returnType = null;
    }
  },

  ArrowFunctionExpression(arrowFunctionExpressionPath) {
    arrowFunctionExpressionPath.node.params.forEach((param) => {
      if (param.typeAnnotation) {
        param.typeAnnotation = null;
        param.optional = false;
      }
    });
    if (arrowFunctionExpressionPath.node.returnType) {
      arrowFunctionExpressionPath.node.returnType = null;
    }
  },

  // Handle class properties and methods
  ClassProperty(classPropPath) {
    if (classPropPath.node.typeAnnotation) {
      classPropPath.node.typeAnnotation = null;
    }
  },
  ClassMethod(classMethodPath) {
    classMethodPath.node.params.forEach((param) => {
      if (param.typeAnnotation) {
        param.typeAnnotation = null;
      }
    });
    if (classMethodPath.node.returnType) {
      classMethodPath.node.returnType = null;
    }
  },

  // Handle type cast expressions
  TSAsExpression(asExpressionPath) {
    asExpressionPath.replaceWith(asExpressionPath.node.expression);
  },
  TSTypeAssertion(typeAssertionPath) {
    typeAssertionPath.replaceWith(typeAssertionPath.node.expression);
  },

  // Handling Method and Property Signatures
  TSMethodSignature(methodSignaturePath) {
    methodSignaturePath.node.typeAnnotation = null;
  },
  TSPropertySignature(propertySignaturePath) {
    propertySignaturePath.node.typeAnnotation = null;
  },

  // Handling Type Parameters
  TSTypeParameterInstantiation(typeParameterInstantiationPath) {
    typeParameterInstantiationPath.remove();
  },
  TSTypeParameterDeclaration(typeParameterDeclarationPath) {
    typeParameterDeclarationPath.remove();
  },

  // Handling Type References
  TSTypeReference(typeReferencePath) {
    typeReferencePath.remove();
  },

  TSNonNullExpression(nonNullExpressionPath) {
    nonNullExpressionPath.replaceWith(nonNullExpressionPath.node.expression);
  },
  // Handling type keywords
  TSBooleanKeyword(booleanKeywordPath) {
    booleanKeywordPath.remove();
  },
  TSNumberKeyword(numberKeywordPath) {
    numberKeywordPath.remove();
  },
  // ... more handlers for each type ...

  // Handling Type Predicates
  TSTypePredicate(typePredicatePath) {
    typePredicatePath.remove();
  },
  // Handling Type Queries
  TSTypeQuery(typeQueryPath) {
    typeQueryPath.remove();
  },
};

/**
 *
 * @param {import('@babel/core')} babel
 * @returns {import('@babel/core').PluginObj}
 */
module.exports = function (babel) {
  const { types: t, transformFromAstSync } = babel;

  return {
    visitor: {
      BlockStatement(path) {
        // Check if the block contains the "use es6;" directive
        if (path.node.directives.some((directive) => directive.value.value === 'use webview')) {
          path.traverse(traversers);
        }
      },
    },
  };
};
