function analyzeFrame() {
  // إدخال القيم
  const H = parseFloat(document.getElementById('colHeight').value) / 1000;
  const B = parseFloat(document.getElementById('frameWidth').value) / 1000;

  const deadLoad = parseFloat(document.getElementById('deadLoad').value) * 9.81;
  const liveLoad = parseFloat(document.getElementById('liveLoad').value) * 9.81;
  const windLoad = parseFloat(document.getElementById('windLoad').value) * 9.81;

  const fy = parseFloat(document.getElementById('fy').value) * 1e6;
  const E = parseFloat(document.getElementById('E').value) * 1e9;

  const colWidth = parseFloat(document.getElementById('colWidth').value) / 1000;
  const colDepth = parseFloat(document.getElementById('colDepth').value) / 1000;
  const beamWidth = parseFloat(document.getElementById('beamWidth').value) / 1000;
  const beamDepth = parseFloat(document.getElementById('beamDepth').value) / 1000;

  // مساحة و قصور المقطع
  const colA = colWidth * colDepth;
  const colI = (colWidth * Math.pow(colDepth, 3)) / 12;
  const beamI = (beamWidth * Math.pow(beamDepth, 3)) / 12;

  // العمود
  const axialLoadCol = (deadLoad + liveLoad) * B / 2 + windLoad;
  const sigmaAxialCol = axialLoadCol / colA;
  const EulerCol = (Math.PI ** 2 * E * colI) / Math.pow(H, 2);
  const safeCol = axialLoadCol < EulerCol ? 'آمن' : 'غير آمن';

  // الرافتر
  const Lbeam = Math.sqrt(Math.pow(B / 2, 2) + Math.pow(H, 2));
  const q = deadLoad + liveLoad;
  const Mmax = q * Math.pow(Lbeam, 2) / 8;
  const sigmaBendingBeam = (Mmax * (beamDepth / 2)) / beamI;
  const safeBeam = sigmaBendingBeam <= fy ? 'آمن' : 'غير آمن';

  // إخراج النتائج
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = `
    <div class="member-result ${safeCol === 'آمن' ? 'safe' : 'unsafe'}">
      <h3>الأعمدة</h3>
      <p>الحالة: ${safeCol}</p>
    </div>
    <div class="member-result ${safeBeam === 'آمن' ? 'safe' : 'unsafe'}">
      <h3>الرافترين</h3>
      <p>الحالة: ${safeBeam}</p>
    </div>
  `;

  // رسم الفريم
  const svg = document.getElementById('frameSVG');
  svg.innerHTML = "";
  const scale = 600 / Math.max(B, H);
  const baseX = 100;
  const baseY = 500;
  const topY = baseY - H * scale;
  const midX = baseX + (B * scale) / 2;

  const colColor = safeCol === 'آمن' ? "green" : "red";
  const beamColor = safeBeam === 'آمن' ? "green" : "red";

  svg.innerHTML += `<rect x="${baseX}" y="${topY}" width="${colWidth * scale}" height="${H * scale}" fill="${colColor}"/>`;
  svg.innerHTML += `<rect x="${baseX + B * scale - colWidth * scale}" y="${topY}" width="${colWidth * scale}" height="${H * scale}" fill="${colColor}"/>`;

  svg.innerHTML += `<line x1="${baseX}" y1="${topY}" x2="${midX}" y2="${topY - (B * scale / 4)}" stroke="${beamColor}" stroke-width="${beamDepth * scale}"/>`;
  svg.innerHTML += `<line x1="${baseX + B * scale}" y1="${topY}" x2="${midX}" y2="${topY - (B * scale / 4)}" stroke="${beamColor}" stroke-width="${beamDepth * scale}"/>`;
}
