// A Client Component must not be handed a message **key**: it is handed the **sentence**.
//
// `clientDictionary` ships only the messages whose literal survives into a client chunk, read off
// the build by `scripts/i18n-client-keys.mts`. A key chosen in a Server Component and translated on
// the other side of the boundary never appears in a chunk, so the message is left on the server and
// the browser prints the key to the reader. It happened once, to the switches of `/settings`, and
// four end-to-end tests are what found it: the name is translated where its literal lives.

function isClientFile(program) {
  return program.body.some(
    (statement) => statement.type === "ExpressionStatement" && statement.directive === "use client",
  );
}

/** @type {import("eslint").Rule.RuleModule} */
export const noMessageKeyInClient = {
  meta: {
    type: "problem",
    messages: {
      key: "Client code must not name MessageKey: take the translated sentence as a prop, not its key, or `clientDictionary` will leave the message on the server.",
    },
    schema: [],
  },
  create(context) {
    let isClient = false;

    return {
      Program(program) {
        isClient = isClientFile(program);
      },
      Identifier(node) {
        if (isClient && node.name === "MessageKey") context.report({ node, messageId: "key" });
      },
    };
  },
};
