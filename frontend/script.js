/* ============================================
   SHRI SANJEEVAN — COMPLETE APPLICATION SCRIPT
   ============================================ */



  //  login and regiter it


  function showLogin() {
    // Switch Buttons
    document.getElementById('loginBtn').classList.add('active-btn');
    document.getElementById('registerBtn').classList.remove('active-btn');
    
    // Switch Cards
    document.getElementById('loginCard').style.display = 'block';
    document.getElementById('registerCard').style.display = 'none';
}

function showRegister() {
    // Switch Buttons
    document.getElementById('registerBtn').classList.add('active-btn');
    document.getElementById('loginBtn').classList.remove('active-btn');
    
    // Switch Cards
    document.getElementById('registerCard').style.display = 'block';
    document.getElementById('loginCard').style.display = 'none';
}

function selectRole(element) {
    const chips = element.parentElement.querySelectorAll('.role-chip');
    chips.forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}












   const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', function () {
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});


  
   
   /* Optional: close sidebar when a link is clicked */
  
   // script.js
function revealOnScroll() {
  const elements = document.querySelectorAll('.scroll-reveal');
  const windowHeight = window.innerHeight;
  elements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 50) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);



// ---- Auth Helpers ----
function getToken() { return localStorage.getItem('token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
function isLoggedIn() { return !!getToken(); }
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }
function isStaff() { const u = getUser(); return u && (u.role === 'admin' || u.role === 'staff'); }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

function requireAuth() {
  if (!isLoggedIn()) { window.location.href = '/login.html'; return false; }
  return true;
}

function requireAdmin() {
  if (!isLoggedIn()) { window.location.href = '/login.html'; return false; }
  if (!isStaff()) { window.location.href = '/form.html'; return false; }
  return true;
}

function apiHeaders(hasFile) {
  if (hasFile) {
    return { 'Authorization': 'Bearer ' + getToken() };
  }
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}

// ---- Nav Auth State ----
function updateNavForAuth() {
  const el = document.getElementById('navAuthLink');
  if (!el) return;
  if (isLoggedIn()) {
    const u = getUser();
    el.removeAttribute('href');
    el.style.cursor = 'pointer';
    el.innerHTML = `<span onclick="goToDashboard()" style="color:var(--light-gold);font-size:11px;">${u.fullName} (${u.role})</span>
      <span onclick="logout()" style="cursor:pointer;">🚪 <span class="mr-text">बाहेर</span><span class="en-text">Logout</span></span>`;
  } else {
    el.href = '/login.html';
    el.innerHTML = '<span class="mr-text">लॉगिन</span><span class="en-text">Login</span>';
  }
}

function goToDashboard() {
  const u = getUser();
  window.location.href = isStaff() ? '/admin.html' : '/form.html';
}

// ---- Language ----
function setLang(lang) {
  document.body.classList.toggle('lang-en', lang === 'en');
  const bMr = document.getElementById('btn-mr'), bEn = document.getElementById('btn-en');
  if (bMr) bMr.classList.toggle('active', lang === 'mr');
  if (bEn) bEn.classList.toggle('active', lang === 'en');
  document.documentElement.lang = lang;
}

// ---- Role Chip ----
function selectRole(el) {
  el.parentElement.querySelectorAll('.role-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

// ---- Notification ----
function showNotification(msg, type) {
  const n = document.getElementById('notification');
  if (!n) return;
  n.innerText = msg || 'Done!';
  n.classList.remove('error');
  if (type === 'error') n.classList.add('error');
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3500);
}

// ---- Date ----
const formDateEl = document.getElementById('formDate');
if (formDateEl) formDateEl.valueAsDate = new Date();

// ---- Scroll Reveal ----
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach(el => ro.observe(el));

// ========================
// LOGIN
// ========================
async function handleLogin(event) {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showNotification('ईमेल आणि पासवर्ड भरा', 'error');
    return;
  }

  const btn = event?.target?.closest('button');
  if (btn) {
    btn.classList.add('loading');
    var orig = btn.innerHTML;
    btn.innerHTML = '...';
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      showNotification(data.message, 'error');
      return;
    }

    const user = data.data.user;

    // ✅ Save login
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(user));

    // =========================
    // 🔥 ADMIN DIRECT LOGIN
    // =========================
    if (user.role === 'admin' || email.endsWith('@admin.com')) {
      showNotification("Admin Login Successful");
      window.location.href = '/admin.html';
      return;
    }

    // =========================
    // 👨‍🎓 STUDENT FLOW
    // =========================

    // 🔍 Check admission
    const admRes = await fetch('/api/admission/my', {
      headers: { 'Authorization': 'Bearer ' + data.data.token }
    });

    const admData = await admRes.json();

    // ❌ No form filled
    if (!admData.data || admData.data.length === 0) {
      showNotification("📄 Fill admission form first");
      window.location.href = '/form.html';
      return;
    }

    const admission = admData.data[0];

    // ⏳ Pending
    if (admission.status === "pending") {
      showNotification("⏳ Waiting for admin approval", "error");
      return;
    }

    if (admission.status === "pending") {
      document.body.innerHTML += "<p>⏳ Approval Pending</p>";
    }
    

    // ❌ Rejected
    if (admission.status === "rejected") {
      showNotification("❌ Rejected. Please fill form again or contact office", "error");

      // 👉 Redirect to form for retry
      setTimeout(() => {
        window.location.href = '/form.html';
      }, 1500);

      return;
    }

    // ✅ Approved
    if (admission.status === "approved") {
      showNotification("✅ Login successful");
      window.location.href = '/portal.html';
      return;
    }

  } catch (err) {
    console.error(err);
    showNotification('Server error', 'error');
  } finally {
    if (btn) {
      btn.classList.remove('loading');
      btn.innerHTML = orig;
    }
  }
}




