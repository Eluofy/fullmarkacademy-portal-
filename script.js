const form = document.getElementById('registration-form');
const editingIdInput = document.getElementById('editing-id');
const photoInput = document.getElementById('photo');
const previewImage = document.getElementById('photo-preview');
const previewText = document.getElementById('preview-text');
const resultBox = document.getElementById('result');
const cancelEditButton = document.getElementById('cancel-edit');
const recordsList = document.getElementById('records-list');
const recordsEmpty = document.getElementById('records-empty');
const searchInput = document.getElementById('search-input');
const modalOverlay = document.getElementById('record-modal');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close');
const studentCodeInput = document.getElementById('student-code');
const studentNameInput = document.getElementById('student-name');
const registrationDateInput = document.getElementById('registration-date');
const dayNameText = document.getElementById('day-name');
const openAccountsButton = document.getElementById('open-accounts-button');
const openScheduleButton = document.getElementById('open-schedule-button');
const drawerOverlay = document.getElementById('accounts-drawer-overlay');
const drawerCloseButton = document.getElementById('drawer-close');
const scheduleOverlay = document.getElementById('schedule-overlay');
const scheduleCloseButton = document.getElementById('schedule-close');
const accountDateFilter = document.getElementById('account-date-filter');
const accountResetButton = document.getElementById('account-reset');
const generateCodeButton = document.getElementById('generate-code');
const teacherInput = document.getElementById('teacher-name');
const roomInput = document.getElementById('room-number');
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const logoutButton = document.getElementById('logout-button');
const appContainer = document.querySelector('.container');

const APP_USERNAME = 'fallmark';
const APP_PASSWORD = 'Mnw@5593';

let registrations = JSON.parse(localStorage.getItem('fullMarkRegistrations') || '[]');
let currentEditedId = null;
let currentPhotoDataUrl = null;

