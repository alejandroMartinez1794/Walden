# Script de inicialización de MongoDB para Docker

# Crear usuario para la aplicación
db = db.getSiblingDB('basileias');

db.createUser({
  user: 'basileias_user',
  pwd: 'basileias_password_change_me',
  roles: [
    {
      role: 'readWrite',
      db: 'basileias'
    }
  ]
});

# Crear colecciones con validación
db.createCollection('users');
db.createCollection('doctors');
db.createCollection('bookings');
db.createCollection('reviews');

# Crear índices básicos
db.users.createIndex({ email: 1 }, { unique: true });
db.doctors.createIndex({ email: 1 }, { unique: true });
db.bookings.createIndex({ doctorId: 1 });
db.bookings.createIndex({ userId: 1 });
db.bookings.createIndex({ appointmentDate: 1 });

print('✅ MongoDB inicializado correctamente para basileias');
