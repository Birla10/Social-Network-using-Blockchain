var SocialNetwork = artifacts.require("../src/contracts/SocialNetwork.sol");

module.exports = function(deployer) {
  deployer.deploy(SocialNetwork);
};