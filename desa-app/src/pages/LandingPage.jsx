import React, { useEffect, useRef, useState } from 'react';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
.lp-root *,.lp-root *::before,.lp-root *::after{box-sizing:border-box;margin:0;padding:0}
.lp-root{
  --navy:#0F2D5E;
  --navy-mid:#1A4080;
  --royal:#1A56DB;
  --blue-light:#3B82F6;
  --blue-pale:#EFF6FF;
  --emas:#C9A84C;
  --emas-muda:#F0D080;
  --krem:#F8FAFF;
  --putih:#FFFFFF;
  --gelap:#0A1628;
  --abu:#5A6A85;
  --serif:'Playfair Display',Georgia,serif;
  --sans:'Plus Jakarta Sans',system-ui,sans-serif;
  font-family:var(--sans);
  background:var(--krem);
  color:var(--gelap);
  overflow-x:hidden;
}
.lp-root ::-webkit-scrollbar{width:6px}
.lp-root ::-webkit-scrollbar-track{background:var(--navy)}
.lp-root ::-webkit-scrollbar-thumb{background:var(--emas);border-radius:3px}

/* NAVBAR */
.lp-navbar{position:fixed;top:0;left:0;right:0;z-index:1000;padding:20px 5%;display:flex;align-items:center;justify-content:space-between;transition:all .4s ease}
.lp-navbar.scrolled{background:rgba(15,45,94,.96);backdrop-filter:blur(12px);padding:14px 5%;box-shadow:0 2px 30px rgba(0,0,0,.3)}
.lp-nav-logo{display:flex;align-items:center;gap:12px;cursor:pointer}
.lp-nav-logo-icon{width:42px;height:42px;background:var(--emas);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.lp-nav-logo-text{color:var(--putih);font-family:var(--serif);font-size:1rem;font-weight:700;line-height:1.2}
.lp-nav-logo-text span{display:block;font-family:var(--sans);font-size:.7rem;font-weight:400;opacity:.75;letter-spacing:.05em}
.lp-nav-links{display:flex;align-items:center;gap:32px}
.lp-nav-links a{color:rgba(255,255,255,.85);text-decoration:none;font-size:.875rem;font-weight:500;transition:color .2s;cursor:pointer}
.lp-nav-links a:hover{color:var(--emas-muda)}
.lp-nav-btn{background:var(--emas)!important;color:var(--gelap)!important;padding:9px 22px;border-radius:24px;font-weight:600!important;border:none;cursor:pointer;font-family:var(--sans);font-size:.875rem;transition:all .2s}
.lp-nav-btn:hover{background:var(--emas-muda)!important;transform:translateY(-1px)}
.lp-hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;background:none;border:none}
.lp-hamburger span{display:block;width:24px;height:2px;background:white;border-radius:2px;transition:all .3s}
.lp-hamburger.active span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.lp-hamburger.active span:nth-child(2){opacity:0}
.lp-hamburger.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.lp-mobile-menu{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:var(--navy);z-index:999;flex-direction:column;align-items:center;justify-content:center;gap:32px}
.lp-mobile-menu.open{display:flex}
.lp-mobile-menu a{color:white;text-decoration:none;font-size:1.5rem;font-family:var(--serif);font-weight:600;cursor:pointer}
.lp-mob-btn{background:var(--emas);color:var(--gelap)!important;padding:12px 36px;border-radius:30px;font-family:var(--sans);font-size:1rem;font-weight:600;margin-top:12px;border:none;cursor:pointer}

