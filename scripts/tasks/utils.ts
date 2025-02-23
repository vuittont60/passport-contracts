import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import {
  recursiveRetry,
  recursiveRetryIncreamentNonce,
} from "../utils/retries";

const increamentNonceUntil = async (
  deployer: SignerWithAddress,
  nonceDelta: any
) => {
  for (let i = 0; i < nonceDelta; i++) {
    console.log(
      "increamenting nonce " + (i + 1) + " of " + nonceDelta + " times"
    );
    await recursiveRetryIncreamentNonce(deployer);
  }
};

task(
  "setNonce",
  "npx hardhat setNonce --nonce <number> --network <network_name>"
)
  .addParam("nonce", "sets the nonce for the deployer")
  .setAction(async function (taskArgs, hre) {
    const ethers = hre.ethers;
    const nonce = taskArgs.nonce;
    const deployer = (await ethers.getSigners())[0];

    console.log(
      "Balance of Deployer: " +
        formatEther(
          await recursiveRetry(ethers.provider.getBalance, deployer.address)
        ).toString()
    );
    const currentNonce = await recursiveRetry(
      ethers.provider.getTransactionCount,
      deployer.address
    );
    console.log("Nonce of Deployer: " + currentNonce.toString());

    const nonceDelta = nonce - currentNonce;
    if (nonceDelta < 0) throw new Error("Nonce is too low");
    await increamentNonceUntil(deployer, nonceDelta);
  });

task(
  "getCurrentBlock",
  "npx hardhat getCurrentBlock --network <network_name>"
).setAction(async function (taskArgs, hre) {
  const ethers = hre.ethers;
  const blockNumber = await recursiveRetry(ethers.provider.getBlockNumber);
  console.log("Current Block Number: " + blockNumber.toString());
});

task(
  "getCode",
  "npx hardhat getCode --addresses <address,address,...> --network <network_name>"
)
  .addParam("addresses", "sets the addresses")
  .setAction(async function (taskArgs, hre) {
    const ethers = hre.ethers;
    const addresses = taskArgs.addresses.split(",");

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      console.log(`-------------${address}-------------`);
      const code = await ethers.provider.getCode(address);
      if (code.length > 2) {
        console.log(`contract contructor address: 0x${code.slice(-40)}`);
      } else {
        console.log("account is not a contract");
      }
    }
  });

task(
  "getSignerAddress",
  "npx hardhat getSignerAddress --network <network_name>"
).setAction(async function (taskArgs, hre) {
  const ethers = hre.ethers;
  const deployer = (await ethers.getSigners())[0];
  console.log("Signer Address: " + deployer.address);
});

