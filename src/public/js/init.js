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
    Init.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(Init.web3Provider);
  },

  initContract: async function() {
    await $.getJSON('Membership.json', function (data) {
      var MembershipArtifact = data;
      Init.contracts.Membership = TruffleContract(MembershipArtifact);
      Init.contracts.Membership.setProvider(Init.web3Provider);
    });      
    await $.getJSON('Item.json', function(data) {
      var itemArtifact = data;
      Init.contracts.item = TruffleContract(itemArtifact);
      Init.contracts.item.setProvider(Init.web3Provider);
    });
    await $.getJSON('Shopping.json', function(data) {
      var itemArtifact = data;
      Init.contracts.shopping = TruffleContract(itemArtifact);
      Init.contracts.shopping.setProvider(Init.web3Provider);
    });    
    await $.getJSON('OSDCToken.json', function(data) {
      var TokenArtifact = data;
      Init.contracts.FixedSupplyToken = TruffleContract(TokenArtifact);
      Init.contracts.FixedSupplyToken.setProvider(Init.web3Provider);
    });
  },

  getContractInstance: async function(){
    await Init.contracts.shopping.deployed().then(function(instance){
      Init.shoppingInstance=instance;
    });    
    await Init.contracts.Membership.deployed().then(function(instance){
      Init.membershipInstance=instance;
    });
    await Init.contracts.item.deployed().then(function(instance){
      Init.itemInstance=instance;
    });
    await Init.contracts.FixedSupplyToken.deployed().then(function(instance){
      Init.OSDCTokenInstance=instance;
    });
  }
};