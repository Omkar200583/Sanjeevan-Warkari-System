
        // ============ PARTICLES ============
        (function () { const c = document.getElementById('particles'); for (let i = 0; i < 20; i++) { const p = document.createElement('div'); p.className = 'particle'; p.style.cssText = `left:${Math.random() * 100}%;bottom:0;width:${Math.random() * 3 + 1}px;height:${Math.random() * 3 + 1}px;animation-duration:${Math.random() * 15 + 8}s;animation-delay:${Math.random() * 10}s;`; c.appendChild(p); } })();

        // ============ HELPERS ============
        function getToken() { return localStorage.getItem('token'); }
        function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
        function showToast(icon, title, sub) { document.querySelector('.toast-icon').textContent = icon; document.getElementById('toastTitle').textContent = title; document.getElementById('toastSub').textContent = sub; const t = document.getElementById('toast'); t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3500); }

        function switchScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }

        // ============ LANGUAGE ============
        function toggleLang(lang, btn) { document.querySelectorAll('.lang-opt').forEach(b => b.classList.remove('active')); btn.classList.add('active'); document.querySelectorAll('.mr-text').forEach(el => el.style.display = lang === 'mr' ? '' : 'none'); document.querySelectorAll('.en-text').forEach(el => el.style.display = lang === 'en' ? 'none' : ''); }

        // ============ NAVIGATE ============
        function navigate(page) { document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); const el = document.querySelector(`.nav-item[onclick*="${page}"]`); if (el) el.classList.add('active'); document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); const view = document.getElementById('view-' + page); if (view) { view.classList.add('active'); document.getElementById('mainContent').scrollTop = 0; } }

        // ============ LOGOUT ============
        function doLogout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login.html'; }

        // ============ INFO ROW BUILDER ============
        function infoRow(key, val) { return `<div class="info-row"><span class="info-key">${key}</span><span class="info-val">${val || '—'}</span></div>`; }

        // ============ DATE ============
        document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // ============ CALENDAR ============
        function buildCalendar() { const grid = document.getElementById('calGrid'); if (!grid) return; const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; const today = new Date().getDate(); const month = new Date().getMonth(); const year = new Date().getFullYear(); const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate(); let html = days.map(d => `<div class="cal-day-name">${d}</div>`).join(''); for (let i = 0; i < firstDay; i++)html += `<div class="cal-day empty"></div>`; for (let d = 1; d <= daysInMonth; d++) { let cls = 'cal-day'; if (d === today) cls += ' today'; else if (Math.random() > 0.9) cls += ' absent'; else cls += ' present'; html += `<div class="${cls}">${d}</div>`; } grid.innerHTML = html; }

        // ============ PROGRESS BARS FROM ADMISSION DATA ============
        function buildProgress(a) {
            const map = { 'उत्तम': 95, 'बरे': 75, 'कमकुवत': 40, 'Good': 80, 'Average': 60, 'Weak': 30, '1–5': 30, '1–10': 60, '1–20': 85, 'सुरुवात': 35, 'निवडा': 0, 'Select': 0 }; const pct = v => { if (!v) return 0; return map[v] || 50; }; return `
    <div class="progress-bar-wrap"><div class="progress-label"><span class="mr-text">मराठी वाचन</span><span class="en-text" style="display:none">Marathi Reading</span><span>${a.marathiReading || '—'}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct(a.marathiReading)}%"></div></div></div>
    <div class="progress-bar-wrap"><div class="progress-label"><span class="mr-text">इंग्रजी वाचन</span><span class="en-text" style="display:none">English Reading</span><span>${a.englishReading || '—'}</span></div><div class="progress-track"><div class="progress-fill blue" style="width:${pct(a.englishReading)}%"></div></div></div>
    <div class="progress-bar-wrap"><div class="progress-label"><span class="mr-text">पाढे</span><span class="en-text" style="display:none">Tables</span><span>${a.tablesKnowledge || '—'}</span></div><div class="progress-track"><div class="progress-fill green" style="width:${pct(a.tablesKnowledge)}%"></div></div></div>
    <div class="progress-bar-wrap"><div class="progress-label"><span class="mr-text">अध्यात्मिक शिक्षण</span><span class="en-text" style="display:none">Spiritual</span><span>${a.spiritualEducation || '—'}</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct(a.spiritualEducation)}%"></div></div></div>`;
        }

        // ============ LOAD UPDATES FROM DB ============
        async function loadUpdates() {
            const feed = document.getElementById('updatesFeed'); try {
                const res = await fetch('/api/updates'); const r = await res.json(); if (!r.success || !r.data.length) { feed.innerHTML = '<p style="color:var(--text3);text-align:center;padding:30px;">कोणतेही अपडेट नाहीत / No updates</p>'; return; }
                const icons = ['ui-saffron', 'ui-green', 'ui-blue', 'ui-gold']; feed.innerHTML = r.data.map((u, i) => `<div class="update-item"><div class="update-icon-wrap ${icons[i % 4]}">📢</div><div class="update-content"><div class="update-title-mr">${u.titleMr}</div><div class="update-title-text">${u.titleEn}</div><div class="update-desc mr-text">${u.bodyMr}</div><div class="update-desc en-text" style="display:none">${u.bodyEn}</div><div class="update-time">${u.dateLabel}</div></div></div>`).join('');
                const badge = document.getElementById('updatesBadge'); if (r.data.length > 0) { badge.style.display = ''; badge.textContent = r.data.length; document.getElementById('notifDot').classList.add('show'); }
            } catch { feed.innerHTML = '<p style="color:var(--red);text-align:center;">Error loading updates</p>'; }
        }

        // ============ MAIN INIT ============
        async function initPortal() {
            if (!getToken()) { window.location.href = '/login.html'; return; }

            switchScreen('screen-loading');

            let user, admission;

            try { const res = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + getToken() } }); const r = await res.json(); if (!r.success) { throw new Error('Not logged in'); } user = r.data; }
            catch { window.location.href = '/login.html'; return; }

            try { const res = await fetch('/api/admission/my', { headers: { 'Authorization': 'Bearer ' + getToken() } }); const r = await res.json(); if (r.success && r.data.length) admission = r.data[0]; }
            catch { admission = null; }

            // Check admission status
            if (!admission || admission.status !== 'approved') {
                switchScreen('screen-pending');
                const icon = document.getElementById('pendingIcon');
                const title = document.getElementById('pendingTitle');
                const sub = document.getElementById('pendingSub');
                const status = document.getElementById('pendingStatus');
                const actions = document.getElementById('pendingActions');

                if (!admission) {
                    icon.textContent = '📝';
                    title.textContent = 'अर्ज भरा / Submit Application';
                    sub.textContent = 'आपण अद्यापर प्रवेश अर्ज भरलेला नाहीत / You have not submitted an admission form';
                    status.className = 'pending-status status-pending';
                    status.innerHTML = '⏳ No Application Found';
                    actions.innerHTML = `<a href="/form.html" class="btn-portal btn-saffron">📝 प्रवेश अर्ज भरा / Fill Form</a><button class="btn-portal btn-red" onclick="doLogout()">🚪 बाहेर पडा / Logout</button>`;
                } else if (admission.status === 'pending') {
                    icon.textContent = '⏳';
                    title.textContent = 'अर्ज प्रलंबित आहे';
                    sub.textContent = 'Your admission application is under review by the admin';
                    status.className = 'pending-status status-pending';
                    status.innerHTML = '⏳ Status: PENDING';
                    actions.innerHTML = `<button class="btn-portal btn-outline" onclick="doLogout()">🚪 बाहेर पडा / Logout</button>`;
                } else if (admission.status === 'rejected') {
                    icon.textContent = '✗';
                    title.textContent = 'अर्ज नामंजूर';
                    sub.textContent = 'Your admission application has been rejected. Please contact the office.';
                    status.className = 'pending-status status-rejected';
                    status.innerHTML = '✗ Status: REJECTED';
                    actions.innerHTML = `<a href="/form.html" class="btn-portal btn-saffron">📝 पुन्हा अर्ज करा / Re-apply</a><button class="btn-portal btn-red" onclick="doLogout()">🚪 बाहेर पडा</button>`;
                }
                return;
            }

            // ===== ADMISSION APPROVED — SHOW PORTAL =====
            const a = admission;
            const initial = a.fullName ? a.fullName.charAt(0).toUpperCase() : '?';
            const dobStr = a.dob ? new Date(a.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
            const formDateStr = a.formDate ? new Date(a.formDate).toLocaleDateString('en-IN') : '—';

            // Topbar
            document.getElementById('avatarLetter').textContent = initial;
            document.getElementById('topbarName').textContent = a.fullName;
            document.getElementById('topbarRole').textContent = `${a.grade} · ${a.formNo || '—'}`;

            // Dashboard
            document.getElementById('dashWelcomeMr').textContent = `🙏 स्वागत आहे, ${a.fullName}!`;
            document.getElementById('statGrade').textContent = a.grade;
            document.getElementById('dashAdmInfo').innerHTML = `
    <div class="info-list">
      ${infoRow('नाव / Name', a.fullName)}
      ${infoRow('वडील / Father', a.fatherName)}
      ${infoRow('आई / Mother', a.motherName)}
      ${infoRow('इयत्ता / Grade', a.grade)}
      ${infoRow('मोबाईल / Mobile', a.mobile)}
      ${infoRow('अर्ज दिनांक', formDateStr)}
    </div>`;

            document.getElementById('dashProgress').innerHTML = buildProgress(a);

            // Profile
            document.getElementById('profileAvatar').textContent = initial;
            document.getElementById('profileName').textContent = a.fullName;
            document.getElementById('profileNameMr').textContent = a.fullName;
            document.getElementById('profileSub').textContent = `Student ID: ${a.formNo || '—'} | Reg: ${a.regNo || '—'}`;
            document.getElementById('profileId').textContent = `ID: ${a.formNo || '—'} | Reg: ${a.regNo || '—'} | Year: ${a.academicYear || '—'}`;
            document.getElementById('profileClass').textContent = `🎓 Class ${a.grade} — Academic Year ${a.academicYear || '—'}`;
            document.getElementById('profileTags').innerHTML = `<span class="profile-tag">🙏 ${a.religion || '—'}</span><span class="profile-tag">📍 ${a.permanentAddress ? a.permanentAddress.substring(0, 20) : '—'}</span><span class="profile-tag">✅ Active</span>`;

            document.getElementById('profilePersonal').innerHTML = `
    ${infoRow('Full Name', a.fullName)}
    ${infoRow('Father', a.fatherName)}
    ${infoRow('Mother', a.motherName)}
    ${infoRow('DOB', dobStr)}
    ${infoRow('Religion', a.religion)}
    ${infoRow('Mobile', a.mobile)}
    ${infoRow('Alt Mobile', a.altMobile)}
    ${infoRow('Student Aadhaar', a.studentAadhaar)}
    ${infoRow('Father Aadhaar', a.fatherAadhaar)}
    ${infoRow('Mother Aadhaar', a.motherAadhaar)}
    ${infoRow('Email', a.phoneOrEmail)}
    ${infoRow('Hobbies', a.hobbies)}
    ${infoRow('Parent Expect.', a.parentExpectations)}`;

            document.getElementById('profileAddress').innerHTML = `
    ${infoRow('Permanent Addr.', a.permanentAddress)}
    ${infoRow('Current Addr.', a.currentAddress)}
    ${infoRow('Relative Name', a.relativeName)}
    ${infoRow('Relative Mobile', a.relativeMobile)}
    ${infoRow('Relative Addr.', a.relativeAddress)}`;

            // Progress page
            document.getElementById('progressCards').innerHTML = `
    <div class="card"><div class="card-header"><div class="card-title mr-text">मराठी वाचन</div><div class="card-title en-text" style="display:none">Marathi</div></div><div class="card-body"><div class="progress-bar-wrap"><div class="progress-label"><span>स्तर / Level</span><span>${a.marathiReading || '—'}</span></div><div class="progress-track"><div class="progress-fill" style="width:85%"></div></div></div></div></div>
    <div class="card"><div class="card-header"><div class="card-title mr-text">इंग्रजी वाचन</div><div class="card-title en-text" style="display:none">English</div></div><div class="card-body"><div class="progress-bar-wrap"><div class="progress-label"><span>स्तर / Level</span><span>${a.englishReading || '—'}</span></div><div class="progress-track"><div class="progress-fill blue" style="width:72%"></div></div></div></div></div>
    <div class="card"><div class="card-header"><div class="card-title mr-text">अध्यात्मिक शिक्षण</div><div class="card-title en-text" style="display:none">Spiritual</div></div><div class="card-body"><div class="progress-bar-wrap"><div class="progress-label"><span>स्तर / Level</span><span>${a.spiritualEducation || '—'}</span></div><div class="progress-track"><div class="progress-fill green" style="width:95%"></div></div></div></div></div>`;

            // Timetable subtitle
            document.getElementById('ttSub').textContent = `Class ${a.grade} — ${a.academicYear || '—'}`;

            // Calendar
            buildCalendar();

            // Annual ring animation
            setTimeout(() => { const ring = document.getElementById('annualRing'); if (ring) ring.style.strokeDasharray = '229 251'; }, 500);

            // Updates
            loadUpdates();

            // Show portal
            switchScreen('screen-portal');
            showToast('🙏', 'स्वागत आहे, ' + a.fullName + '!', 'Your admission is approved. Portal is ready.');
        }


        function doLogout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        }


        // Start
        initPortal();

