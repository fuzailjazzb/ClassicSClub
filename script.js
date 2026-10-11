
 // ---- Club settings (edit these) ----
var CLUB = {
  upiId: "8102493323@ptaxis",
  payee: "Pocket Club",
  fees: {
    singles: 199,
    doubles: 349
  },

  // Actual backend registration endpoint
  apiUrl: "https://classicsclub-back.onrender.com/api/registrations",

  // QR image should be saved in the front folder
  qrImage: "payment-qr.jpeg"
};

function boardSVG(o) {
  o = o || {};
  var s = '';
  s += '<rect x="4" y="4" width="392" height="392" rx="18" fill="#7a4a22"/><rect x="26" y="26" width="348" height="348" rx="8" fill="#e8c98e"/>';
  s += '<rect x="62" y="62" width="276" height="276" fill="none" stroke="#2a1a0c" stroke-width="2"/><rect x="76" y="76" width="248" height="248" fill="none" stroke="#2a1a0c"/>';
  [[40, 40], [360, 40], [40, 360], [360, 360]].forEach(function (p) {
    s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" fill="#111"/>';
  });
  [[78, 78], [322, 78], [78, 322], [322, 322]].forEach(function (p) {
    s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="none" stroke="#d62839" stroke-width="2.5"/>';
  });
  s += '<circle cx="200" cy="200" r="70" fill="none" stroke="#2a1a0c" stroke-width="1.5"/><circle cx="200" cy="200" r="22" fill="none" stroke="#d62839" stroke-width="2.5"/>';

  if (!o.bare) {
    mk().forEach(function (c) {
      s += '<circle cx="' + c.x + '" cy="' + c.y + '" r="9.5" fill="' + c.c + '" stroke="#0006"/><circle cx="' + c.x + '" cy="' + c.y + '" r="5" fill="none" stroke="#fff3"/>';
    });
  }

  if (o.striker) {
    s += '<circle cx="' + o.striker[0] + '" cy="' + o.striker[1] + '" r="14" fill="#f6f0e2" stroke="#0006" stroke-width="1.5"/><circle cx="' + o.striker[0] + '" cy="' + o.striker[1] + '" r="8" fill="none" stroke="#d62839" stroke-width="2"/>';
  }

  return s;
}

function mk() {
  var a = [{ x: 200, y: 200, c: '#d62839' }], i;

  for (i = 0; i < 6; i++) {
    var t = i * Math.PI / 3;
    a.push({
      x: 200 + Math.cos(t) * 21,
      y: 200 + Math.sin(t) * 21,
      c: i % 2 ? '#f6f0e2' : '#1b1b1b'
    });
  }

  for (i = 0; i < 12; i++) {
    var u = i * Math.PI / 6 + .26;
    a.push({
      x: 200 + Math.cos(u) * 40,
      y: 200 + Math.sin(u) * 40,
      c: i % 2 ? '#1b1b1b' : '#f6f0e2'
    });
  }

  return a.map(function (o) {
    o.dx = 0;
    o.dy = 0;
    o.s = 1;
    return o;
  });
}

function mkfx() {
  var cols = ['#c62839', '#f4edda', '#1b1b1b', '#d4af5a'];
  var a = [];

  for (var i = 0; i < 10; i++) {
    var s = 18 + (i * 7) % 22;
    a.push({
      left: ((6 + i * 9.5) % 96) + '%',
      width: s + 'px',
      height: s + 'px',
      animationDuration: (16 + (i * 5) % 12) + 's',
      animationDelay: '-' + ((i * 3) % 14) + 's',
      '--c': cols[i % 4]
    });
  }

  return a;
}

function mkfall() {
  var cols = ['#d4af5a', '#f6e2a3', '#c62839', '#f4edda'];
  var a = [];

  for (var i = 0; i < 16; i++) {
    a.push({
      left: ((4 + i * 6) % 96) + '%',
      background: cols[i % 4],
      animationDelay: ((i * 90) % 900) + 'ms',
      animationDuration: (2 + (i % 4) * .5) + 's'
    });
  }

  return a;
}

async function saveRegistration(data) {
  if (!CLUB.apiUrl) {
    throw new Error("Backend API URL is not configured.");
  }

  const response = await fetch(CLUB.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(data)
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Server returned an invalid response. Please try again."
    );
  }

  if (!response.ok) {
    throw new Error(
      result.error || `Registration failed (${response.status})`
    );
  }

  if (!result.id) {
    throw new Error("Booking saved response is missing booking ID.");
  }

  return result;
}

