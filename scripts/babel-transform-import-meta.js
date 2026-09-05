module.exports = function transformImportMeta({ types: t }) {
  return {
    name: 'transform-import-meta-for-metro',
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name !== 'import' || path.node.property.name !== 'meta') return;

        path.replaceWith(
          t.objectExpression([
            t.objectProperty(
              t.identifier('env'),
              t.objectExpression([
                t.objectProperty(
                  t.identifier('MODE'),
                  t.stringLiteral(process.env.NODE_ENV || 'development')
                ),
              ])
            ),
          ])
        );
      },
    },
  };
};
