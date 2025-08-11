// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const backBtn = document.getElementById('backBtn');
    const historyList = document.querySelector('.history-list');
    const prevPageBtn = document.querySelector('.pagination .page-btn:first-child');
    const nextPageBtn = document.querySelector('.pagination .page-btn:last-child');
    const pageInfo = document.querySelector('.page-info');

    // 返回按钮点击事件
    backBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // 模拟历史记录数据
    const historyData = [
        { time: '2023-10-20 15:30', players: 4, score: 150, ranking: 1 },
        { time: '2023-10-19 20:15', players: 3, score: 90, ranking: 2 },
        { time: '2023-10-18 14:45', players: 4, score: 210, ranking: 1 },
        { time: '2023-10-17 19:20', players: 2, score: 85, ranking: 1 },
        { time: '2023-10-16 16:10', players: 4, score: 75, ranking: 3 }
    ];

    // 渲染历史记录
    function renderHistory(data) {
        historyList.innerHTML = '';
        data.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-time">${item.time}</div>
                <div class="history-info">
                    <span class="info-item"><i class="material-icons">people</i>参与人数：${item.players}人</span>
                    <span class="info-item"><i class="material-icons">star</i>我的得分：${item.score}</span>
                </div>
                <div class="history-result">排名：第${item.ranking}名</div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    // 初始渲染
    renderHistory(historyData);

    // 分页功能模拟
    let currentPage = 1;
    const totalPages = 10;

    function updatePageInfo() {
        pageInfo.textContent = `第${currentPage}页 / 共${totalPages}页`;
    }

    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updatePageInfo();
            // 在实际应用中，这里应该加载上一页数据
        }
    });

    nextPageBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            updatePageInfo();
            // 在实际应用中，这里应该加载下一页数据
        }
    });
});