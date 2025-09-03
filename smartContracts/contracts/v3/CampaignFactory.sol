// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { CampaignTemplate, ICampaignTemplate } from "./CampaignTemplate.sol";
import { IApprovalFactory } from "./ApprovalFactory.sol";
import { IVerifier } from "../interfaces/IVerifier.sol";
import { UtilsV3 } from "./UtilsV3.sol";

contract CampaignFactory {
    using UtilsV3 for *;

    error FeetoIsTheSame();
    error ZeroAddress();
    error InsufficientValue();
    error NoApproval();

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
    address private dev;

    ///@notice Fee receiver
    address private feeTo;

    ///@notice Campaign creation fee
    uint private creationFee;

    ///@notice All campaigns
    Campaign[] private campaigns;

    // Verifier contract
    IVerifier private verifier;

    ///@notice Approval factory contract
    IApprovalFactory private approvalFactory;

    // Only approved account is allowed
    modifier onlyApproved {
        if(!approvalFactory.hasApproval(msg.sender)) revert NoApproval();
        _;
    }

    constructor(
        address _dev, 
        uint _creationFee,
        IApprovalFactory _approvalFactory
    ) {
        // if(_dev == address(0)) revert ZeroAddress();
        // if(address(_approvalFactory) == address(0)) revert ZeroAddress();
        approvalFactory = _approvalFactory;
        dev = _dev;
        _setCreationFee(_creationFee);
    }

    function _setCreationFee(uint newFee) internal {
        creationFee = newFee;
    }

    /**@dev Set new fee 
        @param newFee : New Fee
     */
    function setCreationFee(uint newFee) external onlyApproved returns(bool) {
        _setCreationFee(newFee);
        return true;
    }

    /**@dev Set new fee 
        @param newFeeTo : New Fee receiver
     */
    function setFeeTo(address newFeeTo) external onlyApproved returns(bool) {
        if(newFeeTo != feeTo) {
            feeTo = newFeeTo;
            return true;
        } else {
            return false;
        }
    }

     /**@dev Set new Verifier contract 
        @param newVerifier : New Verifier contract
     */
    function setVerifier(address newVerifier) external onlyApproved returns(bool) {
        if(newVerifier != address(verifier)) {
            verifier = IVerifier(newVerifier);
            return true;
        } else {
            return false;
        }
    }

    /**@dev Set new approval contract 
        @param newApprovalFactory : New Approval contract
     */
    function setApprovalFactory(address newApprovalFactory) external onlyApproved returns(bool) {
        if(newApprovalFactory != address(approvalFactory)){
            approvalFactory = IApprovalFactory(newApprovalFactory);
            return true;
        } else {
            return false;
        }
    }

    /**@dev Create new campaign
        @param metadata : Campaign metadata
     */
    function createCampaign(ICampaignTemplate.MetadataInput memory metadata) external payable returns(bool) {
        if(msg.value >= creationFee) {
            if(feeTo != address(0)) {
                feeTo._sendValue(creationFee);
                address sender = msg.sender;
                unchecked {
                    address campaign = address(new CampaignTemplate{value: msg.value - creationFee}(dev, sender, approvalFactory, verifier, metadata));
                    campaigns.push(Campaign(sender, campaign));
                    emit NewCampaign(sender, campaign);
                }
            }
        } else {
            revert InsufficientValue();
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