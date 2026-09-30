/* =========================================
   ふくむろ時計
   GitHub Pages版

   MP3：
   ./audio/ファイル名.mp3
========================================= */


/* =========================================
   時報設定
=========================================

   mode:
     A = Aタイム
     B = Bタイム

   time:
     HH:MM:SS

   audio:
     ./audio/xxxx.mp3

   memo:
     表示するメモ
========================================= */

const SCHEDULE = [

  {
    aTime: "15:16:00",
    bTime: "08:30:00",
    memo: "始業",
    audio: "./audio/chime01.mp3"
  },

  {
    aTime: "09:00:00",
    bTime: "09:30:00",
    memo: "時報",
    audio: "./audio/chime02.mp3"
  },

  {
    aTime: "10:00:00",
    bTime: "10:30:00",
    memo: "時報",
    audio: "./audio/chime03.mp3"
  },

  {
    aTime: "12:00:00",
    bTime: "12:00:00",
    memo: "昼休み",
    audio: "./audio/chime04.mp3"
  },

  {
    aTime: "13:00:00",
    bTime: "13:30:00",
    memo: "時報",
    audio: "./audio/chime05.mp3"
  },

  {
    aTime: "15:00:00",
    bTime: "15:30:00",
    memo: "時報",
    audio: "./audio/chime06.mp3"
  },

  {
    aTime: "17:00:00",
    bTime: "17:30:00",
    memo: "終業",
    audio: "./audio/chime07.mp3"
  }

];


/* =========================================
   設定
========================================= */

let currentMode = "A";

let lastPlayedKey = "";

let audioUnlocked = false;

let audioPlaying = false;


/* =========================================
   DOM
========================================= */

const digitalClock =
  document.getElementById(
    "digitalClock"
  );


const hourHand =
  document.getElementById(
    "hourHand"
  );


const minuteHand =
  document.getElementById(
    "minuteHand"
  );


const secondHand =
  document.getElementById(
    "secondHand"
  );


const clock =
  document.getElementById(
    "clock"
  );


const clockTicks =
  document.getElementById(
    "clockTicks"
  );


const clockNumbers =
  document.getElementById(
    "clockNumbers"
  );


const currentModeElement =
  document.getElementById(
    "currentMode"
  );


const nextEventElement =
  document.getElementById(
    "nextEvent"
  );


const statusElement =
  document.getElementById(
    "status"
  );


const audioPlayer =
  document.getElementById(
    "audioPlayer"
  );


const modeAButton =
  document.getElementById(
    "modeA"
  );


const modeBButton =
  document.getElementById(
    "modeB"
  );


const settingsButton =
  document.getElementById(
    "settingsButton"
  );


const settingsModal =
  document.getElementById(
    "settingsModal"
  );


const closeSettingsButton =
  document.getElementById(
    "closeSettings"
  );


const testAudioButton =
  document.getElementById(
    "testAudioButton"
  );


const scheduleTable =
  document.getElementById(
    "scheduleTable"
  );


/* =========================================
   初期化
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  initialize
);


function initialize() {

  createClockFace();

  renderSchedule();

  updateModeUI();

  updateNextEvent();

  updateClock();

  /*
   * ブラウザの音声再生許可を取得するため、
   * 最初のクリック時に音声を初期化する。
   */

  document.addEventListener(
    "click",
    unlockAudio,
    {
      once: true
    }
  );

}


/* =========================================
   時計盤生成
========================================= */

function createClockFace() {

  clockTicks.innerHTML = "";

  clockNumbers.innerHTML = "";


  const rect =
    clock.getBoundingClientRect();


  const width =
    rect.width;


  const height =
    rect.height;


  const centerX =
    width / 2;


  const centerY =
    height / 2;


  /*
   * 60個の目盛り
   */

  const tickRadius =
    Math.min(
      width,
      height
    ) / 2 - 13;


  for (
    let i = 0;
    i < 60;
    i++
  ) {

    const angle =
      i * 6 - 90;


    const radians =
      angle * Math.PI / 180;


    const major =
      i % 5 === 0;


    const length =
      major
        ? 17
        : 8;


    const x =
      centerX
      +
      Math.cos(radians)
      * tickRadius;


    const y =
      centerY
      +
      Math.sin(radians)
      * tickRadius;


    const tick =
      document.createElement(
        "div"
      );


    tick.className =
      "clock-tick"
      +
      (
        major
          ? " major"
          : ""
      );


    tick.style.height =
      `${length}px`;


    tick.style.left =
      `${x}px`;


    tick.style.top =
      `${y}px`;


    tick.style.transform =
      "translate(-50%, -50%)";


    /*
     * 目盛りを半径方向に向ける
     */

    tick.style.transform +=
      ` rotate(${i * 6}deg)`;


    clockTicks.appendChild(
      tick
    );

  }


  /*
   * 1〜12
   */

  const numberRadius =
    Math.min(
      width,
      height
    ) / 2 - 58;


  for (
    let number = 1;
    number <= 12;
    number++
  ) {

    const angle =
      number * 30 - 90;


    const radians =
      angle * Math.PI / 180;


    const x =
      centerX
      +
      Math.cos(radians)
      * numberRadius;


    const y =
      centerY
      +
      Math.sin(radians)
      * numberRadius;


    const element =
      document.createElement(
        "div"
      );


    element.className =
      "clock-number";


    element.textContent =
      number;


    element.style.left =
      `${x}px`;


    element.style.top =
      `${y}px`;


    clockNumbers.appendChild(
      element
    );

  }

}


