# chiado-ethers-mre

This is a minimal reproducible example of a bug in the `hardhat` library when transacting on `Chiado` network.

## Steps to reproduce

1. Create `.env` based on `.env.example`, fill in the prefunded deployer private key.
2. Run `npm i` to install dependencies.
3. Run `npx hardhat --network chiado run scripts/deploy.js` to deploy the contract.

## Bug Output

```
ProviderError: FeeTooLow, EffectivePriorityFeePerGas too low 0 < 1, BaseFee: 7
```

## Expected Behavior

The transaction should succeed.

## Bug Analysis

From [this discussion](https://github.com/ethers-io/ethers.js/discussions/3151), we know that `JsonRpcSigner` does not call `populateTransaction` when `sendTransaction` is called. The gas fee population is done by the node, which in this case the `hardhat` wrapper node.

The `JsonRpcSigner` is connected to a [`AutomaticGasPriceProvider`](https://github.com/NomicFoundation/hardhat/blob/dfc4465026cc4ccfadced5cffe84a53ad8acdc50/packages/hardhat-core/src/internal/core/providers/gas-providers.ts#L139) ultimately, which implements the `sendTransaction` method [here](https://github.com/NomicFoundation/hardhat/blob/dfc4465026cc4ccfadced5cffe84a53ad8acdc50/packages/hardhat-core/src/internal/core/providers/gas-providers.ts#L151) and determine the gas price [here](https://github.com/NomicFoundation/hardhat/blob/dfc4465026cc4ccfadced5cffe84a53ad8acdc50/packages/hardhat-core/src/internal/core/providers/gas-providers.ts#L173).

It uses `eth_feeHistory` to determine the gas fee data, in which the `maxPriorityFeePerGas` is set [here](https://github.com/NomicFoundation/hardhat/blob/dfc4465026cc4ccfadced5cffe84a53ad8acdc50/packages/hardhat-core/src/internal/core/providers/gas-providers.ts#L271) based on the returned `reward` value.

In `Chiado` network, the `reward` value seems to always be `0`, which results in `maxPriorityFeePerGas` being `0`, causing the transaction to fail.

### `eth_feeHistory` on Chiado

Request script:
```sh
curl --location 'https://rpc.chiadonetwork.net' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "method": "eth_feeHistory",
    "params": [
        "0x1",
        "latest",
        [
            50
        ]
    ],
    "id": 0
}'
```

Example response:

```json
{
    "jsonrpc": "2.0",
    "result": {
        "baseFeePerGas": [
            "0x7",
            "0x7"
        ],
        "gasUsedRatio": [
            0
        ],
        "oldestBlock": "0x318ad5",
        "reward": [
            [
                "0x0"
            ]
        ]
    },
    "id": 0
}
```


## Workaround

Using `Wallet` instead of `JsonRpcSigner` or manually populate/override the gas price in the transaction object.
