export const calculateFaithPrediction = () => {
  const stored = localStorage.getItem('sattha_user_data');
  let unluckyDigit = null;
  
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.birthDate) {
        const date = new Date(data.birthDate);
        const day = date.getDay(); // 0 (Sunday) - 6 (Saturday)
        
        // กฎความเชื่อเบื้องต้น: กาลกิณีตามวันเกิด
        // (ตัวอย่างสมมติ: เกิดวันอาทิตย์ ห้ามมีเลข 6)
        const unluckyMap = [6, 1, 2, 3, 4, 5, 0];
        unluckyDigit = unluckyMap[day].toString();
      }
    } catch(e) {
      console.error('Error parsing stored settings');
    }
  }

  // Generate "Faith" numbers, strictly avoiding the unlucky digit
  let faithNum;
  do {
    faithNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  } while (unluckyDigit !== null && faithNum.includes(unluckyDigit));

  return faithNum;
};
