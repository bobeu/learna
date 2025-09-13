import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { campaignName, campaignDescription } = await request.json();

    // Mock topic generation - replace with actual AI service
    const mockTopics = [
      {
        id: '1',
        title: `${campaignName} Fundamentals`,
        description: 'Learn the basic concepts and principles of this technology',
        difficulty: 'easy'
      },
      {
        id: '2',
        title: `Advanced ${campaignName} Concepts`,
        description: 'Dive deeper into complex implementations and advanced features',
        difficulty: 'medium'
      },
      {
        id: '3',
        title: `${campaignName} Best Practices`,
        description: 'Industry standards, optimization techniques, and real-world applications',
        difficulty: 'hard'
      },
      {
        id: '4',
        title: `${campaignName} Security & Safety`,
        description: 'Security considerations and best practices for safe implementation',
        difficulty: 'medium'
      },
      {
        id: '5',
        title: `${campaignName} Integration Patterns`,
        description: 'How to integrate this technology with existing systems and workflows',
        difficulty: 'hard'
      }
    ];

    // Filter topics based on campaign description if available
    const relevantTopics = campaignDescription 
      ? mockTopics.filter(topic => 
          topic.title.toLowerCase().includes(campaignName.toLowerCase()) ||
          campaignDescription.toLowerCase().includes(topic.title.toLowerCase().split(' ')[0])
        )
      : mockTopics;

    return NextResponse.json(relevantTopics.slice(0, 3)); // Return top 3 topics
  } catch (error) {
    console.error('Error generating topics:', error);
    return NextResponse.json(
      { error: 'Failed to generate topics' },
      { status: 500 }
    );
  }
}
