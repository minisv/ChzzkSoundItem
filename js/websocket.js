'use strict'

let socket;
let isManualClose = false;
let nicknameCommandCounts = {};
let soundQueue = new SoundQueue();

let connectWebSocket = () => {
  const ssID = Math.floor(Math.random() * 10) + 1;
  const serverUrl = "wss://kr-ss"+ssID+".chat.naver.com/chat";
  
  socket  = new WebSocket(serverUrl);
  
  socket.addEventListener("open", async () => {
    console.log("✅ 서버에 연결되었습니다.");
    
    let chatChannelID = getParameterByName("chzzk");
    if (chatChannelID === null || chatChannelID === "") return;
    let option =  { "ver": "2", "cmd": 100, "svcid": "game", "cid": `${chatChannelID}`, "bdy": { "devType":2001, "auth":"READ" }, "tid": 1 };
    socket.send(JSON.stringify(option));
  });
  
  socket.addEventListener("message", async (event) => {
    let data = JSON.parse(event.data);
    if (data.bdy?.[Symbol.iterator]) {
      for (let body of data.bdy) {
        let profile = JSON.parse(body.profile);
        let extras = JSON.parse(body.extras);
        let nickname = profile.nickname;
        
        let msg = body.msg;
        let command;
        let option;
        if (msg.indexOf(" ") > 0) {
          command = msg.substring(0, msg.indexOf(" ")).trim();
          option = msg.substring(msg.indexOf(" "), msg.length).trim();
        }
        else command = msg.trim();
        
        if (!nicknameCommandCounts[nickname]) nicknameCommandCounts[nickname] = {};
        if (!nicknameCommandCounts[nickname][command]) nicknameCommandCounts[nickname][command] = 0;
        
        switch (command) {
          case "/재생":
            if (nicknameCommandCounts[nickname][command] < 5) {
              await soundQueue.addQueueJob(option);
              nicknameCommandCounts[nickname][command]++;
            }
            break;
        }
      }
    }
    if (data.cmd === 0) socket.send(JSON.stringify({"ver": "2", "cmd": 10000}));
    else if (data.cmd === 10100) socket.send(JSON.stringify({"ver": "2", "cmd": 0}));
  });
  
  socket.addEventListener("close", () => {
    console.log("❌ 서버와 연결이 끊겼습니다. 자동으로 재 연결을 시도 합니다.");
    if (!isManualClose) connectWebSocket();
  });
  
  socket.addEventListener("error", (error) => {
    console.error("WebSocket 오류:", error);
    console.log("⚠️ 오류 발생: 콘솔을 확인하세요.");
  });
  
}

window.addEventListener("beforeunload", () => {
  isManualClose = true;
  socket.close();
});

connectWebSocket();