pipeline {
    agent any
    
    stages {
        // Paso 1: Obtener el código
        stage('Descargar Código') {
            steps {
                echo 'Descargando código desde Git...'
                checkout scm
            }
        }
        
        // Paso 2: Instalar dependencias
        stage('Instalar Dependencias') {
            steps {
                echo 'Instalando dependencias con npm...'
                bat 'npm install'
            }
        }
        
        // Paso 3: Ejecutar tests básicos
        stage('Ejecutar Tests') {
            steps {
                echo 'Ejecutando pruebas...'
                bat 'npm test -- --watchAll=false'
            }
        }
    }
    
    post {
        success {
            echo '✅ ¡Todo salió bien!'
        }
        failure {
            echo '❌ Algo falló, revisa los logs'
        }
    }
}