// ========================
// REGISTER
// ========================
async function handleRegister() {
  const fullName = document.getElementById('regFullName').value.trim();
  const mobile = document.getElementById('regMobile').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  if (!fullName || !mobile || !email || !password) { showNotification('सर्व फील्ड भरा', 'error'); return; }

  const chip = document.querySelector('#registerRole .role-chip.active');
  const txt = chip ? chip.textContent : '';
  let role = 'student';
  if (txt.includes('प्रशासक') || txt.includes('Admin')) role = 'admin';
  else if (txt.includes('कर्मचारी') || txt.includes('Staff')) role = 'staff';

  const btn = event.target.closest('button');
  btn.classList.add('loading');
  const orig = btn.innerHTML;
  btn.innerHTML = '...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, mobile, email, password, role }),
    });
    const data = await res.json();
    if (data.success) {
      showNotification('नोंदणी यशस्वी! लॉगिन करा.');
      document.getElementById('regFullName').value = '';
      document.getElementById('regMobile').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regPassword').value = '';
    } else { showNotification(data.message, 'error'); }
  } catch { showNotification('सर्व्हर त्रुटी', 'error'); }
  finally { btn.classList.remove('loading'); btn.innerHTML = orig; }
}

// ========================
// CONTACT
// ========================
async function handleContactMessage() {
  const name = document.getElementById('contactName')?.value.trim();
  const msg = document.getElementById('contactMessage')?.value.trim();
  if (!name || !msg) { showNotification('नाव आणि संदेश भरा', 'error'); return; }
  showNotification('संदेश पाठवला!');
  document.getElementById('contactName').value = '';
  document.getElementById('contactMobile').value = '';
  document.getElementById('contactMessage').value = '';
}

function updateNavForAuth() {
  const el = document.getElementById('navAuthLink');
  const admLink = document.getElementById('navAdmissionLink');
  if (!el) return;

  if (isLoggedIn()) {
    const u = getUser();
    el.removeAttribute('href');
    el.style.cursor = 'pointer';
    el.innerHTML = `
      <span onclick="goToDashboard()" style="color:var(--light-gold);font-size:11px;">
        ${u.fullName} (${u.role})
      </span>
      <span onclick="logout()" style="cursor:pointer;">
        🚪 <span class="mr-text">बाहेर</span><span class="en-text">Logout</span>
      </span>
    `;
  } else {
    el.href = '/login.html';
    el.innerHTML = '<span class="mr-text">लॉगिन</span><span class="en-text">Login</span>';
  }

  // Admission/Portal link
  if (admLink) {
    if (isLoggedIn() && !isStaff()) {
      admLink.href = '/portal.html';
    } else {
      admLink.href = '/portal.html';
    }
  }
}