/* HERO */
.lp-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:var(--navy)}
.lp-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#060F1E 0%,#0F2D5E 45%,#1A4080 100%)}
.lp-hero-pattern{position:absolute;inset:0;opacity:.05;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:32px 32px}
.lp-hero-particles{position:absolute;inset:0;overflow:hidden}
.lp-particle{position:absolute;background:var(--emas);border-radius:50%;animation:lp-float linear infinite;opacity:0}
.lp-hero-glow{position:absolute;width:700px;height:700px;background:radial-gradient(circle,rgba(26,86,219,.25) 0%,transparent 70%);top:50%;left:60%;transform:translate(-50%,-50%);pointer-events:none}
.lp-hero-glow2{position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(201,168,76,.12) 0%,transparent 70%);top:20%;left:10%;pointer-events:none}
.lp-hero-content{position:relative;z-index:2;padding:120px 5% 80px;max-width:1200px;margin:0 auto;width:100%}
.lp-hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);color:var(--emas-muda);padding:6px 16px;border-radius:20px;font-size:.8rem;font-weight:500;margin-bottom:28px}
.lp-hero-badge::before{content:'';width:6px;height:6px;background:var(--emas);border-radius:50%;animation:lp-pulse 2s infinite}
.lp-hero-title{font-family:var(--serif);font-size:clamp(2.8rem,7vw,5.5rem);color:var(--putih);line-height:1.08;margin-bottom:8px;font-weight:800}
.lp-hero-blue{color:#93C5FD;display:block}
.lp-hero-sub{font-size:clamp(1rem,2.5vw,1.3rem);color:rgba(255,255,255,.6);margin-bottom:40px;font-weight:300;max-width:520px;line-height:1.7}
.lp-hero-actions{display:flex;gap:16px;flex-wrap:wrap}
.lp-btn-primary{background:var(--emas);color:var(--gelap);padding:14px 32px;border-radius:30px;font-weight:600;font-size:.95rem;transition:all .3s;display:inline-flex;align-items:center;gap:8px;border:none;cursor:pointer;font-family:var(--sans)}
.lp-btn-primary:hover{background:var(--emas-muda);transform:translateY(-2px);box-shadow:0 8px 25px rgba(201,168,76,.4)}
.lp-btn-outline{background:transparent;color:white;padding:14px 32px;border-radius:30px;font-weight:500;font-size:.95rem;border:1.5px solid rgba(255,255,255,.25);transition:all .3s;display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-family:var(--sans)}
.lp-btn-outline:hover{border-color:#93C5FD;color:#93C5FD}
.lp-hero-stats{display:flex;gap:40px;margin-top:64px;flex-wrap:wrap}
.lp-hero-stat{border-left:2px solid rgba(201,168,76,.4);padding-left:20px}
.lp-hero-stat-num{font-family:var(--serif);font-size:2rem;color:var(--putih);font-weight:700;line-height:1}
.lp-hero-stat-label{font-size:.8rem;color:rgba(255,255,255,.45);margin-top:4px}
.lp-scroll-hint{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,.35);font-size:.75rem;z-index:2}
.lp-scroll-line{width:1px;height:48px;background:linear-gradient(to bottom,rgba(255,255,255,.35),transparent);animation:lp-scrollAnim 2s ease infinite}

/* SECTIONS */
.lp-sec{padding:96px 5%}.lp-con{max-width:1200px;margin:0 auto}
.lp-label{font-size:.8rem;font-weight:600;color:var(--royal);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px}
.lp-title{font-family:var(--serif);font-size:clamp(2rem,4vw,2.8rem);color:var(--navy);line-height:1.2;margin-bottom:20px;font-weight:700}
.lp-desc{color:var(--abu);font-size:1rem;line-height:1.75;max-width:580px}

/* PROFIL */
.lp-profil{background:var(--putih)}
.lp-profil-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;margin-top:56px}
.lp-profil-img{width:100%;aspect-ratio:4/3;background:linear-gradient(135deg,var(--navy),var(--royal));border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:5rem;position:relative;overflow:hidden}
.lp-profil-img::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,.15),transparent)}
.lp-profil-img-wrap{position:relative}
.lp-profil-badge{position:absolute;bottom:-20px;right:-20px;background:var(--emas);color:var(--gelap);padding:16px 24px;border-radius:16px;text-align:center;box-shadow:0 8px 32px rgba(201,168,76,.35)}
.lp-profil-badge strong{display:block;font-family:var(--serif);font-size:1.8rem;font-weight:800}
.lp-profil-badge span{font-size:.75rem;font-weight:500}
.lp-profil-items{display:flex;flex-direction:column;gap:20px;margin-top:32px}
.lp-profil-item{display:flex;gap:16px;align-items:flex-start}
.lp-profil-icon{width:44px;height:44px;background:var(--blue-pale);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
.lp-profil-item strong{display:block;font-weight:600;color:var(--gelap);margin-bottom:2px;font-size:.9rem}
.lp-profil-item span{color:var(--abu);font-size:.85rem}

/* STATISTIK */
.lp-statistik{background:var(--navy);position:relative;overflow:hidden}
.lp-statistik::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px);background-size:28px 28px}
.lp-statistik::after{content:'';position:absolute;width:500px;height:500px;background:radial-gradient(circle,rgba(26,86,219,.2),transparent);bottom:-100px;right:-100px;pointer-events:none}
.lp-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:48px;position:relative;z-index:1}
.lp-stat-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:32px 24px;text-align:center;transition:all .3s;position:relative;overflow:hidden}
.lp-stat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(26,86,219,.1),transparent);opacity:0;transition:.3s}
.lp-stat-card:hover{border-color:rgba(201,168,76,.4);transform:translateY(-4px)}
.lp-stat-card:hover::before{opacity:1}
.lp-stat-icon{font-size:2rem;margin-bottom:16px;display:block}
.lp-stat-num{font-family:var(--serif);font-size:2.8rem;font-weight:800;color:var(--putih);line-height:1;display:block}
.lp-stat-label{color:rgba(255,255,255,.45);font-size:.8rem;margin-top:8px;display:block}

