import React from 'react';

const PredictionCard = ({ numbers, mixRatio }) => {
  return (
    <div className="glass-panel" style={{ padding: '20px', marginTop: '20px', textAlign: 'center' }}>
      <h3 style={{ color: 'var(--gold-primary)', fontSize: '18px', marginBottom: '15px' }}>เลขมงคลของคุณ</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
        {numbers.map((n, i) => (
          <div key={i} style={{
            fontSize: '32px', fontWeight: 'bold', 
            background: 'rgba(255,255,255,0.9)',
            border: '2px solid var(--gold-light)',
            color: 'var(--text-primary)',
            borderRadius: '12px', width: '70px', height: '70px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
          }}>
            {n}
          </div>
        ))}
      </div>
      <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        (คำนวณจากสัดส่วน: สถิติ {100-mixRatio}% / สายมู {mixRatio}%)
      </p>
    </div>
  );
};

export default PredictionCard;