// ========================
// ADMISSION FORM (Student)
// ========================
async function submitForm() {
  if (!requireAuth()) return;
  const v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  const data = {
    formDate: v('formDate'), academicYear: v('academicYear'), formNo: v('formNo'), regNo: v('regNo'),
    fullName: v('studentName'), fatherName: v('fatherName'), motherName: v('motherName'),
    dob: v('dob'), mobile: v('studentMobile'), altMobile: v('altMobile'),
    religion: v('religion'), grade: v('grade'),
    studentAadhaar: v('studentAadhaar'), fatherAadhaar: v('fatherAadhaar'), motherAadhaar: v('motherAadhaar'),
    permanentAddress: v('permanentAddress'), currentAddress: v('currentAddress'), phoneOrEmail: v('phoneOrEmail'),
    relativeName: v('relativeName'), relativeMobile: v('relativeMobile'), relativeAddress: v('relativeAddress'),
    marathiReading: v('marathiReading'), englishReading: v('englishReading'),
    tablesKnowledge: v('tablesKnowledge'), spiritualEducation: v('spiritualEducation'),
    hobbies: v('hobbies'), parentExpectations: v('parentExpectations'),
  };

  const reqIds = ['studentName', 'fatherName', 'motherName', 'dob', 'studentMobile', 'grade'];
  let err = false;
  reqIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) { el.classList.add('error'); err = true; }
    else if (el) el.classList.remove('error');
  });
  if (err) { showNotification('सर्व आवश्यक फील्ड (*) भरा', 'error'); return; }

  const btn = document.querySelector('.form-submit-area .btn-primary');
  btn.classList.add('loading');
  const orig = btn.innerHTML;
  btn.innerHTML = '...';

  try {
    const res = await fetch('/api/admission', {
      method: 'POST', headers: apiHeaders(false), body: JSON.stringify(data),
    });
    const r = await res.json();
    if (r.success) {
      showNotification('✓ अर्ज यशस्वी!');
      document.getElementById('admissionForm')?.reset();
      if (formDateEl) formDateEl.valueAsDate = new Date();
      loadMyApplications();
    } else { showNotification(r.message, 'error'); }
  } catch { showNotification('सर्व्हर त्रुटी', 'error'); }
  finally { btn.classList.remove('loading'); btn.innerHTML = orig; }
}




async function loadProgressStudents() {
  try {
    const res = await fetch('/api/admission', {
      headers: apiHeaders()
    });

    const r = await res.json();

    if (!r.success) return;

    const list = r.data;
    const tbody = document.getElementById('progressTableBody');

    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7">No students found</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr>
        <td>${s.fullName || '-'}</td>

        <td>
          <input type="text" id="mr_${s.id}" value="${s.marathiReading || ''}" placeholder="Marathi">
        </td>

        <td>
          <input type="text" id="en_${s.id}" value="${s.englishReading || ''}" placeholder="English">
        </td>

        <td>
          <input type="text" id="sp_${s.id}" value="${s.spiritualEducation || ''}" placeholder="Spiritual">
        </td>

        <td>
          <input type="text" id="tb_${s.id}" value="${s.tablesKnowledge || ''}" placeholder="Tables">
        </td>

        <td>
          <input type="text" id="note_${s.id}" value="${s.progressNote || ''}" placeholder="Note">
        </td>

        <td>
          <button onclick="saveProgress(${s.id})">💾 Save</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error(err);
  }
}


