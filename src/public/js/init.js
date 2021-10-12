Init = {
  web3Provider: null,
  contracts: {},
  membershipInstance: null,
  itemInstance: null,
  OSDCTokenInstance: null,
  shoppingInstance: null,

  init: async function() {
    await Init.initWeb3();
    // await Init.initContract();
    // await Init.getContractInstance();
  },

  initWeb3: async function() {
    Init.web3Provider = new Web3.providers.HttpProvider('http://192.168.154.19:22000',    {
      headers: [{
        name: 'Access-Control-Allow-Origin',
        value: '*'
      }]
    });
    web3 = new Web3(Init.web3Provider);
  }


};