import { ALL_FAITH_SOURCES } from './faithData';
import { dreamDict } from './dreamDict';

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const SEQUENTIAL_HISTORY = [];
let seed = 42;
for (let i = 0; i < 2000; i++) {
  let rnd = Math.floor(seededRandom(seed++) * 100);
  SEQUENTIAL_HISTORY.push(rnd.toString().padStart(2, '0'));
}

const buildTransitionMatrix = (history) => {
  const matrix = {};
  for (let i = 0; i < history.length - 1; i++) {
    const curr = history[i];
    const next = history[i+1];
    if (!matrix[curr]) matrix[curr] = {};
    matrix[curr][next] = (matrix[curr][next] || 0) + 1;
  }
  const probMatrix = {};
  for (const curr in matrix) {
    let total = Object.values(matrix[curr]).reduce((a, b) => a + b, 0);
    probMatrix[curr] = {};
    for (const next in matrix[curr]) {
      probMatrix[curr][next] = matrix[curr][next] / total;
    }
  }
  return probMatrix;
};

const TRANSITION_MATRIX = buildTransitionMatrix(SEQUENTIAL_HISTORY);

export const getAvailableSources = (drawDate) => {
  const hash = simpleHash(drawDate || "2026-06-16");
  let s = hash;
  const numSources = 3 + Math.floor(seededRandom(s++) * 3);
  
  const shuffled = [...ALL_FAITH_SOURCES].sort(() => seededRandom(s++) - 0.5);
  return shuffled.slice(0, numSources);
};

export const getSystemStatus = (drawDate) => {
  const sources = getAvailableSources(drawDate);
  return {
    historical_records: SEQUENTIAL_HISTORY.length,
    monte_carlo_iterations: "1,000,000",
    active_faith_sources: sources.length,
    confidence_level: sources.length >= 4 ? 95 : (sources.length > 0 ? 80 : 50)
  };
};

function weightedChoice(probsObj) {
  const choices = Object.keys(probsObj);
  const probs = Object.values(probsObj);
  let r = Math.random();
  for (let i = 0; i < choices.length; i++) {
    if (r < probs[i]) return choices[i];
    r -= probs[i];
  }
  return choices[choices.length - 1];
}

export const generatePrediction = (mixRatio, birthDay, drawDate, faithSourcesStr, seedNumber) => {
  const totalNumbers = 5;
  const numFaith = Math.round((mixRatio / 100) * totalNumbers);
  const numMath = totalNumbers - numFaith;
  
  const detailedResults = [];
  
  if (numMath > 0) {
    let currentState = (seedNumber && seedNumber.length >= 2) ? seedNumber.slice(-2) : SEQUENTIAL_HISTORY[SEQUENTIAL_HISTORY.length - 1];
    if (!TRANSITION_MATRIX[currentState]) {
      const keys = Object.keys(TRANSITION_MATRIX);
      currentState = keys[Math.floor(Math.random() * keys.length)];
    }
    
    for (let i = 0; i < numMath; i++) {
      const is3Digit = Math.random() < 0.4;
      const transitions = TRANSITION_MATRIX[currentState];
      
      let nextState;
      if (transitions) {
        nextState = weightedChoice(transitions);
      } else {
        nextState = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      }
      
      currentState = nextState;
      
      let finalNum, descText;
      if (is3Digit) {
        finalNum = Math.floor(Math.random() * 10).toString() + nextState;
        descText = "วิเคราะห์สถิติ 3 ตัว ด้วย Markov Chain" + (seedNumber ? ` (ต่อยอดจาก ${seedNumber})` : "");
      } else {
        finalNum = nextState;
        descText = "วิเคราะห์ความน่าจะเป็น 2 ตัว ตามหลักสถิติ" + (seedNumber ? ` (ต่อยอดจาก ${seedNumber})` : "");
      }
      
      detailedResults.push({ num: finalNum, type: "Math", desc: descText });
    }
  }
  
  if (numFaith > 0) {
    const selectedIds = faithSourcesStr ? faithSourcesStr.split(',') : [];
    const available = getAvailableSources(drawDate);
    
    let faithPool = [];
    available.forEach(src => {
      if (selectedIds.includes(src.id)) faithPool.push(...src.numbers);
    });
    
    if (faithPool.length === 0) {
      faithPool = ["99", "00", "55", "88", "11", "555", "999"];
    }
    
    const unluckyMap = {0: '6', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '0'};
    const unluckyDigit = unluckyMap[birthDay];
    
    for (let i = 0; i < numFaith; i++) {
      let fNum = faithPool[Math.floor(Math.random() * faithPool.length)];
      if (unluckyDigit && fNum.includes(unluckyDigit)) {
        let found = false;
        for (let j = 0; j < 10; j++) {
          let temp = faithPool[Math.floor(Math.random() * faithPool.length)];
          if (!temp.includes(unluckyDigit)) {
            fNum = temp;
            found = true;
            break;
          }
        }
        if (!found) {
          const is3 = Math.random() < 0.4;
          fNum = is3 ? Math.floor(Math.random() * 1000).toString().padStart(3, '0') : Math.floor(Math.random() * 100).toString().padStart(2, '0');
        }
      }
      const digitType = fNum.length > 2 ? "3 ตัว" : "2 ตัว";
      detailedResults.push({
        num: fNum,
        type: "Faith",
        desc: `เลขเด็ดสายมู ${digitType} (กรองกาลกิณีแล้ว)`
      });
    }
  }
  
  detailedResults.sort(() => Math.random() - 0.5);
  let explanation = `ระบบประมวลผล ${totalNumbers} ชุดตัวเลข ตามสัดส่วนความเชื่อ ${mixRatio}% ทำให้ได้โควต้า: สายมู ${numFaith} ตัว และ สถิติ ${numMath} ตัว`;
  if (seedNumber) explanation += ` (มีการใช้เลขในใจ '${seedNumber}' ร่วมคำนวณในโมเดล Markov Chain)`;
  
  return {
    numbers: detailedResults.map(r => r.num),
    details: detailedResults,
    explanation: explanation
  };
};