async function loadMyApplications() {
  const box = document.getElementById('myApplicationsList');
  if (!box) return;
  try {
    const res = await fetch('/api/admission/my', { headers: apiHeaders(false) });
    const r = await res.json();
    if (!r.success || !r.data.length) { box.innerHTML = '<p style="color:var(--soft-brown);font-style:italic;">कोणतेही अर्ज नाहीत</p>'; return; }
    box.innerHTML = r.data.map(a => `
      <div class="my-app-card">
        <div class="my-app-info"><strong>${a.fullName}</strong> — ${a.grade} | ${new Date(a.formDate).toLocaleDateString('en-IN')}</div>
        <span class="badge badge-${a.status==='approved'?'present':a.status==='rejected'?'absent':'new'}">${a.status.toUpperCase()}</span>
      </div>`).join('');
  } catch { box.innerHTML = '<p style="color:var(--lotus-pink);">Error</p>'; }
}

// ========================
// ADMIN: Load Data
// ========================
async function loadAdminStats() {
  try {
    const res = await fetch('/api/admission/stats/count', { headers: apiHeaders(false) });
    const r = await res.json();
    if (r.success) {
      const s = r.data;
      document.getElementById('statTotal').textContent = s.total;
      document.getElementById('statPending').textContent = s.pending;
      document.getElementById('statApproved').textContent = s.approved;
      document.getElementById('statStudents').textContent = s.total;
    }
  } catch {}
}

