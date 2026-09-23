const test = require('node:test');
const assert = require('node:assert/strict');
const Physics = require('../src/freeFallPhysics.js');

test('Quadratic Equation Solver', async (t) => {
  await t.test('solves standard quadratic with two real roots', () => {
    // t^2 - 3t - 4 = 0 => (t - 4)(t + 1) = 0
    const res = Physics.solveQuadratic(1, -3, -4);
    assert.equal(res.roots.length, 2);
    assert.ok(Math.abs(res.roots[0] - (-1)) < 1e-6);
    assert.ok(Math.abs(res.roots[1] - 4) < 1e-6);
    assert.equal(res.positiveRoots.length, 1);
    assert.ok(Math.abs(res.positiveRoots[0] - 4) < 1e-6);
  });

  await t.test('handles linear fallback when A=0', () => {
    // 2t - 10 = 0 => t = 5
    const res = Physics.solveQuadratic(0, 2, -10);
    assert.equal(res.roots.length, 1);
    assert.ok(Math.abs(res.roots[0] - 5) < 1e-6);
    assert.equal(res.positiveRoots.length, 1);
  });

  await t.test('handles negative discriminant (no real roots)', () => {
    const res = Physics.solveQuadratic(1, 0, 10); // t^2 + 10 = 0
    assert.equal(res.roots.length, 0);
    assert.equal(res.positiveRoots.length, 0);
  });
});

test('Problem 42: The Raccoon & The Well (v0 = +15 m/s vs -15 m/s, well = 20 m)', async (t) => {
  await t.test('Standard g = 9.8 m/s^2 analytics', () => {
    const p42 = Physics.solveProblem42({ v0: 15.0, wellDepth: 20.0, g: 9.8 });

    // Apex time t_apex = 15 / 9.8 = 1.5306 s
    assert.ok(Math.abs(p42.upward.tApex - (15 / 9.8)) < 1e-5);
    // Max height above lip = 15^2 / (2 * 9.8) = 11.47959 m
    assert.ok(Math.abs(p42.upward.hMaxAboveLip - (225 / 19.6)) < 1e-5);

    // Splash time upward throw: -4.9 t^2 + 15 t + 20 = 0 => t = (15 + sqrt(225 + 392)) / 9.8 = (15 + sqrt(617)) / 9.8
    const expectedTSplashUp = (15 + Math.sqrt(617)) / 9.8; // ~4.06525 s
    assert.ok(Math.abs(p42.upward.tSplash - expectedTSplashUp) < 1e-5);

    // Impact velocity upward throw: v = 15 - 9.8 * t_splash = -sqrt(617) ~ -24.8395 m/s
    const expectedVImpact = -Math.sqrt(617);
    assert.ok(Math.abs(p42.upward.vImpact - expectedVImpact) < 1e-5);

    // Downward throw (v0 = -15 m/s): t = (-15 + sqrt(617)) / 9.8 ~ 1.00403 s
    const expectedTSplashDown = (-15 + Math.sqrt(617)) / 9.8;
    assert.ok(Math.abs(p42.downward.tSplash - expectedTSplashDown) < 1e-5);
    assert.ok(Math.abs(p42.downward.vImpact - expectedVImpact) < 1e-5);

    // Crucial Pedagogical Discovery:
    // 1. Speeds match exactly: |v_up| == |v_down|
    assert.ok(p42.comparison.exactMatchSpeed);
    assert.ok(Math.abs(p42.upward.speedImpact - p42.downward.speedImpact) < 1e-6);

    // 2. Time difference is exactly 2 * t_apex
    assert.ok(p42.comparison.exactDeltaTMatches2tApex);
    assert.ok(Math.abs(p42.comparison.timeDifference - 2 * p42.upward.tApex) < 1e-6);
  });

  await t.test('Clean exam values with g = 10.0 m/s^2', () => {
    const p42 = Physics.solveProblem42({ v0: 15.0, wellDepth: 20.0, g: 10.0 });
    // t_apex = 15 / 10 = 1.5 s
    assert.equal(p42.upward.tApex, 1.5);
    // h_max = 15^2 / (2 * 10) = 11.25 m
    assert.equal(p42.upward.hMaxAboveLip, 11.25);
    // Upward splash: -5 t^2 + 15 t + 20 = 0 => t^2 - 3t - 4 = 0 => (t-4)(t+1) = 0 => t = 4.0 s
    assert.equal(p42.upward.tSplash, 4.0);
    // v_impact = 15 - 10(4) = -25.0 m/s
    assert.equal(p42.upward.vImpact, -25.0);

    // Downward splash: -5 t^2 - 15 t + 20 = 0 => t^2 + 3t - 4 = 0 => (t+4)(t-1) = 0 => t = 1.0 s
    assert.equal(p42.downward.tSplash, 1.0);
    assert.equal(p42.downward.vImpact, -25.0);

    // Time difference = 4.0 - 1.0 = 3.0 s = 2 * 1.5 s
    assert.equal(p42.comparison.timeDifference, 3.0);
  });
});

