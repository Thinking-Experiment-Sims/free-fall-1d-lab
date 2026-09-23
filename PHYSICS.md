# Physics Guide: 1D Free Fall Kinematics & Vertical Motion

A comprehensive theoretical and pedagogical guide for **The Thinking Experiment (PhysicsKit)** 1D Free Fall Kinematics Studio.

[![Simulation Hub](https://img.shields.io/badge/Simulation_Hub-The_Thinking_Experiment-0f7e9b?style=flat-square)](https://thinking-experiment-sims.github.io/interactive-physics/)
[![Live Simulation](https://img.shields.io/badge/Live_App-Free_Fall_1D-d67b19?style=flat-square)](https://thinking-experiment-sims.github.io/free-fall-1d-lab/)

---

## 1. Pedagogical Overview & Curricular Context

Free fall is the preeminent classical example of constant acceleration motion ($a = \text{const}$). In standard physics education (NGSS HS-PS2-1, AP Physics 1, and Modeling Instruction Unit 3), free fall presents multiple deep conceptual hurdles for students:
1. **The Vector Nature of Acceleration ($a_y = -g$):** Students frequently confuse the sign of velocity with the sign of acceleration, mistakenly believing that an object moving upward must experience an upward acceleration.
2. **Apex Dynamics ($v = 0$ while $a = -g \neq 0$):** At the highest point of flight, the instantaneous velocity vanishes, but the net gravitational force and acceleration remain strictly non-zero.
3. **Parabolic Time Symmetry:** The ascent duration from launch to apex equals the descent duration from apex back to the launch elevation ($t_{\text{up}} = t_{\text{down}}$).
4. **Mass Independence (The Equivalence Principle):** All objects in a vacuum accelerate downward at identical rates regardless of mass, density, or volume.
5. **Multi-Stage Kinematics:** Distinguishing powered flight (engine thrust $a > 0$) from unpowered ballistic flight ($a = -g$).

---

## 2. Fundamental Governing Equations

Near the surface of the Earth, in the absence of significant air resistance, every freely falling body experiences a constant downward gravitational acceleration:

$$\vec{a} = -g \, \hat{j} \quad \text{where } g \approx 9.80\,\text{m/s}^2$$

### 2.1 The Standard 1D Kinematic Suite ($+y$ Upward)
Setting $+y$ as the vertically upward coordinate direction:

$$a_y(t) = -g = \text{constant}$$

Integrating acceleration with respect to time:
$$v_y(t) = v_{0y} - g t$$

Integrating velocity with respect to time:
$$y(t) = y_0 + v_{0y} t - \frac{1}{2} g t^2$$

Eliminating parameter $t$ via the chain rule ($a = v \frac{dv}{dy}$):
$$v_y^2 = v_{0y}^2 - 2 g (y - y_0)$$

---

## 3. Critical Kinematic Milestones & Mathematical Proofs

### 3.1 The Apex (Maximum Altitude)
At the highest point in the trajectory, the vertical velocity changes sign from positive (upward) to negative (downward). By the Intermediate Value Theorem, there must exist an instant $t_{\text{apex}}$ where:

$$v_y(t_{\text{apex}}) = 0$$

$$0 = v_{0y} - g t_{\text{apex}} \implies t_{\text{apex}} = \frac{v_{0y}}{g}$$

Substituting $t_{\text{apex}}$ into the position equation:

$$y_{\text{apex}} = y_0 + v_{0y}\left(\frac{v_{0y}}{g}\right) - \frac{1}{2}g\left(\frac{v_{0y}}{g}\right)^2 = y_0 + \frac{v_{0y}^2}{2g}$$

Alternatively, from the timeless equation with $v_y = 0$:
$$0 = v_{0y}^2 - 2g(y_{\text{apex}} - y_0) \implies y_{\text{apex}} - y_0 = \frac{v_{0y}^2}{2g}$$

### 3.2 Time Symmetry & Return Velocity
Consider an object launched upward from ground level $y_0 = 0$ with initial velocity $v_{0y} > 0$. The object returns to $y = 0$ when:

$$0 = v_{0y} t - \frac{1}{2} g t^2 = t \left( v_{0y} - \frac{1}{2} g t \right)$$

Two roots exist:
1. $t = 0$ (the moment of launch)
2. $t_{\text{return}} = \frac{2 v_{0y}}{g} = 2 t_{\text{apex}}$

Thus, the total flight time is exactly double the time to reach the apex:
$$t_{\text{down}} = t_{\text{return}} - t_{\text{apex}} = \frac{v_{0y}}{g} = t_{\text{up}}$$

Evaluating the velocity at $t_{\text{return}}$:
$$v_y(t_{\text{return}}) = v_{0y} - g \left(\frac{2 v_{0y}}{g}\right) = -v_{0y}$$

> **Symmetry Theorem:** In vacuum free fall over level ground, return speed equals launch speed ($|v_{\text{return}}| = |v_{0y}|$), and ascent time equals descent time.

---

## 4. Deep Pedagogical Analysis of Lab Scenarios

### 4.1 Scenario A: The Upward vs Downward Throw Symmetry (Raccoon & Well)
**Setup:** A stone is thrown upward at $+v_0$ from the lip of a cliff of height $h$ ($y_0 = 0, y_{\text{bottom}} = -h$). A second stone is thrown downward at $-v_0$ from the same position.

- Using Torricelli's equation for impact velocity:
  $$v_{\text{impact}}^2 = v_{0y}^2 - 2g(-h) = v_{0y}^2 + 2gh$$
  $$|v_{\text{impact}}| = \sqrt{v_{0y}^2 + 2gh}$$

Notice that $(\pm v_0)^2 = v_0^2$. Therefore, **both stones strike the bottom with the EXACT SAME speed**, regardless of whether the initial velocity was directed upward or downward!

The difference in flight duration is simply the time the upward-thrown stone spends completing its parabolic arc above the lip before returning to $y = 0$ with $v = -v_0$:
$$\Delta t_{\text{delay}} = 2 t_{\text{apex}} = \frac{2 v_0}{g}$$

---

### 4.2 Scenario B: The Simultaneous Splash Condition (Two-Body Free Fall)
**Setup:** Stone 1 is released at $t = 0$ with velocity $v_{01}$ from height $H$. Stone 2 is released at $t = \tau$ with unknown initial velocity $v_{02}$. For both stones to strike the ground ($y = 0$) at the exact same instant $t_{\text{impact}}$:

Stone 1 total flight duration $T_1$ satisfies:
$$0 = H + v_{01} T_1 - \frac{1}{2} g T_1^2 \implies T_1 = \frac{v_{01} + \sqrt{v_{01}^2 + 2gH}}{g}$$

Stone 2 has an allowed flight duration of $T_2 = T_1 - \tau$. To reach $y = 0$ in time $T_2$:
$$0 = H + v_{02} T_2 - \frac{1}{2} g T_2^2$$

Solving for required launch velocity $v_{02}$:
$$v_{02} = \frac{-H + \frac{1}{2} g T_2^2}{T_2} = \frac{1}{2} g T_2 - \frac{H}{T_2}$$

If $\frac{H}{T_2} > \frac{1}{2} g T_2$, then $v_{02} < 0$, proving that Stone 2 must be thrown vigorously **downward** to catch up with Stone 1.

---

### 4.3 Scenario C: Two-Interval Powered Rocket Dynamics
Real-world vertical flight involves distinct piecewise acceleration phases:

```
Altitude ^
         |              Apex (v = 0)
         |               *
         |             /   \
         |            /     \   Stage 2: Free Fall Coast (a = -g)
         |           /       \
Burnout  |----------*         \
         |         /           \
         |        /             \
         |       / Stage 1: Powered Boost (a = a_engine)
         |      /
Ground   +-----+------------------> Time
```

1. **Stage 1 (Motor Burn, $0 \le t \le t_b$):**
   - Net acceleration: $a_{\text{burn}} = \frac{F_{\text{thrust}}}{m} - g > 0$
   - Velocity at burnout: $v_b = v_0 + a_{\text{burn}} t_b = \sqrt{v_0^2 + 2 a_{\text{burn}} y_b}$
   - Altitude at burnout: $y_b = y_0 + v_0 t_b + \frac{1}{2} a_{\text{burn}} t_b^2$

2. **Stage 2 (Ballistic Coasting, $t > t_b$):**
   - Engine cut off ($F_{\text{thrust}} = 0$); only gravity acts: $a = -g$.
   - The rocket continues ascending due to its inertia, reaching its true apex at:
     $$y_{\text{max}} = y_b + \frac{v_b^2}{2g}$$
   - Total maximum altitude exceeds the burnout altitude significantly!

---

## 5. Planetary Gravitational Environments

The simulation supports comparing free-fall trajectories across celestial bodies:

$$\begin{array}{|l|c|c|c|}
\hline
\textbf{Celestial Body} & \textbf{Surface Gravity } g \, (\text{m/s}^2) & \textbf{Apex Height } y_{\text{max}} \text{ for } v_0 = 20\,\text{m/s} & \textbf{Flight Time to Apex } t_{\text{apex}} \\
\hline
\text{Earth (Standard)} & 9.80 & 20.4\,\text{m} & 2.04\,\text{s} \\
\text{Earth (Clean Exam)} & 10.00 & 20.0\,\text{m} & 2.00\,\text{s} \\
\text{Mars} & 3.71 & 53.9\,\text{m} & 5.39\,\text{s} \\
\text{Moon} & 1.62 & 123.5\,\text{m} & 12.35\,\text{s} \\
\text{Zero-G (Deep Space)} & 0.00 & \infty \text{ (constant velocity)} & \infty \\
\hline
\end{array}$$

Notice that both apex height and flight duration scale inversely with gravity: $y_{\text{max}} \propto \frac{1}{g}$ and $t_{\text{flight}} \propto \frac{1}{g}$.

---

## 6. Common Student Misconceptions & Diagnostic Remediation

| Student Misconception | Physical Reality | How This Simulation Clarifies It |
| :--- | :--- | :--- |
| **"At the apex, both velocity and acceleration are zero."** | If acceleration were zero at the apex, the net force would be zero, and the object would float suspended in mid-air forever! In reality, $v = 0$ but $a = -9.80\,\text{m/s}^2$. | The real-time $a(t)$ graph shows a constant flat line at $-9.80\,\text{m/s}^2$ through the apex, while $v(t)$ crosses zero with non-zero slope. |
| **"Heavier objects fall faster in free fall."** | Gravitational force $F_g = mg$ is larger for heavier masses, but inertial resistance to acceleration $m_{\text{inertial}}$ is identically larger: $a = \frac{mg}{m} = g$. | In Sandbox mode, users drop multiple bodies of different masses simultaneously and observe identical falls. |
| **"When an engine shuts off, the rocket immediately falls."** | Due to Newton's First Law (inertia), the rocket continues moving upward at initial burnout speed, decelerating until $v = 0$. | The 2-stage rocket simulation traces the coast phase between burnout and true maximum altitude. |

---

## 7. Sample Problem & Verification

**Problem:** A ball is thrown upward from the edge of a $30.0\,\text{m}$ tall building with initial speed $v_{0y} = +12.0\,\text{m/s}$. Assume $g = 9.80\,\text{m/s}^2$.
1. Find the time to reach the apex.
2. Find the maximum height above the ground.
3. Find the time required to strike the ground ($y = 0$).
4. Find the impact velocity.

**Solution:**
1. **Time to apex:**
   $$t_{\text{apex}} = \frac{12.0}{9.80} = 1.224\,\text{s}$$
2. **Maximum height:**
   $$y_{\text{max}} = 30.0 + \frac{(12.0)^2}{2(9.80)} = 30.0 + 7.35 = 37.35\,\text{m}$$
3. **Time to strike ground ($y = 0$):**
   $$0 = 30.0 + 12.0 t - 4.90 t^2 \implies 4.90 t^2 - 12.0 t - 30.0 = 0$$
   $$t = \frac{12.0 + \sqrt{(-12.0)^2 - 4(4.90)(-30.0)}}{2(4.90)} = \frac{12.0 + \sqrt{144 + 588}}{9.80} = \frac{12.0 + \sqrt{732}}{9.80} = \frac{12.0 + 27.055}{9.80} = 3.985\,\text{s}$$
4. **Impact velocity:**
   $$v_y(3.985) = 12.0 - 9.80(3.985) = 12.0 - 39.05 = -27.05\,\text{m/s}$$
   *(Verification: $v^2 = 12.0^2 + 2(9.80)(30.0) = 144 + 588 = 732 \implies v = \sqrt{732} = 27.05\,\text{m/s}$)*.

---

*Authored for The Thinking Experiment (PhysicsKit). Pedagogically aligned with AP Physics 1 & Modeling Instruction Unit 3.*