/* STRUKTUR */
.lp-struktur{background:var(--krem)}
.lp-kepala-wrap{display:flex;justify-content:center;margin-bottom:32px}
.lp-jabatan-card{background:var(--putih);border-radius:20px;padding:28px 20px;text-align:center;box-shadow:0 4px 24px rgba(15,45,94,.08);transition:all .3s}
.lp-jabatan-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(15,45,94,.15)}
.lp-jabatan-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--navy),var(--royal));display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 14px;border:3px solid var(--emas)}
.lp-jabatan-nama{font-weight:700;font-size:.95rem;color:var(--gelap);margin-bottom:3px}
.lp-jabatan-pos{font-size:.8rem;color:var(--abu)}
.lp-jabatan-badge{display:inline-block;background:var(--emas);color:var(--gelap);font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:10px;margin-top:8px}
.lp-jabatan-badge-blue{background:linear-gradient(135deg,var(--navy),var(--royal));color:white}
.lp-kepala-card{width:210px}
.lp-connector-h{display:flex;justify-content:center;align-items:center;position:relative;margin-bottom:32px}
.lp-connector-h::before{content:'';position:absolute;top:0;left:20%;right:20%;height:2px;background:linear-gradient(to right,var(--royal),var(--blue-light))}
.lp-connector-dots{display:flex;justify-content:space-around;width:100%;padding:0 20%}
.lp-connector-dot{width:2px;height:24px;background:var(--royal)}
.lp-perangkat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}

