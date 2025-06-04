import './style.css'
import initApp from './App'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div>
  <header id="header">
    <nav id="nav">
      <div id="home-banner">Keep Focus</div>
      <div id="main-nav">
          <!-- <button type="button" class="links">Report</button> -->
          <button type="button" class="links" id="modal-button">Settings</button>
          <!-- <button type="button" class="links">Sign In</button> -->
      </div>
    </nav>
    <div id="timer-indicator-bar"></div>
  </header>
  <main>
    <div id="options-container">
      <svg class="progress-svg" width="100%" height="100%">
        <rect class="progress-rect" x="0" y="0" width="100%" height="100%" />
      </svg>
      <div id="option-buttons">
        <button type="button" class="option-button links focus-on" value="focus-on" data-selected="true">Focus On</button>
        <button type="button" class="option-button links short-break" value="short-break" data-selected="false">Short Break</button>
        <button type="button" class="option-button links long-break" value="long-break" data-selected="false">Long Break</button>
      </div>
      <div id="time-container">
        <div class="clock-display">
          <span>25:00</span>
        </div>
      </div>
      <div class="button-container">
        <button id="startBtn" class="links" type="button" data-active="false" value="start">Start</button>
      </div>
    </div>
    <div id="extras">
      <div id="message-container">
        <p id="focus-count">#1</p>
        <p class="message">Time to focus!</p>
        <div class="quote"></div>
      </div>
    </div>
  </main>
  <!-- modal ## settings -->
  <div id="modal-container">
    <div id="modal">
      <div id="modal-header" class="border-bottom">
        <h2>SETTING <button class="close-modal">X</button></h2>
      </div>
      <div id="modal-main">
        <div class="modal-section">
          <div class="modal-section-title">
            <h3>TIMER</h3>
          </div>
          <div class="modal-content-container">
            <div class="modal-content-title">
              <h3>Time (minutes)</h3>
            </div>
            <div class="modal-content">
              <div class="modal-items">
                <div class="item1">
                  <label for="modal-focus">Focus</label>
                  <input type="number" class="modal-input" name="focus-on" min="1" data-value="25" placeholder="25" id="modal-focus">
                </div>
                <div class="item2">
                  <label for="modal-short-break">Short Break</label>
                  <input type="number" class="modal-input" name="short-break" min="1" data-value="5" placeholder="5" id="modal-short-break">
                </div>
                <div class="item3">
                  <label for="modal-long-break">Long Break</label>
                  <input type="number" class="modal-input" name="long-break" min="1" data-value="15" placeholder="15" id="modal-long-break">
                </div>
              </div>
              <div class="modal-interval">
                <label for="interval" class="modal-content-title">Long Break Interval</label>
                <input type="number" class="modal-input interval" name="interval" min="3" placeholder="4" data-value="4" id="interval">
              </div>
            </div>
          </div>
        </div>
        <div class="modal-section">
          <div class="modal-section-title"></div>
          <div class="modal-items">
            <div class="item">
              <button class="save">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`

document.addEventListener('DOMContentLoaded', initApp)