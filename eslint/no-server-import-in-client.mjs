// Client components ("use client") and pure domain code must never pull in a module's server
// adapters. `server-only` would also fail the build, but only once the import is reached.
const SERVER_SOURCE = /(^|\/)server(\/|$)|^server-only$/;
const DOMAIN_FILE = /[\\/]modules[\\/][^\\/]+[\\/]domain[\\/]/;

function isClientFile(program) {
  return program.body.some(
    (statement) => statement.type === "ExpressionStatement" && statement.directive === "use client",
  );
}

/** @type {import("eslint").Rule.RuleModule} */
export const noServerImportInClient = {
  meta: {
    type: "problem",
    messages: {
      client: "Client code must not import server code ('{{source}}').",
      domain: "Domain code is pure TypeScript and must not import server code ('{{source}}').",
    },
    schema: [],
  },
  create(context) {
    let messageId = null;

    function check(node) {
      const source = node.source?.value;
      if (messageId && typeof source === "string" && SERVER_SOURCE.test(source)) {
        context.report({ node, messageId, data: { source } });
      }
    }

    return {
      Program(program) {
        if (isClientFile(program)) messageId = "client";
        else if (DOMAIN_FILE.test(context.filename)) messageId = "domain";
      },
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
    };
  },
};
