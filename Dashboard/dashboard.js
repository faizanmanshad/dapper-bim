const SUPABASE_URL = 'https://cgpfcxdpvnminbwbecpz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncGZjeGRwdm5taW5id2JlY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzQ5NDAsImV4cCI6MjA5MDk1MDk0MH0.lL-dRFun2xE2SkuKRmb3dtFsbwOqajEezxVDDSWTEU8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// UI Elements
const userGreeting = document.getElementById('user-greeting');
const profileEmail = document.getElementById('profile-email');
const displayNameInput = document.getElementById('display-name-input');
const profileStatus = document.getElementById('profile-status-msg');

// Gatekeeper
async function protectRoute() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = '../Portal/portal.html'; 
    } else {
        const user = session.user;
        userGreeting.innerText = `Welcome back, ${user.user_metadata?.full_name || "Architect"}`;
        profileEmail.innerText = user.email;
        displayNameInput.value = user.user_metadata?.full_name || "";
    }
}
protectRoute();

// --- NEW: UPDATE NAME LOGIC ---
document.getElementById('update-name-btn').addEventListener('click', async () => {
    const newName = displayNameInput.value;
    const { data, error } = await supabaseClient.auth.updateUser({
        data: { full_name: newName }
    });

    if (error) {
        showStatus(error.message, "red");
    } else {
        showStatus("Name updated successfully!", "#27c93f");
        userGreeting.innerText = `Welcome back, ${newName}`;
    }
});

// --- NEW: PASSWORD RESET LOGIC ---
document.getElementById('reset-password-btn').addEventListener('click', async () => {
    const pass = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;

    if (pass !== confirm) {
        showStatus("Passwords do not match!", "red");
        return;
    }

    if (pass.length < 6) {
        showStatus("Password must be at least 6 characters.", "red");
        return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password: pass });

    if (error) {
        showStatus(error.message, "red");
    } else {
        showStatus("Password updated successfully!", "#27c93f");
        document.getElementById('new-password').value = "";
        document.getElementById('confirm-password').value = "";
    }
});

function showStatus(msg, color) {
    profileStatus.innerText = msg;
    profileStatus.style.color = color;
    setTimeout(() => { profileStatus.innerText = ""; }, 4000);
}

// Tabs & Logout (Keep your existing code for these)
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = '../Portal/portal.html';
});

const navItems = document.querySelectorAll('.nav-item[data-target]');
const tabContents = document.querySelectorAll('.tab-content');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-target')).classList.add('active');
        document.getElementById('page-title').innerText = item.innerText.trim();
    });
});