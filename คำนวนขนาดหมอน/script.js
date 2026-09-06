
// --- theme toggle ---

(function(){

  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var label = document.getElementById('theme-label');

  var prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  var current = prefersDark ? 'dark' : 'light';

  root.setAttribute('data-theme', current);

  label.textContent =
    current === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง';


  toggle.addEventListener('click', function(){

    current = current === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', current);

    label.textContent =
      current === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง';

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


  var posLabelTh = {

    back: 'นอนหงาย',

    side: 'นอนตะแคง',

    stomach: 'นอนคว่ำ'

  };


  var posColorVar = {

    back: '--col-back',

    side: '--col-side',

    stomach: '--col-stomach'

  };



  function normalizedWeights(){

    var raw = {

      back: parseFloat(sliders.back.value) || 0,

      side: parseFloat(sliders.side.value) || 0,

      stomach: parseFloat(sliders.stomach.value) || 0

    };


    var total =
      raw.back +
      raw.side +
      raw.stomach;


    if(total <= 0){

      return {
        back:0.33,
        side:0.34,
        stomach:0.33
      };

    }


    return {

      back:raw.back / total,

      side:raw.side / total,

      stomach:raw.stomach / total

    };

  }



  function updatePercentLabels(){

    var w = normalizedWeights();

    pctLabels.back.textContent =
      Math.round(w.back * 100) + '%';

    pctLabels.side.textContent =
      Math.round(w.side * 100) + '%';

    pctLabels.stomach.textContent =
      Math.round(w.stomach * 100) + '%';

  }


  Object.keys(sliders).forEach(function(k){

    sliders[k].addEventListener(
      'input',
      updatePercentLabels
    );

  });


  updatePercentLabels();



  function loftFor(pos, height, shoulder){

    var baseLoft;
    var weight;


    if(pos === 'stomach'){

      baseLoft = 6;
      weight = 0.05;

    }

    else if(pos === 'back'){

      baseLoft = 10;
      weight = 0.12;

    }

    else{

      baseLoft = 13;
      weight = 0.22;

    }


    var loft =
      baseLoft +
      (shoulder - 40) * weight;


    return Math.max(
      5,
      Math.min(18, loft)
    );

  }



  function footprintFor(height){

    if(height < 160){

      return {
        w:40,
        l:60
      };

    }

    if(height < 176){

      return {
        w:45,
        l:65
      };

    }

    if(height < 186){

      return {
        w:50,
        l:70
      };

    }

    return {
      w:50,
      l:80
    };

  }



  function cssVar(name){

    return getComputedStyle(
      document.documentElement
    ).getPropertyValue(name).trim();

  }



  function renderIllustration(w, loft){

    var loftPx = 20 + loft * 4;

    var bodyW = 220;

    var accent = cssVar('--accent');

    var accentSoft = cssVar('--accent-soft');

    var muted = cssVar('--muted');


    return '<svg width="260" height="150" viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg">' +

      '<rect x="20" y="' +
      (120 - loftPx) +
      '" width="' +
      bodyW +
      '" height="' +
      loftPx +
      '" rx="' +
      Math.min(18, loftPx / 2) +
      '" fill="' +
      accentSoft +
      '" stroke="' +
      accent +
      '" stroke-width="1.5"/>' +

      '<line x1="250" y1="' +
      (120 - loftPx) +
      '" x2="250" y2="120" stroke="' +
      muted +
      '" stroke-width="1"/>' +

      '<line x1="246" y1="' +
      (120 - loftPx) +
      '" x2="254" y2="' +
      (120 - loftPx) +
      '" stroke="' +
      muted +
      '" stroke-width="1"/>' +

      '<line x1="246" y1="120" x2="254" y2="120" stroke="' +
      muted +
      '" stroke-width="1"/>' +

      '<text x="256" y="' +
      (120 - loftPx / 2) +
      '" font-size="11" fill="' +
      muted +
      '" font-family="Inter, sans-serif" text-anchor="start" transform="rotate(90 256 ' +
      (120 - loftPx / 2) +
      ')">' +
      loft +
      ' ซม.</text>' +

      '<line x1="20" y1="132" x2="240" y2="132" stroke="' +
      muted +
      '" stroke-width="1"/>' +

      '<line x1="20" y1="128" x2="20" y2="136" stroke="' +
      muted +
      '" stroke-width="1"/>' +

      '<line x1="240" y1="128" x2="240" y2="136" stroke="' +
      muted +
      '" stroke-width="1"/>' +

      '<text x="130" y="147" font-size="11" fill="' +
      muted +
      '" font-family="Inter, sans-serif" text-anchor="middle">' +
      w +
      ' ซม.</text>' +

      '</svg>';

  }



  document
    .getElementById('calc-btn')
    .addEventListener('click', function(){

      var heightInput =
        document.getElementById('height');

      var shoulderInput =
        document.getElementById('shoulder');

      var heightErr =
        document.getElementById('height-err');

      var shoulderErr =
        document.getElementById('shoulder-err');


      heightErr.style.display = 'none';

      shoulderErr.style.display = 'none';


      var height =
        parseFloat(heightInput.value);

      var shoulder =
        parseFloat(shoulderInput.value);


      var valid = true;



      if(!height || height < 120 || height > 210){

        heightErr.textContent =
          'กรอกส่วนสูงระหว่าง 120-210 ซม.';

        heightErr.style.display =
          'block';

        valid = false;

      }



      if(!shoulder || shoulder < 25 || shoulder > 60){

        shoulderErr.textContent =
          'กรอกความกว้างไหล่ระหว่าง 25-60 ซม.';

        shoulderErr.style.display =
          'block';

        valid = false;

      }



      if(!valid) return;



      var w = normalizedWeights();


      var lofts = {

        back:
          loftFor('back', height, shoulder),

        side:
          loftFor('side', height, shoulder),

        stomach:
          loftFor('stomach', height, shoulder)

      };


      var weightedLoft =

        w.back * lofts.back +

        w.side * lofts.side +

        w.stomach * lofts.stomach;


      weightedLoft =
        Math.round(weightedLoft * 2) / 2;


      var fp =
        footprintFor(height);



      document.getElementById('out-size').textContent =
        fp.w + '×' + fp.l;


      document.getElementById('out-loft').textContent =
        weightedLoft;



      var mixBar =
        document.getElementById('mix-bar');

      var mixLegend =
        document.getElementById('mix-legend');


      mixBar.innerHTML = '';

      mixLegend.innerHTML = '';



      ['back','side','stomach']
        .forEach(function(pos){

          var pct =
            Math.round(w[pos] * 100);


          if(pct > 0){

            var seg =
              document.createElement('div');

            seg.style.width =
              pct + '%';

            seg.style.background =
              cssVar(posColorVar[pos]);

            mixBar.appendChild(seg);

          }


          var leg =
            document.createElement('span');

          leg.textContent =
            posLabelTh[pos] +
            ' ' +
            pct +
            '%';

          mixLegend.appendChild(leg);

        });



      var dominant =
        Object.keys(w).reduce(
          function(a,b){

            return w[a] > w[b] ? a : b;

          }
        );



      document.getElementById('out-note').textContent =

        'ขนาดนี้เฉลี่ยถ่วงน้ำหนักจากสัดส่วนท่านอนของคุณ โดยเน้นตามท่า' +

        posLabelTh[dominant].replace('นอน','') +

        'ที่คุณนอนบ่อยที่สุด ถ้าเปลี่ยนท่าระหว่างคืนบ่อย ความสูงนี้จะรองรับได้ดีกว่าคำนวณจากท่าเดียว';



      document.getElementById('illustration').innerHTML =

        renderIllustration(
          fp.w,
          weightedLoft
        );



      document.getElementById('form-step').style.display =
        'none';

      document.getElementById('result-step').style.display =
        'block';

    });



  document
    .getElementById('reset-btn')
    .addEventListener('click', function(){

      document.getElementById('result-step').style.display =
        'none';

      document.getElementById('form-step').style.display =
        'block';

    });

})();