function generateId() {
  if (window.crypto && window.crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rec-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function normalizeRegistrations() {
  const seen = new Set();
  let changed = false;

  registrations = registrations.map((record) => {
    if (!record.id || seen.has(record.id)) {
      changed = true;
      const newId = generateId();
      return {
        ...record,
        id: newId,
        parentId: record.parentId || record.id,
      };
    }
    seen.add(record.id);
    return record;
  });

  if (changed) {
    saveRegistrations();
  }
}

function generateStudentCode() {
  const usedCodes = new Set(registrations.map((record) => record.studentCode).filter(Boolean));
  let number = 1;
  while (usedCodes.has(`${number}`) || usedCodes.has(`FM${number}`)) {
    number += 1;
  }
  return `${number}`;
}

function updateDayName() {
  const value = registrationDateInput.value;
  if (!value) {
    dayNameText.textContent = '-';
    return;
  }
  const date = new Date(value);
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  dayNameText.textContent = days[date.getDay()];
}

function fillMissingPhotos() {
  const photoByCode = {};
  const photoByPhone = {};
  const photoByName = {};

  registrations.forEach((record) => {
    if (record.photoDataUrl) {
      if (record.studentCode) photoByCode[record.studentCode] = record.photoDataUrl;
      if (record.phoneNumber) photoByPhone[record.phoneNumber] = record.photoDataUrl;
      if (record.studentName) photoByName[record.studentName] = record.photoDataUrl;
    }
  });

  let changed = false;
  registrations = registrations.map((record) => {
    if (!record.photoDataUrl) {
      const candidate = photoByCode[record.studentCode] || photoByPhone[record.phoneNumber] || photoByName[record.studentName];
      if (candidate) {
        changed = true;
        return { ...record, photoDataUrl: candidate };
      }
    }
    return record;
  });

  if (changed) {
    saveRegistrations();
  }
}

function saveRegistrations() {
  localStorage.setItem('fullMarkRegistrations', JSON.stringify(registrations));
}

function lockApp() {
  loginOverlay.classList.add('active');
  appContainer.classList.add('hidden');
  logoutButton.style.display = 'none';
}

function unlockApp() {
  loginOverlay.classList.remove('active');
  appContainer.classList.remove('hidden');
  logoutButton.style.display = 'inline-flex';
}

function handleLogin(event) {
  event.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  if (username === APP_USERNAME && password === APP_PASSWORD) {
    sessionStorage.setItem('fullMarkLoggedIn', 'true');
    unlockApp();
    loginError.textContent = '';
    loginForm.reset();
  } else {
    loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
  }
}

function openRecordModal(record) {
  modalBody.innerHTML = `
    <h3>${record.studentName}</h3>
    <div class="modal-row">
      <div>
        <span><strong>كود الطالب:</strong> ${record.studentCode}</span>
        <span><strong>رقم الطالب:</strong> ${record.phoneNumber}</span>
        <span><strong>رقم ولى الأمر:</strong> ${record.guardianNumber}</span>
        <span><strong>التاريخ:</strong> ${record.registrationDate}</span>
        <span><strong>رقم السجل:</strong> ${record.id}</span>
        <span><strong>الصف الدراسي:</strong> ${record.classGrade}</span>
        <span><strong>اسم المدرس:</strong> ${record.teacherName || '-'}</span>
        <span><strong>رقم القاعة:</strong> ${record.roomNumber || '-'}</span>
      </div>
      <div>
        <img class="modal-card-image" src="${record.photoDataUrl || ''}" alt="${record.studentName}" />
      </div>
    </div>
    <div class="modal-row">
      <span><strong>العنوان:</strong> ${record.address}</span>
      <span><strong>سعر الحصة:</strong> ${record.lessonPrice}</span>
      <span><strong>المبلغ المتبقي:</strong> ${record.remainingPrice}</span>
      <span><strong>سعر الكتاب:</strong> ${record.bookPrice}</span>
      <span><strong>الحضور:</strong> ${record.presence || 'غير محدد'}</span>
      <span><strong>المواد:</strong> ${formatSubjects(record.subjects)}</span>
    </div>
    <button type="button" id="modal-edit-button" class="modal-edit-button">فتح للتعديل</button>
  `;
  modalOverlay.classList.add('active');
  modalOverlay.setAttribute('aria-hidden', 'false');

  const modalEditButton = document.getElementById('modal-edit-button');
  if (modalEditButton) {
    modalEditButton.addEventListener('click', () => {
      closeRecordModal();
      loadRecordForEdit(record.id);
    });
  }
}

function closeRecordModal() {
  modalOverlay.classList.remove('active');
  modalOverlay.setAttribute('aria-hidden', 'true');
}

function formatSubjects(subjects) {
  return subjects.length ? subjects.join('، ') : 'لا توجد مواد محددة';
}

function matchSearch(record, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  return (
    record.studentName.toLowerCase().includes(q) ||
    record.phoneNumber.toLowerCase().includes(q) ||
    record.studentCode.toLowerCase().includes(q)
  );
}

function computeDailyAccounts(selectedDate = '') {
  const filtered = selectedDate ? registrations.filter((record) => record.registrationDate === selectedDate) : registrations;
  return filtered.reduce((summary, record) => {
    const dateKey = record.registrationDate || 'غير محدد';
    const lessonPrice = parseFloat(record.lessonPrice) || 0;
    const remainingPrice = parseFloat(record.remainingPrice) || 0;
    const bookPrice = parseFloat(record.bookPrice) || 0;
    const paidAmount = Math.max(0, lessonPrice - remainingPrice);

    if (!summary[dateKey]) {
      summary[dateKey] = {
        date: dateKey,
        count: 0,
        lessonTotal: 0,
        remainingTotal: 0,
        paidTotal: 0,
        bookTotal: 0,
        records: [],
      };
    }

    const daySummary = summary[dateKey];
    daySummary.count += 1;
    daySummary.lessonTotal += lessonPrice;
    daySummary.remainingTotal += remainingPrice;
    daySummary.paidTotal += paidAmount;
    daySummary.bookTotal += bookPrice;
    daySummary.records.push(record);

    return summary;
  }, {});
}

function formatCurrency(value) {
  return Number(value).toLocaleString('ar-EG', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function renderDailyAccounts() {
  const selectedDate = accountDateFilter.value;
  const summary = computeDailyAccounts(selectedDate);
  const summaryContainer = document.getElementById('daily-summary');
  const recordsContainer = document.getElementById('daily-records');

  summaryContainer.innerHTML = '';
  recordsContainer.innerHTML = '';

  const dates = Object.keys(summary).sort((a, b) => {
    if (a === 'غير محدد') return 1;
    if (b === 'غير محدد') return -1;
    return new Date(b) - new Date(a);
  });

  if (!dates.length) {
    summaryContainer.innerHTML = `<div class="daily-summary-card"><h4>لا توجد بيانات لهذا اليوم.</h4></div>`;
    return;
  }

  const summaryGrid = document.createElement('div');
  summaryGrid.className = 'daily-summary-grid';

  dates.forEach((dateKey) => {
    const daySummary = summary[dateKey];
    const card = document.createElement('div');
    card.className = 'daily-summary-card';
    card.innerHTML = `
      <h4>تاريخ: ${daySummary.date}</h4>
      <div class="daily-summary-item"><span>عدد التسجيلات: <strong>${daySummary.count}</strong></span></div>
      <div class="daily-summary-item"><span>إجمالي سعر الحصص: <strong>${formatCurrency(daySummary.lessonTotal)}</strong></span></div>
      <div class="daily-summary-item"><span>إجمالي المبلغ المتبقي: <strong>${formatCurrency(daySummary.remainingTotal)}</strong></span></div>
      <div class="daily-summary-item"><span>إجمالي المبلغ المدفوع: <strong>${formatCurrency(daySummary.paidTotal)}</strong></span></div>
      <div class="daily-summary-item"><span>إجمالي سعر الكتب: <strong>${formatCurrency(daySummary.bookTotal)}</strong></span></div>
    `;
    summaryGrid.appendChild(card);

    const dayRecords = document.createElement('div');
    dayRecords.className = 'daily-record-item';
    dayRecords.innerHTML = `
      <h4>تفاصيل التسجيلات ليوم ${daySummary.date}</h4>
      ${daySummary.records
        .map((record) => {
          const lessonPrice = parseFloat(record.lessonPrice) || 0;
          const remainingPrice = parseFloat(record.remainingPrice) || 0;
          return `<span><strong>${record.studentName}</strong> - كود: ${record.studentCode} - سعر الحصة: ${formatCurrency(lessonPrice)} - المبلغ المتبقي: ${formatCurrency(remainingPrice)}</span>`;
        })
        .join('')}
    `;
    recordsContainer.appendChild(dayRecords);
  });

  summaryContainer.appendChild(summaryGrid);
}

function renderRegistrations(filterText = '') {
  recordsList.innerHTML = '';
  const filtered = registrations.filter((record) => matchSearch(record, filterText));

  if (!filtered.length) {
    recordsEmpty.style.display = 'block';
    recordsEmpty.textContent = filterText ? 'لا توجد نتائج تبحث عنها.' : 'لا يوجد بيانات مسجلة حتى الآن.';
    renderDailyAccounts();
    return;
  }

  recordsEmpty.style.display = 'none';

  filtered.forEach((record) => {
    const card = document.createElement('div');
    card.className = 'record-card';

    const image = document.createElement('img');
    image.className = 'card-image';
    image.src = record.photoDataUrl || '';
    image.alt = record.studentName;
    if (!record.photoDataUrl) {
      image.style.background = '#e2e8f0';
    }

    const info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML = `
      <strong>${record.studentName}</strong>
      <span class="card-label">كود الطالب</span>
      <span>${record.studentCode}</span>
      <span class="card-label">التاريخ</span>
      <span>${record.registrationDate}</span>
      <span class="card-label">رقم السجل</span>
      <span>${record.id}</span>
    `;

    const actions = document.createElement('div');
    actions.className = 'record-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-button';
    editBtn.textContent = 'تعديل';
    editBtn.dataset.id = record.id;
    editBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      handleEditClick(event);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-button';
    deleteBtn.textContent = 'حذف';
    deleteBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteRecord(record.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(image);
    card.appendChild(info);
    card.appendChild(actions);

    card.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      openRecordModal(record);
    });

    recordsList.appendChild(card);
  });
  renderDailyAccounts();
}

function clearForm() {
  form.reset();
  currentEditedId = null;
  editingIdInput.value = '';
  currentPhotoDataUrl = null;
  photoInput.value = '';
  studentCodeInput.value = generateStudentCode();
  registrationDateInput.value = '';
  updateDayName();
  cancelEditButton.style.display = 'none';
  previewImage.style.display = 'none';
  previewText.style.display = 'block';
}

function handleEditClick(event) {
  const id = event.currentTarget.dataset.id;
  loadRecordForEdit(id);
}

function loadRecordForEdit(id) {
  const record = registrations.find((item) => item.id === id);
  if (!record) return;

  editingIdInput.value = record.id;
  currentEditedId = record.id;
  currentPhotoDataUrl = record.photoDataUrl || null;
  form.studentName.value = record.studentName;
  form.studentCode.value = record.studentCode;
  form.phoneNumber.value = record.phoneNumber;
  form.guardianNumber.value = record.guardianNumber;
  form.address.value = record.address;
  form.classGrade.value = record.classGrade;
  form.registrationDate.value = record.registrationDate;
  updateDayName();
  form.teacherName.value = record.teacherName || '';
  form.roomNumber.value = record.roomNumber || '';
  form.lessonPrice.value = record.lessonPrice;
  form.remainingPrice.value = record.remainingPrice;
  form.bookPrice.value = record.bookPrice;
  form.presence.value = record.presence || '';
  form.querySelectorAll('input[name="subjects"]').forEach((checkbox) => {
    checkbox.checked = record.subjects.includes(checkbox.value);
  });

  if (record.photoDataUrl) {
    previewImage.src = record.photoDataUrl;
    previewImage.style.display = 'block';
    previewText.style.display = 'none';
  } else {
    previewImage.style.display = 'none';
    previewText.style.display = 'block';
  }

  cancelEditButton.style.display = 'block';
  resultBox.style.display = 'none';
}

function deleteRecord(id) {
  registrations = registrations.filter((item) => item.id !== id);
  saveRegistrations();
  renderRegistrations();
  if (currentEditedId === id) {
    clearForm();
  }
}

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) {
    currentPhotoDataUrl = null;
    previewImage.style.display = 'none';
    previewText.textContent = 'لم يتم اختيار صورة بعد';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    currentPhotoDataUrl = reader.result;
    previewImage.src = currentPhotoDataUrl;
    previewImage.style.display = 'block';
    previewText.style.display = 'none';
  };
  reader.readAsDataURL(file);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const subjects = formData.getAll('subjects');
  const editingId = editingIdInput.value;

  const existingRecord = registrations.find((item) => item.id === editingId);
  const photoName = photoInput.files[0]?.name || existingRecord?.photoName || 'لم يتم اختيار صورة';
  const photoDataUrl = currentPhotoDataUrl || existingRecord?.photoDataUrl || null;
  const subjectsChanged = existingRecord && (
    existingRecord.subjects.length !== subjects.length ||
    existingRecord.subjects.some((subj) => !subjects.includes(subj)) ||
    subjects.some((subj) => !existingRecord.subjects.includes(subj))
  );
  const isNewVersion = editingId && existingRecord && (existingRecord.registrationDate !== formData.get('registrationDate') || subjectsChanged);
  const data = {
    id: isNewVersion ? generateId() : editingId || generateId(),
    studentName: formData.get('studentName'),
    studentCode: formData.get('studentCode'),
    phoneNumber: formData.get('phoneNumber'),
    guardianNumber: formData.get('guardianNumber'),
    address: formData.get('address'),
    classGrade: formData.get('classGrade'),
    registrationDate: formData.get('registrationDate'),
    lessonPrice: formData.get('lessonPrice'),
    remainingPrice: formData.get('remainingPrice'),
    bookPrice: formData.get('bookPrice'),
    teacherName: formData.get('teacherName'),
    roomNumber: formData.get('roomNumber'),
    presence: formData.get('presence') || 'غير محدد',
    subjects,
    photoName,
    photoDataUrl,
    parentId: isNewVersion ? editingId : undefined
  };

  if (editingId) {
    if (isNewVersion) {
      registrations.push(data);
      resultBox.textContent = 'تم حفظ تسجيل جديد، والسجل القديم محفوظ كمرجع.';
    } else {
      registrations = registrations.map((item) => (item.id === editingId ? data : item));
      resultBox.textContent = 'تم تحديث البيانات بنجاح.';
    }
  } else {
    registrations.push(data);
    resultBox.textContent = 'تم حفظ التسجيل بنجاح.';
  }

  saveRegistrations();
  renderRegistrations();
  renderDailyAccounts();
  resultBox.style.display = 'block';
  clearForm();
});

