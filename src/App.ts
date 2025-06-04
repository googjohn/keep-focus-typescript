import { getRequiredElement, isElementOfType, OPTION_TYPE, TIMER, type GLOBAL_CONFIG, type QuotesArray, type USER_INPUT } from "./utility/Utility";

export default function initApp() {
  try {
    const inputFocus = getRequiredElement<HTMLInputElement>('input[name=focus-on]');
    const inputShortBreak = getRequiredElement<HTMLInputElement>('input[name=short-break]');
    const inputLongBreak = getRequiredElement<HTMLInputElement>('input[name=long-break]');
    const inputInterval = getRequiredElement<HTMLInputElement>('input[name=interval]');
    const clockDisplay = getRequiredElement<HTMLDivElement>('.clock-display');
    const messageElement = getRequiredElement<HTMLDivElement>('.message');
    const focusCountElement = getRequiredElement<HTMLDivElement>('#focus-count');
    const optionBtns: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.option-button');
    const startButton = getRequiredElement<HTMLButtonElement>('#startBtn');
    const modalButton = getRequiredElement<HTMLButtonElement>('#modal-button');
    const closeModal = getRequiredElement<HTMLButtonElement>('.close-modal');
    const modal = getRequiredElement<HTMLDivElement>('#modal-container');
    const saveButton = getRequiredElement<HTMLButtonElement>('.save');
    const userInputs: NodeListOf<HTMLInputElement> = document.querySelectorAll('.modal-input');
    const timerBar = getRequiredElement<HTMLDivElement>('#timer-indicator-bar');
    const quoteElement = getRequiredElement<HTMLDivElement>('.quote')
    const alarm = new Audio('/alarm-buzzer.wav');

    // user input object
    const UserInput: USER_INPUT = {
      focusDuration: parseInt(inputFocus.dataset.value ?? '0'),
      shortBreakDuration: parseInt(inputShortBreak.dataset.value ?? '0'),
      longBreakDuration: parseInt(inputLongBreak.dataset.value ?? '0'),
      interval: parseInt(inputInterval.dataset.value ?? '4'),
    }

    // global configuration
    const GlobalConfig: GLOBAL_CONFIG = {
      duration: 0,
      totalDuration: 0,
      remainingDuration: 0,
      states: {
        currentTimerStatus: TIMER.isStopped,
        currentOptionType: OPTION_TYPE.isFocusOn,
      },
      timerInterval: undefined,
      currentSelected: getRequiredElement<HTMLButtonElement>("button[data-selected='true']"),
      previousSelected: null,
      count: 0,
      totalCount: 0,
      maxCount: UserInput.interval,
      randomIndex: 0,
      NOTIFICATION_TIMEOUT: 5000,
      COUNTDOWN_INTERVAL: 1000,
      SECONDS: 60,
      AUTOPLAY_DELAY: 3000,
    }


    // set user settings if there is saved in local storage 
    setUserSettings();

    // initial duration
    if (GlobalConfig.states.currentOptionType === OPTION_TYPE.isFocusOn) {
      GlobalConfig.duration = UserInput.focusDuration * GlobalConfig.SECONDS;
    }

    // initial display
    if (clockDisplay) {
      clockDisplay.innerHTML = formatTime(GlobalConfig.duration)
    }

    // countdown function
    function countdown(duration: number, element: HTMLDivElement): void {
      let startTime: number = Date.now();
      let elapsedTime: number = 0;
      let totalDuration: number = duration;
      let currentDuration: number = 0;

      GlobalConfig.timerInterval = setInterval(() => {
        let currentTime: number = Date.now();
        elapsedTime = Math.floor((currentTime - startTime) / 1000);
        currentDuration = Math.max(0, (totalDuration - elapsedTime));

        // keep updated on remaining duration
        GlobalConfig.remainingDuration = currentDuration;
        let timerBarWidth = (elapsedTime / totalDuration) * 100;

        if (timerBar) {
          if (GlobalConfig.totalDuration !== duration) {
            let elapsedTotal = (GlobalConfig.totalDuration - duration) + elapsedTime
            timerBarWidth = (elapsedTotal / GlobalConfig.totalDuration) * 100
          } else {
            timerBarWidth = (elapsedTime / totalDuration) * 100
          }

          if (timerBarWidth === 100) {
            timerBar.style.backgroundColor = 'white';
          } else {
            timerBar.style.backgroundColor = 'rgba(175, 173, 173, 0.979)';
          }

          timerBar.style.width = `${timerBarWidth}%`;
        }

        if (currentDuration <= 0) {
          stopTime();

          // show notification
          showNotification(GlobalConfig.states.currentOptionType)

          // automated start of next countdown
          setTimeout(() => {
            autoStartOption();
          }, GlobalConfig.AUTOPLAY_DELAY);
        }

        if (element) {
          element.innerHTML = formatTime(currentDuration)
        }

      }, GlobalConfig.COUNTDOWN_INTERVAL)
    }

    // function to format time
    function formatTime(duration: number): string {
      duration = Math.max(0, duration)
      let minutes: number = Math.floor(duration / 60);
      let formattedMinutes: string = String(minutes).padStart(2, '0');

      let seconds: number = duration % 60;
      let formattedSeconds: string = String(seconds).padStart(2, '0');

      return `<span>${formattedMinutes}:${formattedSeconds}</span>`
    }

    // function to starting countdown
    function startTime(duration: number): void {
      // initialize at the very first call of start
      if (!GlobalConfig.totalDuration) {
        GlobalConfig.totalDuration = duration;
      }

      if (GlobalConfig.states.currentTimerStatus !== TIMER.isRunning) {
        GlobalConfig.states.currentTimerStatus = TIMER.isRunning
        countdown(duration, clockDisplay!);
        updateStartButton('pause', startButton, true)
      }
    }

    // function to pause countdown
    function pauseTime(): void {
      if (GlobalConfig.states.currentTimerStatus === TIMER.isRunning) {
        GlobalConfig.states.currentTimerStatus = TIMER.isPaused;
        clearInterval(GlobalConfig.timerInterval);
        updateStartButton('start', startButton, false)
      }
    }

    // function to resume countdown using remaining duration in global configuration
    function resumeTime(duration: number): void {
      if (GlobalConfig.states.currentTimerStatus !== TIMER.isRunning) {
        startTime(duration)
      }
    }

    // function for stopping the app and resetting
    function stopTime(): void {
      if (GlobalConfig.states.currentTimerStatus !== TIMER.isStopped) {
        GlobalConfig.states.currentTimerStatus = TIMER.isStopped;
        clearInterval(GlobalConfig.timerInterval)
        resetTime();
        updateStartButton('start', startButton, false)
      }
    }

    // called to reset when stopTime function is called
    function resetTime(): void {
      GlobalConfig.duration = 0;
      GlobalConfig.totalDuration = 0;
      GlobalConfig.remainingDuration = 0;
      GlobalConfig.timerInterval = undefined;
      clockDisplay.innerHTML = formatTime(0);
    }

    // update start button value, text, data-active
    function updateStartButton(status: string, element: HTMLButtonElement, dataActive: boolean): void {
      element.value = status;
      element.textContent = status.toUpperCase();
      element.dataset.active = String(dataActive);
    }

    // update global configuration previous and current selected base on focused/clicked button ## call setSelected()
    function updateOptionButton(element: HTMLButtonElement): void {
      updateButtonSelectedState(element);
    }

    // update app background
    function udpateAppBackground(option: string): void {
      document.body.className = option;
    }

    // update message to focus or take a break
    function updateMessage(option: string): string {
      if (option !== OPTION_TYPE.isFocusOn) {
        return `Time to take a ${option.split('-')[0]} break.`
      } else {
        return `Time to ${option.split('-')[0]}!`
      }
    }

    // set global configuration from selected button
    function updateButtonSelectedState(element: HTMLButtonElement): void {
      if (GlobalConfig.currentSelected) {
        GlobalConfig.previousSelected = GlobalConfig.currentSelected;
        GlobalConfig.currentSelected = element;
        GlobalConfig.previousSelected.dataset.selected = String(false);
        GlobalConfig.currentSelected.dataset.selected = String(true);
      }
    }

    // handles option button clicks/event
    function optionButtonHandle(event: MouseEvent): void {
      timerBar.style.width = '0%';

      // check event target is associated to a type of HTMLElement
      if (isElementOfType(event.target, HTMLButtonElement)) {
        let element = event.target;

        if (GlobalConfig.states.currentOptionType === element.value) {
          return;
        } else {
          // always stop the timer during different selection
          if (GlobalConfig.states.currentTimerStatus !== TIMER.isStopped) {
            stopTime();
          }

          // update previous and current selected button
          updateButtonSelectedState(element);

          switch (GlobalConfig.currentSelected!.value) {
            case OPTION_TYPE.isFocusOn:
              GlobalConfig.states.currentOptionType = OPTION_TYPE.isFocusOn
              break;
            case OPTION_TYPE.isShortBreak:
              GlobalConfig.states.currentOptionType = OPTION_TYPE.isShortBreak
              break;
            case OPTION_TYPE.isLongBreak:
              GlobalConfig.states.currentOptionType = OPTION_TYPE.isLongBreak
              break;
          }

          udpateAppBackground(GlobalConfig.currentSelected!.value);

          let inputCounterPart = getRequiredElement<HTMLInputElement>(`input[name=${GlobalConfig.currentSelected!.value}]`);
          let inputName = inputCounterPart.name.split('-')[0]
          let inputValue = parseInt(inputCounterPart?.value ?? '0')
          let defaultValue: number;

          if (inputName !== OPTION_TYPE.isFocusOn.split('-')[0]) {
            defaultValue = inputName === OPTION_TYPE.isLongBreak.split('-')[0] ? UserInput.longBreakDuration : UserInput.shortBreakDuration;
          } else {
            defaultValue = UserInput.focusDuration;
          }

          GlobalConfig.duration = (inputValue || defaultValue) * GlobalConfig.SECONDS;
          clockDisplay.innerHTML = formatTime(GlobalConfig.duration)
        }
        messageElement.textContent = updateMessage(GlobalConfig.states.currentOptionType)
      }
    }

    // handles automated countdown
    function autoStartOption(): void {
      timerBar.style.width = '0%';

      if (GlobalConfig.states.currentOptionType === OPTION_TYPE.isFocusOn) {
        GlobalConfig.count += 1;
        GlobalConfig.totalCount += 1;
        if (GlobalConfig.count >= GlobalConfig.maxCount) {
          GlobalConfig.count = 0;

          const longBreakButton = getRequiredElement<HTMLButtonElement>('button[value=long-break]');
          updateOptionButton(longBreakButton);

          GlobalConfig.states.currentOptionType = OPTION_TYPE.isLongBreak;
          udpateAppBackground(GlobalConfig.states.currentOptionType);

          GlobalConfig.duration = UserInput.longBreakDuration * GlobalConfig.SECONDS;
          startTime(GlobalConfig.duration);
        } else {
          const shortBreakButton = getRequiredElement<HTMLButtonElement>('button[value=short-break]');
          updateOptionButton(shortBreakButton);

          GlobalConfig.states.currentOptionType = OPTION_TYPE.isShortBreak;
          udpateAppBackground(GlobalConfig.states.currentOptionType);

          GlobalConfig.duration = UserInput.shortBreakDuration * GlobalConfig.SECONDS;
          startTime(GlobalConfig.duration);
        }

      } else {
        const focusButton = getRequiredElement<HTMLButtonElement>('button[value=focus-on]');
        updateOptionButton(focusButton);

        GlobalConfig.states.currentOptionType = OPTION_TYPE.isFocusOn;
        udpateAppBackground(GlobalConfig.states.currentOptionType)

        GlobalConfig.duration = UserInput.focusDuration * GlobalConfig.SECONDS;
        startTime(GlobalConfig.duration);

        focusCountElement.innerHTML = `#${GlobalConfig.totalCount + 1}`
        fetchQuotes();
      }
      messageElement.textContent = updateMessage(GlobalConfig.states.currentOptionType)
      clockDisplay.innerHTML = formatTime(GlobalConfig.duration);
    }

    // handles permission query and sending of notification
    async function requestNotificationPermission(): Promise<void> {
      // check if browser supports notification
      if (!('Notification' in window)) {
        console.log(`Browser doesn't support notification!`)
        return;
      }

      // check if permission already granted or denied 
      if (Notification.permission === 'granted') {
        console.log('Notification permission already granted.')
        return;
      } else if (Notification.permission === 'denied') {
        console.warn('Notification permission already denied. User needs to manually enable permission.')
        return;
      }

      // request for permission
      try {
        let permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('You can now send notification!')
        } else if (permission === 'denied') {
          console.warn('Notification request denied!')
        }
      } catch (error) {
        console.error('Error requesting notification permission.', error)
      }

    }

    // custom notification
    function showNotification(type:
      OPTION_TYPE.isFocusOn |
      OPTION_TYPE.isShortBreak |
      OPTION_TYPE.isLongBreak
    ) {
      if (Notification.permission === 'granted') {
        let notificationTitle = '';
        let notificationBody = '';

        if (type === OPTION_TYPE.isFocusOn) {
          notificationTitle = 'Time for a break.';
          notificationBody = (GlobalConfig.count >= (GlobalConfig.maxCount - 1)) ?
            "It's time for a long break." :
            "Take a short break."
        } else {
          notificationTitle = "Back to focus.";
          notificationBody = "Break is over, it's time to get back to work.";
        }

        const notificationOptions = {
          body: notificationBody,
          tag: 'pomodoro-timer-end',
          icon: 'https://fav.farm/clock'
        }

        const notification = new Notification(notificationTitle, notificationOptions);

        if (alarm instanceof HTMLAudioElement) {
          alarm.play()
        }

        setTimeout(() => {
          if (!alarm.paused && notification) {
            alarm.pause();
            alarm.currentTime = 0;
            notification.close();
          }
        }, GlobalConfig.NOTIFICATION_TIMEOUT)

        notification.onclick = function () {
          window.focus();
          this.close();
        }

        notification.onclose = function () {
          alarm.pause();
          alarm.currentTime = 0;
        }

        notification.onerror = function (error) {
          console.error('Notification error.', error)
        }
      }
    }

    // handles modal opening/closing
    function modalButtonHandle(event: MouseEvent): void {
      if (isElementOfType(event.target, HTMLButtonElement)) {
        const element = event.target as HTMLButtonElement;
        modal.classList.toggle('active');

        if (element.dataset.modalActive === 'true') {
          modal.dataset.modalActive = String(false);
        } else {
          modal.dataset.modalActive = String(true);
        }

        if (!modal.classList.contains('active')) {
          modal.dataset.modalActive = String(false);
        }
      }
    }

    // handles closing and saving user input settins to localStorage
    function saveButtonHandle(): void {
      modal.classList.toggle('active');
      modal.dataset.modalActive = String(false);

      try {
        const USER_INPUTS = JSON.stringify(UserInput);
        localStorage.setItem('userInputSettings', USER_INPUTS);
        console.log('User input settings successfully saved to localStorage!')
      } catch (error) {
        console.error("Error saving setting to localStorage!", error)
        localStorage.clear();
        console.log('localStorage cleared!')
      }
    }

    // handles user input setting from localStorage if present
    function setUserSettings(): void {
      try {
        const savedSettings = localStorage.getItem('userInputSettings')
        if (!savedSettings) {
          console.log('No found user setting.')
          return;
        }
        const parcedSettings = JSON.parse(savedSettings) as Partial<USER_INPUT>;

        // update UserInput with loaded values
        UserInput.focusDuration = parcedSettings.focusDuration || UserInput.focusDuration;
        UserInput.shortBreakDuration = parcedSettings.shortBreakDuration || UserInput.shortBreakDuration;
        UserInput.longBreakDuration = parcedSettings.longBreakDuration || UserInput.longBreakDuration;
        UserInput.interval = parcedSettings.interval || UserInput.interval;

        // update inputs to reflect input value
        inputFocus.value = String(UserInput.focusDuration);
        inputShortBreak.value = String(UserInput.shortBreakDuration);
        inputLongBreak.value = String(UserInput.longBreakDuration);
        inputInterval.value = String(UserInput.interval);

        if (GlobalConfig.states.currentOptionType === OPTION_TYPE.isFocusOn) {
          GlobalConfig.duration = UserInput.focusDuration * GlobalConfig.SECONDS;
        }

        clockDisplay.innerHTML = formatTime(GlobalConfig.duration);
      } catch (error) {
        console.error('Error retrieving user settings', error)
        localStorage.clear();
        console.log('localStorage cleared!')
      }
    }

    // handles quotes fetching
    async function fetchQuotes(): Promise<void> {
      try {
        const url = '/data.json';
        const urlRequest = new Request(url);
        const response = await fetch(urlRequest);

        if (!response.ok) {
          throw new Error(`HTTP Error. Status: ${response.status}`)
        }

        const quotesObjectsInArray: QuotesArray = await response.json();
        const quotes = quotesObjectsInArray.map(quote => quote.h);

        GlobalConfig.randomIndex = Math.floor(Math.random() * quotes.length)
        quoteElement.innerHTML = quotes[GlobalConfig.randomIndex]

      } catch (error) {
        console.log('Error requesting data.', error)
      }
    }
    // initial quote
    fetchQuotes();


    // handles user input
    function userInputHandle(event: Event): void {
      if (isElementOfType(event.target, HTMLInputElement)) {

        const element = event.target;
        let inputValue = parseInt(element.value ?? '0')
        let defaultValue = parseInt(element.dataset.value!)

        switch (element.name) {
          case OPTION_TYPE.isFocusOn:
            UserInput.focusDuration = (inputValue || defaultValue);
            break;
          case OPTION_TYPE.isLongBreak:
            UserInput.longBreakDuration = (inputValue || defaultValue);
            break;
          case OPTION_TYPE.isShortBreak:
            UserInput.shortBreakDuration = (inputValue || defaultValue);
            break;
          case 'interval':
            UserInput.interval = (inputValue || defaultValue);
            GlobalConfig.maxCount = UserInput.interval;
            break;
        }

        if (element.name === GlobalConfig.states.currentOptionType) {
          if (GlobalConfig.states.currentTimerStatus !== TIMER.isStopped) {
            stopTime();
            resetTime();
            // let elapsedTime = GlobalConfig.totalDuration - GlobalConfig.remainingDuration;
            // updateProgressRect(GlobalConfig.totalDuration, elapsedTime)
          }

          switch (element.name) {
            case OPTION_TYPE.isFocusOn:
              GlobalConfig.duration = UserInput.focusDuration * GlobalConfig.SECONDS;
              break;
            case OPTION_TYPE.isShortBreak:
              GlobalConfig.duration = UserInput.shortBreakDuration * GlobalConfig.SECONDS;
              break;
            case OPTION_TYPE.isLongBreak:
              GlobalConfig.duration = UserInput.longBreakDuration * GlobalConfig.SECONDS;
              break;
          }

          clockDisplay.innerHTML = formatTime(GlobalConfig.duration);
        }
      }
    }

    // start button handle
    function handleStart(): void {
      switch (GlobalConfig.states.currentTimerStatus) {
        case TIMER.isStopped:
          startTime(GlobalConfig.duration);
          if (Notification.permission !== 'granted') {
            requestNotificationPermission();
          }
          break;
        case TIMER.isPaused:
          resumeTime(GlobalConfig.remainingDuration)
          break;
        case TIMER.isRunning:
          pauseTime();
          break;
      }
    }

    // event listeners
    startButton.addEventListener('click', handleStart)

    optionBtns.forEach(button => {
      button.addEventListener('click', optionButtonHandle)
    })

    modalButton.addEventListener('click', modalButtonHandle)
    closeModal.addEventListener('click', modalButtonHandle)
    saveButton.addEventListener('click', saveButtonHandle)

    userInputs.forEach(input => {
      input.addEventListener('change', userInputHandle)
    })
  } catch (error) {
    console.error(error)
    return;
  }
}