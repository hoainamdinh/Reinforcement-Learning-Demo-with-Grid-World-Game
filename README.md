# Reinforcement Learning Game Demo

Đây là một demo game đơn giản sử dụng thuật toán Q-Learning để huấn luyện một agent di chuyển trong môi trường Grid World.

## 🎯 Mục tiêu

Agent (🤖) cần học cách di chuyển từ vị trí ban đầu (0,0) đến mục tiêu (🎯) ở vị trí (4,4) trong lưới 5x5, tránh các chướng ngại vật (🚫).

## 🧠 Thuật toán Q-Learning

### Công thức cập nhật Q-value:
```
Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
```

Trong đó:
- **Q(s,a)**: Q-value của state s và action a
- **α (alpha)**: Learning rate (tốc độ học)
- **r**: Reward nhận được
- **γ (gamma)**: Discount factor (hệ số chiết khấu)
- **s'**: State tiếp theo
- **ε (epsilon)**: Tỷ lệ exploration vs exploitation

## 🎮 Cách chơi

1. **Bắt đầu Training**: Click "🚀 Bắt đầu Training" để agent bắt đầu học
2. **Tạm dừng**: Click "⏸️ Tạm dừng" để dừng quá trình training
3. **Reset**: Click "🔄 Reset" để reset lại toàn bộ
4. **1 Bước**: Click "➡️ 1 Bước" để agent thực hiện 1 hành động

## 📊 Thông tin hiển thị

### Game Environment
- **Lưới 5x5**: Môi trường game
- **Agent (🤖)**: Màu xanh lá, vị trí hiện tại của agent
- **Goal (🎯)**: Màu vàng, mục tiêu cần đạt đến
- **Obstacles (🚫)**: Màu đỏ, chướng ngại vật cần tránh
- **Q-values**: Hiển thị ở 4 góc mỗi ô (↑→↓←)

### Thống kê
- **Episode**: Số lượng episode đã hoàn thành
- **Bước**: Số bước đã thực hiện trong episode hiện tại
- **Tổng Reward**: Tổng reward tích lũy
- **Tỷ lệ thành công**: Phần trăm episode thành công

### Trạng thái hiện tại
- **Vị trí**: Tọa độ hiện tại của agent
- **Action**: Hành động vừa thực hiện
- **Reward**: Reward nhận được
- **Q-Value**: Q-value của action vừa thực hiện

### Lịch sử Actions
Hiển thị 20 hành động gần nhất với:
- Episode và step number
- State → Action → New Position
- Reward và Q-value

### Q-Table
Hiển thị top 10 states có Q-value cao nhất với:
- Q-values cho 4 hướng di chuyển
- Giá trị Max Q-value (được highlight màu xanh)

## ⚙️ Tham số có thể điều chỉnh

- **Learning Rate (α)**: 0-1, tốc độ học của agent
- **Discount Factor (γ)**: 0-1, tầm quan trọng của reward tương lai
- **Epsilon (ε)**: 0-1, tỷ lệ exploration vs exploitation
- **Tốc độ**: 100-2000ms, tốc độ animation

## 🏆 Reward System

- **Đạt mục tiêu**: +100
- **Va chướng ngại vật**: -100
- **Di chuyển bình thường**: -1 (khuyến khích tìm đường ngắn nhất)
- **Di chuyển không hợp lệ**: -10

## 🚀 Cách chạy

1. Mở file `index.html` trong trình duyệt web
2. Không cần cài đặt thêm gì, chạy trực tiếp được

## 📈 Quan sát học tập

- **Ban đầu**: Agent di chuyển ngẫu nhiên (exploration cao)
- **Dần dần**: Agent học được đường đi tốt nhất (exploitation tăng)
- **Cuối cùng**: Agent di chuyển hiệu quả từ start đến goal

## 🔧 Tính năng

- ✅ Hiển thị real-time Q-values trên lưới
- ✅ Thống kê chi tiết về quá trình học
- ✅ Lịch sử hành động với màu sắc theo reward
- ✅ Q-table top states với highlighting
- ✅ Điều chỉnh tham số real-time
- ✅ Animation mượt mà
- ✅ Responsive design

Chúc bạn khám phá thú vị với Reinforcement Learning! 🎉