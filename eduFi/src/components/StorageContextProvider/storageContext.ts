import type { Address, VoidFunc, CampaignTemplateReadData } from "../../../types";

export interface NeynaDataContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: VoidFunc
};

export interface DataContextProps {
    isLoading: boolean;
    owner: Address;
    campaignsData: CampaignTemplateReadData[];
    verificationStatus: boolean;
    hasApproval: boolean;
    dev: Address;
    feeTo: Address;
    creationFee: bigint;
    verifier: Address;
    approvalFactory: Address;
}
