import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: `${process.env.VITE_GRAPHQL_URL}/graphql`,
  documents: 'src/graphql/**/*.graphql',
  generates: {
    'src/__generated__/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        enumsAsTypes: true,
        useTypeImports: true,
        scalars: {
          BigInt: {
            input: 'string',
            output: 'string',
          },
          DateTime: {
            input: 'string',
            output: 'string',
          },
        },
      },
    },
  },
};

export default config;