Vue.createApp({
  data: function () {
    return {
      sx: 200,
      flicked: false,
      pocketed: 0,
      coins: mk(),
      fx: mkfx(),
      fall: mkfall(),

      stats: [
        { n: 6, l: 'tournament boards', v: 0 },
        { n: 52, l: 'play nights a year', v: 0 },
        { n: 2, l: 'formats to compete in', v: 0 }
      ],

      ticker: [
        'Tournament every month',
        'Singles and doubles',
        'Play night every Saturday',
        'Boards provided',
        'Walk-ins welcome'
      ],

      step: 0,
      steps: ['Your details', 'Category', 'Payment'],

      f: {
        name: '',
        phone: '',
        email: '',
        city: '',
        pincode: '',
        cat: 'singles',
        level: 'Beginner',
        partner: ''
      },

      err: '',
      bad: '',
      saving: false,
      done: null,

      shots: [
        { t: 'Opening break, queen in the centre', h: boardSVG({}) },
        { t: 'Striker lined up on the baseline', h: boardSVG({ striker: [140, 322] }) },
        { t: 'Clean board before the match', h: boardSVG({ bare: true }) }
      ],

      perks: [
        {
          i: '🎯',
          t: 'Weekly play nights',
          d: 'Open boards every Saturday evening. Walk in, find a partner, play.'
        },
        {
          i: '🏆',
          t: 'Monthly tournament',
          d: 'Singles and doubles brackets with a club leaderboard for winners.'
        },
        {
          i: '🪵',
          t: 'Boards provided',
          d: 'Tournament-grade boards, strikers and powder are ready. You bring your aim.'
        }
      ],

      faqs: [
        {
          q: 'Do I need to know how to play?',
          a: 'No. Beginner tables run every Saturday and club members will explain the rules.'
        },
        {
          q: 'What does the fee cover?',
          a: 'Annual club membership, entry to the next tournament and board time on play nights.'
        },
        {
          q: 'How is my payment confirmed?',
          a: 'Scan the Pocket Club QR code and pay using your UPI app. Payment confirmation is checked separately.'
        },
        {
          q: 'Can I play doubles without a partner?',
          a: 'Register as singles and ask on play night. We will pair you with another member.'
        }
      ]
    };
  },

  mounted: function () {
    var me = this;
    var rm = window.matchMedia &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    var t0 = null;

    function tick(t) {
      if (!t0) t0 = t;
      var p = rm ? 1 : Math.min((t - t0) / 1400, 1);

      me.stats.forEach(function (s) {
        s.v = Math.round(s.n * (1 - Math.pow(1 - p, 3)));
      });

      if (p < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    if (rm || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .1 });

    document.querySelectorAll('section,.tile,.shots figure,details').forEach(function (el) {
      el.classList.add('rv');
      io.observe(el);
    });
  },

  computed: {
    fee: function () {
      return CLUB.fees[this.f.cat];
    },

    upi: function () {
      return 'upi://pay?pa=' + encodeURIComponent(CLUB.upiId) +
        '&pn=' + encodeURIComponent(CLUB.payee) +
        '&am=' + this.fee +
        '&cu=INR&tn=' + encodeURIComponent('Carrom club registration');
    },

    strikerStyle: function () {
      return {
        transform: 'translate(' +
          (this.flicked ? 200 : this.sx) + 'px,' +
          (this.flicked ? 214 : 322) + 'px)'
      };
    }
  },

  methods: {
    coinStyle: function (c) {
      return {
        transform: 'translate(' + (c.x + c.dx) + 'px,' +
          (c.y + c.dy) + 'px) scale(' + c.s + ')',
        opacity: c.s ? 1 : 0
      };
    },

    flick: function () {
      if (this.flicked) return;

      var me = this;
      this.flicked = true;

      this.coins.forEach(function (c, i) {
        var a = Math.atan2(c.y - 200, c.x - 200);

        if (i > 0 && Math.random() < .3) {
          c.dx = (c.x < 200 ? 40 : 360) - c.x;
          c.dy = (c.y < 200 ? 40 : 360) - c.y;
          c.s = 0;
          me.pocketed++;
        } else {
          var d = 18 + Math.random() * 50;
          c.dx = Math.cos(a) * d;
          c.dy = Math.sin(a) * d;
        }
      });
    },

    reset: function () {
      this.flicked = false;
      this.pocketed = 0;
      this.coins = mk();
    },

    check: function (s) {
      var f = this.f;
      var p = f.phone.replace(/\D/g, '').slice(-10);

      if (s === 0) {
        if (f.name.trim().length < 2) {
          return ['name', 'Enter your full name.'];
        }

        if (!/^[6-9]\d{9}$/.test(p)) {
          return ['phone', 'Enter a valid 10-digit mobile number.'];
        }

        if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) {
          return ['email', 'Enter a valid email address or leave it empty.'];
        }

        if (f.city.trim().length < 2) {
          return ['city', 'Enter your city.'];
        }

        if (!/^[1-9]\d{5}$/.test(f.pincode.trim())) {
          return ['pincode', 'Enter a valid 6-digit pincode.'];
        }
      }

      if (s === 1 && f.cat === 'doubles' && f.partner.trim().length < 2) {
        return ['partner', 'Enter your partner name for doubles.'];
      }

      return null;
    },

    next: function () {
      var r = this.check(this.step);
      this.bad = '';
      this.err = '';

      if (r) {
        this.bad = r[0];
        this.err = r[1];
        return;
      }

      this.step++;
    },

    back: function () {
      this.err = '';
      this.bad = '';
      this.step--;
    },

    submit: async function () {
      var r = this.check(2);
      this.bad = '';
      this.err = '';

      if (r) {
        this.bad = r[0];
        this.err = r[1];
        return;
      }

      if (this.saving) return;

      this.saving = true;

      try {
        var f = this.f;

        // UTR is no longer required or sent to the backend.
        var result = await saveRegistration({
          name: f.name.trim(),
          phone: f.phone.replace(/\D/g, '').slice(-10),
          email: f.email.trim(),
          city: f.city.trim(),
          pincode: f.pincode.trim(),
          category: f.cat,
          level: f.level,
          partner: f.cat === 'doubles' ? f.partner.trim() : ''
        });

        this.done = {
          id: result.id,
          name: f.name.trim()
        };
      } catch (e) {
        console.error('Registration error:', e);
        this.err = e.message ||
          'Registration could not be saved. Check your connection and try again.';
      } finally {
        this.saving = false;
      }
    }
  }
}).mount('#app');
