# Free Fall 1D Kinematics Studio

**The Thinking Experiment (PhysicsKit)** &bull; Unit 1 Kinematics: 1D Free Fall

A production-ready, interactive virtual laboratory and pedagogical solver for one-dimensional vertical kinematics, sign conventions, time symmetry, multi-body simultaneous free fall, and two-interval rocket dynamics.

[![Live Simulation](https://img.shields.io/badge/Live_Simulation-GitHub_Pages-0f7e9b?style=for-the-badge)](https://thinking-experiment-sims.github.io/free-fall-1d-lab/)
[![Physics Theory Guide](https://img.shields.io/badge/Physics_Guide-Deep_Theory-d67b19?style=for-the-badge)](./PHYSICS.md)
[![Simulation Hub](https://img.shields.io/badge/Simulation_Hub-The_Thinking_Experiment-123140?style=for-the-badge)](https://thinking-experiment-sims.github.io/interactive-physics/)

---

## 🎨 Design System Compliance

This simulation strictly implements **The Thinking Experiment Brand Guidelines**:
- **Primary Teal:** `#0f7e9b` (Headers, primary actions, positive vertical direction)
- **Primary Teal Dark:** `#095f76`
- **Primary Teal Light:** `#e6f4f8`
- **Accent Amber:** `#d67b19` (Key numerical highlights, comparison stone, rocket flame)
- **Background:** Pure White `#ffffff` on Blueprint Grid `#e9f4fb`
- **High-Contrast Text:** `#123140`
- **Strictly Prohibited:** Zero Purple (`#59118e`) and Zero Gold (`#ffc61e`)

---

## 🔬 Core Pedagogical Scenarios

### 1. Problem 42: The Raccoon & The Well (Time Symmetry)
- **Setup:** A stone is tossed upwards ($v_0 = +15.0\text{ m/s}$) from the well lip ($y_0 = 0\text{ m}$) into a $20.0\text{ m}$ deep well ($y_{\text{splash}} = -20.0\text{ m}$).
- **Comparison:** Compared against a second stone tossed downward at $v_0 = -15.0\text{ m/s}$.
- **Key Discovery:** Both stones hit the water at the exact same speed ($24.84\text{ m/s}$), proving time and energy symmetry.

### 2. Problem 43: Mountain Climber & Simultaneous Splash (Two-Body Free Fall)
- **Setup:** A climber stands on a $50.0\text{ m}$ cliff above water.
- **Stone 1:** Dropped/tossed at $t = 0\text{ s}$ with $v_{01} = +2.0\text{ m/s}$.
- **Stone 2:** Thrown $1.0\text{ s}$ later. Students calculate the exact negative initial velocity ($v_{02} \approx -9.01\text{ m/s}$) required for both stones to strike the water at the identical instant.

### 3. Problem 44: Model Rocket Two-Interval Kinematics
- **Stage 1 (Powered Boost):** Rocket engines accelerate upward at $a_1 = +2.0\text{ m/s}^2$ up to burnout altitude $y_1 = 150.0\text{ m}$.
- **Stage 2 (Ballistic Free Fall Coast):** Motor shuts off; rocket continues upward under gravity ($a = -9.8\text{ m/s}^2$) reaching maximum apex altitude of $308.16\text{ m}$ before falling back.

### 4. Planetary Gravity Sandbox Mode
- Explore free fall under different gravitational fields: Earth ($9.80\,\text{m/s}^2$), Clean Exam ($10.0\,\text{m/s}^2$), Mars ($3.71\,\text{m/s}^2$), Moon ($1.62\,\text{m/s}^2$), and Zero-G ($0.0\,\text{m/s}^2$).

For full mathematical proofs, apex calculus, and misconception guides, see [PHYSICS.md](./PHYSICS.md).

---

## 📊 Synchronized Kinematic Graphs

High-DPI, real-time triple stacked plots:
1. **$y(t)$ [m] vs. $t$ [s]:** Parabolic arc with labeled apex turning point and impact roots.
2. **$v(t)$ [m/s] vs. $t$ [s]:** Linear velocity slope ($= a_y$). Zero-crossing highlights the apex clock time.
3. **$a(t)$ [m/s²] vs. $t$ [s]:** Horizontal line showing constant acceleration $-g$.

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/Thinking-Experiment-Sims/free-fall-1d-lab.git
cd free-fall-1d-lab

# Start a local web server
python3 -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your web browser.

---

## 📱 Embedding in Canvas LMS

```html
<iframe 
  src="https://thinking-experiment-sims.github.io/free-fall-1d-lab/" 
  width="100%" 
  height="800" 
  style="border: 1px solid #c8dbe3; border-radius: 8px;"
  loading="lazy"
  allowfullscreen>
</iframe>
```

---

## 📁 Repository Structure

```
free-fall-1d-lab/
├── index.html                   # Main UI and scenario cards
├── styles.css                    # The Thinking Experiment design system
├── src/
│   ├── app.js                   # Canvas rendering, playhead loop, UI events
│   └── physics.js               # Analytical kinematics solver & trajectory generation
├── tests/
│   └── physics.test.js          # Unit tests for kinematics equations
├── PHYSICS.md                   # Comprehensive theoretical physics guide
└── README.md                    # Project documentation
```

---

## 📄 License & Attribution

Authored by **Vladimir Lopez** for **The Thinking Experiment (PhysicsKit)**.  
Open-source under the MIT License for educational use in physics classrooms worldwide.
