document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("taskForm");
    const list = document.getElementById("taskList");
    // NEW: Get reference to the audio element
    const notificationAudio = document.getElementById("notificationSound");

    // --- Task Data Initialization ---
    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");
    } catch (e) {
        console.error("Local storage error:", e);
        tasks = [];
    }

    // --- Utility Function: Time Formatting ---
    function formatTime(v) {
        if (!v) return "";
        const [h, m] = v.split(":");
        let hr = parseInt(h);
        const ampm = hr >= 12 ? "PM" : "AM";
        hr = ((hr + 11) % 12) + 1;
        return `${hr}:${m} ${ampm}`; 
    }

    // --- Core Function: Render Tasks ---
    function renderTasks() {
        list.innerHTML = "";
        
        if (tasks.length === 0) {
            list.innerHTML = `<li>No tasks yet — add a study goal!</li>`;
            return;
        }

        tasks.forEach((task, i) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${task.title}</strong>
                    <div class="timeline">${formatTime(task.time)} • ${task.date}</div>
                </div>
                <span class="remove" data-idx="${i}">&times;</span>
            `;
            list.appendChild(li);
        });

        document.querySelectorAll(".remove").forEach(btn => {
            btn.addEventListener("click", () => {
                tasks.splice(parseInt(btn.dataset.idx), 1);
                localStorage.setItem("studyTasks", JSON.stringify(tasks));
                renderTasks();
            });
        });
    }

    // --- Event Handler: Add New Task ---
    form.addEventListener("submit", e => {
        e.preventDefault(); 
        
        const title = document.getElementById("taskTitle").value.trim();
        const time = document.getElementById("taskTime").value;
        const date = document.getElementById("taskDate").value;
        
        if (!title || !time || !date) return;
        
        tasks.push({ title, time, date, notified: false });
        
        localStorage.setItem("studyTasks", JSON.stringify(tasks));
        form.reset();
        renderTasks();
    });

    // --- Notification Logic (Asking Permission) ---
    if ("Notification" in window) {
        // Request permission upfront
        Notification.requestPermission();
    }

    // --- Notification Timer ---
    setInterval(() => {
        const now = new Date();
        
        tasks.forEach((task, i) => {
            if (!task.notified) {
                const taskTime = new Date(`${task.date}T${task.time}:00`); 
                
                if (now >= taskTime) {
                    
                    // NEW: Play the notification sound reliably
                    if (notificationAudio) {
                        // Reset audio to the beginning for quick repeat notifications
                        notificationAudio.currentTime = 0; 
                        // The .catch() handles cases where browsers block autoplay
                        notificationAudio.play().catch(e => console.log('Audio blocked by browser autoplay policy:', e));
                    }

                    // Display the visual notification
                    if ("Notification" in window && Notification.permission === "granted") {
                        new Notification("🔔 Study Reminder", { 
                            body: `Time for: ${task.title}`,
                            // Note: 'sound' option is unreliable across browsers, hence the Audio API approach
                        });
                    } else {
                        alert(`Reminder: ${task.title}`);
                    }
                    
                    // Mark the task as notified
                    tasks[i].notified = true;
                    localStorage.setItem("studyTasks", JSON.stringify(tasks));
                    renderTasks(); 
                }
            }
        });
    }, 15000); // Checks every 15 seconds

    // Initial render
    renderTasks();

    // --- Typed.js and Particles.js Initialization ---
    particlesJS.load('particles-js', 'particles.json', function() { /* ... */ });
    new Typed('#typed', {
        strings: ["Focus on your goals.", "Plan your time wisely.", "Study smart, not hard."],
        typeSpeed: 50,
        backSpeed: 30,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
});
