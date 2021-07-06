export const babelRcTemplate = `{
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "node": "current"
          }
        }
      ]
    ],
    "exclude": ["./grpc_stubs"]
  }`;
