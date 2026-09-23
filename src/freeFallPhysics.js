/**
 * Free Fall 1D Kinematics Studio - Physics Engine
 * The Thinking Experiment (PhysicsKit)
 * 
 * Strict Pedagogical Design:
 * - Direct fundamental laws: v(t) = v0 + a*t, y(t) = y0 + v0*t + 0.5*a*t^2
 * - Sign conventions: +y is UP, -y is DOWN; a = -g during free fall
 * - No shortcut / "magic" formulas in explanations
 * - Full analytical rigor for Packet 6 problems:
 *   * Problem 42: Raccoon tossing stone into 20 m well (+15 m/s vs -15 m/s)
 *   * Problem 43: Mountain climber cliff simultaneous splash (tDelay = 1.0 s)
 *   * Problem 44: Two-interval model rocket (burn to 150 m at +2 m/s^2, then g = -9.8 m/s^2)
 *   * Free Fall Sandbox: Arbitrary y0, v0, g
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FreeFallPhysics = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Safe floating point rounder for display/testing
   */
  function round(val, decimals = 4) {
    if (typeof val !== 'number' || isNaN(val)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((val + Number.EPSILON) * factor) / factor;
  }

  /**
   * Solves quadratic equation: A*t^2 + B*t + C = 0
   * Returns all roots and positive roots (physical times)
   */
  function solveQuadratic(A, B, C) {
    if (Math.abs(A) < 1e-12) {
      if (Math.abs(B) < 1e-12) {
        return { roots: [], positiveRoots: [], discriminant: 0 };
      }
      const singleRoot = -C / B;
      return {
        roots: [singleRoot],
        positiveRoots: singleRoot >= 0 ? [singleRoot] : [],
        discriminant: 0
      };
    }

    const disc = B * B - 4 * A * C;
    if (disc < -1e-9) {
      return { roots: [], positiveRoots: [], discriminant: disc };
    }

    const safeDisc = Math.max(0, disc);
    const sqrtDisc = Math.sqrt(safeDisc);
    const r1 = (-B + sqrtDisc) / (2 * A);
    const r2 = (-B - sqrtDisc) / (2 * A);
    const roots = [r1, r2].sort((a, b) => a - b);
    const positiveRoots = roots.filter(r => r >= -1e-9).map(r => (Math.abs(r) < 1e-9 ? 0 : r));

    return {
      roots,
      positiveRoots,
      discriminant: safeDisc
    };
  }

  // =========================================================================
  // PROBLEM 42: The Raccoon & The Well
  // =========================================================================
  /**
   * Scenario:
   * Origin y = 0 at the well lip.
   * Water surface is at y = -wellDepth (e.g. -20.0 m).
   * Stone thrown upward with v0 = +15.0 m/s.
   * Comparison throw downwards with v0_down = -15.0 m/s.
   * Acceleration a = -g.
   */
  function solveProblem42(options = {}) {
    const v0 = typeof options.v0 === 'number' ? options.v0 : 15.0; // m/s
    const wellDepth = typeof options.wellDepth === 'number' ? Math.abs(options.wellDepth) : 20.0; // m
    const g = typeof options.g === 'number' ? options.g : 9.8; // m/s^2
    const a = -g;
    const y0 = 0.0;
    const yWater = -wellDepth;

    // Upward throw calculations
    // 1. Apex: v(t_apex) = 0 => v0 + a * t_apex = 0 => t_apex = -v0 / a = v0 / g
    const tApex = v0 > 0 ? v0 / g : 0;
    // Maximum height above lip
    const yApex = y0 + v0 * tApex + 0.5 * a * tApex * tApex;
    const hMaxAboveLip = yApex - y0;
    const hMaxAboveWater = yApex - yWater;

    // Time to return to lip (y = 0)
    const tReturnLip = 2 * tApex;

    // Splash time for upward throw: y(t) = yWater => y0 + v0*t + 0.5*a*t^2 = yWater
    // 0.5 * a * t^2 + v0 * t + (y0 - yWater) = 0
    // (-0.5 * g) * t^2 + v0 * t + wellDepth = 0
    const quadUp = solveQuadratic(-0.5 * g, v0, y0 - yWater);
    const tSplashUp = quadUp.positiveRoots.length > 0 ? Math.max(...quadUp.positiveRoots) : 0;
    const vImpactUp = v0 + a * tSplashUp;
    const speedImpactUp = Math.abs(vImpactUp);

    // Downward throw calculations (v0_down = -|v0|)
    const v0Down = -Math.abs(v0);
    const quadDown = solveQuadratic(-0.5 * g, v0Down, y0 - yWater);
    const tSplashDown = quadDown.positiveRoots.length > 0 ? Math.max(...quadDown.positiveRoots) : 0;
    const vImpactDown = v0Down + a * tSplashDown;
    const speedImpactDown = Math.abs(vImpactDown);

    // Pedagogical comparison
    const timeDifference = tSplashUp - tSplashDown;
    const speedDifference = speedImpactUp - speedImpactDown;

    // State evaluators
    function getStateUp(t) {
      const clampedT = Math.max(0, Math.min(t, tSplashUp));
      const hasSplashed = t >= tSplashUp;
      const curY = hasSplashed ? yWater : y0 + v0 * clampedT + 0.5 * a * clampedT * clampedT;
      // Pedagogical rule: Never zero out final velocity; retain velocity at end of trajectory
      const curV = v0 + a * clampedT;
      const curA = a;
      return { t: clampedT, y: curY, v: curV, a: curA, hasSplashed };
    }

    function getStateDown(t) {
      const clampedT = Math.max(0, Math.min(t, tSplashDown));
      const hasSplashed = t >= tSplashDown;
      const curY = hasSplashed ? yWater : y0 + v0Down * clampedT + 0.5 * a * clampedT * clampedT;
      const curV = v0Down + a * clampedT;
      const curA = a;
      return { t: clampedT, y: curY, v: curV, a: curA, hasSplashed };
    }

    return {
      problemId: 42,
      name: "The Raccoon's Well Toss",
      inputs: { v0, wellDepth, g, y0, yWater, a },
      upward: {
        tApex,
        yApex,
        hMaxAboveLip,
        hMaxAboveWater,
        tReturnLip,
        tSplash: tSplashUp,
        vImpact: vImpactUp,
        speedImpact: speedImpactUp,
        getState: getStateUp
      },
      downward: {
        v0: v0Down,
        tSplash: tSplashDown,
        vImpact: vImpactDown,
        speedImpact: speedImpactDown,
        getState: getStateDown
      },
      comparison: {
        timeDifference,
        speedDifference,
        exactMatchSpeed: Math.abs(speedDifference) < 1e-7,
        exactDeltaTMatches2tApex: Math.abs(timeDifference - 2 * tApex) < 1e-7
      },
      steps: generateProblem42Steps({ v0, wellDepth, g, tApex, yApex, tSplashUp, vImpactUp, v0Down, tSplashDown, vImpactDown })
    };
  }

  function generateProblem42Steps(data) {
    const { v0, wellDepth, g, tApex, yApex, tSplashUp, vImpactUp, v0Down, tSplashDown, vImpactDown } = data;
    return [
      {
        stepNumber: 1,
        title: "Step 1: Set Up the Kinematics T-Chart (Knowns & Sign Conventions)",
        concept: "Organize known values in a two-column T-chart: Upward Toss (+v0) vs. Downward Throw (-v0). Sign convention: +y is UP, -y is DOWN.",
        math: [
          `\\text{Origin } y = 0 \\text{ at the well lip. Water surface at } y_{\\text{final}} = -${wellDepth.toFixed(1)}\\text{ m.}`,
          `\\text{Upward Toss: } v_0 = +${v0.toFixed(1)}\\text{ m/s}, \\quad a = -g = -${g.toFixed(1)}\\text{ m/s}^2`,
          `\\text{Downward Throw: } v_0 = -${v0.toFixed(1)}\\text{ m/s}, \\quad a = -g = -${g.toFixed(1)}\\text{ m/s}^2`,
          `\\text{Displacement: } \\Delta y = y_{\\text{final}} - y_0 = -${wellDepth.toFixed(1)}\\text{ m}`
        ],
        explanation: `In standard physics problem-solving, Step 1 is always constructing the Kinematics T-Chart. We place Upward Toss in Column 1 and Downward Throw in Column 2. Note that acceleration is -${g.toFixed(1)} m/s² for both cases because gravity acts downward regardless of release direction.`
      },
      {
        stepNumber: 2,
        title: "Time to Apex & Maximum Altitude",
        concept: "At the peak, vertical velocity momentarily drops to zero: v(t_apex) = 0.",
        math: [
          `v(t) = v_0 + a t \\implies 0 = ${v0.toFixed(1)} - ${g.toFixed(1)} t_{\\text{apex}}`,
          `t_{\\text{apex}} = \\frac{${v0.toFixed(1)}}{${g.toFixed(1)}} = ${round(tApex, 3)}\\text{ s}`,
          `y(t) = y_0 + v_0 t + \\frac{1}{2} a t^2`,
          `y_{\\text{apex}} = 0 + (${v0.toFixed(1)})(${round(tApex, 3)}) - \\frac{1}{2}(${g.toFixed(1)})(${round(tApex, 3)})^2 = +${round(yApex, 3)}\\text{ m}`
        ],
        explanation: `The stone decelerates until its velocity is 0 m/s at t = ${round(tApex, 2)} s, reaching a peak altitude of +${round(yApex, 2)} m above the lip (+${round(yApex + wellDepth, 2)} m above the water).`
      },
      {
        stepNumber: 3,
        title: "Splash Time: Upward Toss",
        concept: "Solve the fundamental position equation when y(t) reaches the water level y = -wellDepth.",
        math: [
          `y(t) = y_{\\text{final}} \\implies 0 + (${v0.toFixed(1)})t - \\frac{1}{2}(${g.toFixed(1)})t^2 = -${wellDepth.toFixed(1)}`,
          `${round(0.5 * g, 2)} t^2 - ${v0.toFixed(1)} t - ${wellDepth.toFixed(1)} = 0`,
          `t = \\frac{-(-${v0.toFixed(1)}) \\pm \\sqrt{(-${v0.toFixed(1)})^2 - 4(${round(0.5 * g, 2)})(-${wellDepth.toFixed(1)})}}{2(${round(0.5 * g, 2)})}`,
          `t_{\\text{splash}} = ${round(tSplashUp, 3)}\\text{ s}`
        ],
        explanation: `The positive root yields the physical splash time of t = ${round(tSplashUp, 2)} s. Notice that the stone first returns to the well lip at t = 2 × t_apex = ${round(2 * tApex, 2)} s with velocity -${v0.toFixed(1)} m/s, then takes an additional ${round(tSplashUp - 2 * tApex, 2)} s to reach the water.`
      },
      {
        stepNumber: 4,
        title: "Impact Velocity: Upward Toss",
        concept: "Substitute splash time into the fundamental velocity equation.",
        math: [
          `v_{\\text{impact}} = v_0 + a t_{\\text{splash}}`,
          `v_{\\text{impact}} = ${v0.toFixed(1)} - (${g.toFixed(1)})(${round(tSplashUp, 3)}) = ${round(vImpactUp, 3)}\\text{ m/s}`,
          `|v_{\\text{impact}}| = ${round(Math.abs(vImpactUp), 3)}\\text{ m/s (downward speed)}`
        ],
        explanation: `The negative sign confirms the stone is traveling downward at ${round(Math.abs(vImpactUp), 2)} m/s upon impact.`
      },
      {
        stepNumber: 5,
        title: "Comparison: Downward Toss (v0 = -15 m/s)",
        concept: "What if the raccoon tossed the stone straight down with equal speed?",
        math: [
          `v_0 = -${v0.toFixed(1)}\\text{ m/s}`,
          `-${round(0.5 * g, 2)} t^2 - ${v0.toFixed(1)} t = -${wellDepth.toFixed(1)} \\implies t_{\\text{splash,down}} = ${round(tSplashDown, 3)}\\text{ s}`,
          `v_{\\text{impact,down}} = -${v0.toFixed(1)} - (${g.toFixed(1)})(${round(tSplashDown, 3)}) = ${round(vImpactDown, 3)}\\text{ m/s}`,
          `\\Delta t = t_{\\text{splash,up}} - t_{\\text{splash,down}} = ${round(tSplashUp, 3)} - ${round(tSplashDown, 3)} = ${round(tSplashUp - tSplashDown, 3)}\\text{ s} = 2 t_{\\text{apex}}!`,
          `|v_{\\text{impact,up}}| = |v_{\\text{impact,down}}| = ${round(Math.abs(vImpactUp), 3)}\\text{ m/s}`
        ],
        explanation: `Crucial pedagogical discovery: Both stones strike the water at the EXACT SAME speed (${round(Math.abs(vImpactUp), 2)} m/s)! Why? Because on the way down, the upward stone passes the lip at y = 0 with v = -${v0.toFixed(1)} m/s, identical to the downward stone's initial release. The time difference is exactly 2 × t_apex (${round(2 * tApex, 2)} s)!`
      }
    ];
  }

  // =========================================================================
  // PROBLEM 43: Mountain Climber & Simultaneous Splash
  // =========================================================================
  /**
   * Scenario:
   * Mountain climber stands on cliff of height 50.0 m above water.
   * Origin y = 0 at the water surface, cliff at y0 = 50.0 m.
   * Stone 1 released at t = 0 with v01 = +2.0 m/s.
   * Stone 2 released at t = 1.0 s with v02 such that both splash together!
   */
  function solveProblem43(options = {}) {
    const cliffHeight = typeof options.cliffHeight === 'number' ? Math.abs(options.cliffHeight) : 50.0; // m
    const v01 = typeof options.v01 === 'number' ? options.v01 : 2.0; // m/s (upward)
    const tDelay = typeof options.tDelay === 'number' ? Math.abs(options.tDelay) : 1.0; // s
    const g = typeof options.g === 'number' ? options.g : 9.8; // m/s^2
    const a = -g;
    const y0 = cliffHeight;
    const yWater = 0.0;

    // Stone 1 analysis
    const tApex1 = v01 > 0 ? v01 / g : 0;
    const yApex1 = y0 + v01 * tApex1 + 0.5 * a * tApex1 * tApex1;

    // Splash time for Stone 1: y1(t) = yWater = 0
    // 0.5 * a * t1^2 + v01 * t1 + y0 = 0
    // -0.5 * g * t1^2 + v01 * t1 + cliffHeight = 0
    const quad1 = solveQuadratic(-0.5 * g, v01, cliffHeight);
    const tSplash1 = quad1.positiveRoots.length > 0 ? Math.max(...quad1.positiveRoots) : 0;
    const vImpact1 = v01 + a * tSplash1;
    const speedImpact1 = Math.abs(vImpact1);

    // Stone 2 analysis
    // Stone 2 must splash at t = tSplash1
    // Flight time for Stone 2: deltaT2 = tSplash1 - tDelay
    const deltaT2 = tSplash1 - tDelay;
    let v02 = 0;
    let vImpact2 = 0;
    let isPhysicallyPossible = deltaT2 > 0;

    if (isPhysicallyPossible) {
      // y2(tSplash1) = y0 + v02 * deltaT2 + 0.5 * a * (deltaT2)^2 = 0
      // v02 * deltaT2 = -y0 - 0.5 * a * (deltaT2)^2 = -cliffHeight + 0.5 * g * (deltaT2)^2
      v02 = (-cliffHeight + 0.5 * g * deltaT2 * deltaT2) / deltaT2;
      vImpact2 = v02 + a * deltaT2;
    }

    // State evaluators
    function getState1(t) {
      const clampedT = Math.max(0, Math.min(t, tSplash1));
      const hasSplashed = t >= tSplash1;
      const curY = hasSplashed ? yWater : y0 + v01 * clampedT + 0.5 * a * clampedT * clampedT;
      const curV = v01 + a * clampedT;
      const curA = a;
      return { t: clampedT, y: curY, v: curV, a: curA, hasSplashed, released: true };
    }

    function getState2(t) {
      if (t < tDelay) {
        return { t, y: y0, v: 0, a: 0, hasSplashed: false, released: false };
      }
      const tElapsed = t - tDelay;
      const clampedDeltaT = Math.max(0, Math.min(tElapsed, deltaT2));
      const hasSplashed = t >= tSplash1;
      const curY = hasSplashed ? yWater : y0 + v02 * clampedDeltaT + 0.5 * a * clampedDeltaT * clampedDeltaT;
      const curV = v02 + a * clampedDeltaT;
      const curA = a;
      return { t, y: curY, v: curV, a: curA, hasSplashed, released: true };
    }

    return {
      problemId: 43,
      name: "Mountain Climber & Simultaneous Splash",
      inputs: { cliffHeight, v01, tDelay, g, y0, yWater, a },
      stone1: {
        tApex: tApex1,
        yApex: yApex1,
        tSplash: tSplash1,
        vImpact: vImpact1,
        speedImpact: speedImpact1,
        getState: getState1
      },
      stone2: {
        tRelease: tDelay,
        flightDuration: deltaT2,
        v0: v02,
        v02: v02,
        tSplash: tSplash1,
        vImpact: vImpact2,
        speedImpact: Math.abs(vImpact2),
        isPhysicallyPossible,
        getState: getState2
      },
      steps: generateProblem43Steps({ cliffHeight, v01, tDelay, g, tSplash1, vImpact1, deltaT2, v02, vImpact2 })
    };
  }

  function generateProblem43Steps(data) {
    const { cliffHeight, v01, tDelay, g, tSplash1, vImpact1, deltaT2, v02, vImpact2 } = data;
    return [
      {
        stepNumber: 1,
        title: "Step 1: Set Up the Two-Body Kinematics T-Chart (Stone 1 vs. Stone 2)",
        concept: "Construct a two-column T-chart for the two independent bodies under a shared simultaneous splash constraint.",
        math: [
          `\\text{Origin } y = 0 \\text{ at water level, cliff at } y_0 = +${cliffHeight.toFixed(1)}\\text{ m.}`,
          `\\text{Stone 1: } v_{01} = +${v01.toFixed(1)}\\text{ m/s}, \\quad a = -${g.toFixed(1)}\\text{ m/s}^2, \\quad t_{\\text{release}} = 0.0\\text{ s}`,
          `\\text{Stone 2: } y_0 = +${cliffHeight.toFixed(1)}\\text{ m}, \\quad t_{\\text{release}} = ${tDelay.toFixed(1)}\\text{ s}, \\quad v_{02} = \\text{? (Target Unknown)}`,
          `\\text{Simultaneous Constraint: } t_{\\text{splash,1}} = t_{\\text{delay}} + \\Delta t_2`
        ],
        explanation: `In multi-object kinematics, setting up a side-by-side T-chart is essential. Stone 1 launches at t = 0 s, while Stone 2 is held for ${tDelay.toFixed(1)} s. Both must strike the water simultaneously.`
      },
      {
        stepNumber: 2,
        title: "Solve Stone 1 Splash Time (t_splash1)",
        concept: "Apply the fundamental position equation to determine the exact instant of the splash.",
        math: [
          `y_1(t) = y_0 + v_{01} t + \\frac{1}{2} a t^2 = 0`,
          `${cliffHeight.toFixed(1)} + (${v01.toFixed(1)})t - \\frac{1}{2}(${g.toFixed(1)})t^2 = 0`,
          `${round(0.5 * g, 2)} t^2 - ${v01.toFixed(1)} t - ${cliffHeight.toFixed(1)} = 0`,
          `t_1 = \\frac{${v01.toFixed(1)} + \\sqrt{(${v01.toFixed(1)})^2 - 4(${round(0.5 * g, 2)})(-${cliffHeight.toFixed(1)})}}{2(${round(0.5 * g, 2)})}`,
          `t_1 = ${round(tSplash1, 3)}\\text{ s}`
        ],
        explanation: `Stone 1 remains in the air for ${round(tSplash1, 2)} seconds before striking the water at v = ${round(vImpact1, 2)} m/s.`
      },
      {
        stepNumber: 3,
        title: "Determine Stone 2 Permitted Flight Time",
        concept: "Stone 2 is released at t_delay, so its allowed travel time is Δt2 = t_splash - t_delay.",
        math: [
          `\\Delta t_2 = t_{\\text{splash}} - t_{\\text{delay}}`,
          `\\Delta t_2 = ${round(tSplash1, 3)} - ${tDelay.toFixed(1)} = ${round(deltaT2, 3)}\\text{ s}`
        ],
        explanation: `Because Stone 2 is thrown ${tDelay.toFixed(1)} second later, it has only ${round(deltaT2, 2)} seconds to cover the full vertical drop of ${cliffHeight.toFixed(1)} meters.`
      },
      {
        stepNumber: 4,
        title: "Calculate Stone 2 Required Launch Velocity (v02)",
        concept: "Plug Δt2 into the position equation for Stone 2 and isolate v02.",
        math: [
          `y_2(t_1) = y_0 + v_{02} \\Delta t_2 + \\frac{1}{2} a (\\Delta t_2)^2 = 0`,
          `${cliffHeight.toFixed(1)} + v_{02}(${round(deltaT2, 3)}) - \\frac{1}{2}(${g.toFixed(1)})(${round(deltaT2, 3)})^2 = 0`,
          `v_{02}(${round(deltaT2, 3)}) = -${cliffHeight.toFixed(1)} + ${round(0.5 * g, 2)}(${round(deltaT2, 3)})^2`,
          `v_{02} = \\frac{-${cliffHeight.toFixed(1)} + ${round(0.5 * g * deltaT2 * deltaT2, 3)}}{${round(deltaT2, 3)}} = ${round(v02, 3)}\\text{ m/s}`
        ],
        explanation: `The negative sign confirms that Stone 2 must be thrown DOWNWARD with an initial speed of ${round(Math.abs(v02), 2)} m/s (${round(v02, 2)} m/s).`
      },
      {
        stepNumber: 5,
        title: "Verify Splash Impact Velocities",
        concept: "Compare how fast each stone is traveling at the moment of simultaneous splash.",
        math: [
          `v_1(t_1) = v_{01} + a t_1 = +${v01.toFixed(1)} - (${g.toFixed(1)})(${round(tSplash1, 3)}) = ${round(vImpact1, 3)}\\text{ m/s}`,
          `v_2(t_1) = v_{02} + a \\Delta t_2 = ${round(v02, 3)} - (${g.toFixed(1)})(${round(deltaT2, 3)}) = ${round(vImpact2, 3)}\\text{ m/s}`,
          `|v_2| > |v_1| \\quad (${round(Math.abs(vImpact2), 2)}\\text{ m/s} > ${round(Math.abs(vImpact1), 2)}\\text{ m/s})`
        ],
        explanation: `Both stones strike the water at the exact same clock time t = ${round(tSplash1, 2)} s causing a single unified splash! Stone 2 impacts faster (${round(Math.abs(vImpact2), 2)} m/s) because it was forced to complete the same downward displacement in less time.`
      }
    ];
  }

  // =========================================================================
  // PROBLEM 44: Model Rocket (Two-Interval Kinematics)
  // =========================================================================
  /**
   * Scenario:
   * Model rocket launched vertically upward from ground (y0 = 0 m).
   * v0 = +50.0 m/s.
   * Net upward acceleration during powered burn: aBoost = +2.0 m/s^2.
   * Powered flight continues until burnout altitude y1 = 150.0 m.
   * Then motor cuts off, rocket enters free fall under gravity (a = -g = -9.8 m/s^2).
   * Coasts up to apex, then plummets back to ground y = 0 m.
   */
  function solveProblem44(options = {}) {
    const v0 = typeof options.v0 === 'number' ? options.v0 : 50.0; // m/s
    const aBoost = typeof options.aBoost === 'number' ? options.aBoost : 2.0; // m/s^2
    const burnoutAlt = typeof options.burnoutAltitude === 'number' ? Math.abs(options.burnoutAltitude) : 150.0; // m
    const g = typeof options.g === 'number' ? options.g : 9.8; // m/s^2
    const aFreeFall = -g;

    // Interval 1: Powered Flight (0 <= t <= tBurn)
    // v_burn^2 = v0^2 + 2 * aBoost * burnoutAlt
    const vBurnSquared = v0 * v0 + 2 * aBoost * burnoutAlt;
    const vBurn = Math.sqrt(Math.max(0, vBurnSquared));
    // tBurn = (vBurn - v0) / aBoost
    const tBurn = (vBurn - v0) / aBoost;

    // Interval 2: Free Fall Coast to Apex (tBurn <= t <= tApex)
    // v(tApex) = 0 => vBurn + aFreeFall * deltaTApex = 0 => deltaTApex = vBurn / g
    const deltaTApex = vBurn / g;
    const tApex = tBurn + deltaTApex;
    // yApex = burnoutAlt + (vBurn^2) / (2 * g)
    const yApex = burnoutAlt + (vBurnSquared / (2 * g));

    // Interval 3: Free Fall from Apex to Ground (or from Burnout to Ground)
    // From burnout: y(tau) = burnoutAlt + vBurn * tau - 0.5 * g * tau^2 = 0
    // -0.5 * g * tau^2 + vBurn * tau + burnoutAlt = 0
    const quadImpact = solveQuadratic(-0.5 * g, vBurn, burnoutAlt);
    const tauImpact = quadImpact.positiveRoots.length > 0 ? Math.max(...quadImpact.positiveRoots) : 0;
    const tImpact = tBurn + tauImpact;
    const vImpact = vBurn + aFreeFall * tauImpact;
    const speedImpact = Math.abs(vImpact);

    // Dynamic state evaluator across all intervals
    function getState(t) {
      if (t <= 0) {
        return { t: 0, y: 0, v: v0, a: aBoost, phase: 'boost', engineOn: true, landed: false };
      }
      if (t <= tBurn) {
        // Boost Phase
        const curY = v0 * t + 0.5 * aBoost * t * t;
        const curV = v0 + aBoost * t;
        const curA = aBoost;
        return { t, y: curY, v: curV, a: curA, phase: 'boost', engineOn: true, landed: false };
      }
      if (t <= tImpact) {
        // Free Fall Phase
        const tau = t - tBurn;
        const curY = burnoutAlt + vBurn * tau + 0.5 * aFreeFall * tau * tau;
        const curV = vBurn + aFreeFall * tau;
        const curA = aFreeFall;
        const isAscending = curV > 0;
        return {
          t,
          y: Math.max(0, curY),
          v: curV,
          a: curA,
          phase: isAscending ? 'coast_up' : 'fall_down',
          engineOn: false,
          landed: false
        };
      }
      // Landed - retain final impact velocity & acceleration at end of trajectory
      const tauImpact = tImpact - tBurn;
      const vImpact = vBurn + aFreeFall * tauImpact;
      return { t: tImpact, y: 0, v: vImpact, a: aFreeFall, phase: 'landed', engineOn: false, landed: true };
    }

    return {
      problemId: 44,
      name: "Model Rocket Two-Interval Kinematics",
      inputs: { v0, aBoost, burnoutAltitude: burnoutAlt, g, aFreeFall },
      phase1: {
        name: "Powered Boost Stage",
        tEnd: tBurn,
        duration: tBurn,
        altitudeEnd: burnoutAlt,
        vEnd: vBurn,
        a: aBoost
      },
      phase2: {
        name: "Free Fall Stage",
        tApex,
        deltaTApex,
        altitudeApex: yApex,
        tImpact,
        vImpact,
        speedImpact,
        a: aFreeFall
      },
      getState,
      steps: generateProblem44Steps({ v0, aBoost, burnoutAlt, g, vBurn, tBurn, deltaTApex, tApex, yApex, tImpact, vImpact })
    };
  }

  function generateProblem44Steps(data) {
    const { v0, aBoost, burnoutAlt, g, vBurn, tBurn, deltaTApex, tApex, yApex, tImpact, vImpact } = data;
    return [
      {
        stepNumber: 1,
        title: "Step 1: Set Up the Two-Interval Kinematics T-Chart (Boost vs. Free Fall)",
        concept: "Segment motion into two distinct constant-acceleration intervals separated by engine burnout. Interval 1 has engine thrust; Interval 2 is pure gravitational free fall.",
        math: [
          `\\text{Interval 1 (Powered Boost): } y_0 = 0\\text{ m}, \\quad v_0 = +${v0.toFixed(1)}\\text{ m/s}, \\quad a_1 = +${aBoost.toFixed(1)}\\text{ m/s}^2`,
          `\\text{Burnout Altitude: } y_{\\text{burn}} = ${burnoutAlt.toFixed(1)}\\text{ m (engine cuts off here)}`,
          `\\text{State Continuity: } v_{\\text{burn}}^2 = v_0^2 + 2 a_1 (y_{\\text{burn}} - y_0) = (${v0.toFixed(1)})^2 + 2(+${aBoost.toFixed(1)})(${burnoutAlt.toFixed(1)}) = ${round(vBurn * vBurn, 1)}`,
          `v_{\\text{burn}} = \\sqrt{${round(vBurn * vBurn, 1)}} = ${round(vBurn, 3)}\\text{ m/s (becomes initial velocity for Interval 2!)}`
        ],
        explanation: `In multi-stage motion, constructing a two-column T-chart separates the constant-acceleration stages. At burnout (y = ${burnoutAlt.toFixed(1)} m), the rocket's velocity of ${round(vBurn, 2)} m/s is handed off as the initial velocity for the gravitational free-fall stage.`
      },
      {
        stepNumber: 2,
        title: "Burnout Time (t_burn)",
        concept: "Find the duration of Interval 1 from the fundamental velocity equation.",
        math: [
          `v(t) = v_0 + a_1 t \\implies ${round(vBurn, 3)} = ${v0.toFixed(1)} + (${aBoost.toFixed(1)}) t_{\\text{burn}}`,
          `t_{\\text{burn}} = \\frac{${round(vBurn, 3)} - ${v0.toFixed(1)}}{${aBoost.toFixed(1)}} = ${round(tBurn, 3)}\\text{ s}`
        ],
        explanation: `The engine fires for ${round(tBurn, 2)} seconds before exhausting its fuel.`
      },
      {
        stepNumber: 3,
        title: "Interval 2 Setup: Free Fall Coast to Apex",
        concept: `After burnout, ONLY gravity acts on the rocket: a2 = -g = -${g.toFixed(1)} m/s². The rocket coasts upward until v = 0.`,
        math: [
          `\\text{New interval clock: } \\tau = t - t_{\\text{burn}}`,
          `v(\\tau) = v_{\\text{burn}} - g \\tau \\implies 0 = ${round(vBurn, 3)} - (${g.toFixed(1)}) \\Delta t_{\\text{apex}}`,
          `\\Delta t_{\\text{apex}} = \\frac{${round(vBurn, 3)}}{${g.toFixed(1)}} = ${round(deltaTApex, 3)}\\text{ s}`,
          `t_{\\text{apex,total}} = t_{\\text{burn}} + \\Delta t_{\\text{apex}} = ${round(tBurn, 3)} + ${round(deltaTApex, 3)} = ${round(tApex, 3)}\\text{ s}`
        ],
        explanation: `The rocket coasts upward for another ${round(deltaTApex, 2)} seconds under gravity, reaching maximum altitude at clock time t = ${round(tApex, 2)} s.`
      },
      {
        stepNumber: 4,
        title: "Maximum Altitude (Apex)",
        concept: "Calculate peak altitude by adding the free-fall coast distance to the burnout altitude.",
        math: [
          `y_{\\text{apex}} = y_{\\text{burn}} + v_{\\text{burn}} \\Delta t_{\\text{apex}} - \\frac{1}{2} g (\\Delta t_{\\text{apex}})^2`,
          `y_{\\text{apex}} = ${burnoutAlt.toFixed(1)} + \\frac{v_{\\text{burn}}^2}{2 g} = ${burnoutAlt.toFixed(1)} + \\frac{${round(vBurn * vBurn, 1)}}{${round(2 * g, 1)}} = +${round(yApex, 3)}\\text{ m}`
        ],
        explanation: `The rocket ascends an extra ${round(yApex - burnoutAlt, 2)} m during coasting, achieving a peak height of +${round(yApex, 2)} m.`
      },
      {
        stepNumber: 5,
        title: "Total Flight Time & Impact Velocity",
        concept: "Solve for ground return y(t) = 0 and final impact speed.",
        math: [
          `y(\\tau) = y_{\\text{burn}} + v_{\\text{burn}} \\tau - \\frac{1}{2} g \\tau^2 = 0`,
          `-${round(0.5 * g, 2)} \\tau^2 + ${round(vBurn, 3)} \\tau + ${burnoutAlt.toFixed(1)} = 0 \\implies \\tau_{\\text{impact}} = ${round(tImpact - tBurn, 3)}\\text{ s}`,
          `t_{\\text{impact,total}} = t_{\\text{burn}} + \\tau_{\\text{impact}} = ${round(tBurn, 3)} + ${round(tImpact - tBurn, 3)} = ${round(tImpact, 3)}\\text{ s}`,
          `v_{\\text{impact}} = v_{\\text{burn}} - g \\tau_{\\text{impact}} = ${round(vImpact, 3)}\\text{ m/s} \\quad (|v| = ${round(Math.abs(vImpact), 2)}\\text{ m/s})`
        ],
        explanation: `The rocket crashes back to Earth at t = ${round(tImpact, 2)} s with a devastating impact velocity of ${round(vImpact, 2)} m/s (${round(Math.abs(vImpact) * 3.6, 1)} km/h).`
      }
    ];
  }

  // =========================================================================
  // GENERIC / SANDBOX 1D KINEMATICS
  // =========================================================================
  function solveGenericSandbox(options = {}) {
    const y0 = typeof options.y0 === 'number' ? options.y0 : 50.0;
    const v0 = typeof options.v0 === 'number' ? options.v0 : 15.0;
    const g = typeof options.g === 'number' ? Math.max(0, options.g) : 9.8;
    const groundY = typeof options.groundY === 'number' ? options.groundY : 0.0;
    const a = -g;

    const tApex = (g > 1e-6 && v0 > 0) ? v0 / g : 0;
    const yApex = (g > 1e-6 && v0 > 0) ? y0 + (v0 * v0) / (2 * g) : y0;

    let tImpact = Infinity;
    let vImpact = v0;

    if (g > 1e-6) {
      // y(t) = y0 + v0*t - 0.5*g*t^2 = groundY
      const quad = solveQuadratic(-0.5 * g, v0, y0 - groundY);
      if (quad.positiveRoots.length > 0) {
        tImpact = Math.max(...quad.positiveRoots);
        vImpact = v0 + a * tImpact;
      }
    } else {
      // Zero-G motion: y(t) = y0 + v0*t
      if (Math.abs(v0) > 1e-6) {
        const tHit = (groundY - y0) / v0;
        if (tHit >= 0) {
          tImpact = tHit;
          vImpact = v0;
        }
      }
    }

    function getState(t) {
      const clampedT = isFinite(tImpact) ? Math.min(t, tImpact) : t;
      const hasLanded = isFinite(tImpact) && t >= tImpact;
      const curY = hasLanded ? groundY : y0 + v0 * clampedT + 0.5 * a * clampedT * clampedT;
      const curV = v0 + a * clampedT;
      const curA = a;
      return { t: clampedT, y: curY, v: curV, a: curA, hasLanded };
    }

    return {
      problemId: 'sandbox',
      name: "Free Fall Sandbox",
      inputs: { y0, v0, g, a, groundY },
      tApex,
      yApex,
      tImpact,
      vImpact,
      speedImpact: Math.abs(vImpact),
      getState,
      steps: generateSandboxSteps({ y0, v0, g, a, groundY, tApex, yApex, tImpact, vImpact })
    };
  }

  function generateSandboxSteps(data) {
    const { y0, v0, g, groundY, tApex, yApex, tImpact, vImpact } = data;
    return [
      {
        stepNumber: 1,
        title: "Step 1: Set Up the Kinematics T-Chart (Knowns & Target Milestones)",
        concept: "Construct a two-column T-chart separating given initial kinematics parameters from target unknowns.",
        math: [
          `\\text{Given: } y_0 = ${y0.toFixed(1)}\\text{ m}, \\quad v_0 = ${v0 >= 0 ? '+' : ''}${v0.toFixed(1)}\\text{ m/s}, \\quad a = -g = -${g.toFixed(2)}\\text{ m/s}^2`,
          `\\text{Target Ground Level: } y_{\\text{ground}} = ${groundY.toFixed(1)}\\text{ m}`
        ],
        explanation: `In standard problem-solving, Step 1 organizes initial parameters in Column 1 and target kinematics milestones (apex, time in air, landing speed) in Column 2.`
      },
      {
        stepNumber: 2,
        title: "Velocity Equation & Apex Determination",
        concept: "v(t) = v0 + a*t. At apex, vertical velocity equals 0.",
        math: [
          `v(t) = ${v0 >= 0 ? '+' : ''}${v0.toFixed(1)} - (${g.toFixed(2)}) t`,
          v0 > 0 && g > 0 ? `t_{\\text{apex}} = \\frac{${v0.toFixed(1)}}{${g.toFixed(2)}} = ${round(tApex, 3)}\\text{ s}` : `\\text{No apex above launch point (v0 } \\le 0\\text{ or g = 0)}`,
          v0 > 0 && g > 0 ? `y_{\\text{apex}} = ${y0.toFixed(1)} + \\frac{(${v0.toFixed(1)})^2}{2(${g.toFixed(2)})} = ${round(yApex, 3)}\\text{ m}` : `y_{\\text{max}} = ${y0.toFixed(1)}\\text{ m}`
        ],
        explanation: v0 > 0 && g > 0
          ? `The object rises for ${round(tApex, 2)} s to a peak altitude of ${round(yApex, 2)} m before falling.`
          : `Because v0 <= 0 or g = 0, the object does not experience a turning apex above its starting position.`
      },
      {
        stepNumber: 3,
        title: "Position Equation & Ground Impact",
        concept: "y(t) = y0 + v0*t + 0.5*a*t^2 = groundY.",
        math: [
          `y(t) = ${y0.toFixed(1)} + (${v0.toFixed(1)})t - ${round(0.5 * g, 3)} t^2 = ${groundY.toFixed(1)}`,
          isFinite(tImpact)
            ? `t_{\\text{impact}} = ${round(tImpact, 3)}\\text{ s}`
            : `\\text{Object never reaches ground under current conditions}`,
          isFinite(tImpact)
            ? `v_{\\text{impact}} = ${v0.toFixed(1)} - (${g.toFixed(2)})(${round(tImpact, 3)}) = ${round(vImpact, 3)}\\text{ m/s}`
            : `\\text{N/A}`
        ],
        explanation: isFinite(tImpact)
          ? `The object lands after ${round(tImpact, 2)} seconds at an impact speed of ${round(Math.abs(vImpact), 2)} m/s.`
          : `The trajectory does not intersect the ground plane.`
      }
    ];
  }

  // =========================================================================
  // STROBE & MOTION DIAGRAM GENERATOR
  // =========================================================================
  /**
   * Generates discrete strobe positions at equal time intervals Δt
   */
  function generateStrobeDiagram(stateGetter, tTotal, dt = 0.2) {
    const flashes = [];
    const numFlashes = Math.min(100, Math.floor(tTotal / dt));
    for (let i = 0; i <= numFlashes; i++) {
      const t = i * dt;
      const state = stateGetter(t);
      flashes.push({
        index: i,
        t: round(t, 3),
        y: round(state.y, 3),
        v: round(state.v, 3),
        a: round(state.a, 3)
      });
    }
    // Also include final impact point if not already exactly at end
    if (tTotal > 0 && Math.abs(flashes[flashes.length - 1].t - tTotal) > 1e-3) {
      const finalState = stateGetter(tTotal);
      flashes.push({
        index: flashes.length,
        t: round(tTotal, 3),
        y: round(finalState.y, 3),
        v: round(finalState.v, 3),
        a: round(finalState.a, 3)
      });
    }
    return flashes;
  }

  // =========================================================================
  // CORNELL 1D KINEMATICS T-CHART DATA
  // =========================================================================
  function getCornellTChartData() {
    return {
      title: "Cornell 1D Kinematics Framework",
      subtitle: "The Three Essential Pillars of 1D Free Fall",
      columns: [
        {
          id: "conventions",
          header: "1. Direction & Sign Conventions",
          badge: "Spatial Orientation",
          color: "#0f7e9b",
          items: [
            {
              term: "Upward is Positive (+y)",
              detail: "Any velocity pointing upward is positive (v > 0). Any displacement above origin is positive (y > 0)."
            },
            {
              term: "Downward is Negative (-y)",
              detail: "Downward velocity is negative (v < 0). Displacements below the reference origin are negative (y < 0)."
            },
            {
              term: "Gravity Acceleration is ALWAYS Downward",
              detail: "Near Earth, a = -g = -9.8 m/s² (or -10 m/s²) at EVERY POINT in flight—even at the apex where v = 0!"
            },
            {
              term: "Displacement vs. Distance",
              detail: "Δy = y_final - y_initial is vector displacement. Distance traveled is the scalar path length."
            }
          ]
        },
        {
          id: "time",
          header: "2. The Universal Time Clock (t)",
          badge: "Continuous Parameter",
          color: "#d67b19",
          items: [
            {
              term: "Scalar & Monotonically Increasing",
              detail: "Time t never runs backward and has no direction: Δt > 0 always. It synchronizes all equations."
            },
            {
              term: "Symmetry of Free Fall",
              detail: "Between any two symmetric altitudes: time up equals time down (t_rise = t_fall). Total round trip t = 2 * t_apex."
            },
            {
              term: "Interval Clocks",
              detail: "In multi-stage motion (like rockets), use elapsed clock τ = t - t_stage to isolate constant acceleration intervals."
            },
            {
              term: "Independent of Mass",
              detail: "In vacuum free fall, heavy and light objects fall with identical time equations regardless of mass (Galileo's principle)."
            }
          ]
        },
        {
          id: "laws",
          header: "3. Fundamental Kinematic Laws",
          badge: "No Magic Shortcuts",
          color: "#095f76",
          items: [
            {
              term: "Law I: Velocity Evolution",
              formula: "v(t) = v_0 + a \\cdot t",
              detail: "Defines the linear slope on a v-t graph. Acceleration is the rate of velocity change: a = dv/dt."
            },
            {
              term: "Law II: Position Evolution",
              formula: "y(t) = y_0 + v_0 \\cdot t + \\frac{1}{2} a \\cdot t^2",
              detail: "Parabolic trajectory in y-t graph. The 1/2*a*t² term represents area under the changing velocity triangle."
            },
            {
              term: "Law III: Turning Point (Apex)",
              formula: "v(t_{\\text{apex}}) = 0 \\implies t_{\\text{apex}} = -\\frac{v_0}{a}",
              detail: "Maximum height occurs when upward velocity is completely exhausted by gravity before reversing direction."
            },
            {
              term: "Law IV: Torricelli Relation",
              formula: "v^2 = v_0^2 + 2 a \\Delta y",
              detail: "Derived by eliminating t between Laws I & II. Connects kinetic energy work to gravitational work directly."
            }
          ]
        }
      ]
    };
  }

  // =========================================================================
  // DYNAMIC SCENARIO KINEMATICS T-CHART DATA (PROBLEM-SOLVING SETUP)
  // =========================================================================
  function getScenarioTChart(mode, options = {}) {
    if (mode === "p42") {
      const p = solveProblem42(options);
      const opt = p.inputs;
      return {
        mode: "p42",
        title: "Kinematics T-Chart: The Well Toss (Symmetry & Splash)",
        col1Header: "Upward Toss (+v₀)",
        col2Header: "Downward Throw (-v₀)",
        bridgeTitle: "Kinematic Symmetry Link",
        bridgeTag: "Symmetry",
        bridgeSummary: `At the well lip (y = 0) on the downward journey, the upward stone has v = -${opt.v0.toFixed(1)} m/s, identical to the downward stone's initial release! Both splash at identical speed: ${round(Math.abs(p.upward.vImpact), 2)} m/s. Flight time difference Δt = 2 × t_apex = ${round(2 * p.tApex, 2)} s.`,
        rows: [
          { symbol: "y₀", label: "Initial Height", col1: "0.0 m (lip)", col2: "0.0 m (lip)" },
          { symbol: "y_f", label: "Water Level", col1: `-${opt.wellDepth.toFixed(1)} m`, col2: `-${opt.wellDepth.toFixed(1)} m` },
          { symbol: "Δy", label: "Displacement", col1: `-${opt.wellDepth.toFixed(1)} m`, col2: `-${opt.wellDepth.toFixed(1)} m` },
          { symbol: "v₀", label: "Initial Velocity", col1: `+${opt.v0.toFixed(1)} m/s`, col2: `-${opt.v0.toFixed(1)} m/s` },
          { symbol: "a", label: "Acceleration", col1: `-${opt.g.toFixed(1)} m/s²`, col2: `-${opt.g.toFixed(1)} m/s²` },
          { symbol: "t_apex", label: "Time to Apex", col1: `${round(p.tApex, 2)} s`, col2: "— (none)" },
          { symbol: "y_max", label: "Peak Altitude", col1: `+${round(p.yApex, 2)} m`, col2: "0.0 m (lip)" },
          { symbol: "t_splash", label: "Splash Time", col1: `${round(p.upward.tSplash, 2)} s`, col2: `${round(p.downward.tSplash, 2)} s` },
          { symbol: "v_impact", label: "Splash Velocity", col1: `${round(p.upward.vImpact, 2)} m/s`, col2: `${round(p.downward.vImpact, 2)} m/s` }
        ]
      };
    } else if (mode === "p43") {
      const p = solveProblem43(options);
      const opt = p.inputs;
      return {
        mode: "p43",
        title: "Kinematics T-Chart: Simultaneous Splash (Stone 1 vs. Stone 2)",
        col1Header: "Stone 1 (Lead Drop, t = 0 s)",
        col2Header: `Stone 2 (Delayed Throw, t = ${round(opt.tDelay, 1)} s)`,
        bridgeTitle: "Simultaneous Splash Constraint",
        bridgeTag: "Synchronized",
        bridgeSummary: `Single splash occurs at water level (y = 0 m) at clock time t = ${round(p.stone1.tSplash, 2)} s. Stone 2 is launched with a ${round(opt.tDelay, 1)} s delay, leaving only Δt = ${round(p.stone2.flightDuration, 2)} s of flight time. Required initial launch velocity: v₀₂ = ${round(p.stone2.v02, 2)} m/s.`,
        rows: [
          { symbol: "y₀", label: "Cliff Height", col1: `+${opt.cliffHeight.toFixed(1)} m`, col2: `+${opt.cliffHeight.toFixed(1)} m` },
          { symbol: "y_f", label: "Water Level", col1: "0.0 m", col2: "0.0 m" },
          { symbol: "Δy", label: "Displacement", col1: `-${opt.cliffHeight.toFixed(1)} m`, col2: `-${opt.cliffHeight.toFixed(1)} m` },
          { symbol: "t_rel", label: "Release Clock Time", col1: "0.00 s", col2: `${round(opt.tDelay, 2)} s` },
          { symbol: "v₀", label: "Initial Velocity", col1: `+${opt.v01.toFixed(1)} m/s`, col2: `${round(p.stone2.v02, 2)} m/s` },
          { symbol: "a", label: "Acceleration", col1: `-${opt.g.toFixed(1)} m/s²`, col2: `-${opt.g.toFixed(1)} m/s²` },
          { symbol: "Δt", label: "Flight Duration", col1: `${round(p.stone1.tSplash, 2)} s`, col2: `${round(p.stone2.flightDuration, 2)} s` },
          { symbol: "t_splash", label: "Splash Clock Time", col1: `${round(p.stone1.tSplash, 2)} s`, col2: `${round(p.stone1.tSplash, 2)} s (Simultaneous!)` },
          { symbol: "v_impact", label: "Splash Velocity", col1: `${round(p.stone1.vImpact, 2)} m/s`, col2: `${round(p.stone2.vImpact, 2)} m/s` }
        ]
      };
    } else if (mode === "p44") {
      const p = solveProblem44(options);
      const opt = p.inputs;
      return {
        mode: "p44",
        title: "Kinematics T-Chart: Two-Interval Motion (Boost vs. Free Fall)",
        col1Header: "Interval 1: Powered Boost Stage",
        col2Header: "Interval 2: Free Fall Coast & Plummet",
        bridgeTitle: "State Hand-Off Continuity",
        bridgeTag: "Continuity",
        bridgeSummary: `At engine burnout (altitude y = ${round(p.phase1.altitudeEnd, 1)} m, clock time t = ${round(p.phase1.tEnd, 2)} s), the final velocity of Interval 1 (v = +${round(p.phase1.vEnd, 2)} m/s) becomes the initial velocity for Interval 2! Acceleration shifts from +${opt.aBoost.toFixed(1)} m/s² to -${opt.g.toFixed(1)} m/s².`,
        rows: [
          { symbol: "y_start", label: "Stage Start Altitude", col1: "0.0 m (Launchpad)", col2: `+${round(p.phase1.altitudeEnd, 1)} m (Burnout)` },
          { symbol: "y_end", label: "Stage End Altitude", col1: `+${round(p.phase1.altitudeEnd, 1)} m (Burnout)`, col2: "0.0 m (Ground Impact)" },
          { symbol: "v_start", label: "Initial Velocity", col1: `+${opt.v0.toFixed(1)} m/s`, col2: `+${round(p.phase1.vEnd, 2)} m/s` },
          { symbol: "v_end", label: "Final Velocity", col1: `+${round(p.phase1.vEnd, 2)} m/s`, col2: `${round(p.phase2.vImpact, 2)} m/s` },
          { symbol: "a", label: "Net Acceleration", col1: `+${opt.aBoost.toFixed(1)} m/s² (Thrust)`, col2: `-${opt.g.toFixed(1)} m/s² (Gravity)` },
          { symbol: "Δt", label: "Stage Duration", col1: `${round(p.phase1.duration, 2)} s`, col2: `${round(p.phase2.tImpact - p.phase1.tEnd, 2)} s` },
          { symbol: "t_clock", label: "Clock Time at End", col1: `${round(p.phase1.tEnd, 2)} s`, col2: `${round(p.phase2.tImpact, 2)} s` },
          { symbol: "y_max", label: "Peak Altitude", col1: "— (Still accelerating)", col2: `+${round(p.phase2.altitudeApex, 2)} m (at t = ${round(p.phase2.tApex, 2)} s)` }
        ]
      };
    } else {
      const p = solveGenericSandbox(options);
      const opt = p.inputs;
      return {
        mode: "sandbox",
        title: "Kinematics T-Chart: 1D Free Fall Parameters",
        col1Header: "Known / Given Parameters",
        col2Header: "Calculated Kinematic Milestones",
        bridgeTitle: "Universal Kinematic Laws",
        bridgeTag: "Kinematics",
        bridgeSummary: "Velocity evolves linearly: v(t) = v₀ + at. Position evolves quadratically: y(t) = y₀ + v₀t + ½at². At apex, vertical velocity momentarily reaches v = 0.",
        rows: [
          { symbol: "y₀", label: "Initial Height", col1: `${opt.y0.toFixed(1)} m`, col2: `Apex Height: ${isFinite(p.yApex) ? round(p.yApex, 2) + " m" : "—"}` },
          { symbol: "v₀", label: "Initial Velocity", col1: `${opt.v0 >= 0 ? "+" : ""}${opt.v0.toFixed(1)} m/s`, col2: `Rise Time: ${isFinite(p.tApex) ? round(p.tApex, 2) + " s" : "—"}` },
          { symbol: "a", label: "Acceleration", col1: `-${opt.g.toFixed(2)} m/s²`, col2: `Total Flight Time: ${isFinite(p.tImpact) ? round(p.tImpact, 2) + " s" : "—"}` },
          { symbol: "Signs", label: "Orientation", col1: "+y Up, -y Down", col2: `Impact Velocity: ${isFinite(p.vImpact) ? round(p.vImpact, 2) + " m/s" : "—"}` }
        ]
      };
    }
  }

  // Public exports
  return {
    round,
    solveQuadratic,
    solveProblem42,
    solveProblem43,
    solveProblem44,
    solveGenericSandbox,
    generateStrobeDiagram,
    getCornellTChartData,
    getScenarioTChart
  };
}));
