/**
 * Custom hook for managing topic state in memory (not localStorage)
 * State persists until page refresh or logout
 */

import { useState, useCallback } from 'react';
import { GeneratedTopic } from '../TopicSelection';

interface TopicState {
  topics: GeneratedTopic[];
  selectedTopic: GeneratedTopic | null;
  customTopic: string | null;
  greeting: string | null;
  campaignInfo: string | null;
}

export function useTopicState() {
  const [state, setState] = useState<TopicState>({
    topics: [],
    selectedTopic: null,
    customTopic: null,
    greeting: null,
    campaignInfo: null,
  });

  const setTopics = useCallback((topics: GeneratedTopic[]) => {
    setState(prev => ({ ...prev, topics }));
  }, []);

  const setSelectedTopic = useCallback((topic: GeneratedTopic | null) => {
    setState(prev => ({ ...prev, selectedTopic: topic }));
  }, []);

  const setCustomTopic = useCallback((topic: string | null) => {
    setState(prev => ({ ...prev, customTopic: topic }));
  }, []);

  const setGreeting = useCallback((greeting: string | null) => {
    setState(prev => ({ ...prev, greeting }));
  }, []);

  const setCampaignInfo = useCallback((info: string | null) => {
    setState(prev => ({ ...prev, campaignInfo: info }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      topics: [],
      selectedTopic: null,
      customTopic: null,
      greeting: null,
      campaignInfo: null,
    });
  }, []);

  return {
    ...state,
    setTopics,
    setSelectedTopic,
    setCustomTopic,
    setGreeting,
    setCampaignInfo,
    resetState,
  };
}

