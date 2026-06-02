import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [userData, setUserData] = useState({
    birthDate: '',
    birthTime: '',
    name: '',
    gender: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('sattha_user_data');
    if (stored) {
      try {
        setUserData(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored data');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...userData, [name]: value };
    setUserData(newData);
    localStorage.setItem('sattha_user_data', JSON.stringify(newData));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'sattha_backup.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const importedData = JSON.parse(e.target.result);
        setUserData(importedData);
        localStorage.setItem('sattha_user_data', JSON.stringify(importedData));
        alert('นำเข้าข้อมูลสำเร็จ');
      } catch (err) {
        alert('รูปแบบไฟล์ไม่ถูกต้อง');
      }
    };
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>การตั้งค่า (Settings)</h2>
      
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>ข้อมูลส่วนบุคคล</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>ชื่อ/นามแฝง</label>
          <input 
            type="text" 
            name="name" 
            value={userData.name} 
            onChange={handleChange}
            style={inputStyle}
            placeholder="ชื่อของคุณ"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>เพศ (เพื่อความแม่นยำในการทำนายฝัน)</label>
          <select 
            name="gender" 
            value={userData.gender || ''} 
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">ไม่ระบุ</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>วันเกิด</label>
          <input 
            type="date" 
            name="birthDate" 
            value={userData.birthDate} 
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>เวลาตกฟาก (เวลาเกิด)</label>
          <input 
            type="time" 
            name="birthTime" 
            value={userData.birthTime} 
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>จัดการข้อมูล (Data Management)</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          ข้อมูลของคุณถูกเก็บไว้ในเครื่องอย่างปลอดภัย ไม่มีการส่งเข้าเซิร์ฟเวอร์
        </p>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExport} style={btnStyle}>📤 Export JSON</button>
          
          <label style={{ ...btnStyle, cursor: 'pointer', textAlign: 'center' }}>
            📥 Import JSON
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '10px', borderRadius: '8px', 
  border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)',
  outline: 'none', fontFamily: 'inherit'
};

const btnStyle = {
  flex: 1, padding: '10px', borderRadius: '8px',
  background: 'white', border: '1px solid var(--gold-light)',
  color: 'var(--gold-primary)', fontWeight: '500', cursor: 'pointer'
};

export default Settings;
