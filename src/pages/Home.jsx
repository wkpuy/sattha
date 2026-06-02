import React, { useState, useEffect } from 'react';
import { Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import MixerDial from '../components/MixerDial';
import PredictionCard from '../components/PredictionCard';

const Home = () => {
  const [mixRatio, setMixRatio] = useState(50); // 50 means 50/50
  const [drawDate, setDrawDate] = useState('2026-06-16'); // Default to next draw
  
  // State สำหรับเก็บรายการความเชื่อที่ดึงมาจาก Backend
  const [availableSources, setAvailableSources] = useState([]);
  
  // State สำหรับเก็บว่า source ไหนถูกเลือกบ้าง (id: boolean)
  const [selectedSources, setSelectedSources] = useState({});

  // State สำหรับเก็บสถานะฐานข้อมูล
  const [systemStatus, setSystemStatus] = useState(null);

  const [isCalculating, setIsCalculating] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionDetails, setPredictionDetails] = useState(null);
  const [predictionExplanation, setPredictionExplanation] = useState(null);
  const [seedNumber, setSeedNumber] = useState('');
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // ดึงข้อมูลเมื่อเปลี่ยนงวด
  useEffect(() => {
    const fetchSources = async () => {
      try {
        // Fetch faith sources
        const res = await fetch(`${API_URL}/api/available_sources?draw_date=${drawDate}`);
        const data = await res.json();
        setAvailableSources(data);
        
        // Fetch system status
        const statusRes = await fetch(`${API_URL}/api/system_status?draw_date=${drawDate}`);
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
        
        // Default ให้ติ๊กเลือกทั้งหมด
        const initialSelected = {};
        data.forEach(source => {
          initialSelected[source.id] = true;
        });
        setSelectedSources(initialSelected);
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };
    fetchSources();
  }, [drawDate]);

  const handleSourceChange = (id) => {
    setSelectedSources(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setPrediction(null);
    
    try {
      // ดึงข้อมูลวันเกิดจาก LocalStorage อย่างปลอดภัย
      let birthDay = -1;
      try {
        const stored = localStorage.getItem('sattha_user_data');
        if (stored) {
          const data = JSON.parse(stored);
          if (data && data.birthDate) {
            const parsedDate = new Date(data.birthDate);
            if (!isNaN(parsedDate)) {
              birthDay = parsedDate.getDay();
            }
          }
        }
      } catch (err) {
        console.warn("Could not parse user birth date", err);
      }

      // ส่ง Request ไปยัง Python FastAPI Backend
      const sourcesParam = Object.keys(selectedSources).filter(k => selectedSources[k]).join(',');
      const response = await fetch(`${API_URL}/api/predict?mix_ratio=${mixRatio}&birth_day=${birthDay}&draw_date=${drawDate}&faith_sources=${sourcesParam}&seed_number=${seedNumber}`);
      const data = await response.json();
      
      // หน่วงเวลาจำลองเล็กน้อยเพื่อความขลัง (Quantum Effect)
      setTimeout(() => {
        setPrediction(data.numbers);
        setPredictionDetails(data.details);
        setPredictionExplanation(data.explanation);
        setIsCalculating(false);

        // บันทึกประวัติลง LocalStorage สำหรับหน้า Journey
        const historyItem = {
          numbers: data.numbers,
          drawDate: drawDate,
          mixRatio: mixRatio,
          timestamp: new Date().toISOString()
        };
        const existingHistory = JSON.parse(localStorage.getItem('sattha_history') || '[]');
        localStorage.setItem('sattha_history', JSON.stringify([historyItem, ...existingHistory]));

      }, 1000);

    } catch (error) {
      console.error("Backend connection error:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบว่ารัน Python Backend หรือยัง");
      setIsCalculating(false);
    }
  };

  const [showInfoModal, setShowInfoModal] = useState(false);

  const getDrawDateRangeText = (currentDraw) => {
    const ranges = {
      '2026-06-16': '1 มิ.ย. - 16 มิ.ย. 69',
      '2026-07-01': '16 มิ.ย. - 1 ก.ค. 69',
      '2026-07-16': '1 ก.ค. - 16 ก.ค. 69',
      '2026-08-01': '16 ก.ค. - 1 ส.ค. 69',
      '2026-08-16': '1 ส.ค. - 16 ส.ค. 69',
    };
    return ranges[currentDraw] || 'รอบล่าสุด';
  };

  return (
    <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          ระบบคำนวณสถิติ
          <button 
            onClick={() => setShowInfoModal(true)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              color: 'var(--gold-primary)', padding: '0', display: 'flex', alignItems: 'center' 
            }}
            title="ดูหลักการคำนวณ"
          >
            <Info size={20} />
          </button>
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
          ปรับสัดส่วนระหว่างคณิตศาสตร์และความเชื่อ
        </p>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-primary)',
            padding: '25px', borderRadius: '20px', maxWidth: '400px', width: '100%',
            maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--gold-primary)' }}>หลักการทำงานของระบบ</h3>
              <button onClick={() => setShowInfoModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '15px' }}>
                แอปพลิเคชัน Sattha ขับเคลื่อนด้วยสถาปัตยกรรมแบบ Hybrid ที่ผสานหลักการทางวิทยาศาสตร์เข้ากับศาสตร์แห่งความเชื่อ:
              </p>
              
              <h4 style={{ color: 'var(--gold-primary)', marginBottom: '5px' }}>🧠 Math Engine (ฝั่งตรรกะ)</h4>
              <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                <li><strong>Monte Carlo Simulation:</strong> จำลองการสุ่มตัวเลข 1,000,000 ครั้งผ่านไลบรารี NumPy เพื่อค้นหาตัวเลขที่มีความน่าจะเป็นเชิงสถิติสูงสุด (Hot Numbers)</li>
                <li><strong>Markov Chain:</strong> วิเคราะห์สถิติหวยย้อนหลังเพื่อหาความน่าจะเป็นของตัวเลขที่จะออกตามหลังเหตุการณ์ในอดีต</li>
              </ul>

              <h4 style={{ color: 'var(--gold-primary)', marginBottom: '5px' }}>🔮 Faith Engine (ฝั่งความเชื่อ)</h4>
              <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                <li><strong>Dynamic Scraping:</strong> ดึงกระแสข่าวและแหล่งความเชื่อที่เกิดขึ้นจริงในช่วงเวลาก่อนหวยออก (15 วัน) เช่น เลขธูป ทะเบียนรถ ทำนายฝัน</li>
                <li><strong>Personalization:</strong> กรอง "เลขกาลกิณี" ออกโดยอัตโนมัติ อ้างอิงจากวันเกิดที่คุณตั้งค่าไว้ เพื่อให้ได้เลขที่เป็นมงคลกับคุณที่สุด</li>
              </ul>

              <h4 style={{ color: 'var(--gold-primary)', marginBottom: '5px' }}>⚖️ Mixer Dial</h4>
              <p>คุณสามารถควบคุมน้ำหนักการประมวลผลได้เอง หากคุณเลือกผสม 50/50 ระบบจะนำตัวเลขจาก Math Engine 1 ตัว และ Faith Engine 1 ตัว มารวมกันผ่านอัลกอริทึม Quantum Randomness เพื่อสร้างผลลัพธ์ที่เป็นเอกลักษณ์เฉพาะคุณ</p>
            </div>
            
            <button 
              onClick={() => setShowInfoModal(false)}
              style={{
                width: '100%', padding: '12px', marginTop: '20px',
                background: 'linear-gradient(135deg, var(--gold-light), var(--gold-primary))',
                color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* เพิ่ม Dropdown เลือกงวดที่ต้องการทำนาย */}
      <div style={{ marginBottom: '30px', width: '100%', maxWidth: '300px' }}>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'center' }}>
          เลือกงวดที่หวยออก
        </label>
        <select 
          value={drawDate} 
          onChange={(e) => setDrawDate(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 15px',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255, 255, 255, 0.7)',
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontFamily: 'inherit',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            WebkitAppearance: 'none',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <option value="2026-06-16">งวดวันที่ 16 มิถุนายน 2569</option>
          <option value="2026-07-01">งวดวันที่ 1 กรกฎาคม 2569</option>
          <option value="2026-07-16">งวดวันที่ 16 กรกฎาคม 2569</option>
          <option value="2026-08-01">งวดวันที่ 1 สิงหาคม 2569</option>
          <option value="2026-08-16">งวดวันที่ 16 สิงหาคม 2569</option>
        </select>
      </div>

      {/* เพิ่มช่องกรอกเลขในใจ */}
      <div style={{ marginBottom: '30px', width: '100%', maxWidth: '300px', margin: '0 auto 30px auto' }}>
        <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'center' }}>
          เลขในใจของคุณ (ถ้ามี)
        </label>
        <input 
          type="text" 
          value={seedNumber} 
          onChange={(e) => setSeedNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          placeholder="เช่น 12 หรือ 999"
          style={{
            width: '100%',
            padding: '12px 15px',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255, 255, 255, 0.7)',
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontFamily: 'inherit',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            textAlign: 'center'
          }}
        />
      </div>

      <MixerDial value={mixRatio} onChange={setMixRatio} />

      {/* ส่วนเลือกแหล่งความเชื่อ (แสดงเฉพาะตอนที่วงล้อมี Faith เข้ามาเกี่ยว) */}
      {mixRatio > 0 && availableSources.length > 0 && (
        <div style={{ marginTop: '30px', width: '100%', maxWidth: '300px', margin: '30px auto 0 auto' }}>
          <button 
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
            style={{ 
              width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.7)', color: 'var(--text-primary)',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>คัดกรองแหล่งความเชื่อ</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                ช่วงวันที่ {getDrawDateRangeText(drawDate).replace(' - ', '-')}
              </span>
            </div>
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
              {isSourcesExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
            </div>
          </button>
          
          {isSourcesExpanded && (
            <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
              {availableSources.map(source => (
                <div key={source.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={!!selectedSources[source.id]} 
                    onChange={() => handleSourceChange(source.id)} 
                    style={{ accentColor: 'var(--gold-primary)', marginTop: '4px', cursor: 'pointer' }} 
                  />
                  <div style={{ textAlign: 'left' }}>
                    <label 
                      onClick={() => handleSourceChange(source.id)}
                      style={{ fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: 'var(--text-primary)', display: 'block' }}
                    >
                      {source.name}
                    </label>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      {source.description}
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: 'var(--gold-primary)', marginLeft: '6px', textDecoration: 'none', fontWeight: '500' }}
                        >
                          [อ่านต่อ]
                        </a>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* สถานะฐานข้อมูล (Data Diagnostics) */}
      {systemStatus && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%', maxWidth: '300px', margin: '20px auto 0 auto' }}>
          <div style={{ flex: 1, padding: '12px 6px', textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ประวัติหวย</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--gold-primary)' }}>
              {systemStatus.historical_records?.toLocaleString() || '...'}
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px 6px', textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>รอบจำลอง</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {systemStatus.monte_carlo_iterations?.toLocaleString() || '...'}
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px 6px', textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ความพร้อม</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
              {systemStatus.confidence_level || '...'}%
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn-primary"
          onClick={handleCalculate}
          disabled={isCalculating}
          style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
        >
          {isCalculating ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ animation: 'spin 2s linear infinite' }} /> กำลังประมวลผลควอนตัม...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={20} /> ทำนายผล
            </span>
          )}
        </button>
      </div>

      {prediction && predictionDetails && !isCalculating && (
        <div className="glass-panel" style={{ marginTop: '40px', padding: '30px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out', width: '100%', maxWidth: '350px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
            ผลการคำนวณของคุณ
          </h3>
          
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '25px', lineHeight: '1.5', background: 'rgba(212, 175, 55, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            {predictionExplanation}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {predictionDetails.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.7)', 
                borderRadius: '12px', padding: '12px', border: '1px solid var(--glass-border)'
              }}>
                <div style={{
                  minWidth: '55px', height: '55px', padding: '0 10px',
                  borderRadius: '27.5px',
                  background: item.type === 'Math' ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : 'linear-gradient(135deg, var(--gold-light), var(--gold-primary))',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: 'bold',
                  boxShadow: item.type === 'Math' ? '0 4px 10px rgba(0, 242, 254, 0.3)' : '0 4px 10px rgba(212, 175, 55, 0.3)',
                  flexShrink: 0
                }}>
                  {item.num}
                </div>
                <div style={{ marginLeft: '15px', textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: item.type === 'Math' ? '#0072ff' : 'var(--gold-primary)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {item.type} Engine
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: '25px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            *ผลลัพธ์ใช้เพื่อเป็นแนวทาง โปรดใช้วิจารณญาณในการตัดสินใจ
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