/* =========================================
   時計サイズ変更
========================================= */

window.addEventListener(
  "resize",
  createClockFace
);


/* =========================================
   時計更新
========================================= */

function updateClock() {

  const now =
    new Date();


  const hours =
    now.getHours();


  const minutes =
    now.getMinutes();


  const seconds =
    now.getSeconds();


  const milliseconds =
    now.getMilliseconds();


  /*
   * デジタル
   */

  digitalClock.textContent =
    `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;


  /*
   * 秒針
   *
   * ミリ秒まで使うことで
   * 滑らかに動かす。
   */

  const secondAngle =
    (
      seconds
      +
      milliseconds / 1000
    ) * 6;


  /*
   * 分針
   */

  const minuteAngle =
    (
      minutes
      +
      seconds / 60
      +
      milliseconds / 60000
    ) * 6;


  /*
   * 時針
   */

  const hourAngle =
    (
      (hours % 12)
      +
      minutes / 60
      +
      seconds / 3600
    ) * 30;


  hourHand.style.transform =
    `translate(-50%, -100%) rotate(${hourAngle}deg)`;


  minuteHand.style.transform =
    `translate(-50%, -100%) rotate(${minuteAngle}deg)`;


  secondHand.style.transform =
    `translate(-50%, -100%) rotate(${secondAngle}deg)`;


  /*
   * 時報確認
   */

  checkSchedule(now);


  /*
   * 次の時報
   */

  updateNextEvent();


  requestAnimationFrame(
    updateClock
  );

}


/* =========================================
   時報確認
========================================= */

function checkSchedule(now) {

  const time =
    `${pad(now.getHours())}:`
    + `${pad(now.getMinutes())}:`
    + `${pad(now.getSeconds())}`;


  SCHEDULE.forEach(
    (item, index) => {

      const target =
        currentMode === "A"
          ? item.aTime
          : item.bTime;


      if (
        target !== time
      ) {

        return;

      }


      const key =
        `${currentMode}-${index}-${time}`;


      /*
       * requestAnimationFrameは
       * 1秒間に何十回も実行されるため、
       * 同じ時報を二重再生しない。
       */

      if (
        lastPlayedKey === key
      ) {

        return;

      }


      lastPlayedKey =
        key;


      playScheduleAudio(
        item
      );

    }
  );

}


/* =========================================
   MP3再生
========================================= */

function playScheduleAudio(item) {

  if (
    !item.audio
  ) {

    setStatus(
      `⚠ ${item.memo || "時報"}：MP3未設定`
    );

    return;

  }


  setStatus(
    `🔊 ${item.memo || "時報"} を再生します`
  );


  playAudio(
    item.audio
  );

}


/* =========================================
   MP3再生本体
========================================= */

function playAudio(url) {

  /*
   * 現在の再生を停止
   */

  audioPlayer.pause();

  audioPlayer.currentTime = 0;


  /*
   * URL設定
   */

  audioPlayer.src =
    url;


  audioPlayer.volume =
    1.0;

  audioPlayer.muted =
    false;


  audioPlayer.load();


  const promise =
    audioPlayer.play();


  if (
    promise
    &&
    typeof promise.catch === "function"
  ) {

    promise.catch(
      error => {

        console.error(
          "MP3再生エラー:",
          error
        );


        setStatus(
          "❌ MP3を再生できませんでした"
        );

      }
    );

  }

}


/* =========================================
   音声ロック解除
========================================= */

function unlockAudio() {

  /*
   * 無音の短い再生を行って
   * ブラウザのAudio使用を初期化する。
   */

  const audio =
    document.createElement(
      "audio"
    );


  audio.src =
    "./audio/chime01.mp3";


  audio.volume =
    0;


  const promise =
    audio.play();


  if (promise) {

    promise
      .then(
        () => {

          audio.pause();

          audio.currentTime = 0;

          audioUnlocked =
            true;

          setStatus(
            "音声再生準備完了"
          );

        }
      )
      .catch(
        () => {

          /*
           * ブラウザによっては
           * 無音再生も拒否される。
           *
           * その場合でも、
           * ユーザーが試聴ボタンを押せば
           * 再生できる。
           */

          audioUnlocked =
            false;

          setStatus(
            "画面をクリックすると音声を使用できます"
          );

        }
      );

  }

}


/* =========================================
   A / B切替
========================================= */

modeAButton.addEventListener(
  "click",
  () => {

    currentMode =
      "A";

    lastPlayedKey =
      "";

    updateModeUI();

    updateNextEvent();

    renderSchedule();

    setStatus(
      "Aタイムに切り替えました"
    );

  }
);


modeBButton.addEventListener(
  "click",
  () => {

    currentMode =
      "B";

    lastPlayedKey =
      "";

    updateModeUI();

    updateNextEvent();

    renderSchedule();

    setStatus(
      "Bタイムに切り替えました"
    );

  }
);


/* =========================================
   A / B表示
========================================= */

function updateModeUI() {

  modeAButton.classList.toggle(
    "active",
    currentMode === "A"
  );


  modeBButton.classList.toggle(
    "active",
    currentMode === "B"
  );


  currentModeElement.textContent =
    currentMode === "A"
      ? "Aタイム"
      : "Bタイム";

}


/* =========================================
   次の時報
========================================= */

function updateNextEvent() {

  const now =
    new Date();


  const nowSeconds =
    now.getHours() * 3600
    +
    now.getMinutes() * 60
    +
    now.getSeconds();


  let next =
    null;


  let shortest =
    Infinity;


  SCHEDULE.forEach(
    item => {

      const time =
        currentMode === "A"
          ? item.aTime
          : item.bTime;


      if (
        !time
      ) {

        return;

      }


      const parts =
        time.split(":");


      if (
        parts.length !== 3
      ) {

        return;

      }


      const targetSeconds =
        Number(parts[0]) * 3600
        +
        Number(parts[1]) * 60
        +
        Number(parts[2]);


      let diff =
        targetSeconds
        -
        nowSeconds;


      /*
       * 翌日
       */

      if (
        diff < 0
      ) {

        diff +=
          86400;

      }


      if (
        diff < shortest
      ) {

        shortest =
          diff;

        next =
          item;

      }

    }
  );


  if (!next) {

    nextEventElement.textContent =
      "次の時報：--";

    return;

  }


  const time =
    currentMode === "A"
      ? next.aTime
      : next.bTime;


  nextEventElement.textContent =
    `次の時報：${time}　${next.memo || ""}`;

}


/* =========================================
   設定画面
========================================= */

settingsButton.addEventListener(
  "click",
  () => {

    settingsModal.classList.add(
      "show"
    );

    settingsModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }
);


closeSettingsButton.addEventListener(
  "click",
  closeSettings
);


settingsModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      settingsModal
    ) {

      closeSettings();

    }

  }
);


function closeSettings() {

  settingsModal.classList.remove(
    "show"
  );

  settingsModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================
   試聴
========================================= */

testAudioButton.addEventListener(
  "click",
  () => {

    unlockAudio();

    /*
     * まず最初のMP3を試聴
     */

    const item =
      SCHEDULE.find(
        row => row.audio
      );


    if (!item) {

      alert(
        "MP3が設定されていません。"
      );

      return;

    }


    setStatus(
      "MP3を試聴しています"
    );


    playAudio(
      item.audio
    );

  }
);


/* =========================================
   時刻表表示
========================================= */

function renderSchedule() {

  scheduleTable.innerHTML = "";


  SCHEDULE.forEach(
    item => {

      const row =
        document.createElement(
          "tr"
        );


      const a =
        document.createElement(
          "td"
        );


      const b =
        document.createElement(
          "td"
        );


      const memo =
        document.createElement(
          "td"
        );


      const audio =
        document.createElement(
          "td"
        );


      a.textContent =
        item.aTime || "";


      b.textContent =
        item.bTime || "";


      memo.textContent =
        item.memo || "";


      if (
        item.audio
      ) {

        audio.textContent =
          "設定済み";

        audio.className =
          "mp3-ok";

      } else {

        audio.textContent =
          "未設定";

        audio.className =
          "mp3-error";

      }


      row.appendChild(a);

      row.appendChild(b);

      row.appendChild(memo);

      row.appendChild(audio);


      scheduleTable.appendChild(
        row
      );

    }
  );

}


/* =========================================
   補助
========================================= */

function pad(number) {

  return String(number)
    .padStart(2, "0");

}


function setStatus(message) {

  statusElement.textContent =
    message;

}


/* =========================================
   ページを閉じる直前
========================================= */

window.addEventListener(
  "beforeunload",
  () => {

    audioPlayer.pause();

  }
);
