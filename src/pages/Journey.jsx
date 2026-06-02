import React, { useState, useEffect } from 'react';
import { Map } from 'lucide-react';

const Journey = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('sattha_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัติคำทำนายทั้งหมด?')) {
      localStorage.removeItem('sattha_history');
      setHistory([]);
    }
  };

  const mockWinningNumbers = {
    '2026-06-16': ['88', '559', '14'],
    '2026-07-01': ['12', '92', '01'],
    '2026-07-16': ['77', '333', '85'],
    '2026-08-01': ['00', '111', '22'],
    '2026-08-16': ['33', '444', '55']
  };

  const checkWin = (num, drawDate) => {
    const winners = mockWinningNumbers[drawDate] || [];
    return winners.includes(num);
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600' }}>ประวัติการทำนาย</h2>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            style={{ 
              background: 'none', border: 'none', color: '#ff4d4f', fontSize: '14px', cursor: 'pointer' 
            }}
          >
            ล้างประวัติ
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: 'var(--text-secondary)' }}>
            <Map size={48} />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>ยังไม่มีประวัติการทำนาย</p>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
            เมื่อคุณทำการทำนายผล ประวัติจะถูกบันทึกและแสดงที่นี่
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {history.map((item, index) => (
            <div key={index} className="glass-panel" style={{ padding: '15px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(item.timestamp).toLocaleString('th-TH')}
                </span>
                <span style={{ fontSize: '12px', background: 'var(--gold-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                  สัดส่วนความเชื่อ {item.mixRatio}%
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                งวดที่: <strong>{item.drawDate}</strong>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {item.numbers.map((num, i) => {
                  const isWin = checkWin(num, item.drawDate);
                  return (
                    <div key={i} style={{
                      minWidth: '45px', height: '45px', padding: '0 8px',
                      borderRadius: '22.5px',
                      background: isWin ? 'linear-gradient(135deg, #00b09b, #96c93d)' : 'linear-gradient(135deg, var(--gold-light), var(--gold-primary))',
                      color: 'white',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isWin ? '0 4px 10px rgba(0, 176, 155, 0.4)' : '0 4px 10px rgba(212, 175, 55, 0.3)',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{num}</span>
                      {isWin && <span style={{ fontSize: '8px', background: 'white', color: '#00b09b', padding: '2px 4px', borderRadius: '4px', position: 'absolute', top: '-8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>HIT!</span>}
                    </div>
                  );
                })}
              </div>

              {/* Show mock results for context */}
              {mockWinningNumbers[item.drawDate] && (
                <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(0,0,0,0.03)', padding: '8px', borderRadius: '8px' }}>
                  ผลรางวัลที่ออก (Mock): <strong style={{ color: 'var(--text-primary)' }}>{mockWinningNumbers[item.drawDate].join(', ')}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Journey;
