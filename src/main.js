import './style.css';
import Alpine from 'alpinejs';
import { api } from './api.js';
import { scanner } from './scanner.js';

window.Alpine = Alpine;

Alpine.data('schoolApp', () => ({
  screen: 'discovery', // discovery, login, dashboard, attendance, notices, invoices
  loading: false,
  errorMsg: '',
  successMsg: '',

  // School Discovery
  schoolCode: 'dhakamodel',
  centralUrl: api.getCentralUrl(),
  showSettings: false,
  school: null,

  // Login
  email: 'student@example.com',
  password: 'password',
  showPassword: false,
  user: null,

  // Data
  notices: [],
  attendance: [],
  invoices: [],
  selectedNotice: null,

  // Teacher Scanner State
  showScanner: false,
  scanningStatus: 'idle', // idle, scanning, success, error
  scannedCode: null,
  scanResultMsg: '',
  continuousMode: true, // Teachers usually scan multiple cards in a row
  todayScannedStudents: [], // List of students scanned in this session

  // Student Digital ID Modal
  showStudentIdModal: false,

  async init() {
    this.school = api.getSchool();
    this.user = api.getUser();
    const token = api.getToken();

    window.addEventListener('hashchange', () => this.handleHashChange());

    if (this.school && token && this.user) {
      this.navigate(window.location.hash.replace('#', '') || 'dashboard');
      await this.loadAllData();
    } else if (this.school) {
      this.navigate('login');
    } else {
      this.navigate('discovery');
    }
  },

  get isTeacher() {
    const type = (this.user?.type || '').toLowerCase();
    return type === 'staff' || type === 'teacher' || type === 'admin';
  },

  get studentCode() {
    return this.user?.id || this.user?.student_id || 'STU-1024';
  },

  get domainSuffix() {
    try {
      const url = new URL(this.centralUrl);
      return '.' + url.hostname;
    } catch {
      return '.campuscontrol.net';
    }
  },

  handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'attendance', 'notices', 'invoices'].includes(hash)) {
      if (!api.getToken()) {
        this.navigate(this.school ? 'login' : 'discovery');
        return;
      }
      this.screen = hash;
    } else if (hash === 'login' || hash === 'discovery') {
      this.screen = hash;
    }
  },

  navigate(target) {
    this.screen = target;
    window.location.hash = target;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.errorMsg = '';
    this.successMsg = '';
  },

  showToast(msg, isError = false) {
    if (isError) {
      this.errorMsg = msg;
      this.successMsg = '';
    } else {
      this.successMsg = msg;
      this.errorMsg = '';
    }
    setTimeout(() => {
      this.errorMsg = '';
      this.successMsg = '';
    }, 4500);
  },

  saveCentralUrl() {
    api.setCentralUrl(this.centralUrl);
    this.centralUrl = api.getCentralUrl();
    this.showSettings = false;
    this.showToast('Central API URL updated');
  },

  async handleDiscover() {
    if (!this.schoolCode.trim()) {
      this.showToast('Please enter your school code', true);
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    try {
      api.setCentralUrl(this.centralUrl);
      const res = await api.discover(this.schoolCode);
      this.school = res;
      this.showToast(`Connected to ${res.name || 'School'}`);
      this.navigate('login');
    } catch (err) {
      this.showToast(err.message, true);
    } finally {
      this.loading = false;
    }
  },

  changeSchool() {
    api.logout();
    api.setSchool(null);
    this.school = null;
    this.user = null;
    this.navigate('discovery');
  },

  async handleLogin() {
    if (!this.email || !this.password) {
      this.showToast('Please enter both email and password', true);
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    try {
      const res = await api.login(this.email, this.password);
      this.user = res.user;
      const roleName = this.isTeacher ? 'Teacher/Staff' : 'Student';
      this.showToast(`Welcome ${res.user.name || 'User'} (${roleName})`);
      this.navigate('dashboard');
      await this.loadAllData();
    } catch (err) {
      this.showToast(err.message, true);
    } finally {
      this.loading = false;
    }
  },

  async handleLogout() {
    await api.logout();
    this.user = null;
    this.notices = [];
    this.attendance = [];
    this.invoices = [];
    this.todayScannedStudents = [];
    this.navigate('login');
    this.showToast('Logged out successfully');
  },

  async loadAllData() {
    this.loading = true;
    try {
      const promises = [
        api.getProfile(),
        api.getNotices(),
        api.getAttendance(),
        api.getInvoices()
      ];

      const results = await Promise.allSettled(promises);

      if (results[0].status === 'fulfilled' && results[0].value) {
        const uData = results[0].value.user || results[0].value.data || results[0].value;
        this.user = { ...this.user, ...uData };
      }
      if (results[1].status === 'fulfilled' && results[1].value) {
        this.notices = results[1].value.data || (Array.isArray(results[1].value) ? results[1].value : []);
      }
      if (results[2].status === 'fulfilled' && results[2].value) {
        const att = results[2].value;
        this.attendance = att.data || (Array.isArray(att) ? att : []);
      }
      if (results[3].status === 'fulfilled' && results[3].value) {
        const inv = results[3].value;
        this.invoices = inv.data || (Array.isArray(inv) ? inv : []);
      }
    } catch (err) {
      console.warn('Data load error:', err);
    } finally {
      this.loading = false;
    }
  },

  // Center Button Action
  handleCenterButton() {
    if (this.isTeacher) {
      this.openScanner();
    } else {
      this.openStudentIdModal();
    }
  },

  openStudentIdModal() {
    this.showStudentIdModal = true;
  },

  closeStudentIdModal() {
    this.showStudentIdModal = false;
  },

  // Teacher QR Scanner
  async openScanner() {
    if (!this.isTeacher) {
      this.openStudentIdModal();
      return;
    }
    this.showScanner = true;
    this.scanningStatus = 'scanning';
    this.scannedCode = null;
    this.scanResultMsg = '';

    await this.$nextTick();
    try {
      await scanner.start(
        'qr-viewfinder',
        (decodedText) => this.onStudentCodeScanned(decodedText),
        (err) => { /* ignore frame scanning noise */ }
      );
    } catch (err) {
      this.scanningStatus = 'error';
      this.scanResultMsg = err.message || 'Camera permission denied or camera not available.';
    }
  },

  async closeScanner() {
    await scanner.stop();
    this.showScanner = false;
    this.scanningStatus = 'idle';
  },

  async onStudentCodeScanned(code) {
    if (this.todayScannedStudents.some(s => s.code === code && (Date.now() - s.time) < 5000)) {
      return;
    }

    this.scannedCode = code;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const scanRecord = {
      code: code,
      time: Date.now(),
      timeFormatted: timeStr,
      status: 'Recorded'
    };

    this.todayScannedStudents.unshift(scanRecord);
    this.scanResultMsg = `Recorded attendance for ID: ${code}`;
    this.showToast(`Marked Present: ${code}`);

    try {
      await api.submitAttendanceScan(code);
    } catch (e) {
      console.warn('Backend scan sync:', e);
    }

    if (!this.continuousMode) {
      await this.closeScanner();
    }
  },

  // Stats Helpers
  get attendancePercentage() {
    if (!this.attendance || !this.attendance.length) return '100%';
    const present = this.attendance.filter(a => (a.status || '').toLowerCase() === 'present').length;
    return Math.round((present / this.attendance.length) * 100) + '%';
  },

  get pendingInvoicesCount() {
    if (!this.invoices || !this.invoices.length) return 0;
    return this.invoices.filter(i => (i.status || '').toLowerCase() !== 'paid').length;
  }
}));

Alpine.start();
