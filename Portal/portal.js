console.log("✅ Portal JS successfully loaded!");

const SUPABASE_URL = 'https://cgpfcxdpvnminbwbecpz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncGZjeGRwdm5taW5id2JlY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzQ5NDAsImV4cCI6MjA5MDk1MDk0MH0.lL-dRFun2xE2SkuKRmb3dtFsbwOqajEezxVDDSWTEU8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const formTitle = document.getElementById('form-title');
const authForm = document.getElementById('auth-form');

// Inputs
const nameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Buttons & UI
const submitBtn = document.getElementById('submit-btn');
const googleBtn = document.getElementById('google-btn');
const statusMsg = document.getElementById('status-msg');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');
const userEmailDisplay = document.getElementById('user-email-display');
const logoutBtn = document.getElementById('logout-btn');

let isLoginMode = true;

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        showDashboard(session.user);
    } else {
        showAuth();
    }
}

function showDashboard(user) {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    // Display their Name if available, otherwise fallback to Email
    const displayName = user.user_metadata?.full_name || user.email;
    userEmailDisplay.innerText = `Welcome, ${displayName}`;
}

function showAuth() {
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    authForm.reset();
}

// TOGGLE LOGIC
toggleLink.addEventListener('click', (e) => {
    e.preventDefault(); 
    isLoginMode = !isLoginMode;
    statusMsg.innerText = "";
    
    if (isLoginMode) {
        formTitle.innerText = "Access Portal";
        submitBtn.innerText = "LOG IN";
        toggleText.innerText = "Don't have an account?";
        toggleLink.innerText = "Sign Up";
        nameInput.classList.add('hidden'); // Hide name on Login
        nameInput.required = false;
    } else {
        formTitle.innerText = "Create Account";
        submitBtn.innerText = "SIGN UP";
        toggleText.innerText = "Already have an account?";
        toggleLink.innerText = "Log In";
        nameInput.classList.remove('hidden'); // Show name on Sign Up
        nameInput.required = true;
    }
});

// FORM SUBMIT LOGIC (Email / Password)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "PLEASE WAIT...";
    statusMsg.innerText = "";
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const fullName = nameInput.value;

    if (isLoginMode) {
        // LOG IN
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            statusMsg.style.color = "var(--neon-orange)";
            // Friendly error message if they haven't verified their email yet
            if (error.message.includes("Email not confirmed")) {
                statusMsg.innerText = "Please check your inbox and verify your email first.";
            } else {
                statusMsg.innerText = error.message;
            }
        } else {
            statusMsg.style.color = "#27c93f";
            statusMsg.innerText = "Success! Loading dashboard...";
            setTimeout(() => showDashboard(data.user), 1000);
        }
    } else {
        // SIGN UP
        const { data, error } = await supabaseClient.auth.signUp({ 
            email, 
            password,
            options: {
                data: { full_name: fullName } // Saves the user's name to the database!
            }
        });
        
        if (error) {
            statusMsg.style.color = "var(--neon-orange)";
            statusMsg.innerText = error.message;
        } else {
            statusMsg.style.color = "#27c93f";
            // Inform the user they must check their email
            statusMsg.innerText = "Account created! Check your email to verify your account.";
            authForm.reset();
            setTimeout(() => toggleLink.click(), 3000); 
        }
    }
    
    submitBtn.disabled = false;
    submitBtn.innerText = isLoginMode ? "LOG IN" : "SIGN UP";
});

// GOOGLE AUTH LOGIC
googleBtn.addEventListener('click', async () => {
    // This triggers the Supabase Google Login popup
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        console.error("Google Auth Error:", error);
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    showAuth();
});

checkSession();