// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
require("dotenv").config();
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // Fee Data
  const feeData = await hre.ethers.provider.getFeeData();
  console.log("Fee Data", feeData);

  // Deploy Lock contract -- Fail with "ProviderError: FeeTooLow, EffectivePriorityFeePerGas too low 0 < 1, BaseFee: 7"
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = ethers.utils.parseEther("0.001");

  const Lock = await ethers.getContractFactory("Lock");
  console.log(ethers.provider); // -- the underlying provider is a [`AutomaticGasPriceProvider`](https://github.com/NomicFoundation/hardhat/blob/dfc4465026cc4ccfadced5cffe84a53ad8acdc50/packages/hardhat-core/src/internal/core/providers/gas-providers.ts#L139)
  try {
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  
    await lock.deployed();
  
    console.log(
      `Lock with ${ethers.utils.formatEther(
        lockedAmount
      )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
    );
  } catch (error) {
    console.error(error);
  }

  // Manually call the transaction without populating it -- Fail with "ProviderError: FeeTooLow, EffectivePriorityFeePerGas too low 0 < 1, BaseFee: 7"
  // const deployer = Lock.signer;
  // const txReq = await Lock.getDeployTransaction(unlockTime, { value: lockedAmount });
  // const tx = await deployer.sendTransaction(txReq);
  // const receipt = await tx.wait();
  // console.log("TransactionReceipt", receipt);
  
  // Populate transaction using the `JsonRpcSigner` provide by the hardhat -- all gas price params are good
  // const deployer = Lock.signer;
  // const txReq = await Lock.getDeployTransaction(unlockTime, { value: lockedAmount });
  // const populatedTxReq = await deployer.populateTransaction(txReq);
  // console.log("TransactionRequest", populatedTxReq);
  // const tx = await deployer.sendTransaction(populatedTxReq);
  // const receipt = await tx.wait();
  // console.log("TransactionReceipt", receipt);

  // Populate transaction using `Wallet` signer -- all gas price params are good
  // const deployer = (new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY)).connect(ethers.provider);
  // const txReq = await Lock.getDeployTransaction(unlockTime, { value: lockedAmount });
  // const populatedTxReq = await deployer.populateTransaction(txReq);
  // console.log("TransactionRequest", populatedTxReq);
  // const tx = await deployer.sendTransaction(populatedTxReq);
  // const receipt = await tx.wait();
  // console.log("TransactionReceipt", receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
