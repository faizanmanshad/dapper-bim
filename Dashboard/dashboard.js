const SUPABASE_URL = 'https://cgpfcxdpvnminbwbecpz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncGZjeGRwdm5taW5id2JlY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzQ5NDAsImV4cCI6MjA5MDk1MDk0MH0.lL-dRFun2xE2SkuKRmb3dtFsbwOqajEezxVDDSWTEU8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// UI Elements
const userGreeting = document.getElementById('user-greeting');
const profileEmail = document.getElementById('profile-email');
const profileId = document.getElementById('profile-id');
const displayNameInput = document.getElementById('display-name-input');
const profileStatus = document.getElementById('profile-status-msg');

// 1. GATEKEEPER: Check if logged in & Fetch Licenses
async function protectRoute() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        window.location.href = '../Portal/portal.html'; 
    } else {
        const user = session.user;
        const displayName = user.user_metadata?.full_name || "Architect";
        
        userGreeting.innerText = `Welcome back, ${displayName}`;
        profileEmail.innerText = user.email;
        if(profileId) profileId.innerText = user.id;

        // Fetch their specific licenses from the profiles table
        const { data: profileData, error } = await supabaseClient
            .from('profiles')
            .select('owned_plugins')
            .eq('id', user.id)
            .single();

        const myPluginsContainer = document.querySelector('#tab-my-plugins .plugin-grid');
        
        // CLEAR the container first
        myPluginsContainer.innerHTML = '';
        
        let hasPlugins = false;

        // BULLETPROOF FIX: Convert whatever is in the database to a lowercase string
        const dbPlugins = JSON.stringify(profileData?.owned_plugins || "").toLowerCase();

        // CHECK 1: Do they own Family Forge?
        if (dbPlugins.includes('forge') || dbPlugins.includes('force')) {
            hasPlugins = true;
            myPluginsContainer.innerHTML += `
                <div class="plugin-card owned">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                        <h3 class="text-main">Family Forge</h3>
                        <span class="mono-small" style="color: #27c93f;">ACTIVE</span>
                    </div>
                    <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1.5rem; flex-grow: 1;">Automated family type generation and parameter mapping.</p>
                    
                    <select id="forge-version-select" class="form-input" style="background: var(--bg-dark); color: var(--text-main); border: 1px solid var(--border-color); margin-bottom: 1rem; padding: 0.5rem; font-size: 0.8rem; cursor: pointer; outline: none;">
                        <option style="background: var(--bg-dark); color: var(--text-main);" value="../FamilyForge_Setup_2020.exe">Revit 2020</option>
                        <option style="background: var(--bg-dark); color: var(--text-main);" value="../FamilyForge_Setup_2021.exe">Revit 2021</option>
                        <option style="background: var(--bg-dark); color: var(--text-main);" value="../FamilyForge_Setup_2022.exe">Revit 2022</option>
                        <option style="background: var(--bg-dark); color: var(--text-main);" value="../FamilyForge_Setup_2023.exe">Revit 2023</option>
                        <option style="background: var(--bg-dark); color: var(--text-main);" value="https://drive.google.com/uc?export=download&id=1Y0LciXNBC9WAkrVRtNuGU3azVApLRwky" selected>Revit 2024</option>
                        <option style="background: var(--bg-dark); color: var(--text-main);" value="../FamilyForge_Setup_2025.exe">Revit 2025</option>
                        <option style="background: var(--bg-dark); color: var(--text-main);" value="../FamilyForge_Setup_2026.exe">Revit 2026</option>
                    </select>

                    <a id="forge-download-btn" href="https://drive.google.com/uc?export=download&id=1Y0LciXNBC9WAkrVRtNuGU3azVApLRwky" class="btn btn-outline" download style="text-align:center; padding: 0.5rem; font-size: 0.8rem; border-color: #27c93f; color: #27c93f;">DOWNLOAD .EXE</a>
                </div>
            `;
            
            // NEW: Add the logic to change the download button link when the dropdown changes
            setTimeout(() => {
                const versionSelect = document.getElementById('forge-version-select');
                const downloadBtn = document.getElementById('forge-download-btn');
                
                versionSelect.addEventListener('change', (e) => {
                    downloadBtn.href = e.target.value;
                });
            }, 50);
        }

        // CHECK 2: Do they own Master Combo?
        if (dbPlugins.includes('combo')) {
            hasPlugins = true;
            // Master combo HTML can go here later
        }

        // IF THEY OWN NOTHING: Show the empty state
        if (!hasPlugins) {
            myPluginsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; border: 1px dashed var(--border-color); border-radius: 8px;">
                    <i class="ph ph-package text-muted" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p class="text-muted">You do not have any active licenses yet.</p>
                    <button class="btn btn-primary" onclick="document.querySelector('[data-target=\\'tab-store\\']').click()" style="margin-top: 1rem;">BROWSE STORE</button>
                </div>
            `;
        }
    }
}

// 💥 THE MISSING LINE: Actually call the function when the script loads!
protectRoute();


// --- UPDATE NAME LOGIC ---
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

// --- PASSWORD RESET LOGIC ---
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

// Tabs & Logout
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

// Listen for clicks inside the Store IFrame
window.addEventListener('message', (event) => {
    if (event.data.type === 'BUY_REQUEST') {
        const modal = document.getElementById('payment-modal');
        const desc = document.getElementById('pay-desc');
        
        desc.innerText = `You are purchasing ${event.data.plugin} for $${event.data.price}. Please follow the instructions below to activate your license.`;
        modal.classList.remove('hidden');
    }
});

const closePayBtn = document.getElementById('close-pay');
if(closePayBtn) {
    closePayBtn.addEventListener('click', () => {
        document.getElementById('payment-modal').classList.add('hidden');
        alert("Thank you! Once we verify your WhatsApp screenshot, your license will be activated within 1-2 hours.");
    });
}