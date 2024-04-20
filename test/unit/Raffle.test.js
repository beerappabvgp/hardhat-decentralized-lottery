const { network } = require("hardhat");
const developmentChains = require("../../helper-hardhat-config");
const { describe } = require("node:test");

!developmentChains.includes(network.name) 
? describe.skip
: describe("Raffle Unit tests" , async function () {
    let raffle , vrfCoordinatorV2Mock
})