/* BERITA */
.lp-berita{background:var(--putih)}
.lp-berita-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;flex-wrap:wrap;gap:16px}
.lp-berita-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:24px}
.lp-berita-card{background:var(--krem);border-radius:16px;overflow:hidden;transition:all .3s;cursor:pointer}
.lp-berita-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(15,45,94,.12)}
.lp-berita-card.featured{grid-row:span 2;background:var(--navy)}
.lp-berita-img{width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,var(--navy),var(--royal));display:flex;align-items:center;justify-content:center;font-size:3rem}
.lp-berita-card.featured .lp-berita-img{aspect-ratio:4/3;font-size:5rem;background:linear-gradient(135deg,#060F1E,var(--navy-mid))}
.lp-berita-body{padding:20px}
.lp-berita-tag{display:inline-block;background:rgba(26,86,219,.1);color:var(--royal);font-size:.7rem;font-weight:600;padding:3px 10px;border-radius:10px;margin-bottom:10px}
.lp-berita-card.featured .lp-berita-tag{background:rgba(255,255,255,.12);color:var(--emas-muda)}
.lp-berita-judul{font-weight:700;font-size:.95rem;color:var(--gelap);line-height:1.4;margin-bottom:8px}
.lp-berita-card.featured .lp-berita-judul{color:white;font-size:1.1rem}
.lp-berita-date{font-size:.75rem;color:var(--abu)}
.lp-berita-card.featured .lp-berita-date{color:rgba(255,255,255,.45)}
.lp-lihat-semua{color:var(--royal);font-weight:600;font-size:.875rem;text-decoration:none;display:flex;align-items:center;gap:6px;transition:gap .2s;cursor:pointer;background:none;border:none;font-family:var(--sans)}
.lp-lihat-semua:hover{gap:10px}

/* PENGUMUMAN */
.lp-pengumuman{background:linear-gradient(135deg,#EFF6FF,var(--krem))}
.lp-pengumuman-list{display:flex;flex-direction:column;gap:16px;margin-top:40px}
.lp-pengumuman-item{background:var(--putih);border-radius:16px;padding:24px;display:flex;gap:20px;align-items:flex-start;transition:all .3s;border-left:4px solid transparent}
.lp-pengumuman-item:hover{border-left-color:var(--royal);transform:translateX(4px);box-shadow:0 4px 20px rgba(15,45,94,.08)}
.lp-pengumuman-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
.lp-pengumuman-icon.blue{background:rgba(26,86,219,.1)}
.lp-pengumuman-icon.gold{background:rgba(201,168,76,.12)}
.lp-pengumuman-icon.sky{background:rgba(59,130,246,.08)}
.lp-pengumuman-text strong{display:block;font-weight:600;font-size:.95rem;color:var(--gelap);margin-bottom:4px}
.lp-pengumuman-text p{color:var(--abu);font-size:.85rem;line-height:1.5}
.lp-pengumuman-date{margin-left:auto;font-size:.75rem;color:var(--abu);white-space:nowrap;flex-shrink:0}

/* GALERI */
.lp-galeri{background:var(--navy)}
.lp-galeri-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,180px);gap:16px;margin-top:48px}
.lp-galeri-item{border-radius:16px;overflow:hidden;position:relative;cursor:pointer}
.lp-galeri-item:first-child{grid-column:span 2;grid-row:span 2}
.lp-galeri-img{width:100%;height:100%;background:linear-gradient(135deg,var(--navy-mid),#060F1E);display:flex;align-items:center;justify-content:center;font-size:3rem;transition:transform .4s}
.lp-galeri-item:first-child .lp-galeri-img{font-size:5rem}
.lp-galeri-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.65),transparent);opacity:0;transition:.3s;display:flex;align-items:flex-end;padding:16px}
.lp-galeri-overlay span{color:white;font-size:.8rem;font-weight:500}
.lp-galeri-item:hover .lp-galeri-img{transform:scale(1.05)}
.lp-galeri-item:hover .lp-galeri-overlay{opacity:1}

/* LOKASI */
.lp-lokasi{background:var(--putih)}
.lp-lokasi-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;margin-top:48px}
.lp-peta-wrap{border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(15,45,94,.15)}
.lp-peta-wrap iframe{width:100%;height:400px;border:none;display:block}
.lp-lokasi-info{display:flex;flex-direction:column;gap:20px}
.lp-lokasi-card{display:flex;gap:16px;padding:20px;background:var(--krem);border-radius:16px;align-items:flex-start;border:1px solid rgba(15,45,94,.06)}
.lp-lokasi-card-icon{width:48px;height:48px;background:var(--navy);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
.lp-lokasi-card-text strong{display:block;font-weight:600;font-size:.9rem;color:var(--gelap);margin-bottom:4px}
.lp-lokasi-card-text span{color:var(--abu);font-size:.85rem;line-height:1.5}

/* CTA */
.lp-cta{background:linear-gradient(135deg,#060F1E 0%,var(--navy) 50%,#1A4080 100%);padding:80px 5%;text-align:center;position:relative;overflow:hidden}
.lp-cta::before{content:'';position:absolute;width:500px;height:500px;background:radial-gradient(circle,rgba(26,86,219,.2),transparent);top:50%;left:50%;transform:translate(-50%,-50%)}
.lp-cta::after{content:'';position:absolute;width:300px;height:300px;background:radial-gradient(circle,rgba(201,168,76,.1),transparent);top:10%;right:10%}
.lp-cta-title{font-family:var(--serif);font-size:clamp(2rem,4vw,3rem);color:var(--putih);margin-bottom:16px;position:relative;z-index:1}
.lp-cta-desc{color:rgba(255,255,255,.55);margin-bottom:40px;font-size:1rem;position:relative;z-index:1}
.lp-cta-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
.lp-cta-btn{padding:14px 36px;border-radius:30px;font-weight:600;font-size:.95rem;transition:all .3s;display:inline-flex;align-items:center;gap:10px;cursor:pointer;border:none;font-family:var(--sans)}
.lp-cta-btn.gold{background:var(--emas);color:var(--gelap)}
.lp-cta-btn.gold:hover{background:var(--emas-muda);transform:translateY(-2px);box-shadow:0 8px 25px rgba(201,168,76,.4)}
.lp-cta-btn.ghost{background:rgba(255,255,255,.08);color:white;border:1.5px solid rgba(255,255,255,.2)}
.lp-cta-btn.ghost:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.4)}

/* FOOTER */
.lp-footer{background:#060F1E;padding:48px 5% 32px;color:rgba(255,255,255,.45)}
.lp-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:48px;margin-bottom:40px}
.lp-footer-brand{font-family:var(--serif);font-size:1.2rem;color:white;margin-bottom:12px}
.lp-footer-brand-sub{font-family:var(--sans);font-size:.8rem;color:rgba(255,255,255,.35);line-height:1.7}
.lp-footer-title{color:white;font-weight:600;font-size:.875rem;margin-bottom:16px}
.lp-footer-links{display:flex;flex-direction:column;gap:10px}
.lp-footer-links a{color:rgba(255,255,255,.4);text-decoration:none;font-size:.85rem;transition:color .2s;cursor:pointer}
.lp-footer-links a:hover{color:var(--emas-muda)}
.lp-footer-bottom{border-top:1px solid rgba(255,255,255,.07);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:.8rem}
.lp-footer-bottom a{color:var(--emas);text-decoration:none;cursor:pointer}

/* REVEAL */
.lp-reveal{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease}
.lp-reveal.visible{opacity:1;transform:translateY(0)}
.lp-reveal-left{opacity:0;transform:translateX(-40px);transition:opacity .7s ease,transform .7s ease}
.lp-reveal-left.visible{opacity:1;transform:translateX(0)}
.lp-reveal-right{opacity:0;transform:translateX(40px);transition:opacity .7s ease,transform .7s ease}
.lp-reveal-right.visible{opacity:1;transform:translateX(0)}
.lp-d1{transition-delay:.1s}.lp-d2{transition-delay:.2s}.lp-d3{transition-delay:.3s}.lp-d4{transition-delay:.4s}

@keyframes lp-float{0%{transform:translateY(100vh) rotate(0);opacity:0}10%{opacity:.5}90%{opacity:.3}100%{transform:translateY(-10vh) rotate(360deg);opacity:0}}
@keyframes lp-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.3)}}
@keyframes lp-scrollAnim{0%{opacity:0;transform:scaleY(0);transform-origin:top}50%{opacity:1;transform:scaleY(1)}100%{opacity:0;transform:scaleY(1);transform-origin:bottom}}

