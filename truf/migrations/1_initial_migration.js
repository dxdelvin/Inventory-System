const UserStorage = artifacts.require("UserStorage");

module.exports = function (deployer) {
  deployer.deploy(UserStorage).then(function(instance) {
    console.log("UserStorage contract deployed at address:", instance.address);
  });
};
