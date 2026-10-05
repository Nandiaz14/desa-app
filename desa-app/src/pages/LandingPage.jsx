import React, { useEffect, useRef, useState } from 'react';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
.lp-root *,.lp-root *::before,.lp-root *::after{box-sizing:border-box;margin:0;padding:0}
.lp-root{
  --navy:#0B2545;--navy-mid:#1A3A6B;--royal:#1D4ED8;--blue:#3B82F6;
  --blue-pale:#EFF6FF;--emas:#C9A84C;--emas-muda:#F0D080;
  --krem:#F5F7FF;--putih:#FFFFFF;--gelap:#0A1628;--abu:#5A6A85;
  --serif:'Playfair Display',Georgia,serif;--sans:'Plus Jakarta Sans',system-ui,sans-serif;
  font-family:var(--sans);background:var(--krem);color:var(--gelap);overflow-x:hidden;
}
.lp-root ::-webkit-scrollbar{width:5px}
.lp-root ::-webkit-scrollbar-track{background:var(--navy)}
.lp-root ::-webkit-scrollbar-thumb{background:var(--emas);border-radius:3px}

/* NAVBAR */
.lp-nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:18px 6%;display:flex;align-items:center;justify-content:space-between;transition:all .4s}
.lp-nav.scrolled{background:rgba(11,37,69,.97);backdrop-filter:blur(16px);padding:12px 6%;box-shadow:0 2px 40px rgba(0,0,0,.35)}
.lp-nav-logo{display:flex;align-items:center;gap:12px;cursor:pointer}
.lp-nav-logo-icon{width:40px;height:40px;background:linear-gradient(135deg,var(--emas),var(--emas-muda));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;box-shadow:0 4px 12px rgba(201,168,76,.3)}
.lp-nav-logo-text{color:var(--putih);font-family:var(--serif);font-size:.95rem;font-weight:700;line-height:1.2}
.lp-nav-logo-text span{display:block;font-family:var(--sans);font-size:.65rem;font-weight:400;opacity:.65;letter-spacing:.06em}
.lp-nav-links{display:flex;align-items:center;gap:28px}
.lp-nav-links a{color:rgba(255,255,255,.8);text-decoration:none;font-size:.85rem;font-weight:500;transition:color .2s;cursor:pointer;position:relative}
.lp-nav-links a::after{content:'';position:absolute;bottom:-3px;left:0;right:0;height:1.5px;background:var(--emas);transform:scaleX(0);transition:transform .2s}
.lp-nav-links a:hover{color:white}.lp-nav-links a:hover::after{transform:scaleX(1)}
.lp-nav-btn{background:linear-gradient(135deg,var(--emas),#B8963E);color:var(--gelap)!important;padding:8px 20px;border-radius:20px;font-weight:700!important;border:none;cursor:pointer;font-family:var(--sans);font-size:.85rem;box-shadow:0 4px 14px rgba(201,168,76,.35);transition:all .2s}
.lp-nav-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(201,168,76,.45)}
.lp-hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;background:none;border:none}
.lp-hamburger span{display:block;width:22px;height:2px;background:white;border-radius:2px;transition:all .3s}
.lp-hamburger.active span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.lp-hamburger.active span:nth-child(2){opacity:0}
.lp-hamburger.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.lp-mmenu{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:var(--navy);z-index:999;flex-direction:column;align-items:center;justify-content:center;gap:28px}
.lp-mmenu.open{display:flex}
.lp-mmenu a{color:white;text-decoration:none;font-size:1.4rem;font-family:var(--serif);font-weight:700;cursor:pointer}
.lp-mmenu-btn{background:linear-gradient(135deg,var(--emas),#B8963E);color:var(--gelap)!important;padding:12px 32px;border-radius:24px;font-family:var(--sans);font-size:.95rem;font-weight:700;border:none;cursor:pointer;margin-top:8px}

/* HERO */
.lp-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden}
.lp-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#040D1A 0%,#0B2545 40%,#1A3A6B 100%)}
.lp-hero-dots{position:absolute;inset:0;opacity:.04;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:28px 28px}
.lp-hero-particles{position:absolute;inset:0;overflow:hidden}
.lp-particle{position:absolute;background:var(--emas);border-radius:50%;animation:lp-float linear infinite;opacity:0}
.lp-hero-visual{position:absolute;right:0;top:0;bottom:0;width:50%;display:flex;align-items:center;justify-content:center;overflow:hidden}
.lp-hero-rings{position:relative;width:480px;height:480px;flex-shrink:0}
.lp-ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.06);top:50%;left:50%;transform:translate(-50%,-50%)}
.lp-ring:nth-child(1){width:200px;height:200px;border-color:rgba(201,168,76,.25);animation:lp-spin-slow 20s linear infinite}
.lp-ring:nth-child(2){width:300px;height:300px;border-color:rgba(255,255,255,.06);animation:lp-spin-slow 30s linear infinite reverse}
.lp-ring:nth-child(3){width:400px;height:400px;border-color:rgba(29,78,216,.15);animation:lp-spin-slow 40s linear infinite}
.lp-ring:nth-child(4){width:480px;height:480px;border-color:rgba(255,255,255,.04);animation:lp-spin-slow 50s linear infinite reverse}
.lp-hero-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
.lp-hero-center-icon{width:100px;height:100px;background:linear-gradient(135deg,rgba(201,168,76,.2),rgba(29,78,216,.2));border:2px solid rgba(201,168,76,.3);border-radius:28px;display:flex;align-items:center;justify-content:center;font-size:44px;margin:0 auto 12px;backdrop-filter:blur(8px)}
.lp-hero-center-text{color:rgba(255,255,255,.7);font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase}
.lp-hero-dots-grid{position:absolute;inset:0;opacity:.15}
.lp-hero-dot{position:absolute;width:3px;height:3px;background:var(--emas);border-radius:50%}
.lp-hero-glow{position:absolute;width:500px;height:500px;background:radial-gradient(circle,rgba(29,78,216,.2),transparent);top:50%;left:55%;transform:translate(-50%,-50%);pointer-events:none}
.lp-hero-content{position:relative;z-index:2;padding:120px 6% 80px;max-width:1200px;margin:0 auto;width:100%}
.lp-hero-inner{max-width:560px}
.lp-hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.25);color:var(--emas-muda);padding:5px 14px;border-radius:16px;font-size:.75rem;font-weight:600;margin-bottom:24px;letter-spacing:.04em}
.lp-hero-badge::before{content:'';width:5px;height:5px;background:var(--emas);border-radius:50%;animation:lp-pulse 2s infinite}
.lp-hero-title{font-family:var(--serif);font-size:clamp(2.6rem,6vw,4.8rem);color:var(--putih);line-height:1.1;margin-bottom:6px;font-weight:800}
.lp-hero-title em{color:#93C5FD;font-style:normal;display:block}
.lp-hero-sub{font-size:clamp(.95rem,2vw,1.15rem);color:rgba(255,255,255,.55);margin-bottom:36px;font-weight:400;line-height:1.75}
.lp-hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:56px}
.lp-btn-gold{background:linear-gradient(135deg,var(--emas),#B8963E);color:var(--gelap);padding:13px 28px;border-radius:26px;font-weight:700;font-size:.9rem;transition:all .3s;display:inline-flex;align-items:center;gap:8px;border:none;cursor:pointer;font-family:var(--sans);box-shadow:0 4px 20px rgba(201,168,76,.35)}
.lp-btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,168,76,.5)}
.lp-btn-ghost{background:rgba(255,255,255,.06);color:white;padding:13px 28px;border-radius:26px;font-weight:500;font-size:.9rem;border:1px solid rgba(255,255,255,.15);transition:all .3s;display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-family:var(--sans)}
.lp-btn-ghost:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
.lp-hero-stats{display:flex;gap:0;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;background:rgba(255,255,255,.04);backdrop-filter:blur(8px)}
.lp-hstat{flex:1;padding:16px 20px;text-align:center;border-right:1px solid rgba(255,255,255,.08)}
.lp-hstat:last-child{border-right:none}
.lp-hstat-num{font-family:var(--serif);font-size:1.7rem;color:var(--putih);font-weight:800;line-height:1}
.lp-hstat-label{font-size:.7rem;color:rgba(255,255,255,.4);margin-top:3px;letter-spacing:.03em}
.lp-scroll-hint{position:absolute;bottom:28px;left:6%;display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.3);font-size:.72rem;z-index:2;letter-spacing:.05em}
.lp-scroll-line{width:32px;height:1px;background:rgba(255,255,255,.2);position:relative;overflow:hidden}
.lp-scroll-line::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:var(--emas);animation:lp-slide 2s ease infinite}

