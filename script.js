<script>
// --- theme toggle ---
(function(){
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var label = document.getElementById('theme-label');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var current = prefersDark ? 'dark' : 'light';
  root.setAttribute('data-theme', current);
  label.textContent = current === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง';

  toggle.addEventListener('click', function(){
    current = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', current);
    label.textContent = current === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง';
  });
})();

// --- pillow calculator ---
(function(){
  var sliders = {
    back: document.getElementById('w-back'),
    side: document.getElementById('w-side'),
    stomach: document.getElementById('w-stomach')
  };
  var pctLabels = {
    back: document.getElementById('pct-back'),
    side: document.getElementById('pct-side'),
    stomach: document.getElementById('pct-stomach')
  };
  var posLabelTh = { back: 'นอนหงาย', side: 'นอนตะแคง', stomach: 'นอนคว่ำ' };
  var posColorVar = { back: '--col-back', side: '--col-side', stomach: '--col-stomach' };
  var shapeLabelTh = { rect: 'หมอนมาตรฐาน', wedge: 'หมอนทรงลิ่ม', contour: 'หมอนการแพทย์' };

  var conditionInfo = {
    neck_strain: { label: 'คอเคล็ด/ปวดต้นคอ', shape: 'contour', loftAdjust: -1,
      note: 'ช่วงคอเคล็ดควรใช้หมอนที่ไม่สูงหรือต่ำเกินไปและรองรับแนวคอสม่ำเสมอ หมอนการแพทย์ทรงเว้าช่วยพยุงคอได้ดีกว่าทรงเรียบ หากอาการไม่ดีขึ้นควรปรึกษาแพทย์หรือนักกายภาพบำบัด' },
    post_surgery: { label: 'เพิ่งผ่าตัดคอ/ไหล่/หลัง', shape: 'contour', loftAdjust: -2,
      note: 'หลังผ่าตัดควรใช้หมอนเตี้ยกว่าปกติเล็กน้อยเพื่อลดแรงกดบริเวณแผลและจุดผ่าตัด ตัวเลขที่คำนวณนี้เป็นเพียงแนวทางเบื้องต้น ควรใช้ตามคำแนะนำของแพทย์ผู้ทำการผ่าตัดเป็นหลัก' },
    cervical_spine: { label: 'กระดูกสันหลังส่วนคอมีปัญหา', shape: 'contour', loftAdjust: 0,
      note: 'หมอนทรงเว้าช่วยพยุงแนวกระดูกสันหลังส่วนคอได้ดีกว่าทรงเรียบ แต่ควรได้รับการประเมินจากแพทย์เฉพาะทางกระดูกและข้อหรือเวชศาสตร์ฟื้นฟูก่อนเลือกความสูงที่แน่นอน' },
    shoulder_pain: { label: 'ปวดไหล่เรื้อรัง/ไหล่ติด', shape: 'contour', loftAdjust: 1,
      note: 'ไหล่ที่ปวดมักต้องการหมอนที่สูงขึ้นเล็กน้อยเมื่อนอนตะแคงเพื่อลดแรงกดบริเวณไหล่ หมอนทรงเว้าช่วยกระจายน้ำหนักได้ดีกว่าทรงเรียบ' },
    snoring: { label: 'นอนกรน/หยุดหายใจขณะหลับ', shape: 'wedge', loftAdjust: 0,
      note: 'การยกศีรษะให้สูงขึ้นด้วยหมอนทรงลิ่มอาจช่วยลดการอุดกั้นทางเดินหายใจได้ในบางราย แต่ไม่ใช่การรักษาหลักของภาวะนี้ ควรปรึกษาแพทย์ด้านการนอนหลับ' },
    reflux: { label: 'กรดไหลย้อน', shape: 'wedge', loftAdjust: 0,
      note: 'หมอนทรงลิ่มช่วยยกระดับช่วงบนของร่างกายเพื่อลดการไหลย้อนของกรด มุมและความสูงที่เหมาะสมอาจต่างกันในแต่ละคน ควรปรึกษาแพทย์ประกอบ' }
  };

  var currentMode = 'general';
  var currentCondition = null;
  var modeButtons = document.querySelectorAll('.mode-opt');
  var patientBlock = document.getElementById('patient-conditions');
  var conditionButtons = document.querySelectorAll('.condition-opt');
  var conditionNoteEl = document.getElementById('condition-note');

  modeButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      modeButtons.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
      if(currentMode === 'patient'){
        patientBlock.style.display = 'block';
      } else {
        patientBlock.style.display = 'none';
        currentCondition = null;
        conditionButtons.forEach(function(b){ b.classList.remove('active'); });
        conditionNoteEl.style.display = 'none';
      }
      updateFormRecommendation();
    });
  });

  conditionButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      conditionButtons.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      currentCondition = btn.getAttribute('data-condition');
      var info = conditionInfo[currentCondition];
      conditionNoteEl.textContent = info.note;
      conditionNoteEl.style.display = 'block';
      updateFormRecommendation();
    });
  });

  var currentShape = null;
  var shapeButtons = document.querySelectorAll('.shape-opt');
  var shapeErrEl = null;
  shapeButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      shapeButtons.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      currentShape = btn.getAttribute('data-shape');
      document.getElementById('shape-err').style.display = 'none';
    });
  });

  function normalizedWeights(){
    var raw = {
      back: parseFloat(sliders.back.value) || 0,
      side: parseFloat(sliders.side.value) || 0,
      stomach: parseFloat(sliders.stomach.value) || 0
    };
    var total = raw.back + raw.side + raw.stomach;
    if(total <= 0){ return { back: 0.33, side: 0.34, stomach: 0.33 }; }
    return { back: raw.back/total, side: raw.side/total, stomach: raw.stomach/total };
  }

  function updatePercentLabels(){
    var w = normalizedWeights();
    pctLabels.back.textContent = Math.round(w.back*100) + '%';
    pctLabels.side.textContent = Math.round(w.side*100) + '%';
    pctLabels.stomach.textContent = Math.round(w.stomach*100) + '%';
  }
  Object.keys(sliders).forEach(function(k){
    sliders[k].addEventListener('input', updatePercentLabels);
  });
  updatePercentLabels();

  function loftFor(pos, height, shoulder){
    var baseLoft, weight;
    if(pos === 'stomach'){ baseLoft = 6; weight = 0.05; }
    else if(pos === 'back'){ baseLoft = 10; weight = 0.12; }
    else { baseLoft = 13; weight = 0.22; }
    var loft = baseLoft + (shoulder - 40) * weight;
    return Math.max(5, Math.min(18, loft));
  }

  function footprintFor(height){
    if(height < 160){ return { w: 40, l: 60 }; }
    if(height < 176){ return { w: 45, l: 65 }; }
    if(height < 186){ return { w: 50, l: 70 }; }
    return { w: 50, l: 80 };
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  // ทรงลิ่ม/สามเหลี่ยม: ความสูงเปลี่ยนเป็นเส้นตรงจากด้านสูงไปด้านต่ำ
  function computeWedge(weightedLoft, shoulder, length){
    var delta = clamp(3 + (shoulder - 40) * 0.05, 2, 6);
    var high = Math.round((weightedLoft + delta) * 2) / 2;
    var low = Math.max(3, Math.round((weightedLoft - delta) * 2) / 2);
    var slope = Math.round(((high - low) / length) * 1000) / 1000; // ซม.ความสูง ต่อ ซม.ความยาว
    return { high: high, low: low, slope: slope, delta: delta };
  }

  // ทรงเว้าสุขภาพ: จำลองหน้าตัดด้วยพาราโบลา y = a(x-h)^2 + k
  // จุดต่ำสุด (k) รับศีรษะตรงกลาง, ขอบทั้งสองข้าง (สูงกว่า) รับคอ
  function computeContour(weightedLoft, shoulder, width){
    var delta = clamp(2 + (shoulder - 40) * 0.04, 1.5, 4);
    var side = Math.round((weightedLoft + delta) * 2) / 2;
    var center = Math.max(3, Math.round((weightedLoft - delta) * 2) / 2);
    var halfW = width / 2;
    var a = (side - center) / (halfW * halfW);
    a = Math.round(a * 10000) / 10000;
    return { side: side, center: center, a: a, halfW: halfW };
  }

  function cssVar(name){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function renderIllustration(w, loft){
    var loftPx = 20 + loft * 4;
    var bodyW = 220;
    var accent = cssVar('--accent');
    var accentSoft = cssVar('--accent-soft');
    var muted = cssVar('--muted');
    return '<svg width="260" height="150" viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="20" y="' + (120 - loftPx) + '" width="' + bodyW + '" height="' + loftPx + '" rx="' + Math.min(18, loftPx/2) + '" fill="' + accentSoft + '" stroke="' + accent + '" stroke-width="1.5"/>' +
      '<line x1="250" y1="' + (120 - loftPx) + '" x2="250" y2="120" stroke="' + muted + '" stroke-width="1"/>' +
      '<line x1="246" y1="' + (120 - loftPx) + '" x2="254" y2="' + (120 - loftPx) + '" stroke="' + muted + '" stroke-width="1"/>' +
      '<line x1="246" y1="120" x2="254" y2="120" stroke="' + muted + '" stroke-width="1"/>' +
      '<text x="256" y="' + (120 - loftPx/2) + '" font-size="11" fill="' + muted + '" font-family="Inter, sans-serif" text-anchor="start" transform="rotate(90 256 ' + (120 - loftPx/2) + ')">' + loft + ' ซม.</text>' +
      '<line x1="20" y1="132" x2="240" y2="132" stroke="' + muted + '" stroke-width="1"/>' +
      '<line x1="20" y1="128" x2="20" y2="136" stroke="' + muted + '" stroke-width="1"/>' +
      '<line x1="240" y1="128" x2="240" y2="136" stroke="' + muted + '" stroke-width="1"/>' +
      '<text x="130" y="147" font-size="11" fill="' + muted + '" font-family="Inter, sans-serif" text-anchor="middle">' + w + ' ซม.</text>' +
      '</svg>';
  }

  function renderWedgeIllustration(w, high, low){
    var highPx = 20 + high * 4;
    var lowPx = 20 + low * 4;
    var accent = cssVar('--accent');
    var accentSoft = cssVar('--accent-soft');
    var muted = cssVar('--muted');
    var baseY = 120;
    return '<svg width="260" height="150" viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20 ' + baseY + ' L20 ' + (baseY - highPx) + ' L240 ' + (baseY - lowPx) + ' L240 ' + baseY + ' Z" fill="' + accentSoft + '" stroke="' + accent + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<text x="10" y="' + (baseY - highPx - 6) + '" font-size="11" fill="' + muted + '" font-family="Inter, sans-serif" text-anchor="start">' + high + ' ซม.</text>' +
      '<text x="250" y="' + (baseY - lowPx - 6) + '" font-size="11" fill="' + muted + '" font-family="Inter, sans-serif" text-anchor="end">' + low + ' ซม.</text>' +
      '<line x1="20" y1="132" x2="240" y2="132" stroke="' + muted + '" stroke-width="1"/>' +
      '<line x1="20" y1="128" x2="20" y2="136" stroke="' + muted + '" stroke-width="1"/>' +
      '<line x1="240" y1="128" x2="240" y2="136" stroke="' + muted + '" stroke-width="1"/>' +
      '<text x="130" y="147" font-size="11" fill="' + muted + '" font-family="Inter, sans-serif" text-anchor="middle">' + w + ' ซม.</text>' +
      '</svg>';
  }

  function renderContourIllustration(w, center, side){
    var centerPx = 20 + center * 4;
    var sidePx = 20 + side * 4;
    var accent = cssVar('--accent');
    var accentSoft = cssVar('--accent-soft');
    var muted = cssVar('--muted');
    var baseY = 120;
    var x0 = 20, x1 = 240, xm = 130;
    var yTop0 = baseY - sidePx, yTopM = baseY - centerPx;
    return '<svg width="260" height="150" viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M' + x0 + ' ' + baseY + ' L' + x0 + ' ' + yTop0 + ' Q ' + xm + ' ' + (yTopM - (yTop0 - yTopM)) + ' ' + x1 + ' ' + yTop0 + ' L' + x1 + ' ' + baseY + ' Z" fill="' + accentSoft + '" stroke="' + accent + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<text x="10" y="' + (yTop0 - 6) + '" font-size="11" fill="' + muted + '" font-family="Inter, sans-serif" text-anchor="start">' + side + ' ซม.</text>' +
      '<text x="' + xm + '" y="' + (yTopM - 10) + '" font-size="11" fill="' + muted + '" font-family="Inter, sans-serif" text-anchor="middle">' + center + ' ซม.</text>' +
      '<line x1="20" y1="132" x2="240" y2="132" stroke="' + muted + '" stroke-width="1"/>' +
      '<line x1="20" y1="128" x2="20" y2="136" stroke="' + muted + '" stroke-width="1"/>' +
      '<line x1="240" y1="128" x2="240" y2="136" stroke="' + muted + '" stroke-width="1"/>' +
      '<text x="130" y="147" font-size="11" fill="' + muted + '" font-family="Inter, sans-serif" text-anchor="middle">' + w + ' ซม.</text>' +
      '</svg>';
  }

  function recommendShape(w, shoulder){
    var shoulderDiff = shoulder - 40;
    if(w.side >= 0.45 && shoulderDiff > 3){
      return { shape: 'contour', reason: 'คุณมีไหล่ค่อนข้างกว้างและนอนตะแคงเป็นส่วนใหญ่ ช่องว่างระหว่างคอกับที่นอนจะมาก ทรงเว้าที่มีขอบสูงรองรับคอจะช่วยพยุงกระดูกสันหลังส่วนคอให้อยู่แนวตรงได้ดีกว่าทรงเรียบ' };
    }
    if(w.back >= 0.5){
      return { shape: 'rect', reason: 'คุณนอนหงายเป็นส่วนใหญ่ ความสูงสม่ำเสมอตลอดหมอนรองรับต้นคอได้พอดีอยู่แล้ว ไม่จำเป็นต้องใช้ทรงเว้าหรือทรงลิ่ม' };
    }
    if(w.side >= 0.32){
      return { shape: 'contour', reason: 'คุณนอนหลายท่าสลับกันโดยมีท่าตะแคงร่วมด้วย ทรงเว้าปรับรองรับได้หลายท่ากว่าทรงเรียบ เพราะมีทั้งจุดกลางรับศีรษะและขอบสูงรับคอในใบเดียว' };
    }
    return { shape: 'rect', reason: 'สัดส่วนท่านอนของคุณไม่มีท่าใดโดดเด่นเป็นพิเศษ หมอนมาตรฐานเป็นตัวเลือกที่เรียบง่ายและเหมาะกับการใช้งานทั่วไป' };
  }

  var shapeUsageNote = {
    rect: 'หมอนมาตรฐาน: ความสูงคงที่ตลอดทั้งใบ เหมาะกับการนอนหงายและนอนตะแคงทั่วไปที่ไม่มีปัญหาสรีระเฉพาะจุด',
    wedge: 'หมอนทรงลิ่ม: ความสูงลดจากด้านสูงไปด้านต่ำเป็นเส้นตรง ใช้ยกระดับศีรษะและลำตัวช่วงบนให้สูงกว่าปกติ เหมาะกับผู้ที่มีอาการกรดไหลย้อน คัดจมูก หรือภูมิแพ้ทางเดินหายใจ มากกว่าการรองรับแนวคอโดยตรง',
    contour: 'หมอนการแพทย์: จุดกลางเว้าต่ำรับศีรษะ ขอบสองข้างยกสูงรับคอ ช่วยพยุงกระดูกสันหลังส่วนคอให้อยู่แนวตรงเมื่อนอนตะแคง เหมาะกับผู้ที่นอนตะแคงบ่อยหรือมีไหล่กว้าง'
  };

  function updateFormRecommendation(){
    var recBox = document.getElementById('form-recommend');
    var noteEl = document.getElementById('form-shape-note');

    if(!currentShape){
      recBox.innerHTML = '<span class="rec-title">เลือกรูปทรงด้านบนก่อน</span>ระบบจะบอกว่าทรงที่เลือกเหมาะกับคุณหรือไม่ พร้อมคำแนะนำวิธีใช้';
      noteEl.textContent = '';
      return;
    }

    var shoulderVal = parseFloat(document.getElementById('shoulder').value);
    if(!shoulderVal || shoulderVal < 25 || shoulderVal > 60){ shoulderVal = 40; }
    var w = normalizedWeights();

    var rec;
    if(currentMode === 'patient' && currentCondition){
      var info = conditionInfo[currentCondition];
      rec = { shape: info.shape, reason: 'จากอาการที่เลือกไว้ (' + info.label + ') หมอนทรงนี้มักได้รับการแนะนำ ดูรายละเอียดเพิ่มเติมจากคำแนะนำเฉพาะอาการด้านบน' };
    } else {
      rec = recommendShape(w, shoulderVal);
    }

    var matchesSelection = rec.shape === currentShape;
    recBox.innerHTML =
      (matchesSelection ? '<span class="rec-match">ตรงกับทรงที่คุณเลือกไว้</span><br>' : '') +
      '<span class="rec-title">แนะนำ: ' + shapeLabelTh[rec.shape] + '</span>' + rec.reason;
    noteEl.textContent = shapeUsageNote[currentShape];
  }

  document.getElementById('height').addEventListener('input', updateFormRecommendation);
  document.getElementById('shoulder').addEventListener('input', updateFormRecommendation);
  Object.keys(sliders).forEach(function(k){
    sliders[k].addEventListener('input', updateFormRecommendation);
  });
  shapeButtons.forEach(function(btn){
    btn.addEventListener('click', updateFormRecommendation);
  });
  updateFormRecommendation();

  document.getElementById('calc-btn').addEventListener('click', function(){
    var heightInput = document.getElementById('height');
    var shoulderInput = document.getElementById('shoulder');
    var heightErr = document.getElementById('height-err');
    var shoulderErr = document.getElementById('shoulder-err');
    heightErr.style.display = 'none';
    shoulderErr.style.display = 'none';

    var height = parseFloat(heightInput.value);
    var shoulder = parseFloat(shoulderInput.value);
    var valid = true;

    if(!height || height < 120 || height > 210){
      heightErr.textContent = 'กรอกส่วนสูงระหว่าง 120-210 ซม.';
      heightErr.style.display = 'block';
      valid = false;
    }
    if(!shoulder || shoulder < 25 || shoulder > 60){
      shoulderErr.textContent = 'กรอกความกว้างไหล่ระหว่าง 25-60 ซม.';
      shoulderErr.style.display = 'block';
      valid = false;
    }
    var shapeErr = document.getElementById('shape-err');
    shapeErr.style.display = 'none';
    if(!currentShape){
      shapeErr.style.display = 'block';
      valid = false;
    }
    if(!valid) return;

    var w = normalizedWeights();
    var lofts = {
      back: loftFor('back', height, shoulder),
      side: loftFor('side', height, shoulder),
      stomach: loftFor('stomach', height, shoulder)
    };
    var weightedLoft = w.back*lofts.back + w.side*lofts.side + w.stomach*lofts.stomach;
    weightedLoft = Math.round(weightedLoft * 2) / 2;

    var conditionAdjustNote = '';
    if(currentMode === 'patient' && currentCondition){
      var condInfo = conditionInfo[currentCondition];
      weightedLoft = Math.max(3, weightedLoft + condInfo.loftAdjust);
      weightedLoft = Math.round(weightedLoft * 2) / 2;
      conditionAdjustNote = ' (ปรับตามอาการ: ' + condInfo.label + ')';
    }

    var fp = footprintFor(height);

    var dimsEl = document.getElementById('dims-container');
    var eqEl = document.getElementById('out-eq');
    var noteEl = document.getElementById('out-note');
    var illoEl = document.getElementById('illustration');
    eqEl.textContent = '';

    if(currentShape === 'wedge'){
      var wedge = computeWedge(weightedLoft, shoulder, fp.l);
      dimsEl.innerHTML =
        '<div class="dim-box"><div class="num">' + fp.w + '×' + fp.l + '</div><div class="label">กว้าง × ยาว (ซม.)</div></div>' +
        '<div class="dim-box"><div class="num">' + wedge.high + '</div><div class="label">สูงด้านสูง (ซม.)</div></div>' +
        '<div class="dim-box"><div class="num">' + wedge.low + '</div><div class="label">สูงด้านต่ำ (ซม.)</div></div>';
      illoEl.innerHTML = renderWedgeIllustration(fp.w, wedge.high, wedge.low);
      noteEl.textContent = 'ความสูงลดลงเป็นเส้นตรงจากด้านสูง (' + wedge.high + ' ซม.) ไปด้านต่ำ (' + wedge.low + ' ซม.) ตลอดความยาว ' + fp.l + ' ซม. คิดเป็นความชันประมาณ ' + wedge.slope + ' ซม. ต่อความยาว 1 ซม. ทรงนี้เหมาะกับผู้ที่ต้องการยกศีรษะสูงกว่าหมอนทั่วไป มากกว่าการรองรับแนวคอโดยตรง';
    } else if(currentShape === 'contour'){
      var contour = computeContour(weightedLoft, shoulder, fp.w);
      dimsEl.innerHTML =
        '<div class="dim-box"><div class="num">' + fp.w + '×' + fp.l + '</div><div class="label">กว้าง × ยาว (ซม.)</div></div>' +
        '<div class="dim-box"><div class="num">' + contour.center + '</div><div class="label">สูงจุดกลาง (เว้า) (ซม.)</div></div>' +
        '<div class="dim-box"><div class="num">' + contour.side + '</div><div class="label">สูงขอบ (รองคอ) (ซม.)</div></div>';
      illoEl.innerHTML = renderContourIllustration(fp.w, contour.center, contour.side);
      eqEl.textContent = 'สมการหน้าตัด: y = ' + contour.a + '(x − ' + contour.halfW + ')² + ' + contour.center;
      noteEl.textContent = 'หน้าตัดหมอนจำลองด้วยพาราโบลา จุดต่ำสุดตรงกลาง (' + contour.center + ' ซม.) รับศีรษะ ส่วนขอบทั้งสองข้าง (' + contour.side + ' ซม.) ยกสูงขึ้นรับคอ ช่วยพยุงกระดูกสันหลังส่วนคอให้อยู่ในแนวตรงเมื่อนอนตะแคง';
    } else {
      dimsEl.innerHTML =
        '<div class="dim-box"><div class="num">' + fp.w + '×' + fp.l + '</div><div class="label">กว้าง × ยาว (ซม.)</div></div>' +
        '<div class="dim-box"><div class="num">' + weightedLoft + '</div><div class="label">ความสูงหมอน (ซม.)<br>เฉลี่ยถ่วงน้ำหนัก</div></div>';
      illoEl.innerHTML = renderIllustration(fp.w, weightedLoft);
      var dominantForNote = Object.keys(w).reduce(function(a,b){ return w[a] > w[b] ? a : b; });
      noteEl.textContent = 'ความสูงนี้สม่ำเสมอตลอดทั้งใบ เฉลี่ยถ่วงน้ำหนักจากสัดส่วนท่านอนของคุณ โดยเน้นตามท่า' + posLabelTh[dominantForNote].replace('นอน','') + 'ที่คุณนอนบ่อยที่สุด';
    }

    if(conditionAdjustNote){
      noteEl.textContent += conditionAdjustNote + ' ตัวเลขนี้เป็นเพียงแนวทางเบื้องต้น ไม่ใช่คำวินิจฉัยทางการแพทย์ ควรปรึกษาแพทย์หรือนักกายภาพบำบัดก่อนตัดสินใจใช้จริง';
    }

    var mixBar = document.getElementById('mix-bar');
    var mixLegend = document.getElementById('mix-legend');
    mixBar.innerHTML = '';
    mixLegend.innerHTML = '';
    ['back','side','stomach'].forEach(function(pos){
      var pct = Math.round(w[pos]*100);
      if(pct > 0){
        var seg = document.createElement('div');
        seg.style.width = pct + '%';
        seg.style.background = cssVar(posColorVar[pos]);
        mixBar.appendChild(seg);
      }
      var leg = document.createElement('span');
      leg.textContent = posLabelTh[pos] + ' ' + pct + '%';
      mixLegend.appendChild(leg);
    });

    document.getElementById('form-step').style.display = 'none';
    document.getElementById('result-step').style.display = 'block';
  });

  document.getElementById('reset-btn').addEventListener('click', function(){
    document.getElementById('result-step').style.display = 'none';
    document.getElementById('form-step').style.display = 'block';
  });
})();
</script>
