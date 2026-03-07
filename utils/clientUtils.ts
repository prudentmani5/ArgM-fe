/**
 * Returns the display name for a client, handling INDIVIDUAL, BUSINESS, and JOINT_ACCOUNT types.
 * For BUSINESS/GROUP clients: uses businessName
 * For INDIVIDUAL/JOINT_ACCOUNT: uses firstName + lastName
 */
export function getClientDisplayName(client: any): string {
    if (!client) return '-';
    if (client.businessName) return client.businessName;
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || '-';
}
