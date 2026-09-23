/**
 * freeFallApp.js
 * 
 * Interactive controller, canvas physics animator, and synchronized
 * stacked graphs renderer for Free Fall 1D Kinematics Studio.
 * The Thinking Experiment (PhysicsKit)
 * 
 * Strict Design System:
 * - Primary Teal: #0f7e9b
 * - Primary Teal Dark: #095f76
 * - Primary Teal Light: #e6f4f8
 * - Accent Amber: #d67b19
 * - Pure White: #ffffff
 * - High-contrast Text: #123140
 * - Prohibited: Zero purple (#59118e), Zero gold (#ffc61e)
 */

(function () {
  "use strict";

  // Check Physics Engine
  const Physics = window.FreeFallPhysics || (typeof require !== 'undefined' ? require('./freeFallPhysics') : null);
  if (!Physics) {
    console.error("FreeFallPhysics engine not loaded!");
    return;
  }

  // DOM Elements - Canvases
  const simCanvas = document.getElementById("simCanvas");
  const simCtx = simCanvas.getContext("2d");
  const graphsCanvas = document.getElementById("graphsCanvas");
  const graphsCtx = graphsCanvas.getContext("2d");
  const graphsCanvasContainer = document.getElementById("graphsCanvasContainer");

  // Playback Controls
  const btnPlayPause = document.getElementById("btnPlayPause");
  const playIcon = document.getElementById("playIcon");
  const playText = document.getElementById("playText");
  const btnStepBack = document.getElementById("btnStepBack");
  const btnStepForward = document.getElementById("btnStepForward");
  const btnReset = document.getElementById("btnReset");
  const timeScrubber = document.getElementById("timeScrubber");
  const scrubValText = document.getElementById("scrubValText");
  const speedPills = document.querySelectorAll(".speed-pill");

  // HUD & Telemetry
  const hudTime = document.getElementById("hudTime");
  const hudPosY = document.getElementById("hudPosY");
  const hudVelY = document.getElementById("hudVelY");
  const hudAccY = document.getElementById("hudAccY");
  const statusMessage = document.getElementById("statusMessage");
  const statusDetail = document.getElementById("statusDetail");
  const statusDot = document.getElementById("statusDot");

  const teleClock = document.getElementById("teleClock");
  const teleY = document.getElementById("teleY");
  const teleV = document.getElementById("teleV");
  const teleA = document.getElementById("teleA");

  // Mode Nav Buttons
  const modePillBtns = document.querySelectorAll(".mode-pill-btn");
  const sceneTitleIcon = document.getElementById("sceneTitleIcon");
  const sceneTitleText = document.getElementById("sceneTitleText");
  const sceneBadge = document.getElementById("sceneBadge");

  // Problem / Inquiry Scenario Card
  const inquiryScenarioCard = document.getElementById("inquiryScenarioCard");
  const inquiryTitle = document.getElementById("inquiryTitle");
  const inquiryTag = document.getElementById("inquiryTag");
  const inquiryNarrative = document.getElementById("inquiryNarrative");
  const inquiryQuestionsList = document.getElementById("inquiryQuestionsList");

  // Toggles
  const toggleStrobes = document.getElementById("toggleStrobes");
  const toggleVectors = document.getElementById("toggleVectors");
  const toggleRuler = document.getElementById("toggleRuler");
  const compareToggleContainer = document.getElementById("compareToggleContainer");
  const toggleCompareDownward = document.getElementById("toggleCompareDownward");
  const compareToggleLabel = document.getElementById("compareToggleLabel");

  // Legend
  const legendObj1Label = document.getElementById("legendObj1Label");
  const legendObj2Item = document.getElementById("legendObj2Item");
  const legendObj2Label = document.getElementById("legendObj2Label");

  // Config, Steps & T-Chart
  const scenarioConfigCard = document.getElementById("scenarioConfigCard");
  const stepsAccordion = document.getElementById("stepsAccordion");
  const cornellTChartContainer = document.getElementById("cornellTChartContainer");
  const btnExpandAllSteps = document.getElementById("btnExpandAllSteps");
  const btnCollapseAllSteps = document.getElementById("btnCollapseAllSteps");

  // Guide Drawer
  const btnToggleGuide = document.getElementById("btnToggleGuide");
  const btnCloseGuide = document.getElementById("btnCloseGuide");
  const activityGuide = document.getElementById("activityGuide");

  // =========================================================================
  // APP STATE
  // =========================================================================
  const state = {
    mode: "p42", // "p42" | "p43" | "p44" | "sandbox"
    simTime: 0,
    maxTime: 4.1,
    isPlaying: false,
    speed: 1.0,
    lastFrameTime: 0,

    // Toggles
    showStrobes: true,
    showVectors: true,
    showRuler: true,
    compareDownward: false, // For P42

    // Problem 42 params
    p42: {
      v0: 15.0,
      wellDepth: 20.0,
      g: 9.8,
      sol: null
    },

    // Problem 43 params
    p43: {
      cliffHeight: 50.0,
      v01: 2.0,
      tDelay: 1.0,
      g: 9.8,
      sol: null
    },

    // Problem 44 params
    p44: {
      v0: 50.0,
      aBoost: 2.0,
      burnoutAltitude: 150.0,
      g: 9.8,
      sol: null
    },

    // Sandbox params
    sandbox: {
      y0: 50.0,
      v0: 15.0,
      g: 9.8,
      groundY: 0.0,
      objectType: "stone", // "stone" | "metal_sphere" | "tennis" | "rocket"
      sol: null
    },

    // Particles & Visual effects
    splashParticles: [],
    exhaustParticles: [],
    lastSplashTriggered: false
  };

  // Recompute physics solutions for all modes
  function recomputePhysics() {
    state.p42.sol = Physics.solveProblem42({
      v0: state.p42.v0,
      wellDepth: state.p42.wellDepth,
      g: state.p42.g
    });

    state.p43.sol = Physics.solveProblem43({
      cliffHeight: state.p43.cliffHeight,
      v01: state.p43.v01,
      tDelay: state.p43.tDelay,
      g: state.p43.g
    });

    state.p44.sol = Physics.solveProblem44({
      v0: state.p44.v0,
      aBoost: state.p44.aBoost,
      burnoutAltitude: state.p44.burnoutAltitude,
      g: state.p44.g
    });

    state.sandbox.sol = Physics.solveGenericSandbox({
      y0: state.sandbox.y0,
      v0: state.sandbox.v0,
      g: state.sandbox.g,
      groundY: state.sandbox.groundY
    });

    updateCurrentModeMaxTime();
  }

  function updateCurrentModeMaxTime() {
    if (state.mode === "p42") {
      state.maxTime = state.p42.sol.upward.tSplash;
    } else if (state.mode === "p43") {
      state.maxTime = state.p43.sol.stone1.tSplash;
    } else if (state.mode === "p44") {
      state.maxTime = state.p44.sol.phase2.tImpact;
    } else if (state.mode === "sandbox") {
      state.maxTime = isFinite(state.sandbox.sol.tImpact) ? state.sandbox.sol.tImpact : 6.0;
    }
    timeScrubber.max = state.maxTime.toFixed(2);
  }

  // =========================================================================
  // HIGH-DPI CANVAS RESIZING
  // =========================================================================
  function resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;

    // Sim Canvas
    const rectSim = simCanvas.getBoundingClientRect();
    if (rectSim.width > 0 && rectSim.height > 0) {
      simCanvas.width = rectSim.width * dpr;
      simCanvas.height = rectSim.height * dpr;
      simCtx.resetTransform();
      simCtx.scale(dpr, dpr);
    }

    // Graphs Canvas
    const rectGraphs = graphsCanvas.getBoundingClientRect();
    if (rectGraphs.width > 0 && rectGraphs.height > 0) {
      graphsCanvas.width = rectGraphs.width * dpr;
      graphsCanvas.height = rectGraphs.height * dpr;
      graphsCtx.resetTransform();
      graphsCtx.scale(dpr, dpr);
    }
  }

  window.addEventListener("resize", () => {
    resizeCanvases();
    renderAll();
  });

  // =========================================================================
  // SIMULATION CANVAS RENDERER
  // =========================================================================
  function renderSim() {
    const w = simCanvas.width / (window.devicePixelRatio || 1);
    const h = simCanvas.height / (window.devicePixelRatio || 1);
    if (!w || !h) return;

    simCtx.clearRect(0, 0, w, h);

    // Compute coordinate mapping: world meters (y) to canvas pixels (py)
    // We leave ruler margin on left
    const rulerWidth = state.showRuler ? 65 : 15;
    const stageWidth = w - rulerWidth;

    let yMin, yMax;
    if (state.mode === "p42") {
      // Well lip at y=0, bottom at y=-20, apex at ~11.5m
      yMin = -state.p42.wellDepth - 4.0;
      yMax = state.p42.sol.upward.yApex + 5.0;
    } else if (state.mode === "p43") {
      // Water at y=0, cliff top at 50m, apex ~50.2m
      yMin = -6.0;
      yMax = state.p43.cliffHeight + 10.0;
    } else if (state.mode === "p44") {
      // Ground at y=0, apex ~308m
      yMin = -15.0;
      yMax = state.p44.sol.phase2.altitudeApex + 30.0;
    } else {
      // Sandbox
      const ground = state.sandbox.groundY;
      const apex = Math.max(state.sandbox.y0, state.sandbox.sol.yApex);
      yMin = ground - 8.0;
      yMax = Math.max(apex + 10.0, ground + 40.0);
    }

    const padTop = 35;
    const padBottom = 35;
    const usableH = h - padTop - padBottom;

    function toPixelY(worldY) {
      const frac = (worldY - yMin) / (yMax - yMin);
      return h - padBottom - frac * usableH;
    }

    function toWorldY(pixelY) {
      const frac = (h - padBottom - pixelY) / usableH;
      return yMin + frac * (yMax - yMin);
    }

    // 1. Draw Background Scene (Well, Cliff, Launchpad, Sky, Water)
    drawSceneEnvironment(simCtx, rulerWidth, stageWidth, h, yMin, yMax, toPixelY);

    // 2. Draw Height Ruler
    if (state.showRuler) {
      drawHeightRuler(simCtx, rulerWidth, h, yMin, yMax, toPixelY);
    }

    // 3. Draw Strobe Flash Dots if enabled
    if (state.showStrobes) {
      drawStrobeFlashes(simCtx, rulerWidth, stageWidth, toPixelY);
    }

    // 4. Draw Physical Objects at current simTime
    drawMovingObjects(simCtx, rulerWidth, stageWidth, toPixelY);

    // 5. Update and Draw Particles (Splashes, Rocket Plumes)
    updateAndDrawParticles(simCtx);
  }

  function drawSceneEnvironment(ctx, rulerW, stageW, totalH, yMin, yMax, toPixelY) {
    const cx = rulerW + stageW * 0.5;

    if (state.mode === "p42") {
      // Problem 42: Well at Center
      const wellHalfW = Math.min(60, stageW * 0.22);
      const yLipPix = toPixelY(0);
      const yWaterPix = toPixelY(-state.p42.wellDepth);

      // Sky above lip
      ctx.fillStyle = "#e9f4fb";
      ctx.fillRect(rulerW, 0, stageW, yLipPix);

      // Underground soil / rock outside well
      ctx.fillStyle = "#e2edf2";
      ctx.fillRect(rulerW, yLipPix, stageW, totalH - yLipPix);

      // Well cylinder bore
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - wellHalfW, yLipPix, wellHalfW * 2, yWaterPix - yLipPix);

      // Brick wall borders
      ctx.strokeStyle = "#095f76";
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Left well wall
      ctx.moveTo(cx - wellHalfW, yLipPix);
      ctx.lineTo(cx - wellHalfW, yWaterPix);
      // Right well wall
      ctx.moveTo(cx + wellHalfW, yLipPix);
      ctx.lineTo(cx + wellHalfW, yWaterPix);
      ctx.stroke();

      // Masonry brick texture lines
      ctx.strokeStyle = "rgba(9, 95, 118, 0.15)";
      ctx.lineWidth = 1;
      const stepY = (yWaterPix - yLipPix) / 12;
      for (let i = 1; i <= 12; i++) {
        const curY = yLipPix + i * stepY;
        ctx.beginPath();
        ctx.moveTo(cx - wellHalfW, curY);
        ctx.lineTo(cx + wellHalfW, curY);
        ctx.stroke();
      }

      // Ground grass line at y = 0
      ctx.fillStyle = "#1a7f4e";
      ctx.fillRect(rulerW, yLipPix - 4, cx - wellHalfW - rulerW, 6);
      ctx.fillRect(cx + wellHalfW, yLipPix - 4, rulerW + stageW - (cx + wellHalfW), 6);

      // Water body at bottom of well
      ctx.fillStyle = "rgba(15, 126, 155, 0.65)";
      ctx.fillRect(cx - wellHalfW, yWaterPix, wellHalfW * 2, totalH - yWaterPix);

      // Animated wave crest on water
      ctx.strokeStyle = "#0f7e9b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const waveT = Date.now() * 0.004;
      for (let x = cx - wellHalfW; x <= cx + wellHalfW; x += 4) {
        const waveOffset = Math.sin(x * 0.1 + waveT) * 3;
        if (x === cx - wellHalfW) ctx.moveTo(x, yWaterPix + waveOffset);
        else ctx.lineTo(x, yWaterPix + waveOffset);
      }
      ctx.stroke();

      // Water label
      ctx.fillStyle = "#095f76";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Water Level: -${state.p42.wellDepth.toFixed(1)} m`, cx, yWaterPix + 18);

      // Well Lip label
      ctx.fillStyle = "#123140";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Well Lip (Origin y = 0 m)", rulerW + 12, yLipPix - 8);

      // Raccoon mascot icon / silhouette at lip
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🦝", cx - wellHalfW - 20, yLipPix - 4);

    } else if (state.mode === "p43") {
      // Problem 43: Mountain Cliff on Left, Water on Bottom
      const cliffRightX = rulerW + stageW * 0.35;
      const yCliffPix = toPixelY(state.p43.cliffHeight);
      const yWaterPix = toPixelY(0);

      // Sky
      ctx.fillStyle = "#eef8fc";
      ctx.fillRect(rulerW, 0, stageW, yWaterPix);

      // Cliff rock structure
      ctx.fillStyle = "#d5e5ec";
      ctx.beginPath();
      ctx.moveTo(rulerW, 0);
      ctx.lineTo(cliffRightX, 0);
      ctx.lineTo(cliffRightX, yCliffPix);
      // Rough cliff edge
      ctx.lineTo(cliffRightX - 6, yCliffPix + 20);
      ctx.lineTo(cliffRightX + 4, yCliffPix + 60);
      ctx.lineTo(cliffRightX - 4, yCliffPix + 140);
      ctx.lineTo(cliffRightX + 8, yWaterPix);
      ctx.lineTo(rulerW, yWaterPix);
      ctx.closePath();
      ctx.fill();

      // Cliff border outline
      ctx.strokeStyle = "#095f76";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Ledge platform line at 50 m
      ctx.strokeStyle = "#0f7e9b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cliffRightX - 35, yCliffPix);
      ctx.lineTo(cliffRightX + 15, yCliffPix);
      ctx.stroke();

      // Climber figure on cliff
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🧗", cliffRightX - 12, yCliffPix - 6);

      // Water ocean spanning from cliff edge to right
      ctx.fillStyle = "rgba(15, 126, 155, 0.45)";
      ctx.fillRect(rulerW, yWaterPix, stageW, totalH - yWaterPix);

      // Animated Water surface waves
      ctx.strokeStyle = "#0f7e9b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const waveT = Date.now() * 0.003;
      for (let x = rulerW; x <= rulerW + stageW; x += 6) {
        const waveOffset = Math.sin(x * 0.08 + waveT) * 3;
        if (x === rulerW) ctx.moveTo(x, yWaterPix + waveOffset);
        else ctx.lineTo(x, yWaterPix + waveOffset);
      }
      ctx.stroke();

      ctx.fillStyle = "#095f76";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("Water Surface (y = 0 m)", rulerW + stageW - 12, yWaterPix + 16);
      ctx.fillText(`Cliff Ledge (y = +${state.p43.cliffHeight.toFixed(1)} m)`, cliffRightX - 8, yCliffPix - 22);

    } else if (state.mode === "p44") {
      // Problem 44: Model Rocket Launchpad & Altitude Thresholds
      const yGroundPix = toPixelY(0);
      const yBurnoutPix = toPixelY(state.p44.burnoutAltitude);
      const yApexPix = toPixelY(state.p44.sol.phase2.altitudeApex);

      // Sky with altitude gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, yGroundPix);
      skyGrad.addColorStop(0, "#cbe8f6");
      skyGrad.addColorStop(0.7, "#e8f4fb");
      skyGrad.addColorStop(1, "#f4fbfe");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(rulerW, 0, stageW, yGroundPix);

      // Ground soil
      ctx.fillStyle = "#d3e4ec";
      ctx.fillRect(rulerW, yGroundPix, stageW, totalH - yGroundPix);

      // Launchpad structure
      ctx.strokeStyle = "#095f76";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 30, yGroundPix);
      ctx.lineTo(cx + 30, yGroundPix);
      ctx.stroke();

      // Launch tower rail
      ctx.strokeStyle = "rgba(9, 95, 118, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - 15, yGroundPix);
      ctx.lineTo(cx - 15, yGroundPix - 60);
      ctx.stroke();
      ctx.setLineDash([]);

      // Burnout Altitude Threshold Dashed Line
      ctx.strokeStyle = "#d67b19";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(rulerW, yBurnoutPix);
      ctx.lineTo(rulerW + stageW, yBurnoutPix);
      ctx.stroke();

      // Burnout badge
      ctx.fillStyle = "#d67b19";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Burnout Stage 1 Cutoff: ${state.p44.burnoutAltitude.toFixed(0)} m (a = +2 m/s² → -9.8 m/s²)`, rulerW + stageW - 12, yBurnoutPix - 6);

      // Apex Threshold Line
      ctx.strokeStyle = "#0f7e9b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rulerW, yApexPix);
      ctx.lineTo(rulerW + stageW, yApexPix);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#0f7e9b";
      ctx.textAlign = "right";
      ctx.fillText(`Apex: +${state.p44.sol.phase2.altitudeApex.toFixed(1)} m`, rulerW + stageW - 12, yApexPix - 6);

      // Ground label
      ctx.fillStyle = "#123140";
      ctx.textAlign = "left";
      ctx.fillText("Ground Level (y = 0 m)", rulerW + 12, yGroundPix + 16);

    } else {
      // Sandbox Environment
      const yGroundPix = toPixelY(state.sandbox.groundY);

      ctx.fillStyle = "#edf6fb";
      ctx.fillRect(rulerW, 0, stageW, yGroundPix);

      ctx.fillStyle = "#dbe8ef";
      ctx.fillRect(rulerW, yGroundPix, stageW, totalH - yGroundPix);

      ctx.strokeStyle = "#0f7e9b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rulerW, yGroundPix);
      ctx.lineTo(rulerW + stageW, yGroundPix);
      ctx.stroke();

      ctx.fillStyle = "#123140";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Ground Plane (y = ${state.sandbox.groundY.toFixed(1)} m)`, rulerW + 12, yGroundPix + 16);
    }
  }

  function drawHeightRuler(ctx, rulerW, totalH, yMin, yMax, toPixelY) {
    ctx.save();
    // Ruler background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rulerW, totalH);
    ctx.strokeStyle = "#c8dbe3";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rulerW, 0);
    ctx.lineTo(rulerW, totalH);
    ctx.stroke();

    // Determine nice tick step in meters
    const range = yMax - yMin;
    let tickStep = 5;
    if (range > 200) tickStep = 50;
    else if (range > 100) tickStep = 20;
    else if (range > 40) tickStep = 10;
    else tickStep = 5;

    const startVal = Math.floor(yMin / tickStep) * tickStep;
    ctx.font = "600 10px JetBrains Mono, monospace";
    ctx.fillStyle = "#4b6570";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let val = startVal; val <= yMax; val += tickStep) {
      const py = toPixelY(val);
      if (py >= 10 && py <= totalH - 10) {
        const isZero = Math.abs(val) < 1e-4;
        ctx.strokeStyle = isZero ? "#0f7e9b" : "#a9c4cf";
        ctx.lineWidth = isZero ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(rulerW - (isZero ? 14 : 8), py);
        ctx.lineTo(rulerW, py);
        ctx.stroke();

        ctx.fillStyle = isZero ? "#0f7e9b" : "#4b6570";
        ctx.fillText(`${val}m`, rulerW - (isZero ? 16 : 10), py);
      }
    }
    ctx.restore();
  }

  function drawStrobeFlashes(ctx, rulerW, stageW, toPixelY) {
    const cx = rulerW + stageW * 0.5;
    ctx.save();

    let flashes = [];
    if (state.mode === "p42") {
      flashes = Physics.generateStrobeDiagram(state.p42.sol.upward.getState, state.p42.sol.upward.tSplash, 0.25);
    } else if (state.mode === "p43") {
      flashes = Physics.generateStrobeDiagram(state.p43.sol.stone1.getState, state.p43.sol.stone1.tSplash, 0.25);
    } else if (state.mode === "p44") {
      flashes = Physics.generateStrobeDiagram(state.p44.sol.getState, state.p44.sol.phase2.tImpact, 0.5);
    } else {
      flashes = Physics.generateStrobeDiagram(state.sandbox.sol.getState, Math.min(state.maxTime, 8), 0.3);
    }

    flashes.forEach((f) => {
      const py = toPixelY(f.y);
      const isPast = f.t <= state.simTime;

      ctx.beginPath();
      ctx.arc(cx - 25, py, isPast ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isPast ? "rgba(15, 126, 155, 0.75)" : "rgba(15, 126, 155, 0.22)";
      ctx.fill();
      ctx.strokeStyle = isPast ? "#095f76" : "rgba(9, 95, 118, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Show timestamp next to flash every 2nd or 3rd dot
      if (f.index % 2 === 0) {
        ctx.fillStyle = isPast ? "#123140" : "rgba(75, 101, 112, 0.5)";
        ctx.font = "500 9px JetBrains Mono, monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${f.t.toFixed(1)}s`, cx - 33, py);
      }
    });

    ctx.restore();
  }

  function drawMovingObjects(ctx, rulerW, stageW, toPixelY) {
    const cx = rulerW + stageW * 0.5;
    const t = state.simTime;

    if (state.mode === "p42") {
      // Primary Stone (Upward)
      const stUp = state.p42.sol.upward.getState(t);
      const pyUp = toPixelY(stUp.y);
      drawSphere(ctx, cx, pyUp, 10, "#0f7e9b", "#095f76", "Stone 1");

      if (state.showVectors && !stUp.hasSplashed) {
        drawVectorArrow(ctx, cx, pyUp, stUp.v * 2.2, "#0f7e9b", `v = ${stUp.v.toFixed(1)} m/s`);
      }

      // Check splash trigger
      if (stUp.hasSplashed && !state.lastSplashTriggered) {
        spawnSplashParticles(cx, toPixelY(-state.p42.wellDepth), "#0f7e9b");
      }

      // Secondary Downward Stone (if compared)
      if (state.compareDownward) {
        const stDown = state.p42.sol.downward.getState(t);
        const pyDown = toPixelY(stDown.y);
        drawSphere(ctx, cx + 24, pyDown, 9, "#d67b19", "#b06210", "Down Toss");

        if (state.showVectors && !stDown.hasSplashed) {
          drawVectorArrow(ctx, cx + 24, pyDown, stDown.v * 2.2, "#d67b19", `v = ${stDown.v.toFixed(1)} m/s`);
        }
      }

    } else if (state.mode === "p43") {
      const cliffX = rulerW + stageW * 0.35;
      const dropTrackX = cliffX + 35;

      // Stone 1 (Released at t = 0)
      const st1 = state.p43.sol.stone1.getState(t);
      const py1 = toPixelY(st1.y);
      drawSphere(ctx, dropTrackX, py1, 9, "#0f7e9b", "#095f76", "Stone 1");

      if (state.showVectors && !st1.hasSplashed) {
        drawVectorArrow(ctx, dropTrackX, py1, st1.v * 2.0, "#0f7e9b", `v1 = ${st1.v.toFixed(1)} m/s`);
      }

      // Stone 2 (Released at t = 1.0 s)
      const st2 = state.p43.sol.stone2.getState(t);
      const py2 = toPixelY(st2.y);
      const trackX2 = dropTrackX + 32;

      if (!st2.released) {
        // Stone 2 is still held by climber
        drawSphere(ctx, cliffX + 8, py2, 8, "#d67b19", "#b06210", "Stone 2");
        // Draw countdown timer
        const waitRemain = Math.max(0, state.p43.tDelay - t);
        ctx.fillStyle = "#d67b19";
        ctx.font = "700 10px JetBrains Mono, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`Wait ${waitRemain.toFixed(2)}s`, cliffX + 18, py2 - 8);
      } else {
        // Stone 2 in flight
        drawSphere(ctx, trackX2, py2, 9, "#d67b19", "#b06210", "Stone 2");
        if (state.showVectors && !st2.hasSplashed) {
          drawVectorArrow(ctx, trackX2, py2, st2.v * 2.0, "#d67b19", `v2 = ${st2.v.toFixed(1)} m/s`);
        }
      }

      // Simultaneous splash trigger
      if (st1.hasSplashed && st2.hasSplashed && !state.lastSplashTriggered) {
        spawnSplashParticles(dropTrackX, toPixelY(0), "#0f7e9b");
        spawnSplashParticles(trackX2, toPixelY(0), "#d67b19");
      }

    } else if (state.mode === "p44") {
      // Problem 44: Model Rocket
      const rState = state.p44.sol.getState(t);
      const py = toPixelY(rState.y);

      drawRocket(ctx, cx, py, rState.v, rState.engineOn, rState.landed);

      if (state.showVectors && !rState.landed) {
        drawVectorArrow(ctx, cx + 22, py, rState.v * 1.0, "#0f7e9b", `v = ${rState.v.toFixed(1)} m/s`);
      }

      // Exhaust particles during engine burn
      if (rState.engineOn && state.isPlaying) {
        spawnRocketExhaust(cx, py + 16);
      }

    } else {
      // Sandbox
      const sState = state.sandbox.sol.getState(t);
      const py = toPixelY(sState.y);
      drawSphere(ctx, cx, py, 10, "#0f7e9b", "#095f76", "Object");

      if (state.showVectors && !sState.hasLanded) {
        drawVectorArrow(ctx, cx, py, sState.v * 2.2, "#0f7e9b", `v = ${sState.v.toFixed(1)} m/s`);
      }
    }
  }

  function drawSphere(ctx, x, y, radius, fillColor, strokeColor, label) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    // Radial gradient for 3D sphere look
    const grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, fillColor);
    grad.addColorStop(1, strokeColor);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  function drawRocket(ctx, x, y, velocity, engineOn, landed) {
    ctx.save();
    ctx.translate(x, y);

    // If falling downwards rapidly and not landed, angle nose down
    if (velocity < -10 && !landed) {
      ctx.rotate(Math.PI);
    }

    // Rocket Body
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#095f76";
    ctx.lineWidth = 1.5;

    // Fuselage Cylinder
    ctx.beginPath();
    ctx.rect(-7, -14, 14, 28);
    ctx.fill();
    ctx.stroke();

    // Nosecone Triangle
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(-7, -14);
    ctx.lineTo(7, -14);
    ctx.closePath();
    ctx.fillStyle = "#d67b19";
    ctx.fill();
    ctx.stroke();

    // Side Fins
    ctx.fillStyle = "#0f7e9b";
    ctx.beginPath();
    ctx.moveTo(-7, 4);
    ctx.lineTo(-14, 14);
    ctx.lineTo(-7, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(7, 4);
    ctx.lineTo(14, 14);
    ctx.lineTo(7, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Engine Flame Plume (if burning)
    if (engineOn) {
      const flameLen = 18 + Math.random() * 8;
      const flameGrad = ctx.createLinearGradient(0, 14, 0, 14 + flameLen);
      flameGrad.addColorStop(0, "#ffffff");
      flameGrad.addColorStop(0.3, "#d67b19");
      flameGrad.addColorStop(1, "rgba(214, 123, 25, 0)");

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-5, 14);
      ctx.lineTo(0, 14 + flameLen);
      ctx.lineTo(5, 14);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawVectorArrow(ctx, x, y, lengthPix, color, labelText) {
    if (Math.abs(lengthPix) < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    // In canvas coordinates, downward is positive Y!
    // A positive physical velocity (upward) means vector points up (negative canvas Y)
    const targetY = y - lengthPix;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, targetY);
    ctx.stroke();

    // Arrowhead
    const dir = lengthPix > 0 ? -1 : 1;
    const arrowHeadSize = 7;
    ctx.beginPath();
    ctx.moveTo(x, targetY);
    ctx.lineTo(x - 5, targetY - dir * arrowHeadSize);
    ctx.lineTo(x + 5, targetY - dir * arrowHeadSize);
    ctx.closePath();
    ctx.fill();

    // Vector text
    ctx.font = "600 10px JetBrains Mono, monospace";
    ctx.textAlign = "left";
    ctx.fillText(labelText, x + 8, (y + targetY) * 0.5);

    ctx.restore();
  }

  // Particle Engines
  function spawnSplashParticles(x, y, color) {
    state.lastSplashTriggered = true;
    for (let i = 0; i < 24; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.4;
      const speed = 2 + Math.random() * 5;
      state.splashParticles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.02,
        color: color,
        radius: 2 + Math.random() * 2.5
      });
    }
  }

  function spawnRocketExhaust(x, y) {
    for (let i = 0; i < 2; i++) {
      state.exhaustParticles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2 + Math.random() * 3,
        life: 0.8,
        decay: 0.04,
        radius: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? "rgba(214, 123, 25, 0.7)" : "rgba(15, 126, 155, 0.3)"
      });
    }
  }

  function updateAndDrawParticles(ctx) {
    // Splash
    for (let i = state.splashParticles.length - 1; i >= 0; i--) {
      const p = state.splashParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity on droplets
      p.life -= p.decay;

      if (p.life <= 0) {
        state.splashParticles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Exhaust
    for (let i = state.exhaustParticles.length - 1; i >= 0; i--) {
      const p = state.exhaustParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        state.exhaustParticles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1.5 - p.life * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life * 0.6;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  // =========================================================================
  // SYNCHRONIZED STACKED GRAPHS RENDERER (y-t, v-t, a-t)
  // =========================================================================
  function renderGraphs() {
    const w = graphsCanvas.width / (window.devicePixelRatio || 1);
    const h = graphsCanvas.height / (window.devicePixelRatio || 1);
    if (!w || !h) return;

    graphsCtx.clearRect(0, 0, w, h);

    const padLeft = 58;
    const padRight = 24;
    const padTop = 15;
    const padBottom = 28;
    const plotW = w - padLeft - padRight;

    // Divide canvas height into 3 subplots: y(t), v(t), a(t)
    const gap = 14;
    const subH = (h - padTop - padBottom - 2 * gap) / 3;

    const tMax = Math.max(0.5, state.maxTime);

    function toPixX(tVal) {
      return padLeft + (tVal / tMax) * plotW;
    }

    // 1. Determine Dynamic Axis Ranges for Current Mode
    let yRange, vRange, aRange;
    if (state.mode === "p42") {
      yRange = { min: -state.p42.wellDepth - 2, max: state.p42.sol.upward.yApex + 3 };
      vRange = { min: state.p42.sol.upward.vImpact - 3, max: state.p42.v0 + 3 };
      aRange = { min: -state.p42.g - 3, max: 2 };
    } else if (state.mode === "p43") {
      yRange = { min: -4, max: state.p43.cliffHeight + 6 };
      const minV = Math.min(state.p43.sol.stone1.vImpact, state.p43.sol.stone2.vImpact);
      vRange = { min: minV - 4, max: state.p43.v01 + 4 };
      aRange = { min: -state.p43.g - 3, max: 2 };
    } else if (state.mode === "p44") {
      yRange = { min: -10, max: state.p44.sol.phase2.altitudeApex + 20 };
      vRange = { min: state.p44.sol.phase2.vImpact - 10, max: state.p44.sol.phase1.vEnd + 10 };
      aRange = { min: -state.p44.g - 3, max: state.p44.aBoost + 2 };
    } else {
      const gY = state.sandbox.groundY;
      const ap = Math.max(state.sandbox.y0, state.sandbox.sol.yApex);
      yRange = { min: gY - 4, max: ap + 6 };
      vRange = {
        min: Math.min(-30, isFinite(state.sandbox.sol.vImpact) ? state.sandbox.sol.vImpact - 5 : -30),
        max: Math.max(30, state.sandbox.v0 + 5)
      };
      aRange = { min: -state.sandbox.g - 2, max: 2 };
    }

    // Plot 1: Position y(t)
    drawSingleGraph(graphsCtx, {
      title: "Position y(t) [m]",
      top: padTop,
      height: subH,
      padLeft,
      plotW,
      tMax,
      minVal: yRange.min,
      maxVal: yRange.max,
      valGetter1: (t) => {
        if (state.mode === "p42") return state.p42.sol.upward.getState(t).y;
        if (state.mode === "p43") return state.p43.sol.stone1.getState(t).y;
        if (state.mode === "p44") return state.p44.sol.getState(t).y;
        return state.sandbox.sol.getState(t).y;
      },
      valGetter2: (state.mode === "p42" && state.compareDownward)
        ? (t) => state.p42.sol.downward.getState(t).y
        : (state.mode === "p43")
        ? (t) => state.p43.sol.stone2.getState(t).y
        : null,
      showXAxisLabels: false
    });

    // Plot 2: Velocity v(t)
    drawSingleGraph(graphsCtx, {
      title: "Velocity v(t) [m/s]",
      top: padTop + subH + gap,
      height: subH,
      padLeft,
      plotW,
      tMax,
      minVal: vRange.min,
      maxVal: vRange.max,
      valGetter1: (t) => {
        if (state.mode === "p42") return state.p42.sol.upward.getState(t).v;
        if (state.mode === "p43") return state.p43.sol.stone1.getState(t).v;
        if (state.mode === "p44") return state.p44.sol.getState(t).v;
        return state.sandbox.sol.getState(t).v;
      },
      valGetter2: (state.mode === "p42" && state.compareDownward)
        ? (t) => state.p42.sol.downward.getState(t).v
        : (state.mode === "p43")
        ? (t) => state.p43.sol.stone2.getState(t).v
        : null,
      showXAxisLabels: false
    });

    // Plot 3: Acceleration a(t)
    drawSingleGraph(graphsCtx, {
      title: "Acceleration a(t) [m/s²]",
      top: padTop + 2 * (subH + gap),
      height: subH,
      padLeft,
      plotW,
      tMax,
      minVal: aRange.min,
      maxVal: aRange.max,
      valGetter1: (t) => {
        if (state.mode === "p42") return state.p42.sol.upward.getState(t).a;
        if (state.mode === "p43") return state.p43.sol.stone1.getState(t).a;
        if (state.mode === "p44") return state.p44.sol.getState(t).a;
        return state.sandbox.sol.getState(t).a;
      },
      valGetter2: (state.mode === "p42" && state.compareDownward)
        ? (t) => state.p42.sol.downward.getState(t).a
        : (state.mode === "p43")
        ? (t) => state.p43.sol.stone2.getState(t).a
        : null,
      showXAxisLabels: true
    });

    // 4. Synchronized Scrubbing Playhead Hairline across all 3 graphs
    const playheadX = toPixX(state.simTime);
    graphsCtx.save();
    graphsCtx.strokeStyle = "#0f7e9b";
    graphsCtx.lineWidth = 1.8;
    graphsCtx.setLineDash([4, 4]);
    graphsCtx.beginPath();
    graphsCtx.moveTo(playheadX, padTop - 4);
    graphsCtx.lineTo(playheadX, h - padBottom + 6);
    graphsCtx.stroke();
    graphsCtx.setLineDash([]);

    // Playhead top badge
    graphsCtx.fillStyle = "#0f7e9b";
    graphsCtx.fillRect(playheadX - 22, padTop - 12, 44, 14);
    graphsCtx.fillStyle = "#ffffff";
    graphsCtx.font = "700 9px JetBrains Mono, monospace";
    graphsCtx.textAlign = "center";
    graphsCtx.textBaseline = "middle";
    graphsCtx.fillText(`${state.simTime.toFixed(2)}s`, playheadX, padTop - 5);
    graphsCtx.restore();
  }

  function drawSingleGraph(ctx, cfg) {
    const { title, top, height, padLeft, plotW, tMax, minVal, maxVal, valGetter1, valGetter2, showXAxisLabels } = cfg;

    function toPixY(val) {
      const frac = (val - minVal) / (maxVal - minVal);
      return top + height - frac * height;
    }

    function toPixX(tVal) {
      return padLeft + (tVal / tMax) * plotW;
    }

    ctx.save();

    // Box border & background
    ctx.fillStyle = "#fafdfe";
    ctx.fillRect(padLeft, top, plotW, height);
    ctx.strokeStyle = "#e2eef3";
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, top, plotW, height);

    // Title Tag
    ctx.fillStyle = "#095f76";
    ctx.font = "700 11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(title, padLeft + 6, top + 13);

    // Zero-Axis reference line (if in range)
    if (minVal <= 0 && maxVal >= 0) {
      const zeroY = toPixY(0);
      ctx.strokeStyle = "rgba(75, 101, 112, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padLeft, zeroY);
      ctx.lineTo(padLeft + plotW, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(75, 101, 112, 0.6)";
      ctx.font = "500 9px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText("0", padLeft - 6, zeroY + 3);
    }

    // Y-Axis Max & Min Labels
    ctx.fillStyle = "#4b6570";
    ctx.font = "500 9px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${maxVal.toFixed(0)}`, padLeft - 6, top + 10);
    ctx.fillText(`${minVal.toFixed(0)}`, padLeft - 6, top + height - 2);

    // X-Axis labels on bottom plot
    if (showXAxisLabels) {
      ctx.fillStyle = "#4b6570";
      ctx.font = "600 10px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      const numTicks = 5;
      for (let i = 0; i <= numTicks; i++) {
        const curT = (i / numTicks) * tMax;
        const curX = toPixX(curT);
        ctx.fillText(`${curT.toFixed(1)}s`, curX, top + height + 16);
      }
      ctx.fillText("Time t [s]", padLeft + plotW * 0.5, top + height + 28);
    }

    // Draw Secondary Curve (Amber) first if available
    if (valGetter2) {
      ctx.strokeStyle = "#d67b19";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      const numSamples = 150;
      for (let i = 0; i <= numSamples; i++) {
        const tVal = (i / numSamples) * tMax;
        const vVal = valGetter2(tVal);
        const px = toPixX(tVal);
        const py = toPixY(vVal);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Dot at current playhead
      const curV2 = valGetter2(state.simTime);
      const curP2X = toPixX(state.simTime);
      const curP2Y = toPixY(curV2);
      ctx.beginPath();
      ctx.arc(curP2X, curP2Y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#d67b19";
      ctx.fill();
    }

    // Draw Primary Curve (Teal)
    ctx.strokeStyle = "#0f7e9b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const numSamples = 180;
    for (let i = 0; i <= numSamples; i++) {
      const tVal = (i / numSamples) * tMax;
      const vVal = valGetter1(tVal);
      const px = toPixX(tVal);
      const py = toPixY(vVal);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Dot at current playhead
    const curV1 = valGetter1(state.simTime);
    const curP1X = toPixX(state.simTime);
    const curP1Y = toPixY(curV1);
    ctx.beginPath();
    ctx.arc(curP1X, curP1Y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#0f7e9b";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // Handle Scrubbing Directly on Graphs Canvas
  let isGraphScrubbing = false;
  graphsCanvas.addEventListener("mousedown", (e) => {
    isGraphScrubbing = true;
    handleGraphScrubEvent(e);
  });
  window.addEventListener("mousemove", (e) => {
    if (isGraphScrubbing) handleGraphScrubEvent(e);
  });
  window.addEventListener("mouseup", () => {
    isGraphScrubbing = false;
  });

  function handleGraphScrubEvent(e) {
    const rect = graphsCanvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const padLeft = 58;
    const padRight = 24;
    const plotW = rect.width - padLeft - padRight;
    const frac = Math.max(0, Math.min(1, (clientX - padLeft) / plotW));
    setTime(frac * state.maxTime);
  }

  // =========================================================================
  // ANIMATION LOOP & TELEMETRY UPDATES
  // =========================================================================
  function setTime(newTime) {
    state.simTime = Math.max(0, Math.min(newTime, state.maxTime));
    timeScrubber.value = state.simTime.toFixed(2);
    scrubValText.textContent = `${state.simTime.toFixed(2)} s`;

    updateTelemetryHUD();
    renderAll();

    if (state.simTime >= state.maxTime && state.isPlaying) {
      pauseSimulation();
    }
  }

  function updateTelemetryHUD() {
    const t = state.simTime;
    let y = 0, v = 0, a = -9.8;
    let status = "Running";

    if (state.mode === "p42") {
      const st = state.p42.sol.upward.getState(t);
      y = st.y;
      v = st.v;
      a = st.a;
      if (st.hasSplashed) {
        status = `SPLASHED at t = ${state.p42.sol.upward.tSplash.toFixed(2)} s (|v| = ${state.p42.sol.upward.speedImpact.toFixed(2)} m/s)`;
      } else if (v > 0) {
        status = `Ascending to Apex (${state.p42.sol.upward.tApex.toFixed(2)} s)`;
      } else {
        status = `Plummeting into Well (-20 m)`;
      }
    } else if (state.mode === "p43") {
      const st1 = state.p43.sol.stone1.getState(t);
      y = st1.y;
      v = st1.v;
      a = st1.a;
      if (st1.hasSplashed) {
        status = `SIMULTANEOUS SPLASH at t = ${state.p43.sol.stone1.tSplash.toFixed(2)} s!`;
      } else if (t < state.p43.tDelay) {
        status = `Stone 1 in flight; Stone 2 holding on cliff...`;
      } else {
        status = `Both Stones in flight toward single splash!`;
      }
    } else if (state.mode === "p44") {
      const st = state.p44.sol.getState(t);
      y = st.y;
      v = st.v;
      a = st.a;
      if (st.landed) {
        status = `Impact with Ground at t = ${state.p44.sol.phase2.tImpact.toFixed(2)} s (|v| = ${state.p44.sol.phase2.speedImpact.toFixed(1)} m/s)`;
      } else if (st.engineOn) {
        status = `Stage 1 Engine Burn (+2.0 m/s²) to 150 m`;
      } else if (st.phase === "coast_up") {
        status = `Free Fall Coasting to Apex (308.2 m)`;
      } else {
        status = `Plummeting to Ground under Gravity (-9.8 m/s²)`;
      }
    } else {
      const st = state.sandbox.sol.getState(t);
      y = st.y;
      v = st.v;
      a = st.a;
      status = st.hasLanded ? `Landed on ground!` : (v > 0 ? "Rising" : "Falling");
    }

    // Top Canvas HUD
    hudTime.textContent = t.toFixed(2);
    hudPosY.textContent = y.toFixed(2);
    hudVelY.textContent = `${v >= 0 ? '+' : ''}${v.toFixed(2)}`;
    hudAccY.textContent = a.toFixed(2);
    statusMessage.textContent = status;

    // Right Telemetry Strip
    teleClock.textContent = `${t.toFixed(2)} s`;
    teleY.textContent = `${y.toFixed(2)} m`;
    teleV.textContent = `${v >= 0 ? '+' : ''}${v.toFixed(2)} m/s`;
    teleA.textContent = `${a.toFixed(2)} m/s²`;
  }

  let animFrameId = null;

  function animationLoop(timestamp) {
    animFrameId = requestAnimationFrame(animationLoop);

    if (!state.lastFrameTime) {
      state.lastFrameTime = timestamp;
      return;
    }
    const dt = Math.min((timestamp - state.lastFrameTime) / 1000, 0.1);
    state.lastFrameTime = timestamp;

    if (state.isPlaying) {
      try {
        const advanceTime = dt * state.speed;
        setTime(state.simTime + advanceTime);
      } catch (err) {
        console.error("Simulation animation error:", err);
      }
    }
  }

  function playSimulation() {
    if (state.simTime >= state.maxTime - 0.02) {
      setTime(0);
    }
    state.isPlaying = true;
    state.lastFrameTime = performance.now();
    state.lastSplashTriggered = false;
    playIcon.textContent = "⏸";
    playText.textContent = "Pause";
    btnPlayPause.classList.remove("btn-primary");
    btnPlayPause.classList.add("btn-amber");

    if (!animFrameId) {
      animFrameId = requestAnimationFrame(animationLoop);
    }
  }

  function pauseSimulation() {
    state.isPlaying = false;
    playIcon.textContent = "▶";
    playText.textContent = "Play";
    btnPlayPause.classList.remove("btn-amber");
    btnPlayPause.classList.add("btn-primary");
  }

  function togglePlayPause() {
    if (state.isPlaying) pauseSimulation();
    else playSimulation();
  }

  function renderAll() {
    renderSim();
    renderGraphs();
  }

  // =========================================================================
  // USER CONTROLS & EVENT LISTENERS
  // =========================================================================
  btnPlayPause.addEventListener("click", togglePlayPause);

  btnReset.addEventListener("click", () => {
    pauseSimulation();
    state.lastSplashTriggered = false;
    state.splashParticles = [];
    state.exhaustParticles = [];
    setTime(0);
  });

  btnStepBack.addEventListener("click", () => {
    pauseSimulation();
    setTime(state.simTime - 0.05);
  });

  btnStepForward.addEventListener("click", () => {
    pauseSimulation();
    setTime(state.simTime + 0.05);
  });

  timeScrubber.addEventListener("input", (e) => {
    pauseSimulation();
    setTime(parseFloat(e.target.value));
  });

  speedPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      speedPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.speed = parseFloat(pill.dataset.speed);
    });
  });

  toggleStrobes.addEventListener("change", (e) => {
    state.showStrobes = e.target.checked;
    renderSim();
  });

  toggleVectors.addEventListener("change", (e) => {
    state.showVectors = e.target.checked;
    renderSim();
  });

  toggleRuler.addEventListener("change", (e) => {
    state.showRuler = e.target.checked;
    renderSim();
  });

  toggleCompareDownward.addEventListener("change", (e) => {
    state.compareDownward = e.target.checked;
    updateLegendLabels();
    renderAll();
  });

  // Keyboard Shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      pauseSimulation();
      setTime(state.simTime - 0.05);
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      pauseSimulation();
      setTime(state.simTime + 0.05);
    } else if (e.code === "KeyR") {
      e.preventDefault();
      pauseSimulation();
      setTime(0);
    }
  });

  // Guide Drawer Toggle
  btnToggleGuide.addEventListener("click", () => {
    const isOpen = activityGuide.classList.contains("open");
    activityGuide.classList.toggle("open", !isOpen);
    btnToggleGuide.setAttribute("aria-expanded", !isOpen);
  });
  btnCloseGuide.addEventListener("click", () => {
    activityGuide.classList.remove("open");
    btnToggleGuide.setAttribute("aria-expanded", "false");
  });

  // Mode Switching
  modePillBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const newMode = btn.dataset.mode;
      switchMode(newMode);
    });
  });

  function switchMode(newMode) {
    state.mode = newMode;
    pauseSimulation();
    state.lastSplashTriggered = false;
    state.splashParticles = [];
    state.exhaustParticles = [];

    modePillBtns.forEach((b) => {
      const isActive = b.dataset.mode === newMode;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-selected", isActive);
    });

    // Update Headings, Badges & Inquiry Scenario Text (No Problem Numbers!)
    if (newMode === "p42") {
      sceneTitleIcon.textContent = "🦝";
      sceneTitleText.textContent = "The Well Toss: Symmetry & Free Fall";
      sceneBadge.textContent = "Vertical Kinematics Inquiry";
      compareToggleContainer.style.display = "inline-flex";
      compareToggleLabel.textContent = "Compare Downward Throw (-15 m/s)";
    } else if (newMode === "p43") {
      sceneTitleIcon.textContent = "🧗";
      sceneTitleText.textContent = "Cliff Drop: Simultaneous Splash Challenge";
      sceneBadge.textContent = "Two-Body Kinematics";
      compareToggleContainer.style.display = "none";
    } else if (newMode === "p44") {
      sceneTitleIcon.textContent = "🚀";
      sceneTitleText.textContent = "Two-Stage Model Rocket: Powered Ascent & Free Fall";
      sceneBadge.textContent = "Multi-Interval Kinematics";
      compareToggleContainer.style.display = "none";
    } else {
      sceneTitleIcon.textContent = "⚙️";
      sceneTitleText.textContent = "Free Fall Sandbox: Multi-Body Dynamics";
      sceneBadge.textContent = "Interactive Inquiry";
      compareToggleContainer.style.display = "none";
    }

    updateInquiryScenario(newMode);
    recomputePhysics();
    updateLegendLabels();
    renderScenarioConfigCard();
    renderDerivationsAccordion();
    setTime(0);
  }

  const scenarioDefinitions = {
    p42: {
      title: "The Well Toss: Symmetry & Free Fall",
      tag: "Vertical Kinematics",
      narrative: "A curious raccoon tosses a stone vertically upward with an initial velocity of +15.0 m/s from the lip of a 20.0 m deep dry well (water surface at y = -20.0 m).",
      questions: [
        "<strong>(a) Maximum Height:</strong> What is the stone's maximum altitude above the well lip?",
        "<strong>(b) Time to Apex:</strong> How long does it take to reach the highest point (v = 0)?",
        "<strong>(c) Splash Time:</strong> How long after release does the stone strike the water at the bottom?",
        "<strong>(d) Impact Velocity:</strong> What is its speed right before it hits the water?",
        "<strong>(e) Velocity Symmetry:</strong> If thrown downward at -15.0 m/s instead, how does its splash speed compare? Check the downward comparison box to verify!"
      ]
    },
    p43: {
      title: "Cliff Drop: Simultaneous Splash Challenge",
      tag: "Two-Body Kinematics",
      narrative: "A mountain climber on a 50.0 m high cliff above a lake drops a first stone at t = 0 s with an upward velocity of +2.0 m/s. Exactly 1.0 s later, the climber throws a second stone downward such that both stones hit the water at the exact same instant, creating a single simultaneous splash.",
      questions: [
        "<strong>(a) Stone 1 Flight Time:</strong> How many seconds does Stone 1 spend in the air before reaching the water?",
        "<strong>(b) Stone 2 Available Time:</strong> Given the 1.0 s delay, what is the exact flight duration available for Stone 2?",
        "<strong>(c) Required Launch Velocity:</strong> What initial velocity (v02) must Stone 2 have upon release so that both stones splash simultaneously?",
        "<strong>(d) Impact Comparison:</strong> Which stone strikes the water with greater speed, and why?"
      ]
    },
    p44: {
      title: "Two-Stage Model Rocket: Powered Ascent & Free Fall",
      tag: "Multi-Interval Kinematics",
      narrative: "A model rocket blasts off vertically from the ground (y0 = 0 m) with an initial upward velocity of 50.0 m/s. Its engine provides a constant net upward acceleration of a = +2.0 m/s² until burnout at an altitude of 150.0 m. After burnout, the engine shuts off and the rocket continues in unpowered free fall under gravity (a = -9.8 m/s²).",
      questions: [
        "<strong>(a) Burnout Velocity & Time:</strong> What is the rocket's upward velocity (v_burn) and clock time (t_burn) at engine burnout?",
        "<strong>(b) Free-Fall Coast & Apex:</strong> How much higher does the rocket coast under gravity alone, and what is its maximum peak altitude?",
        "<strong>(c) Total Flight Time:</strong> How many total seconds elapse from launch until the rocket crashes back to Earth?",
        "<strong>(d) Crash Impact Velocity:</strong> With what speed does the rocket strike the ground?"
      ]
    },
    sandbox: {
      title: "Free Fall Sandbox: Multi-Body Dynamics",
      tag: "Open Investigation",
      narrative: "Freely investigate vertical 1D kinematics under uniform gravitational fields. Adjust release height (y0), initial velocity (v0), and gravity (g) across Earth, Moon, Mars, and Zero-G to observe position, velocity, and acceleration graphs in real time.",
      questions: [
        "<strong>(a) Height vs. Hang Time:</strong> How does varying initial height affect time to ground vs. peak altitude?",
        "<strong>(b) Zero-Gravity Behavior:</strong> What happens to the kinematic curves when gravity is set to 0.0 m/s²?",
        "<strong>(c) Galileo's Strobe Spacing:</strong> How does the spacing between equal-time strobe dots demonstrate that distance grows quadratically (d ∝ t²)?"
      ]
    }
  };

  function updateInquiryScenario(mode) {
    const scen = scenarioDefinitions[mode] || scenarioDefinitions.p42;
    if (inquiryTitle) inquiryTitle.textContent = scen.title;
    if (inquiryTag) inquiryTag.textContent = scen.tag;
    if (inquiryNarrative) inquiryNarrative.textContent = scen.narrative;
    if (inquiryQuestionsList) {
      inquiryQuestionsList.innerHTML = scen.questions.map(q => `<li>${q}</li>`).join("");
    }
  }

  function updateLegendLabels() {
    if (state.mode === "p42") {
      legendObj1Label.textContent = "Upward Throw (v0 = +15 m/s)";
      legendObj2Item.style.display = state.compareDownward ? "inline-flex" : "none";
      legendObj2Label.textContent = "Downward Throw (v0 = -15 m/s)";
    } else if (state.mode === "p43") {
      legendObj1Label.textContent = "Stone 1 (v01 = +2 m/s, t=0s)";
      legendObj2Item.style.display = "inline-flex";
      legendObj2Label.textContent = `Stone 2 (v02 = ${state.p43.sol.stone2.v0.toFixed(2)} m/s, t=1s)`;
    } else if (state.mode === "p44") {
      legendObj1Label.textContent = "Rocket Trajectory";
      legendObj2Item.style.display = "none";
    } else {
      legendObj1Label.textContent = "Active Object Trajectory";
      legendObj2Item.style.display = "none";
    }
  }

  // =========================================================================
  // SCENARIO CONFIGURATION UI BUILDER
  // =========================================================================
  function renderScenarioConfigCard() {
    scenarioConfigCard.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "config-grid";

    if (state.mode === "p42") {
      // Well Depth Slider
      grid.appendChild(createSliderGroup({
        id: "p42Depth",
        label: "Well Depth",
        min: 10,
        max: 50,
        step: 1,
        value: state.p42.wellDepth,
        unit: "m",
        onChange: (v) => {
          state.p42.wellDepth = v;
          recomputePhysics();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

      // Toss Speed Slider
      grid.appendChild(createSliderGroup({
        id: "p42V0",
        label: "Initial Toss Speed (v0)",
        min: 5,
        max: 30,
        step: 0.5,
        value: state.p42.v0,
        unit: "m/s",
        onChange: (v) => {
          state.p42.v0 = v;
          recomputePhysics();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

      // Gravity Toggle (9.8 vs 10)
      grid.appendChild(createGravityToggleGroup(state.p42.g, (gVal) => {
        state.p42.g = gVal;
        recomputePhysics();
        renderDerivationsAccordion();
        setTime(0);
      }));

    } else if (state.mode === "p43") {
      // Cliff Height
      grid.appendChild(createSliderGroup({
        id: "p43Height",
        label: "Cliff Height",
        min: 20,
        max: 100,
        step: 5,
        value: state.p43.cliffHeight,
        unit: "m",
        onChange: (v) => {
          state.p43.cliffHeight = v;
          recomputePhysics();
          updateLegendLabels();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

      // Stone 1 v01
      grid.appendChild(createSliderGroup({
        id: "p43V01",
        label: "Stone 1 Velocity (v01)",
        min: 0,
        max: 15,
        step: 0.5,
        value: state.p43.v01,
        unit: "m/s",
        onChange: (v) => {
          state.p43.v01 = v;
          recomputePhysics();
          updateLegendLabels();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

      // Stone 2 Release Delay (tDelay)
      grid.appendChild(createSliderGroup({
        id: "p43Delay",
        label: "Stone 2 Release Delay (Δt)",
        min: 0.2,
        max: 2.5,
        step: 0.1,
        value: state.p43.tDelay,
        unit: "s",
        onChange: (v) => {
          state.p43.tDelay = v;
          recomputePhysics();
          updateLegendLabels();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

    } else if (state.mode === "p44") {
      // Launch velocity v0
      grid.appendChild(createSliderGroup({
        id: "p44V0",
        label: "Launch Speed (v0)",
        min: 20,
        max: 80,
        step: 5,
        value: state.p44.v0,
        unit: "m/s",
        onChange: (v) => {
          state.p44.v0 = v;
          recomputePhysics();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

      // Motor net acceleration
      grid.appendChild(createSliderGroup({
        id: "p44ABoost",
        label: "Powered Boost Accel (a1)",
        min: 1.0,
        max: 8.0,
        step: 0.5,
        value: state.p44.aBoost,
        unit: "m/s²",
        onChange: (v) => {
          state.p44.aBoost = v;
          recomputePhysics();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

      // Burnout altitude
      grid.appendChild(createSliderGroup({
        id: "p44BurnAlt",
        label: "Burnout Altitude",
        min: 50,
        max: 250,
        step: 10,
        value: state.p44.burnoutAltitude,
        unit: "m",
        onChange: (v) => {
          state.p44.burnoutAltitude = v;
          recomputePhysics();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

    } else {
      // Sandbox
      grid.appendChild(createSliderGroup({
        id: "sbY0",
        label: "Initial Height (y0)",
        min: -20,
        max: 200,
        step: 5,
        value: state.sandbox.y0,
        unit: "m",
        onChange: (v) => {
          state.sandbox.y0 = v;
          recomputePhysics();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

      grid.appendChild(createSliderGroup({
        id: "sbV0",
        label: "Initial Velocity (v0)",
        min: -30,
        max: 40,
        step: 1,
        value: state.sandbox.v0,
        unit: "m/s",
        onChange: (v) => {
          state.sandbox.v0 = v;
          recomputePhysics();
          renderDerivationsAccordion();
          setTime(0);
        }
      }));

      // Celestial Gravity Presets
      const gravityBox = document.createElement("div");
      gravityBox.className = "form-group";
      gravityBox.innerHTML = `
        <label class="form-label">Gravity Body Preset: <span>${state.sandbox.g.toFixed(2)} m/s²</span></label>
        <div class="gravity-pills-row">
          <button type="button" class="gravity-pill ${Math.abs(state.sandbox.g - 9.8) < 0.1 ? 'active' : ''}" data-g="9.8">Earth (9.8)</button>
          <button type="button" class="gravity-pill ${Math.abs(state.sandbox.g - 10.0) < 0.1 ? 'active' : ''}" data-g="10.0">Exam (10)</button>
          <button type="button" class="gravity-pill ${Math.abs(state.sandbox.g - 1.62) < 0.1 ? 'active' : ''}" data-g="1.62">Moon (1.62)</button>
          <button type="button" class="gravity-pill ${Math.abs(state.sandbox.g - 3.71) < 0.1 ? 'active' : ''}" data-g="3.71">Mars (3.71)</button>
          <button type="button" class="gravity-pill ${Math.abs(state.sandbox.g - 0) < 0.01 ? 'active' : ''}" data-g="0">Zero-G (0)</button>
        </div>
      `;
      gravityBox.querySelectorAll(".gravity-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.sandbox.g = parseFloat(btn.dataset.g);
          recomputePhysics();
          renderScenarioConfigCard();
          renderDerivationsAccordion();
          setTime(0);
        });
      });
      grid.appendChild(gravityBox);
    }

    scenarioConfigCard.appendChild(grid);
  }

  function createSliderGroup(cfg) {
    const { id, label, min, max, step, value, unit, onChange } = cfg;
    const group = document.createElement("div");
    group.className = "form-group";

    const labelEl = document.createElement("label");
    labelEl.className = "form-label";
    labelEl.htmlFor = id;
    labelEl.innerHTML = `${label}: <span id="${id}Display">${value} ${unit}</span>`;

    const row = document.createElement("div");
    row.className = "form-input-row";

    const range = document.createElement("input");
    range.type = "range";
    range.id = id;
    range.min = min;
    range.max = max;
    range.step = step;
    range.value = value;

    const num = document.createElement("input");
    num.type = "number";
    num.min = min;
    num.max = max;
    num.step = step;
    num.value = value;

    range.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      num.value = val;
      document.getElementById(`${id}Display`).textContent = `${val} ${unit}`;
      onChange(val);
    });

    num.addEventListener("change", (e) => {
      const val = parseFloat(e.target.value);
      range.value = val;
      document.getElementById(`${id}Display`).textContent = `${val} ${unit}`;
      onChange(val);
    });

    row.appendChild(range);
    row.appendChild(num);
    group.appendChild(labelEl);
    group.appendChild(row);
    return group;
  }

  function createGravityToggleGroup(curG, onSelect) {
    const group = document.createElement("div");
    group.className = "form-group";
    group.innerHTML = `
      <label class="form-label">Gravity Selection: <span>g = ${curG.toFixed(1)} m/s²</span></label>
      <div class="gravity-pills-row">
        <button type="button" class="gravity-pill ${Math.abs(curG - 9.8) < 0.1 ? 'active' : ''}" data-g="9.8">Standard (9.8 m/s²)</button>
        <button type="button" class="gravity-pill ${Math.abs(curG - 10.0) < 0.1 ? 'active' : ''}" data-g="10.0">Exam Clean (10.0 m/s²)</button>
      </div>
    `;
    group.querySelectorAll(".gravity-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseFloat(btn.dataset.g);
        group.querySelectorAll(".gravity-pill").forEach((b) => b.classList.toggle("active", b === btn));
        const disp = group.querySelector("span");
        if (disp) disp.textContent = `g = ${val.toFixed(1)} m/s²`;
        onSelect(val);
      });
    });
    return group;
  }

  // =========================================================================
  // STEP-BY-STEP PEDAGOGICAL DERIVATION ACCORDION (No Shortcuts)
  // =========================================================================
  function renderDerivationsAccordion() {
    stepsAccordion.innerHTML = "";
    let stepsData = [];

    if (state.mode === "p42") {
      stepsData = state.p42.sol.steps;
    } else if (state.mode === "p43") {
      stepsData = state.p43.sol.steps;
    } else if (state.mode === "p44") {
      stepsData = state.p44.sol.steps;
    } else {
      stepsData = state.sandbox.sol.steps;
    }

    stepsData.forEach((step, index) => {
      const card = document.createElement("div");
      card.className = "step-card"; // default collapsed per pedagogical preference

      // Header
      const header = document.createElement("div");
      header.className = "step-header";
      header.innerHTML = `
        <div class="step-title-wrap">
          <span class="step-number-badge">${step.stepNumber}</span>
          <div>
            <div class="step-title">${step.title}</div>
            <div class="step-concept-tag">${step.concept}</div>
          </div>
        </div>
        <span class="step-chevron">▼</span>
      `;

      header.addEventListener("click", () => {
        card.classList.toggle("open");
      });

      // Body
      const body = document.createElement("div");
      body.className = "step-body";

      // Math block
      const mathBlock = document.createElement("div");
      mathBlock.className = "step-math-block";

      step.math.forEach((mStr) => {
        const line = document.createElement("div");
        line.style.marginBottom = "4px";
        if (window.katex) {
          try {
            line.innerHTML = window.katex.renderToString(mStr, { displayMode: false, throwOnError: false });
          } catch (e) {
            line.textContent = mStr;
          }
        } else {
          line.textContent = mStr;
        }
        mathBlock.appendChild(line);
      });

      const explanation = document.createElement("p");
      explanation.className = "step-explanation";
      explanation.innerHTML = `<strong>Pedagogical Insight:</strong> ${step.explanation}`;

      body.appendChild(mathBlock);
      body.appendChild(explanation);

      card.appendChild(header);
      card.appendChild(body);
      stepsAccordion.appendChild(card);
    });

    renderScenarioTChart();
  }

  btnExpandAllSteps.addEventListener("click", () => {
    document.querySelectorAll(".step-card").forEach((c) => c.classList.add("open"));
  });

  btnCollapseAllSteps.addEventListener("click", () => {
    document.querySelectorAll(".step-card").forEach((c) => c.classList.remove("open"));
  });

  // =========================================================================
  // DYNAMIC SCENARIO KINEMATICS T-CHART BUILDER
  // =========================================================================
  function renderScenarioTChart() {
    const container = document.getElementById("scenarioTChartContainer");
    if (!container) return;

    let opt = {};
    if (state.mode === "p42") {
      opt = { v0: state.p42.v0, wellDepth: state.p42.wellDepth, g: state.p42.g };
    } else if (state.mode === "p43") {
      opt = { cliffHeight: state.p43.cliffHeight, v01: state.p43.v01, tDelay: state.p43.tDelay, g: state.p43.g };
    } else if (state.mode === "p44") {
      opt = { v0: state.p44.v0, aBoost: state.p44.aBoost, burnoutAltitude: state.p44.burnoutAltitude, g: state.p44.g };
    } else {
      opt = { y0: state.sandbox.y0, v0: state.sandbox.v0, g: state.sandbox.g, groundY: state.sandbox.groundY };
    }

    const tData = Physics.getScenarioTChart(state.mode, opt);
    container.innerHTML = `
      <div class="scenario-tchart-bridge">
        <div class="scenario-tchart-bridge-header">
          <span class="scenario-tchart-bridge-title">🔗 ${tData.bridgeTitle}</span>
          <span class="scenario-tchart-bridge-tag">${tData.bridgeTag}</span>
        </div>
        <div class="scenario-tchart-bridge-text">${tData.bridgeSummary}</div>
      </div>

      <div class="scenario-tchart-columns">
        <!-- Column 1 -->
        <div class="scenario-tchart-col">
          <div class="scenario-tchart-col-head teal">
            <span>🔹 ${tData.col1Header}</span>
          </div>
          <table class="scenario-tchart-table">
            <tbody>
              ${tData.rows.map(r => `
                <tr>
                  <td class="var-sym">${r.symbol}</td>
                  <td class="var-lbl">${r.label}</td>
                  <td class="var-val">${r.col1}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Column 2 -->
        <div class="scenario-tchart-col">
          <div class="scenario-tchart-col-head amber">
            <span>🔸 ${tData.col2Header}</span>
          </div>
          <table class="scenario-tchart-table">
            <tbody>
              ${tData.rows.map(r => `
                <tr>
                  <td class="var-sym">${r.symbol}</td>
                  <td class="var-lbl">${r.label}</td>
                  <td class="var-val">${r.col2}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Foundations Drawer Toggle
  const btnToggleFoundations = document.getElementById("btnToggleFoundations");
  const foundationsDrawer = document.getElementById("foundationsDrawer");
  if (btnToggleFoundations && foundationsDrawer) {
    btnToggleFoundations.addEventListener("click", () => {
      const isHidden = foundationsDrawer.style.display === "none";
      foundationsDrawer.style.display = isHidden ? "block" : "none";
      btnToggleFoundations.setAttribute("aria-expanded", String(isHidden));
      btnToggleFoundations.textContent = isHidden ? "✕ Hide Pillars" : "📖 Theoretical Pillars";
    });
  }

  // =========================================================================
  // CORNELL 1D KINEMATICS T-CHART BUILDER
  // =========================================================================
  function renderCornellTChart() {
    const tData = Physics.getCornellTChartData();
    cornellTChartContainer.innerHTML = "";

    tData.columns.forEach((col) => {
      const colEl = document.createElement("div");
      colEl.className = "tchart-col";

      const head = document.createElement("div");
      head.className = "tchart-col-head";
      head.innerHTML = `
        <span class="tchart-col-title">${col.header}</span>
        <span class="tchart-col-badge">${col.badge}</span>
      `;

      const body = document.createElement("div");
      body.className = "tchart-col-body";

      col.items.forEach((item) => {
        const entry = document.createElement("div");
        entry.className = "tchart-entry";

        let formulaHtml = "";
        if (item.formula) {
          if (window.katex) {
            try {
              formulaHtml = `<div class="tchart-formula-pill">${window.katex.renderToString(item.formula, { throwOnError: false })}</div>`;
            } catch (e) {
              formulaHtml = `<div class="tchart-formula-pill">${item.formula}</div>`;
            }
          } else {
            formulaHtml = `<div class="tchart-formula-pill">${item.formula}</div>`;
          }
        }

        entry.innerHTML = `
          <div class="tchart-entry-title">${item.term}</div>
          ${formulaHtml}
          <div class="tchart-entry-desc">${item.detail}</div>
        `;
        body.appendChild(entry);
      });

      colEl.appendChild(head);
      colEl.appendChild(body);
      cornellTChartContainer.appendChild(colEl);
    });
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  function init() {
    recomputePhysics();
    resizeCanvases();
    updateInquiryScenario(state.mode);
    renderScenarioConfigCard();
    renderDerivationsAccordion();
    renderScenarioTChart();
    renderCornellTChart();
    updateLegendLabels();
    setTime(0);

    animFrameId = requestAnimationFrame(animationLoop);
  }

  // Wait for DOM & KaTeX
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