@media(max-width:1024px){
  .lp-stats-grid{grid-template-columns:repeat(2,1fr)}
  .lp-berita-grid{grid-template-columns:1fr 1fr}
  .lp-berita-card.featured{grid-column:span 2}
  .lp-perangkat-grid{grid-template-columns:repeat(2,1fr)}
  .lp-galeri-grid{grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,140px)}
  .lp-galeri-item:first-child{grid-column:span 2}
  .lp-footer-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:768px){
  .lp-sec{padding:64px 5%}
  .lp-nav-links{display:none}
  .lp-hamburger{display:flex}
  .lp-profil-grid{grid-template-columns:1fr}
  .lp-profil-badge{right:16px;bottom:-16px}
  .lp-berita-grid{grid-template-columns:1fr}
  .lp-berita-card.featured{grid-column:span 1}
  .lp-lokasi-grid{grid-template-columns:1fr}
  .lp-galeri-grid{grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(3,130px)}
  .lp-galeri-item:first-child{grid-column:span 2}
  .lp-perangkat-grid{grid-template-columns:repeat(2,1fr)}
  .lp-connector-dots{padding:0 10%}
  .lp-connector-h::before{left:10%;right:10%}
  .lp-footer-grid{grid-template-columns:1fr}
  .lp-footer-bottom{flex-direction:column;text-align:center}
  .lp-hero-stats{gap:24px}
}
@media(max-width:480px){
  .lp-stats-grid{grid-template-columns:1fr 1fr}
  .lp-perangkat-grid{grid-template-columns:repeat(2,1fr)}
  .lp-hero-actions{flex-direction:column}
  .lp-cta-buttons{flex-direction:column;align-items:center}
}
`;

export default function LandingPage({ onMasuk }) {
  const navRef = useRef(null);
  const heroAnimated = useRef(false);
  const counterAnimated = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    styleEl.id = 'lp-styles';
    document.head.appendChild(styleEl);
    // Tunggu style selesai inject baru tampil
    const timer = setTimeout(() => setLoading(false), 400);
    return () => {
      document.getElementById('lp-styles')?.remove();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal,.lp-reveal-left,.lp-reveal-right');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function animateCounter(el, target, duration = 2000) {
    const start = performance.now();
    const update = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target).toLocaleString('id-ID');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  useEffect(() => {
    const hero = document.getElementById('lp-hero');
    if (!hero) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !heroAnimated.current) {
        heroAnimated.current = true;
        document.querySelectorAll('[data-lp-count]').forEach(el => animateCounter(el, parseInt(el.dataset.lpCount)));
      }
    }, { threshold: 0.3 });
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const stat = document.getElementById('lp-statistik');
    if (!stat) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counterAnimated.current) {
        counterAnimated.current = true;
        document.querySelectorAll('[data-lp-target]').forEach(el => animateCounter(el, parseInt(el.dataset.lpTarget)));
      }
    }, { threshold: 0.3 });
    obs.observe(stat);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const container = document.getElementById('lp-particles');
    if (!container) return;
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'lp-particle';
      p.style.cssText = `left:${Math.random()*100}%;width:${Math.random()*4+2}px;height:${Math.random()*4+2}px;animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*10}s`;
      container.appendChild(p);
    }
    return () => { if (container) container.innerHTML = ''; };
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight:'100vh',
        background:'linear-gradient(135deg,#060F1E 0%,#0F2D5E 45%,#1A4080 100%)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:20,
        fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
        <div style={{ fontSize:52 }}>🏛️</div>
        <div style={{ color:'white', fontSize:20, fontWeight:700, letterSpacing:'.02em' }}>
          Desa Cikulak
        </div>
        <div style={{ color:'rgba(255,255,255,.5)', fontSize:13 }}>
          Kec. Waled, Kab. Cirebon
        </div>
        <div style={{
          width:40, height:40,
          border:'3px solid rgba(255,255,255,.15)',
          borderTop:'3px solid #C9A84C',
          borderRadius:'50%',
          animation:'lp-spin 0.8s linear infinite',
          marginTop:8,
        }}/>
        <style>{`@keyframes lp-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="lp-root">

      {/* NAVBAR */}
      <nav className="lp-navbar" ref={navRef}>
        <div className="lp-nav-logo" onClick={() => scrollTo('lp-hero')}>
          <div className="lp-nav-logo-icon">🏛️</div>
          <div className="lp-nav-logo-text">Desa Cikulak<span>Kec. Waled, Kab. Cirebon</span></div>
        </div>
        <div className="lp-nav-links">
          <a onClick={() => scrollTo('lp-profil')}>Profil</a>
          <a onClick={() => scrollTo('lp-statistik')}>Statistik</a>
          <a onClick={() => scrollTo('lp-struktur')}>Struktur</a>
          <a onClick={() => scrollTo('lp-berita')}>Berita</a>
          <a onClick={() => scrollTo('lp-lokasi')}>Lokasi</a>
          <button className="lp-nav-btn" onClick={onMasuk}>Masuk →</button>
        </div>
        <button className={`lp-hamburger${menuOpen?' active':''}`} onClick={() => setMenuOpen(v => !v)}>
          <span/><span/><span/>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`lp-mobile-menu${menuOpen?' open':''}`}>
        <a onClick={() => scrollTo('lp-profil')}>Profil</a>
        <a onClick={() => scrollTo('lp-statistik')}>Statistik</a>
        <a onClick={() => scrollTo('lp-struktur')}>Struktur</a>
        <a onClick={() => scrollTo('lp-berita')}>Berita</a>
        <a onClick={() => scrollTo('lp-lokasi')}>Lokasi</a>
        <button className="lp-mob-btn" onClick={() => { setMenuOpen(false); onMasuk(); }}>Masuk ke Sistem</button>
      </div>

      {/* HERO */}
      <section className="lp-hero" id="lp-hero">
        <div className="lp-hero-bg"/>
        <div className="lp-hero-pattern"/>
        <div className="lp-hero-glow"/>
        <div className="lp-hero-glow2"/>
        <div className="lp-hero-particles" id="lp-particles"/>
        <div className="lp-hero-content">
          <div className="lp-hero-badge">🏛️ Desa Digital Cikulak</div>
          <h1 className="lp-hero-title">
            Selamat Datang di<br/>
            <span className="lp-hero-blue">Desa Cikulak</span>
          </h1>
          <p className="lp-hero-sub">Desa yang asri dan berkembang di Kecamatan Waled, Kabupaten Cirebon. Melayani masyarakat dengan sepenuh hati.</p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={() => scrollTo('lp-profil')}>🏡 Kenali Desa Kami</button>
            <button className="lp-btn-outline" onClick={() => scrollTo('lp-cta')}>Masuk Sistem →</button>
          </div>
          <div className="lp-hero-stats">
            {[{count:3247,label:'Jiwa Penduduk'},{count:6,label:'Dusun'},{count:12,label:'RW'},{count:2004,label:'Tahun Berdiri'}].map((s,i)=>(
              <div className="lp-hero-stat" key={i}>
                <div className="lp-hero-stat-num" data-lp-count={s.count}>0</div>
                <div className="lp-hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-scroll-hint"><span>Gulir</span><div className="lp-scroll-line"/></div>
      </section>

      {/* PROFIL */}
      <section className="lp-sec lp-profil" id="lp-profil">
        <div className="lp-con">
          <div className="lp-profil-grid">
            <div className="lp-reveal-left">
              <div className="lp-profil-img-wrap">
                <div className="lp-profil-img">🏡</div>
                <div className="lp-profil-badge"><strong>2004</strong><span>Tahun Berdiri</span></div>
              </div>
            </div>
            <div className="lp-reveal-right">
              <div className="lp-label">Tentang Kami</div>
              <h2 className="lp-title">Profil Desa Cikulak</h2>
              <p className="lp-desc">Desa Cikulak adalah desa yang terletak di Kecamatan Waled, Kabupaten Cirebon, Jawa Barat. Dengan luas wilayah yang subur dan masyarakat yang ramah, desa ini terus berkembang menuju desa yang mandiri dan sejahtera.</p>
              <div className="lp-profil-items">
                {[
                  {icon:'📍',label:'Alamat',val:'Jl. KH. Zainal Arifin No. 44, Cikulak, Kec. Waled, Kab. Cirebon 45187'},
                  {icon:'🗺️',label:'Luas Wilayah',val:'± 450 Hektar'},
                  {icon:'🏘️',label:'Wilayah Administrasi',val:'6 Dusun · 12 RW · 36 RT'},
                  {icon:'📞',label:'Kontak Desa',val:'+62 xxx-xxxx-xxxx · desacikulak@gmail.com'},
                ].map((item,i)=>(
                  <div className="lp-profil-item" key={i}>
                    <div className="lp-profil-icon">{item.icon}</div>
                    <div><strong>{item.label}</strong><span>{item.val}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="lp-sec lp-statistik" id="lp-statistik">
        <div className="lp-con">
          <div className="lp-reveal" style={{textAlign:'center'}}>
            <div className="lp-label" style={{color:'var(--emas)'}}>Data Kependudukan</div>
            <h2 className="lp-title" style={{color:'var(--putih)'}}>Statistik Desa Cikulak</h2>
            <p className="lp-desc" style={{margin:'0 auto',color:'rgba(255,255,255,.5)'}}>Data terkini kependudukan dan kondisi desa Cikulak tahun 2026.</p>
          </div>
          <div className="lp-stats-grid">
            {[
              {icon:'👥',target:3247,label:'Total Penduduk'},
              {icon:'👨',target:1658,label:'Laki-laki'},
              {icon:'👩',target:1589,label:'Perempuan'},
              {icon:'🏠',target:892,label:'Kepala Keluarga'},
            ].map((s,i)=>(
              <div className={`lp-stat-card lp-reveal lp-d${i+1}`} key={i}>
                <span className="lp-stat-icon">{s.icon}</span>
                <span className="lp-stat-num" data-lp-target={s.target}>0</span>
                <span className="lp-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRUKTUR */}
      <section className="lp-sec lp-struktur" id="lp-struktur">
        <div className="lp-con">
          <div style={{textAlign:'center',marginBottom:56}} className="lp-reveal">
            <div className="lp-label">Perangkat Desa</div>
            <h2 className="lp-title">Struktur Organisasi</h2>
            <p className="lp-desc" style={{margin:'0 auto'}}>Jajaran perangkat Desa Cikulak yang berdedikasi melayani masyarakat.</p>
          </div>
          <div className="lp-kepala-wrap lp-reveal">
            <div className="lp-jabatan-card lp-kepala-card">
              <div className="lp-jabatan-avatar">👤</div>
              <div className="lp-jabatan-nama">H. Ahmad Suherman</div>
              <div className="lp-jabatan-pos">NIP: —</div>
              <span className="lp-jabatan-badge">Kepala Desa</span>
            </div>
          </div>
          <div className="lp-connector-h lp-reveal">
            <div className="lp-connector-dots">{[0,1,2,3].map(i=><div className="lp-connector-dot" key={i}/>)}</div>
          </div>
          <div className="lp-perangkat-grid">
            {[
              {nama:'Budi Santoso',pos:'Sekretaris Desa'},
              {nama:'Siti Rahayu',pos:'Bendahara Desa'},
              {nama:'Dede Hardiana',pos:'Kaur Pemerintahan'},
              {nama:'Iin Kusrini',pos:'Kaur Umum'},
            ].map((p,i)=>(
              <div className={`lp-jabatan-card lp-reveal lp-d${i+1}`} key={i}>
                <div className="lp-jabatan-avatar" style={{width:60,height:60,fontSize:'1.4rem'}}>👤</div>
                <div className="lp-jabatan-nama">{p.nama}</div>
                <div className="lp-jabatan-pos">—</div>
                <span className="lp-jabatan-badge lp-jabatan-badge-blue">{p.pos}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BERITA */}
      <section className="lp-sec lp-berita" id="lp-berita">
        <div className="lp-con">
          <div className="lp-berita-header">
            <div className="lp-reveal">
              <div className="lp-label">Informasi Terkini</div>
              <h2 className="lp-title" style={{marginBottom:0}}>Berita & Pengumuman</h2>
            </div>
            <button className="lp-lihat-semua lp-reveal">Lihat semua <span>→</span></button>
          </div>
          <div className="lp-berita-grid">
            <div className="lp-berita-card featured lp-reveal-left">
              <div className="lp-berita-img">📰</div>
              <div className="lp-berita-body">
                <span className="lp-berita-tag">UTAMA</span>
                <div className="lp-berita-judul">Musyawarah Desa Cikulak 2026: Rencana Pembangunan Infrastruktur Jalan Dusun</div>
                <div className="lp-berita-date">15 September 2026</div>
              </div>
            </div>
            {[
              {icon:'🎓',tag:'PENDIDIKAN',judul:'Program Beasiswa untuk Putra-Putri Desa Cikulak',date:'10 September 2026'},
              {icon:'🌾',tag:'PERTANIAN',judul:'Panen Raya Kelompok Tani Cikulak Meningkat 20%',date:'5 September 2026'},
              {icon:'💉',tag:'KESEHATAN',judul:'Posyandu Rutin Bulan Oktober — Daftar Sekarang',date:'1 Oktober 2026'},
            ].map((b,i)=>(
              <div className={`lp-berita-card lp-reveal lp-d${i+1}`} key={i}>
                <div className="lp-berita-img" style={{fontSize:'2rem'}}>{b.icon}</div>
                <div className="lp-berita-body">
                  <span className="lp-berita-tag">{b.tag}</span>
                  <div className="lp-berita-judul">{b.judul}</div>
                  <div className="lp-berita-date">{b.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PENGUMUMAN */}
      <section className="lp-sec lp-pengumuman" id="lp-pengumuman">
        <div className="lp-con">
          <div className="lp-reveal">
            <div className="lp-label">Informasi Desa</div>
            <h2 className="lp-title">Pengumuman Resmi</h2>
          </div>
          <div className="lp-pengumuman-list">
            {[
              {cls:'blue',icon:'📋',title:'Pembagian Bantuan Sosial PKH Tahap 3 Tahun 2026',desc:'Pembagian bansos PKH akan dilaksanakan pada 10 Oktober 2026 di Balai Desa Cikulak. Harap membawa KTP dan KK asli.',date:'1 Okt 2026'},
              {cls:'gold',icon:'⚠️',title:'Pembaruan Data Kependudukan 2026',desc:'Seluruh warga yang belum melakukan pembaruan data KTP diharap melapor ke Kantor Desa paling lambat 31 Oktober 2026.',date:'28 Sep 2026'},
              {cls:'sky',icon:'🗳️',title:'Jadwal Musrenbangdes Tahun Anggaran 2027',desc:'Musyawarah Rencana Pembangunan Desa akan digelar pada 20 Oktober 2026 pukul 09.00 WIB di Balai Desa.',date:'25 Sep 2026'},
            ].map((p,i)=>(
              <div className={`lp-pengumuman-item lp-reveal lp-d${i+1}`} key={i}>
                <div className={`lp-pengumuman-icon ${p.cls}`}>{p.icon}</div>
                <div className="lp-pengumuman-text"><strong>{p.title}</strong><p>{p.desc}</p></div>
                <div className="lp-pengumuman-date">{p.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERI */}
      <section className="lp-sec lp-galeri" id="lp-galeri">
        <div className="lp-con">
          <div className="lp-reveal" style={{textAlign:'center'}}>
            <div className="lp-label" style={{color:'var(--emas)'}}>Foto Desa</div>
            <h2 className="lp-title" style={{color:'var(--putih)'}}>Galeri Desa Cikulak</h2>
            <p className="lp-desc" style={{margin:'0 auto',color:'rgba(255,255,255,.45)'}}>Potret kehidupan dan keindahan Desa Cikulak.</p>
          </div>
          <div className="lp-galeri-grid">
            {[
              {icon:'🌾',label:'Sawah Desa Cikulak'},
              {icon:'🏛️',label:'Balai Desa'},
              {icon:'🕌',label:'Masjid Jami'},
              {icon:'🌿',label:'Kebun Warga'},
              {icon:'🎪',label:'Kegiatan Desa'},
            ].map((g,i)=>(
              <div className={`lp-galeri-item lp-reveal lp-d${i}`} key={i}>
                <div className="lp-galeri-img">{g.icon}</div>
                <div className="lp-galeri-overlay"><span>{g.label}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOKASI */}
      <section className="lp-sec lp-lokasi" id="lp-lokasi">
        <div className="lp-con">
          <div className="lp-reveal">
            <div className="lp-label">Temukan Kami</div>
            <h2 className="lp-title">Lokasi & Kontak</h2>
          </div>
          <div className="lp-lokasi-grid">
            <div className="lp-peta-wrap lp-reveal-left">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15854.5!2d108.7!3d-6.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f13a4b7c82a8d%3A0x5031dfc3c5e0e15e!2sWaled%2C+Cirebon+Regency%2C+West+Java!5e0!3m2!1sid!2sid!4v1234567890" allowFullScreen loading="lazy" title="Peta Desa Cikulak"/>
            </div>
            <div className="lp-lokasi-info lp-reveal-right">
              {[
                {icon:'📍',title:'Alamat Kantor Desa',val:'Jl. KH. Zainal Arifin No. 44, Cikulak,\nKec. Waled, Kab. Cirebon 45187, Jawa Barat'},
                {icon:'🕐',title:'Jam Pelayanan',val:'Senin – Jumat: 08.00 – 15.00 WIB\nSabtu: 08.00 – 12.00 WIB'},
                {icon:'📞',title:'Hubungi Kami',val:'Telepon: +62 xxx-xxxx-xxxx\nEmail: desacikulak@gmail.com'},
              ].map((l,i)=>(
                <div className="lp-lokasi-card" key={i}>
                  <div className="lp-lokasi-card-icon">{l.icon}</div>
                  <div className="lp-lokasi-card-text"><strong>{l.title}</strong><span style={{whiteSpace:'pre-line'}}>{l.val}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta" id="lp-cta">
        <div className="lp-con">
          <h2 className="lp-cta-title lp-reveal">Akses Layanan Desa Digital</h2>
          <p className="lp-cta-desc lp-reveal">Masuk sebagai perangkat desa atau warga untuk mengakses layanan administrasi secara online.</p>
          <div className="lp-cta-buttons lp-reveal">
            <button className="lp-cta-btn gold" onClick={onMasuk}>🏛️ Login Perangkat Desa</button>
            <button className="lp-cta-btn ghost" onClick={onMasuk}>👤 Login Masyarakat</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-con">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand">🏛️ Desa Cikulak</div>
              <p className="lp-footer-brand-sub">Kecamatan Waled, Kabupaten Cirebon<br/>Jawa Barat — Indonesia<br/><br/>© 2026 Sistem Informasi Desa Cikulak.</p>
            </div>
            <div>
              <div className="lp-footer-title">Navigasi</div>
              <div className="lp-footer-links">
                {['Profil Desa','Statistik','Struktur Organisasi','Berita & Pengumuman','Lokasi & Kontak'].map((l,i)=>(
                  <a key={i} onClick={() => scrollTo(['lp-profil','lp-statistik','lp-struktur','lp-berita','lp-lokasi'][i])}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="lp-footer-title">Layanan</div>
              <div className="lp-footer-links">
                <a onClick={onMasuk}>Login Perangkat Desa</a>
                <a onClick={onMasuk}>Login Masyarakat</a>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>Dibuat dengan ❤️ oleh Tim Mahasiswa Pemrograman Web Lanjut 2026</span>
            <a onClick={onMasuk}>Masuk Sistem →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
