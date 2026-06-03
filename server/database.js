// server/database.js
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('./config');

const pool = mysql.createPool(config.db);

async function initDatabase() {
  let conn;
  try {
    const tempConn = await mysql.createConnection({
      host:     config.db.host,
      port:     config.db.port,
      user:     config.db.user,
      password: config.db.password,
    });
    await tempConn.execute(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConn.end();
    console.log(`✅ Database '${config.db.database}' siap`);

    conn = await pool.getConnection();

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS pengaturan_desa (
        id          INT PRIMARY KEY DEFAULT 1,
        nama_desa   VARCHAR(100),
        kecamatan   VARCHAR(100),
        kabupaten   VARCHAR(100),
        provinsi    VARCHAR(100),
        kode_pos    VARCHAR(10),
        alamat      VARCHAR(255),
        telp        VARCHAR(20),
        kepala_desa VARCHAR(100),
        nip         VARCHAR(50),
        sekretaris  VARCHAR(100),
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        nama           VARCHAR(100) NOT NULL,
        email          VARCHAR(100) UNIQUE,
        username       VARCHAR(50)  UNIQUE NOT NULL,
        password       VARCHAR(255) NOT NULL,
        role           ENUM('kepala_desa','perangkat_desa') DEFAULT 'perangkat_desa',
        jabatan        VARCHAR(100),
        nip            VARCHAR(50),
        no_hp          VARCHAR(20),
        aktif          TINYINT(1) DEFAULT 1,
        email_verified TINYINT(1) DEFAULT 1,
        otp_code       VARCHAR(6)  DEFAULT NULL,
        otp_expired    DATETIME    DEFAULT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS penduduk (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        nik           VARCHAR(16) UNIQUE NOT NULL,
        no_kk         VARCHAR(16),
        nama          VARCHAR(100) NOT NULL,
        tempat_lahir  VARCHAR(100),
        tanggal_lahir DATE,
        jenis_kelamin ENUM('Laki-laki','Perempuan'),
        agama         VARCHAR(20),
        pendidikan    VARCHAR(20),
        pekerjaan     VARCHAR(100),
        status_kawin  VARCHAR(20),
        alamat        VARCHAR(255),
        rt            VARCHAR(5),
        rw            VARCHAR(5),
        dusun         VARCHAR(20),
        status        VARCHAR(20) DEFAULT 'Tetap',
        tanggal_masuk DATE,
        keterangan    TEXT,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS riwayat_perubahan (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        tanggal    DATE NOT NULL,
        jenis      ENUM('Kelahiran','Kematian','Pindah Masuk','Pindah Keluar') NOT NULL,
        nik        VARCHAR(16),
        nama       VARCHAR(100) NOT NULL,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS pengajuan_surat (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        nomor_antrian   VARCHAR(20) UNIQUE NOT NULL,
        tanggal_ajuan   DATE NOT NULL,
        nik             VARCHAR(16),
        nama_pemohon    VARCHAR(100) NOT NULL,
        jenis_surat     VARCHAR(100) NOT NULL,
        keperluan       VARCHAR(255),
        status          ENUM('Menunggu','Diproses','Selesai') DEFAULT 'Menunggu',
        tanggal_selesai DATE,
        petugas         VARCHAR(100),
        catatan         TEXT,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS arsip_surat (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        nomor_surat VARCHAR(50) UNIQUE NOT NULL,
        tanggal     DATE NOT NULL,
        jenis       VARCHAR(100) NOT NULL,
        penerima    VARCHAR(100) NOT NULL,
        nik         VARCHAR(16),
        keperluan   VARCHAR(255),
        dibuat      VARCHAR(100),
        file        VARCHAR(255),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS bansos (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        nama_program  VARCHAR(100) NOT NULL,
        tahun         YEAR NOT NULL,
        deskripsi     TEXT,
        anggaran      BIGINT DEFAULT 0,
        status        ENUM('Aktif','Selesai','Ditangguhkan') DEFAULT 'Aktif',
        created_by    VARCHAR(100),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS penerima_bansos (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        bansos_id   INT NOT NULL,
        nik         VARCHAR(16) NOT NULL,
        nama        VARCHAR(100) NOT NULL,
        alamat      VARCHAR(255),
        rt          VARCHAR(5),
        rw          VARCHAR(5),
        dusun       VARCHAR(20),
        jumlah      BIGINT DEFAULT 0,
        keterangan  TEXT,
        created_by  VARCHAR(100),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bansos_id) REFERENCES bansos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS fasilitas (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        nama        VARCHAR(100) NOT NULL,
        kategori    ENUM('Gedung','Peralatan','Kendaraan','Lainnya') DEFAULT 'Gedung',
        kondisi     ENUM('Baik','Rusak Ringan','Rusak Berat') DEFAULT 'Baik',
        lokasi      VARCHAR(255),
        deskripsi   TEXT,
        tersedia    TINYINT(1) DEFAULT 1,
        created_by  VARCHAR(100),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS booking_fasilitas (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        fasilitas_id    INT NOT NULL,
        nama_pemohon    VARCHAR(100) NOT NULL,
        nik             VARCHAR(16),
        keperluan       VARCHAR(255) NOT NULL,
        tanggal_mulai   DATE NOT NULL,
        tanggal_selesai DATE NOT NULL,
        status          ENUM('Menunggu','Disetujui','Ditolak','Selesai') DEFAULT 'Menunggu',
        catatan         TEXT,
        diproses_oleh   VARCHAR(100),
        created_by      VARCHAR(100),
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fasilitas_id) REFERENCES fasilitas(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Semua tabel berhasil dibuat');

    const alterColumns = [
      { sql: 'ALTER TABLE penduduk ADD COLUMN no_kk VARCHAR(16) AFTER nik', msg: 'Kolom no_kk' },
      { sql: 'ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE AFTER nama', msg: 'Kolom email' },
      { sql: 'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 1', msg: 'Kolom email_verified' },
      { sql: 'ALTER TABLE users ADD COLUMN otp_code VARCHAR(6) DEFAULT NULL', msg: 'Kolom otp_code' },
      { sql: 'ALTER TABLE users ADD COLUMN otp_expired DATETIME DEFAULT NULL', msg: 'Kolom otp_expired' },
    ];

    for (const col of alterColumns) {
      try {
        await conn.execute(col.sql);
        console.log(`✅ ${col.msg} berhasil ditambahkan`);
      } catch(e) { /* kolom sudah ada, skip */ }
    }

    const [adminExist] = await conn.execute('SELECT id FROM users WHERE username = ?', ['admin']);
    if (adminExist.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await conn.execute(
        'INSERT INTO users (nama, email, username, password, role, jabatan, nip, no_hp, aktif, email_verified) VALUES (?,?,?,?,?,?,?,?,1,1)',
        ['Administrator', 'admin@desacikulak.id', 'admin', hash, 'kepala_desa', 'Kepala Desa', '-', '-']
      );
      console.log('✅ Akun admin default berhasil dibuat');
    }

    const [pgExist] = await conn.execute('SELECT id FROM pengaturan_desa WHERE id = 1');
    if (pgExist.length === 0) {
      await conn.execute(`
        INSERT INTO pengaturan_desa (id,nama_desa,kecamatan,kabupaten,provinsi,kode_pos,alamat,telp,kepala_desa,nip,sekretaris)
        VALUES (1,'Cikulak','Waled','Cirebon','Jawa Barat','45188','Jl. Cikulak No. 1','-','H. Edi Purnama, S.AP.M.Si','-','-')
      `);
      console.log('✅ Pengaturan desa berhasil dibuat');
    }

    console.log('✅ Database MySQL siap digunakan!\n');
  } catch (err) {
    console.error('❌ Error database:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, initDatabase };