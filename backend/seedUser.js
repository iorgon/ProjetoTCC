const bcrypt = require('bcryptjs');
const { User } = require('./models'); // Certifique-se de que o caminho está correto

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10); // Substitua '123456' pela senha desejada
    const user = await User.create({
      name: 'Admin', // Nome do usuário
      email: 'admin@example.com', // Email do usuário
      password: hashedPassword, // Senha encriptada
      role: 'admin', // Função do usuário
    });

    console.log('Usuário criado com sucesso:', user.toJSON());
    process.exit();
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    process.exit(1);
  }
})();
