const client = {
  cat: async(path: string) => {
    return `https://gateway.ipfs.io/ipfs/${path}/`;
  },
  add() {
    throw new Error('not implemented');
  }
}

export const getIPFSClient = async () => {
  return client;
}
