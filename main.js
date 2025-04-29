(function() {
    const originalOpen = window.XMLHttpRequest.prototype.open;

    window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        if (url.includes("https://services.classkick.com/v1/assignment-works/") && url.includes("questions/") && url.includes("manipulatives/")) {
            const payload = this.send.bind(this);
            this.send = function() {
                try {
                    const parsedPayload = JSON.parse(arguments[0]);
                    if (parsedPayload && parsedPayload.data && parsedPayload.data.answers) {
                        console.log("All Answers:", parsedPayload.data.answers);
                        let secondParse = JSON.parse(parsedPayload.data.answers);
                        updateAnswerDisplay(secondParse);
                    } else if (parsedPayload && parsedPayload.data && parsedPayload.data.options) {
                        console.log("Multi-choice detected.");
                        let optionsArray = JSON.parse(parsedPayload.data.options);
                        let correctAnswer;
                        for (const option of optionsArray) {
                            if (option.correct === true) {
                                correctAnswer = option.answer;
                                break;
                            }
                        }
                        document.getElementById("doxrAnswerText").innerHTML = `<span class="answer-label">Answer:</span> <span class="answer-value">${correctAnswer}</span>`;
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
                payload.apply(this, arguments);
            };
        }
        originalOpen.call(this, method, url, async, user, password);
    };
    
    function updateAnswerDisplay(answers) {
        const answerElement = document.getElementById("doxrAnswerText");
        if (answers.length == 1) {
            answerElement.innerHTML = `<span class="answer-label">Answer:</span> <span class="answer-value">${answers[0].answer}</span>`;
        } else if (answers.length > 1) {
            let answersHTML = `<span class="answer-label">Answers:</span> <ul class="answers-list">`;
            answers.forEach((answer, index) => {
                answersHTML += `<li><span class="answer-index">${index + 1}:</span> <span class="answer-value">${answer.answer}</span></li>`;
            });
            answersHTML += '</ul>';
            answerElement.innerHTML = answersHTML;
        }
    }

    function createModernUI() {
        // Add CSS styles
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            #doxrMenu {
                font-family: 'Poppins', sans-serif;
                position: fixed; /* Changed from absolute to fixed */
                top: 20px;
                left: 20px;
                width: 280px;
                background: linear-gradient(135deg, #1e2a36, #2c3e50);
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                z-index: 2147483647; /* Maximum possible z-index value */
                color: white;
                overflow: hidden;
                transition: all 0.3s ease;
                border: none;
                opacity: 1; /* Ensure full opacity */
            }
            #doxrHeader {
                padding: 12px 15px;
                background: #1a242f;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: grab;
                user-select: none;
                transition: background 0.2s ease;
            }
            #doxrHeader:hover {
                background: #152231;
            }
            #doxrHeader:active {
                cursor: grabbing;
                background: #101b27;
            }
            #doxrTitle {
                font-weight: 600;
                font-size: 15px;
                margin: 0;
                display: flex;
                align-items: center;
            }
            #doxrTitle svg {
                margin-right: 8px;
                fill: #3498db;
            }
            #doxrControls {
                display: flex;
            }
            .doxr-btn {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                margin-left: 8px;
                padding: 0;
                font-size: 16px;
                transition: color 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
            }
            .doxr-btn:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.1);
            }
            .doxr-btn.minimize-btn:hover {
                color: #f1c40f;
            }
            .doxr-btn.close-btn:hover {
                color: #e74c3c;
            }
            #doxrContent {
                padding: 15px;
                font-size: 14px;
                max-height: 300px;
                overflow-y: auto;
            }
            #doxrAnswerText {
                background: rgba(0, 0, 0, 0.15);
                border-radius: 8px;
                padding: 12px;
                margin: 0;
                border-left: 3px solid #3498db;
            }
            .answer-label {
                font-weight: 600;
                color: #3498db;
            }
            .answer-value {
                font-weight: 500;
            }
            .answers-list {
                margin: 8px 0 0 0;
                padding-left: 20px;
            }
            .answers-list li {
                margin-bottom: 6px;
            }
            .answer-index {
                font-weight: 600;
                color: #3498db;
                margin-right: 5px;
            }
            #doxrFooter {
                padding: 10px 15px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                background: rgba(0, 0, 0, 0.15);
                text-align: center;
            }
            #doxrStatus {
                padding: 8px 15px;
                font-size: 13px;
                background: #19232d;
                border-left: 3px solid #2ecc71;
            }
            .pulse {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #2ecc71;
                margin-right: 8px;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
                0% {
                    transform: scale(0.95);
                    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
                }
                70% {
                    transform: scale(1);
                    box-shadow: 0 0 0 5px rgba(46, 204, 113, 0);
                }
                100% {
                    transform: scale(0.95);
                    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
                }
            }
            .minimized #doxrContent,
            .minimized #doxrFooter,
            .minimized #doxrStatus {
                display: none;
            }
            .minimized {
                width: 180px !important;
            }
        `;
        document.head.appendChild(styleElement);

        // Load Poppins font
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        // Create UI elements
        const menuElement = document.createElement('div');
        menuElement.id = "doxrMenu";
        menuElement.innerHTML = `
            <div id="doxrHeader">
                <div id="doxrTitle">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    </svg>
                    ClassKick Assistant
                </div>
                <div id="doxrControls">
                    <button class="doxr-btn minimize-btn" title="Minimize">─</button>
                    <button class="doxr-btn close-btn" title="Close">✕</button>
                </div>
            </div>
            <div id="doxrStatus">
                <span class="pulse"></span> Monitoring answers...
            </div>
            <div id="doxrContent">
                <p id="doxrAnswerText">Open or type in a question to view the answer.</p>
            </div>
            <div id="doxrFooter">
                Type on any question to get started
            </div>
        `;
        
        // Find the first element with the class "assignment-sheet-ctn" and append the menu to it
        const assignmentSheetContainer = document.querySelector('.assignment-sheet-ctn');
        if (assignmentSheetContainer) {
            assignmentSheetContainer.appendChild(menuElement);
        } else {
            document.body.appendChild(menuElement);
        }
        
        // Add event listeners for controls
        const minimizeBtn = menuElement.querySelector('.minimize-btn');
        minimizeBtn.addEventListener('click', () => {
            menuElement.classList.toggle('minimized');
            minimizeBtn.textContent = menuElement.classList.contains('minimized') ? '□' : '─';
        });
        
        const closeBtn = menuElement.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            menuElement.style.display = 'none';
        });
        
        // Make it draggable
        makeDraggable(menuElement);
    }
    
    function makeDraggable(element) {
        const header = element.querySelector('#doxrHeader');
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let isDragging = false;
        
        // Also make the entire element draggable, not just the header
        [header, element].forEach(dragElement => {
            // Mouse events for desktop
            dragElement.addEventListener('mousedown', dragMouseDown);
            
            // Touch events for mobile
            dragElement.addEventListener('touchstart', dragTouchStart, { passive: false });
            
            // Make cursor indicate draggable
            dragElement.style.cursor = 'grab';
        });
        
        function dragMouseDown(e) {
            if (e.target.closest('.doxr-btn')) return; // Don't drag when clicking buttons
            
            e = e || window.event;
            e.preventDefault();
            document.body.style.userSelect = 'none'; // Prevent text selection during drag
            
            // Change cursor style when dragging
            header.style.cursor = 'grabbing';
            element.style.cursor = 'grabbing';
            
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Add a slight transform to indicate dragging
            element.style.transform = 'scale(1.02)';
            element.style.opacity = '0.95';
            
            // Set dragging state
            isDragging = true;
            
            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
        }
        
        function dragTouchStart(e) {
            if (e.target.closest('.doxr-btn')) return; // Don't drag when touching buttons
            
            e.preventDefault();
            document.body.style.userSelect = 'none'; // Prevent text selection during drag
            
            // Change cursor style when dragging
            header.style.cursor = 'grabbing';
            element.style.cursor = 'grabbing';
            
            // Get the touch position at startup
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
            
            // Add a slight transform to indicate dragging
            element.style.transform = 'scale(1.02)';
            element.style.opacity = '0.95';
            
            // Set dragging state
            isDragging = true;
            
            document.addEventListener('touchend', closeDragElement);
            document.addEventListener('touchcancel', closeDragElement);
            document.addEventListener('touchmove', elementTouchDrag, { passive: false });
        }
        
        function elementDrag(e) {
            if (!isDragging) return;
            
            e = e || window.event;
            e.preventDefault();
            
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Apply smooth movement with transition
            element.style.transition = 'none';
            
            // Set the element's new position with boundary checking
            const maxTop = window.innerHeight - element.offsetHeight;
            const maxLeft = window.innerWidth - element.offsetWidth;
            
            let newTop = (element.offsetTop - pos2);
            let newLeft = (element.offsetLeft - pos1);
            
            // Keep element within viewport bounds
            newTop = Math.min(Math.max(0, newTop), maxTop);
            newLeft = Math.min(Math.max(0, newLeft), maxLeft);
            
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }
        
        function elementTouchDrag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // Calculate the new touch position
            pos1 = pos3 - e.touches[0].clientX;
            pos2 = pos4 - e.touches[0].clientY;
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
            
            // Apply smooth movement with no transition during drag
            element.style.transition = 'none';
            
            // Set the element's new position with boundary checking
            const maxTop = window.innerHeight - element.offsetHeight;
            const maxLeft = window.innerWidth - element.offsetWidth;
            
            let newTop = (element.offsetTop - pos2);
            let newLeft = (element.offsetLeft - pos1);
            
            // Keep element within viewport bounds
            newTop = Math.min(Math.max(0, newTop), maxTop);
            newLeft = Math.min(Math.max(0, newLeft), maxLeft);
            
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('touchend', closeDragElement);
            document.removeEventListener('touchcancel', closeDragElement);
            document.removeEventListener('touchmove', elementTouchDrag);
            
            // Reset cursor styles
            header.style.cursor = 'grab';
            element.style.cursor = 'default';
            document.body.style.userSelect = '';
            
            // Reset transform with smooth transition back
            element.style.transition = 'all 0.2s ease';
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            
            // Reset dragging state
            isDragging = false;
        }
    }
    
    // Initialize the UI with a slight delay to ensure proper loading
    setTimeout(() => {
        createModernUI();
        
        // Add keyboard shortcut to toggle visibility (Alt+X)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'x') {
                const menu = document.getElementById('doxrMenu');
                if (menu) {
                    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                }
            }
        });
        
        // Ensure our UI stays on top if the page tries to reset z-indices
        setInterval(() => {
            const menu = document.getElementById('doxrMenu');
            if (menu) {
                menu.style.zIndex = 2147483647;
            }
        }, 2000);
    }, 500);
})();
