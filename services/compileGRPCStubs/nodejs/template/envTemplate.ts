export const envTemplate = () => {
  return `
# Private key must start with 0x
PRIVATE_KEY=${""}
NETWORK_ID=1
PROVIDER_HOST=https://mainnet.infura.io/v3/${""}
IPFS_ENDPOINT=http://ipfs.singularitynet.io:80
DEFAULT_GAS_PRICE=4700000
DEFAULT_GAS_LIMIT=210000
# you can download the freecalltoken from beta.singularitynet.io
FREE_CALL_TOKEN=${""}
TOKEN_EXPIRATION_BLOCK=${""}
EMAIL=${""}
    `;
};
