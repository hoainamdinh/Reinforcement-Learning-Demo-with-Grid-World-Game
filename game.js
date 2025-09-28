    class QLearningAgent {
        constructor(gridSize = 5, learningRate = 0.1, discountFactor = 0.9, epsilon = 0.1) {
            this.gridSize = gridSize;
            this.learningRate = learningRate;
            this.discountFactor = discountFactor;
            this.epsilon = epsilon;
            
            // Q-table: state -> {action: value}
            this.qTable = {};
            
            // Actions: 0=up, 1=right, 2=down, 3=left
            this.actions = ['↑', '→', '↓', '←'];
            this.actionDeltas = [
                [-1, 0], // up
                [0, 1],  // right
                [1, 0],  // down
                [0, -1]  // left
            ];
            
            // Environment setup
            this.agentPos = [0, 0];
            this.goalPos = [4, 4];
            this.obstacles = [[1, 1], [2, 2], [3, 1], [1, 3]];
            
            // Training stats
            this.episode = 0;
            this.steps = 0;
            this.totalReward = 0;
            this.episodeReward = 0;
            this.successCount = 0;
            this.actionHistory = [];
            
            // Animation
            this.isTraining = false;
            this.animationId = null;
            this.speed = 500;
            
            // Last Q-update info for display
            this.lastQUpdate = null;
            
            this.initializeQTable();
        }
        
        initializeQTable() {
            // Initialize Q-values for all valid states
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (!this.isObstacle(i, j)) {
                        const state = `${i},${j}`;
                        this.qTable[state] = {
                            0: 0, // up
                            1: 0, // right
                            2: 0, // down
                            3: 0  // left
                        };
                    }
                }
            }
        }
        
        getStateKey(row, col) {
            return `${row},${col}`;
        }
        
        isObstacle(row, col) {
            return this.obstacles.some(obs => obs[0] === row && obs[1] === col);
        }
        
        isGoal(row, col) {
            return row === this.goalPos[0] && col === this.goalPos[1];
        }
        
        isValidPosition(row, col) {
            return row >= 0 && row < this.gridSize && 
                col >= 0 && col < this.gridSize && 
                !this.isObstacle(row, col);
        }
        
        getReward(row, col) {
            if (this.isGoal(row, col)) {
                return 100; // Big positive reward for reaching goal
            } else if (this.isObstacle(row, col)) {
                return -100; // Big negative reward for hitting obstacle
            } else {
                return -1; // Small negative reward for each step (to encourage efficiency)
            }
        }
        
        chooseAction(state) {
            // Epsilon-greedy action selection
            if (Math.random() < this.epsilon) {
                // Random action (exploration)
                return Math.floor(Math.random() * 4);
            } else {
                // Greedy action (exploitation)
                const qValues = this.qTable[state];
                let maxQ = Math.max(...Object.values(qValues));
                let bestActions = [];
                
                for (let action = 0; action < 4; action++) {
                    if (qValues[action] === maxQ) {
                        bestActions.push(action);
                    }
                }
                
                // Randomly choose among best actions
                return bestActions[Math.floor(Math.random() * bestActions.length)];
            }
        }
        
        updateQValue(state, action, reward, nextState) {
            const currentQ = this.qTable[state][action];
            const nextMaxQ = nextState ? Math.max(...Object.values(this.qTable[nextState])) : 0;
            
            const newQ = currentQ + this.learningRate * (reward + this.discountFactor * nextMaxQ - currentQ);
            
            // Store detailed update information
            this.lastQUpdate = {
                state: state,
                action: action,
                actionName: ['↑', '→', '↓', '←'][action],
                oldQ: currentQ,
                newQ: newQ,
                reward: reward,
                nextState: nextState,
                nextMaxQ: nextMaxQ,
                learningRate: this.learningRate,
                discountFactor: this.discountFactor,
                qChange: newQ - currentQ,
                timestamp: Date.now()
            };
            
            this.qTable[state][action] = newQ;
            
            return newQ;
        }
        
        step() {
            const currentState = this.getStateKey(this.agentPos[0], this.agentPos[1]);
            const action = this.chooseAction(currentState);
            
            // Calculate next position
            const [deltaRow, deltaCol] = this.actionDeltas[action];
            let nextRow = this.agentPos[0] + deltaRow;
            let nextCol = this.agentPos[1] + deltaCol;
            
            let reward;
            let nextState = null;
            
            // Check if next position is valid
            if (this.isValidPosition(nextRow, nextCol)) {
                // Move agent
                this.agentPos = [nextRow, nextCol];
                reward = this.getReward(nextRow, nextCol);
                nextState = this.getStateKey(nextRow, nextCol);
            } else {
                // Invalid move (wall or obstacle)
                reward = -10;
                // Don't move agent
            }
            
            // Store previous Q-value before updating
            const oldQValue = this.qTable[currentState][action];
            
            // Update Q-value
            const newQValue = this.updateQValue(currentState, action, reward, nextState);
            
            // Update stats
            this.steps++;
            this.episodeReward += reward;
            this.totalReward += reward;
            
            // Add to action history
            this.actionHistory.unshift({
                episode: this.episode,
                step: this.steps,
                state: currentState,
                action: this.actions[action],
                reward: reward,
                qValue: newQValue.toFixed(3),
                newPos: `(${this.agentPos[0]}, ${this.agentPos[1]})`
            });
            
            // Keep only last 50 actions
            if (this.actionHistory.length > 50) {
                this.actionHistory.pop();
            }
            
            // Check if episode ended
            if (this.isGoal(this.agentPos[0], this.agentPos[1])) {
                this.successCount++;
                this.resetEpisode();
                return { done: true, reward, action, qValue: newQValue };
            } else if (this.steps > 100) { // Max steps per episode
                this.resetEpisode();
                return { done: true, reward, action, qValue: newQValue };
            }
            
            return { done: false, reward, action, qValue: newQValue };
        }
        
        resetEpisode() {
            this.episode++;
            this.steps = 0;
            this.episodeReward = 0;
            this.agentPos = [0, 0]; // Reset to start position
        }
        
        reset() {
            this.episode = 0;
            this.steps = 0;
            this.totalReward = 0;
            this.episodeReward = 0;
            this.successCount = 0;
            this.agentPos = [0, 0];
            this.actionHistory = [];
            this.initializeQTable();
        }
        
        updateParameters(learningRate, discountFactor, epsilon, speed) {
            this.learningRate = learningRate;
            this.discountFactor = discountFactor;
            this.epsilon = epsilon;
            this.speed = speed;
        }
    }

    class GameUI {
        constructor() {
            console.log('GameUI constructor called');
            try {
                this.agent = new QLearningAgent();
                console.log('Agent created');
                this.visitedCells = new Set();
                this.previousQValues = {}; // Store previous Q-values for comparison
                
                this.initializeUI();
                this.setupEventListeners();
                this.updateDisplay();
                console.log('GameUI constructor completed successfully');
            } catch (error) {
                console.error('Error in GameUI constructor:', error);
                throw error;
            }
        }
        
        initializeUI() {
            console.log('Initializing UI...');
            this.createGrid();
            this.updateDisplay();
            console.log('UI initialized');
        }
        
        createGrid() {
            console.log('Creating grid...');
            const grid = document.getElementById('grid');
            if (!grid) {
                console.error('Grid element not found!');
                return;
            }
            
            grid.innerHTML = '';
            
            for (let i = 0; i < this.agent.gridSize; i++) {
                for (let j = 0; j < this.agent.gridSize; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.id = `cell-${i}-${j}`;
                    
                    // Add coordinate display
                    const coordDiv = document.createElement('div');
                    coordDiv.className = 'cell-coordinate';
                    coordDiv.textContent = `${i},${j}`;
                    cell.appendChild(coordDiv);
                    
                    // Add tooltip for Q-values
                    const tooltip = document.createElement('div');
                    tooltip.className = 'cell-tooltip';
                    tooltip.id = `tooltip-${i}-${j}`;
                    cell.appendChild(tooltip);
                    
                    // Add Q-value displays
                    for (let action = 0; action < 4; action++) {
                        const qDiv = document.createElement('div');
                        qDiv.className = `q-value q-${['up', 'right', 'down', 'left'][action]}`;
                        qDiv.id = `q-${i}-${j}-${action}`;
                        cell.appendChild(qDiv);
                    }
                    
                    // Add hover event for tooltip
                    cell.addEventListener('mouseenter', () => this.showTooltip(i, j));
                    cell.addEventListener('mouseleave', () => this.hideTooltip(i, j));
                    
                    grid.appendChild(cell);
                }
            }
            console.log('Grid created successfully');
        }
        
        showTooltip(row, col) {
            const tooltip = document.getElementById(`tooltip-${row}-${col}`);
            if (!tooltip) return;
            
            const state = this.agent.getStateKey(row, col);
            const currentQValues = this.agent.qTable[state];
            const previousValues = this.previousQValues[state];
            
            if (!currentQValues) {
                tooltip.innerHTML = `Position: (${row}, ${col})<br>No Q-values yet`;
                return;
            }
            
            let tooltipContent = `<strong>Position: (${row}, ${col})</strong><br>`;
            tooltipContent += `<strong>Q-Values:</strong><br>`;
            
            const actions = ['↑', '→', '↓', '←'];
            for (let action = 0; action < 4; action++) {
                const current = currentQValues[action];
                const previous = previousValues ? previousValues[action] : 0;
                const change = current - previous;
                const changeStr = change > 0 ? `(+${change.toFixed(3)})` : 
                                change < 0 ? `(${change.toFixed(3)})` : '';
                
                tooltipContent += `${actions[action]}: ${current.toFixed(3)} ${changeStr}<br>`;
            }
            
            // Add cell type info
            if (this.agent.isGoal(row, col)) {
                tooltipContent += `<strong>Type:</strong> Goal (+100)`;
            } else if (this.agent.isObstacle(row, col)) {
                tooltipContent += `<strong>Type:</strong> Obstacle (-100)`;
            } else if (row === this.agent.agentPos[0] && col === this.agent.agentPos[1]) {
                tooltipContent += `<strong>Type:</strong> Agent Current Position`;
            } else {
                tooltipContent += `<strong>Type:</strong> Normal (-1)`;
            }
            
            tooltip.innerHTML = tooltipContent;
        }
        
        hideTooltip(row, col) {
            const tooltip = document.getElementById(`tooltip-${row}-${col}`);
            if (tooltip) {
                tooltip.innerHTML = '';
            }
        }
        
        updateGrid() {
            // Clear all cells
            for (let i = 0; i < this.agent.gridSize; i++) {
                for (let j = 0; j < this.agent.gridSize; j++) {
                    const cell = document.getElementById(`cell-${i}-${j}`);
                    if (!cell) {
                        console.error(`Cell not found: cell-${i}-${j}`);
                        continue;
                    }
                    
                    cell.className = 'cell';
                    cell.textContent = '';
                    
                    // Mark visited cells
                    if (this.visitedCells.has(`${i},${j}`)) {
                        cell.classList.add('visited');
                    }
                    
                    // Update Q-values display
                    const state = this.agent.getStateKey(i, j);
                    if (this.agent.qTable[state]) {
                        for (let action = 0; action < 4; action++) {
                            const qDiv = document.getElementById(`q-${i}-${j}-${action}`);
                            if (qDiv) {
                                const qValue = this.agent.qTable[state][action];
                                if (Math.abs(qValue) > 0.1) {
                                    qDiv.textContent = qValue.toFixed(1);
                                    // Color code Q-values
                                    if (qValue > 0) {
                                        qDiv.style.color = '#4CAF50';
                                    } else {
                                        qDiv.style.color = '#F44336';
                                    }
                                } else {
                                    qDiv.textContent = '';
                                }
                            } else {
                                console.error(`Q-div not found: q-${i}-${j}-${action}`);
                            }
                        }
                    }
                }
            }
            
            // Mark obstacles
            this.agent.obstacles.forEach(([row, col]) => {
                const cell = document.getElementById(`cell-${row}-${col}`);
                if (cell) {
                    cell.classList.add('obstacle');
                    cell.textContent = '🚫';
                } else {
                    console.error(`Obstacle cell not found: cell-${row}-${col}`);
                }
            });
            
            // Mark goal
            const goalCell = document.getElementById(`cell-${this.agent.goalPos[0]}-${this.agent.goalPos[1]}`);
            if (goalCell) {
                goalCell.classList.add('goal');
                goalCell.textContent = '🎯';
            } else {
                console.error(`Goal cell not found: cell-${this.agent.goalPos[0]}-${this.agent.goalPos[1]}`);
            }
            
            // Mark agent
            const agentCell = document.getElementById(`cell-${this.agent.agentPos[0]}-${this.agent.agentPos[1]}`);
            if (agentCell) {
                agentCell.classList.add('agent');
                agentCell.textContent = '🤖';
            } else {
                console.error(`Agent cell not found: cell-${this.agent.agentPos[0]}-${this.agent.agentPos[1]}`);
            }
            
            // Mark current position as visited
            this.visitedCells.add(`${this.agent.agentPos[0]},${this.agent.agentPos[1]}`);
        }
        
        updateStats() {
            const episodeEl = document.getElementById('episode');
            const stepsEl = document.getElementById('steps');
            const totalRewardEl = document.getElementById('totalReward');
            const successRateEl = document.getElementById('successRate');
            
            if (episodeEl) episodeEl.textContent = this.agent.episode;
            if (stepsEl) stepsEl.textContent = this.agent.steps;
            if (totalRewardEl) totalRewardEl.textContent = this.agent.totalReward;
            
            const successRate = this.agent.episode > 0 ? 
                ((this.agent.successCount / this.agent.episode) * 100).toFixed(1) : 0;
            if (successRateEl) successRateEl.textContent = successRate + '%';
        }
        
        updateCurrentInfo(result = null) {
            const currentStateEl = document.getElementById('currentState');
            if (currentStateEl) {
                currentStateEl.textContent = `(${this.agent.agentPos[0]}, ${this.agent.agentPos[1]})`;
            }
            
            if (result) {
                const currentActionEl = document.getElementById('currentAction');
                const currentRewardEl = document.getElementById('currentReward');
                const currentQValueEl = document.getElementById('currentQValue');
                
                if (currentActionEl) currentActionEl.textContent = this.agent.actions[result.action];
                if (currentRewardEl) currentRewardEl.textContent = result.reward;
                if (currentQValueEl) currentQValueEl.textContent = result.qValue.toFixed(3);
            }
        }
        
        updateActionHistory() {
            const historyDiv = document.getElementById('actionHistory');
            historyDiv.innerHTML = '';
            
            this.agent.actionHistory.slice(0, 20).forEach(action => {
                const div = document.createElement('div');
                div.className = 'action-item';
                
                if (action.reward > 0) {
                    div.classList.add('reward-positive');
                } else if (action.reward < 0) {
                    div.classList.add('reward-negative');
                }
                
                div.innerHTML = `
                    <strong>E${action.episode}-S${action.step}:</strong> 
                    ${action.state} → ${action.action} → ${action.newPos}<br>
                    <small>Reward: ${action.reward}, Q: ${action.qValue}</small>
                `;
                
                historyDiv.appendChild(div);
            });
        }
        
        updateQTable() {
            const qTableDiv = document.getElementById('qTable');
            
            // Get ALL states sorted by coordinates (row, then column)
            const states = Object.keys(this.agent.qTable);
            const stateQValues = states.map(state => {
                const [row, col] = state.split(',').map(Number);
                const maxQ = Math.max(...Object.values(this.agent.qTable[state]));
                return { state, row, col, maxQ };
            }).sort((a, b) => {
                // Sort by row first, then by column
                if (a.row !== b.row) return a.row - b.row;
                return a.col - b.col;
            });
            
            let tableHTML = `
                <table class="table table-sm table-striped">
                    <thead class="table-dark">
                        <tr>
                            <th>Tọa độ</th>
                            <th>Loại</th>
                            <th>↑</th>
                            <th>→</th>
                            <th>↓</th>
                            <th>←</th>
                            <th>Max Q</th>
                            <th>Action tốt nhất</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            stateQValues.forEach(({ state, row, col }) => {
                const qValues = this.agent.qTable[state];
                const maxQ = Math.max(...Object.values(qValues));
                
                // Determine cell type
                let cellType = 'Normal';
                let cellClass = '';
                if (this.agent.isGoal(row, col)) {
                    cellType = 'Goal 🎯';
                    cellClass = 'table-warning';
                } else if (this.agent.isObstacle(row, col)) {
                    cellType = 'Obstacle 🚫';
                    cellClass = 'table-danger';
                } else if (row === this.agent.agentPos[0] && col === this.agent.agentPos[1]) {
                    cellType = 'Agent 🤖';
                    cellClass = 'table-success';
                }
                
                // Find best action
                let bestAction = '';
                const actions = ['↑', '→', '↓', '←'];
                for (let i = 0; i < 4; i++) {
                    if (qValues[i] === maxQ) {
                        bestAction += actions[i] + ' ';
                    }
                }
                
                tableHTML += `
                    <tr class="${cellClass}">
                        <td><strong>(${row}, ${col})</strong></td>
                        <td>${cellType}</td>
                        <td style="color: ${qValues[0] === maxQ ? '#198754' : '#6c757d'}; font-weight: ${qValues[0] === maxQ ? 'bold' : 'normal'}">${qValues[0].toFixed(3)}</td>
                        <td style="color: ${qValues[1] === maxQ ? '#198754' : '#6c757d'}; font-weight: ${qValues[1] === maxQ ? 'bold' : 'normal'}">${qValues[1].toFixed(3)}</td>
                        <td style="color: ${qValues[2] === maxQ ? '#198754' : '#6c757d'}; font-weight: ${qValues[2] === maxQ ? 'bold' : 'normal'}">${qValues[2].toFixed(3)}</td>
                        <td style="color: ${qValues[3] === maxQ ? '#198754' : '#6c757d'}; font-weight: ${qValues[3] === maxQ ? 'bold' : 'normal'}">${qValues[3].toFixed(3)}</td>
                        <td><strong style="color: #0d6efd">${maxQ.toFixed(3)}</strong></td>
                        <td><strong style="color: #198754">${bestAction.trim()}</strong></td>
                    </tr>
                `;
            });
            
            tableHTML += '</tbody></table>';
            qTableDiv.innerHTML = tableHTML;
        }
        
        updateDisplay() {
            this.updateGrid();
            this.updateStats();
            this.updateCurrentInfo();
            this.updateActionHistory();
            this.updateQTable();
            this.updateQUpdateInfo();
        }
        
        updateQUpdateInfo() {
            const updateInfoDiv = document.getElementById('lastUpdateDetails');
            if (!updateInfoDiv || !this.agent.lastQUpdate) return;
            
            const update = this.agent.lastQUpdate;
            const changeColor = update.qChange > 0 ? '#198754' : update.qChange < 0 ? '#dc3545' : '#6c757d';
            const changeSign = update.qChange > 0 ? '+' : '';
            
            updateInfoDiv.innerHTML = `
                <hr style="margin: 10px 0;">
                <strong>📍 Lần update gần nhất:</strong><br>
                <div style="background: #f8f9fa; padding: 8px; border-radius: 5px; margin: 5px 0;">
                    <strong>State:</strong> (${update.state}) | <strong>Action:</strong> ${update.actionName}<br>
                    <strong>Công thức:</strong> Q(${update.state}, ${update.actionName}) ← Q(${update.state}, ${update.actionName}) + α[r + γ max Q(s',a') - Q(${update.state}, ${update.actionName})]<br>
                    <strong>Tham số:</strong> α=${update.learningRate}, γ=${update.discountFactor}, r=${update.reward}<br>
                    <strong>Chi tiết:</strong> Q(${update.state}, ${update.actionName}) ← ${update.oldQ.toFixed(3)} + ${update.learningRate}[${update.reward} + ${update.discountFactor} × ${update.nextMaxQ.toFixed(3)} - ${update.oldQ.toFixed(3)}]<br>
                    <strong>Kết quả:</strong> ${update.oldQ.toFixed(3)} → <span style="color: ${changeColor}; font-weight: bold;">${update.newQ.toFixed(3)} (${changeSign}${update.qChange.toFixed(3)})</span>
                </div>
            `;
        }
        
        setupEventListeners() {
            console.log('Setting up event listeners...');
            const startBtn = document.getElementById('startBtn');
            const pauseBtn = document.getElementById('pauseBtn');
            const resetBtn = document.getElementById('resetBtn');
            const stepBtn = document.getElementById('stepBtn');
            
            if (!startBtn || !pauseBtn || !resetBtn || !stepBtn) {
                console.error('One or more buttons not found!');
                return;
            }
            
            startBtn.addEventListener('click', () => {
                console.log('Start button clicked');
                this.startTraining();
            });
            pauseBtn.addEventListener('click', () => {
                console.log('Pause button clicked');
                this.pauseTraining();
            });
            resetBtn.addEventListener('click', () => {
                console.log('Reset button clicked');
                this.resetGame();
            });
            stepBtn.addEventListener('click', () => {
                console.log('Step button clicked');
                this.stepOnce();
            });
            
            // Parameter updates
            const params = ['learningRate', 'discountFactor', 'epsilon', 'speed'];
            params.forEach(param => {
                document.getElementById(param).addEventListener('change', () => {
                    this.updateParameters();
                });
            });
        }
        
        updateParameters() {
            const learningRate = parseFloat(document.getElementById('learningRate').value);
            const discountFactor = parseFloat(document.getElementById('discountFactor').value);
            const epsilon = parseFloat(document.getElementById('epsilon').value);
            const speed = parseInt(document.getElementById('speed').value);
            
            this.agent.updateParameters(learningRate, discountFactor, epsilon, speed);
        }
        
        startTraining() {
            console.log('Starting training...');
            if (this.agent.isTraining) {
                console.log('Already training, returning');
                return;
            }
            
            this.agent.isTraining = true;
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('stepBtn').disabled = true;
            
            console.log('Training started, calling trainLoop');
            this.trainLoop();
        }
        
        pauseTraining() {
            this.agent.isTraining = false;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('stepBtn').disabled = false;
            
            if (this.agent.animationId) {
                clearTimeout(this.agent.animationId);
            }
        }
        
        resetGame() {
            this.pauseTraining();
            this.agent.reset();
            this.visitedCells.clear();
            this.updateDisplay();
        }
        
        stepOnce() {
            // Store current Q-values as previous
            this.storePreviousQValues();
            
            const result = this.agent.step();
            this.updateCurrentInfo(result);
            this.updateDisplay();
            
            if (result.done) {
                console.log(`Episode ${this.agent.episode - 1} completed with total reward: ${this.agent.episodeReward}`);
            }
        }
        
        storePreviousQValues() {
            // Deep copy current Q-values to previous
            for (const state in this.agent.qTable) {
                this.previousQValues[state] = { ...this.agent.qTable[state] };
            }
        }
        
        trainLoop() {
            if (!this.agent.isTraining) return;
            
            // Store current Q-values as previous
            this.storePreviousQValues();
            
            const result = this.agent.step();
            this.updateCurrentInfo(result);
            this.updateDisplay();
            
            if (result.done) {
                console.log(`Episode ${this.agent.episode - 1} completed with total reward: ${this.agent.episodeReward}`);
                
                // Decay epsilon over time
                if (this.agent.epsilon > 0.01) {
                    this.agent.epsilon *= 0.995;
                    document.getElementById('epsilon').value = this.agent.epsilon.toFixed(3);
                }
            }
            
            // Continue training
            this.agent.animationId = setTimeout(() => this.trainLoop(), this.agent.speed);
        }
    }

    // Initialize the game when page loads
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing game...');
        try {
            const game = new GameUI();
            console.log('Game initialized successfully');
            window.game = game; // For debugging
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    });