/* SECTIONS */
.lp-sec{padding:88px 6%}.lp-con{max-width:1180px;margin:0 auto}
.lp-chip{display:inline-flex;align-items:center;gap:6px;background:var(--blue-pale);color:var(--royal);font-size:.72rem;font-weight:700;padding:4px 12px;border-radius:12px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px}
.lp-h2{font-family:var(--serif);font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--navy);line-height:1.2;margin-bottom:16px;font-weight:800}
.lp-p{color:var(--abu);font-size:.95rem;line-height:1.8;max-width:560px}

/* PROFIL */
.lp-profil{background:var(--putih)}
.lp-profil-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;margin-top:60px}
.lp-profil-img-wrap{position:relative}
.lp-profil-img{width:100%;aspect-ratio:4/3;background:linear-gradient(135deg,var(--navy),var(--navy-mid));border-radius:24px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.lp-profil-img-inner{font-size:80px;z-index:1}
.lp-profil-img-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,.15),rgba(29,78,216,.1))}
.lp-profil-img-dots{position:absolute;inset:0;opacity:.1;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:20px 20px}
.lp-profil-badge{position:absolute;bottom:-18px;right:24px;background:linear-gradient(135deg,var(--emas),#B8963E);color:var(--gelap);padding:14px 20px;border-radius:16px;text-align:center;box-shadow:0 8px 32px rgba(201,168,76,.4)}
.lp-profil-badge strong{display:block;font-family:var(--serif);font-size:1.7rem;font-weight:800;line-height:1}
.lp-profil-badge span{font-size:.7rem;font-weight:600;opacity:.8}
.lp-profil-items{display:flex;flex-direction:column;gap:16px;margin-top:28px}
.lp-profil-item{display:flex;gap:14px;align-items:flex-start;padding:14px;background:var(--krem);border-radius:14px;border:1px solid rgba(11,37,69,.06)}
.lp-profil-icon{width:40px;height:40px;background:var(--blue-pale);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
.lp-profil-item strong{display:block;font-weight:700;color:var(--gelap);margin-bottom:2px;font-size:.85rem}
.lp-profil-item span{color:var(--abu);font-size:.82rem;line-height:1.5}

/* STATISTIK */
.lp-statistik{background:linear-gradient(135deg,#040D1A,var(--navy));position:relative;overflow:hidden}
.lp-statistik::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.025) 1px,transparent 1px);background-size:24px 24px}
.lp-stats-glow{position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(29,78,216,.15),transparent);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.lp-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:48px;position:relative;z-index:1}
.lp-stat-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px 20px;text-align:center;transition:all .35s;position:relative;overflow:hidden;cursor:default}
.lp-stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(to right,var(--emas),var(--royal));transform:scaleX(0);transition:.35s;transform-origin:left}
.lp-stat-card:hover{border-color:rgba(201,168,76,.25);transform:translateY(-5px);background:rgba(255,255,255,.06)}
.lp-stat-card:hover::after{transform:scaleX(1)}
.lp-stat-icon{font-size:1.8rem;margin-bottom:14px;display:block}
.lp-stat-num{font-family:var(--serif);font-size:2.6rem;font-weight:800;color:var(--putih);line-height:1;display:block}
.lp-stat-label{color:rgba(255,255,255,.4);font-size:.75rem;margin-top:6px;display:block;letter-spacing:.03em}

