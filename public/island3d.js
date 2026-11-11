'use strict';
/* 學習島 3D 低多邊形群島核心 (Three.js + OrbitControls)
 * 靈感來自 bio-islands.netlify.app：
 * 六角群島、木棧橋、中央主島燈塔、巡航小船、動態鏡頭聚焦、3D 錨定浮動標籤
 */

(function(global) {
  let renderer = null, scene = null, camera = null, controls = null;
  let animId = null, clock = null;
  let hubGroup = null, islandGroups = [], coastGroup = null, waterMesh = null;
  let camGoal = null;
  let celebrateId = null, celebrateTime = -1;
  let defaultCam = { pos: null, tgt: null };
  let currentSubject = null, currentChapters = [], currentStats = null;
  let selectCallback = null, paperCallback = null;
  let domContainer = null, pinContainer = null;
  let isDestroyed = false;

  // 主題配色與裝飾風格（含海天一線天際線配色）
  const SUBJ_THEMES = {
    chi:   { water: 0x1a4868, sky: 0x16364a, grass: 0x76b852, sand: 0xe6d4a8, accent: 0x3b82f6 },
    eng:   { water: 0x1d4e78, sky: 0x183b56, grass: 0x68bb74, sand: 0xe5d2a2, accent: 0x6366f1 },
    math:  { water: 0x1b435e, sky: 0x17384e, grass: 0x88be67, sand: 0xebdaae, accent: 0xea580c },
    bio:   { water: 0x1b546a, sky: 0x184155, grass: 0x65be6b, sand: 0xe4d3a6, accent: 0x10b981 },
    his:   { water: 0x22495a, sky: 0x1d3d4b, grass: 0x8ea862, sand: 0xdec699, accent: 0xd97706 },
    geo:   { water: 0x165575, sky: 0x14425a, grass: 0x72c27c, sand: 0xe7d7b0, accent: 0x06b6d4 },
    civ:   { water: 0x20456c, sky: 0x1b3855, grass: 0x7db57d, sand: 0xe5d0a6, accent: 0x8b5cf6 },
    patty: { water: 0x1d265a, sky: 0x192049, grass: 0x6366f1, sand: 0xdcd6f7, accent: 0x4f46e5 }
  };

  function createHexMesh(radiusTop, radiusBot, height, grassColor, sandColor) {
    const group = new THREE.Group();
    // 沙灘/底岩六角柱
    const baseGeo = new THREE.CylinderGeometry(radiusTop, radiusBot, height, 6);
    const baseMat = new THREE.MeshLambertMaterial({ color: sandColor, flatShading: true });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = height / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // 頂部綠色草地薄柱
    const topGeo = new THREE.CylinderGeometry(radiusTop * 0.96, radiusTop * 0.98, height * 0.35, 6);
    const topMat = new THREE.MeshLambertMaterial({ color: grassColor, flatShading: true });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = height + (height * 0.35) / 2 - 0.05;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    group.userData.topY = height + height * 0.35;
    return group;
  }

  function createLowPolyTree(grassColor) {
    const tree = new THREE.Group();
    // 樹幹
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.2, 5);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x784421, flatShading: true });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    tree.add(trunk);

    // 雙層圓錐樹冠
    const foliageMat = new THREE.MeshLambertMaterial({ color: grassColor, flatShading: true });
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 5), foliageMat);
    c1.position.y = 1.4;
    c1.castShadow = true;
    tree.add(c1);

    const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.1, 5), foliageMat);
    c2.position.y = 2.1;
    c2.castShadow = true;
    tree.add(c2);

    return tree;
  }

  function createLowPolyHouse() {
    const house = new THREE.Group();
    // 牆體
    const wallGeo = new THREE.BoxGeometry(1.6, 1.2, 1.4);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xfaf5eb, flatShading: true });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 0.6;
    wall.castShadow = true;
    house.add(wall);

    // 橘紅斜屋頂
    const roofGeo = new THREE.ConeGeometry(1.4, 0.9, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xc85a32, flatShading: true });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.6;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    return house;
  }

  function createLighthouse() {
    const lh = new THREE.Group();
    // 白色塔身
    const towerGeo = new THREE.CylinderGeometry(0.8, 1.4, 4.5, 7);
    const towerMat = new THREE.MeshLambertMaterial({ color: 0xf7fafc, flatShading: true });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 2.25;
    tower.castShadow = true;
    lh.add(tower);

    // 紅色環節飾帶
    const stripeGeo = new THREE.CylinderGeometry(1.05, 1.2, 0.8, 7);
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xd93829, flatShading: true });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 2.4;
    lh.add(stripe);

    // 燈罩
    const lampGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.9, 6);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff3a8 });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.y = 4.9;
    lh.add(lamp);

    // 塔尖圓頂
    const domeGeo = new THREE.ConeGeometry(0.85, 0.8, 6);
    const domeMat = new THREE.MeshLambertMaterial({ color: 0x9b2c2c, flatShading: true });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 5.75;
    lh.add(dome);

    return lh;
  }

  function createBridge(p1, p2) {
    const dist = p1.distanceTo(p2);
    const bridge = new THREE.Group();
    const plankGeo = new THREE.BoxGeometry(1.4, 0.2, dist * 0.76);
    const plankMat = new THREE.MeshLambertMaterial({ color: 0x9c6644, flatShading: true });
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.castShadow = true;
    bridge.add(plank);

    // 計算橋身位置與旋轉
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    bridge.position.copy(mid);
    bridge.position.y = 0.45;
    bridge.lookAt(p2.x, bridge.position.y, p2.z);
    return bridge;
  }

  function createHarborDock() {
    const dock = new THREE.Group();
    // 木棧道平台伸入水中 (朝向南方前景，作為主港會考登船碼頭)
    const plankGeo = new THREE.BoxGeometry(4.4, 0.35, 5.8);
    const plankMat = new THREE.MeshLambertMaterial({ color: 0x9c6644, flatShading: true });
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(0, 0.4, 9.8);
    plank.castShadow = true;
    dock.add(plank);

    // 碼頭木樁 (Pilings)
    const pileGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 6);
    const pileMat = new THREE.MeshLambertMaterial({ color: 0x5a3618, flatShading: true });
    [[-1.8, 7.8], [1.8, 7.8], [-1.8, 12.2], [1.8, 12.2]].forEach(([px, pz]) => {
      const pile = new THREE.Mesh(pileGeo, pileMat);
      pile.position.set(px, 0.6, pz);
      pile.castShadow = true;
      dock.add(pile);
    });

    // 金色碼頭繫船柱 (Bollards)
    const bollardGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.7, 6);
    const bollardMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const b1 = new THREE.Mesh(bollardGeo, bollardMat);
    b1.position.set(1.6, 0.8, 12.0);
    dock.add(b1);

    const b2 = new THREE.Mesh(bollardGeo, bollardMat);
    b2.position.set(-1.6, 0.8, 12.0);
    dock.add(b2);

    return dock;
  }

  function createDistantCoastline(theme) {
    const coast = new THREE.Group();
    const segments = 18;
    const arcRadius = 78;
    const sandMat = new THREE.MeshLambertMaterial({ color: theme.sand, flatShading: true });
    const grassMat = new THREE.MeshLambertMaterial({ color: theme.grass, flatShading: true });

    // 沿弧線分佈 (北半部背景，展開弧度)
    const startAngle = Math.PI * 0.12;
    const endAngle = Math.PI * 0.88;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = startAngle + t * (endAngle - startAngle);
      // 略帶自然蜿蜒海岸線
      const r = arcRadius + Math.sin(t * Math.PI * 3) * 6;
      const x = Math.cos(angle) * (r * 1.35);
      const z = -Math.sin(angle) * (r * 0.85);

      // 遠景低多邊形翠綠山丘
      const hillH = 4.8 + Math.sin(t * Math.PI * 4) * 2.2;
      const hillR = 9.0 + (i % 2 === 0 ? 2.5 : -1.5);
      const hillGeo = new THREE.CylinderGeometry(hillR * 0.78, hillR, hillH, 6);
      const hill = new THREE.Mesh(hillGeo, grassMat);
      hill.position.set(x, hillH / 2 - 0.2, z);
      hill.rotation.y = angle + 0.3;
      hill.receiveShadow = true;
      coast.add(hill);

      // 前緣沙灘緩坡
      const beachGeo = new THREE.CylinderGeometry(hillR * 0.95, hillR * 1.25, 0.6, 6);
      const beach = new THREE.Mesh(beachGeo, sandMat);
      beach.position.set(x * 0.92, 0.2, z * 0.92);
      beach.rotation.y = angle;
      beach.receiveShadow = true;
      coast.add(beach);

      // 點綴遠景樹木
      if (i % 2 === 0) {
        const tree = createLowPolyTree(theme.grass);
        tree.position.set(x + (i % 3 - 1) * 2.2, hillH + 0.2, z + (i % 2 - 0.5) * 2.2);
        tree.scale.set(0.75, 0.75, 0.75);
        coast.add(tree);
      }
      // 點綴遠景小屋
      if (i === 4 || i === 13) {
        const h = createLowPolyHouse();
        h.position.set(x - 2, hillH + 0.1, z + 1);
        h.scale.set(0.65, 0.65, 0.65);
        coast.add(h);
      }
    }
    return coast;
  }

  function init(containerEl, pinEl, callbacks) {
    if (!global.THREE || !global.THREE.OrbitControls) {
      console.warn('Three.js or OrbitControls not available. Fallback mode.');
      return false;
    }
    isDestroyed = false;
    domContainer = containerEl;
    pinContainer = pinEl;
    selectCallback = callbacks.onSelectChapter;
    paperCallback = callbacks.onOpenPaper;

    // 清空舊 canvas
    domContainer.innerHTML = '';
    pinContainer.innerHTML = '';

    const width = domContainer.clientWidth || window.innerWidth;
    const height = domContainer.clientHeight || window.innerHeight;

    // Renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) {
      console.error('WebGL init failed:', e);
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x184155, 1);
    domContainer.appendChild(renderer.domElement);

    // Scene：海天一線自然藍色背景與霧氣，徹底告別四周黑色空洞
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x184155);
    scene.fog = new THREE.Fog(0x184155, 60, 260);

    // Camera
    camera = new THREE.PerspectiveCamera(36, width / height, 0.5, 500);
    defaultCam.pos = new THREE.Vector3(0, 52, 48);
    defaultCam.tgt = new THREE.Vector3(0, 0, 0);
    updateCameraFit();
    camera.position.copy(defaultCam.pos);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 20;
    controls.maxDistance = 160;
    controls.maxPolarAngle = 1.15;
    controls.minPolarAngle = 0.32;
    controls.target.copy(defaultCam.tgt);

    // Lights
    const hemi = new THREE.HemisphereLight(0xd8eeff, 0x1d4860, 0.9);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff7e6, 0.95);
    sun.position.set(38, 65, 45);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 180;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    scene.add(sun);

    // 廣闊海面：延伸至遠方，自然融入海天一線
    const waterGeo = new THREE.CylinderGeometry(320, 320, 2, 64);
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x1b546a, flatShading: true });
    waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -1;
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    clock = new THREE.Clock();
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver && domContainer) {
      try {
        resizeObserver = new ResizeObserver(() => onResize());
        resizeObserver.observe(domContainer);
      } catch (e) {}
    }
    loop();
    return true;
  }

  function buildArchipelago(subject, chapters, stats) {
    currentSubject = subject;
    currentChapters = chapters;
    currentStats = stats;

    // 清理舊島嶼物件與 pins
    if (hubGroup) scene.remove(hubGroup);
    islandGroups.forEach(g => scene.remove(g));
    islandGroups = [];
    pinContainer.innerHTML = '';

    const theme = SUBJ_THEMES[subject.id] || SUBJ_THEMES.bio;

    // 更新海天一色水面與遠景天空背景
    if (waterMesh) waterMesh.material.color.setHex(theme.water);
    if (scene) {
      scene.background.setHex(theme.sky);
      scene.fog.color.setHex(theme.sky);
    }
    // 遠景海岸線海灣更新
    if (coastGroup) scene.remove(coastGroup);
    coastGroup = createDistantCoastline(theme);
    scene.add(coastGroup);

    // 1. 中央主島 (Hub Island)
    hubGroup = new THREE.Group();
    const hubMesh = createHexMesh(8.5, 9.5, 3.2, theme.grass, theme.sand);
    hubGroup.add(hubMesh);

    // 主島港口木造碼頭 (會考試卷登船處)
    const dock = createHarborDock();
    hubGroup.add(dock);

    // 主島建築：燈塔 + 樹木 + 小屋
    const lh = createLighthouse();
    lh.position.set(-2, hubMesh.userData.topY, -1.5);
    hubGroup.add(lh);

    const house = createLowPolyHouse();
    house.position.set(2.5, hubMesh.userData.topY, 1.8);
    house.scale.set(0.9, 0.9, 0.9);
    hubGroup.add(house);

    const t1 = createLowPolyTree(theme.grass);
    t1.position.set(-4, hubMesh.userData.topY, 2.5);
    hubGroup.add(t1);

    const t2 = createLowPolyTree(theme.grass);
    t2.position.set(3.5, hubMesh.userData.topY, -3);
    hubGroup.add(t2);

    hubGroup.position.set(0, 0, 0);
    scene.add(hubGroup);

    // 主島標籤（整合歷屆與會考複習按鈕）
    createHubPin(subject);

    // 2. 章節小島 (Chapter Islets)
    const N = chapters.length;
    const baseRadius = Math.max(26, N * 2.7);

    chapters.forEach((ch, i) => {
      // 依序排列於主島周圍環形，並採橢圓縱深展開與交錯遠近
      const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
      const isAlt = i % 2 === 1;
      const dist = baseRadius + (isAlt ? 3.2 : -3.2);
      const x = Math.cos(angle) * (dist * 1.18);
      const z = Math.sin(angle) * (dist * 0.94);

      const g = new THREE.Group();
      const isletMesh = createHexMesh(5.2, 6.0, 2.5, theme.grass, theme.sand);
      g.add(isletMesh);

      // 裝飾小物
      if (isAlt) {
        const miniH = createLowPolyHouse();
        miniH.position.set(0, isletMesh.userData.topY, 0);
        miniH.scale.set(0.8, 0.8, 0.8);
        g.add(miniH);
      } else {
        const treeA = createLowPolyTree(theme.grass);
        treeA.position.set(1.5, isletMesh.userData.topY, -1);
        g.add(treeA);
        const treeB = createLowPolyTree(theme.grass);
        treeB.position.set(-1.8, isletMesh.userData.topY, 1.2);
        treeB.scale.set(0.8, 0.8, 0.8);
        g.add(treeB);
      }

      g.position.set(x, 0, z);
      // 奇偶章節高度交錯，徹底避免前後標籤重疊
      const pinY = isletMesh.userData.topY + (isAlt ? 3.8 : 2.5);
      g.userData = {
        chapterId: ch.id,
        chapter: ch,
        index: i,
        baseY: 0,
        anchor: new THREE.Vector3(x, pinY, z)
      };
      scene.add(g);
      islandGroups.push(g);

      // 連接主島木橋
      const bridge = createBridge(hubGroup.position, g.position);
      scene.add(bridge);

      // 建立對應 HTML Pin
      createChapterPin(ch, i, g);
    });

    // 鏡頭回歸全景
    resetView();
  }

  function createHubPin(subject) {
    const el = document.createElement('div');
    el.className = 'map-3d-pin hub-pin';
    el.innerHTML = `
      <div class="hub-pin-container">
        <div class="pin-badge hub">
          <span class="pin-icon">${subject.icon}</span> <b>${subject.title}島 主港</b>
        </div>
        <button class="pin-hub-paper-btn" type="button" role="button">
          ⛵ 歷屆與會考複習卷
        </button>
      </div>
    `;
    const btn = el.querySelector('.pin-hub-paper-btn');
    if (btn) {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (paperCallback) paperCallback();
      };
    }
    pinContainer.appendChild(el);
    hubGroup.userData.pinEl = el;
    hubGroup.userData.anchor = new THREE.Vector3(0, 9.2, 0);
  }

  function createChapterPin(ch, i, group) {
    const st = ch.stars || 0;
    const shortTitle = String(ch.title || '').replace(/^第\s*\d+\s*章\s*/, '');
    const el = document.createElement('div');
    el.className = 'map-3d-pin chapter-pin';
    el.dataset.chapterId = ch.id;
    el.innerHTML = `
      <div class="pin-card" role="button" tabindex="0">
        <span class="pin-num">第 ${i + 1} 章</span>
        <b class="pin-title">${shortTitle}</b>
        <span class="pin-stars">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span>
      </div>
    `;

    el.onclick = () => {
      focusChapter(ch.id);
      if (selectCallback) selectCallback(ch.id);
    };

    el.onmouseenter = () => {
      group.position.y = 0.5;
    };
    el.onmouseleave = () => {
      group.position.y = 0;
    };

    pinContainer.appendChild(el);
    group.userData.pinEl = el;
  }

  function focusChapter(chapterId) {
    const g = islandGroups.find(x => x.userData.chapterId === chapterId);
    if (!g) return;
    const tgt = g.position.clone();
    camGoal = {
      pos: tgt.clone().add(new THREE.Vector3(0, 18, 22)),
      tgt: tgt.clone()
    };
    document.querySelectorAll('.map-3d-pin.chapter-pin').forEach(p => {
      p.classList.toggle('active', p.dataset.chapterId === chapterId);
    });
  }

  function resetView() {
    camGoal = {
      pos: defaultCam.pos.clone(),
      tgt: defaultCam.tgt.clone()
    };
    document.querySelectorAll('.map-3d-pin.chapter-pin').forEach(p => p.classList.remove('active'));
  }

  function updatePins() {
    if (!camera || !renderer) return;
    const w = renderer.domElement.clientWidth;
    const h = renderer.domElement.clientHeight;
    const tempV = new THREE.Vector3();

    // 更新各章節 pin 位置
    islandGroups.forEach(g => {
      if (!g.userData.pinEl) return;
      tempV.copy(g.userData.anchor);
      tempV.project(camera);
      // 判斷是否在相機前方
      if (tempV.z > 1) {
        g.userData.pinEl.style.display = 'none';
        return;
      }
      g.userData.pinEl.style.display = 'block';
      const x = ((tempV.x + 1) * w) / 2;
      const y = ((-tempV.y + 1) * h) / 2;
      g.userData.pinEl.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
    });

    // 主島 pin (含登船按鈕)
    if (hubGroup && hubGroup.userData.pinEl) {
      tempV.copy(hubGroup.userData.anchor);
      tempV.project(camera);
      if (tempV.z <= 1) {
        hubGroup.userData.pinEl.style.display = 'block';
        const x = ((tempV.x + 1) * w) / 2;
        const y = ((-tempV.y + 1) * h) / 2;
        hubGroup.userData.pinEl.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
      } else {
        hubGroup.userData.pinEl.style.display = 'none';
      }
    }
  }

  function loop() {
    if (isDestroyed) return;
    animId = requestAnimationFrame(loop);

    const delta = clock ? Math.min(clock.getDelta(), 0.1) : 0.016;

    // 慶祝過關動態效果 (小島歡慶跳躍)
    if (celebrateTime >= 0) {
      celebrateTime += delta;
      const g = islandGroups.find(x => x.userData.chapterId === celebrateId);
      if (g) {
        g.position.y = Math.sin(celebrateTime * 10) * Math.max(0, 1 - celebrateTime / 2.2) * 1.4;
      }
      if (celebrateTime > 2.2) {
        if (g) g.position.y = 0;
        celebrateTime = -1;
        celebrateId = null;
      }
    }

    // 鏡頭平滑插值聚焦
    if (camGoal) {
      camera.position.lerp(camGoal.pos, 0.08);
      controls.target.lerp(camGoal.tgt, 0.08);
      if (camera.position.distanceTo(camGoal.pos) < 0.1 && controls.target.distanceTo(camGoal.tgt) < 0.1) {
        camGoal = null;
      }
    }

    controls.update();
    renderer.render(scene, camera);
    updatePins();
  }

  function updateCameraFit() {
    if (!camera) return;
    const aspect = camera.aspect;
    const n = (currentChapters || []).length;
    const extraDist = Math.max(0, (n - 6) * 2.3);
    if (aspect < 1.0) {
      // 窄螢幕自適應俯視視角
      camera.fov = Math.min(48, (36 / aspect) * 0.82);
      defaultCam.pos.set(0, 56 + extraDist * 0.95, 52 + extraDist * 0.95);
    } else {
      camera.fov = 36;
      defaultCam.pos.set(0, 50 + extraDist * 0.85, 46 + extraDist * 0.85);
    }
    camera.updateProjectionMatrix();
  }

  let resizeObserver = null;

  function onResize() {
    if (!renderer || !camera || !domContainer) return;
    const w = domContainer.clientWidth || window.innerWidth;
    const h = domContainer.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    updateCameraFit();
    renderer.setSize(w, h);
  }

  function destroy() {
    isDestroyed = true;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    if (resizeObserver && domContainer) {
      try { resizeObserver.unobserve(domContainer); } catch(e){}
      resizeObserver = null;
    }
    if (renderer && renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  function celebrate(chapterId) {
    celebrateId = chapterId;
    celebrateTime = 0;
    focusChapter(chapterId);
  }

  global.Island3D = {
    init,
    buildArchipelago,
    focusChapter,
    resetView,
    celebrate,
    destroy
  };
})(window);

