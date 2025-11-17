// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { CampaignTemplate } from "./CampaignTemplate.sol";
import { ICampaignFactory, ICampaignTemplate, IInterfacer } from "./interfaces/ICampaignTemplate.sol";
import { IApprovalFactory } from "./ApprovalFactory.sol";
import { UtilsV3 } from "./UtilsV3.sol";

contract CampaignFactory is ICampaignFactory{
    using UtilsV3 for *;
    
    ///@notice Dev address
    address private dev;

    ///@notice Fee receiver
    address private feeTo;

    ///@notice Campaign creation fee
    uint private creationFee;

    ///@notice All campaigns
    Campaign[] private campaigns;

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
        approvalFactory = _approvalFactory;
        dev = _dev;
        _setCreationFee(_creationFee);
    }

    ///@dev Get message sender
    function _msgSender() internal view returns(address _sender) {
        _sender = msg.sender;
    }

    ///@dev Set new creation fee
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
                    address campaign = address(new CampaignTemplate{value: msg.value - creationFee}(sender, dev, approvalFactory, metadata));
                    campaigns.push(Campaign(sender, campaign));
                    IInterfacer(approvalFactory.getInterfacer()).registerCampaign(campaign);
                    emit NewCampaign(sender, campaign);
                }
            }
        } else {
            revert InsufficientValue();
        }

        return true;
    }

    function getCampaign(uint index) external view returns(Campaign memory cmp) {
        if(index < campaigns.length) {
            cmp = campaigns[index];
        }
        return cmp;
    }

    ///@dev Get campaign data
    function getFactoryData() public view returns(ReadData memory data) {
        data = ReadData(
            dev,
            feeTo,
            creationFee,
            approvalFactory,
            campaigns
        );
        return data;
    }

}