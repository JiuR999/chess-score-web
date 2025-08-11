let url = "ws://26.tcp.cpolar.top:14975/api/start";
// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function () {
  // 获取按钮元素
  const createRoomBtn = document.getElementById("createRoom");
  const joinRoomBtn = document.getElementById("joinRoom");
  const historyBtn = document.getElementById("history");

  // 创建房间按钮点击事件
  createRoomBtn.addEventListener("click", function () {
    // 生成随机房间ID
    const roomId = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(6, "0");

    // 存储房间ID到本地存储
    localStorage.setItem("roomId", roomId);

    localStorage.setItem("isCreator", "true");
    // 跳转到房间页面
    window.location.href = "room.html";
  });

  // 加入房间按钮点击事件
  joinRoomBtn.addEventListener("click", function () {
    // 显示自定义弹窗
    document.getElementById("joinRoomModal").style.display = "flex";
  });

  // 模态框确认按钮点击事件
  document.getElementById("modalConfirmBtn").addEventListener("click", function () {
    const roomId = document.getElementById("modalRoomId").value;
    const userName = document.getElementById("modalUserName").value;
    
    if (roomId && roomId.trim() !== "" && userName && userName.trim() !== "") {
      localStorage.setItem("roomId", roomId.trim());
      localStorage.setItem("userName", userName);
      // 生成随机用户ID
      const userId = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(6, "0");
      localStorage.setItem("isCreator", "false");
      localStorage.setItem("userId", userId);
      window.location.href = "room.html";
    } else {
      alert("请输入有效的房间ID和游戏昵称");
    }
  });

  // 模态框取消按钮点击事件
  document.getElementById("modalCancelBtn").addEventListener("click", function () {
    // 隐藏自定义弹窗
    document.getElementById("joinRoomModal").style.display = "none";
    // 清空输入框
    document.getElementById("modalRoomId").value = "";
    document.getElementById("modalUserName").value = ""; 
  });

  // 历史记录按钮点击事件
  historyBtn.addEventListener("click", function () {
    window.location.href = "history.html";
  });
});