import type { Address, VoidFunc, FormattedCampaignTemplate } from "../../../types";

export interface NeynaDataContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: VoidFunc
};

export interface DataContextProps {
    isLoading: boolean;
    owner: Address;
    campaignsData: FormattedCampaignTemplate[];
    verificationStatus: boolean;
    hasApproval: boolean;
    dev: Address;
    feeTo: Address;
    creationFee: bigint;
    verifier: Address;
    approvalFactory: Address;
    builderCampaigns: FormattedCampaignTemplate[];
    creatorCampaigns: FormattedCampaignTemplate[]
}
