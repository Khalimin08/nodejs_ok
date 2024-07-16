const express = require('express');
const multer = require('multer');
const path = require('path');
const koneksi = require('./config/database');
const app = express();
const port = 5000;

const cors = require('cors');
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('./public'));

// Multer setup
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/');
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/Hello World', (req, res) => {
    res.send('Hello World!');
});

app.get('/jayakarta', (req, res) => {
    res.send('Hello jayakarta!');
});

// Insert data / memasukkan data
app.post('/api/movies', upload.single('foto'), (req, res) => {
    if (req.file) {
        const imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const { judul, rating, deskripsi, sutradara } = req.body;
        const foto = imgsrc;
        const querysql = 'INSERT INTO movies (judul, rating, deskripsi, sutradara, foto) VALUES (?, ?, ?, ?, ?);';

        koneksi.query(querysql, [judul, rating, deskripsi, sutradara, foto], (err, rows, field) => {
            if (err) {
                return res.status(500).json({ message: 'Ada kesalahan data!', error: err });
            }

            res.status(201).json({ success: true, message: 'Data berhasil ditambahkan', data: req.body });
        });
    } else {
        const { judul, rating, deskripsi, sutradara } = req.body;
        const querysql = 'INSERT INTO movies (judul, rating, deskripsi, sutradara) VALUES (?, ?, ?, ?);';

        koneksi.query(querysql, [judul, rating, deskripsi, sutradara], (err, rows, field) => {
            if (err) {
                return res.status(500).json({ message: 'Ada kesalahan data!', error: err });
            }

            res.status(201).json({ success: true, message: 'Data berhasil ditambahkan', data: req.body });
        });
    }
});

// Read data / get data
app.get('/api/movies', (req, res) => {
    const querySql = 'SELECT * FROM movies';

    koneksi.query(querySql, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        res.status(200).json({ success: true, data: rows });
    });
});

// delete data / menghapus data
app.delete('/api/movies/:id', (req, res) => {
    const id = req.params.id;
    const querySql = 'DELETE FROM movies WHERE id = ?';

    koneksi.query(querySql, [id], (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, message: 'Data berhasil dihapus' });
    });
});


// Read specific data / get specific data
app.get('/api/movies-specific/:id', (req, res) => {
    const querySql = 'SELECT judul, rating, deskripsi FROM movies WHERE id = ?';

    koneksi.query(querySql, [req.params.id], (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        res.status(200).json({ success: true, data: rows });
    });
});

// Filter data by title / get data by title
app.get('/api/movies/filter/:judul', (req, res) => {
    const querySql = `SELECT * FROM movies WHERE judul LIKE ?`;
    const searchValue = `%${req.params.judul}%`;

    koneksi.query(querySql, [searchValue], (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        res.status(200).json({ success: true, data: rows });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
