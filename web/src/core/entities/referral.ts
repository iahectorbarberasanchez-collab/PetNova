export interface Referral {
    id: string;
    invitee_id: string;
    rewarded: boolean;
    created_at: string;
    invitee_name: string | null;
}
