// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { CampaignTemplate, ICampaignTemplate } from "./CampaignTemplate.sol";
import { IApprovalFactory } from "./ApprovalFactory.sol";
import { IVerifier } from "../interfaces/IVerifier.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { UtilsV3 } from "./UtilsV3.sol";

contract CampaignFactory {
    using UtilsV3 for *;

    error FeeIsZeroAddress();

    event NewCampaign(address indexed sender, address indexed campaign);

    struct Campaign {
        address creator;
        address identifier;
    }

    struct ReadData {
        address dev;
        address feeTo;
        uint creationFee;
        IVerifier verifier;
        IApprovalFactory approvalFactory;
        Campaign[] campaigns;
    }

    ///@notice Dev address
    address internal dev;

    ///@notice Fee receiver
    address internal feeTo;

    ///@notice Campaign creation fee
    uint internal creationFee;

    ///@notice All campaigns
    Campaign[] internal campaigns;

    // Verifier contract
    IVerifier internal verifier;

    ///@notice Approval factory contract
    IApprovalFactory internal approvalFactory;

    // Only approved account is allowed
    modifier onlyApproved {
        require(approvalFactory.hasApproval(msg.sender), "No approval");
        _;
    }

    constructor(
        address _dev, 
        uint _creationFee, 
        IApprovalFactory _approvalFactory
    ) {
        require(_dev != address(0), "Dev is zero address");
        require(address(_approvalFactory) != address(0), "ApprovalFactory is zero address");
        dev = _dev;
        _setCreationFee(_creationFee);
    }

    function _setCreationFee(uint newFee) internal {
        creationFee = newFee;
    }

    /**@dev Set new fee 
        @param newFee : New Fee
     */
    function setCreationFee(uint newFee) public onlyApproved returns(bool) {
        _setCreationFee(newFee);
        return true;
    }

     /**@dev Set new Verifier contract 
        @param newVerifier : New Verifier contract
     */
    function setVerifier(address newVerifier) public onlyApproved returns(bool) {
        require(newVerifier != address(0), "Verifier is zero");
        verifier = IVerifier(newVerifier);
        return true;
    }

    /**@dev Set new approval contract 
        @param newApprovalFactory : New Approval contract
     */
    function setApprovalFactory(address newApprovalFactory) public onlyApproved returns(bool) {
        require(newApprovalFactory != address(0), "ApprovalFactory is zero");
        approvalFactory = IApprovalFactory(newApprovalFactory);
        return true;
    }

    /**@dev Create new campaign
        @param metadata : Campaign metadata
     */
    function createCampaign(ICampaignTemplate.Metadata memory metadata) external payable returns(bool) {
        require(msg.value >= creationFee, "Insufficient value for creation fee");
        if(feeTo == address(0)) revert FeeIsZeroAddress();
        feeTo._sendValue(creationFee);
        address sender = msg.sender;
        unchecked {
            address campaign = address(new CampaignTemplate{value: msg.value - creationFee}(dev, approvalFactory, verifier, metadata));
            campaigns.push(Campaign(sender, campaign));
            emit NewCampaign(sender, campaign);
        }

        return true;
    }

    function getData() public view returns(ReadData memory data) {
        data = ReadData(
            dev,
            feeTo,
            creationFee,
            verifier,
            approvalFactory,
            campaigns
        );
        return data;
    }

}