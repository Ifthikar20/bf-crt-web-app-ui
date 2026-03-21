<script setup>
/**
 * PhoneSimulator — Realistic iPhone 17 Pro mockup.
 * Ultra-thin bezels, smaller Dynamic Island, aluminum frame,
 * action button, and proper aspect ratio (71.9mm × 150mm = ~2.09:1).
 */
defineProps({
  label: { type: String, default: 'iPhone 17 Pro' },
})
</script>

<template>
  <div class="sim-container">
    <div class="sim-badge">
      <div class="sim-badge-dot"></div>
      {{ label }}
    </div>
    <div class="iphone-outer">
      <!-- Aluminum frame with titanium buttons -->
      <div class="iphone-frame">
        <!-- Action Button (left) -->
        <div class="btn-action"></div>
        <!-- Volume Up -->
        <div class="btn-vol-up"></div>
        <!-- Volume Down -->
        <div class="btn-vol-down"></div>
        <!-- Power Button (right) -->
        <div class="btn-power"></div>

        <!-- Screen Area -->
        <div class="iphone-screen-wrap">
          <!-- Dynamic Island (smaller on 17 Pro) -->
          <div class="dynamic-island">
            <div class="di-cam"></div>
          </div>

          <!-- Status Bar -->
          <div class="ios-status-bar">
            <div class="status-left">
              <span class="status-time">9:41</span>
            </div>
            <div class="status-right">
              <!-- Signal -->
              <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
                <rect x="0" y="7" width="2.5" height="4" rx="0.5"/>
                <rect x="4" y="5" width="2.5" height="6" rx="0.5"/>
                <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.5"/>
                <rect x="12" y="0" width="2.5" height="11" rx="0.5"/>
              </svg>
              <!-- WiFi -->
              <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor">
                <path d="M8 11.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zM4.7 8.1a4.8 4.8 0 016.6 0l-.9.9a3.4 3.4 0 00-4.8 0l-.9-.9zM2.3 5.7a8 8 0 0111.4 0l-.9.9a6.6 6.6 0 00-9.6 0l-.9-.9zM0 3.4a11 11 0 0116 0l-.9.9A9.7 9.7 0 00.9 4.3L0 3.4z"/>
              </svg>
              <!-- Battery -->
              <div class="battery-icon">
                <div class="battery-body">
                  <div class="battery-fill"></div>
                </div>
                <div class="battery-tip"></div>
              </div>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="iphone-content">
            <slot />
          </div>

          <!-- Home Indicator -->
          <div class="home-bar-wrap">
            <div class="home-bar"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.sim-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
  background: rgba(100, 116, 139, 0.08);
  padding: 6px 14px;
  border-radius: 20px;
}
.sim-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ═══════════════════════════════════════ 
   iPhone 17 Pro Frame
   Real dims: 150mm × 71.9mm (~2.087:1)
   Scaled: 620h × 297w
   ═══════════════════════════════════════ */
.iphone-outer {
  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))
          drop-shadow(0 8px 20px rgba(0, 0, 0, 0.15));
}

.iphone-frame {
  position: relative;
  width: 280px;
  height: 584px;
  /* Aluminum frame gradient */
  background: linear-gradient(
    145deg,
    #2a2a3e 0%,
    #1e1e32 20%,
    #16162a 50%,
    #1a1a2e 80%,
    #222238 100%
  );
  border-radius: 46px;
  padding: 6px;
  /* Subtle metallic ring */
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.3);
}

/* ── Side Buttons ── */
.btn-action {
  position: absolute;
  left: -2.5px;
  top: 96px;
  width: 2.5px;
  height: 26px;
  background: linear-gradient(180deg, #2d2d44, #1e1e32);
  border-radius: 2px 0 0 2px;
}
.btn-vol-up {
  position: absolute;
  left: -2.5px;
  top: 140px;
  width: 2.5px;
  height: 38px;
  background: linear-gradient(180deg, #2d2d44, #1e1e32);
  border-radius: 2px 0 0 2px;
}
.btn-vol-down {
  position: absolute;
  left: -2.5px;
  top: 186px;
  width: 2.5px;
  height: 38px;
  background: linear-gradient(180deg, #2d2d44, #1e1e32);
  border-radius: 2px 0 0 2px;
}
.btn-power {
  position: absolute;
  right: -2.5px;
  top: 154px;
  width: 2.5px;
  height: 56px;
  background: linear-gradient(180deg, #2d2d44, #1e1e32);
  border-radius: 0 2px 2px 0;
}

/* ── Screen Wrap ── */
.iphone-screen-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 42px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Dynamic Island (smaller on 17 Pro) ── */
.dynamic-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 76px;
  height: 22px;
  background: #000;
  border-radius: 14px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
}
.di-cam {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #1a2a4a, #0a0a1a);
  box-shadow: inset 0 0 2px rgba(100, 140, 255, 0.3);
}

/* ── iOS Status Bar ── */
.ios-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px 4px;
  flex-shrink: 0;
  z-index: 10;
  height: 40px;
}
.status-left { flex: 1; }
.status-time {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  font-family: -apple-system, 'SF Pro Display', system-ui, sans-serif;
  letter-spacing: 0.01em;
}
.status-right {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #fff;
}

/* Battery icon */
.battery-icon { display: flex; align-items: center; gap: 1px; }
.battery-body {
  width: 20px;
  height: 9px;
  border: 1.5px solid #fff;
  border-radius: 2.5px;
  padding: 1px;
  display: flex;
}
.battery-fill {
  flex: 1;
  background: #30d158;
  border-radius: 1px;
}
.battery-tip {
  width: 2px;
  height: 4px;
  background: #fff;
  border-radius: 0 1px 1px 0;
  opacity: 0.5;
}

/* ── Scrollable Content ── */
.iphone-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: #f2f2f7; /* iOS light background */
}
.iphone-content::-webkit-scrollbar { display: none; }

/* ── Home Indicator ── */
.home-bar-wrap {
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 20;
}
.home-bar {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
}
</style>
