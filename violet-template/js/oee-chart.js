
// 🛡️ Strong protection against double rendering
let isRenderingOEE = false;
let lastRenderTime = 0;
let renderTimeout = null;
const RENDER_COOLDOWN = 1000; // ms - increased cooldown

// Export flag to window for cross-module checking
window.isRenderingOEE = false;

export async function renderOEECharts() {
  const now = Date.now();
  const caller = new Error().stack.split('\n')[1]?.trim() || 'Unknown';
  
  console.log(`🎯 [OEE Charts] Render request from: ${caller}`);
  
  // Clear any pending timeout
  if (renderTimeout) {
    clearTimeout(renderTimeout);
    renderTimeout = null;
    console.log('🔄 [OEE Charts] Cleared pending render');
  }
  
  // Check if data is available first
  const hasData = sessionStorage.getItem('oeeData');
  console.log('📊 [OEE Charts] Pre-render check:', {
    hasData: !!hasData,
    isRendering: isRenderingOEE,
    timeSinceLastRender: now - lastRenderTime,
    cooldownRemaining: Math.max(0, RENDER_COOLDOWN - (now - lastRenderTime))
  });
  
  // Strong prevention check
  if (isRenderingOEE) {
    console.log('⏭️ [OEE Charts] Already rendering - blocking duplicate call');
    return;
  }
  
  // Relaxed cooldown if we have data and it's been a while
  if (now - lastRenderTime < RENDER_COOLDOWN && hasData) {
    const timeRemaining = RENDER_COOLDOWN - (now - lastRenderTime);
    if (timeRemaining > 100) { // Only enforce cooldown if significant time remaining
      console.log(`⏱️ [OEE Charts] Cooldown active (${timeRemaining}ms remaining)`);
      return;
    } else {
      console.log(`🚀 [OEE Charts] Bypassing short cooldown (${timeRemaining}ms) - data available`);
    }
  }
  
  isRenderingOEE = true;
  window.isRenderingOEE = true;
  lastRenderTime = now;
  console.log('🎨 [OEE Charts] Starting render...');
  
  // Ensure flag is always cleared, even on errors
  try {
  
  // ไม่แสดง error messages บนหน้าจอ - ใช้ console.log แทน
  function showLogOnPage(msg, color = '#fbbf24') {
    // Log to console instead of displaying on page
    console.log(`[OEE Charts] ${msg}`);
  }
  // 🏭 Machine list - hardcoded เพื่อความเสถียร
  const machines = [
    { id: 1, key: "PP12A", name: "PP12 LINE A" },
    { id: 2, key: "PP12C", name: "PP12 LINE C" },
    { id: 3, key: "PP3A", name: "PP3 LINE A" },
    { id: 4, key: "PP3B", name: "PP3 LINE B" },
    { id: 5, key: "PPEC", name: "PPE LINE C" },
    { id: 6, key: "PPED", name: "PPE LINE D" },
    { id: 7, key: "PPCA", name: "PPC LINE A" },
    { id: 8, key: "PPCB", name: "PPC LINE B" },
    { id: 9, key: "HDPEA", name: "HDPE LINE A" }
  ];

  function parseMachineName(key) {
    const machineKey = key.replace('OEEDataList', '');
    const machine = machines.find(m => m.key === machineKey);
    return machine?.name || key;
  }

  function getOrderedMachineKeys(jsonData) {
    const machineKeys = Object.keys(jsonData).filter(k => k.startsWith('OEEDataList'));
    return machineKeys.sort((a, b) => {
      const keyA = a.replace('OEEDataList', '');
      const keyB = b.replace('OEEDataList', '');
      const machineA = machines.find(m => m.key === keyA);
      const machineB = machines.find(m => m.key === keyB);
      return (machineA?.id || 999) - (machineB?.id || 999);
    });
  }

  let oeeDataRaw = sessionStorage.getItem('oeeData');
  console.log('🗄️ [OEE Charts] SessionStorage check:', {
    hasOeeData: !!oeeDataRaw,
    dataLength: oeeDataRaw ? oeeDataRaw.length : 0,
    firstChars: oeeDataRaw ? oeeDataRaw.substring(0, 100) + '...' : 'null'
  });
  
  if (!oeeDataRaw) {
    console.warn('⚠️ [OEE Charts] No oeeData found in sessionStorage, attempting to fetch...');
    showLogOnPage('ไม่พบข้อมูล oeeData ใน sessionStorage กำลังดึงข้อมูลใหม่...', '#fbbf24');
    
    // Try to fetch data directly from API
    console.log('📡 [OEE Charts] Attempting to fetch OEE data from API...');
    try {
      const response = await fetch(`${API_BASE_URL}/oee`);
      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }
      const data = await response.json();
      sessionStorage.setItem('oeeData', JSON.stringify(data));
      oeeDataRaw = JSON.stringify(data);
      console.log('✅ [OEE Charts] Successfully fetched and cached OEE data');
    } catch (error) {
      console.error('❌ [OEE Charts] Failed to fetch OEE data:', error);
      showLogOnPage('เกิดข้อผิดพลาดในการดึงข้อมูล OEE', '#f87171');
      return;
    }
  }
  let data;
  try {
    data = JSON.parse(oeeDataRaw);
    console.log('✅ [OEE Charts] Successfully parsed JSON data:', {
      hasResult: !!data.result,
      hasResultData: !!(data.result && data.result.data),
      topLevelKeys: Object.keys(data),
      resultKeys: data.result ? Object.keys(data.result) : []
    });
  } catch (err) {
    console.error('❌ [OEE Charts] JSON parse error:', err);
    showLogOnPage('ข้อมูล oeeData ใน sessionStorage ไม่ใช่ JSON', '#f87171');
    throw err;
  }

  // ✅ แก้ไข: รองรับ API response format ที่ถูกต้อง
  let jsonData;

  console.log('🔍 Full data structure:', data);

  // รูปแบบที่ได้จริง: data.result.data.OEEDataListXXX
  if (data.result && data.result.data) {
    jsonData = data.result.data;
    console.log('✅ Using data.result.data path');
  }
  // รูปแบบสำรอง: data.result (ถ้ามี OEE lists โดยตรง)
  else if (data.result && Object.keys(data.result).some(key => key.startsWith('OEEDataList'))) {
    jsonData = data.result;
    console.log('✅ Using data.result path');
  }
  // รูปแบบสำรอง: data.data
  else if (data.data) {
    jsonData = data.data;
    console.log('✅ Using data.data path');
  }
  // รูปแบบสำรอง: data โดยตรง
  else if (Object.keys(data).some(key => key.startsWith('OEEDataList'))) {
    jsonData = data;
    console.log('✅ Using direct data path');
  }
  else {
    console.error('❌ Cannot find OEE data in structure:', data);
    showLogOnPage('ไม่พบข้อมูล OEE ใน response', '#f87171');
    throw new Error('ไม่พบข้อมูล OEE ใน response');
  }

  if (!jsonData || typeof jsonData !== 'object') {
    showLogOnPage('ไม่พบข้อมูล OEE ใน response', '#f87171');
    console.error('❌ Data structure:', data);
    throw new Error('ไม่พบข้อมูล OEE ใน response');
  }

  const keys = Object.keys(jsonData);
  console.log('✅ jsonData keys:', keys);
  keys.forEach(key => {
    console.log('key:', key, 'length:', Array.isArray(jsonData[key]) ? jsonData[key].length : 'not array');
  });

  if (jsonData['OEEDataListPP12A']) {
    console.log('Sample OEEDataListPP12A (first 5 rows):', jsonData['OEEDataListPP12A'].slice(0, 5));
    // ตรวจสอบค่า OeeTarget
    const sampleTarget = jsonData['OEEDataListPP12A'][0]?.OeeTarget;
    console.log('🎯 Sample OeeTarget value:', sampleTarget, 'type:', typeof sampleTarget);
  }

  const orderedKeys = getOrderedMachineKeys(jsonData);
  const machineNames = orderedKeys.map(key => {
    const arr = jsonData[key];
    if (Array.isArray(arr) && arr.length > 0 && arr[0].MachineName) {
      return arr[0].MachineName;
    }
    return parseMachineName(key);
  });
  // สร้างเมนูปุ่มเครื่องจักรแนวนอน
  const menuDiv = document.querySelector('.machine-menu');
  if (menuDiv) {
    menuDiv.innerHTML = machineNames.map((name, idx) =>
      `<button class="machine-btn${idx === 0 ? ' active' : ''} px-6 py-2 rounded bg-green-600${idx === 0 ? ' bg-green-700' : ''} text-white font-semibold text-base shadow hover:bg-green-500 hover:text-white transition-colors duration-200" data-key="${orderedKeys[idx]}" data-name="${name}">${name}</button>`
    ).join('');
    // เพิ่ม event listener สำหรับปุ่มในเมนู
    const buttons = menuDiv.querySelectorAll('.machine-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.getAttribute('data-key');
        const chartElement = document.getElementById(`oeeChart_${key}`);
        if (chartElement) {
          chartElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  } else {
    console.error('Menu div not found - machine-menu element is missing');
  }

  const chartsGrid = document.getElementById('chartsGrid');
  if (chartsGrid) {
    chartsGrid.innerHTML = '';
    orderedKeys.forEach((key, idx) => {
      const machineKey = key.replace('OEEDataList', '');
      const machineInfo = machines.find(m => m.key === machineKey);
      if (!machineInfo) {
        showLogOnPage(`API key ${key} ไม่มีใน machines array`, '#f87171');
        return;
      }
      const name = machineNames[idx];
      const rawRows = jsonData[key] || [];

      // กรองข้อมูลที่มี RecordDateString และ OEE ที่ถูกต้อง
      const machineData = rawRows.filter(d => {
        // ใช้ RecordDateString แทน DateString เพราะข้อมูลจริงใช้ field นี้
        const dateField = d.RecordDateString || d.DateString;
        return dateField &&
          dateField.trim() !== '' &&
          typeof d.OEE === 'number' &&
          !isNaN(d.OEE);
      });

      const filteredOut = rawRows.filter(d => {
        const dateField = d.RecordDateString || d.DateString;
        return !(dateField &&
          dateField.trim() !== '' &&
          typeof d.OEE === 'number' &&
          !isNaN(d.OEE));
      });

      // แสดง info แทน warning และให้รายละเอียดมากขึ้น
      if (filteredOut.length > 0) {
        console.info(`📊 ${name}: ${machineData.length}/${rawRows.length} rows valid`);
        console.info('Sample filtered rows:', filteredOut.slice(0, 3).map(row => ({
          Id: row.Id || 'No Id',
          DateString: row.DateString || 'No DateString',
          RecordDateString: row.RecordDateString || 'No RecordDateString',
          OEE: row.OEE,
          MachineId: row.MachineId || 'No MachineId',
          reason: !row.RecordDateString && !row.DateString ? 'No Date Fields' :
            (!row.RecordDateString ? 'No RecordDateString' : '') +
            (!row.DateString ? ' No DateString' : '') +
            (row.RecordDateString && row.RecordDateString.trim() === '' ? ' Empty RecordDateString' : '') +
            (typeof row.OEE !== 'number' ? ' Invalid OEE type' : '') +
            (isNaN(row.OEE) ? ' OEE is NaN' : '') || 'Unknown'
        })));

        // แสดงข้อมูลแถวแรกที่มีปัญหาแบบเต็ม
        console.info('Full data of first filtered row:', filteredOut[0]);
      } else {
        console.info(`✅ ${name}: All ${rawRows.length} rows are valid`);
      }
      const countRows = machineData.length;
      showLogOnPage(`พบข้อมูล machineName=${name} จำนวน ${countRows} แถว`, '#fbbf24');
      machineData.sort((a, b) => {
        const dateA = a.RecordDateString || a.DateString;
        const dateB = b.RecordDateString || b.DateString;
        return dateA.localeCompare(dateB);
      });
      const chartDivId = `oeeChart_${key}`;
      const chartContainer = document.createElement('div');
      chartContainer.className = 'chart-container';

      chartContainer.innerHTML = `<div id="${chartDivId}" class="chart" style="width: 100%; height: 100%;"></div>`;
      chartsGrid.appendChild(chartContainer);
      const chartDiv = document.getElementById(chartDivId);
      console.log('Creating chart for:', name, 'chartDivId:', chartDivId, 'machineKey:', machineKey);
      if (!machineData || machineData.length === 0) {
        if (chartDiv) chartDiv.innerHTML = `<div class="no-data-message">ไม่พบข้อมูล OEE ${name}</div>`;
        showLogOnPage('No data for machine: ' + name, '#f87171');
        return;
      }
      Highcharts.chart(chartDivId, {
        chart: {
          type: 'column',
          backgroundColor: window.getChartTheme().card,
          plotBackgroundColor: window.getChartTheme().card,
          style: { fontFamily: 'inherit' },
          height: 500,
          spacing: [20, 20, 20, 20],
          reflow: true
        },
        title: {
          text: machineData[0]?.TitleOEE || `OEE Machine ${name}`,
          style: { color: window.getChartTheme().text, fontWeight: 'bold', fontSize: '16px', fontFamily: 'inherit' }
        },
        legend: {
          itemStyle: { color: window.getChartTheme().text, fontSize: '12px', fontWeight: '400' },
          itemHoverStyle: { color: window.getChartTheme().accent },
          itemHiddenStyle: { color: window.getChartTheme().textMuted }
        },
        xAxis: {
          type: 'datetime',
          labels: {
            style: { color: window.getChartTheme().text, fontSize: '12px', fontFamily: 'inherit' },
            rotation: -45,
            align: 'right'
          },
          gridLineColor: window.getChartTheme().isHighContrast ? window.getChartTheme().text : `${window.getChartTheme().text}20`,
          lineColor: window.getChartTheme().isHighContrast ? window.getChartTheme().text : `${window.getChartTheme().text}40`
        },
        yAxis: {
          min: 0,
          max: 125,
          title: { text: '%', style: { color: window.getChartTheme().text, fontFamily: 'inherit' } },
          labels: { style: { color: window.getChartTheme().text, fontSize: '12px', fontFamily: 'inherit' } },
          gridLineColor: window.getChartTheme().isHighContrast ? window.getChartTheme().text : `${window.getChartTheme().text}20`
        },
        series: [
          {
            name: 'OEE',
            type: 'column',
            color: window.getChartTheme().chartColors.oee,
            borderRadius: 3,
            data: machineData.map(d => {
              const dateField = d.RecordDateString || d.DateString;
              return {
                x: new Date(dateField).getTime(),
                y: d.OEE,
                color: d.Color || window.getChartTheme().chartColors.oee,
                remarks: d.Remarks,
                dateString: dateField,
                OEE: d.OEE,
                Availability: d.Availability,
                Performance: d.Performance,
                Quality: d.Quality,
                OeeTarget: d.OeeTarget
              };
            })
          },
          {
            name: 'Availability',
            type: 'line',
            color: '#4572A7',
            lineWidth: 2,
            marker: { symbol: 'circle', radius: 4 },
            data: machineData.map(d => {
              const dateField = d.RecordDateString || d.DateString;
              return {
                x: new Date(dateField).getTime(),
                y: typeof d.Availability === 'number' ? d.Availability : null
              };
            })
          },
          {
            name: 'Performance',
            type: 'line',
            color: '#AA4643',
            lineWidth: 2,
            marker: { symbol: 'diamond', radius: 4 },
            data: machineData.map(d => {
              const dateField = d.RecordDateString || d.DateString;
              return {
                x: new Date(dateField).getTime(),
                y: typeof d.Performance === 'number' ? d.Performance : null
              };
            })
          },
          {
            name: 'Quality',
            type: 'line',
            color: '#89A54E',
            lineWidth: 2,
            marker: { symbol: 'triangle', radius: 4 },
            data: machineData.map(d => {
              const dateField = d.RecordDateString || d.DateString;
              return {
                x: new Date(dateField).getTime(),
                y: typeof d.Quality === 'number' ? d.Quality : null
              };
            })
          },
          {
            name: 'Target',
            type: 'line',
            color: window.getChartTheme().chartColors.target,
            dashStyle: 'Solid',
            lineWidth: 2,
            marker: { enabled: false },
            data: machineData.map(d => {
              const dateField = d.RecordDateString || d.DateString;
              let targetValue = 85; // default
              if (typeof d.OeeTarget === 'number') {
                // ถ้าค่าเป็น decimal (0.01 - 1.00) ให้คูณ 100 เป็น percentage
                targetValue = d.OeeTarget < 1 ? d.OeeTarget * 100 : d.OeeTarget;
              }
              return {
                x: new Date(dateField).getTime(),
                y: targetValue
              };
            })
          }
        ],
        tooltip: {
          shared: true,
          backgroundColor: 'rgba(255,255,255,0.95)',
          style: {
            color: '#dfe074ff',
              width: 'auto',
              maxWidth: '400px' // กำหนดความกว้างสูงสุด
          },
          borderWidth: 0,
          borderRadius: 8,
          shadow: true,
          useHTML: true,
          formatter: function () {
            if (!this.points) return '';

            const oeePoint = this.points.find(p => p.series.name === 'OEE');
            if (!oeePoint) return '';

            let dateString = oeePoint.point.dateString || '';
            if (dateString) {
              const d = new Date(dateString);
              dateString = d.toISOString().slice(0, 10);
            }
            const remarks = oeePoint.point.remarks || [];

            const oeeValue = this.points.find(p => p.series.name === 'OEE')?.y;
            const availValue = this.points.find(p => p.series.name === 'Availability')?.y;
            const perfValue = this.points.find(p => p.series.name === 'Performance')?.y;
            const qualValue = this.points.find(p => p.series.name === 'Quality')?.y;
            const targetValue = this.points.find(p => p.series.name === 'Target')?.y;

            let html = `<div style="min-width: 280px; max-width: 380px; padding: 12px; font-size: 11px; line-height: 1.5;">`;
            html += `<div style="text-align: center; margin-bottom: 12px;">`;
            html += `<div style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${dateString}</div>`;
            html += `<div style="font-size: 12px; font-weight: 500; color: #666;">OEE Performance</div>`;
            html += `</div><div style="height: 1px; background: #ddd; margin: 8px 0;"></div>`;

            [
              { name: 'OEE', color: '#22c55e', value: oeeValue },
              { name: 'Availability', color: '#4572A7', value: availValue },
              { name: 'Performance', color: '#AA4643', value: perfValue },
              { name: 'Quality', color: '#89A54E', value: qualValue },
              { name: 'Target', color: '#FF0000', value: targetValue }
            ].forEach(item => {
              html += `<div style="display: flex; align-items: center; margin: 4px 0; gap: 8px;">`;
              html += `<span style="display: flex; align-items: center; min-width: 100px;">`;
              html += `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; background-color: ${item.color};"></span>`;
              html += `<span style="color: #444;">${item.name}:</span></span>`;
              html += `<span style="font-weight: 600; color: #1a1a1a;">${item.value !== null && item.value !== undefined ? item.value.toFixed(2) + '%' : '-'}</span></div>`;
            });

            html += `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd;">`;
            html += `<div style="font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">Remarks:</div>`;
            html += `<div style="padding-left: 8px; max-height: 120px; overflow-y: auto;">`; // เพิ่มการ scroll ถ้าเนื้อหายาวเกิน
            if (Array.isArray(remarks) && remarks.length > 0) {
              remarks.forEach(remark => {
                // เพิ่ม word-wrap และ overflow-wrap สำหรับข้อความยาว
                html += `<div style="color: #666; margin-bottom: 4px; font-size: 11px; line-height: 1.4; display: flex; align-items: start;">
                <span style="display: inline-block; min-width: 12px; color: #444; margin-right: 4px;">•</span>
                <span style="flex: 1; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; max-width: 320px;">${remark}</span>
                </div>`;
              });
            } else {
              html += `<div style="color: #666; font-size: 11px;">-</div>`;
            }
            html += '</div></div>';
            html += '</div>';
            return html;
          }
        },
        accessibility: { enabled: false },
        credits: { enabled: false }
      });
    });
  }

  // Safely handle gotoTopBtn
  try {
    const gotoTopBtn = document.getElementById('gotoTopBtn');
    if (gotoTopBtn) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
          gotoTopBtn.style.display = 'flex';
        } else {
          gotoTopBtn.style.display = 'none';
        }
      });
      gotoTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  } catch (error) {
    console.warn('⚠️ [OEE Charts] Error setting up gotoTopBtn:', error);
  }
  
    // Always unlock flag when render completes (with delay to ensure completion)
    setTimeout(() => {
      isRenderingOEE = false;
      window.isRenderingOEE = false;
      console.log('✅ [OEE Charts] Render completed and flag cleared');
    }, 100);
    
  } catch (error) {
    console.error('❌ [OEE Charts] Error during rendering:', error);
    // Ensure flag is cleared even on error
    isRenderingOEE = false;
    window.isRenderingOEE = false;
  } finally {
    // Double safety - always clear flag
    setTimeout(() => {
      if (isRenderingOEE) {
        isRenderingOEE = false;
        window.isRenderingOEE = false;
        console.warn('⚠️ [OEE Charts] Flag force-cleared in finally block');
      }
    }, 200);
  }
}

// Export to window for SPA usage
window.renderOEECharts = renderOEECharts;