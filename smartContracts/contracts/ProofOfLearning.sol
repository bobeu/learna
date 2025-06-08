// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title Credential is an ERC721 Non-fungible token that reprents learners's evidence of participation and completion of a test
 * @author Bobeu - https://github.com/bobeu
 */
contract ProofOfLearning is ERC721 {
    // Constructor
    constructor() ERC721('Credential', 'POL') {}
}