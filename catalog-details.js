/* Optional rich details per product. Loaded after catalog.js and before site.js.
   Any phone without an entry here still gets a full page built from its basic catalog data. */
(function () {
  var DETAILS = {
    'samsung-galaxy-s24-ultra': {
      tagline: 'Galaxy AI is here. Welcome to the era of mobile AI with the pinnacle of Samsung craftsmanship.',
      model: 'Model SM-S928B/DS',
      hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4sRHSlqab77ju1D5BFcJIpIkfdw6tc0cYzo0Hpa-hVMEGUb5cDOFMxNlAr_p4k9GkwQN72xHXiRpKPZCpd9-7gf6PJhXF_k-EWNGf7XkzYc1KnOsAO-HDtldhoNK5kQzJU651lTg5lhFAcKtlplobGPXcyGBeGumht6M82h-rzrOoEQJON-gWJn13ZKnZDfJNq7id1pV-1eVm6Y-IW_nFISOs2jlkZH46BC7lCpsvNqZiYJ4bB2ik',
      gallery: [
        {label: 'Front/Back', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdCrTDYQ1dysgAIr90383mxGt5L3e4FAUnm0E0g3dDyP3GvGnvLNH0hEVv-yhjntfemSwVm_y04EXdZoMhCj7s_u8bqOUkmWHVtXv-uQvsSqwOedolJt1hrdp4EJREwN-RBmOOM5kLGbLp9XLOp2TZVn5Pr0gvpDX2D_7zFz4QiwyCUNMnCcJOzJuwahLm-9labKqeSk0XMr2PM45Qx5ouq1sfHYpqX0rjXtaLLyEEd9RzAUePC2OP'},
        {label: 'S-Pen & Frame', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK_w3S6KILqhFrTDHpvMUCNobIl57Yjss5Inu17KoVvfKaMicx9UQeRXfKdabbLFAxdfr3hcYkawyV5tuXpzG6c9y7xBHzGxcW_aLYN69xdZeDi88-mf6IOgg5xVxGZVmg3iTkHBckcLRKYsWhlTr0YhNnWJKEcoQQianqpwPVdjCUEu9QWAV5ILISs4vWezCrkCVNysiWqu3YNNee4y_m34m_2miBbYFn7HJXc5skj6MCaneNVaaR'},
        {label: 'Quad Camera', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRTwM-VVrQfN3mWy-Apockx-T5aiJbnrvBi8mpDSIsoo_MMw6G_WtiLqgRd_MX4DtxXt5cYugy51VAPT_8sz7fMHHHbc4DyhHr8HernTbmKRpVTo-wsqZ8UqAHFvMeva22XsJYFr5xk9Du4G3MU4x_MK8HcpurotpcJOWOY6YEv6itEQP3fm68qRSMLrgQzySGhmfnMluzTXiOCKd0mGPueGhaGCj1bTRVnNHOoId_0GS9ZjbIuu15'},
        {label: 'Natural Light', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWdZditps-K_HSA039saGoY2Fvx4NFmpmPpXlKPZ6hVSKAlTl0tiK6VQJTW_DT0kSfTVZKMSujswbKCjbWZMJOkLdhtgQKmVRLvlHgY8iRzaiCSzk5oHHTpyglX8BddjUg4Son44DiOv7Rr_eoAMy6xU3Si1ziybHyibEt84W6M_Z0etK6NytrO3hQpDiZsWgFAs9e5mTaPCBzKRj9nn42yd6jOHj8SWwGTshZzwW6SXNkLtGlMkVI'}
      ],
      colors: [
        {name: 'Titanium Gray', hex: '#94a3b8'}, {name: 'Titanium Black', hex: '#27272a'},
        {name: 'Titanium Violet', hex: '#c084fc'}, {name: 'Titanium Yellow', hex: '#fde68a'}
      ],
      highlights: [
        {icon: 'psychology', title: 'Galaxy AI Powered', text: 'Effortlessly search anything on screen with Circle to Search with Google. Speak foreign languages smoothly over voice calls with Live Translate, and organize cluttered thoughts via intelligent Note Assist.', footer: '7 Years of OS & Security Updates'},
        {icon: 'photo_camera', title: '200MP Quad Tele System', text: 'Capture mind-blowing detail with 200MP wide optical resolution, matched with dedicated 5x and 10x periscope telephoto sensors. AI ProVisual engine optimizes nighttime skin tones and motion blur reduction.', footer: '8K Video @ 30fps Recording'},
        {icon: 'hardware', title: 'Titanium Chassis & Snapdragon 8 Gen 3', text: 'Featuring satin titanium borders for refined structural resilience. Underneath lies the customized Snapdragon 8 Gen 3 for Galaxy with a nearly 2x larger vapor chamber for sustained gaming performance.', footer: 'Corning Gorilla Armor Glass'}
      ],
      quick: [
        {icon: 'smartphone', title: '6.8" QHD+ Dynamic AMOLED 2X', sub: '1-120Hz Adaptive, 2,600 nits Peak'},
        {icon: 'battery_charging_full', title: '5,000 mAh Li-ion Battery', sub: '45W Super Fast Charging 2.0'},
        {icon: 'edit', title: 'Built-in S Pen Stylus', sub: 'Bluetooth Air Actions & 2.8ms Latency'}
      ],
      specs: [
        {title: 'General Information', icon: 'info', items: [['Brand & Line', 'Samsung Galaxy'], ['Model Number', 'Galaxy S24 Ultra (SM-S928B/DS)'], ['Operating System', 'Android 14, One UI 6.1 (7 OS Upgrades)'], ['Build & Protection', 'Titanium Frame, IP68 (1.5m, 30 mins)']]},
        {title: 'Display & Glass', icon: 'screenshot', items: [['Screen Size & Type', '6.8" Dynamic AMOLED 2X'], ['Resolution & Density', '3120 x 1440 QHD+ (505 ppi)'], ['Refresh Rate', '1Hz - 120Hz LTPO Adaptive'], ['Glass Protection', 'Corning Gorilla Armor (Anti-Reflective)']]},
        {title: 'Processor & Memory', icon: 'memory', items: [['Chipset', 'Snapdragon 8 Gen 3 for Galaxy (4nm)'], ['CPU Architecture', 'Octa-Core up to 3.39GHz'], ['RAM & Storage', '12GB LPDDR5X + 512GB UFS 4.0'], ['GPU', 'Adreno 750 (Hardware Ray Tracing)']]},
        {title: 'Camera Architecture', icon: 'camera', items: [['Primary Rear Lens', '200 MP, f/1.7, OIS, Laser AF'], ['Telephoto Lenses', '50MP Periscope (5x) + 10MP (3x)'], ['Ultra-Wide Camera', '12 MP, f/2.2, 120˚ Super Steady'], ['Front Selfie Camera', '12 MP, f/2.2 Dual Pixel 4K60']]},
        {title: 'Battery & Charging', icon: 'battery_charging_90', items: [['Battery Capacity', '5,000 mAh Non-removable Li-ion'], ['Wired Charging Speed', '45W Wired (65% in 30 mins)'], ['Wireless Charging', '15W Qi/PMA Wireless Charging'], ['Reverse PowerShare', '4.5W Reverse Wireless Charging']]},
        {title: 'Connectivity & Package Box Contents', icon: 'devices', items: [['SIM Compatibility', 'Dual Nano-SIM + Multi-eSIM'], ['Network & Wi-Fi', '5G Sub-6GHz, Wi-Fi 7, BT 5.3, UWB'], ['Audio / Biometrics', 'AKG Stereo, Ultrasonic Fingerprint'], ['Package Contents', 'S24 Ultra + S Pen, Type-C Cable, SIM Pin']]}
      ],
      breakdown: {5: 92, 4: 6, 3: 2, 2: 0, 1: 0},
      reviews: [
        {name: 'Brian Omondi', city: 'Nairobi', when: '2 days ago', rating: 5, text: 'Exceptional zoom camera and battery easily lasts 1.5 days under heavy 5G usage. Delivered to Westlands in under 2 hours after placing the order online. Very impressed with Daisolve\'s speed and authentic packaging!'},
        {name: 'Faith Wanjiku', city: 'Mombasa', when: '1 week ago', rating: 5, text: 'The new Gorilla Armor anti-glare display is a gamechanger down here in coastal sunshine—zero glare outdoors. Lipa na M-PESA checkout was totally seamless.'},
        {name: 'Kevin Kiprop', city: 'Eldoret', when: '2 weeks ago', rating: 5, text: 'Upgraded from S22 Ultra and the flat display with S Pen is vastly superior. Galaxy AI Note Assistance saves me hours drafting work summaries. Checked the IMEI on the Samsung Kenya warranty portal and it was 100% genuine.'}
      ]
    }
  };
  (window.DAI_CATALOG || []).forEach(function (p) { if (!p.details && DETAILS[p.id]) p.details = DETAILS[p.id]; });
})();
