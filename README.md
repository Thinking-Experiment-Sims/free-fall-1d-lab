# Free Fall 1D Kinematics Studio

**The Thinking Experiment (PhysicsKit)** &bull; Unit 1 Packet 6 §6.1 Free Fall

A production-ready, interactive virtual laboratory and pedagogical solver for one-dimensional vertical kinematics, sign conventions, time symmetry, multi-body simultaneous free fall, and two-interval rocket dynamics.

🌐 **Live Lab:** [https://thinking-experiment-sims.github.io/free-fall-1d-lab/](https://thinking-experiment-sims.github.io/free-fall-1d-lab/)  
🎯 **Simulation Hub:** [https://thinking-experiment-sims.github.io/interactive-physics/](https://thinking-experiment-sims.github.io/interactive-physics/)

---

## 🎨 Strict Design System Compliance

This simulation strictly implements **The Thinking Experiment Brand Guidelines**:
- **Primary Teal:** `#0f7e9b` (Headers, primary actions, positive vertical direction)
- **Primary Teal Dark:** `#095f76`
- **Primary Teal Light:** `#e6f4f8`
- **Accent Amber:** `#d67b19` (Key numerical highlights, secondary comparison stone, rocket flame)
- **Background:** Pure White `#ffffff`, Blueprint Grid `#e9f4fb` / `#fff4dd`
- **High-Contrast Text:** `#123140`
- **Strictly Prohibited:** Zero Purple (`#59118e`) and Zero Gold (`#ffc61e`)
- **Layout:** Card-based, clean, minimal, responsive, with **zero horizontal scrolling**.

---

## 🔬 Core Pedagogical Scenarios (Unit 1 Packet 6)

### 1. Problem 42: The Raccoon & The Well
- **Setup:** A raccoon tosses a stone upwards ($v_0 = +15.0\text{ m/s}$) from the well lip ($y_0 = 0\text{ m}$) into a $20.0\text{ m}$ deep well ($y_{\text{splash}} = -20.0\text{ m}$).
- **Core Derivations:**
  - $t_{\text{apex}} = \frac{v_0}{g} = \frac{15.0}{9.8} \approx 1.531\text{ s}$
  - $y_{\text{apex}} = 0 + v_0 t_{\text{apex}} - \frac{1}{2} g t_{\text{apex}}^2 = +11.480\text{ m}$ above lip ($31.48\text{ m}$ above water)
  - Splash time solved from $y(t) = -20.0\text{ m} \implies t_{\text{splash}} = \frac{15 + \sqrt{617}}{9.8} \approx 4.065\text{ s}$
  - Impact velocity: $v_{\text{impact}} = 15 - 9.8(4.065) = -24.84\text{ m/s}$ (speed $= 24.84\text{ m/s}$)
- **Pedagogical Discovery (Comparison with $v_0 = -15.0\text{ m/s}$):**
  - A stone tossed straight down at $-15\text{ m/s}$ splashes at $t = \frac{-15 + \sqrt{617}}{9.8} \approx 1.004\text{ s}$ with $v_{\text{impact}} = -24.84\text{ m/s}$.
  - **Symmetry Principle:** Both throws strike the water at the **EXACT SAME speed** ($24.84\text{ m/s}$).
  - Time difference is precisely $2 \cdot t_{\text{apex}} \approx 3.061\text{ s}$, because the upward throw passes $y = 0$ on its way down at $t = 2 t_{\text{apex}}$ with $v = -15\text{ m/s}$!

---

### 2. Problem 43: Mountain Climber & Simultaneous Splash
- **Setup:** A climber stands on a $50.0\text{ m}$ cliff above water ($y_0 = 50.0\text{ m}$, water at $y = 0\text{ m}$).
- **Stone 1:** Released at $t = 0\text{ s}$ with $v_{01} = +2.0\text{ m/s}$.
  - $y_1(t) = 50 + 2t - 4.9t^2 = 0 \implies t_1 = \frac{2 + \sqrt{984}}{9.8} \approx 3.405\text{ s}$.
  - Impact velocity: $v_1 = -\sqrt{984} \approx -31.37\text{ m/s}$.
- **Stone 2:** Released at $t = 1.0\text{ s}$ ($\Delta t = 1.0\text{ s}$ delay).
  - Allowed flight duration: $\Delta t_2 = 3.405 - 1.0 = 2.405\text{ s}$.
  - Required launch speed:
    $$y_2(t_1) = 50 + v_{02} \Delta t_2 - \frac{1}{2} g (\Delta t_2)^2 = 0 \implies v_{02} = \frac{-50 + 4.9(2.405)^2}{2.405} \approx -9.01\text{ m/s}$$
  - Negative sign proves Stone 2 **must be thrown downward** at $9.01\text{ m/s}$ to achieve the simultaneous splash!

---

### 3. Problem 44: Model Rocket Two-Interval Kinematics
- **Stage 1 (Powered Boost):** Launch at $v_0 = +50.0\text{ m/s}$, engine accelerates upward at $a_1 = +2.0\text{ m/s}^2$ until altitude $y_1 = 150.0\text{ m}$.
  - Burnout speed: $v_1 = \sqrt{v_0^2 + 2 a_1 y_1} = \sqrt{2500 + 600} = \sqrt{3100} \approx 55.68\text{ m/s}$.
  - Burn duration: $t_{\text{burn}} = \frac{v_1 - v_0}{a_1} = \frac{55.68 - 50}{2} \approx 2.839\text{ s}$.
- **Stage 2 (Free Fall Coast & Impact):** Engine shuts down, rocket enters free fall ($a_2 = -g = -9.8\text{ m/s}^2$).
  - Coast time to apex: $\Delta t_{\text{apex}} = \frac{v_1}{g} \approx 5.681\text{ s} \implies t_{\text{apex}} = 2.839 + 5.681 \approx 8.520\text{ s}$.
  - Maximum altitude: $y_{\text{apex}} = 150 + \frac{3100}{19.6} \approx 308.16\text{ m}$.
  - Impact with ground ($y = 0$): $t_{\text{impact}} \approx 16.451\text{ s}$ with $v_{\text{impact}} = -\sqrt{6040} \approx -77.72\text{ m/s}$ ($280\text{ km/h}$).

---

### 4. Free Fall Sandbox Mode
- Real-time physics exploration with arbitrary initial height $y_0$ ($-30\text{ m}$ to $+250\text{ m}$), velocity $v_0$ ($-40\text{ m/s}$ to $+50\text{ m/s}$), and planetary gravity presets:
  - **Earth Standard:** $g = 9.8\text{ m/s}^2$
  - **Earth Exam Clean:** $g = 10.0\text{ m/s}^2$
  - **Moon:** $g = 1.62\text{ m/s}^2$
  - **Mars:** $g = 3.71\text{ m/s}^2$
  - **Zero-G:** $g = 0.0\text{ m/s}^2$ (pure constant velocity straight lines)

---

## 📊 Real-Time Stacked Kinematic Graphs

Synchronized, high-DPI triple stacked plots:
1. **$y(t)$ [m] vs. $t$ [s]:** Parabolic arc with labeled apex turning point and impact roots.
2. **$v(t)$ [m/s] vs. $t$ [s]:** Linear velocity slope ($= a$). Zero-crossing highlights the apex clock time.
3. **$a(t)$ [m/s²] vs. $t$ [s]:** Constant gravitational acceleration line (or step function for rocket).
- **Interactive Scrubber:** Scrub playhead directly across the canvas or slider; live indicators update across all plots simultaneously.

---

## 🧪 Unit Testing

Unit tests are written using Node.js built-in test runner (`node:test` and `node:assert/strict`):

```bash
npm test
```

Tests cover:
- Quadratic equation solver (two roots, linear degeneracies, non-real roots)
- Problem 42 analytical results and velocity symmetry proofs
- Problem 43 simultaneous splash times and required $v_{02}$
- Problem 44 two-interval state continuity across engine cutoff
- Sandbox Zero-G and gravitational variations
- Strobe motion diagram generator
- Cornell T-Chart structure and strict color prohibition compliance

---

## 👤 Author & License

Authored by **Vladimir Lopez** for **The Thinking Experiment (PhysicsKit)**.  
Licensed under the ISC License.
