// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function () {
  // 获取元素
  const backBtn = document.getElementById("backBtn");
  const roomNameElement = document.getElementById("roomName");
  const messageList = document.getElementById("messageList");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const inviteBtn = document.getElementById("inviteBtn");

  // 从本地存储获取房间ID
  const roomId = localStorage.getItem("roomId");
  if (roomId) {
    roomNameElement.textContent = `房间 ${roomId}`;
  }
  // WebSocket连接
  let conn;
  const url = "ws://127.0.0.1:8080/ws/game/start";
  if (!conn || conn.readyState !== WebSocket.OPEN) {
    initWebSocket();
  }
  // 获取玩家列表容器
  const userList = document.querySelector(".user-list");
  if (!userList) {
    console.error("玩家列表容器未找到");
  }

  // 获取玩家列表数据
  function fetchPlayerList() {
    if (!roomId || !userList) return;
    if (!userList) {
      console.error("无法更新玩家列表：容器不存在");
      return;
    }

    fetch(`http://127.0.0.1:8080/api/room/getGamerByRoomId?roomId=${roomId}`)
      .then((response) => response.json())
      .then((players) => {
        console.log(players);
        // 清空玩家列表
        userList.innerHTML = "";

        // 获取当前用户ID
        const currentUserId = localStorage.getItem("userId");
        const currentUserName = localStorage.getItem("userName");
        // 创建玩家列表项
        players?.data?.forEach((player) => {
          const userItem = document.createElement("div");
          userItem.className = `user-item ${
            player.id === currentUserId ? "current-user" : ""
          }`;
          userItem.innerHTML = `
            <img src="assets/images/avatar.jpg" alt="头像" class="avatar" data-user-id="${
              player.id
            }">
            <span class="username">${player.name}</span>
            <span class="score">${player.grade || 0}</span>
          `;
          // 添加头像点击事件
          const avatar = userItem.querySelector(".avatar");
          const un = userItem.querySelector(".username");
          avatar.addEventListener("click", function () {
            const score = prompt("请输入分数:");
            if (score !== null && !isNaN(score) && score.trim() !== "") {
              const currentUserId = localStorage.getItem("userId");
              const targetUserId = this.getAttribute("data-user-id");
              if (
                currentUserId &&
                targetUserId &&
                currentUserId !== targetUserId
              ) {
                if (conn && conn.readyState === WebSocket.OPEN) {
                  conn.send(
                    JSON.stringify({
                      type: "scoreUpdate",
                      roomId: roomId,
                      grade: parseInt(score),
                      worker: currentUserId + "-" + currentUserName,
                      consumer: targetUserId + "-" + player.name,
                    })
                  );
                } else {
                  alert("连接尚未建立，请稍后再试");
                  initWebSocket();
                }
              } else if (currentUserId === targetUserId) {
                alert("不能给自己评分");
              }
            } else if (score !== null) {
              alert("请输入有效的分数");
            }
          });
          userList.appendChild(userItem);
        });
      })
      .catch((error) => {
        console.error("获取玩家列表失败:", error);
      });
  }

  // 返回按钮点击事件
  backBtn.addEventListener("click", function () {
    if (confirm("确定要离开房间吗?")) {
      conn.send(
        JSON.stringify({
          type: "exit",
          roomId: roomId,
          userId: localStorage.getItem("userId"),
          userName: localStorage.getItem("userName"),
        })
      );
      conn.close();
      window.location.href = "index.html";
    }
  });

  // 初始化WebSocket连接
  function initWebSocket() {
    conn = new WebSocket(url);
    if (!localStorage.getItem("userId")) {
      // 生成随机用户ID
      const userId = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      // 存储房间ID到本地存储
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", "u" + userId);
      localStorage.setItem("isCreator", "true");
    }

    conn.onopen = function () {
      console.log("WebSocket连接成功");
      // 发送加入房间消息
      conn.send(
        JSON.stringify({
          type: "join",
          roomId: roomId,
          userId: localStorage.getItem("userId"),
          userName: localStorage.getItem("userName"),
        })
      );
    };

    conn.onmessage = function (event) {
      // 页面加载时获取玩家列表
      fetchPlayerList();
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        // 显示接收到的消息
        const scoreMessage = document.createElement("div");
        scoreMessage.className = "score-transaction-message";

        scoreMessage.textContent = data.msg;
        messageList.appendChild(scoreMessage);
        messageList.scrollTop = messageList.scrollHeight;

        // 添加积分消息样式
        const style = document.createElement("style");
        style.textContent = `
          .score-transaction-message {
            color: #666;
            font-style: italic;
            text-align: center;
            margin: 8px 0;
            padding: 6px;
            background-color: #f5f5f5;
            border-radius: 4px;
          }
        `;
        document.head.appendChild(style);
      }
    };

    conn.onerror = function (error) {
      console.error("WebSocket错误:", error);
    };

    conn.onclose = function () {
      console.log("WebSocket连接关闭");
      // 尝试重连
      setTimeout(initWebSocket, 3000);
    };
  }

  // 发送消息功能
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message && conn && conn.readyState === WebSocket.OPEN) {
      // 发送消息到服务器
      conn.send(
        JSON.stringify({
          type: "message",
          roomId: roomId,
          msg: message,
        })
      );
      messageInput.value = "";
      /*       // 显示自己发送的消息
      const messageElement = document.createElement("div");
      messageElement.className = "user-message";
      messageElement.textContent = `我: ${message}`;
      messageList.appendChild(messageElement);
      messageInput.value = "";
      // 滚动到底部
      messageList.scrollTop = messageList.scrollHeight; */
    } else if (!conn || conn.readyState !== WebSocket.OPEN) {
      alert("连接尚未建立，请稍后再试");
    }
  }

  // 发送按钮点击事件
  sendBtn.addEventListener("click", sendMessage);

  // 回车键发送消息
  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // 邀请按钮点击事件
  inviteBtn.addEventListener("click", function () {
    alert(`房间ID: ${roomId}\n请将此ID发送给好友，邀请他们加入`);
  });

  // 模拟分数更新功能
  window.updateScore = function (username, scoreChange) {
    const scoreElements = document.querySelectorAll(".user-item .username");
    scoreElements.forEach((element) => {
      if (element.textContent === username) {
        const scoreElement = element.nextElementSibling;
        let currentScore = parseInt(scoreElement.textContent);
        currentScore += scoreChange;
        scoreElement.textContent = currentScore;

        // 添加分数变动消息
        const scoreMessage = document.createElement("div");
        scoreMessage.className = "score-message";

        // 添加玩家列表样式
        const style = document.createElement("style");
        style.textContent = `
    /* 玩家列表样式 */
    .user-list {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
    }

    .user-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .user-item.current-user .username {
      color: #2196F3;
      font-weight: bold;
    }

    .username {
      margin-right: 10px;
    }

    .score {
      color: #666;
    }
  `;
        document.head.appendChild(style);
        scoreMessage.textContent = `${username}${
          scoreChange > 0 ? "获得" : "失去"
        }${Math.abs(scoreChange)}分，当前分数：${currentScore}`;
        messageList.appendChild(scoreMessage);
        messageList.scrollTop = messageList.scrollHeight;
      }
    });
  };
});
