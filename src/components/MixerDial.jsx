import React, { useState } from 'react';

const MixerDial = ({ value, onChange }) => {
  // value: 0 (100% Math) to 100 (100% Faith)
  
  const getMixLabel = (val) => {
    if (val === 0) return '100% Pure Math';
    if (val === 100) return '100% Supreme Faith';
    if (val === 50) return 'Hybrid (50/50)';
    if (val < 50) return `Hybrid (${100-val}% Math / ${val}% Faith)`;
    return `Hybrid (${100-val}% Math / ${val}% Faith)`;
  };

  const getGradient = (val) => {
    // 0 is blue/cool, 100 is orange/gold/warm
    const faithPercent = val;
    const mathPercent = 100 - val;
    return `linear-gradient(90deg, #74b9ff ${mathPercent}%, #f1c40f ${mathPercent}%)`;
  };

  return (
    <div className="glass-panel" style={{ padding: '30px 20px', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '18px', color: 'var(--gold-primary)' }}>Algorithm Mixer</h3>
      <p style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--text-secondary)' }}>
        {getMixLabel(value)}
      </p>
      
      <div style={{ position: 'relative', height: '40px', display: 'flex', alignItems: 'center' }}>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ 
            width: '100%', 
            appearance: 'none', 
            height: '8px',
            borderRadius: '4px',
            background: getGradient(value),
            outline: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', fontWeight: 'bold' }}>
        <span style={{ color: 'var(--accent-blue)' }}>100% Math</span>
        <span style={{ color: 'var(--gold-primary)' }}>100% Faith</span>
      </div>
    </div>
  );
};

export default MixerDial;
