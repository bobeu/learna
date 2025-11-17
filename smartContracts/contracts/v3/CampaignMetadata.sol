// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IApprovalFactory } from "./ApprovalFactory.sol";
import { ICampaignTemplate } from "./interfaces/ICampaignTemplate.sol";

abstract contract CampaignMetadata is ICampaignTemplate, Pausable {
    // Campaign information such as name, etc. 
    Metadata internal metadata;

    ///@notice Approval factory contract
    IApprovalFactory internal approvalFactory;

    ///@notice Operator address
    address internal operator;

    ///@dev Only operator function
    modifier onlyApproved(address target) {
        require(approvalFactory.hasApproval(_msgSender()), "No approval");
        if(target != address(0)) {
            require(target == operator || approvalFactory.hasApproval(target), "No approval for target");
        }
        _;
    }

    ///@notice Constructor
    constructor(
        IApprovalFactory _approvalFactory, 
        MetadataInput memory meta,
        address _operator
    ) payable {
        approvalFactory = _approvalFactory;
        _setMetadata(meta, true);
        operator = _operator;
    }

    ///@dev Set proofMeta information
    function _setMetadata(MetadataInput memory _meta, bool editStartDate) internal {
        if(bytes(_meta.description).length > 0) {
            if(bytes(_meta.description).length < 501) metadata.description = bytes(_meta.description);
        }
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
    function editMetaData(MetadataInput memory _meta) external onlyApproved(address(0)) returns(bool) {
        _setMetadata(_meta, false);
        return true;
    }

    ///@dev Only approved account can pause execution
    function pause() external onlyApproved(address(0)) returns(bool) {
        _pause();
        return true;
    }

    ///@dev Only approved account can continue execution
    function unpause() external onlyApproved(address(0)) returns(bool) {
        _pause();
        return true;
    }

    ///@dev Only approved account can continue execution
    function _now() internal view returns(uint64 currentTime) {
        currentTime = uint64(block.timestamp);
    }
}