
function getProvider(keystore) {
  return new HookedWeb3Provider({
    host: "http://localhost:8545",
    transaction_signer: keystore
  });
}
export {
  getProvider
};
