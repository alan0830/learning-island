'use strict';
/* 學習島 3D 低多邊形群島核心 (Three.js + OrbitControls)
 * 靈感來自 bio-islands.netlify.app：
 * 六角群島、木棧橋、中央主島燈塔、巡航小船、動態鏡頭聚焦、3D 錨定浮動標籤
 */

(function(global) {
  let renderer = null, scene = null, camera = null, controls = null;
  let animId = null, clock = null;
  let hubGroup = null, islandGroups = [], boatGroup = null;
  let camGoal = null;
  let celebrateId = null, celebrateTime = -1;
  let defaultCam = { pos: null, tgt: null };
  let currentSubject = null, currentChapters = [], currentStats = null;
  let selectCallback = null, paperCallback = null;
  let domContainer = null, pinContainer = null;
  let isDestroyed = false;

  // 主題配色與裝飾風格
  const SUBJ_THEMES = {
    chi:  { water: 0x1a4868, grass: 0x76b852, sand: 0xe6d4a8, accent: 0x3b82f6 },
    eng:  { water: 0x1d4e78, grass: 0x68bb74, sand: 0xe5d2a2, accent: 0x6366f1 },
    math: { water: 0x1b435e, grass: 0x88be67, sand: 0xebdaae, accent: 0xea580c },
    bio:  { water: 0x1b546a, grass: 0x65be6b, sand: 0xe4d3a6, accent: 0x10b981 },
    his:  { water: 0x22495a, grass: 0x8ea862, sand: 0xdec699, accent: 0xd97706 },
    geo:  { water: 0x165575, grass: 0x72c27c, sand: 0xe7d7b0, accent: 0x06b6d4 },
    civ:  { water: 0x20456c, grass: 0x7db57d, sand: 0xe5d0a6, accent: 0x8b5cf6 }
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

  function createSailboat() {
    const boat = new THREE.Group();
    // 船身
    const hullGeo = new THREE.BoxGeometry(1.8, 0.8, 3.8);
    const hullMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b, flatShading: true });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.25;
    hull.castShadow = true;
    boat.add(hull);

    // 白色風帆
    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, 0);
    sailShape.lineTo(0, 3.2);
    sailShape.lineTo(1.8, 0.4);
    sailShape.closePath();
    const sailGeo = new THREE.ShapeGeometry(sailShape);
    const sailMat = new THREE.MeshLambertMaterial({ color: 0xfafafa, side: THREE.DoubleSide });
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0, 0.7, 0.5);
    sail.rotation.y = Math.PI / 2;
    boat.add(sail);

    // 桅杆
    const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.6, 5);
    const mastMat = new THREE.MeshLambertMaterial({ color: 0x4a5568 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 2.1, 0.5);
    boat.add(mast);

    // 金色旗幟
    const flagGeo = new THREE.BoxGeometry(0.1, 0.45, 0.8);
    const flagMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0, 3.9, 0.1);
    boat.add(flag);

    return boat;
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
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.error('WebGL init failed:', e);
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    domContainer.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x132c3f, 0.007);

    // Camera
    camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 400);
    defaultCam.pos = new THREE.Vector3(0, 48, 54);
    defaultCam.tgt = new THREE.Vector3(0, 0, 0);
    updateCameraFit();
    camera.position.copy(defaultCam.pos);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 24;
    controls.maxDistance = 140;
    controls.maxPolarAngle = 1.22;
    controls.minPolarAngle = 0.28;
    controls.target.copy(defaultCam.tgt);

    // Lights
    const hemi = new THREE.HemisphereLight(0xdcf0ff, 0x1f3c4d, 0.85);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff7e6, 0.95);
    sun.position.set(34, 60, 42);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 160;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    scene.add(sun);

    // Water Plane
    const waterGeo = new THREE.CylinderGeometry(95, 95, 2, 48);
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x184666, flatShading: true });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = -1;
    water.receiveShadow = true;
    scene.add(water);

    // Sailboat
    boatGroup = createSailboat();
    scene.add(boatGroup);

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

    // 1. 中央主島 (Hub Island)
    hubGroup = new THREE.Group();
    const hubMesh = createHexMesh(8.5, 9.5, 3.2, theme.grass, theme.sand);
    hubGroup.add(hubMesh);

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

    // 主島標籤
    createHubPin(subject);

    // 2. 章節小島 (Chapter Islets)
    const N = chapters.length;
    const baseRadius = 26;

    chapters.forEach((ch, i) => {
      // 依序排列於主島周圍環形，附帶自然弧度與錯落
      const angle = (Math.PI * 2 * i) / N - Math.PI / 2 + (i % 2 === 0 ? 0.12 : -0.12);
      const dist = baseRadius + (i % 2 === 0 ? 2 : -2);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const g = new THREE.Group();
      const isletMesh = createHexMesh(5.4, 6.2, 2.6, theme.grass, theme.sand);
      g.add(isletMesh);

      // 裝飾小物
      const isAlt = i % 2 === 1;
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
      g.userData = {
        chapterId: ch.id,
        chapter: ch,
        index: i,
        baseY: 0,
        anchor: new THREE.Vector3(x, isletMesh.userData.topY + 3.2, z)
      };
      scene.add(g);
      islandGroups.push(g);

      // 連接主島木橋
      const bridge = createBridge(hubGroup.position, g.position);
      scene.add(bridge);

      // 建立對應 HTML Pin
      createChapterPin(ch, i, g);
    });

    // 複習小船 Pin
    createBoatPin();

    // 鏡頭回歸全景
    resetView();
  }

  function createHubPin(subject) {
    const el = document.createElement('div');
    el.className = 'map-3d-pin hub-pin';
    el.innerHTML = `
      <div class="pin-badge hub"><span class="pin-icon">${subject.icon}</span> <b>${subject.title}島 主港</b></div>
    `;
    pinContainer.appendChild(el);
    hubGroup.userData.pinEl = el;
    hubGroup.userData.anchor = new THREE.Vector3(0, 8.5, 0);
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

  function createBoatPin() {
    const el = document.createElement('div');
    el.className = 'map-3d-pin boat-pin';
    el.innerHTML = `
      <div class="pin-boat" role="button" tabindex="0">
        ⛵ <b>會考試卷小船</b>
      </div>
    `;
    el.onclick = () => {
      if (paperCallback) paperCallback();
    };
    pinContainer.appendChild(el);
    boatGroup.userData.pinEl = el;
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

    // 主島 pin
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

    // 巡航小船 pin
    if (boatGroup && boatGroup.userData.pinEl) {
      tempV.copy(boatGroup.position).add(new THREE.Vector3(0, 4.8, 0));
      tempV.project(camera);
      if (tempV.z <= 1) {
        boatGroup.userData.pinEl.style.display = 'block';
        const x = ((tempV.x + 1) * w) / 2;
        const y = ((-tempV.y + 1) * h) / 2;
        boatGroup.userData.pinEl.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
      } else {
        boatGroup.userData.pinEl.style.display = 'none';
      }
    }
  }

  function loop() {
    if (isDestroyed) return;
    animId = requestAnimationFrame(loop);

    const delta = clock ? Math.min(clock.getDelta(), 0.1) : 0.016;
    const time = clock ? clock.getElapsedTime() : 0;

    // 帆船環島航行 (R = 36)
    if (boatGroup) {
      const boatSpeed = 0.22;
      const angle = time * boatSpeed;
      const R = 36;
      boatGroup.position.set(Math.cos(angle) * R, Math.sin(time * 2.5) * 0.08 - 0.2, Math.sin(angle) * R);
      boatGroup.rotation.y = -angle + Math.PI;
    }

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
    if (aspect < 1.0) {
      // 40% 寬度或較窄視窗時，稍微調適 FOV 與預設距離，確保四周小島完整置中不裁切
      camera.fov = Math.min(52, (38 / aspect) * 0.86);
      defaultCam.pos.set(0, 56, 68);
    } else {
      camera.fov = 38;
      defaultCam.pos.set(0, 48, 54);
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

