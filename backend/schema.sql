-- Crear la base de datos (ejecutar primero si no existe)
-- CREATE DATABASE natiapp;

-- Conectarse a la base de datos antes de ejecutar lo siguiente
-- \c natiapp

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
    id_admin SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    code_group VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    code_group VARCHAR(50),
    registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de montos/cantidades
CREATE TABLE IF NOT EXISTS amounts (
    id_amount SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    money DECIMAL(10, 2) NOT NULL,
    screenshot TEXT,
    registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);

-- Tabla de préstamos
CREATE TABLE IF NOT EXISTS loans (
    id_loan SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);

-- Tabla de miembros de grupo (relación admin-usuario)
CREATE TABLE IF NOT EXISTS group_members (
    admin_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    union_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id, user_id),
    FOREIGN KEY (admin_id) REFERENCES admins(id_admin) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);