test('Problem 43: Mountain Climber & Simultaneous Splash (Cliff = 50 m, v01 = +2 m/s, tDelay = 1.0 s)', async (t) => {
  await t.test('Standard g = 9.8 m/s^2 analytics', () => {
    const p43 = Physics.solveProblem43({ cliffHeight: 50.0, v01: 2.0, tDelay: 1.0, g: 9.8 });

    // Stone 1 splash: 50 + 2t - 4.9 t^2 = 0 => 4.9 t^2 - 2t - 50 = 0
    // disc = 4 - 4(4.9)(-50) = 4 + 980 = 984
    const expectedT1 = (2 + Math.sqrt(984)) / 9.8; // ~3.404977 s
    assert.ok(Math.abs(p43.stone1.tSplash - expectedT1) < 1e-5);
    assert.ok(Math.abs(p43.stone1.vImpact - (-Math.sqrt(984))) < 1e-5);

    // Stone 2: released at t = 1.0 s, so flight time is t1 - 1.0
    const deltaT2 = expectedT1 - 1.0; // ~2.404977 s
    assert.ok(Math.abs(p43.stone2.flightDuration - deltaT2) < 1e-5);

    // Stone 2 required v02: 50 + v02 * deltaT2 - 4.9 (deltaT2)^2 = 0
    const expectedV02 = (-50 + 4.9 * deltaT2 * deltaT2) / deltaT2; // ~ -9.00576 m/s
    assert.ok(Math.abs(p43.stone2.v0 - expectedV02) < 1e-5);
    assert.ok(p43.stone2.v0 < 0, 'Stone 2 must be thrown downwards');

    // Both stones must reach y = 0 at t = tSplash1
    const s1AtSplash = p43.stone1.getState(p43.stone1.tSplash);
    const s2AtSplash = p43.stone2.getState(p43.stone2.tSplash);
    assert.ok(Math.abs(s1AtSplash.y) < 1e-4);
    assert.ok(Math.abs(s2AtSplash.y) < 1e-4);
    assert.equal(s1AtSplash.hasSplashed, true);
    assert.equal(s2AtSplash.hasSplashed, true);
  });

  await t.test('Stone 2 state before release is stationary at cliff top', () => {
    const p43 = Physics.solveProblem43({ cliffHeight: 50.0, v01: 2.0, tDelay: 1.0, g: 9.8 });
    const s2Before = p43.stone2.getState(0.5);
    assert.equal(s2Before.released, false);
    assert.equal(s2Before.y, 50.0);
    assert.equal(s2Before.v, 0);
  });
});

test('Problem 44: Model Rocket Two-Interval Kinematics (v0 = 50 m/s, a = +2 m/s^2 to 150 m, then g = -9.8 m/s^2)', async (t) => {
  await t.test('Phase 1 Boost Stage calculations', () => {
    const p44 = Physics.solveProblem44({ v0: 50.0, aBoost: 2.0, burnoutAltitude: 150.0, g: 9.8 });

    // v_burn^2 = 50^2 + 2(2)(150) = 2500 + 600 = 3100
    const expectedVBurn = Math.sqrt(3100); // ~55.67764 m/s
    assert.ok(Math.abs(p44.phase1.vEnd - expectedVBurn) < 1e-5);

    // t_burn = (vBurn - 50) / 2
    const expectedTBurn = (expectedVBurn - 50) / 2; // ~2.83882 s
    assert.ok(Math.abs(p44.phase1.tEnd - expectedTBurn) < 1e-5);
  });

  await t.test('Phase 2 Free Fall Coast & Ground Impact', () => {
    const p44 = Physics.solveProblem44({ v0: 50.0, aBoost: 2.0, burnoutAltitude: 150.0, g: 9.8 });
    const vBurn = Math.sqrt(3100);
    const tBurn = (vBurn - 50) / 2;

    // Coast time to apex: deltaT_apex = vBurn / 9.8
    const deltaTApex = vBurn / 9.8;
    assert.ok(Math.abs(p44.phase2.deltaTApex - deltaTApex) < 1e-5);
    assert.ok(Math.abs(p44.phase2.tApex - (tBurn + deltaTApex)) < 1e-5);

    // Max altitude: y_apex = 150 + 3100 / (2 * 9.8) = 150 + 158.16326 = 308.16326 m
    const expectedYApex = 150 + 3100 / (19.6);
    assert.ok(Math.abs(p44.phase2.altitudeApex - expectedYApex) < 1e-5);

    // Ground return: 150 + vBurn * tau - 4.9 tau^2 = 0
    // disc = 3100 - 4(-4.9)(150) = 3100 + 2940 = 6040
    const tauImpact = (vBurn + Math.sqrt(6040)) / 9.8; // ~13.61174 s
    const expectedTImpact = tBurn + tauImpact; // ~16.45056 s
    assert.ok(Math.abs(p44.phase2.tImpact - expectedTImpact) < 1e-4);

    // Impact velocity: -sqrt(6040) = -77.7174 m/s
    assert.ok(Math.abs(p44.phase2.vImpact - (-Math.sqrt(6040))) < 1e-4);
  });

  await t.test('Piecewise state continuity across engine cutoff', () => {
    const p44 = Physics.solveProblem44({ v0: 50.0, aBoost: 2.0, burnoutAltitude: 150.0, g: 9.8 });
    const tBurn = p44.phase1.tEnd;

    // Check right before cutoff
    const stateBefore = p44.getState(tBurn - 0.001);
    assert.equal(stateBefore.phase, 'boost');
    assert.equal(stateBefore.engineOn, true);
    assert.ok(Math.abs(stateBefore.y - 150) < 0.1);

    // Check right after cutoff
    const stateAfter = p44.getState(tBurn + 0.001);
    assert.equal(stateAfter.phase, 'coast_up');
    assert.equal(stateAfter.engineOn, false);
    assert.equal(stateAfter.a, -9.8);
    assert.ok(Math.abs(stateAfter.y - 150) < 0.1);
  });
});

