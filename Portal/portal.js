const SUPABASE_URL = 'https://cgpfcxdpvnminbwbecpz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncGZjeGRwdm5taW5id2JlY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzQ5NDAsImV4cCI6MjA5MDk1MDk0MH0.lL-dRFun2xE2SkuKRmb3dtFsbwOqajEezxVDDSWTEU8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const formTitle = document.getElementById('form-title');
const authForm = document.getElementById('auth-form');
const nameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const googleBtn = document.getElementById('google-btn');
const statusMsg = document.getElementById('status-msg');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');

let isLoginMode = true;

// 1. If already logged in, instantly redirect to dashboard
async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.href = '../Dashboard/dashboard.html'; // REDIRECT!
    }
}
checkSession();

// 2. Toggle UI
toggleLink.addEventListener('click', (e) => {
    e.preventDefault(); 
    isLoginMode = !isLoginMode;
    statusMsg.innerText = "";
    
    if (isLoginMode) {
        formTitle.innerText = "Access Portal";
        submitBtn.innerText = "LOG IN";
        toggleText.innerText = "Don't have an account?";
        toggleLink.innerText = "Sign Up";
        nameInput.classList.add('hidden');
        nameInput.required = false;
    } else {
        formTitle.innerText = "Create Account";
        submitBtn.innerText = "SIGN UP";
        toggleText.innerText = "Already have an account?";
        toggleLink.innerText = "Log In";
        nameInput.classList.remove('hidden');
        nameInput.required = true;
    }
});

// 3. Submit Form
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "PLEASE WAIT...";
    statusMsg.innerText = "";
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const fullName = nameInput.value;

    if (isLoginMode) {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            statusMsg.style.color = "var(--neon-orange)";
            statusMsg.innerText = error.message.includes("Email not confirmed") 
                ? "Please check your inbox and verify your email first." 
                : error.message;
        } else {
            statusMsg.style.color = "#27c93f";
            statusMsg.innerText = "Success! Redirecting...";
            // REDIRECT TO DASHBOARD ON SUCCESS
            // FIXED: Go UP one level, then into the Dashboard folder
            setTimeout(() => window.location.href = '../Dashboard/dashboard.html', 1000);
        }
    } else {
        const { error } = await supabaseClient.auth.signUp({ 
            email, password, options: { data: { full_name: fullName } }
        });
        
        if (error) {
            statusMsg.style.color = "var(--neon-orange)";
            statusMsg.innerText = error.message;
        } else {
            statusMsg.style.color = "#27c93f";
            statusMsg.innerText = "Account created! Check your email to verify.";
            authForm.reset();
            setTimeout(() => toggleLink.click(), 3000); 
        }
    }
    submitBtn.disabled = false;
    submitBtn.innerText = isLoginMode ? "LOG IN" : "SIGN UP";
});

// 4. Google Auth
googleBtn.addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error(error);
});