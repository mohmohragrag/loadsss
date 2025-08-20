function analyzeFrame() {
  // قراءة المدخلات وتحويلها
  const H_mm = Number(document.getElementById('colHeight').value) || 0;
  const B_mm = Number(document.getElementById('frameWidth').value) || 0;

  const deadKgPerM = Number(document.getElementById('deadLoad').value) || 0;
  const liveKgPerM = Number(document.getElementById('liveLoad').value) || 0;
  const windKgPerCol = Number(document.getElementById('windLoad').value) || 0;

  const fy = (Number(document.getElementById('fy').value) || 355) * 1e6;
  const E = (Number(document.getElementById('E').value) || 210) * 1e9;

  const colWidth_mm = Number(document.getElementById('colWidth').value) || 200;
  const colDepth_mm = Number(document.getElementById('colDepth').value) || 300;
  const beamWidth_mm = Number(document.getElementById('beamWidth').value) || 200;
  const beamDepth_mm = Number(document.getElementById('beamDepth').value) || 250;

  // التحويل للمتر
  const H = H_mm / 1000;
  const B = B_mm / 1000;
  const colWidth = colWidth_mm / 1000;
  const colDepth = colDepth_mm / 1000;
  const beamWidth = beamWidth_mm / 1000;
  const beamDepth = beamDepth_mm / 1000;

  // الأحمال
  const deadLoad = deadKgPerM * 0.00981;   // kN/m
  const liveLoad = liveKgPerM * 0.00981;   // kN/m
  const wind_kN = windKgPerCol * 9.81 / 1000; // kN

  // خصائص المقاطع
  const colA = colWidth * colDepth;
  const colI = (colWidth * Math.pow(colDepth, 3)) / 12;
  const beamA = beamWidth * beamDepth;
  const beamI = (beamWidth * Math.pow(beamDepth, 3)) / 12;

  // حسابات الأعمدة
  const axialLoadCol_kN = (deadLoad + liveLoad) * (B) / 2 + (wind_kN / 2);
  const sigmaAxialCol_Pa = (axialLoadCol_kN * 1000) / colA;
  const EulerCol_Pa = (Math.PI ** 2 * E * colI) / (Math.pow(H, 2) || 1e-9);
  const utilizationCol = sigmaAxialCol_Pa / fy;
  const safeCol = utilizationCol <= 1;

  // حسابات الرافتر
  const Lbeam = B / 2;
  const w_uniform = (deadLoad + liveLoad);
  const MmaxBeam_Nm = w_uniform * Math.pow(Lbeam, 2) / 8 * 1000;
  const sigmaBendingBeam_Pa = (MmaxBeam_Nm * (beamDepth / 2)) / (beamI || 1e-12);
  const utilizationBeam = sigmaBendingBeam_Pa / fy;
  const safeBeam = utilizationBeam <= 1;

  // إخراج النتائج
  const output = document.getElementById('output');
  output.innerHTML = '';

  function mkDiv(title, lines, ok) {
    const d = document.createElement('div');
    d.className = 'member-result ' + (ok ? 'safe' : 'unsafe');
    let html = `<strong>${title}</strong><br>`;
    lines.forEach(l => html += `<div style="margin-top:4px;font-size:13px">${l}</div>`);
    d.innerHTML = html;
    return d;
  }

  const colLines = [
    `أبعاد(مم): عرض ${colWidth_mm} × عمق ${colDepth_mm}`,
    `الإجهاد المحوري ≈ ${(sigmaAxialCol_Pa/1e6).toFixed(2)} MPa`,
    `إجهاد الانبعاج Euler ≈ ${(EulerCol_Pa/1e6).toFixed(2)} MPa`,
    `معامل الاستخدام ≈ ${utilizationCol.toFixed(2)}`,
    `حمل محوري تقريبي ≈ ${axialLoadCol_kN.toFixed(2)} kN`
  ];
  output.appendChild(mkDiv('العمود الأيسر', colLines, safeCol));
  output.appendChild(mkDiv('العمود الأيمن', colLines, safeCol));

  const beamLines = [
    `أبعاد (مم): عرض ${beamWidth_mm} × عمق ${beamDepth_mm}`,
    `طول الرافتر ≈ ${(Lbeam*1000).toFixed(0)} مم`,
    `أقصى عزم ≈ ${(MmaxBeam_Nm).toFixed(1)} N·m`,
    `إجهاد انحناء ≈ ${(sigmaBendingBeam_Pa/1e6).toFixed(2)} MPa`,
    `معامل الاستخدام ≈ ${utilizationBeam.toFixed(2)}`
  ];
  output.appendChild(mkDiv('الرافتر الأيسر', beamLines, safeBeam));
  output.appendChild(mkDiv('الرافتر الأيمن', beamLines, safeBeam));

  // رسم الفريم
  drawFrameSVG({H,B,colWidth,beamWidth,safeCol,safeBeam});
}

// --- رسم الفريم (عمودين + رافترين) ---
function drawFrameSVG({H,B,colWidth,beamWidth,safeCol,safeBeam}) {
  const svg = document.getElementById('frameSVG');
  svg.innerHTML = "";

  const pxPerM = 50;       // مقياس الرسم
  const baseY = 700;       // مستوى الأرض
  const leftX = 100;
  const rightX = leftX + B * pxPerM;

  const colTopY = baseY - H * pxPerM;

  // نقطة القمة (منتصف البحر + ارتفاع إضافي)
  const ridgeX = (leftX + rightX) / 2;
  const ridgeY = colTopY - (B * 0.25 * pxPerM);

  // الأعمدة
  const colColor = safeCol ? "green" : "red";
  svg.appendChild(line(leftX, baseY, leftX, colTopY, colColor, colWidth*200));
  svg.appendChild(line(rightX, baseY, rightX, colTopY, colColor, colWidth*200));

  // الرافترين
  const beamColor = safeBeam ? "green" : "red";
  svg.appendChild(line(leftX, colTopY, ridgeX, ridgeY, beamColor, beamWidth*200));
  svg.appendChild(line(rightX, colTopY, ridgeX, ridgeY, beamColor, beamWidth*200));
}

// دالة مساعدة لرسم خط
function line(x1,y1,x2,y2,color,width) {
  const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
  l.setAttribute("x1", x1);
  l.setAttribute("y1", y1);
  l.setAttribute("x2", x2);
  l.setAttribute("y2", y2);
  l.setAttribute("stroke", color);
  l.setAttribute("stroke-width", width);
  l.setAttribute("stroke-linecap", "round");
  return l;
}
