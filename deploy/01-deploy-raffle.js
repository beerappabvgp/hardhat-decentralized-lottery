const { network, ethers } = require("hardhat");
const { developmentChains , networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../helper-hardhat-config")
const VRF_SUB_FUND_AMOUNT = ethers.parseEther("30");
// module.exports = async function ( {getNamedAccounts , deployments }) {
//     const { deploy , log } = deployments;
//     const { deployer } = await getNamedAccounts();
//     const chainId = network.config.chainId;
//     let vrfCoordinatorV2Address , subscriptionId;
//     if (developmentChains.includes(network.name)) {
//         const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
//         vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
//         const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
//         const transactionReceipt = await transactionResponse.wait(1);
//         if (transactionReceipt.events && transactionReceipt.events.length > 0) {
//             subscriptionId = transactionReceipt.events[0].args.subId;
//         } else {
//             // Handle the case where no events were emitted
//             console.error("No events emitted by the transaction");
//         }
//         // fund the subscription
//         await vrfCoordinatorV2Mock.fundSubscription(subscriptionId , VRF_SUB_FUND_AMOUNT)
//     } else {
//         vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
//         subscriptionId = networkConfig[chainId]["subscriptionId"]
//     }
//     const args  = [vrfCoordinatorV2Address , entranceFee,gasLane, subscriptionId, callbackGasLimit , interval];
//     const entranceFee = networkConfig[chainId]["entranceFee"];
//     const gasLane = networkConfig[chainId]["gasLane"];
//     const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
//     const interval = networkConfig[chainId]["interval"];
//     const raffle = await deploy("Raffle" , {
//         from : deployer,
//         args : args,
//         log: true,
//         waitConfirmations: network.config.blockConfirmations || 1,
//     });
//     await raffle.deployed();
//     if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
//         log("verifying...")
//         await verify(raffle.address , args)
//     }
//     log("----------------------------");
// }

// module.exports.tags = ["all" , "raffle"]


module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    try {
        let vrfCoordinatorV2Address, subscriptionId;

        if (developmentChains.includes(network.name)) {
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
            vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress();

            const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
            const transactionReceipt = await transactionResponse.wait()
            // console.log(transactionResponse);
            const logs = transactionReceipt.logs;

            // Iterate through the logs array
            for (const log of logs) {
            // Check if the log corresponds to the SubscriptionCreated event
            if (log.fragment.name === 'SubscriptionCreated') {
                // Access the args property to get the event parameters
                const args = log.args;

                // Access the subId parameter
                const subId = args[0]; // Assuming subId is the first parameter
                subscriptionId = subId;
                // Now you can use the subId value as needed
                console.log("SubId emitted:", subId.toString());
            }
            }

            // console.log(transactionReceipt.events);
            // if (transactionReceipt.events) {
            //     subscriptionId = transactionReceipt.events[0].args.s_currentSubId;
            // } else {
            //     throw new Error("No events emitted by the transaction");
            // }

            // fund the subscription
            await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
        } else {
            vrfCoordinatorV2Address = networkConfig[chainId]?.vrfCoordinatorV2;
            subscriptionId = networkConfig[chainId]?.subscriptionId;
        }

        if (!vrfCoordinatorV2Address) {
            throw new Error("vrfCoordinatorV2 address is undefined");
        }

        const entranceFee = networkConfig[chainId]?.entranceFee;
        const gasLane = networkConfig[chainId]?.gasLane;
        const callbackGasLimit = networkConfig[chainId]?.callbackGasLimit;
        const interval = networkConfig[chainId]?.interval;

        const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval];

        const raffle = await deploy("Raffle", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        });

        if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
            log("verifying...");
            await verify(raffle.address, args);
        }

        log("----------------------------");
    } catch (error) {
        console.error("Error during deployment:", error);
    }
};

module.exports.tags = ["all", "raffle"];
