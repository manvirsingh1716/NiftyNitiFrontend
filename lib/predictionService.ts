interface PredictionData {
  date: Date | string;
  start: number;
  close: number;
  weights: Record<string, number>;
}

export const savePrediction = async (prediction: PredictionData) => {
  try {
    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...prediction,
        date: prediction.date instanceof Date ? prediction.date.toISOString() : prediction.date,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save prediction');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in savePrediction:', error);
    throw error;
  }
};

export const getRecentPredictions = async (limit = 30) => {
  try {
    const response = await fetch(`/api/predictions?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch predictions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getRecentPredictions:', error);
    throw error;
  }
};