async function loadAdminStudents() {
  const box = document.getElementById('studentsListBody');
  if (!box) return;
  try {
    const res = await fetch('/api/auth/students', { headers: apiHeaders(false) });
    const r = await res.json();
    if (!r.success || !r.data.length) { box.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;">कोणतेही विद्यार्थी नाहीत</td></tr>'; return; }
    box.innerHTML = r.data.map(s => `
      <tr>
        <td>${s.fullName}</td>
        <td>${s.email}</td>
        <td>${s.mobile || '—'}</td>
        <td>${new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
      </tr>`).join('');
  } catch { box.innerHTML = '<tr><td colspan="4">Error</td></tr>'; }
}

async function loadAdminAdmissions() {
  const tbody = document.getElementById('adminAdmissionsBody');
  if (!tbody) return;
  try {
    const res = await fetch('/api/admission', { headers: apiHeaders(false) });
    const r = await res.json();
    if (!r.success) { tbody.innerHTML = '<tr><td colspan="6">Error</td></tr>'; return; }
    loadAdminStats();
    if (!r.data.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">कोणतेही अर्ज नाहीत</td></tr>'; return; }
    tbody.innerHTML = r.data.map(a => `
      <tr>
        <td style="cursor:pointer;color:var(--light-gold);text-decoration:underline;" onclick="viewAdmissionDetail(${a.id})">${a.fullName}</td>
        <td>${a.grade}</td>
        <td>${a.fatherName}</td>
        <td>${a.mobile}</td>
        <td><span class="badge badge-${a.status==='approved'?'present':a.status==='rejected'?'absent':'new'}">${a.status.toUpperCase()}</span></td>
        <td class="admin-actions">
          ${a.status==='pending'?`<button class="admin-btn approve" onclick="updateAdmStatus(${a.id},'approved')">✓</button><button class="admin-btn reject" onclick="updateAdmStatus(${a.id},'rejected')">✗</button>`:''}
          <button class="admin-btn delete" onclick="deleteAdm(${a.id})">🗑</button>
        </td>
      </tr>`).join('');
  } catch { tbody.innerHTML = '<tr><td colspan="6">Server error</td></tr>'; }
}

async function updateAdmStatus(id, status) {
  try {
    const res = await fetch(`/api/admission/${id}/status`, {
      method: 'PATCH', headers: apiHeaders(false), body: JSON.stringify({ status }),
    });
    const r = await res.json();
    if (r.success) { showNotification(`Status: ${status}`); loadAdminAdmissions(); }
    else showNotification(r.message, 'error');
  } catch { showNotification('Server error', 'error'); }
}

async function deleteAdm(id) {
  if (!confirm('हा अर्ज हटवायचा? / Delete?')) return;
  try {
    const res = await fetch(`/api/admission/${id}`, { method: 'DELETE', headers: apiHeaders(false) });
    const r = await res.json();
    if (r.success) { showNotification('हटवला'); loadAdminAdmissions(); }
    else showNotification(r.message, 'error');
  } catch { showNotification('Error', 'error'); }
}

// ========================
// ADMIN: View Full Detail Modal
// ========================
async function viewAdmissionDetail(id) {
  try {
    const res = await fetch(`/api/admission/${id}`, { headers: apiHeaders(false) });
    const r = await res.json();
    if (!r.success) { showNotification('Not found', 'error'); return; }
    const a = r.data;

    const modal = document.getElementById('detailModal');
    const body = document.getElementById('detailModalBody');

    body.innerHTML = `
      <div class="detail-section"><div class="detail-section-title">विद्यार्थ्याची माहिती / Student Details</div>
        <div class="detail-grid">
          <div class="detail-row"><span>नाव / Name:</span><strong>${a.fullName}</strong></div>
          <div class="detail-row"><span>वडील / Father:</span><strong>${a.fatherName}</strong></div>
          <div class="detail-row"><span>आई / Mother:</span><strong>${a.motherName}</strong></div>
          <div class="detail-row"><span>जन्म तारीख / DOB:</span><strong>${a.dob ? new Date(a.dob).toLocaleDateString('en-IN') : '—'}</strong></div>
          <div class="detail-row"><span>मोबाईल / Mobile:</span><strong>${a.mobile}</strong></div>
          <div class="detail-row"><span>पर्यायी / Alt Mobile:</span><strong>${a.altMobile || '—'}</strong></div>
          <div class="detail-row"><span>धर्म / Religion:</span><strong>${a.religion || '—'}</strong></div>
          <div class="detail-row"><span>इयत्ता / Grade:</span><strong>${a.grade}</strong></div>
        </div>
      </div>
      <div class="detail-section"><div class="detail-section-title">आधार क्रमांक / Aadhaar</div>
        <div class="detail-grid">
          <div class="detail-row"><span>विद्यार्थी:</span><strong>${a.studentAadhaar || '—'}</strong></div>
          <div class="detail-row"><span>वडील:</span><strong>${a.fatherAadhaar || '—'}</strong></div>
          <div class="detail-row"><span>आई:</span><strong>${a.motherAadhaar || '—'}</strong></div>
        </div>
      </div>
      <div class="detail-section"><div class="detail-section-title">पत्ता / Address</div>
        <div class="detail-grid">
          <div class="detail-row full"><span>कायमचा पत्ता:</span><strong>${a.permanentAddress || '—'}</strong></div>
          <div class="detail-row full"><span>सध्याचा पत्ता:</span><strong>${a.currentAddress || '—'}</strong></div>
          <div class="detail-row"><span>ई-मेल:</span><strong>${a.phoneOrEmail || '—'}</strong></div>
        </div>
      </div>
      <div class="detail-section"><div class="detail-section-title">नातेवाईक / Relative</div>
        <div class="detail-grid">
          <div class="detail-row"><span>नाव:</span><strong>${a.relativeName || '—'}</strong></div>
          <div class="detail-row"><span>मोबाईल:</span><strong>${a.relativeMobile || '—'}</strong></div>
          <div class="detail-row full"><span>पत्ता:</span><strong>${a.relativeAddress || '—'}</strong></div>
        </div>
      </div>
      <div class="detail-section"><div class="detail-section-title">प्रगती / Previous Progress</div>
        <div class="detail-grid">
          <div class="detail-row"><span>मराठी वाचन:</span><strong>${a.marathiReading || '—'}</strong></div>
          <div class="detail-row"><span>इंग्रजी वाचन:</span><strong>${a.englishReading || '—'}</strong></div>
          <div class="detail-row"><span>पाढे:</span><strong>${a.tablesKnowledge || '—'}</strong></div>
          <div class="detail-row"><span>अध्यात्मिक:</span><strong>${a.spiritualEducation || '—'}</strong></div>
          <div class="detail-row"><span>आवड:</span><strong>${a.hobbies || '—'}</strong></div>
          <div class="detail-row"><span>पालकांची अपेक्षा:</span><strong>${a.parentExpectations || '—'}</strong></div>
        </div>
      </div>
      <div class="detail-section"><div class="detail-section-title">अर्ज माहिती / Form Info</div>
        <div class="detail-grid">
          <div class="detail-row"><span>दिनांक:</span><strong>${a.formDate ? new Date(a.formDate).toLocaleDateString('en-IN') : '—'}</strong></div>
          <div class="detail-row"><span>वर्ष:</span><strong>${a.academicYear || '—'}</strong></div>
          <div class="detail-row"><span>फॉर्म नं.:</span><strong>${a.formNo || '—'}</strong></div>
          <div class="detail-row"><span>रजि. नं.:</span><strong>${a.regNo || '—'}</strong></div>
          <div class="detail-row"><span>स्थिती / Status:</span><strong class="badge badge-${a.status==='approved'?'present':a.status==='rejected'?'absent':'new'}" style="font-size:13px;">${a.status.toUpperCase()}</strong></div>
        </div>
      </div>
      ${a.status === 'pending' ? `
        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;">
          <button class="btn-primary" style="background:var(--green-leaf);" onclick="updateAdmStatus(${a.id},'approved');closeModal();">✓ मंजूर / Approve</button>
          <button class="btn-primary" style="background:var(--lotus-pink);" onclick="updateAdmStatus(${a.id},'rejected');closeModal();">✗ नामंजूर / Reject</button>
        </div>` : ''}
    `;
    modal.classList.add('show');
  } catch { showNotification('Error', 'error'); }
}

function closeModal() {
  document.getElementById('detailModal')?.classList.remove('show');
}

// ========================
// ADMIN: Gallery
// ========================
async function loadAdminGallery() {
  const box = document.getElementById('adminGalleryGrid');
  if (!box) return;
  try {
    const res = await fetch('/api/gallery');
    const r = await res.json();
    if (!r.success || !r.data.length) { box.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.4);padding:30px;">कोणतेही छायाचित्र नाहीत</p>'; return; }
    box.innerHTML = r.data.map(img => `
      <div class="admin-gallery-item">
        <img src="${img.imageUrl}" alt="${img.titleEn}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="gallery-placeholder" style="display:none;">📷<p>${img.titleEn}</p></div>
        <div class="admin-gallery-overlay">
          <div class="admin-gallery-title">${img.titleMr} / ${img.titleEn}</div>
          <button class="admin-btn delete" onclick="deleteGalleryImg(${img.id})">🗑 Delete</button>
        </div>
      </div>`).join('');
  } catch { box.innerHTML = '<p>Error</p>'; }
}

async function handleGalleryUpload() {
  const form = document.getElementById('galleryUploadForm');
  if (!form) return;
  const fd = new FormData(form);
  if (!fd.get('image') || fd.get('image').name === '') { showNotification('छायाचित्र निवडा', 'error'); return; }

  try {
    const res = await fetch('/api/gallery', {
      method: 'POST', headers: apiHeaders(true), body: fd,
    });
    const r = await res.json();
    if (r.success) {
      showNotification('छायाचित्र जोडले!');
      form.reset();
      loadAdminGallery();
      loadPublicGallery();
    } else showNotification(r.message, 'error');
  } catch { showNotification('Error', 'error'); }
}

async function deleteGalleryImg(id) {
  if (!confirm('हटवायचे? / Delete?')) return;
  try {
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE', headers: apiHeaders(false) });
    const r = await res.json();
    if (r.success) { showNotification('हटवले'); loadAdminGallery(); loadPublicGallery(); }
    else showNotification(r.message, 'error');
  } catch { showNotification('Error', 'error'); }
}

// ========================
// ADMIN: Updates
// ========================
async function loadAdminUpdates() {
  const box = document.getElementById('adminUpdatesList');
  if (!box) return;
  try {
    const res = await fetch('/api/updates');
    const r = await res.json();
    if (!r.success || !r.data.length) { box.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:20px;">कोणतेही अपडेट नाही</p>'; return; }
    box.innerHTML = r.data.map(u => `
      <div class="admin-update-item">
        <div><span style="color:var(--light-gold);font-size:11px;font-family:'Cinzel',serif;letter-spacing:1px;">${u.dateLabel}</span>
          <strong style="display:block;margin-top:4px;">${u.titleMr} / ${u.titleEn}</strong>
          <p style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">${u.bodyMr.substring(0, 80)}...</p></div>
        <button class="admin-btn delete" onclick="deleteUpdate(${u.id})">🗑</button>
      </div>`).join('');
  } catch { box.innerHTML = '<p>Error</p>'; }
}

async function handleAddUpdate() {
  const dateLabel = document.getElementById('updDateLabel').value.trim();
  const titleMr = document.getElementById('updTitleMr').value.trim();
  const titleEn = document.getElementById('updTitleEn').value.trim();
  const bodyMr = document.getElementById('updBodyMr').value.trim();
  const bodyEn = document.getElementById('updBodyEn').value.trim();

  if (!titleMr || !titleEn || !bodyMr || !bodyEn) { showNotification('सर्व फील्ड भरा', 'error'); return; }

  try {
    const res = await fetch('/api/updates', {
      method: 'POST', headers: apiHeaders(false),
      body: JSON.stringify({ dateLabel, titleMr, titleEn, bodyMr, bodyEn }),
    });
    const r = await res.json();
    if (r.success) {
      showNotification('अपडेट जोडले!');
      document.getElementById('updDateLabel').value = '';
      document.getElementById('updTitleMr').value = '';
      document.getElementById('updTitleEn').value = '';
      document.getElementById('updBodyMr').value = '';
      document.getElementById('updBodyEn').value = '';
      loadAdminUpdates();
      loadPublicUpdates();
    } else showNotification(r.message, 'error');
  } catch { showNotification('Error', 'error'); }
}

async function deleteUpdate(id) {
  if (!confirm('हटवायचे? / Delete?')) return;
  try {
    const res = await fetch(`/api/updates/${id}`, { method: 'DELETE', headers: apiHeaders(false) });
    const r = await res.json();
    if (r.success) { showNotification('हटवले'); loadAdminUpdates(); loadPublicUpdates(); }
    else showNotification(r.message, 'error');
  } catch { showNotification('Error', 'error'); }
}

// ========================
// PUBLIC: Load Gallery + Updates on index
// ========================

// --- MODAL EVENTS ---



// ========================
// LOAD ALL GALLERY (HOMEPAGE)
// ========================




async function loadPublicGallery() {
  const box = document.getElementById('publicGalleryGrid');
  if (!box) return;

  try {
    const res = await fetch('/api/gallery');
    const r = await res.json();

    if (!r.success || !r.data.length) {
      box.innerHTML = `<p style="color:white;text-align:center;">No Images Found</p>`;
      return;
    }

    box.innerHTML = r.data.map(img => `
      <div class="gallery-item" onclick="openGallery('${img.id}', '${img.category}')">

        <img src="${img.imageUrl}" 
             alt="${img.titleEn}"
             loading="lazy"
             style="width:100%;height:100%;object-fit:cover;">

        <div class="gallery-caption">
          ${img.titleMr}<br>
          <span style="font-size:11px;opacity:0.7;">${img.titleEn}</span>
        </div>

      </div>
    `).join('');

  } catch (err) {
    console.log(err);
  }
}


// 👉 CLICK FUNCTION
function openGallery(id, category) {
  window.location.href = `gallery.html?id=${id}&category=${category}`;
}


























async function loadPublicUpdates() {
  const box = document.getElementById('publicUpdatesGrid');
  if (!box) return;

  try {
    // ✅ FIXED: Use GET instead of POST to fetch updates
    const res = await fetch('/api/updates', {
      method: 'GET',  // ✅ Changed from POST to GET
      headers: { 'Content-Type': 'application/json' }
    });

    // ✅ Check server response
    if (!res.ok) {
      throw new Error("Server error: " + res.status);
    }

    const r = await res.json();

    // ✅ No data
    if (!r.success || !r.data || r.data.length === 0) {
      box.innerHTML = `
        <p style="color:var(--soft-brown);text-align:center;">
          कोणतेही अपडेट नाहीत
        </p>`;
      return;
    }

    // ✅ Render updates
    box.innerHTML = r.data.map(u => `
      <div class="update-card">

        <div class="update-card-header">
          <div class="update-date">${u.dateLabel || ''}</div>

          <div class="update-title mr-text">
            ${u.titleMr || ''}
          </div>

          <div class="update-title en-text">
            ${u.titleEn || ''}
          </div>
        </div>

        <div class="update-body mr-text">
          ${u.bodyMr || ''}
        </div>

        <div class="update-body en-text">
          ${u.bodyEn || ''}
        </div>

      </div>
    `).join('');

  } catch (err) {
    console.error("❌ अपडेट लोड error:", err);

    box.innerHTML = `
      <p style="color:red;text-align:center;">
        Failed to load updates 😢
      </p>`;
  }
}













// ========================
// ADMIN TAB SWITCHING
// ========================
function switchAdminTab(tabName, el) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));

  const tab = document.getElementById('tab-' + tabName);
  if (tab) tab.style.display = 'block';

  if (el) el.classList.add('active');

  // Load data
  if (tabName === 'admissions') loadAdminAdmissions();
  if (tabName === 'students') loadAdminStudents();
  if (tabName === 'gallery') loadAdminGallery();
  if (tabName === 'updates') loadAdminUpdates();
}