cancelEditButton.addEventListener('click', () => {
  clearForm();
});

searchInput.addEventListener('input', () => renderRegistrations(searchInput.value));
modalCloseBtn.addEventListener('click', closeRecordModal);
modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    closeRecordModal();
  }
});
registrationDateInput.addEventListener('change', updateDayName);
openAccountsButton.addEventListener('click', () => {
  drawerOverlay.classList.add('active');
  drawerOverlay.setAttribute('aria-hidden', 'false');
  renderDailyAccounts();
});
drawerCloseButton.addEventListener('click', () => {
  drawerOverlay.classList.remove('active');
  drawerOverlay.setAttribute('aria-hidden', 'true');
});
drawerOverlay.addEventListener('click', (event) => {
  if (event.target === drawerOverlay) {
    drawerOverlay.classList.remove('active');
    drawerOverlay.setAttribute('aria-hidden', 'true');
  }
});
openScheduleButton.addEventListener('click', () => {
  scheduleOverlay.classList.add('active');
  scheduleOverlay.setAttribute('aria-hidden', 'false');
});
scheduleCloseButton.addEventListener('click', () => {
  scheduleOverlay.classList.remove('active');
  scheduleOverlay.setAttribute('aria-hidden', 'true');
});
scheduleOverlay.addEventListener('click', (event) => {
  if (event.target === scheduleOverlay) {
    scheduleOverlay.classList.remove('active');
    scheduleOverlay.setAttribute('aria-hidden', 'true');
  }
});
accountDateFilter.addEventListener('change', renderDailyAccounts);
accountResetButton.addEventListener('click', () => {
  accountDateFilter.value = '';
  renderDailyAccounts();
});
generateCodeButton.addEventListener('click', () => {
  studentCodeInput.value = generateStudentCode();
});

loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('fullMarkLoggedIn');
  lockApp();
});

if (sessionStorage.getItem('fullMarkLoggedIn') === 'true') {
  unlockApp();
} else {
  lockApp();
}

normalizeRegistrations();
fillMissingPhotos();
clearForm();
renderRegistrations();
renderDailyAccounts();

// دالة بسيطة لفتح وإغلاق الآلة الحاسبة
function toggleCalculator() {
    const calcModal = document.getElementById('calculator-modal');
    if (calcModal.style.display === 'block') {
        calcModal.style.display = 'none';
    } else {
        calcModal.style.display = 'block';
    }
}

// دوال الحساب
function appendToDisplay(value) {
    document.getElementById('calc-display').value += value;
}

function clearDisplay() {
    document.getElementById('calc-display').value = '';
}

function calculateResult() {
    const display = document.getElementById('calc-display');
    try {
        display.value = eval(display.value);
    } catch {
        display.value = 'Error';
    }
}