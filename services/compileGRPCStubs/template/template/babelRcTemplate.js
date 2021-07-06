exports.default = `{
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