/* STRUKTUR */
.lp-struktur{background:var(--krem)}
.lp-kepala-wrap{display:flex;justify-content:center;margin-bottom:28px}
.lp-jcard{background:var(--putih);border-radius:20px;padding:24px 20px;text-align:center;box-shadow:0 4px 24px rgba(11,37,69,.08);transition:all .3s;border:1px solid rgba(11,37,69,.06)}
.lp-jcard:hover{transform:translateY(-4px);box-shadow:0 14px 40px rgba(11,37,69,.14)}
.lp-javatar{border-radius:50%;background:linear-gradient(135deg,var(--navy),var(--royal));display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:3px solid var(--emas)}
.lp-jnama{font-weight:700;font-size:.9rem;color:var(--gelap);margin-bottom:2px}
.lp-jpos{font-size:.75rem;color:var(--abu)}
.lp-jbadge{display:inline-block;font-size:.68rem;font-weight:700;padding:3px 10px;border-radius:10px;margin-top:8px}
.lp-jbadge-gold{background:linear-gradient(135deg,var(--emas),#B8963E);color:var(--gelap)}
.lp-jbadge-blue{background:linear-gradient(135deg,var(--navy),var(--royal));color:white}
.lp-kepala-card{width:200px}
.lp-connector{display:flex;justify-content:center;position:relative;margin-bottom:28px;padding:0 20%}
.lp-connector::before{content:'';position:absolute;top:0;left:20%;right:20%;height:1.5px;background:linear-gradient(to right,var(--royal),var(--blue))}
.lp-connector-dots{display:flex;justify-content:space-around;width:100%}
.lp-cdot{width:1.5px;height:20px;background:var(--royal)}
.lp-perangkat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}

/* BERITA */
.lp-berita{background:var(--putih)}
.lp-berita-hdr{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:36px;flex-wrap:wrap;gap:16px}
.lp-berita-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:20px}
.lp-bcard{background:var(--krem);border-radius:18px;overflow:hidden;transition:all .3s;cursor:pointer;border:1px solid rgba(11,37,69,.06)}
.lp-bcard:hover{transform:translateY(-4px);box-shadow:0 14px 40px rgba(11,37,69,.1)}
.lp-bcard.feat{grid-row:span 2;background:linear-gradient(135deg,var(--navy),var(--navy-mid))}
.lp-bimg{width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,var(--navy-mid),var(--royal));display:flex;align-items:center;justify-content:center;font-size:2.5rem;position:relative}
.lp-bcard.feat .lp-bimg{aspect-ratio:3/2;font-size:4rem;background:linear-gradient(135deg,#040D1A,var(--navy))}
.lp-bimg-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,.1),transparent)}
.lp-bbody{padding:18px}
.lp-btag{display:inline-block;font-size:.68rem;font-weight:700;padding:2px 9px;border-radius:8px;margin-bottom:8px;letter-spacing:.04em}
.lp-btag-blue{background:rgba(29,78,216,.1);color:var(--royal)}
.lp-btag-gold{background:rgba(255,255,255,.12);color:var(--emas-muda)}
.lp-bjudul{font-weight:700;font-size:.9rem;color:var(--gelap);line-height:1.45;margin-bottom:6px}
.lp-bcard.feat .lp-bjudul{color:white;font-size:1rem}
.lp-bdate{font-size:.72rem;color:var(--abu)}
.lp-bcard.feat .lp-bdate{color:rgba(255,255,255,.4)}
.lp-see-all{color:var(--royal);font-weight:600;font-size:.82rem;display:flex;align-items:center;gap:5px;transition:gap .2s;cursor:pointer;background:none;border:none;font-family:var(--sans)}
.lp-see-all:hover{gap:9px}

