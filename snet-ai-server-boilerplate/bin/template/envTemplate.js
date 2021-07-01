exports.default = function (config) {
  return `
# Private key must start with 0x
PRIVATE_KEY=${config.privateKey || ""}
# Private key must start with 0x
SIGNER_PRIVATE_KEY=${config.privateKey || ""}
NETWORK_ID=1
PROVIDER_HOST=https://mainnet.infura.io/v3/${config.infuraId || ""}
IPFS_ENDPOINT=http://ipfs.singularitynet.io:80
DEFAULT_GAS_PRICE=4700000
DEFAULT_GAS_LIMIT=210000
# you can download the freecalltoken from beta.singularitynet.io
FREE_CALL_TOKEN=${config.freeCallToken || ""}
TOKEN_EXPIRATION_BLOCK=${config.tokenExpiryBlock || ""}
EMAIL=${config.email || ""}
    `;
};