test('Free Fall Sandbox Mode & Zero-G validation', async (t) => {
  await t.test('Earth free fall from 100 m dropped from rest', () => {
    const sandbox = Physics.solveGenericSandbox({ y0: 100.0, v0: 0.0, g: 9.8, groundY: 0.0 });
    // t_impact = sqrt(2 * 100 / 9.8) = sqrt(200 / 9.8) = 4.5175 s
    const expectedT = Math.sqrt(200 / 9.8);
    assert.ok(Math.abs(sandbox.tImpact - expectedT) < 1e-4);
    assert.ok(Math.abs(sandbox.vImpact - (-9.8 * expectedT)) < 1e-4);
  });

  await t.test('Zero-G constant velocity motion', () => {
    const sandbox = Physics.solveGenericSandbox({ y0: 50.0, v0: -10.0, g: 0.0, groundY: 0.0 });
    // Distance 50 m at 10 m/s downward => 5.0 s
    assert.equal(sandbox.tImpact, 5.0);
    assert.equal(sandbox.vImpact, -10.0);
  });
});

test('Strobe & Motion Diagram Generation', () => {
  const p42 = Physics.solveProblem42({ v0: 15.0, wellDepth: 20.0, g: 9.8 });
  const flashes = Physics.generateStrobeDiagram(p42.upward.getState, p42.upward.tSplash, 0.5);
  assert.ok(flashes.length > 5);
  assert.equal(flashes[0].t, 0);
  assert.equal(flashes[0].y, 0);
  assert.equal(flashes[0].v, 15.0);
  // Verify spacing: near apex, Δy between flashes is smaller than during rapid fall
  const peakFlash = flashes.reduce((prev, curr) => (curr.y > prev.y ? curr : prev));
  assert.ok(peakFlash.y > 11.0);
});

test('Cornell T-Chart Structure & Strict Branding Compliance', () => {
  const tchart = Physics.getCornellTChartData();
  assert.equal(tchart.columns.length, 3);
  // Check banned colors: No purple (#59118e), No gold (#ffc61e)
  const jsonStr = JSON.stringify(tchart).toLowerCase();
  assert.ok(!jsonStr.includes('#59118e'), 'Purple is strictly forbidden');
  assert.ok(!jsonStr.includes('#ffc61e'), 'Gold is strictly forbidden');
});

test('Interactive Scenario Kinematics T-Chart Generation for all 4 modes', () => {
  // Problem 42 (Well Toss)
  const tc42 = Physics.getScenarioTChart("p42", { v0: 15, wellDepth: 20, g: 9.8 });
  assert.equal(tc42.mode, "p42");
  assert.ok(tc42.rows.length >= 8);
  assert.ok(tc42.bridgeSummary.includes("Symmetry") || tc42.bridgeTitle.includes("Symmetry"));

  // Problem 43 (Cliff Drop)
  const tc43 = Physics.getScenarioTChart("p43", { cliffHeight: 50, v01: 2, tDelay: 1, g: 9.8 });
  assert.equal(tc43.mode, "p43");
  assert.ok(tc43.rows.length >= 8);
  assert.ok(tc43.bridgeSummary.includes("Simultaneous") || tc43.bridgeTitle.includes("Simultaneous"));

  // Problem 44 (Rocket)
  const tc44 = Physics.getScenarioTChart("p44", { v0: 50, aBoost: 2, burnoutAltitude: 150, g: 9.8 });
  assert.equal(tc44.mode, "p44");
  assert.ok(tc44.rows.length >= 7);
  assert.ok(tc44.bridgeSummary.includes("burnout") || tc44.bridgeTitle.includes("Continuity"));

  // Sandbox
  const tcSb = Physics.getScenarioTChart("sandbox", { y0: 100, v0: 0, g: 9.8 });
  assert.equal(tcSb.mode, "sandbox");
  assert.ok(tcSb.rows.length >= 4);
});

