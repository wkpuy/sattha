import React, { useState, useEffect } from 'react';
import { Moon, Sparkles, Clock, Search } from 'lucide-react';

const Dream = () => {
  const [dreamText, setDreamText] = useState('');
  const [dreamTime, setDreamTime] = useState('รุ่งสาง');
  const [userData, setUserData] = useState(null);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('sattha_user_data');
    if (stored) {
      setUserData(JSON.parse(stored));
    }
  }, []);

  const handlePredict = async () => {
    if (!dreamText.trim()) {
      alert('กรุณาเล่าความฝันของคุณก่อนครับ');
      return;
    }

    setIsCalculating(true);
    setResult(null);

    let birthDayIndex = -1;
    let gender = '';

    if (userData) {
      if (userData.birthDate) {
        birthDayIndex = new Date(userData.birthDate).getDay();
      }
      gender = userData.gender || '';
    }

    try {
      const query = encodeURIComponent(dreamText);
      const time = encodeURIComponent(dreamTime);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = `${API_URL}/api/dream_predict?query=${query}&birth_day=${birthDayIndex}&gender=${gender}&dream_time=${time}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        alert('เกิดข้อผิดพลาดในการทำนายฝัน');
      }
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Moon size={28} color="var(--gold-primary)" />
          ทำนายฝันอัจฉริยะ
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
          แปลความฝันเป็นเลขมงคลด้วยคณิตศาสตร์
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-panel" style={{ width: '100%', maxWidth: '350px', padding: '20px', marginBottom: '20px' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>
            เรื่องที่คุณฝัน (คำสั้นๆ หรือประโยค)
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text"
              placeholder="เช่น ฝันเห็นงู, น้ำท่วม, ฟันหลุด..."
              value={dreamText}
              onChange={e => setDreamText(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.7)',
                color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>
            <Clock size={16} /> ช่วงเวลาที่ฝัน
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['กลางวัน', 'หัวค่ำ', 'ดึก', 'รุ่งสาง'].map(time => (
              <button 
                key={time}
                onClick={() => setDreamTime(time)}
                style={{
                  flex: '1 1 40%', padding: '10px', borderRadius: '10px', fontSize: '14px',
                  border: dreamTime === time ? '2px solid var(--gold-primary)' : '1px solid var(--glass-border)',
                  background: dreamTime === time ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.5)',
                  color: dreamTime === time ? 'var(--gold-primary)' : 'var(--text-secondary)',
                  fontWeight: dreamTime === time ? 'bold' : 'normal', cursor: 'pointer'
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="btn-primary"
          onClick={handlePredict}
          disabled={isCalculating}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {isCalculating ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ animation: 'spin 2s linear infinite' }} /> กำลังวิเคราะห์...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Moon size={20} /> ทำนายฝัน
            </span>
          )}
        </button>
      </div>

      {/* Profile Warning */}
      {!userData?.birthDate && (
        <div style={{ width: '100%', maxWidth: '350px', padding: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            💡 ไปที่ Settings เพื่อตั้งค่าวันเกิดและเพศ<br/>เพื่อให้ระบบคำนวณเลขกาลกิณีและการวางหลักแม่นยำขึ้น
          </p>
        </div>
      )}

      {/* Results Section */}
      {result && !isCalculating && (
        <div className="glass-panel" style={{ width: '100%', maxWidth: '350px', padding: '25px', animation: 'fadeIn 0.5s ease-out' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--gold-primary)', marginBottom: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} /> ผลทำนายฝันของคุณ
          </h3>
          
          <div style={{ background: 'rgba(255,255,255,0.6)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>คำทำนาย:</div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6' }}>
              {result.meanings.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px dashed var(--gold-light)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'center' }}>
              Layer 1 & 2: กรองเลขฐานและกาลกิณี
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {result.base_numbers.map((num, i) => (
                <span key={i} style={{ 
                  display: 'inline-block', width: '30px', height: '30px', lineHeight: '30px', 
                  textAlign: 'center', background: 'var(--gold-primary)', color: '#fff', 
                  borderRadius: '50%', fontWeight: 'bold', fontSize: '16px' 
                }}>
                  {num}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
              Weight เวลาฝัน: {result.time_weight}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Layer 3: ผสานสถิติ (Markov Chain + Bayes)
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {result.predicted_numbers.map((num, i) => (
                <div key={i} style={{
                  padding: '12px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--gold-light), var(--gold-primary))',
                  color: 'white', fontSize: '24px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)'
                }}>
                  {num}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Dream;