/* PENGUMUMAN */
.lp-pengumuman{background:linear-gradient(135deg,#EEF4FF,var(--krem))}
.lp-plist{display:flex;flex-direction:column;gap:14px;margin-top:36px}
.lp-pitem{background:var(--putih);border-radius:16px;padding:20px;display:flex;gap:16px;align-items:flex-start;transition:all .3s;border-left:3px solid transparent;border:1px solid rgba(11,37,69,.06);border-left:3px solid transparent}
.lp-pitem:hover{border-left-color:var(--royal);transform:translateX(4px);box-shadow:0 4px 20px rgba(11,37,69,.08)}
.lp-picon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
.lp-picon.blue{background:rgba(29,78,216,.08)}
.lp-picon.gold{background:rgba(201,168,76,.1)}
.lp-picon.sky{background:rgba(59,130,246,.07)}
.lp-ptext strong{display:block;font-weight:700;font-size:.88rem;color:var(--gelap);margin-bottom:3px}
.lp-ptext p{color:var(--abu);font-size:.8rem;line-height:1.55}
.lp-pdate{margin-left:auto;font-size:.7rem;color:var(--abu);white-space:nowrap;flex-shrink:0;background:var(--krem);padding:3px 10px;border-radius:8px;height:fit-content}

/* GALERI */
.lp-galeri{background:linear-gradient(135deg,#040D1A,var(--navy))}
.lp-galeri-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,175px);gap:14px;margin-top:44px}
.lp-gitem{border-radius:16px;overflow:hidden;position:relative;cursor:pointer}
.lp-gitem:first-child{grid-column:span 2;grid-row:span 2}
.lp-gimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;transition:transform .4s;position:relative}
.lp-gitem:first-child .lp-gimg{font-size:5rem}
.lp-gimg-1{background:linear-gradient(135deg,#0D3B2E,#1A5E42)}
.lp-gimg-2{background:linear-gradient(135deg,#1A2E5E,#1D4ED8)}
.lp-gimg-3{background:linear-gradient(135deg,#3B1A5E,#6D28D9)}
.lp-gimg-4{background:linear-gradient(135deg,#5E1A1A,#B91C1C)}
.lp-gimg-5{background:linear-gradient(135deg,#3B3B1A,#B45309)}
.lp-goverlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),transparent);opacity:0;transition:.3s;display:flex;align-items:flex-end;padding:14px}
.lp-goverlay span{color:white;font-size:.78rem;font-weight:600;letter-spacing:.03em}
.lp-gitem:hover .lp-gimg{transform:scale(1.06)}
.lp-gitem:hover .lp-goverlay{opacity:1}

/* LOKASI */
.lp-lokasi{background:var(--putih)}
.lp-lokasi-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;margin-top:44px}
.lp-peta{border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(11,37,69,.14);position:relative}
.lp-peta::before{content:'';position:absolute;inset:0;border-radius:20px;border:2px solid rgba(11,37,69,.08);z-index:1;pointer-events:none}
.lp-peta iframe{width:100%;height:380px;border:none;display:block}
.lp-lokasi-info{display:flex;flex-direction:column;gap:16px}
.lp-lcard{display:flex;gap:14px;padding:18px;background:var(--krem);border-radius:16px;align-items:flex-start;border:1px solid rgba(11,37,69,.06);transition:.2s}
.lp-lcard:hover{border-color:rgba(29,78,216,.15);background:var(--blue-pale)}
.lp-licon{width:44px;height:44px;background:linear-gradient(135deg,var(--navy),var(--royal));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
.lp-ltext strong{display:block;font-weight:700;font-size:.85rem;color:var(--gelap);margin-bottom:3px}
.lp-ltext span{color:var(--abu);font-size:.8rem;line-height:1.6}

/* CTA */
.lp-cta{background:linear-gradient(135deg,#040D1A 0%,var(--navy) 50%,#1A3A6B 100%);padding:80px 6%;position:relative;overflow:hidden}
.lp-cta::before{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(29,78,216,.18),transparent);top:50%;left:50%;transform:translate(-50%,-50%)}
.lp-cta::after{content:'';position:absolute;width:300px;height:300px;background:radial-gradient(circle,rgba(201,168,76,.08),transparent);top:0;right:10%}
.lp-cta-inner{position:relative;z-index:1;text-align:center}
.lp-cta-title{font-family:var(--serif);font-size:clamp(1.8rem,3.5vw,2.8rem);color:var(--putih);margin-bottom:14px}
.lp-cta-desc{color:rgba(255,255,255,.5);margin-bottom:36px;font-size:.95rem;line-height:1.7}
.lp-cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.lp-cta-btn-gold{background:linear-gradient(135deg,var(--emas),#B8963E);color:var(--gelap);padding:13px 32px;border-radius:26px;font-weight:700;font-size:.9rem;transition:all .3s;display:inline-flex;align-items:center;gap:9px;cursor:pointer;border:none;font-family:var(--sans);box-shadow:0 4px 20px rgba(201,168,76,.35)}
.lp-cta-btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,168,76,.5)}
.lp-cta-btn-ghost{background:rgba(255,255,255,.06);color:white;padding:13px 32px;border-radius:26px;font-weight:500;font-size:.9rem;border:1px solid rgba(255,255,255,.15);transition:all .3s;display:inline-flex;align-items:center;gap:9px;cursor:pointer;font-family:var(--sans)}
.lp-cta-btn-ghost:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}

/* FOOTER */
.lp-footer{background:#02070F;padding:44px 6% 28px;color:rgba(255,255,255,.4)}
.lp-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:44px;margin-bottom:36px}
.lp-footer-brand{font-family:var(--serif);font-size:1.15rem;color:white;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.lp-footer-sub{font-size:.78rem;color:rgba(255,255,255,.3);line-height:1.75}
.lp-footer-title{color:rgba(255,255,255,.7);font-weight:700;font-size:.8rem;margin-bottom:14px;letter-spacing:.05em;text-transform:uppercase}
.lp-flinks{display:flex;flex-direction:column;gap:9px}
.lp-flinks a{color:rgba(255,255,255,.35);text-decoration:none;font-size:.8rem;transition:color .2s;cursor:pointer}
.lp-flinks a:hover{color:var(--emas-muda)}
.lp-footer-bottom{border-top:1px solid rgba(255,255,255,.06);padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:.75rem}
.lp-footer-bottom a{color:var(--emas);text-decoration:none;cursor:pointer;font-weight:600}

/* REVEAL */
.lp-rv{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease}
.lp-rv.on{opacity:1;transform:translateY(0)}
.lp-rvl{opacity:0;transform:translateX(-36px);transition:opacity .65s ease,transform .65s ease}
.lp-rvl.on{opacity:1;transform:translateX(0)}
.lp-rvr{opacity:0;transform:translateX(36px);transition:opacity .65s ease,transform .65s ease}
.lp-rvr.on{opacity:1;transform:translateX(0)}
.lp-d1{transition-delay:.08s}.lp-d2{transition-delay:.16s}.lp-d3{transition-delay:.24s}.lp-d4{transition-delay:.32s}

@keyframes lp-float{0%{transform:translateY(100vh);opacity:0}10%{opacity:.5}90%{opacity:.2}100%{transform:translateY(-10vh);opacity:0}}
@keyframes lp-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.4)}}
@keyframes lp-spin-slow{to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes lp-slide{0%{left:-100%}100%{left:100%}}

@media(max-width:1024px){
  .lp-stats-grid{grid-template-columns:repeat(2,1fr)}
  .lp-berita-grid{grid-template-columns:1fr 1fr}
  .lp-bcard.feat{grid-column:span 2}
  .lp-perangkat-grid{grid-template-columns:repeat(2,1fr)}
  .lp-galeri-grid{grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,130px)}
  .lp-gitem:first-child{grid-column:span 2}
  .lp-footer-grid{grid-template-columns:1fr 1fr}
  .lp-hero-visual{opacity:.3}
}
@media(max-width:768px){
  .lp-sec{padding:60px 5%}
  .lp-nav-links{display:none}.lp-hamburger{display:flex}
  .lp-profil-grid{grid-template-columns:1fr}
  .lp-profil-badge{right:16px;bottom:-16px}
  .lp-berita-grid{grid-template-columns:1fr}
  .lp-bcard.feat{grid-column:span 1}
  .lp-lokasi-grid{grid-template-columns:1fr}
  .lp-galeri-grid{grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(3,120px)}
  .lp-gitem:first-child{grid-column:span 2}
  .lp-perangkat-grid{grid-template-columns:repeat(2,1fr)}
  .lp-connector{padding:0 10%}.lp-connector::before{left:10%;right:10%}
  .lp-footer-grid{grid-template-columns:1fr}
  .lp-footer-bottom{flex-direction:column;text-align:center}
  .lp-hero-visual{display:none}
  .lp-hero-stats{flex-direction:column;gap:0}
  .lp-hstat{border-right:none;border-bottom:1px solid rgba(255,255,255,.08)}
  .lp-hstat:last-child{border-bottom:none}
}
@media(max-width:480px){
  .lp-stats-grid{grid-template-columns:1fr 1fr}
  .lp-hero-actions{flex-direction:column}
  .lp-cta-btns{flex-direction:column;align-items:center}
}
`;

export default function LandingPage({ onMasuk, onMasukWarga }) {
  const navRef = useRef(null);
  const heroAnimated = useRef(false);
  const counterAnimated = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = styles; el.id = 'lp-styles';
    document.head.appendChild(el);
    return () => document.getElementById('lp-styles')?.remove();
  }, []);

  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 70);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.lp-rv,.lp-rvl,.lp-rvr');
    const obs = new IntersectionObserver(e => e.forEach(x => { if (x.isIntersecting) x.target.classList.add('on'); }), { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function animCount(el, target, dur = 2000) {
    const s = performance.now();
    const run = t => {
      const p = Math.min((t - s) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * target).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  useEffect(() => {
    const hero = document.getElementById('lp-hero');
    if (!hero) return;
    const obs = new IntersectionObserver(e => {
      if (e[0].isIntersecting && !heroAnimated.current) {
        heroAnimated.current = true;
        document.querySelectorAll('[data-c]').forEach(el => animCount(el, parseInt(el.dataset.c)));
      }
    }, { threshold: 0.3 });
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const stat = document.getElementById('lp-stat');
    if (!stat) return;
    const obs = new IntersectionObserver(e => {
      if (e[0].isIntersecting && !counterAnimated.current) {
        counterAnimated.current = true;
        document.querySelectorAll('[data-t]').forEach(el => animCount(el, parseInt(el.dataset.t)));
      }
    }, { threshold: 0.3 });
    obs.observe(stat);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const c = document.getElementById('lp-particles');
    if (!c) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'lp-particle';
      p.style.cssText = `left:${Math.random()*100}%;width:${Math.random()*3+2}px;height:${Math.random()*3+2}px;animation-duration:${Math.random()*14+10}s;animation-delay:${Math.random()*8}s`;
      c.appendChild(p);
    }
    return () => { if (c) c.innerHTML = ''; };
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  const BERITA = [
    { feat: true, icon: '📰', tag: 'UTAMA', judul: 'Musyawarah Desa Cikulak 2026: Rencana Pembangunan Infrastruktur Jalan Dusun', date: '15 Sep 2026' },
    { icon: '🎓', tag: 'PENDIDIKAN', judul: 'Program Beasiswa untuk Putra-Putri Desa Cikulak', date: '10 Sep 2026' },
    { icon: '🌾', tag: 'PERTANIAN', judul: 'Panen Raya Kelompok Tani Cikulak Meningkat 20%', date: '5 Sep 2026' },
    { icon: '💉', tag: 'KESEHATAN', judul: 'Posyandu Rutin Bulan Oktober — Daftar Sekarang', date: '1 Okt 2026' },
  ];

  const GALERI = [
    { cls: 'lp-gimg-1', icon: '🌾', label: 'Sawah Desa Cikulak' },
    { cls: 'lp-gimg-2', icon: '🏛️', label: 'Balai Desa' },
    { cls: 'lp-gimg-3', icon: '🕌', label: 'Masjid Jami' },
    { cls: 'lp-gimg-4', icon: '🌿', label: 'Kebun Warga' },
    { cls: 'lp-gimg-5', icon: '🎪', label: 'Kegiatan Desa' },
  ];

  return (
    <div className="lp-root">

      {/* NAVBAR */}
      <nav className="lp-nav" ref={navRef}>
        <div className="lp-nav-logo" onClick={() => scrollTo('lp-hero')}>
          <div className="lp-nav-logo-icon">🏛️</div>
          <div className="lp-nav-logo-text">Desa Cikulak<span>Kec. Waled · Kab. Cirebon</span></div>
        </div>
        <div className="lp-nav-links">
          {['Profil','Statistik','Struktur','Berita','Lokasi'].map((l,i) => (
            <a key={i} onClick={() => scrollTo(['lp-profil','lp-stat','lp-struktur','lp-berita','lp-lokasi'][i])}>{l}</a>
          ))}
          <button className="lp-nav-btn" onClick={onMasuk}>Masuk →</button>
        </div>
        <button className={`lp-hamburger${menuOpen?' active':''}`} onClick={() => setMenuOpen(v => !v)}>
          <span/><span/><span/>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`lp-mmenu${menuOpen?' open':''}`}>
        {['Profil','Statistik','Struktur','Berita','Lokasi'].map((l,i) => (
          <a key={i} onClick={() => scrollTo(['lp-profil','lp-stat','lp-struktur','lp-berita','lp-lokasi'][i])}>{l}</a>
        ))}
        <button className="lp-mmenu-btn" onClick={() => { setMenuOpen(false); onMasuk(); }}>Masuk ke Sistem</button>
      </div>

      {/* HERO */}
      <section id="lp-hero" style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden'}}>
        <div className="lp-hero-bg"/>
        <div className="lp-hero-dots"/>
        <div className="lp-hero-particles" id="lp-particles"/>
        <div className="lp-hero-glow"/>

        {/* Visual kanan */}
        <div className="lp-hero-visual">
          <div className="lp-hero-rings">
            <div className="lp-ring"/>
            <div className="lp-ring"/>
            <div className="lp-ring"/>
            <div className="lp-ring"/>
            <div className="lp-hero-center">
              <div className="lp-hero-center-icon">🏛️</div>
              <div className="lp-hero-center-text">Desa Cikulak</div>
            </div>
          </div>
        </div>

        <div className="lp-hero-content">
          <div className="lp-hero-inner">
            <div className="lp-hero-badge">🌿 Desa Digital Cikulak 2026</div>
            <h1 className="lp-hero-title">
              Selamat Datang<br/>di
              <em> Desa Cikulak</em>
            </h1>
            <p className="lp-hero-sub">Desa yang asri dan berkembang di Kecamatan Waled, Kabupaten Cirebon. Melayani masyarakat dengan sepenuh hati menuju desa yang mandiri dan sejahtera.</p>
            <div className="lp-hero-actions">
              <button className="lp-btn-gold" onClick={() => scrollTo('lp-profil')}>🏡 Kenali Desa Kami</button>
              <button className="lp-btn-ghost" onClick={() => scrollTo('lp-cta')}>Masuk Sistem →</button>
            </div>
            <div className="lp-hero-stats">
              {[{c:3247,l:'Jiwa Penduduk'},{c:6,l:'Dusun'},{c:12,l:'RW'},{c:2004,l:'Tahun Berdiri'}].map((s,i) => (
                <div className="lp-hstat" key={i}>
                  <div className="lp-hstat-num" data-c={s.c}>0</div>
                  <div className="lp-hstat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-scroll-hint">
          <div className="lp-scroll-line"/>
          <span>GULIR KE BAWAH</span>
        </div>
      </section>

      {/* PROFIL */}
      <section className="lp-sec lp-profil" id="lp-profil">
        <div className="lp-con">
          <div className="lp-profil-grid">
            <div className="lp-rvl">
              <div className="lp-profil-img-wrap">
                <div className="lp-profil-img">
                  <div className="lp-profil-img-dots"/>
                  <div className="lp-profil-img-overlay"/>
                  <div className="lp-profil-img-inner">🏡</div>
                </div>
                <div className="lp-profil-badge"><strong>2004</strong><span>Tahun Berdiri</span></div>
              </div>
            </div>
            <div className="lp-rvr">
              <div className="lp-chip">🏘️ Tentang Desa</div>
              <h2 className="lp-h2">Profil Desa Cikulak</h2>
              <p className="lp-p">Desa Cikulak adalah desa yang terletak di Kecamatan Waled, Kabupaten Cirebon, Jawa Barat. Dengan luas wilayah yang subur dan masyarakat yang ramah, desa ini terus berkembang menuju desa yang mandiri dan sejahtera.</p>
              <div className="lp-profil-items">
                {[
                  {icon:'📍',label:'Alamat',val:'Jl. KH. Zainal Arifin No. 44, Cikulak, Kec. Waled, Kab. Cirebon 45187'},
                  {icon:'🗺️',label:'Luas Wilayah',val:'± 450 Hektar'},
                  {icon:'🏘️',label:'Wilayah Administrasi',val:'6 Dusun · 12 RW · 36 RT'},
                  {icon:'📞',label:'Kontak',val:'+62 xxx-xxxx-xxxx · desacikulak@gmail.com'},
                ].map((item,i) => (
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
      <section className="lp-sec lp-statistik" id="lp-stat">
        <div className="lp-stats-glow"/>
        <div className="lp-con">
          <div className="lp-rv" style={{textAlign:'center'}}>
            <div className="lp-chip" style={{background:'rgba(201,168,76,.12)',color:'var(--emas-muda)'}}>📊 Data Kependudukan</div>
            <h2 className="lp-h2" style={{color:'var(--putih)'}}>Statistik Desa Cikulak</h2>
            <p className="lp-p" style={{margin:'0 auto',color:'rgba(255,255,255,.45)'}}>Data terkini kependudukan dan kondisi Desa Cikulak tahun 2026.</p>
          </div>
          <div className="lp-stats-grid">
            {[
              {icon:'👥',t:3247,l:'Total Penduduk'},
              {icon:'👨',t:1658,l:'Laki-laki'},
              {icon:'👩',t:1589,l:'Perempuan'},
              {icon:'🏠',t:892,l:'Kepala Keluarga'},
            ].map((s,i) => (
              <div className={`lp-stat-card lp-rv lp-d${i+1}`} key={i}>
                <span className="lp-stat-icon">{s.icon}</span>
                <span className="lp-stat-num" data-t={s.t}>0</span>
                <span className="lp-stat-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRUKTUR */}
      <section className="lp-sec lp-struktur" id="lp-struktur">
        <div className="lp-con">
          <div style={{textAlign:'center',marginBottom:52}} className="lp-rv">
            <div className="lp-chip">👥 Perangkat Desa</div>
            <h2 className="lp-h2">Struktur Organisasi</h2>
            <p className="lp-p" style={{margin:'0 auto'}}>Jajaran perangkat Desa Cikulak yang berdedikasi melayani masyarakat.</p>
          </div>
          <div className="lp-kepala-wrap lp-rv">
            <div className="lp-jcard lp-kepala-card">
              <div className="lp-javatar" style={{width:72,height:72,fontSize:'1.8rem'}}>👤</div>
              <div className="lp-jnama">H. Ahmad Suherman</div>
              <div className="lp-jpos">NIP: —</div>
              <span className="lp-jbadge lp-jbadge-gold">Kepala Desa</span>
            </div>
          </div>
          <div className="lp-connector lp-rv">
            <div className="lp-connector-dots">{[0,1,2,3].map(i=><div className="lp-cdot" key={i}/>)}</div>
          </div>
          <div className="lp-perangkat-grid">
            {[
              {nama:'Budi Santoso',pos:'Sekretaris Desa'},
              {nama:'Siti Rahayu',pos:'Bendahara Desa'},
              {nama:'Dede Hardiana',pos:'Kaur Pemerintahan'},
              {nama:'Iin Kusrini',pos:'Kaur Umum'},
            ].map((p,i) => (
              <div className={`lp-jcard lp-rv lp-d${i+1}`} key={i}>
                <div className="lp-javatar" style={{width:56,height:56,fontSize:'1.3rem'}}>👤</div>
                <div className="lp-jnama">{p.nama}</div>
                <div className="lp-jpos">—</div>
                <span className="lp-jbadge lp-jbadge-blue">{p.pos}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BERITA */}
      <section className="lp-sec lp-berita" id="lp-berita">
        <div className="lp-con">
          <div className="lp-berita-hdr">
            <div className="lp-rv">
              <div className="lp-chip">📰 Informasi Terkini</div>
              <h2 className="lp-h2" style={{marginBottom:0}}>Berita & Pengumuman</h2>
            </div>
            <button className="lp-see-all lp-rv">Lihat semua <span>→</span></button>
          </div>
          <div className="lp-berita-grid">
            {BERITA.map((b,i) => (
              <div className={`lp-bcard${b.feat?' feat':''} lp-rv lp-d${i}`} key={i}>
                <div className="lp-bimg">
                  <div className="lp-bimg-overlay"/>
                  <span style={{fontSize: b.feat?'4rem':'2.2rem',position:'relative',zIndex:1}}>{b.icon}</span>
                </div>
                <div className="lp-bbody">
                  <span className={`lp-btag ${b.feat?'lp-btag-gold':'lp-btag-blue'}`}>{b.tag}</span>
                  <div className="lp-bjudul">{b.judul}</div>
                  <div className="lp-bdate">{b.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PENGUMUMAN */}
      <section className="lp-sec lp-pengumuman" id="lp-pengumuman">
        <div className="lp-con">
          <div className="lp-rv">
            <div className="lp-chip">📢 Informasi Resmi</div>
            <h2 className="lp-h2">Pengumuman Desa</h2>
          </div>
          <div className="lp-plist">
            {[
              {cls:'blue',icon:'📋',title:'Pembagian Bantuan Sosial PKH Tahap 3 Tahun 2026',desc:'Pembagian bansos PKH akan dilaksanakan pada 10 Oktober 2026 di Balai Desa. Harap membawa KTP dan KK asli.',date:'1 Okt 2026'},
              {cls:'gold',icon:'⚠️',title:'Pembaruan Data Kependudukan 2026',desc:'Seluruh warga yang belum melakukan pembaruan data KTP diharap melapor ke Kantor Desa paling lambat 31 Oktober 2026.',date:'28 Sep 2026'},
              {cls:'sky',icon:'🗳️',title:'Jadwal Musrenbangdes Tahun Anggaran 2027',desc:'Musyawarah Rencana Pembangunan Desa akan digelar pada 20 Oktober 2026 pukul 09.00 WIB di Balai Desa.',date:'25 Sep 2026'},
            ].map((p,i) => (
              <div className={`lp-pitem lp-rv lp-d${i+1}`} key={i}>
                <div className={`lp-picon ${p.cls}`}>{p.icon}</div>
                <div className="lp-ptext"><strong>{p.title}</strong><p>{p.desc}</p></div>
                <div className="lp-pdate">{p.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERI */}
      <section className="lp-sec lp-galeri" id="lp-galeri">
        <div className="lp-con">
          <div className="lp-rv" style={{textAlign:'center'}}>
            <div className="lp-chip" style={{background:'rgba(201,168,76,.12)',color:'var(--emas-muda)'}}>📸 Foto Desa</div>
            <h2 className="lp-h2" style={{color:'var(--putih)'}}>Galeri Desa Cikulak</h2>
            <p className="lp-p" style={{margin:'0 auto',color:'rgba(255,255,255,.4)'}}>Potret kehidupan dan keindahan Desa Cikulak.</p>
          </div>
          <div className="lp-galeri-grid">
            {GALERI.map((g,i) => (
              <div className={`lp-gitem lp-rv lp-d${i}`} key={i}>
                <div className={`lp-gimg ${g.cls}`}><span style={{position:'relative',zIndex:1}}>{g.icon}</span></div>
                <div className="lp-goverlay"><span>{g.label}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOKASI */}
      <section className="lp-sec lp-lokasi" id="lp-lokasi">
        <div className="lp-con">
          <div className="lp-rv">
            <div className="lp-chip">📍 Temukan Kami</div>
            <h2 className="lp-h2">Lokasi & Kontak</h2>
          </div>
          <div className="lp-lokasi-grid">
            <div className="lp-peta lp-rvl">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15854.5!2d108.7!3d-6.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f13a4b7c82a8d%3A0x5031dfc3c5e0e15e!2sWaled%2C+Cirebon+Regency%2C+West+Java!5e0!3m2!1sid!2sid!4v1234567890" allowFullScreen loading="lazy" title="Peta Desa Cikulak"/>
            </div>
            <div className="lp-lokasi-info lp-rvr">
              {[
                {icon:'📍',title:'Alamat Kantor',val:'Jl. KH. Zainal Arifin No. 44, Cikulak,\nKec. Waled, Kab. Cirebon 45187'},
                {icon:'🕐',title:'Jam Pelayanan',val:'Senin – Jumat: 08.00 – 15.00 WIB\nSabtu: 08.00 – 12.00 WIB'},
                {icon:'📞',title:'Hubungi Kami',val:'Telepon: +62 xxx-xxxx-xxxx\nEmail: desacikulak@gmail.com'},
              ].map((l,i) => (
                <div className="lp-lcard" key={i}>
                  <div className="lp-licon">{l.icon}</div>
                  <div className="lp-ltext"><strong>{l.title}</strong><span style={{whiteSpace:'pre-line'}}>{l.val}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta" id="lp-cta">
        <div className="lp-cta-inner">
          <div className="lp-rv">
            <div className="lp-chip" style={{background:'rgba(201,168,76,.12)',color:'var(--emas-muda)',margin:'0 auto 16px'}}>🔐 Layanan Digital</div>
            <h2 className="lp-cta-title">Akses Layanan Desa Digital</h2>
            <p className="lp-cta-desc">Masuk sebagai perangkat desa atau warga untuk mengakses layanan administrasi secara online.</p>
            <div className="lp-cta-btns">
              <button className="lp-cta-btn-gold" onClick={onMasuk}>🏛️ Login Perangkat Desa</button>
              <button className="lp-cta-btn-ghost" onClick={onMasukWarga}>👤 Login Masyarakat</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-con">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand">🏛️ Desa Cikulak</div>
              <p className="lp-footer-sub">Kecamatan Waled, Kabupaten Cirebon<br/>Jawa Barat — Indonesia<br/><br/>© 2026 Sistem Informasi Desa Cikulak.<br/>Hak cipta dilindungi.</p>
            </div>
            <div>
              <div className="lp-footer-title">Navigasi</div>
              <div className="lp-flinks">
                {['Profil Desa','Statistik','Struktur Organisasi','Berita','Lokasi & Kontak'].map((l,i)=>(
                  <a key={i} onClick={()=>scrollTo(['lp-profil','lp-stat','lp-struktur','lp-berita','lp-lokasi'][i])}>{l}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="lp-footer-title">Layanan</div>
              <div className="lp-flinks">
                <a onClick={onMasuk}>Login Perangkat Desa</a>
                <a onClick={onMasuk}>Login Masyarakat</a>
                <a onClick={()=>scrollTo('lp-pengumuman')}>Pengumuman Resmi</a>
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
