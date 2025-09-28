// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IApprovalFactory } from "./ApprovalFactory.sol";
import { ICampaignTemplate } from "./interfaces/ICampaignTemplate.sol";

abstract contract CampaignMetadata is ICampaignTemplate, Pausable {
    // Campaign information such as name, etc. 
    Metadata internal metadata;

    address internal operator;

    ///@notice Approval factory contract
    IApprovalFactory internal approvalFactory;

    ///@dev Only operator function
    modifier onlyOwnerOrApproved {
        require(_msgSender() == operator || approvalFactory.hasApproval(_msgSender()), "No approval");
        _;
    }

    ///@notice Constructor
    constructor(
        address _operator, 
        IApprovalFactory _approvalFactory, 
        MetadataInput memory meta
    ) payable {
        approvalFactory = _approvalFactory;
        operator = _operator;
        _setMetadata(meta, true);
    }

    ///@dev Set proofMeta information
    function _setMetadata(MetadataInput memory _meta, bool editStartDate) internal {
        if(bytes(_meta.description).length > 0) metadata.description = bytes(_meta.description);
        if(bytes(_meta.name).length > 0) {
            metadata.name = bytes(_meta.name);
            metadata.hash_ = keccak256(abi.encodePacked(bytes(_meta.name), address(this)));
        }
        if(bytes(_meta.imageUrl).length > 0) metadata.imageUrl = bytes(_meta.imageUrl);
        if(bytes(_meta.link).length > 0) metadata.link = bytes(_meta.link);
        unchecked {
            if(_meta.endDateInHr > 0) metadata.endDate = uint64(_now() + (_meta.endDateInHr * 1 hours));
            if(editStartDate) metadata.startDate = uint64(_now());
        }
    }

    /**@dev Set metadata
        @param _meta: New metadata
     */
    function editMetaData(MetadataInput memory _meta) public onlyOwnerOrApproved returns(bool) {
        _setMetadata(_meta, false);
        return true;
    }

    ///@dev Only approved account can pause execution
    function pause() public onlyOwnerOrApproved {
        _pause();
    }

    ///@dev Only approved account can continue execution
    function unpause() public onlyOwnerOrApproved {
        _pause();
    }

    ///@dev Only approved account can continue execution
    function _now() internal view returns(uint64 currentTime) {
        currentTime = uint64(block.timestamp);
    }
}