function switchAdminTab(tab, el) {
  document.querySelectorAll('.admin-tab-content').forEach(d => d.style.display = 'none');
  document.getElementById('tab-' + tab).style.display = 'block';

  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');

  if (tab === 'progress') {
    loadProgressStudents();
  }
};



async function saveProgress(id) {
  const marathiReading = document.getElementById(`mr_${id}`).value;
  const englishReading = document.getElementById(`en_${id}`).value;
  const spiritualEducation = document.getElementById(`sp_${id}`).value;
  const tablesKnowledge = document.getElementById(`tb_${id}`).value;
  const progressNote = document.getElementById(`note_${id}`).value;

  try {
    const res = await fetch(`/api/admission/${id}`, {
      method: 'PUT',
      headers: apiHeaders(),
      body: JSON.stringify({
        marathiReading,
        englishReading,
        spiritualEducation,
        tablesKnowledge,
        progressNote
      })
    });

    const r = await res.json();

    if (r.success) {
      showNotification('✅ Progress Updated');
    } else {
      showNotification('❌ Failed', 'error');
    }

  } catch (err) {
    console.error(err);
    showNotification('Server error', 'error');
  }
}


// ========================
// PAGE INIT2
// ========================
document.addEventListener('DOMContentLoaded', () => {
  updateNavForAuth();

  // Index page
  loadPublicGallery();
  loadPublicUpdates();

  // Form page
  if (document.getElementById('myApplicationsList') && requireAuth()) loadMyApplications();

  // Admin page
  if (document.getElementById('adminAdmissionsBody') && requireAdmin()) {
    loadAdminStats();
    loadAdminAdmissions();
  }

  // Show user bar
  const user = getUser();
  const formBar = document.getElementById('formUserBar');
  if (formBar && user) formBar.innerHTML = `<span class="mr-text">स्वागत,</span><span class="en-text">Welcome,</span> <strong>${user.fullName}</strong> <span style="opacity:0.5;">(${user.role})</span>`;
  const adminBar = document.getElementById('adminUserBar');
  if (adminBar && user) adminBar.innerHTML = `<span class="mr-text">प्रशासक:</span><span class="en-text">Admin:</span> <strong>${user.fullName}</strong>`;
});

// Close modal on background click
document.addEventListener('click', (e) => {
  if (e.target.id === 'detailModal') closeModal();
});