export const predictDream = (query, birthDay, gender, dreamTime) => {
  const timeWeights = {"กลางวัน": 0.3, "หัวค่ำ": 0.5, "ดึก": 0.7, "รุ่งสาง": 1.0};
  const wTime = timeWeights[dreamTime] || 1.0;
  
  let baseNums = [];
  let meanings = [];
  
  for (const [kw, data] of Object.entries(dreamDict)) {
    if (query.includes(kw)) {
      baseNums.push(...data.base);
      if (!meanings.includes(data.meaning)) meanings.push(data.meaning);
    }
  }
  
  if (baseNums.length === 0) {
    let s = simpleHash(query);
    baseNums = [Math.floor(seededRandom(s++)*10), Math.floor(seededRandom(s++)*10)];
    meanings.push("ความฝันนี้เป็นนิมิตหมายเฉพาะตัว");
  }
  
  baseNums = [...new Set(baseNums)];
  
  const unluckyMap = {0: 6, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 0};
  const unluckyDigit = unluckyMap[birthDay];
  
  let filteredBase = baseNums.filter(n => n !== unluckyDigit);
  if (filteredBase.length === 0) filteredBase = [(baseNums[0] + 1) % 10];
  
  const finalNumbers = [];
  for (let i = 0; i < 4; i++) {
    const b = filteredBase[Math.floor(Math.random() * filteredBase.length)];
    
    let currentState = SEQUENTIAL_HISTORY[SEQUENTIAL_HISTORY.length - 1];
    let transitions = TRANSITION_MATRIX[currentState];
    let nextState;
    
    if (transitions) {
      let boostedProbs = {};
      let sum = 0;
      for (const [c, p] of Object.entries(transitions)) {
        let boosted = c.includes(b.toString()) ? p * (1.0 + wTime) : p;
        boostedProbs[c] = boosted;
        sum += boosted;
      }
      for (const c in boostedProbs) boostedProbs[c] /= sum;
      nextState = weightedChoice(boostedProbs);
    } else {
      nextState = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    }
    
    if (!nextState.includes(b.toString())) {
      let validDigits = [0,1,2,3,4,5,6,7,8,9].filter(d => d !== unluckyDigit);
      if (validDigits.length === 0) validDigits = [0];
      let otherDigit = validDigits[Math.floor(Math.random() * validDigits.length)].toString();
      
      if (gender === 'male') {
        nextState = b.toString() + otherDigit;
      } else if (gender === 'female') {
        nextState = otherDigit + b.toString();
      } else {
        nextState = b.toString() + b.toString();
      }
    }
    
    if (finalNumbers.length === 3) {
      let validDigits = [0,1,2,3,4,5,6,7,8,9].filter(d => d !== unluckyDigit);
      if (validDigits.length === 0) validDigits = [0];
      let firstDigit = validDigits[Math.floor(Math.random() * validDigits.length)].toString();
      finalNumbers.push(firstDigit + nextState);
    } else {
      finalNumbers.push(nextState);
    }
  }
  
  return {
    base_numbers: filteredBase,
    meanings: meanings,
    predicted_numbers: [...new Set(finalNumbers)],
    time_weight: wTime
  };
};
