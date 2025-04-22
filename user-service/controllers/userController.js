const users = [];

// Fungsi untuk registrasi pengguna baru
exports.register = (req, res) => {
  const userData = req.body; // Data pengguna dari request body

  // Jika data berupa array, tambahkan semua pengguna
  if (Array.isArray(userData)) {
    const newUsers = userData.map((user, index) => ({
      id: users.length + index + 1, // Buat ID unik untuk setiap pengguna
      username: user.username,
      password: user.password,
      email: user.email,
    }));

    users.push(...newUsers); // Tambahkan semua pengguna ke array users
    res.status(201).json(newUsers); // Kembalikan data pengguna baru
  } else {
    // Jika data berupa satu objek, tambahkan satu pengguna
    const { username, password, email } = userData;
    const newUser = {
      id: users.length + 1, // Buat ID unik untuk pengguna
      username,
      password,
      email,
    };

    users.push(newUser); // Tambahkan pengguna ke array users
    res.status(201).json(newUser); // Kembalikan data pengguna baru
  }
};

// Fungsi untuk login pengguna
exports.login = (req, res) => {
  const { username, password } = req.body; // Data login dari request body

  // Cari pengguna berdasarkan username dan password
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Jika pengguna ditemukan, kembalikan token dummy dan data pengguna
    res.json({ token: 'dummy-token', user });
  } else {
    // Jika tidak ditemukan, kembalikan error 401
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ token: 'dummy-token', user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

exports.getUserById = (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  user ? res.json(user) : res.status(404).json({ error: 'User not found' });
};
