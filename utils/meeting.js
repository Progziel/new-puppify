// Helper to calculate status
const calculateStatus = (dateTime) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    if (dateTime < today) return 'Completed';
    if (dateTime >= today && dateTime < tomorrow) return 'Today';
    return 'Upcoming';
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  module.exports = {
    calculateStatus,
    shuffleArray
  };
