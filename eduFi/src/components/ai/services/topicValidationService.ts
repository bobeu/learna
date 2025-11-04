/**
 * Service for validating custom topics against campaign relevance
 */

export interface TopicValidationResponse {
  isValid: boolean;
  message: string;
  reason?: string;
}

/**
 * Validate if a custom topic is relevant to the campaign
 */
export async function validateCustomTopic(
  topicTitle: string,
  campaignName: string,
  campaignDescription: string
): Promise<TopicValidationResponse> {
  try {
    const response = await fetch('/api/validate-topic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicTitle,
        campaignName,
        campaignDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate topic: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      isValid: data.isValid || false,
      message: data.message || 'Validation completed',
      reason: data.reason,
    };
  } catch (error) {
    console.error('Error validating topic:', error);
    return {
      isValid: false,
      message: 'Failed to validate topic. Please try again.',
      reason: 'Network error',
    };
  }
}

